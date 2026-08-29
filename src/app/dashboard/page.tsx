/* eslint-disable react-hooks/purity -- timestamps are evaluated once per request */
import Link from "next/link";
import { redirect } from "next/navigation";
import { Clock3, Radio } from "lucide-react";
import { DashboardNav } from "@/components/dashboard-nav";
import { requireUser } from "@/lib/supabase/server";
import { ensureUserOrganization } from "@/lib/organizations";
import { responseStats, uptime } from "@/lib/monitoring/metrics";

type Monitor = { id: string; name: string; url: string; status: "UP" | "DEGRADED" | "DOWN" | "PAUSED"; last_checked_at: string | null };
type Check = { monitor_id: string; status: "UP" | "DEGRADED" | "DOWN"; response_time_ms: number; created_at: string };

function relative(value: string | null) {
  if (!value) return "Waiting for first check";
  const seconds = Math.max(1, Math.round((Date.now() - new Date(value).getTime()) / 1000));
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  return `${Math.floor(seconds / 3600)}h ago`;
}

export default async function Dashboard() {
  const { client, user } = await requireUser();
  if (!client || !user) redirect("/login");
  const membership = await ensureUserOrganization(user);
  const organization = Array.isArray(membership.organizations) ? membership.organizations[0] : membership.organizations;
  const [{ data: monitorData, error: monitorError }, { data: incidentData, error: incidentError }] = await Promise.all([
    client.from("monitors").select("id,name,url,status,last_checked_at").eq("organization_id", membership.organization_id).order("created_at", { ascending: false }),
    client.from("incidents").select("id,title,cause,status,started_at").eq("organization_id", membership.organization_id).neq("status", "RESOLVED").order("started_at", { ascending: false }).limit(3),
  ]);
  if (monitorError || incidentError) throw new Error(monitorError?.message ?? incidentError?.message);
  const monitors = (monitorData ?? []) as Monitor[];
  const ids = monitors.map((monitor) => monitor.id);
  let checks: Check[] = [];
  if (ids.length) {
    const { data } = await client.from("monitor_checks").select("monitor_id,status,response_time_ms,created_at").in("monitor_id", ids).gte("created_at", new Date(Date.now() - 30 * 86400000).toISOString()).order("created_at", { ascending: false }).limit(5000);
    checks = (data ?? []) as Check[];
  }
  const latest = new Map<string, Check>();
  for (const check of checks) if (!latest.has(check.monitor_id)) latest.set(check.monitor_id, check);
  const stats = responseStats(checks.map((check) => check.response_time_ms));
  const overallUptime = uptime(checks.map((check) => check.status));
  const operational = monitors.filter((monitor) => monitor.status === "UP").length;
  const degraded = monitors.filter((monitor) => monitor.status === "DEGRADED").length;
  const down = monitors.filter((monitor) => monitor.status === "DOWN").length;

  return <main className="appShell">
    <DashboardNav active="overview" monitorCount={monitors.length} incidentCount={incidentData?.length ?? 0} />
    <section className="appContent">
      <header><div><small>{organization?.name?.toUpperCase() ?? "WORKSPACE"}</small><h1>Infrastructure overview</h1><p>{monitors.length ? "Live data from your monitored services" : "Add your first endpoint to begin monitoring"}</p></div><Link href="/dashboard/monitors/new" className="button">+ New monitor</Link></header>
      <div className="appMetrics"><article><small>MONITORS</small><strong>{monitors.length}</strong><p><b className="ok">{operational}</b> operational · {degraded} degraded · {down} down</p></article><article><small>UPTIME · 30 DAYS</small><strong>{checks.length ? `${overallUptime.toFixed(2)}%` : "—"}</strong><p>{checks.length ? `Based on ${checks.length.toLocaleString()} checks` : "No checks recorded yet"}</p></article><article><small>AVG RESPONSE</small><strong>{checks.length ? stats.average : "—"} {checks.length > 0 && <em>ms</em>}</strong><p>{checks.length ? `P95 ${stats.p95} ms · P99 ${stats.p99} ms` : "Waiting for data"}</p></article><article><small>ACTIVE INCIDENTS</small><strong>{incidentData?.length ?? 0}</strong><p>{incidentData?.length ? <b className="warn">Needs attention</b> : "No active incidents"}</p></article></div>
      {!monitors.length ? <section className="emptyState"><Radio /><small>NO MONITORS YET</small><h2>Start with the service your users rely on most.</h2><p>Add a public website or API endpoint to begin collecting status history.</p><Link href="/dashboard/monitors/new" className="button">Create your first monitor</Link></section> : <>
        <div className="dashCards"><article className="responseCard"><div className="cardHead"><div><small>PERFORMANCE</small><h2>Recent response times</h2></div><span>{checks.length} checks loaded</span></div><div className="miniBars">{checks.slice(0, 40).reverse().map((check, index) => <i key={`${check.monitor_id}-${index}`} className={check.status.toLowerCase()} style={{ height: `${Math.max(5, Math.min(100, check.response_time_ms / Math.max(stats.maximum, 1) * 100))}%` }} title={`${check.response_time_ms} ms · ${check.status}`} />)}</div></article><article className="incidentCard"><div className="cardHead"><div><small>ACTIVE</small><h2>Recent incidents</h2></div><Link href="/dashboard/incidents">View all</Link></div>{incidentData?.length ? incidentData.map((incident) => <div className="incident" key={incident.id}><i className="red" /><div><b>{incident.title}</b><p>{incident.cause ?? incident.status}</p></div><time>{relative(incident.started_at)}</time></div>) : <p className="quietState">No active incidents.</p>}</article></div>
        <article className="statusTable"><div className="cardHead"><div><small>LIVE STATUS</small><h2>Monitor status</h2></div><Link href="/dashboard/monitors">View all</Link></div><div className="tableHead"><span>MONITOR</span><span>STATUS</span><span>RESPONSE</span><span>LAST CHECK</span></div>{monitors.map((monitor) => { const check = latest.get(monitor.id); const status = monitor.last_checked_at ? monitor.status : "PENDING"; return <div className="tableRow" key={monitor.id}><span><i className={`state ${status.toLowerCase()}`} /><b>{monitor.name}</b><small>{monitor.url}</small></span><span className={`badge ${status.toLowerCase()}`}>{status}</span><span>{check ? `${check.response_time_ms} ms` : "—"}</span><span><Clock3 /> {relative(monitor.last_checked_at)}</span></div>; })}</article>
      </>}
    </section>
  </main>;
}
