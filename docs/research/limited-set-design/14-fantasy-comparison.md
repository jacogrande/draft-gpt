# Fantasy baseline versus all three

Date: 2026-10-20. Status: complete historical prompt-8 evaluation. Subsequent user feedback rejected both modes as repetitive and preferred the baseline’s literal prose; [prompt 9](15-world-directions.md) replaces the recipe/persona policy. Ten worlds, 150 cards and ten independent sample reviews; no art or gameplay editing.

The user requested five fresh world generations per mode, with one fifteen-card preview pack for each. The comparison uses the **current fantasy writing policy on both sides**. Baseline disables seeded ingredients and discovery perspective and restores the earlier slot-stage instruction. All three uses the actual selected prompt-8 application policy: saved fantastic ingredients, a discovery perspective and broad slot jobs. This is an ablation of the combined interventions, not a comparison against the rejected mundane prompt.

All ten calls begin with empty player input and the same complete-world questionnaire, five colors, ten archetypes, fifteen fixed slot contracts and Modern Horizons target. Each pack-shaped sample has ten commons, four uncommons and one rare. These are planned-world previews, not boosters collated from complete generated inventories. Luna uses low reasoning for brief/slots/writing and medium reasoning for one independent sample review. There is no art, Decisions screening, gameplay editing, temperature/top_p change or API sampling seed.

Five creative seeds and the interleaved arm order are fixed before any real request. Sampling uses the application's policy without rejecting repeated seed ingredients. Each repeat gets a fresh stochastic blueprint; presentation pairs are not matching worlds. Role-dependent reference retrieval can vary with the planned slots. Fifteen-card batches use shared structural repair, preserving accepted cards and names, with up to two retries. Failed attempts remain in the audit trail. Review sees only the frozen world, slots and cards, without treatment labels or seed metadata. Model findings are unverified observations.

The runner freezes source hashes, config and expanded seeds in `.artifacts/fantasy-eval-v2/config.json`; it refuses changed inputs on resume. Exact request instructions, stage overrides, results, timing and usage are saved for every call. A $3 estimated ceiling and four concurrent workers bound the run. Transport failures retain conservative reservations; the usage estimate is not invoice reconciliation.

## Reproduction

```sh
bun --env-file=.env.local scripts/evaluate-fantasy.ts .artifacts/fantasy-eval-v2
python3 scripts/fantasy-eval/render.py .artifacts/fantasy-eval-v2/comparison.json
```

The report gives a world-premise overview, arbitrary side-by-side world/card comparisons, complete blueprint details, all cards and token definitions, optional hidden mode labels, collapsed model observations and local notes export. It preserves original text, including defects. Diagnostics aggregate all ten within-mode pairs of the five samples: 150 matched-slot comparisons per mode. Exact signatures normalize the card's own name; rules-word Jaccard overlap is lexical and cannot rank creativity or gameplay. Five empty-input repeats do not establish a statistically reliable winner or full-set balance.

The evaluation design follows [OpenAI's guidance](https://developers.openai.com/api/docs/guides/evaluation-best-practices) on explicit criteria, controlled comparisons and human calibration of model judgments. The actual prompts, schema checks and user preference are the task-specific criteria; no numerical creativity scores are fabricated.

## Validation

Fake-service coverage verifies baseline isolation, unchanged all-three requests, exact override auditing, partial-card repair, name reservations and checkpoint reuse. All 123 tests, typechecking and lint pass, including explicit lint of the new scripts. Production application defaults are unchanged by this eval.


## Results

All **150/150 card slots** were accepted on their first writing attempt. One all-three brief needed a structural repair for invalid mechanic vocabulary; it reused the saved creative inputs. There were **41 recorded requests**: 11 briefs, 10 slot plans, 10 writing batches and 10 reviews. No pending charges, unfilled slots or within-sample duplicate-name issues remain. The estimated text cost is **$0.1035044**, using recorded usage and repository pricing estimates, not billing reconciliation.

| Mode | Worlds | Exact repeats across 150 matched-slot comparisons | Mean rules-word overlap | Cards flagged major/blocker by reviewer, repeats 1–5 |
|---|---:|---:|---:|---|
| Fantasy baseline | 5 | 2/150 | 39.6% | 4 / 0 / 1 / 1 / 2 |
| All three | 5 | 5/150 | 44.9% | 4 / 1 / 1 / 1 / 3 |

These are descriptive diagnostics, not a winner declaration. All-three did not reduce these lexical repetition measures in this small run. The ten comparisons within each mode share samples, so they are not ten independent experimental replicates. Review findings remain unverified; an empty issue list does not establish quality or balance.

The baseline worlds are **The Rootwake**, **The Crown of Falling Rivers**, **The Rootfall**, **The Folded Meridian**, and **The Upspinned Vale**. All-three produced **The Rootglass Reach**, **Rootfall**, **The Unscaled Deep**, **Rootwake**, and **The Hanging Sea**. World names and imagery still converge across modes. Three of the five predeclared all-three seeds select glacier-and-root terrain and a relic-keeper perspective; those draws were preserved rather than rerolled to manufacture variety. Five of ten blue-red signposts mention a second-spell condition.

One concrete prose defect remains visible: Rootfall's premise ends with “each restoration makes a:”. Its JSON passes the schema, but the sentence is unfinished. The report retains this text. A review also flags The Rootglass Reach's Shardwing Diver for an enters ability targeting a creature blocking or blocked by it, a restriction normally unavailable when it enters. Neither structural acceptance nor variety controls establish that a card is functional.

The standalone report is `/tmp/draftgpt-fantasy-comparison-y0htvrx0.html`, copied to `.artifacts/fantasy-eval-v2/index.html`; `report-path.txt` records its path. The 406,576-byte HTML passed lightweight checks for all 150 unique card records, ten worlds and reviews, balanced markup, unique IDs, valid local anchors, JavaScript syntax, matching frozen source hashes and no required remote assets. This is document validation, not browser visual testing. The report was opened in Vivaldi for human review.
