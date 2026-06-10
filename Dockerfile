# ── Stage 1: Build ───────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

# Copy workspace manifests first (better layer cache)
COPY package*.json ./
COPY backend/package*.json ./backend/

# Install all deps (dev included — needed for tsc)
RUN npm ci --workspace=backend

# Copy source then compile
COPY backend/tsconfig*.json ./backend/
COPY backend/src ./backend/src
RUN npm run build --workspace=backend

# ── Stage 2: Runtime ─────────────────────────────────────────────────────────
FROM node:20-alpine
WORKDIR /app

COPY package*.json ./
COPY backend/package*.json ./backend/

# Production deps only
RUN npm ci --workspace=backend --omit=dev

COPY --from=builder /app/backend/dist ./backend/dist

# Cloud Run injects PORT at runtime (default 8080)
ENV PORT=8080
EXPOSE 8080

CMD ["node", "backend/dist/index.js"]
