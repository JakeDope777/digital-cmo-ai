#!/usr/bin/env bash
set -euo pipefail

default_app_host="${VERCEL_PROJECT_PRODUCTION_URL:-${VERCEL_URL:-digital-cmo-ai-live.vercel.app}}"

export VITE_API_URL="${VITE_API_URL:-https://digital-cmo-api.onrender.com}"
export VITE_APP_URL="${VITE_APP_URL:-https://${default_app_host}}"
export VITE_SUPPORT_EMAIL="${VITE_SUPPORT_EMAIL:-hello@digitalcmo.ai}"

cd frontend
npm install --legacy-peer-deps
npm run build
  
