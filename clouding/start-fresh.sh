#!/bin/bash
#
# Script per iniciar PostgreSQL SEMPRE des de zero
# Executa aquest script AL SERVIDOR
#

set -e

PROJECT_DIR="/home/themacboy/serveis-extraordinaris"

echo "🔄 INICIALITZACIÓ COMPLETA DE POSTGRESQL"
echo "========================================"
echo ""

cd $PROJECT_DIR

# 1. Parar contenidors i eliminar volums
echo "1️⃣  Parant contenidors i eliminant volums..."
docker compose down -v

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
docker compose up -d

echo ""
echo "⏳ Esperant que PostgreSQL estigui llest..."
sleep 5

# Esperar que estigui disponible
for i in {1..30}; do
    if docker compose exec -T postgres pg_isready -U serveis_user &>/dev/null; then
        echo "✅ PostgreSQL llest!"
        break
    fi
    echo "   Esperant... ($i/30)"
    sleep 2
done

echo ""

# 4. Verificar taules
echo "4️⃣  Verificant taules creades..."
TABLES=$(docker compose exec -T postgres psql -U serveis_user -d serveis_extraordinaris -t -c "\dt" | grep -c "public" || echo "0")

if [ "$TABLES" -eq 6 ]; then
    echo "✅ Les 6 taules s'han creat correctament!"
    docker compose exec -T postgres psql -U serveis_user -d serveis_extraordinaris -c "\dt"
else
    echo "⚠️  Només $TABLES taules creades (esperat: 6)"
    echo "   Verificant logs..."
    docker compose logs postgres | tail -50
    exit 1
fi

echo ""

# 5. Verificar dades seed
echo "5️⃣  Verificant dades seed..."
echo ""
echo "Usuaris:"
docker compose exec -T postgres psql -U serveis_user -d serveis_extraordinaris -c "SELECT email, nom, rol FROM users;"

echo ""
echo "Tipus de serveis:"
docker compose exec -T postgres psql -U serveis_user -d serveis_extraordinaris -c "SELECT nom, preu_hora FROM tipus_servei LIMIT 5;"

echo ""
echo "========================================"
echo "✅ POSTGRESQL INICIALITZAT CORRECTAMENT"
echo "========================================"
echo ""
