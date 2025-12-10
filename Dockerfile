# Stage 1: Build the application
FROM node:20-slim AS builder

WORKDIR /app

# Copy package files and configs
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm install  

# Install tsc-alias globally
RUN npm install -g tsc-alias

# Copy source files
COPY src ./src
COPY index.ts ./
COPY pluto_private_key.pem ./
COPY .env ./

# Build application
RUN npm run build && \
    tsc-alias && \
    npm prune --omit=dev

# Stage 2: Production
FROM node:20-slim

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/build ./build
COPY --from=builder /app/package.json .
COPY --from=builder /app/pluto_private_key.pem .
COPY --from=builder /app/.env .

ENV NODE_ENV=production
EXPOSE 9019

CMD ["node", "-r", "module-alias/register", "./build/index.js"]
