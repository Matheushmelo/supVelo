# Estágio 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
RUN apk add --no-cache python3 make g++
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
RUN cp -r src/infrastructure/database/migrations dist/infrastructure/database/migrations

# Estágio 2: Runner
FROM node:20-alpine AS runner
WORKDIR /app
RUN apk add --no-cache python3 make g++
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
RUN mkdir -p /data
EXPOSE 3001
CMD ["node", "dist/main.js"]