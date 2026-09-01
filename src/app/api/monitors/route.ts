import { requireUser } from "@/lib/supabase/server";
import { monitorSchema } from "@/lib/schemas/monitor";
import { assertSafeUrl } from "@/lib/monitoring/ssrf";
import {
  runMonitorCheck,
  type StoredMonitor,
} from "@/lib/monitoring/run-check";
import { adminClient } from "@/lib/supabase/admin";
import { ensureUserOrganization } from "@/lib/organizations";
import { error } from "@/lib/api";

export const maxDuration = 60;

export async function GET() {
  const { client, user } = await requireUser();

  if (!client || !user)
    return error("UNAUTHORIZED", "Authentication required.", 401);

  await ensureUserOrganization(user);

  const { data, error: databaseError } = await client
    .from("monitors")
    .select("id,name,url,type,method,status,last_checked_at,created_at")
    .order("created_at", { ascending: false });

  return databaseError
    ? error("DATABASE_ERROR", "Could not load monitors.", 500)
    : Response.json({ data });
}

export async function POST(request: Request) {
  const { client, user } = await requireUser();

  if (!client || !user)
    return error("UNAUTHORIZED", "Authentication required.", 401);

  const parsed = monitorSchema.safeParse(
    await request.json().catch(() => null),
  );

  if (!parsed.success)
    return error(
      "VALIDATION_ERROR",
      parsed.error.issues[0]?.message ?? "Invalid monitor.",
    );

  try {
    await assertSafeUrl(parsed.data.url);
  } catch {
    return error("URL_NOT_ALLOWED", "This endpoint cannot be monitored.");
  }

  const membership = await ensureUserOrganization(user);
  const monitor = parsed.data;

  const { data, error: createError } = await client
    .from("monitors")
    .insert({
      organization_id: membership.organization_id,
      name: monitor.name,
      url: monitor.url,
      type: monitor.type,
      method: monitor.method,
      interval_seconds: monitor.intervalSeconds,
      timeout_ms: monitor.timeoutMs,
      expected_status: monitor.expectedStatus,
      response_threshold_ms: monitor.responseThresholdMs,
      failures_before_incident: monitor.failuresBeforeIncident,
      successes_before_recovery: monitor.successesBeforeRecovery,
      encrypted_headers: monitor.headers,
    })
    .select("id,name,url,status")
    .single();

  if (createError) return error("CREATE_FAILED", createError.message, 403);

  const { data: stored } = await adminClient()
    .from("monitors")
    .select("*")
    .eq("id", data.id)
    .single();

  let firstCheck = null;

  if (stored) {
    try {
      firstCheck = await runMonitorCheck(stored as StoredMonitor);
    } catch (checkError) {
      console.error(
        JSON.stringify({
          event: "monitor.initial_check.failed",
          monitorId: data.id,
          error: checkError instanceof Error ? checkError.name : "UNKNOWN",
        }),
      );
    }
  }

  return Response.json({ data: { ...data, firstCheck } }, { status: 201 });
}
