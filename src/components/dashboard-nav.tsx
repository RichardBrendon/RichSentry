import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  LayoutDashboard,
  Radio,
  Settings,
} from "lucide-react";
import { SignOutButton } from "@/components/sign-out-button";

type DashboardNavProps = {
  active: "overview" | "monitors" | "incidents" | "status-pages" | "settings";
  monitorCount?: number;
  incidentCount?: number;
};

export function DashboardNav({
  active,
  monitorCount,
  incidentCount,
}: DashboardNavProps) {
  return (
    <aside className="appNav">
      <Link className="brand" href="/">
        <span>R</span> RichSentry
      </Link>
      <nav>
        <Link className={active === "overview" ? "active" : undefined} href="/dashboard">
          <LayoutDashboard /> Overview
        </Link>
        <Link className={active === "monitors" ? "active" : undefined} href="/dashboard/monitors">
          <Radio /> Monitors {monitorCount !== undefined && <small>{monitorCount}</small>}
        </Link>
        <Link className={active === "incidents" ? "active" : undefined} href="/dashboard/incidents">
          <AlertTriangle /> Incidents {incidentCount !== undefined && <small>{incidentCount}</small>}
        </Link>
        <Link className={active === "status-pages" ? "active" : undefined} href="/dashboard/status-pages">
          <Activity /> Status pages
        </Link>
      </nav>
      <div className="navBottom"><Link className={`settings${active === "settings" ? " active" : ""}`} href="/dashboard/settings"><Settings /> Settings</Link><SignOutButton compact /></div>
    </aside>
  );
}
