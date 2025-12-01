#!/bin/bash
#
# Script de Backup Automàtic per PostgreSQL
# Col·locar a: /opt/serveis-extraordinaris/backup.sh
# Afegir a cron: 0 3 * * * /opt/serveis-extraordinaris/backup.sh >> /var/log/serveis-backup.log 2>&1
#

set -e

# Configuració
PROJECT_DIR="$HOME/serveis-extraordinaris"
BACKUP_DIR="$PROJECT_DIR/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_$DATE.sql"
RETENTION_DAYS=30

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo "=================================="
echo "📦 Backup PostgreSQL - $(date)"
echo "=================================="

# Verificar que el contenidor està en marxa
if ! docker compose -f "$PROJECT_DIR/docker-compose.yml" ps | grep -q "serveis-postgres-prod"; then
    echo -e "${RED}ERROR: Contenidor PostgreSQL no està en marxa${NC}"
    exit 1
fi

# Crear backup
echo "Creant backup..."
cd "$PROJECT_DIR"
docker compose exec -T postgres pg_dump -U serveis_user serveis_extraordinaris > "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    # Comprimir
    echo "Comprimint backup..."
    gzip "$BACKUP_FILE"
    
    # Calcular mida
    BACKUP_SIZE=$(du -h "${BACKUP_FILE}.gz" | cut -f1)
    
    echo -e "${GREEN}✓ Backup creat correctament: ${BACKUP_FILE}.gz ($BACKUP_SIZE)${NC}"
    
    # Eliminar backups antics
    echo "Netejant backups antics (>${RETENTION_DAYS} dies)..."
    find "$BACKUP_DIR" -name "backup_*.sql.gz" -mtime +$RETENTION_DAYS -delete
    
    # Mostrar backups disponibles
    BACKUP_COUNT=$(find "$BACKUP_DIR" -name "backup_*.sql.gz" | wc -l)
    echo "Backups disponibles: $BACKUP_COUNT"
    
    # Mostrar espai utilitzat
    TOTAL_SIZE=$(du -sh "$BACKUP_DIR" | cut -f1)
    echo "Espai total backups: $TOTAL_SIZE"
else
    echo -e "${RED}ERROR: El backup ha fallat${NC}"
    exit 1
fi

echo "=================================="
echo ""
