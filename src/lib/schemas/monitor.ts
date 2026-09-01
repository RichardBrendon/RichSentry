import { z } from "zod";

export const monitorSchema = z.object({
  name: z.string().trim().min(2).max(80),
  url: z
    .string()
    .url()
    .refine(
      (v) => ["http:", "https:"].includes(new URL(v).protocol),
      "Only HTTP and HTTPS are supported",
    ),
  type: z.enum(["WEBSITE", "API"]).default("WEBSITE"),
  method: z.enum(["GET", "POST", "PUT", "PATCH", "HEAD"]).default("GET"),
  intervalSeconds: z.number().int().min(60).max(86400).default(300),
  timeoutMs: z.number().int().min(500).max(30000).default(5000),
  expectedStatus: z.number().int().min(100).max(599).default(200),
  responseThresholdMs: z.number().int().min(50).max(60000).default(1000),
  failuresBeforeIncident: z.number().int().min(1).max(10).default(2),
  successesBeforeRecovery: z.number().int().min(1).max(10).default(2),
  headers: z.record(z.string(), z.string()).default({}),
});
export type MonitorInput = z.infer<typeof monitorSchema>;
