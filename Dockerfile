FROM oven/bun:1 AS base

# Install dependencies
FROM base AS deps
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Build frontend
FROM deps AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package.json frontend/bun.lock ./
RUN bun install --frozen-lockfile
COPY frontend/ .
RUN bun run build

# Production
FROM base AS runner
WORKDIR /app

COPY package.json bun.lock ./
COPY --from=deps /app/node_modules ./node_modules

COPY src/ ./src/
COPY --from=frontend-builder /app/public ./public

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["bun", "run", "src/index.ts"]
