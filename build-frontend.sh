#!/bin/bash

# 📱 Script de Compilación y Ejecución para Móviles
# Configurar y ejecutar la aplicación en emulador o dispositivo

set -e  # Detener en el primer error

echo "=========================================="
echo "  🚀 BUILD SCRIPT - Task Management App"
echo "=========================================="
echo ""

# Variables
FRONTEND_DIR="./Frontend"
DEFAULT_TIMEOUT=300

# Colores para salida
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'  # No Color

# Funciones
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[⚠]${NC} $1"
}

# 1. Verificar requisitos
echo -e "\n${BLUE}═══ 1. VERIFICANDO REQUISITOS ═══${NC}"

if ! command -v node &> /dev/null; then
    log_error "Node.js no está instalado"
    exit 1
fi
log_success "Node.js: $(node --version)"

if ! command -v npm &> /dev/null; then
    log_error "npm no está instalado"
    exit 1
fi
log_success "npm: $(npm --version)"

# 2. Limpiar cache anterior
echo -e "\n${BLUE}═══ 2. LIMPIANDO CACHE ═══${NC}"
cd "$FRONTEND_DIR"
log_info "Limpiando node_modules y package-lock.json..."
rm -rf node_modules package-lock.json
log_success "Cache limpiado"

# 3. Instalar dependencias
echo -e "\n${BLUE}═══ 3. INSTALANDO DEPENDENCIAS ═══${NC}"
log_info "Instalando packages con npm..."
npm install --legacy-peer-deps

if [ $? -eq 0 ]; then
    log_success "Dependencias instaladas correctamente"
else
    log_error "Error al instalar dependencias"
    exit 1
fi

# 4. Verificar configuración
echo -e "\n${BLUE}═══ 4. VERIFICANDO CONFIGURACIÓN ═══${NC}"

# Crear .env si no existe
if [ ! -f ".env" ]; then
    log_warning ".env no encontrado, creando..."
    cat > .env << EOF
REACT_APP_ENV=development
REACT_APP_API_URL=http://192.168.1.100:5000
REACT_APP_API_KEY=123456
REACT_APP_PROD_API_URL=https://api.taskservice.prod
EOF
    log_success ".env creado. Actualizar IP según necesario"
fi

# Crear .env.example si no existe
if [ ! -f ".env.example" ]; then
    cat > .env.example << EOF
# Configuración de Entorno
REACT_APP_ENV=development|production

# API Configuration
REACT_APP_API_URL=http://192.168.1.100:5000
REACT_APP_API_KEY=123456
REACT_APP_PROD_API_URL=https://api.taskservice.prod
EOF
    log_success ".env.example creado"
fi

log_success "Configuración verificada"

# 5. Ejecutar tests (opcional)
echo -e "\n${BLUE}═══ 5. EJECUTANDO TESTS ═══${NC}"
log_info "Ejecutando suite de tests..."
npm test -- --watchAll=false --passWithNoTests 2>/dev/null || log_warning "Tests no disponibles o fallaron"

# 6. Mostrar instrucciones de ejecución
echo -e "\n${BLUE}═══ 6. INSTRUCCIONES DE EJECUCIÓN ═══${NC}"

echo -e "\n${YELLOW}Para ejecutar en ANDROID EMULADOR:${NC}"
echo "  npm run android"

echo -e "\n${YELLOW}Para ejecutar en ANDROID DISPOSITIVO:${NC}"
echo "  1. Actualizar IP en .env"
echo "  2. Ejecutar: npm run android"

echo -e "\n${YELLOW}Para ejecutar en iOS EMULADOR:${NC}"
echo "  npm run ios"

echo -e "\n${YELLOW}Para ejecutar en iOS DISPOSITIVO:${NC}"
echo "  1. Actualizar IP en .env"
echo "  2. npm run ios"

echo -e "\n${YELLOW}Para ejecutar en WEB (desarrollo):${NC}"
echo "  npm start"

# 7. Iniciar bundler automáticamente
echo -e "\n${BLUE}═══ 7. INICIANDO METRO BUNDLER ═══${NC}"
log_info "Iniciando React Native metro bundler..."
echo ""
echo -e "${GREEN}El bundler está listo. Selecciona plataforma:${NC}"
echo "  a - Android"
echo "  i - iOS"
echo "  w - Web"
echo "  q - Salir"
echo ""

npm start -- --reset-cache
