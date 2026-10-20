import { Stage, Usage } from "./types";

export const outputLimit = (stage: Stage) =>
  stage === "brief"
    ? 12000
    : stage === "slots"
    ? 10000
    : ["generate", "revise"].includes(stage)
    ? 14000
    : ["review", "editPlan", "final"].includes(stage)
    ? 24000
    : 8000;
export const estimateReservation = (stage: Stage, input: string): number => {
  if (stage === "art") return 0.04;
  const tokens = input.length + 15000;
  if (stage === "screen" || stage === "rescreen") return (tokens * 0.1) / 1e6;
  return (tokens * 0.1 + outputLimit(stage) * 0.5) / 1e6;
};
export const parseUsage = (
  raw: unknown,
  requestId: string,
  decisions = false
): Usage => {
  const usage =
    raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const count = (name: string) =>
    typeof usage[name] === "number" && Number.isFinite(usage[name])
      ? Math.max(0, usage[name] as number)
      : 0;
  const input = count("input_tokens"),
    output = count("output_tokens");
  const reasoningDetail = usage.output_tokens_details as
    | { reasoning_tokens?: number }
    | undefined;
  const reasoning = reasoningDetail?.reasoning_tokens ?? 0;
  const cost = (input * 0.1 + output * (decisions ? 0 : 0.5)) / 1e6;
  return { input, output, reasoning, cost, requestId };
};
