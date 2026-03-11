#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 2 ]]; then
  echo "Usage: $0 <BACKEND_URL> <FRONTEND_URL>"
  exit 1
fi

BACKEND_URL="${1%/}"
FRONTEND_URL="${2%/}"

"$(dirname "$0")/smoke_check.sh" "$BACKEND_URL" "$FRONTEND_URL"
