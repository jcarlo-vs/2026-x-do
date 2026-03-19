# AI Task Workflow — Copy-Paste Prompts

> Save this file. For every new feature, copy the relevant prompt, fill in the `[BRACKETS]`, and go.

---

## PROMPT 1 — Plan Mode

> Run **once** per feature. No code. Just creates the 3 planning files.

```
I want to build [FEATURE DESCRIPTION].
Tech stack: [YOUR STACK e.g. Next.js, Postgres, Prisma, TypeScript]
Existing conventions to follow: [e.g. REST API, feature-based folder structure, or "read the codebase first"]

Your job is NOT to write code. Only create planning files.

Create these 3 files:

.tasks/PLAN.md
- Architecture overview
- Tech stack and libraries being used
- Folder/file conventions
- Key decisions and reasoning
- Anything a new agent must know before touching this feature

.tasks/TASKS.md
- Break the feature into small, independent, sequentially completable tasks
- Use this format for each:

### TASK-01: [name]
- Status: TODO
- Files to create/modify:
- Depends on:
- Context needed:
- Acceptance criteria:

.tasks/PROGRESS.md
- Create this file with only this header, leave it empty:

# Progress Log
> Agents append their summary here after completing each task.

Do not write any code. Do not do anything else.
```

---

## PROMPT 2 — Worker Mode

> Run for **every task**. Only change `[N]` and `[TASK NAME]`.

```
Before doing anything, read these 3 files in full:
- .tasks/PLAN.md
- .tasks/TASKS.md
- .tasks/PROGRESS.md

PROGRESS.md is your memory of everything previous agents did. Treat it as ground truth.

Your job: complete TASK-[N] only. Do not touch any other task.

When done:
1. Mark TASK-[N] as DONE in .tasks/TASKS.md
2. Append the following to .tasks/PROGRESS.md:

## TASK-[N] — [TASK NAME] — Completed
- What was built:
- Decisions made and why:
- Gotchas / surprises:
- What the next agent must know before starting TASK-[N+1]:

Then stop. Do not begin TASK-[N+1].
```

---

## PROMPT 3 — Recovery Mode

> Run if a session **crashed or died mid-task**.

```
Before doing anything, read these 3 files in full:
- .tasks/PLAN.md
- .tasks/TASKS.md
- .tasks/PROGRESS.md

Something went wrong during TASK-[N]. The task may be partially done.

Your job:
1. Inspect the current state of the relevant files/code
2. Determine what was already completed and what wasn't
3. Finish TASK-[N] cleanly without redoing what already works
4. Mark TASK-[N] as DONE in .tasks/TASKS.md
5. Append your summary to .tasks/PROGRESS.md as usual

Then stop.
```

---

## PROMPT 4 — Review Mode

> Run **once at the end** when all tasks are DONE.

```
Before doing anything, read these 3 files in full:
- .tasks/PLAN.md
- .tasks/TASKS.md
- .tasks/PROGRESS.md

All tasks are marked DONE. Do a final review pass:
1. Check that acceptance criteria in TASKS.md are actually met
2. Look for inconsistencies between tasks (naming, types, conventions)
3. Check for any leftover TODOs, console.logs, or placeholder code
4. List everything that needs fixing before this feature is production-ready

Do not refactor or change anything yet. Just report.
```

---

## Cheatsheet

| Prompt   | Mode          | When to use                          |
| -------- | ------------- | ------------------------------------ |
| PROMPT 1 | Plan Mode     | Once per feature, at the start       |
| PROMPT 2 | Worker Mode   | Every task, increment [N] each time  |
| PROMPT 3 | Recovery Mode | Session crashed or task is half-done |
| PROMPT 4 | Review Mode   | Once at the very end                 |

---

## How It Works

```
PROMPT 1 (you)   →  creates .tasks/PLAN.md + TASKS.md + PROGRESS.md
PROMPT 2 TASK-01 →  reads 3 files → does task → updates 2 files → stops
PROMPT 2 TASK-02 →  reads 3 files → does task → updates 2 files → stops
PROMPT 2 TASK-03 →  reads 3 files → does task → updates 2 files → stops
...
PROMPT 4         →  final review, lists anything left to fix
```

Each agent's only job: **read 3 files → do one task → update 2 files → stop.**

PROGRESS.md is the shared memory across all sessions. Never skip updating it.
