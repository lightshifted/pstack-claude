# pstack for Claude Code

A port of [pstack](https://github.com/cursor/plugins/tree/main/pstack) by [Lauren Tan (poteto)](https://x.com/poteto), originally written as a Cursor plugin. MIT licensed, same as upstream. All the engineering judgment here is poteto's. This fork changes the platform, not the philosophy.

> there's a growing sense that ai writes too much slop code. i agree. i don't want to ship like a team of twenty slop artists. throughput without quality is not a goal i aspire to. if you want to go fast, go deep first.

**pstack gives you fearless parallelism.** when you can go deep on one agent and trust it to write good, verifiable code, you can truly parallelize with confidence. start multiple agents up with `poteto-mode` and trust that they'll apply rigorous engineering principles to their work.

## install

Clone it and point Claude Code at it as a plugin, or symlink the pieces into your user directory:

```bash
ln -s "$PWD/skills"/* ~/.claude/skills/ && ln -s "$PWD/agents"/* ~/.claude/agents/
```

## get started

Two steps.

1. Run [`/setup-pstack`](./skills/setup-pstack/SKILL.md), pick an effort budget, and confirm which agent runs each role.
2. Use [`/poteto-mode`](./skills/poteto-mode/SKILL.md) whenever you're doing anything that requires rigor.

That's it. The other skills are situational, and the mode skill uses them for you as needed. Out of the box the mode splits work by role: code delegates go to `poteto-code` on Sonnet, the hardest changes and all prose go to `poteto-judge` on Opus, and review panels run three seats on Opus, Fable, and Sonnet.

## usage

Use [`/poteto-mode`](./skills/poteto-mode/SKILL.md) at the start of a task. It reads your request, picks from a set of playbooks, and runs the other skills as the steps need them.

```
/poteto-mode this pr has a subtle bug where the scroll drifts every 750ms even when idle. repro
first, then fix and verify.
```

```
/poteto-mode i'm going to bed. land the stack even if ci flakes. i want everything merged by
morning.
```

It is also sticky. Invoking it registers a `UserPromptSubmit` hook that re-applies the mode on later turns, which is how this port reproduces Cursor's `mode: true` frontmatter. Opt out any time by saying so.

`/poteto-mode` pairs well with Claude Code's built-in `/loop`.

<details>
<summary>the twenty-three playbooks</summary>

| playbook | for |
|---|---|
| [investigation](./skills/poteto-mode/playbooks/investigation.md) | a read-only question. how does x work, why was y built this way, are we sure. |
| [bug fix](./skills/poteto-mode/playbooks/bug-fix.md) | reproduce a defect, root-cause it, and fix with runtime evidence. |
| [perf](./skills/poteto-mode/playbooks/perf-issue.md) | trace a measured slowness and improve it against a baseline. |
| [hillclimb](./skills/poteto-mode/playbooks/hillclimb.md) | sustained, scientific improvement of one metric against a target, looping hypotheses with before/after measurement and one commit per accepted win. |
| [runtime forensics](./skills/poteto-mode/playbooks/runtime-forensics.md) | diagnose a live symptom (leak, idle-cpu spin, glitch) from instrumentation. |
| [trace forensics](./skills/poteto-mode/playbooks/trace-forensics.md) | diagnose a captured profiling artifact (cpuprofile, trace, spindump, heap snapshot). |
| [feature](./skills/poteto-mode/playbooks/feature.md) | new or changed behavior, built from a named data shape. |
| [refactoring](./skills/poteto-mode/playbooks/refactoring.md) | a behavior-preserving change to structure or shape. |
| [prototype](./skills/poteto-mode/playbooks/prototype.md) | a throwaway sketch to make a design or behavioral decision cheaply, or to settle an empirical fork by observing it. |
| [visual parity](./skills/poteto-mode/playbooks/visual-parity.md) | pixel-exact ui equivalence between two implementations. |
| [authoring a skill](./skills/poteto-mode/playbooks/authoring-a-skill.md) | writing or editing a SKILL.md. |
| [eval](./skills/poteto-mode/playbooks/eval.md) | test how a skill or prompt change affects agent behavior, blinded. |
| [babysit](./skills/poteto-mode/playbooks/babysit.md) | drive a pr or a stack to merge-ready: conflicts, review threads, ci. |
| [shipping](./skills/poteto-mode/playbooks/shipping.md) | independently verify a green stack, then land the contiguous verified run bottom-up through github by default or origin when available. |
| [autonomous run](./skills/poteto-mode/playbooks/autonomous-run.md) | drive a long task to completion without stopping. |
| [orchestrate](./skills/poteto-mode/playbooks/orchestrate.md) | a standing project handed to one coordinator chat: multi-day, many stacked prs, fleets of subagents. |
| [autopilot-full](./skills/poteto-mode/playbooks/autopilot-full.md) | run independent prs to merged with one owner per pr and root verification of each merge-ready head. |
| [autopilot-stack](./skills/poteto-mode/playbooks/autopilot-stack.md) | build and verify one linear base-branch stack for the operator to review and land. |
| [session pickup](./skills/poteto-mode/playbooks/session-pickup.md) | resume or take over a prior agent's in-flight work. |
| [pause safely](./skills/poteto-mode/playbooks/pause-safely.md) | suspend in-flight work cleanly so it can be resumed later. |
| [multi-phase plan](./skills/poteto-mode/playbooks/multi-phase-plan.md) | work that spans phases or stacked PRs. |
| [worktree cleanup](./skills/poteto-mode/playbooks/worktree-cleanup.md) | reclaim disk by pruning merged or abandoned worktrees and stale ios simulators, safety-gated. |
| [opening a pr](./skills/poteto-mode/playbooks/opening-a-pr.md) | open a ready pr from small ordered commits with a conventional commits title and a briefing-style body. invoked at the end of every other playbook. |

</details>

## skills

<details>
<summary>all skills</summary>

| skill | use it when |
|---|---|
| [`/poteto-mode`](./skills/poteto-mode/SKILL.md) | default entry point for any non-trivial task. |
| [`/how`](./skills/how/SKILL.md) | you want a walkthrough of how a subsystem works. |
| [`/why`](./skills/why/SKILL.md) | you want to know why something was built this way. discovers available MCPs at run time and queries each evidence category in parallel (source control, issue tracker, long-form docs, real-time chat, infra observability, error tracking, analytics warehouse). |
| [`/recall`](./skills/recall/SKILL.md) | you're starting or resuming work and want your recent context on a topic rebuilt from your own chat history and the shared record, handed back as a tight current-state brief. |
| [`/blast-radius`](./skills/blast-radius/SKILL.md) | you have a small-looking change and want to know what else it could break, with the one fact it's safe because of proven by running code, not asserted. |
| [`/architect`](./skills/architect/SKILL.md) | you're about to write code that crosses a function boundary and want the caller's usage, types, and module shape settled first. |
| [`/arena`](./skills/arena/SKILL.md) | you want N parallel attempts at the same thing, then to grab the best parts of each. |
| [`/swarm`](./skills/swarm/SKILL.md) | you want N parallel workers across different slices or races, then one aggregated report. |
| [`/interrogate`](./skills/interrogate/SKILL.md) | you have a diff and want several different models to try to break it, including a strict code-quality lens. |
| [`/automate-me`](./skills/automate-me/SKILL.md) | you want your own `-mode` skill, drafted from how you've actually worked. |
| [`/setup-pstack`](./skills/setup-pstack/SKILL.md) | you want to pick which agent pstack uses per role, and at what effort. detects your models and writes `~/.claude/pstack-models.md`. |
| [`/reflect`](./skills/reflect/SKILL.md) | a long task landed and you want the recipe captured as a skill edit. |
| [`/teach`](./skills/teach/SKILL.md) | you want to actually understand a change or subsystem, not just have it summarized. runs how + why and weaves one plain explanation, built up diagram by diagram. |
| [`/tdd`](./skills/tdd/SKILL.md) | you're fixing a bug and there's a cheap local test path. write the failing test first, then the fix. |
| [`/no-comments`](./skills/no-comments/SKILL.md) | strip comments before review; spawns Comment Sicko, fixes accepted findings, offers encodings for claimed constraints. |
| [`/typescript-best-practices`](./skills/typescript-best-practices/SKILL.md) | you're reading or editing typescript. grounds the type-system-discipline principle in syntax. |
| [`/figure-it-out`](./skills/figure-it-out/SKILL.md) | no bundled playbook fits. designs a rigorous, auditable playbook for the task. |
| [`/show-me-your-work`](./skills/show-me-your-work/SKILL.md) | you want a reviewable decision trail. logs decisions to a tsv you can commit. |
| [`/create-verification-skill`](./skills/create-verification-skill/SKILL.md) | your project has no scripted way to prove app behavior. generates a project-local verify skill with a feature map, for any language or platform. |
| [`/maintain-verification-skill`](./skills/maintain-verification-skill/SKILL.md) | your verify skill's feature map has drifted from the app. source wave + one live pass, at most one PR of proven corrections. |
| [`/unslop`](./skills/unslop/SKILL.md) | you're cleaning up writing. removes AI tells. |
| [`/bro`](./skills/bro/SKILL.md) | you want the last message restated in plain human language, no jargon. |
| [`/technical-writing`](./skills/technical-writing/SKILL.md) | layered doc standard (Diátaxis + Google developer style + STE + Global English) for docs, RFCs, readmes, PR descriptions, commit messages. |

</details>

## the agent roster

This is the port's main structural change. Upstream pstack passes a model slug on every subagent call. Claude Code sets effort in the agent definition rather than per call, so each role here is a named agent that pins its own model and effort. Skills pass `subagent_type` and omit `model`.

| agent | model | effort | role |
|---|---|---|---|
| [`poteto-agent`](./agents/poteto-agent.md) | opus | high | general delegate, the routing target for `/poteto-mode` |
| [`poteto-code`](./agents/poteto-code.md) | sonnet | high | code delegate for feature, refactoring, bug fix, perf, hillclimb |
| [`poteto-judge`](./agents/poteto-judge.md) | opus | xhigh | hardest changes, prose, judgment calls |
| [`poteto-fable`](./agents/poteto-fable.md) | fable | xhigh | third family, so arena and architect fan out across real diversity |
| [`poteto-explorer`](./agents/poteto-explorer.md) | sonnet | medium | read-only exploration, `why` investigators, swarm lanes |
| [`poteto-explainer`](./agents/poteto-explainer.md) | opus | xhigh | synthesis for `how`, `why`, and `teach` |
| [`poteto-reviewer-a/b/c`](./agents/poteto-reviewer-a.md) | opus / fable / sonnet | xhigh | the three-seat adversarial review panel |
| [`comment-sicko`](./agents/comment-sicko.md) | sonnet | high | read-only comment reviewer, usually reached via `/no-comments` |

Every read-only agent sets `disallowedTools: [Edit, Write, NotebookEdit]` rather than a `tools` allowlist. That matters: an allowlist cannot name the user's MCP servers, and the `why` skill is built entirely on querying them. Withholding the writers keeps MCP access intact.

`/setup-pstack` rewrites the `effort:` lines and writes `~/.claude/pstack-models.md` to remap any role.

## what changed in the port

| upstream (Cursor) | here (Claude Code) |
|---|---|
| `.cursor-plugin/plugin.json` | `.claude-plugin/plugin.json` |
| `Task` tool | `Agent` tool |
| `subagent_type: generalPurpose` + a model slug | a named agent per role |
| `readonly: true` | `disallowedTools: [Edit, Write, NotebookEdit]` on the agent |
| `AskQuestion` | `AskUserQuestion` |
| `environment: "cloud"` | `isolation: "remote"`, or `"worktree"` for concurrent writers |
| `mode: true` + `reminder:` frontmatter | a `UserPromptSubmit` hook in the skill's frontmatter |
| `~/.cursor/rules/pstack-models.mdc` (always-applied) | `~/.claude/pstack-models.md` (read on demand) |
| `~/.cursor/projects/<slug>/agent-transcripts/` | `~/.claude/projects/<slug>/*.jsonl` |
| `/deslop` from `cursor-team-kit` | `/simplify` |
| `control-ui` / `control-cli` from `cursor-team-kit` | Browser pane tools, iOS Simulator tools, or a project-local `verify-*` skill |
| Cursor's built-in `/create-skill` | `skill-creator` |
| Bugbot triage | any review bot, per [`review-bot-triage.md`](./skills/poteto-mode/references/review-bot-triage.md) |
| four-model review panel | three seats, plus a documented [external CLI seat](./skills/interrogate/references/external-reviewer.md) |

**The review panel is the one real capability loss.** Upstream runs Fable, Sol, Grok, and Opus against the same diff, and cross-family disagreement is the signal it's buying. The `Agent` tool spawns Claude models only, so the default panel here is three Claude families, and a fourth Claude seat would inflate apparent agreement rather than add an angle. [`external-reviewer.md`](./skills/interrogate/references/external-reviewer.md) documents how to add a genuinely foreign seat by shelling out to another vendor's CLI.

## not ported

- **`make-bot-ui`.** Built on Cursor webhook routines and its secret-request card. No Claude Code equivalent.
- **The benny automation pack.** Cursor automations plus Slack triage. Claude Code's scheduled tasks could host it, but it would be a rewrite rather than a port.
- **The ten-file `docs/guide`.** Cursor-flavored throughout.

Upstream is wired as the `upstream` git remote, so `git fetch upstream` still pulls poteto's changes.

## principles

Twenty-three short skills, one principle each. `poteto-mode` indexes them inline and reads that index at task start.

<details>
<summary>all twenty-three principles</summary>

| principle | group | rule |
|---|---|---|
| [laziness-protocol](./skills/principle-laziness-protocol/SKILL.md) | core | Bias toward deletion and the smallest change that solves the problem. |
| [foundational-thinking](./skills/principle-foundational-thinking/SKILL.md) | core | Apply before writing logic: choosing core types and data structures, sequencing scaffold-vs-feature work, asking what concurrent actors share. Get the data structures right so downstream code becomes obvious. |
| [redesign-from-first-principles](./skills/principle-redesign-from-first-principles/SKILL.md) | core | Redesign as if the requirement had been a foundational assumption from day one, instead of bolting it on. |
| [attack-the-premise](./skills/principle-attack-the-premise/SKILL.md) | core | Apply when two or more fixes that share one premise have failed the same gate. Take a census of which actors hold the imbalance before the next fix, then question the premise instead of writing another fix that assumes it. |
| [subtract-before-you-add](./skills/principle-subtract-before-you-add/SKILL.md) | core | Remove dead weight, redundant validators, and stub references first, then build on the simpler base. |
| [minimize-reader-load](./skills/principle-minimize-reader-load/SKILL.md) | core | Count layers between question and answer, and hidden state in the reader's head; collapse one-caller wrappers and shrink mutable scope. |
| [outcome-oriented-execution](./skills/principle-outcome-oriented-execution/SKILL.md) | core | Apply during planned rewrites and migrations with explicit phase boundaries. Converge on the target architecture; don't preserve smooth intermediate states with throwaway compatibility code. |
| [experience-first](./skills/principle-experience-first/SKILL.md) | core | Choose user delight over implementation convenience; ship fewer polished features over more rough ones. |
| [exhaust-the-design-space](./skills/principle-exhaust-the-design-space/SKILL.md) | core | Build 2-3 competing prototypes and compare side by side before committing. |
| [build-the-lever](./skills/principle-build-the-lever/SKILL.md) | core | Apply to any non-trivial work, not just bulk work: edits, migrations, analyses, checks. Build the tool that does it or proves it (codemod, script, generator, or a skill your subagents follow) instead of working by hand. The tool is the artifact a reviewer can rerun. |
| [model-the-domain](./skills/principle-model-the-domain/SKILL.md) | architecture | Encode the domain in a structure instead of scattered conditionals. |
| [boundary-discipline](./skills/principle-boundary-discipline/SKILL.md) | architecture | Concentrate guards at system boundaries (CLI, config, network, external APIs); trust internal types and keep business logic in pure functions. |
| [type-system-discipline](./skills/principle-type-system-discipline/SKILL.md) | architecture | Make illegal states unrepresentable, brand semantic primitives, parse external data at boundaries, refuse to lie to the compiler, exhaust variants, derive from authoritative schemas. |
| [make-operations-idempotent](./skills/principle-make-operations-idempotent/SKILL.md) | architecture | Converge to the same end state regardless of partial prior runs. |
| [migrate-callers-then-delete-legacy-apis](./skills/principle-migrate-callers-then-delete-legacy-apis/SKILL.md) | architecture | Migrate callers and delete the old API in the same wave instead of preserving compatibility layers. |
| [separate-before-serializing-shared-state](./skills/principle-separate-before-serializing-shared-state/SKILL.md) | architecture | Eliminate the sharing first; serialize structurally only when one shared writer is a real invariant. |
| [prove-it-works](./skills/principle-prove-it-works/SKILL.md) | verification | Apply after completing a task, before declaring done. Verify against the real artifact (run the feature, read the actual value, inspect the diff), not a proxy, self-report, or 'it compiles.'. |
| [fix-root-causes](./skills/principle-fix-root-causes/SKILL.md) | verification | Trace each symptom to its root cause and fix it there; reproduce first, ask why until you reach it, resist nil-check guards that silence crashes. |
| [sequence-verifiable-units](./skills/principle-sequence-verifiable-units/SKILL.md) | verification | Apply to multi-step work (sweeps, migrations, runs of similar edits) and to how you stack commits and PRs. Break work into small units that each end in a verifiable state, check each before the next, and order delivery so the sequence proves itself to a reviewer. |
| [test-behavior-not-implementation](./skills/principle-test-behavior-not-implementation/SKILL.md) | verification | Apply when you write, change, or keep a test. Call the code the way its users do and assert the result they observe against a literal expected value. If the test would still pass when every imported function returns undefined, rewrite the assertion or delete the test. |
| [guard-the-context-window](./skills/principle-guard-the-context-window/SKILL.md) | delegation | Route bulk to subagents; keep summaries in the main thread, not raw payloads. |
| [never-block-on-the-human](./skills/principle-never-block-on-the-human/SKILL.md) | delegation | Proceed, present the result, let the human course-correct after the fact; reserve confirmation for irreversible actions. |
| [encode-lessons-in-structure](./skills/principle-encode-lessons-in-structure/SKILL.md) | meta | Encode the rule as a lint, metadata flag, runtime check, or script instead of more text. |

</details>

## make it yours

`poteto-mode` is poteto's style. You may not want exactly that. Type [`/automate-me`](./skills/automate-me/SKILL.md). It mines your recent transcripts, drafts a `<your-name>-mode` skill from how you've actually worked, and routes through pstack underneath.

## license

MIT, inherited from [cursor/plugins](https://github.com/cursor/plugins). Copyright (c) 2026 Lauren Tan. See [LICENSE](./LICENSE).
