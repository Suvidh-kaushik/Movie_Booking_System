########################################
# Stage 1: Build (compile TypeScript)
########################################
FROM node:20-alpine AS builder

# Create app directory
WORKDIR /app

# Install dependencies first (leverage Docker layer caching)
COPY package*.json ./
RUN npm install

# Copy source and build
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

########################################
# Stage 2: Runtime (small, production-only)
########################################
FROM node:20-alpine AS runner

ENV NODE_ENV=production \
    PORT=5001

# Create non-root user and app directory
WORKDIR /app

# Install only production deps
COPY package*.json ./
RUN npm ci --omit=dev

# Copy compiled dist from builder
COPY --from=builder /app/dist ./dist

# Expose port (for observability; service is mostly a queue consumer)
EXPOSE 3001

# Healthcheck (basic TCP check)
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('net').createConnection(process.env.PORT || 3001, '127.0.0.1').on('error',()=>process.exit(1)).on('connect',()=>process.exit(0))"

# Use non-root user provided by the node image
USER node

# Run the service
CMD ["node", "dist/index.js"]
