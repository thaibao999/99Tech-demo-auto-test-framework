# Automation Test Framework

Automated tests for [DemoBlaze](https://www.demoblaze.com/).

## Features

- **UI and API testing:** Playwright + TypeScript across Chromium, Firefox and WebKit, with browser-free API tests.
- **Reusable test architecture:** page objects, UI components, API clients, shared fixtures and API-based authentication.
- **Flexible execution:** environment profiles plus `@smoke`, `@regression` and per-case tags such as `@TC-LOGIN-001`.
- **Diagnostics and reports:** HTML, list and JUnit reports, with traces, screenshots and videos retained on failure.
- **Pre-commit checks:** Husky and lint-staged automatically run ESLint on staged TypeScript and JavaScript files.
- **Performance and CI:** k6 load testing, code-quality checks and pull-request workflows that run only affected tests.

## Execute the demo scripts

From the project root:

1. Run `./scripts/bootstrap.sh`. It installs dependencies and browsers, and creates `.env`. Then set `TEST_ACCOUNT_PASSWORD` in `.env`.
2. Run `npm test` to execute the all demo scripts.
3. Run `npx playwright show-report` to open the HTML report.

Refer the commands in [running tests](#running-tests) to run the full suite, API tests, UI tests or a specific test case.

## Setup

Requires Node 26 (pinned in `.nvmrc`). With [nvm](https://github.com/nvm-sh/nvm), run `nvm install && nvm use`.

```bash
npm ci
npx playwright install --with-deps   # browsers; on Linux this also installs OS packages with sudo
cp .env.example .env                 # then set TEST_ACCOUNT_PASSWORD
```

Or run `./scripts/bootstrap.sh` on macOS or Linux. It checks your Node version, runs the same steps,
and is safe to re-run. It doesn't install system tools or change your shell profile.

k6 is only needed for the load test. See [`load-tests/README.md`](load-tests/README.md).

## Configuration

Settings live in `.env` (gitignored). Copy it from `.env.example`.

| Variable                | Required | Purpose                                                                             |
| ----------------------- | -------- | ----------------------------------------------------------------------------------- |
| `TEST_ACCOUNT_PASSWORD` | Yes      | Password shared by all test accounts. Read by the Playwright suite and the k6 test. |
| `ENVIRONMENT`           | No       | `dev`, `qa`, `staging` or `production`. Defaults to `qa`.                           |
| `BASE_URL`, `API_URL`   | No       | Override the URLs for the chosen environment.                                       |

Environment URLs are defined in `e2e-tests/config/test-environments.ts`. `production` has no built-in
URLs, so set `BASE_URL` and `API_URL` for it. Variables already set in your shell or CI take precedence over `.env`.

## Running tests

```bash
npm test                                   # full suite
npm run test:smoke                         # @smoke only
npm run test:regression                    # @regression only
npm run test:api                           # API tests (no browser)
npm run test:ui                            # UI tests in chromium, firefox and webkit
npx playwright test --grep @TC-LOGIN-001         # one case by its ID
npx playwright test --project=chromium --headed
ENVIRONMENT=staging npm run test:smoke     # run against another environment
```

Playwright projects: `api`, `chromium`, `firefox`, `webkit`. The API tests (`*.api.spec.ts`) run only in
the `api` project.

## Load test

```bash
set -a && source .env && set +a && k6 run load-tests/login.load.js
```

k6 doesn't read `.env` itself, so the first part exports it. See [`load-tests/README.md`](load-tests/README.md) for
options and pass/fail thresholds.

## Project structure

```
e2e-tests/
├── api-client/        # Wrappers over the site API such as AuthClient (signup/login) and CartClient (clearCart)
├── config/            # Environment profiles (test-environments.ts)
├── fixtures/          # base-test.ts: shared fixtures (log, api, account, authenticated, storageState)
├── pages/             # Page objects
├── ui-components/     # Reusable components, such as modals
├── tests/
│   ├── cart/          # cart test scripts
│   └── login/         # login test scripts
└── utils/             # env, auth, logger, browser alert helpers
load-tests/            # k6 load test and its README
scripts/bootstrap.sh   # Local setup script
.github/workflows/     # CI workflows (see below)
```

## CI

Workflows are in `.github/workflows/`:

- **`pr-affected-tests.yml`** (every pull request): runs lint and typecheck, then runs only the spec files
  affected by the PR, in the `api`, `chromium` and `firefox` projects.
- **`run-demo-tests.yml`** (manual, `workflow_dispatch`): runs the tests matching a `--grep` input
  (for example `@regression`, `@smoke` or `@TC-LOGIN-001`) in the same projects. Tick **load-test** to also run the
  k6 load test. The k6 test targets a public third-party site, so it only runs when you ask for it.

Test reports and the k6 summary are uploaded as artifacts. `TEST_ACCOUNT_PASSWORD` comes from the
repository secret of the same name.

## Affected-test selection

On pull requests, Playwright runs `--only-changed=<base sha>`. It runs every spec that changed, or that
imports a changed file, directly or indirectly. Example PR: https://github.com/thaibao999/99Tech-demo-auto-test-framework/pull/1

To check locally:

```bash
npx playwright test --only-changed=origin/main
```

Limits:

- Selection works per spec file, not per test. Changing `BasePage` runs every spec that imports a page object.
- Changes to `package.json`, `package-lock.json`, `tsconfig.json` or `.github/actions/setup/**` don't select
  anything by themselves. Run `run-demo-tests.yml` manually after changing them.
