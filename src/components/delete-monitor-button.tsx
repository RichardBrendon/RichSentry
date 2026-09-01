"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export function DeleteMonitorButton({
  id,
  name,
}: {
  id: string;
  name: string;
}) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  async function remove() {
    const portuguese = localStorage.getItem("richsentry-language") === "pt-BR";
    const confirmation = portuguese
      ? `Remover "${name}" e todo o seu histórico de verificações?`
      : `Remove "${name}" and all of its check history?`;

    if (!window.confirm(confirmation)) return;

    setDeleting(true);
    setError("");

    try {
      const response = await fetch(`/api/monitors/${id}`, { method: "DELETE" });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(
          body?.error?.message ??
            (portuguese
              ? "Não foi possível remover este monitor."
              : "Could not remove this monitor."),
        );
      }
      router.refresh();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : portuguese
            ? "Não foi possível remover este monitor."
            : "Could not remove this monitor.",
      );
      setDeleting(false);
    }
  }

  return (
    <span className="monitorDelete">
      <button
        type="button"
        onClick={remove}
        disabled={deleting}
        aria-label={`Remove ${name}`}
        title={`Remove ${name}`}
      >
        <Trash2 /> {deleting ? "Removing…" : "Remove"}
      </button>
      {error && <small role="alert">{error}</small>}
    </span>
  );
}
