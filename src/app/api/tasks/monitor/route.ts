import { timingSafeEqual } from "node:crypto";
import { adminClient } from "@/lib/supabase/admin";
import { performCheck } from "@/lib/monitoring/check";
import { transition } from "@/lib/monitoring/state";
import { error } from "@/lib/api";

export const maxDuration = 60;

function authorized(request: Request) {
  const supplied = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  const expected = process.env.MONITOR_WORKER_SECRET ?? "";
  if (!supplied || !expected) return false;
  const left = Buffer.from(supplied);
  const right = Buffer.from(expected);
  return left.length === right.length && timingSafeEqual(left, right);
}

export async function POST(request: Request) {
  if (!authorized(request)) return error("UNAUTHORIZED", "Invalid worker credentials.", 401);
  const db = adminClient();
  const now = new Date();
  const lockCutoff = new Date(Date.now() - 120_000).toISOString();
  const { data: monitors, error: queryError } = await db.from("monitors").select("*").neq("status", "PAUSED").lte("next_check_at", now.toISOString()).or(`locked_at.is.null,locked_at.lt.${lockCutoff}`).order("next_check_at").limit(20);
  if (queryError) return error("WORKER_QUERY_FAILED", "Could not claim monitors.", 500);
  let completed = 0;
  for (const monitor of monitors ?? []) {
    const { data: locked } = await db.from("monitors").update({ locked_at: now.toISOString() }).eq("id", monitor.id).or(`locked_at.is.null,locked_at.lt.${lockCutoff}`).select("id").maybeSingle();
    if (!locked) continue;
    const input = { name: monitor.name, url: monitor.url, type: monitor.type, method: monitor.method, intervalSeconds: monitor.interval_seconds, timeoutMs: monitor.timeout_ms, expectedStatus: monitor.expected_status, responseThresholdMs: monitor.response_threshold_ms, failuresBeforeIncident: monitor.failures_before_incident, successesBeforeRecovery: monitor.successes_before_recovery, headers: monitor.encrypted_headers ?? {} };
    const check = await performCheck(input);
    const next = transition({ status: monitor.status, consecutiveFailures: monitor.consecutive_failures, consecutiveSuccesses: monitor.consecutive_successes }, check.status, monitor.failures_before_incident, monitor.successes_before_recovery);
    await db.from("monitor_checks").insert({ monitor_id: monitor.id, status: check.status, http_status: check.httpStatus, response_time_ms: check.responseTimeMs, error_code: check.error });
    await db.from("monitors").update({ status: next.status, consecutive_failures: next.consecutiveFailures, consecutive_successes: next.consecutiveSuccesses, last_checked_at: now.toISOString(), next_check_at: new Date(Date.now() + monitor.interval_seconds * 1000).toISOString(), locked_at: null }).eq("id", monitor.id);
    if (next.event === "monitor.down") await db.from("incidents").insert({ monitor_id: monitor.id, organization_id: monitor.organization_id, title: `${monitor.name} is down`, cause: check.httpStatus ? `HTTP ${check.httpStatus}` : check.error });
    if (next.event === "monitor.recovered") await db.from("incidents").update({ status: "RESOLVED", resolved_at: now.toISOString() }).eq("monitor_id", monitor.id).neq("status", "RESOLVED");
    console.info(JSON.stringify({ event: "monitor.check.completed", monitorId: monitor.id, status: check.status, responseTimeMs: check.responseTimeMs }));
    completed++;
  }
  return Response.json({ ok: true, processed: completed });
}
