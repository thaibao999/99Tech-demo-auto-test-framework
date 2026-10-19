# Automation Test Framework

Automated tests for [DemoBlaze](https://www.demoblaze.com/).

- **Playwright + TypeScript:** UI tests in Chromium, Firefox and Safari, plus API tests that don't use a browser.
- **k6:** a separate API load test (demo with login endpoints), in [`load-tests/`](load-tests/README.md).
- **Tags:** `@smoke`, `@regression`, and per-case IDs such as `@TC-LOGIN-001`.

## Setup

Run the bootstrap script on macOS or Linux. It installs everything and creates `.env`:

```bash
./scripts/bootstrap.sh
```

It is safe to re-run. Options: `--skip-browsers`, `--skip-k6`, `--skip-verify`. Run `./scripts/bootstrap.sh -h` for details.

Afterwards, run `nvm use` in the repo. It reads the Node version from `.nvmrc`. The script can't switch
your current terminal's Node version.

To make Node 26 the default for every new terminal, run `nvm alias default 26`. This also affects
other projects on your machine.

<details>
<summary>Manual setup</summary>

```bash
nvm install 26 && nvm use 26   # Node version from package.json (engines.node)
npm install
npx playwright install --with-deps
cp .env.example .env           # then set TEST_ACCOUNT_PASSWORD
```

</details>

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
│   ├── cart/          # order.ui.spec.ts + order.testdata.ts
│   └── login/         # login.ui.spec.ts, login.api.spec.ts + login.testdata.ts
└── utils/             # env, auth, logger, browser alert helpers
load-tests/            # k6 load test and its README
scripts/bootstrap.sh   # One-step local setup
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
imports a changed file, directly or indirectly. To check locally:

```bash
npx playwright test --only-changed=origin/main
```

Limits:

- Selection works per spec file, not per test. Changing `BasePage` runs every spec that imports a page object.
- Changes to `package.json`, `package-lock.json`, `tsconfig.json` or `.github/actions/setup/**` don't select
  anything by themselves. Run `run-demo-tests.yml` manually after changing them.
