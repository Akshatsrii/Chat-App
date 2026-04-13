# ── Production image — Node 24 Alpine ────────────────────────────────────────
FROM node:24-alpine AS base

# ── Dependency layer ──────────────────────────────────────────────────────────
FROM base AS deps

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --omit=dev --prefer-offline && \
    npm cache clean --force

# ── Runner ────────────────────────────────────────────────────────────────────
FROM base AS runner

# Security hardening
RUN apk add --no-cache wget dumb-init tini && \
    apk upgrade --no-cache && \
    rm -rf /var/cache/apk/*

# Non-root user
RUN addgroup -g 1001 -S nexus && \
    adduser -S nexus -u 1001 -G nexus

WORKDIR /app

# Copy only prod node_modules from deps stage
COPY --from=deps --chown=nexus:nexus /app/node_modules ./node_modules

# Copy source (respect .dockerignore)
COPY --chown=nexus:nexus . .

# Runtime directories with correct ownership
RUN mkdir -p logs tmp && \
    chown -R nexus:nexus logs tmp && \
    chmod 750 logs tmp

# Drop to non-root
USER nexus

# Metadata labels
LABEL org.opencontainers.image.title="NexusChat" \
      org.opencontainers.image.description="NexusChat production server" \
      org.opencontainers.image.base.name="node:24-alpine"

EXPOSE 1337

ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=1337 \
    # Prevent Node.js from running as PID 1
    NPM_CONFIG_LOGLEVEL=warn \
    # V8 memory tuning for containers
    NODE_OPTIONS="--max-old-space-size=512"

HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
    CMD wget -qO- http://localhost:${PORT}/health || exit 1

# tini as PID 1 — proper signal handling & zombie reaping
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "server.js"]