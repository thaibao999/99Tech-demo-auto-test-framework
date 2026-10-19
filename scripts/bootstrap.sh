#!/usr/bin/env bash
#
# Project setup for macOS and Linux. Requires the Node version in .nvmrc.
# Installs npm dependencies and Playwright browsers, and creates .env.
# It does not install system tools or edit your shell profile. Safe to re-run.

set -euo pipefail

info() { printf '\033[1;34m==>\033[0m %s\n' "$*"; }
warn() { printf '\033[1;33mwarn\033[0m %s\n' "$*" >&2; }
fail() {
  printf '\033[1;31mfail\033[0m %s\n' "$*" >&2
  exit 1
}

cd "$(dirname "${BASH_SOURCE[0]}")/.."

REQUIRED_MAJOR="$(tr -d '[:space:]v' <.nvmrc)"
command -v node >/dev/null 2>&1 ||
  fail "Node is not installed. Install Node $REQUIRED_MAJOR (with nvm: nvm install), then re-run."
CURRENT_MAJOR="$(node -p 'process.versions.node.split(".")[0]')"
[ "$CURRENT_MAJOR" = "$REQUIRED_MAJOR" ] ||
  fail "This project needs Node $REQUIRED_MAJOR, but you have $(node -v). With nvm: nvm install && nvm use"

info "Installing npm dependencies"
npm ci

info "Installing Playwright browsers"
npx playwright install --with-deps

if [ ! -f .env ]; then
  cp .env.example .env
  info "Created .env from .env.example"
fi
grep -Eq '^TEST_ACCOUNT_PASSWORD=.+' .env ||
  warn "Set TEST_ACCOUNT_PASSWORD in .env. Tests that log in fail without it."

command -v k6 >/dev/null 2>&1 ||
  warn "k6 not found. It is only needed for the load test: https://grafana.com/docs/k6/latest/set-up/install-k6/"

info "Setup complete. Run: npm test"
