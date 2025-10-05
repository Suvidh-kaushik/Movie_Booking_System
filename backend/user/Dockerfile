########################################
# Stage 1: Build (compile TypeScript)
########################################
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

########################################
# Stage 2: Runtime
########################################
FROM node:20-alpine AS runner

ENV NODE_ENV=production \
    PORT=5000

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist

EXPOSE 5000

USER node

CMD ["node", "dist/index.js"]
