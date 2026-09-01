import { describe, expect, it } from "vitest";
import { percentile, responseStats, uptime } from "./metrics";
describe("monitoring metrics", () => {
  it("weights degraded checks", () =>
    expect(uptime(["UP", "UP", "DEGRADED", "DOWN"])).toBe(62.5));
  it("calculates percentiles", () => {
    expect(percentile([10, 20, 30, 40, 100], 95)).toBe(100);
    expect(responseStats([10, 20, 30])).toEqual({
      average: 20,
      minimum: 10,
      maximum: 30,
      p50: 20,
      p95: 30,
      p99: 30,
    });
  });
});
