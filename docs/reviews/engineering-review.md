# Engineering Review

## Scope and overall result

Reviewed the approved catalog requirements, product committee minutes, README, glossary, architecture diagram, and the production source/runtime configuration as of 2026-10-25. No `GLOSSARY-MAP.md` or architecture ADRs are present. The PDF extraction supplied Docling anchors but no page numbers, so PDF citations below use document anchors. The minutes contain minor OCR spacing artifacts (`to11:00`, `gatewayis`); the rating decision cited below is legible.

**Overall result: not fully consistent.** The repository is a statically generated Astro Game Catalog backed by local SQLite at build time. This matches the requirements' SQLite and deterministic-rating decisions, but conflicts with the requirement for sub-five-second data updates without redeployment, the explicit multi-category Game requirement, and the later minutes' rating-format decision. The requirements' versioned scope also conflicts with the README's current feature claims. The diagram presents separate runtime architecture that the repository does not implement; its external existence cannot be verified here.

## Implementation mismatches

### I1. Catalog data cannot update without rebuilding and redeploying

- **Source:** [requirements.pdf](../requirements.pdf), §4 NFR-01, Docling anchor `#/texts/20`, requires changes to a Game to appear in under five seconds without redeployment.
- **Repository evidence:** Astro is configured for static output ([astro.config.mjs](../../astro.config.mjs#L7)). The home page reads the catalog in frontmatter before rendering ([index.astro](../../src/pages/index.astro#L13), [index.astro](../../src/pages/index.astro#L15)); the game detail route is also prerendered and reads from the database while generating paths and pages ([game/[id].astro](../../src/pages/game/%5Bid%5D.astro#L13), [game/[id].astro](../../src/pages/game/%5Bid%5D.astro#L16)). Database setup runs before the build ([package.json](../../package.json#L19)).
- **Discrepancy:** A changed SQLite row cannot change already-generated static HTML in five seconds. The repository provides no runtime catalog service or refresh path.
- **Correction needed:** Either revise NFR-01 to specify when a new build/deployment makes catalog changes visible, or define and implement a runtime data service that meets the five-second target.

### I2. A Game has one Category in the implementation, not several

- **Source:** [requirements.pdf](../requirements.pdf), §3 FR-03, Docling anchor `#/texts/12`, requires each Game to belong to several categories and to show all of them on cards and detail pages.
- **Repository evidence:** The `games` schema has a single `category_id` foreign key ([schema.ts](../../db/schema.ts#L20)). The data-access layer maps one `category` from one joined Category ([games.ts](../../src/lib/games.ts#L40), [games.ts](../../src/lib/games.ts#L55)); the app-facing `Game` model and detail page likewise render a singular Category ([game.ts](../../src/types/game.ts#L24), [game/[id].astro](../../src/pages/game/%5Bid%5D.astro#L39)).
- **Discrepancy:** The schema cannot represent the required many-to-many Game–Category relationship, so cards and detail pages cannot show all categories for a Game.
- **Correction needed:** Add a join table and update the data-access mapping and both renderers, or amend FR-03 if one Category per Game is the approved intent.

### I3. Current Rating rendering does not match decision D2

- **Source:** [meeting-minutes.pdf](../meeting-minutes.pdf), §2 / Decisions, Docling anchor `#/texts/14`: D2 says Ratings are whole numbers from 1 to 10, without stars, and records this as implemented in sprint 14. The action to update requirements v1.3 is at anchor `#/texts/17`.
- **Repository evidence:** Seeded Ratings are deterministic one-decimal values from 3.0 to 5.0 ([transforms.ts](../../db/transforms.ts#L121), [transforms.ts](../../db/transforms.ts#L130)). The rendering formats full/half/empty star glyphs in a 0–5 range ([ratings.ts](../../src/lib/ratings.ts#L19), [ratings.ts](../../src/lib/ratings.ts#L28)) and prints one decimal place ([StarRating.astro](../../src/components/StarRating.astro#L14), [StarRating.astro](../../src/components/StarRating.astro#L15)).
- **Discrepancy:** The checked-in implementation still uses a 0–5 decimal/star Rating rather than D2's 1–10 whole-number, no-star display. The v1.2 requirements define Rating as a score but do not specify this display scale ([requirements.pdf](../requirements.pdf), §2, anchor `#/texts/8`), so this is a minutes-to-code mismatch, not a conflict with an explicit v1.2 scale.
- **Correction needed:** Implement D2 in the seed/data/display path and tests, or have the product committee record a superseding decision and align the requirements and minutes. Preserve the separate deterministic-rating requirement (NFR-03, anchor `#/texts/22`).

### I4. About-page copy describes services not implemented by this repository

- **Source:** The rendered About page says the platform provides community feedback, forums, voting, expansion funding, manufacturing, and fulfillment ([about.astro](../../src/pages/about.astro#L19)). The approved requirements state that “Support This Game” does not process contributions (FR-06, [requirements.pdf](../requirements.pdf), anchor `#/texts/15`) and exclude contribution processing/payment (anchor `#/texts/32`).
- **Repository evidence:** The Game detail page renders the Support button ([game/[id].astro](../../src/pages/game/%5Bid%5D.astro#L61)); without an `href`, the shared Button component renders it as a plain `<button>` ([Button.astro](../../src/components/Button.astro#L50)). The repository describes a single static site with no separate backend ([README.md](../../README.md#L3)).
- **Discrepancy:** The repository's user-facing copy describes operational community, funding, and fulfillment services that its implemented catalog does not provide.
- **Correction needed:** Reword the About copy to distinguish fictional/aspirational product context from available functionality, or provide and document the actual services if they exist outside this repository.

## Intended-state conflicts

### C1. Current filter/sort features conflict with the approved v1.2 scope

- **Sources:** The approved [requirements.pdf](../requirements.pdf) v1.2 metadata (anchor `#/texts/1`) says search, filtering, sorting, and pagination are planned for v1.3 (§5, anchor `#/texts/30`). The [README.md](../../README.md#L13) describes category/publisher filtering and sorting as current behavior. The minutes' action to update the requirements to v1.3 is due 2026-10-30 (anchor `#/texts/17`).
- **Evidence and status:** The code does implement browser-side category/publisher filters and sorting ([index.astro](../../src/pages/index.astro#L36), [index.astro](../../src/pages/index.astro#L130), [index.astro](../../src/pages/index.astro#L173)). This is therefore not an implementation mismatch; the repository implements features that the approved v1.2 document labels as planned for v1.3.
- **Correction needed:** Confirm the intended release baseline, then update the versioned requirements and README consistently. Do not infer from the repository whether these features were intentionally brought forward.

### C2. The diagram's separate Flask API conflicts with the README's stated system boundary

- **Sources:** The diagram's green Flask REST API and its SQL-query arrow (center) are at odds with the [README.md](../../README.md#L3), which describes a single Astro site with no separate backend.
- **Evidence and uncertainty:** The repository configures static output ([astro.config.mjs](../../astro.config.mjs#L7)) and has no Flask service source or API route in its `src/pages/` tree. This establishes that the depicted API is not implemented here, but cannot establish whether the diagram refers to an external system.
- **Correction or evidence needed:** State whether the diagram covers only this repository or includes external services. If external, provide the Flask source and runtime/deployment configuration; otherwise remove the API and its data-flow arrows.

## Unverifiable requirement

- **WCAG 2.1 AA:** [requirements.pdf](../requirements.pdf), §4 NFR-04, anchor `#/texts/23`, requires WCAG 2.1 level AA and full keyboard navigation. Source review and the available repository evidence do not establish conformance. A documented accessibility audit, including keyboard testing and appropriate assistive-technology/contrast checks, is needed before claiming this requirement is met.

## Architecture diagram claim matrix

Each distinct claim or data-flow assertion in [architecture.png](../architecture.png) appears once below with one disposition.

| ID | Diagram claim and visual region | Disposition | Evidence, explanation, and correction/evidence needed |
| --- | --- | --- | --- |
| D1 | Subtitle describes a crowdfunding site for developer-themed games (top). | **Agrees** | Consistent with the product description in [README.md](../../README.md#L3) and the requirements introduction ([requirements.pdf](../requirements.pdf), anchor `#/texts/3`). This describes product context, not evidence that funding transactions run in the repository. |
| D2 | Browser visitor is a backer (left). | **Agrees** | The glossary defines the Game Catalog as the collection of games backers browse and discover ([GLOSSARY.md](../../GLOSSARY.md#L3)). It establishes the intended audience, not an authenticated backer account. |
| D3 | Browser loads HTML pages from the Astro site (upper-left arrow and blue component). | **Agrees** | Static output is configured in [astro.config.mjs](../../astro.config.mjs#L7); the catalog is rendered by the home page ([index.astro](../../src/pages/index.astro#L15)). |
| D4 | Astro uses Drizzle to access catalog data at build time (arrow from Astro to datastore). | **Agrees** | The home page queries catalog data in frontmatter ([index.astro](../../src/pages/index.astro#L13), [index.astro](../../src/pages/index.astro#L15)); the data layer uses Node SQLite with Drizzle ([db.ts](../../src/lib/db.ts#L1), [db.ts](../../src/lib/db.ts#L87)). |
| D5 | Browser fetches `/api/games` at runtime from the REST API (left-center arrow). | **Mismatch** | No runtime fetch is implemented on the catalog page; its script filters and sorts already-rendered cards locally ([index.astro](../../src/pages/index.astro#L130), [index.astro](../../src/pages/index.astro#L173)). Remove this request arrow and depict local browser-side filtering/sorting instead. |
| D6 | A Flask REST API exists as a separate runtime component (green box). | **Unverifiable** | No Flask service or API route is in this repository, while the README says there is no separate backend ([README.md](../../README.md#L3)). The diagram could include an external service. The intended system boundary and, if external, its source and runtime/deployment configuration are needed. |
| D7 | The Flask REST API sends SQL queries to the datastore (center arrow). | **Unverifiable** | The repository contains no Flask implementation from which to verify its SQL connection. External service source and runtime configuration showing the connection are needed. |
| D8 | `db/games.csv` seeds the depicted PostgreSQL datastore (upper-right arrow). | **Mismatch** | The seed function reads `games.csv` ([seed.ts](../../db/seed.ts#L54), [seed.ts](../../db/seed.ts#L55)) and creates its database with the repository's SQLite implementation ([seed.ts](../../db/seed.ts#L79), [db.ts](../../src/lib/db.ts#L85)). Keep the seed relationship but point it to local SQLite. |
| D9 | The datastore is PostgreSQL (orange database, right). | **Mismatch** | Drizzle Kit is configured for SQLite ([drizzle.config.ts](../../drizzle.config.ts#L6)); the runtime database uses Node's `DatabaseSync` ([db.ts](../../src/lib/db.ts#L85)). Relabel the datastore as local SQLite (default `tailspin.db`). |
| D10 | The datastore contains `games`, `categories`, `publishers`, and `Backers` (inside orange database). | **Mismatch** | The schema defines SQLite `publishers`, `categories`, and `games` tables ([schema.ts](../../db/schema.ts#L3), [schema.ts](../../db/schema.ts#L9), [schema.ts](../../db/schema.ts#L15)); it defines no `Backers` table. Remove `Backers` unless an implemented schema is supplied. |

## Validation

This was a documentation/source review; no application files were changed and unit tests, lint, type checks, and builds were not run. The report was checked against the source anchors and line references listed above. No PDF page numbers were available in the Docling output; all PDF locations are given as document anchors.
