#!/bin/bash
#
# Script per netejar tokens expirats
# Col·locar a: /opt/serveis-extraordinaris/cleanup_tokens.sh
# Afegir a cron: 0 4 * * * /opt/serveis-extraordinaris/cleanup_tokens.sh >> /var/log/serveis-cleanup.log 2>&1
#

set -e

PROJECT_DIR="/home/themacboy/serveis-extraordinaris"

echo "=================================="
echo "🧹 Neteja de Tokens - $(date)"
echo "=================================="

cd "$PROJECT_DIR"

# Executar funció de neteja
RESULT=$(docker compose exec -T postgres psql -U serveis_user -d serveis_extraordinaris -t -c "SELECT netejar_tokens_expirats();")

echo "Tokens eliminats: $RESULT"
echo "=================================="
echo ""
