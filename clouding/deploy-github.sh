#!/bin/bash
#
# Desplegament optimitzat per projectes sincronitzats amb GitHub
# Executa aquest script AL SERVIDOR de Clouding
#

set -e

echo "🚀 DESPLEGAMENT POSTGRESQL - Via GitHub"
echo "========================================"
echo ""

PROJECT_DIR="$HOME/serveis-extraordinaris"

# 1. Verificar si el repositori ja existeix
if [ -d "$PROJECT_DIR/.git" ]; then
    echo "📦 Repositori ja existeix, actualitzant..."
    cd $PROJECT_DIR
    git pull
else
    echo "📦 Clonant repositori..."
    git clone https://github.com/thecopboy/serveis-extraordinaris.git $PROJECT_DIR
    cd $PROJECT_DIR
fi

echo ""

# 2. Verificar que existeix el fitxer .env.production
if [ ! -f "clouding/.env.production" ]; then
    echo "⚠️  ERROR: No s'ha trobat clouding/.env.production"
    echo "   Aquest fitxer no està a Git (per seguretat)"
    echo ""
    echo "   Solució:"
    echo "   1. Crea'l manualment: nano clouding/.env.production"
    echo "   2. O puja'l des del local: scp clouding/.env.production themacboy@IP:~/serveis-extraordinaris/clouding/"
    exit 1
fi

echo "✓ Fitxer .env.production trobat"
echo ""

# 3. Copiar fitxers a la ubicació correcta
echo "📋 Preparant fitxers..."
cp clouding/docker-compose.production.yml docker-compose.yml
cp clouding/.env.production .env
chmod +x clouding/*.sh

echo "✓ Fitxers preparats"
echo ""

# 4. Crear carpetes necessàries
echo "📁 Creant carpetes..."
mkdir -p backups
mkdir -p logs
chmod 700 backups

echo "✓ Carpetes creades"
echo ""

# 5. Iniciar PostgreSQL
echo "🐳 Iniciant PostgreSQL..."
docker compose pull
docker compose up -d

echo ""
echo "⏳ Esperant que PostgreSQL estigui llest..."
sleep 10

# Esperar healthcheck
for i in {1..30}; do
    if docker compose exec -T postgres pg_isready -U serveis_user &>/dev/null; then
        echo "✅ PostgreSQL llest!"
        break
    fi
    echo "   Esperant... ($i/30)"
    sleep 2
done

echo ""

# 6. Verificar instal·lació
echo "🔍 Verificant instal·lació..."
echo ""
echo "Estat:"
docker compose ps

echo ""
echo "Taules:"
docker compose exec -T postgres psql -U serveis_user -d serveis_extraordinaris -c "\dt"

echo ""
echo "Usuaris seed:"
docker compose exec -T postgres psql -U serveis_user -d serveis_extraordinaris -t -c "SELECT email, nom FROM users;"

echo ""
echo "======================================"
echo "✅ DESPLEGAMENT COMPLETAT!"
echo "======================================"
echo ""
echo "📝 Properes accions:"
echo "   - Configurar backups: crontab -e"
echo "   - Canviar password admin"
echo ""
