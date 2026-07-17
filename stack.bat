@echo off
setlocal EnableExtensions EnableDelayedExpansion

set "ROOT=%~dp0"
set "API_DIR=%ROOT%apps\api-springboot"
set "BFF_DIR=%ROOT%apps\bff-dotnet"
set "WEB_DIR=%ROOT%apps\web-angular"
set "LOG_DIR=%ROOT%.run"

if "%~1"=="" goto usage
set "COMMAND=%~1"

if /I "%COMMAND%"=="start" goto start
if /I "%COMMAND%"=="stop" goto stop
if /I "%COMMAND%"=="restart" goto restart
if /I "%COMMAND%"=="status" goto status
if /I "%COMMAND%"=="doctor" goto doctor
if /I "%COMMAND%"=="logs" goto logs
goto usage

:start
call :ensure_deps || exit /b 1
call :ensure_npm_ci || exit /b 1
call :ensure_postgres_warning
call :open_stack_tabs
exit /b %ERRORLEVEL%

:restart
call :stop_ports
call :wait 2
goto start

:stop
call :stop_ports
exit /b %ERRORLEVEL%

:status
call :print_status
exit /b %ERRORLEVEL%

:doctor
call :ensure_deps
set "DEPS_RC=%ERRORLEVEL%"
call :print_status
call :check_projects
set "PROJECTS_RC=%ERRORLEVEL%"
if not "%DEPS_RC%"=="0" exit /b %DEPS_RC%
exit /b %PROJECTS_RC%

:logs
if not exist "%LOG_DIR%" (
  echo Nenhum log encontrado em "%LOG_DIR%".
  exit /b 0
)
dir /b "%LOG_DIR%"
exit /b 0

:usage
echo Uso: stack.bat ^<start^|stop^|restart^|status^|doctor^|logs^>
echo Atalho: start-stack.bat
exit /b 1

:ensure_deps
set "MISSING="
call :check_java || set "MISSING=!MISSING! Java 21"
call :check_dotnet || set "MISSING=!MISSING! .NET SDK 10"
call :check_node || set "MISSING=!MISSING! Node.js 20.19+, 22.12+ ou 24+"
call :check_npm || set "MISSING=!MISSING! npm"

if "!MISSING!"=="" (
  echo Dependencias principais OK.
  exit /b 0
)

echo Dependencias ausentes ou em versao incompativel:!MISSING!
echo Sera necessario instalar dependencias e recursos antes de rodar a stack.
choice /C SN /N /M "Deseja tentar instalar agora com winget? [S/N] "
if errorlevel 2 exit /b 1
call :install_windows_deps
call :check_java || exit /b 1
call :check_dotnet || exit /b 1
call :check_node || exit /b 1
call :check_npm || exit /b 1
exit /b 0

:check_java
where java >nul 2>nul || exit /b 1
for /f "tokens=2 delims= " %%v in ('java -version 2^>^&1 ^| findstr /i "version"') do set "JAVA_VERSION=%%~v"
for /f "tokens=1 delims=." %%m in ("!JAVA_VERSION!") do set "JAVA_MAJOR=%%m"
if !JAVA_MAJOR! GEQ 21 exit /b 0
exit /b 1

:check_dotnet
where dotnet >nul 2>nul || exit /b 1
dotnet --list-sdks | findstr /r "^10\." >nul 2>nul || exit /b 1
exit /b 0

:check_node
where node >nul 2>nul || exit /b 1
for /f %%v in ('node -p "process.versions.node"') do set "NODE_VERSION=%%v"
for /f "tokens=1,2 delims=." %%a in ("!NODE_VERSION!") do (
  set "NODE_MAJOR=%%a"
  set "NODE_MINOR=%%b"
)
if !NODE_MAJOR! EQU 20 if !NODE_MINOR! GEQ 19 exit /b 0
if !NODE_MAJOR! EQU 22 if !NODE_MINOR! GEQ 12 exit /b 0
if !NODE_MAJOR! GEQ 24 exit /b 0
exit /b 1

:check_npm
where npm >nul 2>nul || exit /b 1
exit /b 0

