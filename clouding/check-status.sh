#!/bin/bash
#
# Script per verificar l'estat de PostgreSQL a Clouding
# Executa aquest script AL SERVIDOR
#

echo "🔍 VERIFICACIÓ POSTGRESQL - Serveis Extraordinaris"
echo "=================================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

PROJECT_DIR="/home/themacboy/serveis-extraordinaris"

# Carregar variables d'entorn
if [ -f "$PROJECT_DIR/.env" ]; then
    export $(grep -v '^#' "$PROJECT_DIR/.env" | xargs)
fi
POSTGRES_USER=${POSTGRES_USER:-themacboy}
POSTGRES_DB=${POSTGRES_DB:-serveis_extraordinaris}

# 1. Verificar que el directori existeix
echo "📁 1. Verificant directori del projecte..."
if [ -d "$PROJECT_DIR" ]; then
    echo -e "${GREEN}✓ Directori trobat: $PROJECT_DIR${NC}"
    cd $PROJECT_DIR
else
    echo -e "${RED}✗ Directori no trobat: $PROJECT_DIR${NC}"
    echo "   El projecte no està instal·lat?"
    exit 1
fi

echo ""

# 2. Verificar Docker
echo "🐳 2. Verificant Docker..."
if command -v docker &> /dev/null; then
    echo -e "${GREEN}✓ Docker instal·lat${NC}"
    docker --version
else
    echo -e "${RED}✗ Docker no trobat${NC}"
    exit 1
fi

if docker compose version &> /dev/null; then
    echo -e "${GREEN}✓ Docker Compose disponible${NC}"
    docker compose version
else
    echo -e "${RED}✗ Docker Compose no trobat${NC}"
    exit 1
fi

echo ""

# 3. Estat dels contenidors
echo "📦 3. Estat dels contenidors..."
CONTAINER_STATUS=$(docker compose ps --format json 2>/dev/null | jq -r '.State' 2>/dev/null || echo "unknown")

if docker compose ps | grep -q "serveis-postgres"; then
    echo -e "${GREEN}✓ Contenidor PostgreSQL trobat${NC}"
    docker compose ps
    echo ""
    
    # Verificar si està running
    if docker compose ps | grep -q "Up"; then
        echo -e "${GREEN}✓ PostgreSQL està en marxa${NC}"
    else
        echo -e "${RED}✗ PostgreSQL NO està en marxa${NC}"
        echo "   Intenta: docker compose up -d"
        exit 1
    fi
else
    echo -e "${RED}✗ Contenidor PostgreSQL no trobat${NC}"
    echo "   Intenta: docker compose up -d"
    exit 1
fi

echo ""

# 4. Healthcheck
echo "🏥 4. Verificant salut del contenidor..."
HEALTH=$(docker inspect --format='{{.State.Health.Status}}' serveis-postgres 2>/dev/null || echo "no-healthcheck")

if [ "$HEALTH" = "healthy" ]; then
    echo -e "${GREEN}✓ Contenidor HEALTHY${NC}"
elif [ "$HEALTH" = "starting" ]; then
    echo -e "${YELLOW}⏳ Contenidor inicialitzant-se...${NC}"
    echo "   Espera uns segons i torna a comprovar"
else
    echo -e "${YELLOW}⚠️  Healthcheck: $HEALTH${NC}"
fi

echo ""

# 5. Logs recents (últimes 10 línies)
echo "📋 5. Logs recents..."
docker compose logs --tail=10 postgres

echo ""

# 6. Connexió a PostgreSQL
echo "🔌 6. Provant connexió a PostgreSQL..."
if docker compose exec -T postgres pg_isready -U $POSTGRES_USER -d $POSTGRES_DB &> /dev/null; then
    echo -e "${GREEN}✓ PostgreSQL accepta connexions${NC}"
else
    echo -e "${RED}✗ PostgreSQL no accepta connexions${NC}"
    exit 1
fi

echo ""

# 7. Verificar version PostgreSQL
echo "🗄️  7. Versió de PostgreSQL..."
docker compose exec -T postgres psql -U $POSTGRES_USER -d $POSTGRES_DB -t -c "SELECT version();" | head -1

echo ""

# 8. Llistar taules
echo "📊 8. Taules de la base de dades..."
TABLES=$(docker compose exec -T postgres psql -U $POSTGRES_USER -d $POSTGRES_DB -t -c "\dt" | grep -c "public")

if [ "$TABLES" -ge 6 ]; then
    echo -e "${GREEN}✓ Trobades $TABLES taules${NC}"
    docker compose exec -T postgres psql -U $POSTGRES_USER -d $POSTGRES_DB -c "\dt"
else
    echo -e "${YELLOW}⚠️  Només $TABLES taules trobades (esperat: 6)${NC}"
    docker compose exec -T postgres psql -U $POSTGRES_USER -d $POSTGRES_DB -c "\dt"
fi

echo ""

