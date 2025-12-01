#!/bin/bash
# Verificació ràpida de PostgreSQL
# Executa: ssh thecopboy@IP_SERVIDOR 'bash -s' < clouding/quick-check.sh

cd /home/thecopboy/serveis-extraordinaris

echo "🔍 VERIFICACIÓ RÀPIDA"
echo "===================="
echo ""

# Estat contenidor
echo "📦 Estat:"
docker compose ps

echo ""

# Healthcheck
echo "🏥 Salut:"
docker compose exec -T postgres pg_isready -U serveis_user -d serveis_extraordinaris

echo ""

# Taules
echo "📊 Taules:"
docker compose exec -T postgres psql -U serveis_user -d serveis_extraordinaris -c "\dt" | grep "public"

echo ""

# Usuaris
echo "👤 Usuaris:"
docker compose exec -T postgres psql -U serveis_user -d serveis_extraordinaris -t -c "SELECT email, nom FROM users;"

echo ""
echo "✅ Si veus això, tot funciona!"
