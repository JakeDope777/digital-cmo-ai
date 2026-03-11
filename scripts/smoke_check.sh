#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 2 ]]; then
  echo "Usage: $0 <BACKEND_URL> <FRONTEND_URL>"
  exit 1
fi

BACKEND_URL="${1%/}"
FRONTEND_URL="${2%/}"

assert_preflight() {
  local path="$1"
  local method="$2"
  local request_headers="$3"
  local response
  response="$(
    curl -sS -D - -o /dev/null -X OPTIONS "$BACKEND_URL$path" \
      -H "Origin: $FRONTEND_URL" \
      -H "Access-Control-Request-Method: $method" \
      -H "Access-Control-Request-Headers: $request_headers"
  )"

  if echo "$response" | head -n 1 | grep -q " 400 "; then
    echo "Preflight failed for $path"
    echo "$response"
    exit 1
  fi

  echo "$response" | tr -d '\r' | grep -iq "^access-control-allow-origin: $FRONTEND_URL$" || {
    echo "Missing allow-origin for $path"
    echo "$response"
    exit 1
  }
  echo "$response" | tr -d '\r' | grep -iq "^access-control-allow-methods: .*${method}" || {
    echo "Missing allow-methods for $path"
    echo "$response"
    exit 1
  }
  echo "$response" | tr -d '\r' | grep -iq "^access-control-allow-headers: .*content-type" || {
    echo "Missing content-type allow-header for $path"
    echo "$response"
    exit 1
  }
}

echo "[1/12] Backend health"
curl -fsS "$BACKEND_URL/health" >/dev/null

echo "[2/12] Backend readiness"
curl -fsS "$BACKEND_URL/health/ready" >/dev/null

echo "[3/12] Launch readiness"
curl -fsS "$BACKEND_URL/health/launch-readiness" >/dev/null

echo "[4/12] Billing health"
curl -fsS "$BACKEND_URL/billing/health" >/dev/null

echo "[5/12] Growth funnel summary"
curl -fsS "$BACKEND_URL/growth/funnel-summary?days=14" >/dev/null

echo "[6/12] Growth preflight"
assert_preflight "/growth/track" "POST" "content-type,authorization"

echo "[7/12] Launch readiness preflight"
assert_preflight "/health/launch-readiness" "GET" "content-type"

echo "[8/12] Frontend landing"
curl -fsS "$FRONTEND_URL/" >/dev/null

echo "[9/12] Frontend login"
curl -fsS "$FRONTEND_URL/login" >/dev/null

echo "[10/12] Frontend register"
curl -fsS "$FRONTEND_URL/register" >/dev/null

echo "[11/12] Frontend verify-email"
curl -fsS "$FRONTEND_URL/verify-email" >/dev/null

echo "[12/12] Frontend investor demo route"
curl -fsS "$FRONTEND_URL/demo/investor-pitch-demo.html" >/dev/null

echo "Smoke checks passed for:"
echo "- Backend: $BACKEND_URL"
echo "- Frontend: $FRONTEND_URL"
