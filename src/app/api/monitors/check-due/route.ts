import { requireUser } from "@/lib/supabase/server";
import { ensureUserOrganization } from "@/lib/organizations";
import { adminClient } from "@/lib/supabase/admin";
import {
  runMonitorCheck,
  type StoredMonitor,
} from "@/lib/monitoring/run-check";
import { error } from "@/lib/api";

export const maxDuration = 60;

export async function POST() {
  const { user } = await requireUser();

  if (!user) return error("UNAUTHORIZED", "Authentication required.", 401);

  const membership = await ensureUserOrganization(user);
  const db = adminClient();
  const now = new Date();
  const lockCutoff = new Date(Date.now() - 120000).toISOString();

  const { data: monitors, error: queryError } = await db
    .from("monitors")
    .select("*")
    .eq("organization_id", membership.organization_id)
    .neq("status", "PAUSED")
    .lte("next_check_at", now.toISOString())
    .or(`locked_at.is.null,locked_at.lt.${lockCutoff}`)
    .order("next_check_at")
    .limit(5);

  if (queryError)
    return error("CHECK_QUERY_FAILED", "Could not load due monitors.", 500);

  let processed = 0;

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
      processed++;
    } catch {
      await db
        .from("monitors")
        .update({ locked_at: null })
        .eq("id", monitor.id);
    }
  }

  return Response.json({ ok: true, processed });
}
