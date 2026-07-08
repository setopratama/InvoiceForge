# Frontend
FROM node:22-slim

WORKDIR /app

# Copy package files first for caching
COPY package*.json ./
RUN npm ci

# Copy app files
COPY astro.config.mjs tsconfig.json package*.json ./
COPY src/ ./src/
COPY public/ ./public/

EXPOSE 4321

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]