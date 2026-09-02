import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  Check,
  Globe2,
  Radio,
  ShieldCheck,
  Webhook,
} from "lucide-react";
import { requireUser } from "@/lib/supabase/server";

const features = [
  [
    Globe2,
    "Website & API monitoring",
    "HTTP checks from the server, with status-code and latency validation.",
  ],
  [
    Radio,
    "Incident confirmation",
    "Configurable failure and recovery thresholds cut through transient noise.",
  ],
  [
    ShieldCheck,
    "Security by default",
    "SSRF-safe requests, tenant isolation and protected scheduled jobs.",
  ],
  [
    Webhook,
    "Alerts that travel",
    "A delivery pipeline ready for signed webhooks, email and future integrations.",
  ],
] as const;

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; sb_flow_id?: string }>;
}) {
  const { code, sb_flow_id: flowId } = await searchParams;
  if (code) {
    const query = new URLSearchParams({ code, next: "/dashboard" });
    if (flowId) query.set("sb_flow_id", flowId);
    redirect(`/auth/callback?${query.toString()}`);
  }
  const { user } = await requireUser();

  return (
    <main>
      <nav className="nav shell">
        <Link className="brand" href="/">
          <span>R</span> RichSentry
        </Link>
        <div className="navlinks">
          <a href="#product">Product</a>
          <a href="#features">Features</a>
          <a href="#pricing">Pricing</a>
          <a href="#docs">Docs</a>
        </div>
        <div className="navActions">
          {user ? (
            <Link href="/dashboard" className="button">
              Open dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className="textButton">
                Sign in
              </Link>
              <Link href="/signup" className="button">
                Start monitoring
              </Link>
            </>
          )}
        </div>
      </nav>
      <section className="hero shell" id="product">
        <div className="eyebrow">
          <i /> Infrastructure intelligence, without the noise
        </div>
        <h1>
          Know when your services fail.
          <br />
          <em>Before your users do.</em>
        </h1>
        <p>
          RichSentry continuously watches websites and APIs, confirms real
          incidents, and gives your team the context to respond with confidence.
        </p>
        <div className="heroActions">
          <Link href={user ? "/dashboard" : "/signup"} className="button large">
            {user ? "Open dashboard" : "Start monitoring"}{" "}
            <ArrowRight size={16} />
          </Link>
          <Link href="/demo" className="secondary large">
            View live demo
          </Link>
        </div>
        <div className="trust">
          <span>
            <Check size={14} /> 2-minute setup
          </span>
          <span>
            <Check size={14} /> No credit card
          </span>
          <span>
            <Check size={14} /> Secure by default
          </span>
        </div>
      </section>
      <section
        className="console shell"
        aria-label="RichSentry dashboard preview"
      >
        <div className="consoleBar">
          <span className="brand small">
            <span>R</span> RichSentry
          </span>
          <span>Production workspace</span>
          <span className="live">
            <i /> Live
          </span>
        </div>
        <div className="consoleGrid">
          <aside>
            <b>Overview</b>
            <span>
              Monitors <small>12</small>
            </span>
            <span>
              Incidents <small>2</small>
            </span>
            <span>Status pages</span>
            <hr />
            <span>Settings</span>
          </aside>
          <div className="consoleMain">
            <div className="dashHead">
              <div>
                <small>OVERVIEW</small>
                <h2>Infrastructure</h2>
              </div>
              <button>+ New monitor</button>
            </div>
            <div className="metrics">
              <article>
                <small>MONITORS</small>
                <strong>12</strong>
                <span>10 operational</span>
              </article>
              <article>
                <small>UPTIME · 30D</small>
                <strong>99.97%</strong>
                <span className="positive">+0.04%</span>
              </article>
              <article>
                <small>AVG RESPONSE</small>
                <strong>184 ms</strong>
                <span>Across all monitors</span>
              </article>
              <article>
                <small>ACTIVE INCIDENTS</small>
                <strong>2</strong>
                <span className="warning">Needs attention</span>
              </article>
            </div>
            <div className="chart">
              <div className="chartTitle">
                <b>Response time</b>
                <span>Last 24 hours</span>
              </div>
              <div className="bars">
                {[
                  30, 38, 34, 48, 41, 46, 51, 44, 66, 50, 58, 55, 74, 61, 69,
                  62, 78, 71, 65, 81, 70, 76, 68, 72,
                ].map((h, i) => (
                  <i key={i} style={{ height: `${h}%` }} />
                ))}
              </div>
            </div>
            <div className="monitorRows">
              <div>
                <span className="dot up" />
                <b>RichSentry Website</b>
                <small>200 OK</small>
                <strong>98 ms</strong>
              </div>
              <div>
                <span className="dot up" />
                <b>Production API</b>
                <small>200 OK</small>
                <strong>143 ms</strong>
              </div>
              <div>
                <span className="dot degraded" />
                <b>Authentication Service</b>
                <small>Slow response</small>
                <strong>1,248 ms</strong>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="section shell" id="features">
        <div className="sectionIntro">
          <small>BUILT FOR RELIABILITY</small>
          <h2>Everything between “it works” and “we know why.”</h2>
          <p>Operational clarity without a maze of configuration.</p>
        </div>
        <div className="featureGrid">
          {features.map(([Icon, title, copy]) => (
            <article key={title}>
              <Icon />
              <h3>{title}</h3>
              <p>{copy}</p>
              <a href="#docs">
                Explore feature <ArrowRight size={14} />
              </a>
            </article>
          ))}
        </div>
      </section>
      <section className="how shell">
        <small>HOW IT WORKS</small>
        <div className="steps">
          {[
            [
              "01",
              "Add your endpoint",
              "Choose a URL, interval, expected status and response threshold.",
            ],
            [
              "02",
              "We monitor it",
              "Checks run securely on the server and every result becomes usable history.",
            ],
            [
              "03",
              "Act on signal",
              "Confirmed failures create incidents and notify the right people.",
            ],
          ].map(([n, t, d]) => (
            <article key={n}>
              <b>{n}</b>
              <h3>{t}</h3>
              <p>{d}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="pricing shell" id="pricing">
        <div className="sectionIntro">
          <small>SIMPLE PRICING</small>
          <h2>Start small. Stay informed.</h2>
        </div>
        <div className="priceGrid">
          {[
            ["Free", "$0", "For side projects", "5 monitors · 7-day history"],
            [
              "Pro",
              "$19",
              "For production teams",
              "50 monitors · 90-day history",
            ],
            [
              "Team",
              "$49",
              "For growing organizations",
              "200 monitors · 1-year history",
            ],
          ].map(([name, price, desc, items], i) => (
            <article className={i === 1 ? "featured" : ""} key={name}>
              {i === 1 && <label>POPULAR</label>}
              <h3>{name}</h3>
              <strong>
                {price}
                <small>/mo</small>
              </strong>
              <p>{desc}</p>
              <span>{items}</span>
              <Link className={i === 1 ? "button" : "secondary"} href="/signup">
                Start monitoring
              </Link>
            </article>
          ))}
        </div>
      </section>
      <footer className="shell" id="docs">
        <span className="brand small">
          <span>R</span> RichSentry
        </span>
        <p>© 2026 RichSentry. Built for the uptime-obsessed.</p>
        <div>
          <a href="#product">Product</a>
          <a href="#pricing">Pricing</a>
          <a href="/login">Sign in</a>
        </div>
      </footer>
    </main>
  );
}
