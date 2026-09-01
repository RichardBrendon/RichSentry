"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function MonitorHeartbeat() {
  const router = useRouter();

  useEffect(() => {
    let active = true;
    let running = false;

    async function tick() {
      if (running || document.visibilityState !== "visible") return;

      running = true;

      try {
        const response = await fetch("/api/monitors/check-due", {
          method: "POST",
        });
        const body = await response.json();

        if (active && body.processed > 0) router.refresh();
      } finally {
        running = false;
      }
    }

    void tick();

    const timer = window.setInterval(tick, 60000);

    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [router]);

  return null;
}
