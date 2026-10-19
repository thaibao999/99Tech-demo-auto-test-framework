#!/usr/bin/env bash
#
# One-step project setup for macOS and Linux.
# Installs: base tools, nvm, the Node version from package.json (engines.node),
# npm dependencies, Playwright browsers (+ OS deps), k6, and .env.
# Safe to re-run: every step checks first and skips work that is already done.

set -euo pipefail

NVM_VERSION="v0.40.3"
K6_DOCS_URL="https://grafana.com/docs/k6/latest/set-up/install-k6/"

SKIP_BROWSERS=false
SKIP_K6=false
SKIP_VERIFY=false

info() { printf '\033[1;34m==>\033[0m %s\n' "$*"; }
ok() { printf '\033[1;32m ok\033[0m %s\n' "$*"; }
warn() { printf '\033[1;33mwarn\033[0m %s\n' "$*" >&2; }
fail() {
  printf '\033[1;31mfail\033[0m %s\n' "$*" >&2
  exit 1
}
has() { command -v "$1" >/dev/null 2>&1; }

usage() {
  cat <<'EOF'
Usage: scripts/bootstrap.sh [options]

Sets up everything this project needs: nvm, Node (from package.json engines.node),
npm dependencies, Playwright browsers, k6, and .env.

Options:
  --skip-browsers   Do not install Playwright browsers / OS dependencies
  --skip-k6         Do not install k6
  --skip-verify     Do not run the final sanity check
  -h, --help        Show this help
EOF
}

for arg in "$@"; do
  case "$arg" in
    --skip-browsers) SKIP_BROWSERS=true ;;
    --skip-k6) SKIP_K6=true ;;
    --skip-verify) SKIP_VERIFY=true ;;
    -h | --help)
      usage
      exit 0
      ;;
    *)
      usage >&2
      fail "Unknown option: $arg"
      ;;
  esac
done

cd "$(dirname "${BASH_SOURCE[0]}")/.."
[ -f package.json ] || fail "package.json not found in $(pwd)"

# --- OS detection -----------------------------------------------------------
OS="$(uname -s)"
case "$OS" in
  Darwin | Linux) info "Detected $OS" ;;
  *) fail "Unsupported OS '$OS'. This script supports macOS and Linux only." ;;
esac

IS_DEBIAN=false
if [ "$OS" = "Linux" ] && has apt-get; then IS_DEBIAN=true; fi

SUDO=""
if [ "$(id -u)" -ne 0 ] && has sudo; then SUDO="sudo"; fi

# --- Base tools -------------------------------------------------------------
info "Checking base tools"
if [ "$OS" = "Darwin" ]; then
  if ! xcode-select -p >/dev/null 2>&1; then
    warn "Xcode Command Line Tools are missing; starting installer."
    xcode-select --install || true
    fail "Finish the Xcode Command Line Tools installation, then re-run this script."
  fi
  if ! has brew; then
    if [ "$SKIP_K6" = true ]; then
      warn "Homebrew not found (only needed for k6, skipped)."
    else
      info "Installing Homebrew"
      /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
      if [ -x /opt/homebrew/bin/brew ]; then
        eval "$(/opt/homebrew/bin/brew shellenv)"
      elif [ -x /usr/local/bin/brew ]; then
        eval "$(/usr/local/bin/brew shellenv)"
      fi
    fi
  fi
else
  missing=()
  for tool in git curl; do has "$tool" || missing+=("$tool"); done
  if [ "${#missing[@]}" -gt 0 ]; then
    if [ "$IS_DEBIAN" = true ]; then
      info "Installing: ${missing[*]}"
      $SUDO apt-get update
      $SUDO apt-get install -y "${missing[@]}"
    else
      fail "Missing required tools: ${missing[*]}. Install them and re-run."
    fi
  fi
fi
has git || fail "git is required."
has curl || fail "curl is required."
ok "git, curl"

# --- nvm --------------------------------------------------------------------
export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
if [ ! -s "$NVM_DIR/nvm.sh" ]; then
  info "Installing nvm $NVM_VERSION"
  curl -fsSL "https://raw.githubusercontent.com/nvm-sh/nvm/$NVM_VERSION/install.sh" | PROFILE=/dev/null bash
  warn "nvm was installed to $NVM_DIR. Add the nvm init lines to your shell profile (see https://github.com/nvm-sh/nvm#installing-and-updating)."
