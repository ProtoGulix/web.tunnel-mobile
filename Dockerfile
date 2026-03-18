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

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
