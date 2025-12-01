#!/bin/bash
#
# Script per ELIMINAR COMPLETAMENT la instal·lació de PostgreSQL
# Executa aquest script AL SERVIDOR de Clouding
#

set -e

PROJECT_DIR="/home/themacboy/serveis-extraordinaris"

echo "🗑️  ELIMINACIÓ COMPLETA DE POSTGRESQL"
echo "======================================"
echo ""
echo "⚠️  ATENCIÓ: Això eliminarà:"
echo "   - Tots els contenidors"
echo "   - Tots els volums (dades de PostgreSQL)"
echo "   - Tots els fitxers del projecte"
echo "   - Configuracions de cron"
echo ""
read -p "Estàs TOTALMENT segur? (escriu 'ELIMINAR' per confirmar): " CONFIRM

if [ "$CONFIRM" != "ELIMINAR" ]; then
    echo "❌ Cancel·lat"
    exit 0
fi

echo ""
echo "🧹 Començant eliminació..."
echo ""

# 1. Parar i eliminar contenidors
if [ -d "$PROJECT_DIR" ]; then
    echo "1️⃣  Parant contenidors..."
    cd $PROJECT_DIR
    docker compose down -v 2>/dev/null || echo "   Contenidors ja aturats"
else
    echo "1️⃣  Directori no trobat, saltant..."
fi

echo ""

# 2. Eliminar volums Docker
echo "2️⃣  Eliminant volums Docker..."
docker volume ls | grep serveis | awk '{print $2}' | xargs -r docker volume rm 2>/dev/null || echo "   Cap volum trobat"

echo ""

# 3. Eliminar imatge PostgreSQL (opcional)
echo "3️⃣  Vols eliminar també la imatge de PostgreSQL? (s/n)"
read -p "   Això estalviarà espai però hauràs de descarregar-la de nou: " DELETE_IMAGE
if [[ $DELETE_IMAGE =~ ^[SsYy]$ ]]; then
    docker rmi postgres:16-alpine 2>/dev/null || echo "   Imatge no trobada"
    echo "   ✓ Imatge eliminada"
else
    echo "   ⊘ Imatge conservada"
fi

echo ""

# 4. Eliminar directori del projecte
echo "4️⃣  Eliminant directori del projecte..."
if [ -d "$PROJECT_DIR" ]; then
    rm -rf $PROJECT_DIR
    echo "   ✓ $PROJECT_DIR eliminat"
else
    echo "   ⊘ Directori ja no existeix"
fi

echo ""

# 5. Eliminar tasques cron
echo "5️⃣  Eliminant tasques cron..."
crontab -l 2>/dev/null | grep -v "serveis-extraordinaris" | crontab - 2>/dev/null || echo "   Cap cron trobat"
echo "   ✓ Crons eliminats"

echo ""

# 6. Verificar neteja
echo "6️⃣  Verificant neteja..."
echo ""

echo "   Contenidors amb 'serveis':"
docker ps -a | grep serveis || echo "   ✓ Cap contenidor trobat"

echo ""
echo "   Volums amb 'serveis':"
docker volume ls | grep serveis || echo "   ✓ Cap volum trobat"

echo ""
echo "   Directori del projecte:"
ls -d $PROJECT_DIR 2>/dev/null || echo "   ✓ Directori no existeix"

echo ""
echo "   Crons programats:"
crontab -l 2>/dev/null | grep serveis || echo "   ✓ Cap cron trobat"

echo ""
echo "======================================"
echo "✅ ELIMINACIÓ COMPLETADA!"
echo "======================================"
echo ""
echo "Tot ha estat eliminat. Ara pots començar de zero amb:"
echo "   1. Crear directori: mkdir -p ~/serveis-extraordinaris"
echo "   2. Pujar fitxers nous des del local"
echo "   3. Iniciar PostgreSQL amb docker compose up -d"
echo ""
