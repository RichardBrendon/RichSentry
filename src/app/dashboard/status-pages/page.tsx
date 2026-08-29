import { redirect } from "next/navigation";
import { Activity } from "lucide-react";
import { DashboardNav } from "@/components/dashboard-nav";
import { requireUser } from "@/lib/supabase/server";
import { ensureUserOrganization } from "@/lib/organizations";

type Monitor = { id: string; name: string; status: "UP" | "DEGRADED" | "DOWN" | "PAUSED"; last_checked_at: string | null };

export default async function StatusPagesPage() {
  const { client, user } = await requireUser();
  if (!client || !user) redirect("/login");
  const membership = await ensureUserOrganization(user);
  const organization = Array.isArray(membership.organizations) ? membership.organizations[0] : membership.organizations;
  const [{ data, error }, { count: incidentCount }] = await Promise.all([
    client.from("monitors").select("id,name,status,last_checked_at").eq("organization_id", membership.organization_id).order("name"),
    client.from("incidents").select("id", { count: "exact", head: true }).eq("organization_id", membership.organization_id).neq("status", "RESOLVED"),
  ]);
  if (error) throw new Error(error.message);
  const monitors = (data ?? []) as Monitor[];
  const available = monitors.filter((monitor) => monitor.last_checked_at && monitor.status === "UP").length;
  const overall = !monitors.length ? "NO DATA" : available === monitors.length ? "ALL SYSTEMS OPERATIONAL" : "SERVICE INTERRUPTION";

  return <main className="appShell">
    <DashboardNav active="status-pages" monitorCount={monitors.length} incidentCount={incidentCount ?? 0} />
    <section className="appContent">
      <header><div><small>STATUS PAGE</small><h1>{organization?.name ?? "Workspace"}</h1><p>A live operational summary based on your monitor results.</p></div></header>
      <section className={`statusHero ${available === monitors.length && monitors.length ? "operational" : "attention"}`}><Activity /><div><small>CURRENT STATUS</small><h2>{overall}</h2><p>{available} of {monitors.length} services operational</p></div></section>
      {!monitors.length ? <section className="emptyState"><Activity /><small>NO SERVICES</small><h2>Your status page is waiting for monitors.</h2><p>Create a monitor to publish its current condition here.</p></section> : <article className="statusTable statusPageList"><div className="cardHead"><div><small>SERVICES</small><h2>Current availability</h2></div></div>{monitors.map((monitor) => { const status = monitor.last_checked_at ? monitor.status : "PENDING"; return <div className="statusService" key={monitor.id}><span><i className={`state ${status.toLowerCase()}`} />{monitor.name}</span><span className={`badge ${status.toLowerCase()}`}>{status}</span></div>; })}</article>}
    </section>
  </main>;
}
