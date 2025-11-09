#!/bin/bash
# Script de ayuda para migración de tablas

echo "🔄 SCRIPT DE MIGRACIÓN DE TABLAS"
echo "================================="
echo ""

if [ "$1" == "--help" ] || [ "$1" == "-h" ] || [ -z "$1" ]; then
    echo "Uso: ./migrate.sh <tabla>"
    echo ""
    echo "Tablas disponibles:"
    echo "  empresa      - Tabla de empresas"
    echo "  usuario      - Tabla de usuarios"
    echo "  denuncia     - Tabla de denuncias"
    echo "  comentario   - Tabla de comentarios"
    echo "  adjunto      - Tabla de adjuntos"
    echo "  rol          - Tabla de roles"
    echo "  permiso      - Tabla de permisos"
    echo "  tipo_denuncia - Tabla de tipos de denuncia"
    echo "  estado_denuncia - Tabla de estados de denuncia"
    echo "  auditoria    - Tabla de auditoría"
    echo ""
    echo "Ejemplos:"
    echo "  ./migrate.sh empresa"
    echo "  ./migrate.sh usuario"
    echo "  ./migrate.sh denuncia"
    echo ""
    echo "Para auditar todas las tablas:"
    echo "  ./migrate.sh --all"
    exit 0
fi

# Mapeo de tablas a modelos
declare -A MODELS
MODELS["empresa"]="src/models/empresa.model.ts"
MODELS["usuario"]="src/models/usuario.model.ts"
MODELS["denuncia"]="src/models/denuncia.model.ts"
MODELS["comentario"]="src/models/comentario.model.ts"
MODELS["adjunto"]="src/models/adjunto.model.ts"
MODELS["rol"]="src/models/rol.model.ts"
MODELS["permiso"]="src/models/permiso.model.ts"
MODELS["tipo_denuncia"]="src/models/tipo-denuncia.model.ts"
MODELS["estado_denuncia"]="src/models/estado-denuncia.model.ts"
MODELS["auditoria"]="src/models/auditoria.model.ts"
MODELS["resolucion"]="src/models/resolucion.model.ts"
MODELS["denuncia_asignacion"]="src/models/denuncia-asignacion.model.ts"
MODELS["denuncia_historial_estado"]="src/models/denuncia-historial-estado.model.ts"
MODELS["email_queue"]="src/models/email-queue.model.ts"
MODELS["reasignacion"]="src/models/reasignacion.model.ts"
MODELS["rol_permiso"]="src/models/rol-permiso.model.ts"
MODELS["usuario_rol"]="src/models/usuario-rol.model.ts"

# Auditar todas las tablas
if [ "$1" == "--all" ]; then
    echo "🔍 Auditando todas las tablas..."
    echo ""
    for tabla in "${!MODELS[@]}"; do
        echo "──────────────────────────────────────────────────────────"
        bun scripts/migrate-table.ts "$tabla" "${MODELS[$tabla]}"
        echo ""
    done
    exit 0
fi

# Validar tabla
TABLA=$1
if [ -z "${MODELS[$TABLA]}" ]; then
    echo "❌ Error: Tabla '$TABLA' no encontrada"
    echo ""
    echo "Tablas disponibles:"
    for tabla in "${!MODELS[@]}"; do
        echo "  - $tabla"
    done
    exit 1
fi

# Ejecutar migración
MODELO="${MODELS[$TABLA]}"
echo "📋 Tabla: $TABLA"
echo "📄 Modelo: $MODELO"
echo ""

bun scripts/migrate-table.ts "$TABLA" "$MODELO"
