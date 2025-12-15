#!/bin/bash

# Script per recrear la base de dades amb l'esquema actualitzat
# ADVERTÈNCIA: Aquest script eliminarà TOTES les dades existents!

set -e  # Exit on error

echo "🔄 Recreant base de dades amb esquema actualitzat..."
echo ""
echo "⚠️  ADVERTÈNCIA: Això eliminarà TOTES les dades existents!"
echo ""
read -p "Estàs segur que vols continuar? (escriu 'SÍ' per confirmar): " confirmacio

if [ "$confirmacio" != "SÍ" ]; then
    echo "❌ Operació cancel·lada"
    exit 1
fi

# Variables de connexió (ajusta segons el teu .env)
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_NAME=${DB_NAME:-serveis_extraordinaris}
DB_USER=${DB_USER:-serveis_user}
DB_PASSWORD=${DB_PASSWORD:-ChangeMeInProduction!}

echo ""
echo "📊 Connectant a PostgreSQL..."
echo "   Host: $DB_HOST"
echo "   Port: $DB_PORT"
echo "   Database: $DB_NAME"
echo ""

# Opció 1: Si tens Docker
if command -v docker &> /dev/null; then
    echo "🐳 Utilitzant Docker..."
    
    # Parar contenidor
    echo "⏸️  Parant contenidor..."
    docker-compose down
    
    # Eliminar volum (opcional, per començar de zero)
    read -p "Vols eliminar també el volum de dades? (s/n): " eliminar_volum
    if [ "$eliminar_volum" = "s" ]; then
        echo "🗑️  Eliminant volum..."
        docker volume rm serveis-extraordinaris_postgres_data 2>/dev/null || true
    fi
    
    # Aixecar contenidor (recrearà la BD amb schema.sql)
    echo "🚀 Aixecant contenidor..."
    docker-compose up -d postgres
    
    # Esperar que PostgreSQL estigui ready
    echo "⏳ Esperant que PostgreSQL estigui ready..."
    sleep 5
    
    echo "✅ Base de dades recreada correctament!"
    echo ""
    echo "📝 Esquema aplicat des de schema.sql"
    echo "👤 Usuari admin creat: themacboy72@gmail.com"
    echo "🏢 Empresa 'Sistema' creada"
    
else
    # Opció 2: PostgreSQL natiu
    echo "💾 Utilitzant PostgreSQL natiu..."
    
    export PGPASSWORD=$DB_PASSWORD
    
    # Aplicar schema.sql
    echo "📝 Aplicant schema.sql..."
    psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f schema.sql
    
    echo "✅ Schema aplicat correctament!"
fi

echo ""
echo "🎉 Procés completat!"
echo ""
echo "🔗 Endpoints disponibles:"
echo "   - API: http://localhost:5000/api/v1"
echo "   - Swagger: http://localhost:5000/api-docs"
echo "   - Health: http://localhost:5000/health"
echo ""
echo "🧪 Pots provar l'API amb:"
echo "   cd backend && npm start"
