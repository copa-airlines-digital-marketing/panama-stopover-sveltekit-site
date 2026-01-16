#!/bin/bash
# Script para ejecutar comandos con secrets de Doppler
# Este script inyecta las variables de entorno desde Doppler en el comando

set -euo pipefail

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para mostrar ayuda
usage() {
    cat << EOF
${BLUE}Usage: ${GREEN}doppler-run${NC} [OPTIONS] [COMMAND]

${BLUE}Ejecuta un comando con secrets de Doppler inyectados${NC}

${YELLOW}Options:${NC}
  -e, --environment ENV    Especifica el entorno (dev, staging, prod)
                          Default: dev
  -s, --save-env          Crea un archivo .env local
  -h, --help              Muestra esta ayuda

${YELLOW}Examples:${NC}
  # Ejecutar dev con secrets de Doppler
  doppler-run pnpm dev

  # Ejecutar build con secrets de producción
  doppler-run --environment prod pnpm build

  # Ejecutar tests con secrets de staging
  doppler-run -e staging pnpm test

${YELLOW}Environment Variables:${NC}
  DOPPLER_CONFIG          Especifica el config de Doppler (dev, staging, prod)
                         Default: dev

${YELLOW}Nota:${NC}
  Asegúrate de tener 'doppler login' ejecutado primero:
  ${GREEN}doppler login${NC}

EOF
    exit 0
}

# Variables por defecto
ENVIRONMENT="dev"
SAVE_ENV=false
COMMAND=()

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -e|--environment)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -s|--save-env)
            SAVE_ENV=true
            shift
            ;;
        -h|--help)
            usage
            ;;
        *)
            COMMAND+=("$1")
            shift
            ;;
    esac
done

# Validar que se proporcionó un comando
if [ ${#COMMAND[@]} -eq 0 ]; then
    echo -e "${RED}❌ Error: Se requiere un comando${NC}"
    usage
fi

# Validar entorno
if [[ ! "$ENVIRONMENT" =~ ^(dev|staging|prod)$ ]]; then
    echo -e "${RED}❌ Error: Entorno inválido: $ENVIRONMENT${NC}"
    echo -e "${YELLOW}Entornos válidos: dev, staging, prod${NC}"
    exit 1
fi

# Mostrar información
echo -e "${BLUE}🔐 Doppler Environment: ${GREEN}$ENVIRONMENT${NC}"
echo -e "${BLUE}📦 Command: ${GREEN}${COMMAND[@]}${NC}"
echo ""

# Verificar que doppler esté disponible
if ! command -v doppler &> /dev/null; then
    echo -e "${RED}❌ Error: doppler no está instalado${NC}"
    echo -e "${YELLOW}Instálalo desde: https://docs.doppler.com/docs/cli${NC}"
    exit 1
fi

# Verificar que esté autenticado
if ! doppler status > /dev/null 2>&1; then
    echo -e "${RED}❌ Error: No estás autenticado en Doppler${NC}"
    echo -e "${YELLOW}Ejecuta: ${GREEN}doppler login${NC}"
    exit 1
fi

# Si se pide guardar el .env
if [ "$SAVE_ENV" = true ]; then
    echo -e "${BLUE}💾 Guardando secrets en .env.doppler.${ENVIRONMENT}${NC}"
    doppler secrets download --config "$ENVIRONMENT" --format env > ".env.doppler.${ENVIRONMENT}"
    echo -e "${GREEN}✅ Guardado en: .env.doppler.${ENVIRONMENT}${NC}"
    echo ""
fi

# Ejecutar comando con doppler
echo -e "${BLUE}▶️  Ejecutando comando...${NC}"
echo ""

# Usar doppler run para inyectar los secrets
if DOPPLER_CONFIG="$ENVIRONMENT" doppler run --command "${COMMAND[@]}"; then
    echo ""
    echo -e "${GREEN}✅ Comando ejecutado exitosamente${NC}"
else
    EXIT_CODE=$?
    echo ""
    echo -e "${RED}❌ Comando falló con código: $EXIT_CODE${NC}"
    exit $EXIT_CODE
fi
