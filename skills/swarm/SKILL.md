---
name: swarm
description: "Fan out N parallel workers, drain them, and return one report. Use for /swarm, 'swarm this', or parallel coverage, races, gauntlets, and exploration."
disable-model-invocation: true
---

# Swarm

Fan out N parallel cloud workers. They may cover separate slices, race the same brief, or mix both. The parent waits, aggregates, and returns one report.

## Start

Open a todolist with one entry per phase before launching anything.

1. Frame
2. Fan out
3. Aggregate
4. Report

## Phase A: Frame

1. State the done predicate and the artifact or report the swarm must return.
2. Choose the shape. Partition into slices, race N workers on identical briefs, or mix both. For a race or mixed shape, declare `first pass`, `rank all`, or `best-of` before spawning.
3. Set N from the user or derive it from the shape. N is total workers, not the cloud concurrency limit.
4. Pick the worker agent from `swarm workers` in `~/.claude/pstack-models.md` when present. Otherwise use `poteto-explorer` for read-only lanes and `poteto-code` for lanes that write. For a model race, name each arm's agent up front.
5. Give each worker its own writable output when it writes.

## Phase B: Fan out

Spawn all N workers in one message with the configured `subagent_type`, `run_in_background: true`, and an isolation mode.

Pick isolation by what the lane touches. Lanes that write to the repo get `isolation: "worktree"`, so concurrent writers never share a checkout (the **separate-before-serializing-shared-state** principle skill). Lanes that only read can omit it. Use `isolation: "remote"` for long lanes you want off this machine, and never for a lane that needs something only this machine has: a simulator, a local browser session, local auth, or the transcripts under `~/.claude/projects/`.

A worker that must start from a non-default pushed branch checks it out in its own worktree as its first step, since the brief cannot set a base branch for it.

Every brief stands alone. Include the goal, scope, exact slice or race arm, how to verify, and what to report. Reports use `PASS`, `ISSUES`, or `BLOCKED` with evidence.

If a worker drops out, proceed with N-1 and note it.

## Phase C: Aggregate

Read the terminal results. For coverage, every required slice needs a result. For a race, apply the selection rule declared up front. Use first pass, rank all, or best-of. Do not paste raw worker dumps.

Keep a compact result table, one-line evidenced issues, and explicit gaps or dropouts.

## Phase D: Report

Return one consolidated in-chat report with the table, issue one-liners, gaps or dropouts, and the race rule when used.
