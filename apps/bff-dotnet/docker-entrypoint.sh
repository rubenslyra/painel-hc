#!/bin/sh
set -e

if [ -n "$DATABASE_URL" ]; then
  URI="${DATABASE_URL#postgres://}"
  DB_USER="${URI%%:*}"
  REST="${URI#*:}"
  DB_PASS="${REST%%@*}"
  REST="${REST#*@}"
  DB_HOST="${REST%%:*}"
  REST="${REST#*:}"
  DB_PORT="${REST%%/*}"
  DB_NAME="${REST#*/}"
  DB_NAME="${DB_NAME%%\?*}"
  export ConnectionStrings__Painel="Host=$DB_HOST;Port=$DB_PORT;Database=$DB_NAME;Username=$DB_USER;Password=$DB_PASS"
fi

exec dotnet Painel.Bff.dll "$@"
