# Backend
FROM node:22-slim

WORKDIR /app

# Copy package files first for caching
COPY package*.json ./
RUN npm ci

# Copy source
COPY src/ ./src/

EXPOSE 3001

CMD ["node", "--watch", "--import", "tsx", "src/index.ts"]