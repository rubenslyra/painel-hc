#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
API_DIR="$ROOT/apps/api-springboot"
BFF_DIR="$ROOT/apps/bff-dotnet"
WEB_DIR="$ROOT/apps/web-angular"
LOG_DIR="$ROOT/.run"

usage() {
  echo "Uso: ./stack.sh <start|stop|restart|status|doctor|logs>"
  echo "Atalho: ./start-stack.sh"
}

version_ge() {
  [ "$(printf '%s\n%s\n' "$2" "$1" | sort -V | head -n1)" = "$2" ]
}

check_java() {
  command -v java >/dev/null 2>&1 || return 1
  local version major
  version="$(java -version 2>&1 | awk -F '"' '/version/ {print $2; exit}')"
  major="${version%%.*}"
  [ "$major" -ge 21 ]
}

check_dotnet() {
  command -v dotnet >/dev/null 2>&1 || return 1
  dotnet --list-sdks | grep -Eq '^10\.'
}

check_node() {
  command -v node >/dev/null 2>&1 || return 1
  local version major minor
  version="$(node -p "process.versions.node")"
  major="${version%%.*}"
  minor="${version#*.}"
  minor="${minor%%.*}"
  if [ "$major" -eq 20 ]; then version_ge "$version" "20.19.0"; return; fi
  if [ "$major" -eq 22 ]; then version_ge "$version" "22.12.0"; return; fi
  [ "$major" -ge 24 ]
}

check_npm() {
  command -v npm >/dev/null 2>&1
}

detect_pm() {
  if command -v apt-get >/dev/null 2>&1; then echo apt; return; fi
  if command -v dnf >/dev/null 2>&1; then echo dnf; return; fi
  if command -v yum >/dev/null 2>&1; then echo yum; return; fi
  if command -v pacman >/dev/null 2>&1; then echo pacman; return; fi
  if command -v brew >/dev/null 2>&1; then echo brew; return; fi
  echo none
}

install_linux_deps() {
  local pm
  pm="$(detect_pm)"
  case "$pm" in
    apt)
      sudo apt-get update
      sudo apt-get install -y openjdk-21-jdk postgresql npm
      echo "Instale o .NET SDK 10 pelo feed oficial da Microsoft se o pacote dotnet-sdk-10.0 nao existir no seu apt."
      sudo apt-get install -y dotnet-sdk-10.0 || true
      ;;
    dnf)
      sudo dnf install -y java-21-openjdk-devel postgresql-server npm dotnet-sdk-10.0
      ;;
    yum)
      sudo yum install -y java-21-openjdk-devel postgresql-server npm dotnet-sdk-10.0
      ;;
    pacman)
      sudo pacman -S --needed jdk21-openjdk postgresql npm dotnet-sdk
      ;;
    brew)
      brew install openjdk@21 postgresql@16 node
      echo "Instale o .NET SDK 10 pelo instalador oficial se nao estiver disponivel no Homebrew."
      brew install --cask dotnet-sdk || true
      ;;
    *)
      echo "Gerenciador de pacotes nao detectado. Instale Java 21, .NET SDK 10, Node.js 20.19+, 22.12+ ou 24+ e npm manualmente."
      return 1
      ;;
  esac
}

ensure_deps() {
  local missing=()
  check_java || missing+=("Java 21")
  check_dotnet || missing+=(".NET SDK 10")
  check_node || missing+=("Node.js 20.19+, 22.12+ ou 24+")
  check_npm || missing+=("npm")

  if [ "${#missing[@]}" -eq 0 ]; then
    echo "Dependencias principais OK."
    return 0
  fi

  echo "Dependencias ausentes ou em versao incompativel: ${missing[*]}"
  echo "Sera necessario instalar dependencias e recursos antes de rodar a stack."
  read -r -p "Deseja tentar instalar agora com sudo? [S/N] " answer
  case "$answer" in
    S|s) install_linux_deps ;;
    *) return 1 ;;
  esac

  check_java && check_dotnet && check_node && check_npm
}

ensure_npm_ci() {
  if [ ! -d "$WEB_DIR/node_modules" ]; then
    echo "Instalando dependencias do Angular com npm ci..."
    (cd "$WEB_DIR" && npm ci)
  fi
}

ensure_postgres_warning() {
  postgres_host_port="${POSTGRES_HOST_PORT:-15432}"
  if command -v nc >/dev/null 2>&1; then
    nc -z localhost "$postgres_host_port" >/dev/null 2>&1 && return 0
  elif command -v pg_isready >/dev/null 2>&1; then
    pg_isready -h localhost -p "$postgres_host_port" >/dev/null 2>&1 && return 0
  else
    return 0
  fi
  echo "Aviso: PostgreSQL nao respondeu em localhost:${postgres_host_port}."
  echo "O ERP Mock usa PostgreSQL por padrao. Configure o banco painel_hc_rm com usuario painel/painel ou ajuste SPRING_DATASOURCE_*."
}