fi
# nvm.sh is not safe under `set -u` / `set -e`
set +eu
# shellcheck disable=SC1091
. "$NVM_DIR/nvm.sh"
set -eu
has nvm >/dev/null 2>&1 || type nvm >/dev/null 2>&1 || fail "Could not load nvm from $NVM_DIR/nvm.sh"
ok "nvm $(nvm --version)"

# --- Node (package.json engines.node is the source of truth) ----------------
NODE_VERSION="$(sed -n 's/.*"engines"[^{]*{[^}]*"node"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' <(tr '\n' ' ' <package.json) | head -n1)"
# Reduce a range like ">=26" or "^26.1.0" to a version nvm understands.
NODE_VERSION="$(printf '%s' "$NODE_VERSION" | sed 's/^[^0-9]*//')"
[ -n "$NODE_VERSION" ] || fail "Could not read engines.node from package.json"
NODE_MAJOR="${NODE_VERSION%%.*}"

info "Ensuring Node $NODE_VERSION (from package.json engines.node)"
set +eu
nvm install "$NODE_VERSION"
install_status=$?
nvm use "$NODE_VERSION" >/dev/null
use_status=$?
set -eu
[ "$install_status" -eq 0 ] || fail "nvm install $NODE_VERSION failed"
[ "$use_status" -eq 0 ] || fail "nvm use $NODE_VERSION failed"

ACTUAL_MAJOR="$(node -p 'process.versions.node.split(".")[0]')"
[ "$ACTUAL_MAJOR" = "$NODE_MAJOR" ] ||
  fail "Expected Node $NODE_MAJOR but got $(node -v)"
ok "node $(node -v), npm $(npm -v)"

# --- npm dependencies -------------------------------------------------------
if [ -f package-lock.json ]; then
  info "Installing npm dependencies (npm ci)"
  npm ci
else
  info "Installing npm dependencies (npm install)"
  npm install
fi

# --- Playwright browsers ----------------------------------------------------
if [ "$SKIP_BROWSERS" = true ]; then
  warn "Skipping Playwright browsers (--skip-browsers)"
else
  info "Installing Playwright browsers and OS dependencies"
  npx playwright install --with-deps
fi

# --- k6 ---------------------------------------------------------------------
if [ "$SKIP_K6" = true ]; then
  warn "Skipping k6 (--skip-k6)"
elif has k6; then
  ok "k6 already installed ($(k6 version | head -n1))"
else
  info "Installing k6"
  if [ "$OS" = "Darwin" ]; then
    if has brew; then
      brew install k6
    else
      warn "Homebrew not available; install k6 manually: $K6_DOCS_URL"
    fi
  elif [ "$IS_DEBIAN" = true ]; then
    $SUDO mkdir -p /etc/apt/keyrings
    curl -fsSL https://dl.k6.io/key.gpg | $SUDO gpg --dearmor --yes -o /etc/apt/keyrings/k6-archive-keyring.gpg
    echo "deb [signed-by=/etc/apt/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" |
      $SUDO tee /etc/apt/sources.list.d/k6.list >/dev/null
    $SUDO apt-get update
    $SUDO apt-get install -y k6
  else
    warn "Automatic k6 install is not supported on this Linux distro. See: $K6_DOCS_URL"
  fi
fi

# --- .env -------------------------------------------------------------------
if [ -f .env ]; then
  ok ".env already exists"
elif [ -f .env.example ]; then
  cp .env.example .env
  ok "Created .env from .env.example"
else
  warn ".env.example not found; skipped .env"
fi
if [ -f .env ] && ! grep -Eq '^TEST_ACCOUNT_PASSWORD=.+' .env; then
  warn "TEST_ACCOUNT_PASSWORD is not set in .env; tests that log in will fail until you set it"
fi

# --- Sanity check -----------------------------------------------------------
if [ "$SKIP_VERIFY" = true ]; then
  warn "Skipping sanity check (--skip-verify)"
else
  info "Sanity check"
  echo "node       $(node -v)"
  echo "npm        $(npm -v)"
  echo "playwright $(npx playwright --version)"
  if has k6; then echo "k6         $(k6 version | head -n1)"; else echo "k6         not installed"; fi

  info "npm run typecheck"
  npm run typecheck
fi

echo
ok "Setup complete."
echo "This script runs in a subshell, so your current terminal is unchanged. Run:"
echo "  nvm use $NODE_VERSION            # for this terminal"
echo "  nvm alias default $NODE_VERSION  # optional: make it your default"