:install_windows_deps
where winget >nul 2>nul || (
  echo winget nao encontrado. Instale Java 21, .NET SDK 10 e Node.js manualmente.
  exit /b 1
)
echo Instalando dependencias com winget. Alguns instaladores podem pedir elevacao.
winget install --id EclipseAdoptium.Temurin.21.JDK --accept-source-agreements --accept-package-agreements
winget install --id Microsoft.DotNet.SDK.10 --accept-source-agreements --accept-package-agreements
winget install --id OpenJS.NodeJS.LTS --accept-source-agreements --accept-package-agreements
choice /C SN /N /M "Deseja instalar PostgreSQL tambem? [S/N] "
if errorlevel 2 exit /b 0
winget install --id PostgreSQL.PostgreSQL --accept-source-agreements --accept-package-agreements
exit /b 0

:ensure_npm_ci
if exist "%WEB_DIR%\node_modules" exit /b 0
echo Instalando dependencias do Angular com npm ci...
pushd "%WEB_DIR%" || exit /b 1
npm ci
set "NPM_RC=%ERRORLEVEL%"
popd
exit /b %NPM_RC%

:ensure_postgres_warning
if "%POSTGRES_HOST_PORT%"=="" set "POSTGRES_HOST_PORT=15432"
powershell -NoProfile -Command "try { $c=Test-NetConnection -ComputerName localhost -Port %POSTGRES_HOST_PORT% -InformationLevel Quiet; if (-not $c) { exit 1 } } catch { exit 1 }" >nul 2>nul
if errorlevel 1 (
  echo Aviso: PostgreSQL nao respondeu em localhost:%POSTGRES_HOST_PORT%.
  echo O ERP Mock usa PostgreSQL por padrao. Configure o banco painel_hc_rm com usuario painel/painel ou ajuste SPRING_DATASOURCE_*.
)
exit /b 0

:open_stack_tabs
if not exist "%LOG_DIR%" mkdir "%LOG_DIR%"
where wt >nul 2>nul
if not errorlevel 1 (
  wt -w 0 new-tab --title "HC ERP Mock" -d "%API_DIR%" cmd /k "set SPRING_DATASOURCE_USERNAME=painel&& set SPRING_DATASOURCE_PASSWORD=painel&& .\mvnw.cmd spring-boot:run" ^
    ; new-tab --title "HC BFF" -d "%BFF_DIR%" cmd /k "dotnet run --project src\Painel.Bff" ^
    ; new-tab --title "HC Web" -d "%WEB_DIR%" cmd /k "npm start"
  exit /b %ERRORLEVEL%
)
start "HC ERP Mock" /D "%API_DIR%" cmd /k "set SPRING_DATASOURCE_USERNAME=painel&& set SPRING_DATASOURCE_PASSWORD=painel&& .\mvnw.cmd spring-boot:run"
start "HC BFF" /D "%BFF_DIR%" cmd /k "dotnet run --project src\Painel.Bff"
start "HC Web" /D "%WEB_DIR%" cmd /k "npm start"
exit /b 0

:stop_ports
for %%p in (18082 5080 4200) do call :kill_port %%p
exit /b 0

:kill_port
set "PORT=%~1"
for /f "tokens=5" %%p in ('netstat -ano ^| findstr /r ":%PORT% .*LISTENING"') do (
  echo Encerrando processo %%p na porta %PORT%...
  taskkill /PID %%p /T /F >nul 2>nul
)
exit /b 0

:print_status
call :port_status 18082 "ERP Mock"
call :port_status 5080 "BFF"
call :port_status 4200 "Web Angular"
exit /b 0

:port_status
set "PORT=%~1"
set "NAME=%~2"
netstat -ano | findstr /r ":%PORT% .*LISTENING" >nul 2>nul
if errorlevel 1 (
  echo %NAME%: parado na porta %PORT%.
) else (
  echo %NAME%: ouvindo na porta %PORT%.
)
exit /b 0

:check_projects
echo Validando projetos separadamente...
set "PROJECT_FAIL=0"
pushd "%API_DIR%" || exit /b 1
call .\mvnw.cmd -q -DskipTests package || set "PROJECT_FAIL=1"
popd
pushd "%BFF_DIR%" || exit /b 1
dotnet build Painel.sln || set "PROJECT_FAIL=1"
popd
pushd "%WEB_DIR%" || exit /b 1
npm run build || set "PROJECT_FAIL=1"
popd
exit /b %PROJECT_FAIL%

:wait
timeout /t %~1 /nobreak >nul
exit /b 0

