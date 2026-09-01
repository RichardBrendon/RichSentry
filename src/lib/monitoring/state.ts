export type MonitorState = {
  status: "UP" | "DEGRADED" | "DOWN" | "PAUSED";
  consecutiveFailures: number;
  consecutiveSuccesses: number;
};
export function transition(
  state: MonitorState,
  check: "UP" | "DEGRADED" | "DOWN",
  failureLimit: number,
  recoveryLimit: number,
) {
  if (state.status === "PAUSED") return { ...state, event: null };

  const failed = check === "DOWN";
  const failures = failed ? state.consecutiveFailures + 1 : 0;
  const successes = failed ? 0 : state.consecutiveSuccesses + 1;

  if (failed && failures >= failureLimit && state.status !== "DOWN")
    return {
      status: "DOWN" as const,
      consecutiveFailures: failures,
      consecutiveSuccesses: 0,
      event: "monitor.down" as const,
    };

  if (!failed && state.status === "DOWN" && successes >= recoveryLimit)
    return {
      status: check,
      consecutiveFailures: 0,
      consecutiveSuccesses: successes,
      event: "monitor.recovered" as const,
    };

  const status: MonitorState["status"] =
    state.status === "DOWN" ? "DOWN" : failed ? state.status : check;

  return {
    status,
    consecutiveFailures: failures,
    consecutiveSuccesses: successes,
    event: null,
  };
}
