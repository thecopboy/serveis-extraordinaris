#!/bin/bash
# Script per reinicialitzar la base de dades amb l'schema complet
# ATENCIÓ: Això ELIMINARÀ totes les dades existents!

set -e

PROJECT_DIR="/home/themacboy/serveis-extraordinaris"

echo "⚠️  REINICIALITZAR BASE DE DADES"
echo "================================"
echo ""
echo "Aquest script eliminarà totes les dades i recrearà la BD des de zero."
echo ""
read -p "Estàs segur? (escriu 'SI' per confirmar): " CONFIRM

if [ "$CONFIRM" != "SI" ]; then
    echo "❌ Cancel·lat"
    exit 0
fi

cd $PROJECT_DIR

echo ""
echo "1️⃣  Parant contenidor..."
docker compose down

echo ""
echo "2️⃣  Eliminant volum de dades..."
docker volume rm serveis-extraordinaris_postgres_data 2>/dev/null || echo "Volum ja eliminat"

echo ""
echo "3️⃣  Iniciant PostgreSQL amb schema nou..."
docker compose up -d

echo ""
echo "4️⃣  Esperant que PostgreSQL estigui llest..."
sleep 10

# Esperar healthcheck
for i in {1..30}; do
    if docker compose exec -T postgres pg_isready -U serveis_user &>/dev/null; then
        echo "✅ PostgreSQL llest!"
        break
    fi
    echo "⏳ Esperant... ($i/30)"
    sleep 2
done

echo ""
echo "5️⃣  Verificant taules creades..."
docker compose exec -T postgres psql -U serveis_user -d serveis_extraordinaris -c "\dt"

echo ""
echo "6️⃣  Verificant dades seed..."
echo ""
echo "Usuaris:"
docker compose exec -T postgres psql -U serveis_user -d serveis_extraordinaris -c "SELECT email, nom, rol FROM users;"

echo ""
echo "Tipus de serveis:"
docker compose exec -T postgres psql -U serveis_user -d serveis_extraordinaris -c "SELECT nom, preu_hora FROM tipus_servei;"

echo ""
echo "✅ Base de dades reinicialitzada correctament!"
