# Load tests (k6)

API load test for the Demoblaze `/login` endpoint, written for [k6](https://grafana.com/docs/k6/latest/).
It runs on its own and does not depend on the Playwright suite.

## Setup

1. Install k6 (`scripts/bootstrap.sh` does this for you), or manually:

   ```bash
   brew install k6
   ```

   Other platforms: [k6 installation guide](https://grafana.com/docs/k6/latest/set-up/install-k6/).

2. Set `TEST_ACCOUNT_PASSWORD` in `.env` (see `.env.example`).

## Run

From the repo root:

```bash
set -a && source .env && set +a && k6 run load-tests/login.load.js
```

k6 does not read `.env` on its own, so the `set -a && source .env && set +a` part exports it into
the shell first. To skip `.env`, pass the password directly:

```bash
k6 run -e TEST_ACCOUNT_PASSWORD='your-password' load-tests/login.load.js
```

## Options

Pass any of these with `-e NAME=value`:

| Variable            | Default                     | Meaning                      |
| ------------------- | --------------------------- | ---------------------------- |
| `RATE`              | `2`                         | Logins started per second    |
| `DURATION`          | `10s`                       | How long to keep that rate   |
| `PRE_ALLOCATED_VUS` | `2`                         | Virtual users ready at start |
| `MAX_VUS`           | `10`                        | Upper limit on virtual users |
| `API_URL`           | `https://api.demoblaze.com` | API to test                  |

Example: 5 logins per second for one minute.

```bash
set -a && source .env && set +a && k6 run -e RATE=5 -e DURATION=60s -e MAX_VUS=20 load-tests/login.load.js
```

The rate stays fixed even when responses slow down; k6 adds virtual users (up to `MAX_VUS`) to keep
up. If it warns about "Insufficient VUs", raise `MAX_VUS` or lower `RATE`.

## Pass / fail

The run fails (k6 exits non-zero) if either threshold is broken:

- `http_req_failed` — more than 2% of requests fail.
- `http_req_duration` — the 95th percentile is slower than 1000 ms.

The `check` lines (status 200, token returned) are reported in the summary but do not fail the run
by themselves.

## CI

The load test only runs when you start the **Run Demo Tests** workflow
(`.github/workflows/run-demo-tests.yml`) manually and tick **load-test**. The password comes from
the `TEST_ACCOUNT_PASSWORD` repository secret, and the k6 summary is uploaded as the `k6-summary`
artifact.
