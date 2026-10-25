---
name: review-diagram
description: "Compare docs/architecture.png with the repository's production code and runtime/deployment configuration, then document agreements, discrepancies, and unverifiable claims."
disable-model-invocation: true
---

# Review Architecture Diagram

Compare `docs/architecture.png` with the behavior implemented by this repository and write the review to `docs/reviews/architecture-diagram.md`.

The report at `docs/reviews/architecture-diagram.md` is an explicit deliverable of this skill, not an incidental summary. Create or refresh it as requested even though repository guidance says, “Do not generate summary markdown files.” That general guidance does not prohibit this specifically requested review artifact.

## Review process

1. Read `GLOSSARY.md` (or the relevant glossaries if `GLOSSARY-MAP.md` exists) and any ADRs relevant to the architecture. Read the diagram and enumerate its claims about components, data stores, data flow, runtime behavior, and deployment.
2. Inspect production source and runtime/deployment configuration for evidence for or against each claim. Follow imports, configuration, and data flow far enough to verify the behavior. Tests and prose documentation may help locate or interpret behavior, but are contextual evidence rather than proof of what runs.
3. Treat production code and runtime/deployment configuration as the authority on current behavior. Use documentation to identify possible intended-state conflicts; report those separately as unresolved intent when the repository evidence does not settle them. Surface relevant ADR conflicts explicitly.
4. Give every diagram claim a disposition: **Mismatch**, **Agrees**, or **Unverifiable**. A claim is a mismatch only when repository evidence demonstrates a conflict. If evidence is incomplete or the claim concerns an external system the repository cannot establish, mark it unverifiable and state what evidence is missing.
5. Write or refresh `docs/reviews/architecture-diagram.md`. Include the review scope and concise overall result, then organize the findings by disposition. For each mismatch, state the diagram claim and its visual location, cite specific code/configuration evidence with file paths and line numbers, explain the disagreement, and suggest a specific correction to the diagram. For each unverifiable claim, state what is claimed and what evidence would be needed to verify it. Record agreements briefly, with evidence where useful. Use glossary terms consistently.
6. Verify that every identified diagram claim appears exactly once in the report with a disposition, that each mismatch has traceable evidence and a proposed correction, and that the report exists at the required path. Do not modify the diagram or application code as part of this review.
