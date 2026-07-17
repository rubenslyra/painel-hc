#!/bin/sh
set -e

cat > /usr/share/nginx/html/assets/app-config.json <<EOF
{
  "apiBaseUrl": "${API_BASE_URL:-/api/v1}",
  "erpBaseUrl": "${ERP_BASE_URL:-}",
  "syncPollingMs": ${SYNC_POLLING_MS:-5000}
}
EOF

exec nginx -g "daemon off;"
