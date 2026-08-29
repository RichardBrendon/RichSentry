"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export function DeleteMonitorButton({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  async function remove() {
    if (!window.confirm(`Remove "${name}" and all of its check history?`)) return;
    setDeleting(true);
    setError("");

    try {
      const response = await fetch(`/api/monitors/${id}`, { method: "DELETE" });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error?.message ?? "Could not remove this monitor.");
      }
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not remove this monitor.");
      setDeleting(false);
    }
  }

  return <span className="monitorDelete">
    <button type="button" onClick={remove} disabled={deleting} aria-label={`Remove ${name}`} title={`Remove ${name}`}>
      <Trash2 /> {deleting ? "Removing…" : "Remove"}
    </button>
    {error && <small role="alert">{error}</small>}
  </span>;
}
