import { reviewSchema } from "./contracts";
import { arr, choice, nonempty as s, obj } from "./schema";
import { PAIRS, REVIEW_DIMENSIONS, Review, Task } from "./types";

export const auditedReviewSchema = obj({ ...reviewSchema.properties!, audit: obj({
  reviewedSlots: arr(s(30), 0, 270),
  dimensions: arr(obj({
    dimension: choice(REVIEW_DIMENSIONS), assessment: s(1200),
    evidenceSlots: arr(s(30), 0, 270), issues: arr(s(80), 0, 270),
  }), 5, 5),
  archetypes: arr(obj({
    pair: choice(PAIRS), assessment: s(1200),
    enablers: arr(s(30), 0, 270), payoffs: arr(s(30), 0, 270),
  }), 1, 10),
}) });

export const validateReviewAudit = (review: Review, task: Task) => {
  const audit = review.audit!;
  const cards = new Set(task.designs?.map(card => card.slotId));
  const distinctKnown = (ids: string[], known: Set<string>, label: string) => {
    if (new Set(ids).size !== ids.length || ids.some(id => !known.has(id)))
      throw new Error(`Review audit has repeated or unknown ${label}`);
  };
  distinctKnown(audit.reviewedSlots, cards, "reviewed slots");
  if (audit.reviewedSlots.length !== cards.size) throw new Error("Review audit must cover every inspected card");
  if (new Set(audit.dimensions.map(d => d.dimension)).size !== REVIEW_DIMENSIONS.length)
    throw new Error("Review audit must assess all five dimensions exactly once");
  const issues = new Set(review.issues.map(issue => issue.id));
  const assigned = new Set<string>();
  for (const dimension of audit.dimensions) {
    distinctKnown(dimension.evidenceSlots, cards, "evidence slots");
    if (cards.size && !dimension.evidenceSlots.length) throw new Error(`Review audit needs card evidence for ${dimension.dimension}`);
    distinctKnown(dimension.issues, issues, "dimension issues");
    dimension.issues.forEach(id => assigned.add(id));
  }
  if (assigned.size !== issues.size) throw new Error("Review audit must assign every issue to a dimension");
  const pairs = new Set<string>(PAIRS.includes(task.scope as typeof PAIRS[number]) ? [task.scope!] : PAIRS);
  distinctKnown(audit.archetypes.map(a => a.pair), pairs, "archetypes");
  if (audit.archetypes.length !== pairs.size) throw new Error("Review audit must assess every requested archetype");
  for (const archetype of audit.archetypes) {
    distinctKnown(archetype.enablers, cards, "archetype enablers");
    distinctKnown(archetype.payoffs, cards, "archetype payoffs");
  }
};

export const REVIEW_AUDIT_INSTRUCTIONS = `Return the five-axis review audit alongside actionable issues. reviewedSlots must list every supplied design exactly once; assess every card, not just a few examples. Assess uniqueness, mechanics, archetypes, flavor and power separately, with concrete evidenceSlots and references to the issues you report. Every issue must belong to at least one dimension; do not invent defects to populate the audit. State strengths and limitations when no correction is justified. Keep issue evidence and corrections concise, consolidate related defects per card or group, and use groups to coordinate changes across cards. There is no quota or percentage limit on cards needing revision: any subset, including the entire inventory, may need editing.
Uniqueness: compare names, rules, roles, triggers, subjects and art across cards. Exact duplicate names must be repaired. Distinguish redundant designs from intentional cycles, shared enablers and healthy repetition; tools.uniqueness reports observations, not semantic verdicts.
Mechanics: validate executable wording, costs, targets, timing, tokens, assigned mechanic implementation and applicability to the card's type. Do not prescribe an inapplicable mechanic to satisfy an impossible slot. Explain an unrepairable frozen contract as a blocker rather than inventing new game procedures. Familiar keywords do not excuse incorrect interactions.
Archetypes: assess each requested pair using the printed cards, not slot labels alone. In archetypes, list actual enabler and payoff slot IDs and explain early plays, the resource loop, win condition, interaction, weaknesses, overlap with neighbors and distinction from other pairs. Empty lists must be explained as missing evidence or a support gap. For a pair-scoped review assess that pair; otherwise assess all ten. Partial samples cannot establish whole-set support or absence.
Flavor: check the frozen supernatural premise, concrete prose, varied drawable subjects, color identities, coherent names/art/flavor and accepted player preferences, including exclusions. Fix mismatches without gratuitous gameplay changes.
Power: assess floor, supported ceiling, full costs, timing, removal and answers at the frozen Default/Busted target. Compare factual reference costs and text; do not rely on remembered card rates. Buff weak cards as well as repair dominant ones. Support a combo claim with actual cards and an executable sequence.
The global review and final check receive the complete supplied inventory; inspect interactions and repetition across writing batches. Edit planning must reassess all five dimensions while consolidating findings into a coordinated plan. Final review must inspect current replacements and untouched cards, cite current evidence, and catch regressions. Audit coverage is a record of inspection, not a claim of proven balance.`;
