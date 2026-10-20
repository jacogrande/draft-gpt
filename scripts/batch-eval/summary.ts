import { Review } from "../../convex/draft/set/types";
import { Candidate } from "./generate";

export const summarize = (candidates: Candidate[], reviews: {
  candidateId: string; repeat: number; review: Review | null;
}[]) => candidates.map((candidate) => {
  const attempts = candidate.batches.flatMap((b) => b.attempts);
  const initial = candidate.batches.map((b) => b.attempts[0]);
  const judgments = reviews.filter((r) => r.candidateId === candidate.id);
  return {
    id: candidate.id, batchSize: candidate.batchSize,
    accepted: candidate.designs.length,
    firstPassAccepted: initial.reduce((n, a) => n + a.accepted, 0),
    initialCalls: initial.length,
    completeInitialCalls: initial.filter((a) => a.accepted === a.requested).length,
    repairCalls: attempts.length - initial.length,
    missing: candidate.batches.flatMap((b) => b.missing),
    generationSeconds: candidate.resumed ? null : Math.round(candidate.wallMs / 100) / 10,
    timingComparable: !candidate.resumed,
    generationReportedCost: attempts.reduce((n, a) => n + (a.usage?.cost ?? 0), 0),
    inputTokens: attempts.reduce((n, a) => n + (a.usage?.input ?? 0), 0),
    outputTokens: attempts.reduce((n, a) => n + (a.usage?.output ?? 0), 0),
    transportFailures: attempts.filter((a) => !a.usage).length,
    duplicateNameCards: new Set(candidate.duplicateIssues.flatMap((i) => i.slots)).size,
    inventoryProblems: candidate.inventoryProblems,
    majorFlaggedCards: judgments.map((j) => j.review ?
      new Set(j.review.issues.filter((i) => i.severity !== "minor").flatMap((i) => i.slots)).size : null),
    minorFlaggedCards: judgments.map((j) => j.review ?
      new Set(j.review.issues.filter((i) => i.severity === "minor").flatMap((i) => i.slots)).size : null),
  };
});
