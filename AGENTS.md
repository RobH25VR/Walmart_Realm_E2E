# Repository Guidelines

## Project Structure & Module Organization

- `pages/` holds Playwright Page Object Model helpers split by environment (`StagingHomePage.ts`, `ProdStorePage.ts`, etc.).
- `tests/` contains spec files for desktop, iPhone, and prod deployments; `tests/perf/` focuses on frame-rate and navigation timing capture.
- `playwright.config.ts` plus the specialized `playwright.functional.config.ts` and `playwright.perf.config.ts` define retries, projects, and reporters.
- `perf-results/` stores JSON metrics emitted by the performance suite and `perf-graphs/` receives PNG charts generated from those metrics.
- `scripts/generate-perf-graphs.ts` is the only compiled TypeScript artifact (output goes to `dist/`). GitHub Actions live under `.github/workflows/`.

## Build, Test, and Development Commands

```bash
# Install dependencies (CI-friendly)
npm ci

# Run the multi-device functional regression suite
npx playwright test -c playwright.functional.config.ts

# Run the Chromium-only performance suite
npx playwright test -c playwright.perf.config.ts

# Compile TypeScript utilities (e.g., perf graph generator)
npx tsc --project tsconfig.json

# Generate PNG graphs from saved perf JSON results
node ./dist/generate-perf-graphs.js
```

## Coding Style & Naming Conventions

- **Indentation**: 2 spaces throughout page objects, specs, and configs.
- **File naming**: Page objects use `PascalCase` (`StagingStorePage.ts`); specs are kebab/camel variants ending in `.spec.ts` (e.g., `homepageProdiPhone.spec.ts`).
- **Function/variable naming**: camelCase for methods (`openFirstProduct`, `clickClose`) and constants.
- **Linting**: No ESLint/Prettier config is committed; rely on TypeScript strict mode plus Playwright’s assertion failures.

## Testing Guidelines

- **Framework**: `@playwright/test` 1.55.x with device-specific projects (Chromium, WebKit, iPhone, iPad) and 3 retries.
- **Test files**: Functional specs reside in `tests/*.spec.ts`; performance tests live in `tests/perf/`.
- **Running tests**: `npx playwright test -c playwright.functional.config.ts` for UI coverage, `npx playwright test -c playwright.perf.config.ts` for metrics.
- **Coverage**: No coverage tooling—focus on critical user journeys (realm selection, tutorials, cart) and on perf baselines.

## Commit & Pull Request Guidelines

- **Commit format**: No enforced convention; recent commits (`test`, `fixes`, `debug`) are terse. Prefer imperative summaries (e.g., `feat: add prod checkout spec`).
- **PR process**: Functional suite runs on a weekday cron (`playwright-functional.yml`) and uploads reports; perf workflow is manual (`workflow_dispatch`). Include relevant Playwright HTML reports or perf artifacts when requesting review.
- **Branch naming**: Not enforced; adopt `feature/<scope>` or `fix/<bug>` for clarity and reference the realm or device when possible.

---

# Repository Tour

## 🎯 What This Repository Does

Walmart Realm E2E hosts Playwright-based functional and performance tests that validate Walmart’s “Realm” immersive experiences across staging and production entry points.

**Key responsibilities:**
- Assert core navigation, tutorial dismissal, and cart flows for desktop, mobile, and prod URLs.
- Measure per-realm rendering health (DOM timings, FPS, request failures) and persist metrics.
- Generate visual performance baselines via Chart.js for regression tracking.

---

## 🏗️ Architecture Overview

### System Context
```
[Contributors] → [Playwright Test Runner] → [walmart.emperia-staging.com / walmartrealm.com]
                           ↓
                [playwright-report/, perf-results/, perf-graphs/]
```

### Key Components
- **Staging/Prod HomePage classes (`pages/*HomePage.ts`)** – Navigate feeds, pick realms, and close tutorials in nested iframes.
- **Staging/Prod StorePage classes (`pages/*StorePage.ts`)** – Encapsulate iframe traversal, product modal control, cart updates, and media assertions.
- **Performance harness (`tests/perf/realm.perf.spec.ts`)** – Iterates over `PERF_TARGET_URL` realms, captures navigation timing, FPS, and network failures, and emits JSON snapshots.
- **Graphing utility (`scripts/generate-perf-graphs.ts`)** – Converts JSON metrics into PNG charts via `chartjs-node-canvas` for reporting.

### Data Flow
1. Developer installs dependencies and launches Playwright with the relevant config (functional or perf).
2. Specs instantiate `HomePage` to hit `/feed`, choose a realm, and dismiss the tutorial overlay (main page + nested frames).
3. `StorePage` helpers interact with the Experience iframe to open modals, add to cart, or start videos, using locator assertions (`expectMoreThanOneWalmartImage`).
4. Performance runs additionally subscribe to network events, compute navigation timing + FPS, and write per-realm JSON files consumed by the graphing script.

---

## 📁 Project Structure [Partial Directory Tree]

```
Walmart_Realm_E2E/
├── pages/                        # Page Object Models for staging and prod realms
├── tests/                        # Functional specs (desktop, prod, iPhone variants)
│   └── perf/                     # Realm performance suite + typings
├── scripts/                      # Utility scripts (perf graph generator)
├── perf-results/                 # Saved JSON metrics from perf suite
├── perf-graphs/                  # Generated PNG charts
├── playwright.config.ts          # Default multi-project config
├── playwright.functional.config.ts
├── playwright.perf.config.ts
├── playwright.env                # PERF_TARGET_URL definition
├── tsconfig.json                 # Compiles scripts → dist/
└── .github/workflows/            # Functional + perf GitHub Actions
```

