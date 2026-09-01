import { describe, expect, it } from "vitest";
import { transition } from "./state";
describe("incident confirmation", () => {
  it("requires repeated failures", () => {
    const first = transition(
      { status: "UP", consecutiveFailures: 0, consecutiveSuccesses: 0 },
      "DOWN",
      2,
      2,
    );
    expect(first.status).toBe("UP");
    const second = transition(first, "DOWN", 2, 2);
    expect(second.event).toBe("monitor.down");
    expect(second.status).toBe("DOWN");
  });
  it("requires repeated recoveries", () => {
    const first = transition(
      { status: "DOWN", consecutiveFailures: 2, consecutiveSuccesses: 0 },
      "UP",
      2,
      2,
    );
    expect(first.status).toBe("DOWN");
    expect(transition(first, "UP", 2, 2).event).toBe("monitor.recovered");
  });
});
