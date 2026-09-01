import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  Clock3,
  LayoutDashboard,
  Radio,
  Settings,
} from "lucide-react";

const monitors = [
  {
    name: "RichSentry Website",
    url: "https://richsentry.vercel.app",
    status: "UP",
    response: "98 ms",
    checked: "18s ago",
  },
  {
    name: "Production API",
    url: "https://api.example.com/health",
    status: "UP",
    response: "143 ms",
    checked: "32s ago",
  },
  {
    name: "Authentication Service",
    url: "https://auth.example.com/health",
    status: "DEGRADED",
    response: "1,248 ms",
    checked: "44s ago",
  },
] as const;

export default function DemoPage() {
  return (
    <main className="appShell demoShell">
      <aside className="appNav">
        <Link className="brand" href="/">
          <span>R</span> RichSentry
        </Link>
        <nav>
          <span className="active">
            <LayoutDashboard /> Overview
          </span>
          <span>
            <Radio /> Monitors <small>3</small>
          </span>
          <span>
            <AlertTriangle /> Incidents <small>1</small>
          </span>
          <span>
            <Activity /> Status pages
          </span>
        </nav>
        <span className="settings">
          <Settings /> Settings
        </span>
      </aside>
      <section className="appContent">
        <div className="demoBanner">
          <span>INTERACTIVE PREVIEW</span>
          <p>This page uses example data. No account is required.</p>
          <Link href="/signup">Create free account</Link>
        </div>
        <header>
          <div>
            <small>DEMO WORKSPACE</small>
            <h1>Infrastructure overview</h1>
            <p>
              Example monitoring data showing a typical RichSentry workspace.
            </p>
          </div>
          <Link href="/signup" className="button">
            Start monitoring
          </Link>
        </header>
        <div className="appMetrics">
          <article>
            <small>MONITORS</small>
            <strong>3</strong>
            <p>
              <b className="ok">2</b> operational · 1 degraded · 0 down
            </p>
          </article>
          <article>
            <small>UPTIME · 30 DAYS</small>
            <strong>99.97%</strong>
            <p>Based on 12,482 checks</p>
          </article>
          <article>
            <small>AVG RESPONSE</small>
            <strong>
              184 <em>ms</em>
            </strong>
            <p>P95 423 ms · P99 1,248 ms</p>
          </article>
          <article>
            <small>ACTIVE INCIDENTS</small>
            <strong>1</strong>
            <p>
              <b className="warn">Needs attention</b>
            </p>
          </article>
        </div>
        <div className="dashCards">
          <article>
            <div className="cardHead">
              <div>
                <small>PERFORMANCE</small>
                <h2>Recent response times</h2>
              </div>
              <span>Last 24 hours</span>
            </div>
            <div className="miniBars">
              {[
                30, 38, 34, 48, 41, 46, 51, 44, 66, 50, 58, 55, 74, 61, 69, 62,
                78, 71, 65, 81, 70, 76, 68, 72,
              ].map((height, index) => (
                <i
                  key={index}
                  className={index === 18 ? "degraded" : "up"}
                  style={{ height: `${height}%` }}
                />
              ))}
            </div>
          </article>
          <article>
            <div className="cardHead">
              <div>
                <small>ACTIVE</small>
                <h2>Recent incidents</h2>
              </div>
            </div>
            <div className="incident">
              <i className="yellow" />
              <div>
                <b>Authentication latency</b>
                <p>Response time above threshold</p>
              </div>
              <time>12m ago</time>
            </div>
          </article>
        </div>
        <article className="statusTable">
          <div className="cardHead">
            <div>
              <small>LIVE STATUS</small>
              <h2>Monitor status</h2>
            </div>
          </div>
          <div className="tableHead">
            <span>MONITOR</span>
            <span>STATUS</span>
            <span>RESPONSE</span>
            <span>LAST CHECK</span>
          </div>
          {monitors.map((monitor) => (
            <div className="tableRow" key={monitor.name}>
              <span>
                <i className={`state ${monitor.status.toLowerCase()}`} />
                <b>{monitor.name}</b>
                <small>{monitor.url}</small>
              </span>
              <span className={`badge ${monitor.status.toLowerCase()}`}>
                {monitor.status}
              </span>
              <span>{monitor.response}</span>
              <span>
                <Clock3 /> {monitor.checked}
              </span>
            </div>
          ))}
        </article>
      </section>
    </main>
  );
}
