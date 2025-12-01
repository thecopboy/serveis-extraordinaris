#!/bin/bash
#
# GUIA RÀPIDA - Desplegament a Clouding
# Executa aquest script des del TEU ORDINADOR LOCAL
#

echo "📋 GUIA DE DESPLEGAMENT A CLOUDING"
echo "=================================="
echo ""
echo "Aquest script et guiarà pel desplegament pas a pas."
echo ""

# Demanar IP del servidor
read -p "🌐 IP del servidor de Clouding: " SERVER_IP

if [ -z "$SERVER_IP" ]; then
    echo "❌ Has de proporcionar una IP"
    exit 1
fi

# Demanar usuari SSH
read -p "👤 Usuari SSH (per defecte: root): " SSH_USER
SSH_USER=${SSH_USER:-root}

echo ""
echo "📝 Configuració:"
echo "   IP: $SERVER_IP"
echo "   Usuari: $SSH_USER"
echo ""

# Comprovar connexió SSH
echo "🔍 Comprovant connexió SSH..."
if ssh -o ConnectTimeout=5 -o StrictHostKeyChecking=no $SSH_USER@$SERVER_IP "echo 'Connexió OK'" 2>/dev/null; then
    echo "✅ Connexió SSH correcta"
else
    echo "❌ No es pot connectar per SSH"
    echo ""
    echo "Assegura't de:"
    echo "  1. Tenir accés SSH al servidor"
    echo "  2. La IP és correcta"
    echo "  3. El firewall permet connexions SSH (port 22)"
    exit 1
fi

echo ""
echo "=================================="
echo "🚀 INICI DEL DESPLEGAMENT"
echo "=================================="
echo ""

# PAS 1: Executar script d'instal·lació
echo "📦 PAS 1/5: Instal·lant Docker i dependències..."
echo ""
read -p "Prémer Enter per continuar..."

cat clouding/install.sh | ssh $SSH_USER@$SERVER_IP 'bash -s'

if [ $? -ne 0 ]; then
    echo "❌ Error durant la instal·lació"
    exit 1
fi

echo ""
echo "✅ Instal·lació base completada"
echo ""
echo "⚠️  IMPORTANT: Si Docker s'ha instal·lat ara, hauràs de:"
echo "   1. Prémer Ctrl+C per aturar aquest script"
echo "   2. Reconnectar SSH: ssh $SSH_USER@$SERVER_IP"
echo "   3. Tornar a executar aquest script"
echo ""
read -p "¿Docker ja estava instal·lat? (s/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[SsYy]$ ]]; then
    echo "Reconnecta SSH i torna a executar aquest script"
    exit 0
fi

# PAS 2: Pujar fitxers
echo ""
echo "📤 PAS 2/5: Pujant fitxers al servidor..."
echo ""

scp clouding/docker-compose.production.yml $SSH_USER@$SERVER_IP:/home/thecopboy/serveis-extraordinaris/docker-compose.yml
scp clouding/.env.production $SSH_USER@$SERVER_IP:/home/thecopboy/serveis-extraordinaris/.env
scp schema.sql $SSH_USER@$SERVER_IP:/home/thecopboy/serveis-extraordinaris/schema.sql
scp clouding/backup.sh $SSH_USER@$SERVER_IP:/home/thecopboy/serveis-extraordinaris/backup.sh
scp clouding/cleanup_tokens.sh $SSH_USER@$SERVER_IP:/home/thecopboy/serveis-extraordinaris/cleanup_tokens.sh

echo "✅ Fitxers pujats correctament"

# PAS 3: Iniciar PostgreSQL
echo ""
echo "🐳 PAS 3/5: Iniciant PostgreSQL..."
echo ""
read -p "Prémer Enter per continuar..."

ssh $SSH_USER@$SERVER_IP << 'EOF'
cd /home/thecopboy/serveis-extraordinaris
chmod +x backup.sh cleanup_tokens.sh
docker compose pull
docker compose up -d
sleep 5
docker compose ps
EOF

echo ""
echo "✅ PostgreSQL iniciat"

# PAS 4: Verificar instal·lació
echo ""
echo "✅ PAS 4/5: Verificant instal·lació..."
echo ""

ssh $SSH_USER@$SERVER_IP << 'EOF'
cd /home/thecopboy/serveis-extraordinaris
echo "📊 Estat del contenidor:"
docker compose ps
echo ""
echo "🗄️  Taules creades:"
docker compose exec -T postgres psql -U serveis_user -d serveis_extraordinaris -c "\dt"
echo ""
echo "👤 Usuari admin:"
docker compose exec -T postgres psql -U serveis_user -d serveis_extraordinaris -c "SELECT email, nom, rol FROM users;"
EOF

# PAS 5: Configurar backups
echo ""
echo "📦 PAS 5/5: Configurant backups automàtics..."
echo ""

ssh $SSH_USER@$SERVER_IP << 'EOF'
# Provar backup manual
/home/thecopboy/serveis-extraordinaris/backup.sh

# Configurar cron
(crontab -l 2>/dev/null; echo "0 3 * * * /home/thecopboy/serveis-extraordinaris/backup.sh >> /var/log/serveis-backup.log 2>&1") | crontab -
(crontab -l 2>/dev/null; echo "0 4 * * * /home/thecopboy/serveis-extraordinaris/cleanup_tokens.sh >> /var/log/serveis-cleanup.log 2>&1") | crontab -

echo "✅ Backups configurats:"
crontab -l | grep serveis
EOF

# RESUM FINAL
echo ""
echo "=================================="
echo "✅ DESPLEGAMENT COMPLETAT!"
echo "=================================="
echo ""
echo "📋 Accés a PostgreSQL:"
echo "   Host: $SERVER_IP (només localhost al servidor)"
echo "   Port: 5432"
echo "   Database: serveis_extraordinaris"
echo "   User: serveis_user"
echo ""
echo "🔐 SEGURETAT IMPORTANT:"
echo "   ⚠️  Canvia la contrasenya de l'usuari admin!"
echo "   1. Connecta: ssh $SSH_USER@$SERVER_IP"
echo "   2. Genera hash: python3 -c \"import bcrypt; print(bcrypt.hashpw(b'NovaContrasenya', bcrypt.gensalt()).decode())\""
echo "   3. Actualitza BD"
echo ""
echo "📊 Comandes útils:"
echo "   ssh $SSH_USER@$SERVER_IP 'cd /opt/serveis-extraordinaris && docker compose ps'"
echo "   ssh $SSH_USER@$SERVER_IP 'cd /opt/serveis-extraordinaris && docker compose logs -f'"
echo ""
echo "📚 Documentació completa a: clouding/README.md"
echo ""
