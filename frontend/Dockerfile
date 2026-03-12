# ============================================================
# Digital CMO AI — Frontend Dockerfile
# Multi-stage: dev (Vite HMR) + build + serve (nginx)
# ============================================================

# ── Stage 1: deps (shared) ───────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# ── Stage 2: dev (Vite dev server with HMR) ─────────────────
FROM node:20-alpine AS dev
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]

# ── Stage 3: build (production bundle) ──────────────────────
FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}
RUN npm run build

# ── Stage 4: serve (nginx static) ───────────────────────────
FROM nginx:alpine AS serve
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]