open_stack_tabs() {
  mkdir -p "$LOG_DIR"
  local api_cmd bff_cmd web_cmd
  api_cmd="cd '$API_DIR'; SPRING_DATASOURCE_USERNAME=painel SPRING_DATASOURCE_PASSWORD=painel ./mvnw spring-boot:run"
  bff_cmd="cd '$BFF_DIR'; dotnet run --project src/Painel.Bff"
  web_cmd="cd '$WEB_DIR'; npm start"

  if command -v gnome-terminal >/dev/null 2>&1; then
    gnome-terminal --tab --title="HC ERP Mock" -- bash -lc "$api_cmd; exec bash" \
      --tab --title="HC BFF" -- bash -lc "$bff_cmd; exec bash" \
      --tab --title="HC Web" -- bash -lc "$web_cmd; exec bash"
  elif command -v konsole >/dev/null 2>&1; then
    konsole --new-tab -p tabtitle="HC ERP Mock" -e bash -lc "$api_cmd; exec bash" \
      --new-tab -p tabtitle="HC BFF" -e bash -lc "$bff_cmd; exec bash" \
      --new-tab -p tabtitle="HC Web" -e bash -lc "$web_cmd; exec bash"
  elif command -v xterm >/dev/null 2>&1; then
    xterm -T "HC ERP Mock" -e bash -lc "$api_cmd; exec bash" &
    xterm -T "HC BFF" -e bash -lc "$bff_cmd; exec bash" &
    xterm -T "HC Web" -e bash -lc "$web_cmd; exec bash" &
  else
    echo "Terminal grafico nao encontrado. Rodando em background com logs em .run/."
    (cd "$API_DIR" && SPRING_DATASOURCE_USERNAME=painel SPRING_DATASOURCE_PASSWORD=painel ./mvnw spring-boot:run >"$LOG_DIR/api-springboot.log" 2>&1 & echo $! >"$LOG_DIR/api-springboot.pid")
    (cd "$BFF_DIR" && dotnet run --project src/Painel.Bff >"$LOG_DIR/bff-dotnet.log" 2>&1 & echo $! >"$LOG_DIR/bff-dotnet.pid")
    (cd "$WEB_DIR" && npm start >"$LOG_DIR/web-angular.log" 2>&1 & echo $! >"$LOG_DIR/web-angular.pid")
  fi
}

kill_port() {
  local port="$1"
  if command -v lsof >/dev/null 2>&1; then
    local pids
    pids="$(lsof -ti tcp:"$port" || true)"
    [ -n "$pids" ] && echo "$pids" | xargs kill
  elif command -v fuser >/dev/null 2>&1; then
    fuser -k "$port"/tcp >/dev/null 2>&1 || true
  fi
}

stop_stack() {
  kill_port 18082
  kill_port 5080
  kill_port 4200
  if [ -d "$LOG_DIR" ]; then
    for pid_file in "$LOG_DIR"/*.pid; do
      [ -f "$pid_file" ] || continue
      kill "$(cat "$pid_file")" >/dev/null 2>&1 || true
      rm -f "$pid_file"
    done
  fi
}

port_status() {
  local port="$1" name="$2"
  if command -v lsof >/dev/null 2>&1 && lsof -i tcp:"$port" -sTCP:LISTEN >/dev/null 2>&1; then
    echo "$name: ouvindo na porta $port."
  elif command -v ss >/dev/null 2>&1 && ss -ltn | grep -q ":$port "; then
    echo "$name: ouvindo na porta $port."
  else
    echo "$name: parado na porta $port."
  fi
}

status_stack() {
  port_status 18082 "ERP Mock"
  port_status 5080 "BFF"
  port_status 4200 "Web Angular"
}

check_projects() {
  echo "Validando projetos separadamente..."
  (cd "$API_DIR" && ./mvnw -q -DskipTests package)
  (cd "$BFF_DIR" && dotnet build Painel.sln)
  (cd "$WEB_DIR" && npm run build)
}

case "${1:-}" in
  start)
    ensure_deps
    ensure_npm_ci
    ensure_postgres_warning
    open_stack_tabs
    ;;
  stop)
    stop_stack
    ;;
  restart)
    stop_stack
    sleep 2
    ensure_deps
    ensure_npm_ci
    ensure_postgres_warning
    open_stack_tabs
    ;;
  status)
    status_stack
    ;;
  doctor)
    ensure_deps
    status_stack
    check_projects
    ;;
  logs)
    if [ -d "$LOG_DIR" ]; then ls -1 "$LOG_DIR"; else echo "Nenhum log encontrado em $LOG_DIR."; fi
    ;;
  *)
    usage
    exit 1
    ;;
esac

