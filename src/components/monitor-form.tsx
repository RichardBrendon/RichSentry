"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { z } from "zod";
import { monitorSchema, type MonitorInput } from "@/lib/schemas/monitor";

const defaults: MonitorInput = {
  name: "",
  url: "https://",
  type: "WEBSITE",
  method: "GET",
  intervalSeconds: 300,
  timeoutMs: 5000,
  expectedStatus: 200,
  responseThresholdMs: 1000,
  failuresBeforeIncident: 2,
  successesBeforeRecovery: 2,
  headers: {},
};

export function MonitorForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.input<typeof monitorSchema>, unknown, MonitorInput>({
    resolver: zodResolver(monitorSchema),
    defaultValues: defaults,
  });

  async function submit(values: MonitorInput) {
    setServerError("");

    const response = await fetch("/api/monitors", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(values),
    });
    const body = await response.json().catch(() => null);

    if (!response.ok) {
      setServerError(body?.error?.message ?? "Failed to create monitor.");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form className="monitorForm" onSubmit={handleSubmit(submit)}>
      <div className="formGrid">
        <label>
          Name
          <input {...register("name")} placeholder="Production API" />
          {errors.name && <small>{errors.name.message}</small>}
        </label>
        <label>
          URL
          <input {...register("url")} inputMode="url" />
          {errors.url && <small>{errors.url.message}</small>}
        </label>
        <label>
          Type
          <select {...register("type")}>
            <option value="WEBSITE">Website</option>
            <option value="API">API</option>
          </select>
        </label>
        <label>
          HTTP method
          <select {...register("method")}>
            <option>GET</option>
            <option>POST</option>
            <option>PUT</option>
            <option>PATCH</option>
            <option>HEAD</option>
          </select>
        </label>
        <label>
          Interval
          <select {...register("intervalSeconds", { valueAsNumber: true })}>
            <option value="60">Every minute</option>
            <option value="300">Every 5 minutes</option>
            <option value="900">Every 15 minutes</option>
            <option value="3600">Every hour</option>
          </select>
        </label>
        <label>
          Timeout (ms)
          <input
            type="number"
            {...register("timeoutMs", { valueAsNumber: true })}
          />
        </label>
        <label>
          Expected HTTP status
          <input
            type="number"
            {...register("expectedStatus", { valueAsNumber: true })}
          />
        </label>
        <label>
          Slow after (ms)
          <input
            type="number"
            {...register("responseThresholdMs", { valueAsNumber: true })}
          />
        </label>
        <label>
          Failures before incident
          <input
            type="number"
            {...register("failuresBeforeIncident", { valueAsNumber: true })}
          />
        </label>
        <label>
          Successes before recovery
          <input
            type="number"
            {...register("successesBeforeRecovery", { valueAsNumber: true })}
          />
        </label>
      </div>
      {serverError && (
        <p className="formError" role="alert">
          {serverError}
        </p>
      )}
      <div className="formActions">
        <button
          type="button"
          className="secondary"
          onClick={() => router.back()}
        >
          Cancel
        </button>
        <button className="button" disabled={isSubmitting}>
          {isSubmitting ? "Creating…" : "Create monitor"}
        </button>
      </div>
    </form>
  );
}
