---
name: plan-structure
description: Use this format whenever the user asks for a plan.
---
# Rules: Plan Format

When the user asks for a plan, always use this structure, in this order:

## Goal
One sentence that describes the goal.

## Scope
- **Includes:** ...
- **Excludes:** ...

## Assumptions
List brief assumptions. If an ambiguity prevents a useful plan, ask before proceeding.

## Phases
Use a table with these columns: ID | Task | Deliverable | Depends on | Effort (S/M/L).

## Dependency Flow
Place a Mermaid `flowchart TD` diagram immediately below the phase table.

Diagram rules:
- Use one node per phase, with the same ID as the table (F1, F2, ...).
- Keep labels to four words maximum.
- Make arrows match the `Depends on` column exactly.
- Use no more than 10 nodes; group larger plans into subgraphs.
- Do not use styling or `classDef`.
- Avoid parentheses and special characters in labels; quote a label if needed.

## Risk
List at most three risks, each with a mitigation.

## Acceptance Criteria
Provide a verifiable checklist.

## Next Action
Name one concrete action to start.

## Style
- Start every task with an imperative verb.
- Avoid long paragraphs and filler.
- Do not repeat in prose what the diagram already shows.
- Do not invent details the user did not provide.
