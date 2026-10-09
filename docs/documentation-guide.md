# Documentation guide for agent-driven development

How to document this repo so coding agents (and future you) can work in it with little supervision. Based on a survey of how agent-first teams ("software factories") and agent harnesses handle documentation as of October 2026. Sources are listed at the end, with a note on which claims I could only verify second-hand.

The guide has four parts: what the research found, the rules that follow from it, the documents to write, and a concrete plan for this repo.

## 1. What the research found

**The repo is the only memory an agent has.** OpenAI's team shipped an internal product with zero hand-written lines and summarised the lesson as "what Codex cannot see does not exist": decisions made in chat, in someone's head, or in a tracker have to land in the repo as versioned markdown or they do not count. Anthropic's long-running harness reaches the same conclusion from the other side: every session starts with no memory, so each one must leave artifacts the next can pick up from.

**One big instruction file fails.** OpenAI first tried a single large `AGENTS.md` and abandoned it for a roughly 100-line file that works as a table of contents into `docs/`. HumanLayer keeps its root file under 60 lines and treats 300 as a ceiling, on the reasoning that instruction-following degrades as the instruction count grows. Anthropic's guidance for `CLAUDE.md` is the same shape: for each line ask whether removing it would cause a mistake, and cut it if not.

**Overviews cost money and do not help; specific instructions do.** An ETH Zurich study (Gloaguen et al., February 2026) tested agents with and without context files. Context files did not generally improve task success and raised inference cost by more than 20%. Agents did follow the instructions in them, but repository overviews, the most commonly recommended content, were not useful. Their recommendation: limit the file to non-standard practices specific to the project.

**A pointer the agent always sees beats a document it has to decide to open.** Vercel found that a compressed 8 KB docs index placed in `AGENTS.md` passed 100% of their evals, while the same knowledge packaged as a skill topped out at 79%; in 56% of cases the skill was never invoked. So the root file should stay small, but it must contain the index.

**Mechanical checks beat prose.** OpenAI enforces architecture with custom linters and structural tests whose error messages tell the agent how to fix the violation. Böckeler's framing on martinfowler.com is useful here: documentation is a *guide* (steers before the agent acts), tests and linters are *sensors* (correct after). You need both, and anything a sensor can enforce should not be left to a guide.

**Plans and progress are documents too.** OpenAI's ExecPlan pattern is a self-contained living plan with a progress list, a decision log, and a "surprises" section, updated at every stopping point; it has carried single sessions for seven hours. Anthropic's harness uses a feature list with a pass/fail flag per feature, a progress log, an `init.sh`, and git history. The feature list is JSON because agents were less likely to rewrite it inappropriately than markdown, and agents are only allowed to flip the pass flag.

**Specs come before code, and acceptance is observable behaviour.** Kiro and GitHub Spec Kit converge on the same three steps: requirements, then design, then tasks. StrongDM goes furthest: humans write specs and scenarios, agents write everything else, and nobody reviews the code. Their scenarios are end-to-end user stories kept where the coding agent cannot see them, like a holdout set, so the agent cannot game them.

**Docs rot, and stale docs are worse than none.** OpenAI runs background agents that scan for stale documentation and open cleanup PRs. Outside OpenAI the common pattern is a CI check that fails when mapped code changes without a doc update. An agent treats a stale doc as true.

**Newer models need fewer rules.** Anthropic reports removing over 80% of Claude Code's system prompt for current models with no loss, and recommends stating intent and letting the model judge, in place of absolute rules and emphatic warnings.

## 2. Rules

