# ── Build stage ──
FROM node:22-alpine3.22 AS build
WORKDIR /app

# Copiar package files primero (cachear npm install)
COPY package.json package-lock.json* ./
RUN npm install --legacy-peer-deps

# Copiar código fuente y construir
COPY . .
RUN npm run web:build

# ── Runtime stage ──
FROM node:22-alpine3.22 AS runtime
WORKDIR /app

# Crear usuario no-root
RUN addgroup -S appuser && adduser -S appuser -G appuser

# Solo copiar lo necesario para producción
COPY package.json package-lock.json* ./
RUN npm install --legacy-peer-deps --omit=dev && npm cache clean --force

COPY server.js .
COPY --from=build /app/dist ./dist

RUN mkdir -p /app/logs && chown -R appuser:appuser /app

USER appuser

ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:8080/ || exit 1

CMD ["node", "server.js"]
