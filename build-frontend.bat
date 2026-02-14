@echo off
REM 📱 Script de Compilación para Windows - Task Management App
REM Configurar y ejecutar la aplicación en emulador o dispositivo

setlocal enabledelayedexpansion

echo.
echo ==========================================
echo   🚀 BUILD SCRIPT - Task Management App
echo ==========================================
echo.

REM Variables
set FRONTEND_DIR=Frontend
set PROJECT_ROOT=%cd%

REM 1. Verificar requisitos
echo.
echo ═══ 1. VERIFICANDO REQUISITOS ═══
echo.

where node >nul 2>nul
if errorlevel 1 (
    echo [ERROR] Node.js no está instalado
    echo Descargar de: https://nodejs.org/
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo [✓] Node.js: %NODE_VERSION%

where npm >nul 2>nul
if errorlevel 1 (
    echo [ERROR] npm no está instalado
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
echo [✓] npm: %NPM_VERSION%

REM 2. Navegar a directorio frontend
cd %FRONTEND_DIR%
if errorlevel 1 (
    echo [ERROR] No se puede acceder a directorio %FRONTEND_DIR%
    pause
    exit /b 1
)

REM 3. Limpiar cache anterior
echo.
echo ═══ 2. LIMPIANDO CACHE ═══
echo.
echo [INFO] Limpiando node_modules y package-lock.json...
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json
echo [✓] Cache limpiado

REM 4. Instalar dependencias
echo.
echo ═══ 3. INSTALANDO DEPENDENCIAS ═══
echo.
echo [INFO] Instalando packages con npm...
echo. Este proceso puede tardar 2-5 minutos en primera ejecución
echo.

call npm install --legacy-peer-deps

if errorlevel 1 (
    echo [ERROR] Error al instalar dependencias
    echo Por favor, intenta nuevamente
    pause
    exit /b 1
)
echo [✓] Dependencias instaladas correctamente

REM 5. Crear archivos de configuración
echo.
echo ═══ 4. VERIFICANDO CONFIGURACIÓN ═══
echo.

if not exist .env (
    echo [⚠] .env no encontrado, creando...
    (
        echo REACT_APP_ENV=development
        echo REACT_APP_API_URL=http://192.168.1.100:5000
        echo REACT_APP_API_KEY=123456
        echo REACT_APP_PROD_API_URL=https://api.taskservice.prod
    ) > .env
    echo [✓] .env creado. Actualizar IP según tu red
)

if not exist .env.example (
    (
        echo # Configuración de Entorno
        echo REACT_APP_ENV=development
        echo.
        echo # API Configuration
        echo REACT_APP_API_URL=http://192.168.1.100:5000
        echo REACT_APP_API_KEY=123456
        echo REACT_APP_PROD_API_URL=https://api.taskservice.prod
    ) > .env.example
    echo [✓] .env.example creado
)

echo [✓] Configuración verificada

REM 6. Mostrar instrucciones
echo.
echo ═══ 5. INSTRUCCIONES DE EJECUCIÓN ═══
echo.

echo [ANDROID EMULADOR]
echo   npm run android
echo.

echo [ANDROID DISPOSITIVO]
echo   1. Conectar dispositivo USB
echo   2. Actualizar IP en .env
echo   3. npm run android
echo.

echo [iOS EMULADOR]
echo   npm run ios
echo.

echo [iOS DISPOSITIVO]
echo   1. Conectar dispositivo
echo   2. Actualizar IP en .env
echo   3. npm run ios
echo.

echo [WEB - DESARROLLO]
echo   npm start
echo.

REM 7. Preguntar qué hacer
echo ═══ 6. ¿QUÉ DESEAS HACER? ═══
echo.
echo   1 - Android (Emulador/Dispositivo)
echo   2 - iOS (Emulador/Dispositivo)
echo   3 - Web (localhost)
echo   4 - Metro Bundler (sin ejecutar)
echo   5 - Salir
echo.

set /p CHOICE="Elige opción (1-5): "

if "%CHOICE%"=="1" (
    echo.
    echo [INFO] Iniciando Android...
    call npm run android
) else if "%CHOICE%"=="2" (
    echo.
    echo [INFO] Iniciando iOS...
    call npm run ios
) else if "%CHOICE%"=="3" (
    echo.
    echo [INFO] Iniciando en Web...
    call npm start
) else if "%CHOICE%"=="4" (
    echo.
    echo [INFO] Iniciando Metro Bundler...
    call npm start -- --reset-cache
) else if "%CHOICE%"=="5" (
    echo.
    echo [✓] Saliendo...
    cd ..
    exit /b 0
) else (
    echo.
    echo [ERROR] Opción inválida
    pause
    exit /b 1
)

cd ..
pause