### Key Files to Know

| File | Purpose | When You'd Touch It |
|------|---------|---------------------|
| `pages/StagingHomePage.ts` | Handles feed navigation and resilient tutorial dismissal logic. | Add selectors when new tutorial variants appear. |
| `pages/StagingStorePage.ts` | Provides iframe helpers for products, media, and cart interactions. | Extend for new in-experience flows (video, hidden rooms). |
| `tests/homepage*.spec.ts` | Smoke tests for staging/prod/iPhone homepages. | Add assertions for new realms or entry URLs. |
| `tests/navigation*.spec.ts` | Multi-scene navigation, product modal, and video checks. | Expand for new cinematic workflows or unlockables. |
| `tests/checkout*.spec.ts` | Cart badge/state verification across devices. | Validate cart regressions or alternate SKUs. |
| `tests/perf/realm.perf.spec.ts` | Captures FPS + network data per realm. | Tune metrics, retries, or sampling duration. |
| `scripts/generate-perf-graphs.ts` | Builds chart PNGs from perf JSON results. | Update visualization types or add new KPIs. |
| `.github/workflows/playwright-functional.yml` | Weekday CI for functional suite with Slack alerting. | Modify schedule, add matrices, or tweak failure handling. |
| `.github/workflows/playwright-perf.yml` | Manual perf workflow that compiles scripts and publishes artifacts. | Automate triggers or add upload destinations. |

---

## 🔧 Technology Stack

### Core Technologies
- **Language:** TypeScript 5.9 (strict mode) – Safety for page objects and scripts.
- **Framework/Test Runner:** `@playwright/test` 1.55 – Multi-device projects with retries, screenshots, video capture, and HTML/JSON reporting.
- **Runtime:** Node.js 20 (per GitHub Actions) – Supports ESM interop and worker threads required by Playwright.
- **Visualization:** `chart.js` + `chartjs-node-canvas` – Server-side PNG generation for performance tracking.

### Key Libraries
- **`dotenv`** – Loads `playwright.env` before tests so performance URLs are available outside `codegen`.
- **`ts-node` / `typescript`** – Compiles and runs the graphing script when not using prebuilt JS.

### Development Tools
- **Playwright HTML/JSON reporters** – Stored in `playwright-report/` for post-run triage.
- **GitHub Actions** – Scheduled functional suite and on-demand perf suite with Slack notifications.

---

## 🌐 External Dependencies

### Required Services
- **`walmart.emperia-staging.com`** – Primary staging realm feed exercised by most specs.
- **`walmartrealm.com`** – Production feed used by `Prod*` specs.
- **Slack webhook (`SLACK_WEBHOOK_URL` secret)** – Receives CI alerts when functional tests fail.

### Optional Integrations
- None beyond Playwright-managed browsers; all other data sources are local artifacts.

---

### Environment Variables

```bash
# Required for performance runs (comma-separated realm URLs)
PERF_TARGET_URL="https://walmart.emperia-staging.com/#/viewer/..."

# Secrets provided in CI (not stored locally)
SLACK_WEBHOOK_URL= # used by Functional Tests workflow
```

---

## 🔄 Common Workflows

### Functional Regression Sweep
1. `npm ci && npx playwright test -c playwright.functional.config.ts` in the repo root.
2. Inspect `playwright-report/` (HTML + JSON) for unexpected failures.
3. Update page objects/selectors when iframe content shifts, then re-run the suite.
**Code path:** `tests/*.spec.ts` → `pages/*HomePage.ts` → `pages/*StorePage.ts`.

### Performance Benchmarking
1. Edit `playwright.env` or pass `PERF_TARGET_URL` via CI `workflow_dispatch`.
2. Run `npx playwright test -c playwright.perf.config.ts` to emit JSON entries to `perf-results/`.
3. Compile scripts (`npx tsc`) and execute `node dist/generate-perf-graphs.js` to refresh PNG dashboards.
**Code path:** `tests/perf/realm.perf.spec.ts` → `perf-results/*.json` → `scripts/generate-perf-graphs.ts`.

---

## 📈 Performance & Scale

- **Retries & Workers:** Functional suites default to 3 retries with a single worker to minimize flake while interacting with 3D content; adjust `workers` cautiously because the realms are network-heavy.
- **Artifacts:** Performance runs can create dozens of JSON files; keep `perf-results/` trimmed or archive older data before generating graphs.
- **Timeouts:** Functional specs set 60s navigation timeouts; perf suites extend to 90s to accommodate slow iframe boot.

---

## 🚨 Things to Be Careful About

### 🔒 Security Considerations
- `playwright.env` should store only non-secret realm URLs; secrets such as Slack webhooks belong in CI variables.
- Page objects aggressively use `force: true` clicks inside iframes. Revisit selectors before increasing force usage to avoid masking real regressions.
- Performance tests log every API call/failed request—share artifacts cautiously if URLs might reveal staging resources.

Last updated: 2026-01-27

*Update to last commit: 6e1ba6fd1352070506c33edbdf9df2b8af77c496*
