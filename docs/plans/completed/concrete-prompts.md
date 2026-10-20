# Prompt revision: concrete settings and useful cards

Implemented 2026-10-15 after feedback on the first Glasswake pack. Research and house style: [chapter 9](../../research/limited-set-design/09-concrete-writing-and-power.md). Runtime behavior: [set generation](../../specs/set-generation.md#prompt-and-power-revision-2026-10-15).

The change replaces abstract worldbuilding with physical descriptions and subtext, aligns generation and review on a stronger power floor, and replaces the arbitrary mana cycle with role-specific bands. Prompt 4, rubric 2, profile 2. Frozen cards and the original illustrated preview remain historical artifacts.

The first live diagnostic used the old abstract seed deliberately. Luna produced a setting of stone quays, timber rooms, sledges, cages and contested roads. Its new reviewer flagged all eleven known weak designs and none of four controls. This is an in-sample diagnostic, not a measured general false-positive or false-negative rate. Generated replacements improved several effects but left weak setup cards. The reviewer also misread a land-search-plus-extra-land-play interaction, and a card required unsupported colorless mana. The reference guidance and casting-cost validator now address those failures.

Artifacts: `.artifacts/prompt-pilot-v4/comparison.json` and a further editorial probe in `.artifacts/prompt-pilot-v4-revised/`. The probe holds the original mana/type contracts fixed, separating prompting from the new curve. Neither sample is a complete set or a legal collated pack. Use the preview CLI in a new output directory for a complete future candidate.

Verification: 110 tests pass, including common-curve availability, valid cost bands, unsupported dedicated colorless costs, partial repair, shared-set drafting and existing legacy behavior. Typecheck and lint pass. Build also passes with the existing Vite/Remix deprecation and missing-font warnings.

The second probe generated stronger threats and engines and ran an edit pass, at about $0.0151 reported text usage. Its final reviewer missed a weak five-mana artifact and a two-mana cantrip that was actually card disadvantage. The rubric now explains both rates and card accounting explicitly. A focused follow-up ($0.00109) flagged both misses and left two stronger controls alone. The output artifacts remain unmodified evidence of those misses; no full-set readiness is claimed.

Browser verification used PromptAna and PromptBen on the fake-service stack: both received fifteen-card packs, the updated physical setting description and all ten archetypes were readable, and both could pick and pass cards. No page errors. Screenshot: `.artifacts/screenshot-1792090233756.png`. The local stack was stopped afterward. These are rendering/flow checks; the separate real-model probes provide the prompt-quality evidence.
