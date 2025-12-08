# Stage 1: Build the application
FROM node:18

WORKDIR /app

# Create directory structure first
RUN mkdir -p build/src/controllers/auth \
    build/src/controllers/common \
    build/src/middleware \
    build/src/validators/auth \
    build/src/utils

# Copy package files and configs
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm install

# Copy source files
COPY src/ ./src/
COPY index.ts ./
COPY pluto_private_key.pem ./
COPY .env ./

# Add this before the build command
RUN npm install -g tsc-alias

# Modify build command
RUN npm run build && \
    tsc-alias && \
    npm prune --omit=dev


EXPOSE 10000

CMD ["node", "-r", "module-alias/register", "./build/index.js"]