# 9. Verificar dades seed
echo "👤 9. Verificant dades seed..."
USER_COUNT=$(docker compose exec -T postgres psql -U $POSTGRES_USER -d $POSTGRES_DB -t -c "SELECT COUNT(*) FROM users;" | tr -d ' ')

if [ "$USER_COUNT" -ge 1 ]; then
    echo -e "${GREEN}✓ Usuaris trobats: $USER_COUNT${NC}"
    docker compose exec -T postgres psql -U $POSTGRES_USER -d $POSTGRES_DB -c "SELECT email, nom, rol FROM users;"
else
    echo -e "${YELLOW}⚠️  No s'han trobat usuaris seed${NC}"
fi

echo ""

TIPUS_COUNT=$(docker compose exec -T postgres psql -U $POSTGRES_USER -d $POSTGRES_DB -t -c "SELECT COUNT(*) FROM tipus_servei;" | tr -d ' ')

if [ "$TIPUS_COUNT" -ge 1 ]; then
    echo -e "${GREEN}✓ Tipus de serveis trobats: $TIPUS_COUNT${NC}"
else
    echo -e "${YELLOW}⚠️  No s'han trobat tipus de serveis seed${NC}"
fi

echo ""

# 10. Recursos del sistema
echo "💻 10. Recursos del sistema..."
echo "CPU i Memòria del contenidor:"
docker stats serveis-postgres --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}"

echo ""

# 11. Mida de la base de dades
echo "📦 11. Mida de la base de dades..."
DB_SIZE=$(docker compose exec -T postgres psql -U $POSTGRES_USER -d $POSTGRES_DB -t -c "SELECT pg_size_pretty(pg_database_size('$POSTGRES_DB'));" | tr -d ' ')
echo -e "${GREEN}Mida: $DB_SIZE${NC}"

echo ""

# 12. Verificar backups
echo "💾 12. Backups disponibles..."
if [ -d "$PROJECT_DIR/backups" ]; then
    BACKUP_COUNT=$(find $PROJECT_DIR/backups -name "backup_*.sql.gz" 2>/dev/null | wc -l)
    if [ "$BACKUP_COUNT" -gt 0 ]; then
        echo -e "${GREEN}✓ Backups trobats: $BACKUP_COUNT${NC}"
        ls -lh $PROJECT_DIR/backups/backup_*.sql.gz 2>/dev/null | tail -5
    else
        echo -e "${YELLOW}⚠️  No hi ha backups encara${NC}"
        echo "   Executa: $PROJECT_DIR/backup.sh"
    fi
else
    echo -e "${YELLOW}⚠️  Carpeta backups no trobada${NC}"
fi

echo ""

# 13. Verificar cron
echo "⏰ 13. Tasques programades (cron)..."
if crontab -l 2>/dev/null | grep -q "serveis"; then
    echo -e "${GREEN}✓ Cron configurat${NC}"
    crontab -l | grep serveis
else
    echo -e "${YELLOW}⚠️  Cron no configurat${NC}"
    echo "   Configura backups automàtics!"
fi

echo ""

# RESUM FINAL
echo "=================================================="
echo "📊 RESUM"
echo "=================================================="
echo ""

ALL_OK=true

# Verificacions crítiques
if ! docker compose ps | grep -q "Up"; then
    echo -e "${RED}✗ PostgreSQL NO està en marxa${NC}"
    ALL_OK=false
else
    echo -e "${GREEN}✓ PostgreSQL en marxa${NC}"
fi

if ! docker compose exec -T postgres pg_isready -U $POSTGRES_USER &> /dev/null; then
    echo -e "${RED}✗ PostgreSQL no accepta connexions${NC}"
    ALL_OK=false
else
    echo -e "${GREEN}✓ PostgreSQL accepta connexions${NC}"
fi

if [ "$TABLES" -lt 6 ]; then
    echo -e "${YELLOW}⚠️  Falten taules (trobades: $TABLES, esperat: 6)${NC}"
    ALL_OK=false
else
    echo -e "${GREEN}✓ Totes les taules creades ($TABLES)${NC}"
fi

if [ "$USER_COUNT" -lt 1 ]; then
    echo -e "${YELLOW}⚠️  No hi ha usuaris seed${NC}"
else
    echo -e "${GREEN}✓ Dades seed carregades${NC}"
fi

echo ""

if [ "$ALL_OK" = true ]; then
    echo -e "${GREEN}🎉 TODO CORRECTE! PostgreSQL funciona perfectament${NC}"
    echo ""
    echo "📝 Informació de connexió:"
    echo "   Host: localhost (només des del servidor)"
    echo "   Port: 5432"
    echo "   Database: $POSTGRES_DB"
    echo "   User: $POSTGRES_USER"
    echo ""
    echo "🔗 Per connectar des del backend:"
    echo "   postgresql://$POSTGRES_USER:PASSWORD@IP_SERVIDOR:5432/$POSTGRES_DB"
else
    echo -e "${YELLOW}⚠️  Hi ha algunes advertències. Revisa els errors anteriors.${NC}"
fi

echo ""
