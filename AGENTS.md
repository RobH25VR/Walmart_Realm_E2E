# Repository Guidelines

## Project Structure & Module Organization

- `pages/` implements Playwright Page Object Model helpers such as `HomePage.ts` and `StorePage.ts` for navigation and store interactions.
- `tests/` contains the executable E2E specifications (`*.spec.ts`) grouped by topic (homepage, navigation, product, checkout).
- `playwright.config.ts` is available for test configuration (currently empty, ready for customization).
- `test-results/` stores Playwright artifacts from prior runs; the `.last-run.json` file tracks the most recent execution summary.
- Root files: `package.json` (scripts and dependencies), `package-lock.json`, and `node_modules/` (installed tooling).

## Build, Test, and Development Commands

```bash
# Install dependencies
npm install

# Run the entire Playwright test suite (headed or headless per config)
npx playwright test

# Re-run a specific spec
npx playwright test tests/checkout.spec.ts

# Inspect the last test run report
npx playwright show-report
```

## Coding Style & Naming Conventions

- **Indentation**: 2 spaces, as seen across `pages/*.ts` and `tests/*.ts`.
- **File naming**: Page objects use `PascalCase` (`HomePage.ts`); specs use `kebab-case` with `.spec.ts` suffix (`checkout.spec.ts`).
- **Function/variable naming**: camelCase for methods (`clickRealm`, `openFirstProduct`) and constants.
- **Linting**: No automated lint config is committed; rely on TypeScript compiler and Playwright test runner errors. Consider adding ESLint locally if extra validation is needed.

## Testing Guidelines

- **Framework**: `@playwright/test` (declared in `package.json`).
- **Test files**: Located under `tests/`, following the `*.spec.ts` convention.
- **Running tests**: `npx playwright test` (optionally target individual specs).
- **Coverage**: No coverage tooling is configured; focus on scenario completeness and critical user journeys.

## Commit & Pull Request Guidelines

- **Commit format**: No enforced convention detected; the latest commit (`test push`) suggests free-form messages. Aim for descriptive, present-tense summaries (e.g., `feat: add checkout cart assertion`).
- **PR process**: Not documented. Recommended practice is to link evidence such as Playwright reports and specify affected realms before requesting review.
- **Branch naming**: Not specified; adopt a practical pattern like `feature/<short-description>` or `fix/<ticket>` to maintain clarity.

---

# Repository Tour

## 🎯 What This Repository Does

Walmart Realm E2E is an end-to-end Playwright test suite that validates curated Walmart “Realm” experiences hosted on `walmart.emperia-staging.com`.

**Key responsibilities:**
- Smoke-test realm selection and tutorial flows.
- Exercise storefront interactions embedded within the experience iframe.
- Verify cart behavior when products are added from immersive scenes.

---

## 🏗️ Architecture Overview

### System Context
```
Contributor → Playwright CLI → walmart.emperia-staging.com
                        ↓
                  Local test artifacts
```

### Key Components
- **HomePage page object (`pages/HomePage.ts`)** – Encapsulates realm selection, tutorial dismissal, and high-level navigation helpers.
- **StorePage page object (`pages/StorePage.ts`)** – Handles iframe traversal, product modal actions, and cart assertions.
- **Spec collection (`tests/*.spec.ts`)** – Defines user journeys (homepage load, navigation, cart flows) using `@playwright/test` fixtures.

### Data Flow
1. Tests bootstrap via `@playwright/test`, instantiating `HomePage` or `StorePage` with the shared `page` fixture.
2. `HomePage` navigates to `https://walmart.emperia-staging.com/#/feed`, selects a realm, and closes tutorials (main page or nested iframe).
3. `StorePage` locates the nested experience iframe and triggers modal/product interactions.
4. Assertions verify UI state (page title, URL, iframe visibility, cart count) before Playwright records results in `test-results/`.

---

## 📁 Project Structure [Partial Directory Tree]

