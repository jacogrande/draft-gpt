# World directions and literal prose

Date: 2026-10-20. Status: implemented locally, probed and selected by the user for default world and card creation. Broader quality calibration and playtesting remain open. Not deployed.

The user rejected both prompt-8 modes as repetitive and preferred the fantasy baseline's handling of abstract metaphor. The historical experiment therefore does not support retaining the all-three recipe as a successful creativity policy.

## Diagnosis and change

The shared prompt required extraordinary terrain and supplied examples involving ice, glass, mountains and buried giants. The seed pool supplied completed fantasy scenarios from related imagery, sampled with replacement; three of five evaluated seeds reused glacier/root terrain and a relic-keeper perspective. These are plausible anchoring sources, not separately established causal effects. OpenAI's [prompt guidance](https://developers.openai.com/api/docs/guides/prompt-engineering) explains that examples steer output patterns and recommends diverse examples and evaluation. Removing these particular examples is our task-specific hypothesis, not a vendor guarantee.

Prompt 9 removes the lore examples, persona layer and terrain-first requirement. It requires literal premise, description and conflict, observable magical causes/costs, and short complete premise sentences. It preserves concrete emotional subtext through actions and physical details. Card flavor may still use a precise concrete-to-concrete comparison. Writers/reviewers ask for distinct subject families and actions within a world instead of repeating a material or name stem, and for distinct gameplay loops across pairs.

The replacement allocator selects setting focus, conflict structure, magic access and visual emphasis from broad categories. It prefers the least-used category values among the last twelve app runs, with seeded tie breaking. These are design questions, not completed settings. The result is saved in the run and brief task and survives repairs. Only system-authored category labels contribute to recent-use counts; no other lobby's ideas, names, lore or cards are passed to the model. This reduces repeated category assignments, not necessarily repeated semantic premises. The [set-generation spec](../../specs/set-generation.md#current-world-diversity-and-literal-prose-policy-prompt-9) owns the current contract.

## Five-world probe

`scripts/evaluate-world-directions.ts` generated five full world/color/archetype briefs from empty player input with the same Luna low-effort settings. It uses the same allocator as the app, starting with empty recent history. Five seeds were fixed before generation. All five succeeded on the first attempt; no outputs were rejected for taste. **Five requests cost an estimated $0.0105938.** No cards, art, gameplay reviews or playtests were generated.

| World | Defining mechanism |
|---|---|
| The Weightways | Trained beings redirect local gravity using rods and marked floors. |
| The Joined Marches | Operators alter their bodies to use devices that change reproduction. |
| The Shared Inheritance | Groups transfer physical traits between bodies and objects. |
| The Fired Accord | Clay constructs obey commands until their maker's marks wear away. |
| The Borrowed Shapes | Different species exchange physical traits through bargains. |

These cover more kinds of magical activity than the earlier repeated suspended-landscape descriptions, but this is a qualitative observation from five outputs with no concurrent baseline. It does **not** establish a reliable creativity improvement.

Remaining problems are preserved in the HTML and `observations.json`:

- Three worlds feature a ruling Court: The Weightways, The Shared Inheritance and The Borrowed Shapes.
- The Shared Inheritance and The Borrowed Shapes both center transferred bodily traits despite different structural categories.
- All five blue-red plans remain tied to casting spells. Creative rotation has not demonstrated mechanical diversity.
- The Shared Inheritance says bridge crews lend balance to ropes, without clearly specifying the physical change. Literal-prose quality still needs human inspection.

These findings show why category rotation cannot substitute for semantic comparison and why an accepted schema is not a quality verdict. No automatic pass or statistical winner is assigned. A future iteration should evaluate premise/mechanism overlap directly and separately test archetype variety; it must not silently reroll these five examples or claim the current policy guarantees uniqueness.

## Artifacts and validation

```sh
bun --env-file=.env.local scripts/evaluate-world-directions.ts .artifacts/world-directions-v9
python3 scripts/render-world-directions.py .artifacts/world-directions-v9/worlds.json
```

The artifact directory contains the frozen config/source hashes, directions, exact calls, usage ledger, five world files, `worlds.json`, inspection notes and `index.html`. `report-path.txt` points to `/tmp/draftgpt-world-directions-k2i_hkrl.html`, opened in Vivaldi. The standalone report includes side-by-side world summaries, all 25 color identities and 50 archetypes, complete mechanics/creative guides and exportable local notes. Its 108,158 bytes passed lightweight content, balanced-markup, unique-ID, anchor, JavaScript syntax and source-hash checks. No remote assets are required; report browser visual testing was not performed.

All 124 tests, typechecking and lint pass. Integration tests drive public starts to verify persisted directions, repair stability, category rotation across lobbies and private query boundaries. A separate two-player browser smoke test using fake services showed the shared setting and dealt fifteen cards to both players, with no browser errors. The inspected app screenshot is `.artifacts/world-directions-v9/app-smoke.png`; the stack was stopped afterward. The fake fixture validates the flow, not real-world creativity or card power.
