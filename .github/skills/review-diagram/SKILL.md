---
name: review-diagram
description: "Compare docs/architecture.png with production code and runtime/deployment configuration. Use for architecture-diagram reviews, including when contributing diagram findings to the engineering-review report."
---

# Review Architecture Diagram

Compare `docs/architecture.png` with the behavior implemented by this repository.

When used on its own, write or refresh `docs/reviews/architecture-diagram.md`. That standalone report is an explicit deliverable of this skill, not an incidental summary, and is permitted by the repository's general “Do not generate summary markdown files” guidance. When used as part of the engineering review, return the complete claim-by-claim findings to the reviewer for inclusion in `docs/reviews/engineering-review.md`; do not create or refresh a separate architecture report in that case.

## Review process

1. Read `GLOSSARY.md` (or the relevant glossaries if `GLOSSARY-MAP.md` exists) and any ADRs relevant to the architecture. Read the diagram and enumerate its claims about components, data stores, data flow, runtime behavior, and deployment.
2. Inspect production source and runtime/deployment configuration for evidence for or against each claim. Follow imports, configuration, and data flow far enough to verify the behavior. Tests and prose documentation may help locate or interpret behavior, but are contextual evidence rather than proof of what runs.
3. Treat production code and runtime/deployment configuration as the authority on current behavior. Use documentation to identify possible intended-state conflicts; report those separately as unresolved intent when the repository evidence does not settle them. Surface relevant ADR conflicts explicitly.
4. Give every diagram claim a disposition: **Mismatch**, **Agrees**, or **Unverifiable**. A claim is a mismatch only when repository evidence demonstrates a conflict. If evidence is incomplete or the claim concerns an external system the repository cannot establish, mark it unverifiable and state what evidence is missing.
5. Return every identified diagram claim exactly once with its disposition. For each mismatch, state the claim and visual location, cite specific code/configuration evidence with file paths and line numbers, explain the disagreement, and suggest a specific correction to the diagram. For each unverifiable claim, state what is claimed and what evidence would be needed to verify it. Record agreements briefly, with evidence where useful. Use glossary terms consistently.
6. When standalone, verify that `docs/reviews/architecture-diagram.md` contains the scope, overall result, and every claim with a disposition. When contributing to the engineering review, verify that the complete claim list and evidence have been returned for inclusion in its combined report. Do not modify the diagram or application code as part of this review.
