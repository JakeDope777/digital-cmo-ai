#!/usr/bin/env bash
  set -euo pipefail

  export VITE_API_URL="${VITE_API_URL:-https://digital-cmo-api.onrender.com}"
  export VITE_APP_URL="${VITE_APP_URL:-https://${VERCEL_PROJECT_PRODUCTION_URL:-$VERCEL_URL}}"
  export VITE_SUPPORT_EMAIL="${VITE_SUPPORT_EMAIL:-hello@digitalcmo.ai}"

  cd frontend
  npm ci --legacy-peer-deps
  npm run build
  