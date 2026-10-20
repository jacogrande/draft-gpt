# Broader premises, literal prose

User feedback (2026-10-20): both prompt-8 modes converge on similar worlds; the fantasy baseline handles abstract metaphor better. The selected all-three recipe is rejected as a sufficient creativity policy.

Diagnosis: both modes share illustrative lore and an extraordinary-terrain requirement; the recipe samples a small pool of closely related scenes with replacement. These are plausible sources of anchoring, not experimentally isolated causes. More decorated nouns do not establish different worlds.

Implementation:
- Remove the scene examples and persona instruction. Require literal world descriptions, complete sentences and observable magical causes/costs.
- Replace preset stories with broad design dimensions: setting focus, conflict structure, access to magic, visual emphasis. Each dimension describes a design problem, not lore to copy.
- For new app runs, prefer the least-used dimension values among the last twelve runs. Save the resulting direction in the run and brief task; retries do not reroll. Allocation uses only system-owned categories, never another lobby's ideas, names or lore.
- Require distinct subject families and magical actions inside a world, and distinct gameplay engines across pairs. Keep shared support without requiring every subject to repeat the signature material or name stem.
- Retain broad gameplay jobs and the existing power/review policy. Do not attribute prose failures to slot planning without evidence.
- Use a five-world-only real-provider probe, with frozen inputs and no card/art generation. Preserve every result. The user subsequently selected the policy for world and card creation; semantic uniqueness remains unproven.

Acceptance:
- Public start/retry integration tests prove direction persistence, recent-use rotation and private query boundaries.
- Existing defaults continue to generate a complete fake set and packs.
- The probe saves full world/color/archetype output, exact prompts, failures and costs. Inspect prose and premise differences directly, not names or lexical overlap alone.
- A readable offline report exposes the five worlds, directions and limitations.

No temperature/model change, unbounded rerolls, global sharing of private lore, or production deployment.


Completed locally: prompt 9, saved recent-use structural allocation, preview alignment, public integration tests, five real world briefs and an offline report. Five first-attempt requests cost $0.0105938; no cards/art. All 124 tests, typecheck and lint pass, plus a two-player fake-service browser smoke check. On 2026-10-20 the user selected this policy for default world and card creation and requested a pipeline commit. Research chapter 15 records remaining repeated Courts, trait-transfer premises, spell-based blue-red plans and unclear wording. Broader quality calibration and playtesting remain open; the probe does not prove semantic uniqueness. No deployment.
