---
name: setup-pstack
description: Configure which agent pstack uses per role and at what effort. Writes ~/.claude/pstack-models.md, which every pstack skill reads and which overrides the built-in defaults. Use for /setup-pstack, "configure pstack models", "pstack budget", or changing pstack's model choices.
---

# Setup pstack

Write `~/.claude/pstack-models.md`, the per-role override file every pstack skill reads at task start.

pstack routes work by naming a `subagent_type`, not a model. Each agent definition in the plugin's `agents/` directory pins one model and one effort, so a role's identity and its cost both live in one file. This skill changes which agent a role uses, and optionally rewrites the effort those agents run at.

## Steps

### 1. Detect what is available

The `Agent` tool's `model` parameter is the dependable source. Its enum is the set of models you can spawn. As of this writing that is `opus`, `sonnet`, `haiku`, and `fable`. Read it from your own tool schema rather than assuming, since the enum changes as models ship.

Then read the plugin's `agents/` directory to list the agents actually installed and what each one is pinned to. Those names are the values a role can take. Never write an agent name you have not confirmed exists, and never write a model outside the detected enum.

The aliases `inherit-parent` and `auto` are always valid. Both mean the role runs on the parent chat model, which is how a user on a single model stays on it.

### 2. Load current state

If `~/.claude/pstack-models.md` exists, read it. Treat its `budget` line and its role values as the current choices. Otherwise start from the defaults in step 5.

### 3. Budget, map, and confirm

**(a) Ask for an effort budget.** Prefer `AskUserQuestion` over free text. Offer these four options with these exact labels, and name the current budget when the file records one.

- `unlimited — keep max`
- `large — xhigh reasoning`
- `medium — high reasoning`
- `small — medium reasoning`

**(b) Apply it.** The budget sets the `effort:` line in the plugin's agent definitions, on the ladder `max` > `xhigh` > `high` > `medium` > `low`. `unlimited` leaves every agent as shipped. `large`, `medium`, and `small` cap every agent's effort at `xhigh`, `high`, or `medium`, lowering anything above the cap and leaving anything already below it alone.

Effort cannot be set per `Agent` call, so this step edits files. Rewrite only the `effort:` line of each agent in the pstack install, and say which files you changed. If the install is read-only, say so and stop rather than reporting a budget you did not apply.

**(c) Show the roles and confirm.** Show every role with its agent and that agent's model and effort. Ask whether to accept as-is or change specific roles, offering the installed agent names plus `inherit-parent` and `auto`. Prefer `AskUserQuestion` over free text.

Panel roles (`arena runners`, `architect runners`, `interrogate reviewers`) take a list, and one subagent runs per entry, so the list length sets the fan-out. `arena cross-judge pool` is also a list, but Arena picks one entry from it whose family differs from the parent's. `swarm workers` is the default for every lane unless a race assigns a different agent per arm.

Flag it when a panel's entries collapse onto one model. A three-seat panel running three seats on `opus` is a panel in name only, and the user should know that before they accept it.

### 4. Validate

Every agent name written must exist in the install. Every model written must be in the detected enum. `inherit-parent` and `auto` always pass. If a chosen value fails, stop and ask again rather than writing a file that silently falls back.

### 5. Write the file

Overwrite `~/.claude/pstack-models.md` whole, so re-runs stay idempotent. Shape:

```
# pstack per-role configuration. Overrides the skill defaults.
# One line per role. Delete a line to fall back to the default.
# Values are agent names from the pstack install, or `inherit-parent` / `auto`
# to run that role on the parent chat model (spawn `general-purpose`, omit `model`).
# Alias entries in a panel list still count toward its fan-out.
# budget: unlimited (max)

feature, refactoring: poteto-code
bug-fix: poteto-code
perf-issue: poteto-code
hillclimb: poteto-code
judgment and prose: poteto-judge
hardest tasks: poteto-judge
how explorer: poteto-explorer
how explainer: poteto-explainer
why investigators: poteto-explorer
why synthesizer: poteto-explainer
reflect tooling: poteto-reviewer-c
reflect judgment: poteto-reviewer-a
reflect divergent: poteto-reviewer-b
reflect synthesizer: poteto-explainer
arena runners: poteto-judge, poteto-fable, poteto-code
arena cross-judge pool: poteto-reviewer-a, poteto-reviewer-b, poteto-reviewer-c
swarm workers: poteto-explorer
architect runners: poteto-judge, poteto-fable, poteto-code
interrogate reviewers: poteto-reviewer-a, poteto-reviewer-b, poteto-reviewer-c
```

This file is read on demand by the skills that need it. It is not auto-loaded into every session, so do not put standing instructions in it. Role lines only.

### 6. Confirm

Tell the user the file was written, which agent files the budget changed, and that both take effect on the next skill invocation.

### 7. Offer a verification skill (optional)

Check whether the project has a way to drive the real app for proof (a `verify-*` skill, or an existing harness). If not, offer once: "want a project-local verification skill, so agents can drive the app the way a user does and prove changes work? I can generate one with /create-verification-skill." On yes, invoke `/create-verification-skill`. On no, move on without pushing.
