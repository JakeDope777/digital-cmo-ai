#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 <FRONTEND_URL>"
  exit 1
fi

FRONTEND_URL="${1%/}"

declare -a ROUTES=(
  "/"
  "/login"
  "/register"
  "/verify-email"
  "/app/dashboard?demo=1"
  "/demo/investor-pitch-demo.html"
)

for route in "${ROUTES[@]}"; do
  echo "Checking ${FRONTEND_URL}${route}"
  curl -fsS "${FRONTEND_URL}${route}" >/dev/null
done

echo "Frontend route smoke checks passed for ${FRONTEND_URL}"
