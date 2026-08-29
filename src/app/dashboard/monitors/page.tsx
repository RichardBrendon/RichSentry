import Link from "next/link";
import { redirect } from "next/navigation";
import { Clock3, Radio } from "lucide-react";
import { DashboardNav } from "@/components/dashboard-nav";
import { DeleteMonitorButton } from "@/components/delete-monitor-button";
import { requireUser } from "@/lib/supabase/server";
import { ensureUserOrganization } from "@/lib/organizations";

type Monitor = {
  id: string;
  name: string;
  url: string;
  type: string;
  method: string;
  status: "UP" | "DEGRADED" | "DOWN" | "PAUSED";
  last_checked_at: string | null;
};

function lastCheck(value: string | null) {
  if (!value) return "Waiting for first check";
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));
}

export default async function MonitorsPage() {
  const { client, user } = await requireUser();
  if (!client || !user) redirect("/login");
  const membership = await ensureUserOrganization(user);
  const { data, error } = await client
    .from("monitors")
    .select("id,name,url,type,method,status,last_checked_at")
    .eq("organization_id", membership.organization_id)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  const monitors = (data ?? []) as Monitor[];

  return <main className="appShell">
    <DashboardNav active="monitors" monitorCount={monitors.length} />
    <section className="appContent">
      <header><div><small>MONITORS</small><h1>Endpoints</h1><p>All websites and APIs in this workspace.</p></div><Link className="button" href="/dashboard/monitors/new">+ New monitor</Link></header>
      {!monitors.length ? <section className="emptyState"><Radio /><small>NO MONITORS YET</small><h2>Add your first endpoint.</h2><p>RichSentry will run an initial check as soon as it is created.</p><Link className="button" href="/dashboard/monitors/new">Create monitor</Link></section> :
        <article className="statusTable monitorList"><div className="tableHead"><span>MONITOR</span><span>TYPE</span><span>STATUS</span><span>LAST CHECK</span><span>ACTIONS</span></div>{monitors.map((monitor) => { const status = monitor.last_checked_at ? monitor.status : "PENDING"; return <div className="tableRow" key={monitor.id}><span><i className={`state ${status.toLowerCase()}`} /><b>{monitor.name}</b><small>{monitor.method} · {monitor.url}</small></span><span>{monitor.type}</span><span className={`badge ${status.toLowerCase()}`}>{status}</span><span><Clock3 /> {lastCheck(monitor.last_checked_at)}</span><DeleteMonitorButton id={monitor.id} name={monitor.name} /></div>; })}</article>}
    </section>
  </main>;
}
