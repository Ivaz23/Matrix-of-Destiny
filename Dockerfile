FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies for build
COPY package*.json ./
RUN npm install

# Copy source code and build Vite frontend + Express server bundle
COPY . .
RUN npm run build

# Production runtime image
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Install production dependencies only
COPY package*.json ./
RUN npm install --omit=dev

# Copy build artifacts
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public

EXPOSE 3000

CMD ["node", "dist/server.cjs"]
