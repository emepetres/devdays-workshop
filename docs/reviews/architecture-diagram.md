# Architecture Diagram Review

## Scope and result

Reviewed `docs/architecture.png` against the repository's production source and runtime configuration, using the `Game Catalog` terminology in [GLOSSARY.md](../../GLOSSARY.md). No `GLOSSARY-MAP.md` or architecture ADRs were present. The diagram's product subtitle is consistent with the documented product context, but its database and browser data-flow claims do not match the implementation. The repository implements a statically generated Astro site that reads a local SQLite database at build time; no browser API request is implemented here.

The diagram does not identify a hosting provider, deployment topology, or deployment process, so it makes no deployment claim that can be assessed.

## Mismatches

### M1. Astro reads from PostgreSQL

- **Diagram claim and location:** The arrow from “Astro site (HTML pages)” to the orange database depicts Drizzle ORM accessing PostgreSQL at build time (center-right).
- **Evidence:** Astro is configured for static output ([astro.config.mjs:7](../../astro.config.mjs#L7)); the home page gets its database and catalog data in frontmatter ([index.astro:12](../../src/pages/index.astro#L12), [index.astro:14](../../src/pages/index.astro#L14)). The database layer uses Node's built-in SQLite driver and Drizzle's SQLite proxy ([db.ts:1](../../src/lib/db.ts#L1), [db.ts:5](../../src/lib/db.ts#L5), [db.ts:85](../../src/lib/db.ts#L85)); Drizzle Kit is configured with the SQLite dialect ([drizzle.config.ts:6](../../drizzle.config.ts#L6)).
- **Why it disagrees:** The build-time access pattern is real, but its data store is SQLite, not PostgreSQL.
- **Suggested correction:** Keep the build-time Drizzle relationship, but relabel the store as local SQLite (`tailspin.db` by default).

### M2. Browser fetches `/api/games` at runtime

- **Diagram claim and location:** The arrow from “Browser” to “REST API (Flask)” says the browser fetches `/api/games` at runtime (left-center).
- **Evidence:** The home page is prerendered ([index.astro:12](../../src/pages/index.astro#L12)). Its browser script reads the already-rendered game cards and filters/sorts them in the DOM ([index.astro:118](../../src/pages/index.astro#L118), [index.astro:132](../../src/pages/index.astro#L132), [index.astro:173](../../src/pages/index.astro#L173)); it does not make an API request. The repository's `src/pages/` contains no API route.
- **Why it disagrees:** The implemented browser behavior is local filtering and sorting of the static catalog, not a runtime fetch.
- **Suggested correction:** Remove the `/api/games` request arrow and show the browser filtering and sorting prerendered game cards locally.

### M3. The repository seed flow writes the CSV data to PostgreSQL

- **Diagram claim and location:** The dashed “seed” arrow from `db/games.csv` to PostgreSQL (upper-right).
- **Evidence:** `seedDatabase` reads the CSV and creates its database connection with `createDatabase` ([seed.ts:54](../../db/seed.ts#L54), [seed.ts:55](../../db/seed.ts#L55), [seed.ts:79](../../db/seed.ts#L79)). That connection is backed by Node SQLite ([db.ts:85](../../src/lib/db.ts#L85)). The `db:setup` script runs migrations and seeding, and `prebuild` invokes it before Astro builds ([package.json:16](../../package.json#L16), [package.json:19](../../package.json#L19)).
- **Why it disagrees:** The checked-in seed flow loads CSV data into the local SQLite database, not PostgreSQL.
- **Suggested correction:** Point the seed arrow to local SQLite and identify the migration/seed setup as a build prerequisite.

### M4. The application's database is PostgreSQL and includes a `Backers` table

- **Diagram claim and location:** The orange datastore is labeled “PostgreSQL” and lists `games`, `categories`, `publishers`, and `Backers` (right).
- **Evidence:** The application schema defines SQLite tables for `publishers`, `categories`, and `games` ([schema.ts:3](../../db/schema.ts#L3), [schema.ts:9](../../db/schema.ts#L9), [schema.ts:15](../../db/schema.ts#L15)). The database layer connects through Node's SQLite driver ([db.ts:1](../../src/lib/db.ts#L1), [db.ts:85](../../src/lib/db.ts#L85)).
- **Why it disagrees:** The repository's database is SQLite, and its schema contains no `Backers` table.
- **Suggested correction:** Label the store SQLite and list only the repository's defined tables. Do not include `Backers` unless a backing model is implemented in this application.

## Unverifiable

### U1. A separate Flask REST API issues SQL queries to PostgreSQL

- **Diagram claim and location:** The green “REST API (Flask)” component and its “SQL queries” arrow to PostgreSQL (center).
- **What the repository establishes:** There is no Flask service source or API route in this repository, and the application itself is configured as a static Astro site. The repository therefore does not implement or demonstrate this service or its SQL connection.
- **What is missing:** The diagram could refer to a separately hosted system outside this repository. Verifying that would require the Flask service source and its runtime/deployment configuration, including evidence of its database connection.
- **Intent note:** The README describes this project as a single static Astro site with no separate backend service ([README.md:1](../../README.md#L1), [README.md:7](../../README.md#L7)). That documented intent conflicts with the depicted external API, but repository code cannot establish whether such an external service exists or is intended.

### U2. The browser visitor is a “backer”

- **Diagram claim and location:** The browser node is labeled “Browser (backer)” (left).
- **What the repository establishes:** The game detail page includes a “Support This Game” button ([game detail page](../../src/pages/game/%5Bid%5D.astro#L61)), but the application schema has no backing record or `Backers` table ([schema.ts:3](../../db/schema.ts#L3), [schema.ts:9](../../db/schema.ts#L9), [schema.ts:15](../../db/schema.ts#L15)).
- **What is missing:** The code does not establish whether a visitor has a backer identity or whether the button connects to a backing/payment process. An authoritative product requirement or the implementation of that external flow would be needed to verify this role.

## Agrees

- **Astro produces HTML pages for browsers:** Static output is configured in Astro ([astro.config.mjs:7](../../astro.config.mjs#L7)); the home and game detail pages are explicitly prerendered ([index.astro:12](../../src/pages/index.astro#L12), [game detail page](../../src/pages/game/%5Bid%5D.astro#L13)).
- **The site uses Drizzle to read catalog data while rendering pages:** The home page calls the database and catalog helpers in frontmatter ([index.astro:14](../../src/pages/index.astro#L14)), and game detail paths are generated from database game IDs ([game detail page](../../src/pages/game/%5Bid%5D.astro#L13)).
- **Product context:** “Crowdfunding site for developer-themed games” is consistent with the README's description of Tailspin Toys ([README.md:1](../../README.md#L1)). This is agreement with the stated product context, not evidence that live crowdfunding transactions are implemented.
