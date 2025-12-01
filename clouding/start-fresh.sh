#!/bin/bash
#
# Script per iniciar PostgreSQL SEMPRE des de zero
# Executa aquest script AL SERVIDOR
#

set -e

PROJECT_DIR="/home/themacboy/serveis-extraordinaris"

# Carregar variables d'entorn
if [ -f "$PROJECT_DIR/.env" ]; then
    export $(grep -v '^#' "$PROJECT_DIR/.env" | xargs)
fi
POSTGRES_USER=${POSTGRES_USER:-themacboy}
POSTGRES_DB=${POSTGRES_DB:-serveis_extraordinaris}

echo "🔄 INICIALITZACIÓ COMPLETA DE POSTGRESQL"
echo "========================================"
echo ""

cd $PROJECT_DIR/clouding

# 1. Parar contenidors i eliminar volums
echo "1️⃣  Parant contenidors i eliminant volums..."
docker compose -f docker-compose.production.yml down -v

echo ""

# 2. Verificar que el volum s'ha eliminat
echo "2️⃣  Verificant eliminació de volums..."
if docker volume ls | grep -q "serveis.*postgres_data"; then
    echo "⚠️  Volum encara existeix, eliminant manualment..."
    docker volume ls | grep "serveis.*postgres_data" | awk '{print $2}' | xargs docker volume rm
fi
echo "✓ Volums eliminats"

echo ""

# 3. Iniciar PostgreSQL (carregarà l'schema automàticament)
echo "3️⃣  Iniciant PostgreSQL amb schema nou..."
docker compose -f docker-compose.production.yml up -d

echo ""
echo "⏳ Esperant que PostgreSQL estigui llest..."
sleep 5

# Esperar que estigui disponible
for i in {1..30}; do
    if docker compose -f docker-compose.production.yml exec -T postgres pg_isready -U $POSTGRES_USER &>/dev/null; then
        echo "✅ PostgreSQL llest!"
        break
    fi
    echo "   Esperant... ($i/30)"
    sleep 2
done

echo ""

# 4. Verificar taules
echo "4️⃣  Verificant taules creades..."
TABLES=$(docker compose -f docker-compose.production.yml exec -T postgres psql -U $POSTGRES_USER -d $POSTGRES_DB -t -c "\dt" | grep -c "public" || echo "0")

if [ "$TABLES" -eq 6 ]; then
    echo "✅ Les 6 taules s'han creat correctament!"
    docker compose -f docker-compose.production.yml exec -T postgres psql -U $POSTGRES_USER -d $POSTGRES_DB -c "\dt"
else
    echo "⚠️  Només $TABLES taules creades (esperat: 6)"
    echo "   Verificant logs..."
    docker compose -f docker-compose.production.yml logs postgres | tail -50
    exit 1
fi

echo ""

# 5. Verificar dades seed
echo "5️⃣  Verificant dades seed..."
echo ""
echo "Usuaris:"
docker compose -f docker-compose.production.yml exec -T postgres psql -U $POSTGRES_USER -d $POSTGRES_DB -c "SELECT email, nom, rol FROM users;"

echo ""
echo "Tipus de serveis:"
docker compose -f docker-compose.production.yml exec -T postgres psql -U $POSTGRES_USER -d $POSTGRES_DB -c "SELECT nom, tipus_remuneracio, tarifa_base FROM tipus_servei LIMIT 5;"

echo ""
echo "========================================"
echo "✅ POSTGRESQL INICIALITZAT CORRECTAMENT"
echo "========================================"
echo ""
