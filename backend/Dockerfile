# ── Production image — Node 24 Alpine ────────────────────────────────────────
FROM node:24-alpine AS runner

# Security: non-root user
RUN addgroup -g 1001 -S nexus && adduser -S nexus -u 1001

WORKDIR /app

# Install deps first (layer cache)
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev --prefer-offline

# Copy source
COPY --chown=nexus:nexus . .

# Create logs directory
RUN mkdir -p logs && chown nexus:nexus logs

USER nexus

EXPOSE 1337

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=1337

HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
  CMD wget -qO- http://localhost:1337/health || exit 1

CMD ["node", "server.js"]
