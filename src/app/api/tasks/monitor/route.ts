import { timingSafeEqual } from "node:crypto";
import { adminClient } from "@/lib/supabase/admin";
import {
  runMonitorCheck,
  type StoredMonitor,
} from "@/lib/monitoring/run-check";
import { error } from "@/lib/api";

export const maxDuration = 60;

function authorized(request: Request) {
  const supplied =
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  const expected = process.env.MONITOR_WORKER_SECRET ?? "";

  if (!supplied || !expected) return false;

  const left = Buffer.from(supplied);
  const right = Buffer.from(expected);

  return left.length === right.length && timingSafeEqual(left, right);
}

export async function POST(request: Request) {
  if (!authorized(request))
    return error("UNAUTHORIZED", "Invalid worker credentials.", 401);

  const db = adminClient();
  const now = new Date();
  const lockCutoff = new Date(Date.now() - 120000).toISOString();

  const { data: monitors, error: queryError } = await db
    .from("monitors")
    .select("*")
    .neq("status", "PAUSED")
    .lte("next_check_at", now.toISOString())
    .or(`locked_at.is.null,locked_at.lt.${lockCutoff}`)
    .order("next_check_at")
    .limit(20);

  if (queryError)
    return error("WORKER_QUERY_FAILED", "Could not claim monitors.", 500);

  let completed = 0;

  for (const monitor of monitors ?? []) {
    const { data: locked } = await db
      .from("monitors")
      .update({ locked_at: now.toISOString() })
      .eq("id", monitor.id)
      .or(`locked_at.is.null,locked_at.lt.${lockCutoff}`)
      .select("id")
      .maybeSingle();

    if (!locked) continue;

    try {
      await runMonitorCheck(monitor as StoredMonitor, now);
      completed++;
    } catch (workerError) {
      await db
        .from("monitors")
        .update({ locked_at: null })
        .eq("id", monitor.id);
      console.error(
        JSON.stringify({
          event: "monitor.check.failed",
          monitorId: monitor.id,
          error: workerError instanceof Error ? workerError.name : "UNKNOWN",
        }),
      );
    }
  }

  return Response.json({ ok: true, processed: completed });
}
