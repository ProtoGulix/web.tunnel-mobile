# ── Stage 1 : build ──────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copie des manifestes en premier pour bénéficier du cache Docker
COPY package.json package-lock.json* ./

RUN npm ci

# Copie du reste du code source
COPY . .

# Build de production (génère /app/dist)
RUN npm run build

# ── Stage 2 : serve ───────────────────────────────────────────────────────────
FROM nginx:1.27-alpine AS runner

# Supprime la config nginx par défaut
RUN rm /etc/nginx/conf.d/default.conf

# Config nginx adaptée à une SPA React (redirige tout vers index.html)
COPY nginx.conf /etc/nginx/conf.d/app.conf

# Copie les fichiers buildés
COPY --from=builder /app/dist /usr/share/nginx/html

# Entrypoint qui génère env-config.js au démarrage depuis API_URL
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 80

CMD ["/docker-entrypoint.sh"]
