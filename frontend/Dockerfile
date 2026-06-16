# ビルドコンテキストはモノレポルート（docker-compose.ymlから context: . で指定）
# frontend/tsconfig.json が ../backend/src を参照するため、
# TypeScript のビルド時にバックエンドの node_modules も必要

FROM oven/bun:1-alpine AS deps
WORKDIR /app/frontend
COPY frontend/package.json frontend/bun.lock ./
RUN bun install --frozen-lockfile

FROM oven/bun:1-alpine AS builder
WORKDIR /app
# バックエンド依存（TypeScript の型チェック用のみ。実行時には不要）
COPY backend/package.json backend/bun.lock ./backend/
RUN cd backend && bun install --frozen-lockfile
# フロントエンド
COPY --from=deps /app/frontend/node_modules ./frontend/node_modules
COPY frontend/ ./frontend/
COPY backend/src/ ./backend/src/
WORKDIR /app/frontend
ENV NEXT_TELEMETRY_DISABLED=1
RUN bun run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=builder /app/frontend/.next/standalone ./
COPY --from=builder /app/frontend/.next/static ./.next/static
COPY --from=builder /app/frontend/public ./public
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
CMD ["node", "server.js"]
