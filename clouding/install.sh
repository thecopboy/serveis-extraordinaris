#!/bin/bash
#
# Script d'instal·lació de PostgreSQL per Clouding
# Executa aquest script AL SERVIDOR de Clouding
#

set -e  # Sortir si hi ha error

echo "🚀 Instal·lació de PostgreSQL - Serveis Extraordinaris"
echo "======================================================"
echo ""

# Colors per output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 1. Comprovar si som root o tenim sudo
if [[ $EUID -ne 0 ]] && ! sudo -v &> /dev/null; then
   echo -e "${RED}Aquest script necessita permisos de sudo${NC}"
   exit 1
fi

echo -e "${GREEN}✓ Permisos verificats${NC}"

# 2. Actualitzar sistema
echo ""
echo "📦 Actualitzant sistema..."
sudo apt update && sudo apt upgrade -y

echo -e "${GREEN}✓ Sistema actualitzat${NC}"

# 3. Instal·lar utilitats bàsiques
echo ""
echo "🔧 Instal·lant utilitats bàsiques..."
sudo apt install -y curl wget git nano vim htop ufw openssl

echo -e "${GREEN}✓ Utilitats instal·lades${NC}"

# 4. Instal·lar Docker si no està instal·lat
if ! command -v docker &> /dev/null; then
    echo ""
    echo "🐳 Instal·lant Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    rm get-docker.sh
    
    # Afegir usuari actual al grup docker
    sudo usermod -aG docker $USER
    echo -e "${YELLOW}⚠️  Hauràs de reconnectar SSH per aplicar permisos Docker${NC}"
else
    echo -e "${GREEN}✓ Docker ja està instal·lat${NC}"
fi

# 5. Instal·lar Docker Compose
if ! docker compose version &> /dev/null; then
    echo ""
    echo "🐳 Instal·lant Docker Compose..."
    sudo apt install -y docker-compose-plugin
else
    echo -e "${GREEN}✓ Docker Compose ja està instal·lat${NC}"
fi

# Verificar versions
echo ""
echo "📋 Versions instal·lades:"
docker --version
docker compose version

# 6. Configurar Firewall
echo ""
echo "🔥 Configurant firewall (UFW)..."
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp comment 'SSH'
# PostgreSQL només accessible localment (no obrir port extern)
echo -e "${GREEN}✓ Firewall configurat (PostgreSQL només local)${NC}"

# Preguntar si activar firewall
read -p "Vols activar el firewall ara? (s/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[SsYy]$ ]]; then
    sudo ufw --force enable
    sudo ufw status
    echo -e "${GREEN}✓ Firewall activat${NC}"
else
    echo -e "${YELLOW}⚠️  Recorda activar el firewall més tard amb: sudo ufw enable${NC}"
fi

# 7. Crear directori del projecte
echo ""
echo "📁 Creant directori del projecte..."
PROJECT_DIR="/home/themacboy/serveis-extraordinaris"
mkdir -p $PROJECT_DIR
cd $PROJECT_DIR

echo -e "${GREEN}✓ Directori creat: $PROJECT_DIR${NC}"

# 8. Crear estructura de carpetes
mkdir -p backups
mkdir -p logs
chmod 700 backups

echo -e "${GREEN}✓ Estructura de carpetes creada${NC}"

# 9. Informació final
echo ""
echo "======================================================"
echo -e "${GREEN}✓ Instal·lació base completada!${NC}"
echo "======================================================"
echo ""
echo "📝 SEGÜENTS PASSOS:"
echo ""
echo "1. Puja els fitxers necessaris al servidor:"
echo "   - docker-compose.production.yml → $PROJECT_DIR/docker-compose.yml"
echo "   - .env.production → $PROJECT_DIR/.env"
echo "   - schema.sql → $PROJECT_DIR/schema.sql"
echo ""
echo "2. Des del teu ordinador local, executa:"
echo "   scp clouding/docker-compose.production.yml usuari@IP_SERVIDOR:$PROJECT_DIR/docker-compose.yml"
echo "   scp clouding/.env.production usuari@IP_SERVIDOR:$PROJECT_DIR/.env"
echo "   scp schema.sql usuari@IP_SERVIDOR:$PROJECT_DIR/schema.sql"
echo ""
echo "3. Al servidor, inicia PostgreSQL:"
echo "   cd $PROJECT_DIR"
echo "   docker compose up -d"
echo ""
echo "4. Verifica que funciona:"
echo "   docker compose ps"
echo "   docker compose logs -f"
echo ""
echo -e "${YELLOW}⚠️  Si has instal·lat Docker ara, reconnecta SSH abans de continuar${NC}"
echo ""
