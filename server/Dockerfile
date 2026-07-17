# =============================================
# TraffiTech Backend — Production Docker Image
# =============================================

# Stage 1: Base
FROM node:20-alpine AS base
WORKDIR /app

# Install dependencies first (layer caching)
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Stage 2: Production
FROM node:20-alpine AS production
WORKDIR /app

# Copy installed node_modules from base
COPY --from=base /app/node_modules ./node_modules

# Copy server source code
COPY . .

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S traffitech -u 1001
USER traffitech

# Expose the API port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

# Start the server
CMD ["node", "index.js"]
