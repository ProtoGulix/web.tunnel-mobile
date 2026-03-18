#!/bin/sh
# Génère un fichier JS de config runtime lu par l'app avant son démarrage.
# La variable API_URL est passée via docker-compose environment:.
cat > /usr/share/nginx/html/env-config.js << EOF
window.__APP_CONFIG__ = {
  apiUrl: "${API_URL}"
};
EOF

exec nginx -g 'daemon off;'