1. **If it matters, it is in the repo.** A decision that lives only in a chat or in your head does not exist for the agent. Write it down in the same change that acts on it.
2. **The root file is a map.** `AGENTS.md` holds commands, the few rules that differ from defaults, and a one-line-per-doc index. Target 60 to 100 lines. No architecture prose, no directory listing, nothing the agent can learn by reading the code.
3. **Every line in the root file earns its place.** Add a line when an agent makes a mistake that the line would have prevented. Remove a line when you cannot name the mistake it prevents.
4. **One fact, one home.** Each fact lives in exactly one document; everything else links to it. Duplicates drift apart and the agent cannot tell which is current.
5. **Separate what is true from how you got there.** Reference docs describe the system as it is now, in present tense. The reasoning, dead ends, and reversals go in a decision record. Never leave a superseded approach in a reference doc.
6. **Say why.** A rule with its reason lets the agent handle the case you did not foresee. A bare rule gets applied rigidly or ignored.
7. **Prefer a check to a sentence.** If a rule can be a lint rule, type, test, or hook, make it one, and write the error message as the fix instruction. Keep prose for what cannot be checked.
8. **Write the spec before the code.** For any feature bigger than a small fix: what it does, how you will know it works, what is out of scope. Acceptance criteria are things you can observe by running the app, not properties of the code.
9. **Multi-session work gets a living plan.** Self-contained, with progress, decisions, and surprises updated at each stopping point, so a fresh session can resume from the file alone.
10. **Docs change in the same commit as the code.** A change that makes a doc false is not finished until the doc is fixed.
11. **Delete stale docs.** Git keeps the history. A wrong doc in the tree is actively harmful.
12. **Do not let an agent generate the root file and walk away.** Auto-generated context files were the worst-performing case in the ETH study. Generated drafts are fine as a starting point for editing down.

## 3. Documents to write

| Document | What it holds | Updated when |
|---|---|---|
| `AGENTS.md` | Commands, non-default rules, index of `docs/` | An agent makes a preventable mistake; a doc is added or removed |
| `CLAUDE.md` | One line, `@AGENTS.md`, so Claude Code loads the same file as other agents | Never |
| `README.md` | What the project is and how to run it, for humans | Setup changes |
| `docs/architecture.md` | The few structural facts that are not obvious from the tree: where state lives, what may talk to what, trust boundaries | A boundary changes |
| `docs/specs/<feature>.md` | Current behaviour of one feature: what it does, data shapes, invariants, acceptance criteria | The feature's behaviour changes |
| `docs/decisions/NNNN-<slug>.md` | One decision: context, options considered, choice, consequences. Append-only; supersede, do not edit | A non-obvious choice is made or reversed |
| `docs/plans/active/<slug>.md` | Living plan for in-flight multi-session work | Every stopping point |
| `docs/plans/completed/` | Finished plans, kept for the decision log and retrospective | A plan finishes |
| `docs/backlog.md` | Known bugs, debt, and unbuilt features, each with enough context to start cold | Something is found or finished |
| `docs/references/` | Vendored excerpts of third-party docs the agent keeps getting wrong | A dependency is upgraded |

Larger teams add more: OpenAI's knowledge base also has quality scores per domain, a core-beliefs document, product-sense and reliability docs, and generated schema dumps. None of that is worth maintaining on a one-person project. The same goes for StrongDM-style holdout scenarios and digital twins of third-party services.

### `AGENTS.md` skeleton

```md
# draft-gpt

AI-generated Magic-style card drafting and play. Remix + Firebase + OpenAI.

## Commands
- Install: `bun install`
- Dev server: `bun run dev`
- Tests: `bun test`
- Typecheck: `bun run typecheck`

## Rules
- <non-default rule>. <why>.

## Where to look
- Architecture and trust boundaries: docs/architecture.md
- Drafting and pack passing: docs/specs/drafting.md
- ...

## Working here
- Features bigger than a small fix start with a spec in docs/specs/.
- Work that spans sessions gets a plan in docs/plans/active/.
- A change that makes a doc false updates the doc in the same commit.
```

### Plan skeleton

Adapted from OpenAI's ExecPlan. The four middle sections are the living part.

```md
# <Outcome, stated as what a user can do afterwards>

## Purpose
## Context and orientation      (enough for a reader who has only this file and the tree)
## Progress                     (dated checkboxes; the only checklist in the file)
## Surprises and discoveries
## Decision log                 (decision, reason, date)
## Outcomes and retrospective
## Plan of work                 (milestones: goal, work, result, proof)
## Validation and acceptance    (commands to run and what you should observe)
## Recovery                     (how to retry or roll back a half-done step)
```

### Decision record skeleton

```md
# NNNN: <decision in one line>
Status: accepted | superseded by NNNN
Date: YYYY-MM-DD

## Context
## Options considered
## Decision
## Consequences
```

## 4. Applying this to draft-gpt

What was here on 2026-10-08, before the Convex rewrite (items 1 to 4 below have since been done):

