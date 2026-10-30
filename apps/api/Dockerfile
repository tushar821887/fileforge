# FormatFlow API Dockerfile
FROM node:22-bullseye-slim AS builder

WORKDIR /app

# Install build essentials for native addons if needed
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy root workspace configurations
COPY package*.json ./
COPY packages/shared/package*.json ./packages/shared/
COPY apps/api/package*.json ./apps/api/

# Install dependencies
RUN npm ci

# Copy source files
COPY packages/shared/ ./packages/shared/
COPY apps/api/ ./apps/api/

# Build shared package and api
RUN npm --prefix packages/shared run build
RUN npm --prefix apps/api run build

# Production runtime container
FROM node:22-bullseye-slim AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# Install headless LibreOffice and Poppler utilities for server-side document & PDF operations
RUN apt-get update && apt-get install -y --no-install-recommends \
    libreoffice-nogui \
    poppler-utils \
    fonts-dejavu \
    fonts-liberation \
    && rm -rf /var/lib/apt/lists/*

# Copy package manifests and install only production dependencies
COPY package*.json ./
COPY packages/shared/package*.json ./packages/shared/
COPY apps/api/package*.json ./apps/api/

RUN npm ci --omit=dev

# Copy built artifacts from builder stage
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/apps/api/dist ./apps/api/dist

# Expose API port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD node -e "fetch('http://localhost:3000/api/v1/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["node", "apps/api/dist/src/main.js"]
