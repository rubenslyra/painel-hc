#!/bin/sh
set -e

API_BASE_URL="${API_BASE_URL:-/api/v1}"
ERP_BASE_URL="${ERP_BASE_URL:-}"
SYNC_POLLING_MS="${SYNC_POLLING_MS:-5000}"

envsubst < /usr/share/nginx/html/assets/app-config.json > /usr/share/nginx/html/assets/app-config.tmp
mv /usr/share/nginx/html/assets/app-config.tmp /usr/share/nginx/html/assets/app-config.json

exec nginx -g "daemon off;"