```
Walmart_Realm_E2E/
├── package.json               # Playwright dependency and npm scripts
├── playwright.config.ts       # Placeholder for shared test settings
├── pages/
│   ├── HomePage.ts            # Realm selection + tutorial helpers
│   └── StorePage.ts           # Product modal + cart interactions
├── tests/
│   ├── checkout.spec.ts       # Cart count verification
│   ├── homepage.spec.ts       # Landing page smoke tests
│   ├── navigation.spec.ts     # Realm switching + iframe checks
│   └── product.spec.ts        # Product modal visibility
└── test-results/              # Playwright output artifacts
```

### Key Files to Know

| File | Purpose | When You'd Touch It |
|------|---------|---------------------|
| `pages/HomePage.ts` | Page object for feed navigation and tutorial dismissal. | Update when realm selection flows change. |
| `pages/StorePage.ts` | Handles iframe logic, product modals, and cart actions. | Extend to cover new storefront behaviors. |
| `tests/homepage.spec.ts` | Ensures the feed loads and tutorials appear. | Add smoke assertions for new realms. |
| `tests/navigation.spec.ts` | Multi-step realm navigation and iframe checks. | Add journeys that span multiple scenes. |
| `tests/product.spec.ts` | Opens product modals from experiences. | Validate new modal layouts or media assets. |
| `tests/checkout.spec.ts` | Adds to cart and validates cart badge counts. | Cover checkout regressions or cart UX tweaks. |
| `package.json` | Declares `@playwright/test` dependency. | Add tooling (linters, reporters) or scripts. |
| `playwright.config.ts` | Central config for browsers, retries, reporters (currently empty). | Configure base URL, timeouts, retries, or reporters. |

---

## 🔧 Technology Stack

### Core Technologies
- **Language:** TypeScript – Enables typed Playwright page objects and spec files.
- **Framework:** `@playwright/test` 1.55.x – Provides fixtures, reporters, and cross-browser execution.
- **Test Runner:** Playwright CLI – Orchestrates headless/headed browsers and produces artifacts.
- **Target Application:** `walmart.emperia-staging.com` (cyber experience feed) – External system under test.

### Key Libraries
- **`@playwright/test`** – Supplies the `test/expect` APIs, fixtures, and assertions used everywhere.

### Development Tools
- **Node.js / npm** – Dependency management and script execution.
- **Playwright HTML report** – Inspect previous runs via `npx playwright show-report`.

---

## 🌐 External Dependencies

### Required Services
- **walmart.emperia-staging.com** – Staging environment providing the immersive realms and embedded store iframes.

### Optional Integrations
- None documented; tests currently interact only with the staging front-end.

---

## 🔄 Common Workflows

### Realm Smoke Test
1. Create or update a spec under `tests/` that instantiates `HomePage`.
2. Use `home.open()` and `home.clickRealm("<Realm Name>")` to reach the experience.
3. Call `home.clickClose()` to dismiss tutorials before performing assertions.
**Code path:** `tests/<spec>.spec.ts` → `HomePage` methods → remote realm UI.

### Product Modal + Cart Validation
1. After entering a realm, instantiate `StorePage` and call `openFirstProduct()`.
2. Use `addProduct()` to trigger cart updates, then assert via iframe locators.
3. Optionally re-use `expectMoreThanOneWalmartImage()` to verify media rendering.
**Code path:** `tests/checkout.spec.ts` → `StorePage` methods → experience iframe DOM.

---

## 🚨 Things to Be Careful About

### 🔒 Security & Stability
- Tests rely on a third-party staging experience; DOM changes (iframe titles, selectors, tutorial button labels) will break locators quickly—keep selectors resilient and scoped.
- `StorePage` accesses nested iframes; ensure waits are in place before interacting to avoid flaky runs.
- No secrets are stored in the repo, but environment variables (if introduced) should be handled via Playwright config or CI secrets, not committed.

*Update to last commit: 84c05fd41d1d703caae1725438e37d4dcaa0daf8*
