#!/bin/sh
set -e

if [ -n "$DATABASE_URL" ]; then
  uri="${DATABASE_URL#*://}"

  userpass="${uri%%@*}"
  hostportdb="${uri#*@}"

  user="${userpass%%:*}"
  pass="${userpass#*:}"

  hostport="${hostportdb%%/*}"
  db="${hostportdb#*/}"
  db="${db%%\?*}"

  case "$hostport" in
    *:*)
      host="${hostport%%:*}"
      port="${hostport#*:}"
      ;;
    *)
      host="$hostport"
      port="5432"
      ;;
  esac

  export ConnectionStrings__Painel="Host=$host;Port=$port;Database=$db;Username=$user;Password=$pass"
fi

exec dotnet Painel.Bff.dll "$@"
