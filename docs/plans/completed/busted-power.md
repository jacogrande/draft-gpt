# Select the draft's power level

The host can choose Default (the current Modern Horizons target) or Busted before a draft starts. Changing the choice clears readiness so everyone can acknowledge it. The choice is frozen on the set run and reaches world planning, slots, writing, review, edits and retries. Existing lobbies/runs without a choice retain Default.

Busted uses a separate, versioned pool of 1,000 distinct real cards, including the Power Nine, current/historical Vintage Cube cards and constructed staples. There is no objective all-time top 1,000: record the sources and deterministic inclusion method, preserve actual printings and identify unsupported reference layouts. Retrieve bounded role/cost/color comparisons rather than sending all 1,000 cards per request. Do not import Default's too-strong verdicts into Busted.

Implementation and acceptance:

- Public mutation tests: host-only, open-only, synchronized choice, readiness reset, old-record default.
- Generation integration tests: frozen choice in all stages, repair/retry preservation, Busted references and policy, Default compatibility.
- Reference checks: exactly 1,000 distinct Oracle identities, all nine Power Nine cards, source/printing evidence, bounded retrieval with a target for every slot.
- Shared prompt and preview alignment, including inexpensive/zero-mana slot opportunities for Busted.
- UI: accessible two-option control, member visibility, frozen label after start, useful error handling.
- Run tests, typecheck, lint and build; use the browser-testing skill with two fake-service sessions. No production deployment or paid generation.

Status: completed locally on 2026-10-20. Prompt 10, references 3, profile 3. The existing Default target/catalog/curve remain; Busted has its own policy, curve and reference retrieval. The 1,000-card pool was selected from 1,058 unique nonbasic candidates, including all Power Nine Alpha printings and the current 540-card MTGO Vintage Cube. 916 supported cards are eligible for direct retrieval. Source methodology and limitations live in research chapter 16.

Validation: all 131 workspace tests, typecheck, lint and build pass. The build retains existing font-path and React Router migration warnings. New public tests cover authorization, readiness reset, old-record defaults, frozen power through provider failure/retry, malformed brief repair, partial batches and targeted revision. Reference tests cover distinct identities, provenance, Power Nine printings, deterministic variation, payload bounds and complete slot coverage.

Browser validation followed `.claude/skills/browser-testing/SKILL.md` with fake services. Sessions `busted-ana` / `busted-ben` signed in as `BustedAna20` / `BustedBen20`. Both saw Default initially. After both readied, the host selected Busted; both saw zero ready players, the guest controls remained disabled, and refresh preserved Busted. Both then readied and received fifteen-card packs; the Busted label remained visible and browser errors were empty. The lobby was `k570eecnzscm2fd32rxg2y5cyd8gny5q`. Screenshots were inspected and saved at `.artifacts/busted-references/lobby-toggle.png` and `draft.png`. The stack and browser sessions were stopped.

No paid generation or production deployment. Real card quality remains unmeasured for Busted; a new pack comparison/playtest is separate validation. Prior mana-shortcut changes remain outside this task.
