import { redirect } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { DashboardNav } from "@/components/dashboard-nav";
import { requireUser } from "@/lib/supabase/server";
import { ensureUserOrganization } from "@/lib/organizations";

type Incident = { id: string; title: string; cause: string | null; status: string; started_at: string; resolved_at: string | null; monitors: { name: string } | { name: string }[] | null };

export default async function IncidentsPage() {
  const { client, user } = await requireUser();
  if (!client || !user) redirect("/login");
  const membership = await ensureUserOrganization(user);
  const [{ data, error }, { count: monitorCount }] = await Promise.all([
    client.from("incidents").select("id,title,cause,status,started_at,resolved_at,monitors(name)").eq("organization_id", membership.organization_id).order("started_at", { ascending: false }),
    client.from("monitors").select("id", { count: "exact", head: true }).eq("organization_id", membership.organization_id),
  ]);
  if (error) throw new Error(error.message);
  const incidents = (data ?? []) as Incident[];
  const activeCount = incidents.filter((incident) => incident.status !== "RESOLVED").length;

  return <main className="appShell">
    <DashboardNav active="incidents" monitorCount={monitorCount ?? 0} incidentCount={activeCount} />
    <section className="appContent">
      <header><div><small>INCIDENTS</small><h1>Incident history</h1><p>Confirmed outages and recoveries across your monitors.</p></div></header>
      <div className="appMetrics incidentMetrics"><article><small>ACTIVE</small><strong>{activeCount}</strong><p>Currently requiring attention</p></article><article><small>TOTAL</small><strong>{incidents.length}</strong><p>All recorded incidents</p></article></div>
      {!incidents.length ? <section className="emptyState"><AlertTriangle /><small>ALL CLEAR</small><h2>No incidents recorded.</h2><p>Confirmed monitor failures will automatically appear here.</p></section> : <article className="statusTable incidentList"><div className="tableHead"><span>INCIDENT</span><span>MONITOR</span><span>STATUS</span><span>STARTED</span><span>RESOLVED</span></div>{incidents.map((incident) => { const monitor = Array.isArray(incident.monitors) ? incident.monitors[0] : incident.monitors; return <div className="tableRow" key={incident.id}><span><i className={`state ${incident.status === "RESOLVED" ? "up" : "down"}`} /><b>{incident.title}</b><small>{incident.cause ?? "No cause recorded"}</small></span><span>{monitor?.name ?? "Deleted monitor"}</span><span className={`badge ${incident.status === "RESOLVED" ? "up" : "down"}`}>{incident.status}</span><span>{new Date(incident.started_at).toLocaleString("pt-BR")}</span><span>{incident.resolved_at ? new Date(incident.resolved_at).toLocaleString("pt-BR") : "—"}</span></div>; })}</article>}
    </section>
  </main>;
}
