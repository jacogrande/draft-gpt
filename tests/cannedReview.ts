import { Issue, PAIRS, REVIEW_DIMENSIONS, Review, Task } from "../convex/draft/set/types";

export const cannedReview = (task: Task, issues: Issue[] = task.stage === "editPlan" ? task.issues ?? [] : []): Review => ({
  summary: "The fixture has no reported issues beyond its supplied test defects.",
  blueprintBroken: false,
  issues,
  ...(task.reviewContract ? { audit: {
    reviewedSlots: task.designs?.map(d => d.slotId) ?? [],
    dimensions: REVIEW_DIMENSIONS.map(dimension => ({
      dimension, assessment: "Deterministic test fixture; not a semantic quality judgment.",
      evidenceSlots: task.designs?.slice(0, 1).map(d => d.slotId) ?? [],
      issues: dimension === "mechanics" ? issues.map(i => i.id) : [],
    })),
    archetypes: (PAIRS.includes(task.scope as typeof PAIRS[number]) ? [task.scope as typeof PAIRS[number]] : PAIRS).map(pair => ({
      pair, assessment: "Test fixture only; no claim of proven synergy.",
      enablers: [], payoffs: [],
    })),
  } } : {}),
});