- **`README.md` is the untouched Remix template.** It says nothing about the project and tells the reader to use `npm`, while the repo uses Bun (`bun.lockb`, tests import `bun:test`). An agent following it will run the wrong commands.
- **There is no `AGENTS.md` or `CLAUDE.md`,** and `package.json` has no `test` or `lint` script, so nothing tells an agent how to verify its work.
- **`.notes/` is a design journal.** It is good material, but it mixes current truth with abandoned approaches. `security.md` opens with a client-only design and reverses it two lines later; `backend-design.md` describes sockets, then the Firestore snapshot design that was actually built; `cards.md` records two failed scaling approaches before the third. A human reads these as a story. An agent may act on the first paragraph.
- **`.notes/checklist.md` is the backlog,** with open items that carry no context ("Fix lobby disconnect bug", "Figure out weird setting sync issue").
- **`.notes/firestore-rules.md` states an intent that is not yet enforced** (the checklist still lists "Lockdown Firestore security rules" as open). That is the kind of gap an agent should be told about explicitly.

Suggested order of work:

1. **Rewrite `README.md`** with a one-paragraph description, the Bun commands, and the required environment variables.
2. **Add `test`, `lint`, and `typecheck` scripts** so there is one obvious way to verify a change. This does more for agent reliability than any document.
3. **Write `AGENTS.md`** from the skeleton above and add `CLAUDE.md` containing `@AGENTS.md`. Start with commands and the index only; add rules as mistakes happen.
4. **Write `docs/architecture.md`.** One page: Firestore snapshots are the source of game and lobby state; which writes happen from the client SDK and which go through Remix actions with the admin SDK; how the session cookie is verified; that Firestore rules are not yet locked down.
5. **Split each `.notes/` file in two.** The current-state half becomes `docs/specs/<feature>.md` in present tense (`drafting`, `card-schema`, `counters`, `game-lobbies`, `setting-creation`, `multi-select`). The reasoning half becomes a decision record: heartbeat over RTDB presence, snapshots over sockets, the `scale` prop over `html2canvas`, admin SDK in actions over client-only writes.
6. **Turn `checklist.md` into `docs/backlog.md`.** Drop the completed items and give each open one a sentence or two on symptoms and where to look.
7. **Delete `.notes/`** once its content has moved. Git keeps the originals.

After that, the ongoing habits are rules 3, 8, 9, and 10: add a root-file line when an agent trips, spec before building, a plan for anything multi-session, and docs in the same commit as code.

## Sources

Read directly:

- Anthropic, [Effective harnesses for long-running agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)
- Anthropic, [The new rules of context engineering for Claude 5 generation models](https://claude.com/blog/the-new-rules-of-context-engineering-for-claude-5-generation-models)
- OpenAI Cookbook, [Using PLANS.md for multi-hour problem solving](https://developers.openai.com/cookbook/articles/codex_exec_plans)
- Gloaguen et al., [Evaluating AGENTS.md: Are Repository-Level Context Files Helpful for Coding Agents?](https://arxiv.org/abs/2602.11988) (abstract only)
- Simon Willison, [How StrongDM's AI team build serious software without even looking at the code](https://simonwillison.net/2026/Feb/7/software-factory/)
- Birgitta Böckeler, [Harness engineering for coding agent users](https://martinfowler.com/articles/harness-engineering.html)
- Charlie Guo, [The emerging "harness engineering" playbook](https://www.ignorance.ai/p/the-emerging-harness-engineering)
- [Harness engineering survey](https://yage.ai/share/harness-engineering-survey-en-20260312.html)

Verified only through search summaries or secondary write-ups:

- OpenAI, [Harness engineering: leveraging Codex in an agent-first world](https://openai.com/index/harness-engineering/). The page refused automated fetches, so the 100-line figure, the `docs/` contents, and the doc-gardening agents come from the survey and playbook above.
- Vercel, [AGENTS.md outperforms skills in our agent evals](https://vercel.com/blog/agents-md-outperforms-skills-in-our-agent-evals)
- HumanLayer, "Writing a good CLAUDE.md" (the 60 and 300 line figures)
- Kiro and GitHub Spec Kit workflow descriptions, via [Spec Kit vs Kiro](https://codemyspec.com/blog/spec-kit-vs-kiro)
- Anthropic's "would removing this cause Claude to make mistakes" test for `CLAUDE.md`, from the Claude Code best-practices docs
