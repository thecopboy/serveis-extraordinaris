# Guia de Desplegament a Clouding

Instruccions pas a pas per desplegar el sistema a un servidor Ubuntu a Clouding.

## 📋 Preparació

### 1. Crear servidor a Clouding

1. Accedeix al panel de Clouding
2. Crear nou servidor:
   - **SO**: Ubuntu Server 22.04 LTS o 24.04 LTS
   - **RAM**: Mínim 2GB (recomanat 4GB)
   - **Disc**: Mínim 20GB SSD
   - **CPU**: 1-2 vCPUs suficient
3. Apunta la **IP pública** del servidor
4. Configura **clau SSH** (més segur que contrasenya)

### 2. Primera connexió SSH

```bash
# Connectar al servidor (canvia IP_SERVIDOR)
ssh root@IP_SERVIDOR

# Si uses clau SSH privada
ssh -i ~/.ssh/clouding_key root@IP_SERVIDOR
```

## 🔧 Instal·lació Base

### 3. Actualitzar sistema

```bash
# Actualitzar paquets
apt update && apt upgrade -y

# Instal·lar utilitats bàsiques
apt install -y curl wget git nano vim htop ufw
```

### 4. Crear usuari no-root (recomanat)

```bash
# Crear usuari
adduser serveis
usermod -aG sudo serveis

# Copiar claus SSH (si n'uses)
rsync --archive --chown=serveis:serveis ~/.ssh /home/serveis

# Provar accés amb nou usuari
su - serveis
```

### 5. Configurar Firewall

```bash
# Configurar UFW
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp comment 'SSH'
sudo ufw allow 5432/tcp comment 'PostgreSQL'
sudo ufw enable

# Verificar
sudo ufw status
```

## 🐳 Instal·lar Docker

### 6. Instal·lar Docker Engine

```bash
# Descarregar script oficial
curl -fsSL https://get.docker.com -o get-docker.sh

# Executar instal·lació
sudo sh get-docker.sh

# Afegir usuari al grup docker
sudo usermod -aG docker $USER

# Aplicar canvis de grup (o reconnectar SSH)
newgrp docker

# Verificar instal·lació
docker --version
# Output esperat: Docker version 24.x.x
```

### 7. Instal·lar Docker Compose

```bash
# Instal·lar plugin
sudo apt install -y docker-compose-plugin

# Verificar
docker compose version
# Output esperat: Docker Compose version v2.x.x
```

## 📦 Desplegar Aplicació

### 8. Preparar directori

```bash
# Crear directori del projecte
sudo mkdir -p /opt/serveis-extraordinaris
sudo chown $USER:$USER /opt/serveis-extraordinaris
cd /opt/serveis-extraordinaris
```

### 9. Pujar fitxers

**Opció A: Des del teu ordinador local**

```bash
# Des del teu ordinador (canvia IP_SERVIDOR)
scp docker-compose.yml serveis@IP_SERVIDOR:/opt/serveis-extraordinaris/
scp schema.sql serveis@IP_SERVIDOR:/opt/serveis-extraordinaris/
scp .env.example serveis@IP_SERVIDOR:/opt/serveis-extraordinaris/
scp README.md serveis@IP_SERVIDOR:/opt/serveis-extraordinaris/
```

**Opció B: Amb Git (si tens repositori)**

```bash
# Al servidor
cd /opt/serveis-extraordinaris
git clone https://github.com/tuusuari/serveis-extraordinaris.git .
```

**Opció C: Crear fitxers manualment**

```bash
# Al servidor
nano docker-compose.yml
# (copiar contingut i guardar amb Ctrl+O, Ctrl+X)

nano schema.sql
# (copiar contingut i guardar)
```

### 10. Configurar variables d'entorn

```bash
# Copiar plantilla
cp .env.example .env

# Editar .env
nano .env
```

**Valors recomanats per producció:**

```env
POSTGRES_PASSWORD=UnaSuperContrasenyaSegura123!XYZ
POSTGRES_USER=serveis_user
POSTGRES_DB=serveis_extraordinaris

JWT_SECRET=generar_amb_openssl_rand_base64_32
JWT_REFRESH_SECRET=un_altre_secret_diferent_aqui

NODE_ENV=production
PORT=3000
TZ=Europe/Madrid
```

**Generar secrets segurs:**

```bash
# Generar JWT_SECRET
openssl rand -base64 32

# Generar JWT_REFRESH_SECRET
openssl rand -base64 32
```

### 11. Crear carpeta backups

```bash
mkdir -p /opt/serveis-extraordinaris/backups
chmod 700 /opt/serveis-extraordinaris/backups
```

## 🚀 Iniciar Serveis

### 12. Pujar contenidors

```bash
cd /opt/serveis-extraordinaris

# Descarregar imatges
docker compose pull

# Iniciar en segon pla
docker compose up -d

# Veure logs
docker compose logs -f
```

### 13. Verificar funcionament

```bash
# Veure estat dels contenidors
docker compose ps
# Output esperat: serveis-postgres (healthy)

# Verificar logs
docker compose logs postgres | tail -20

# Provar connexió
docker compose exec postgres psql -U serveis_user -d serveis_extraordinaris -c "SELECT version();"
```

### 14. Verificar dades seed

```bash
# Connectar a PostgreSQL
docker compose exec postgres psql -U serveis_user -d serveis_extraordinaris

# Dins de psql:
\dt                                    # Llistar taules (has de veure 6)
SELECT * FROM users;                   # Veure usuari admin
SELECT * FROM tipus_servei;            # Veure tipus predefinits
\q                                     # Sortir
```

## 🔒 Securitzar Instal·lació

### 15. Canviar contrasenya admin

```bash
# Generar nou hash bcrypt (necessita Node.js o Python)
# Opció A: Amb Node.js (instal·lar si cal)
npm install -g bcrypt-cli
bcrypt "NovaContrasenya123!" 10

# Opció B: Amb Python
python3 -c "import bcrypt; print(bcrypt.hashpw(b'NovaContrasenya123!', bcrypt.gensalt(10)).decode())"

# Actualitzar a la BD
docker compose exec postgres psql -U serveis_user -d serveis_extraordinaris
UPDATE users SET password_hash = 'NOU_HASH_AQUI' WHERE email = 'admin@serveis.local';
\q
```

### 16. Restringir accés a PostgreSQL

**Si només necessites accés local (recomanat):**

```bash
# Editar docker-compose.yml
nano docker-compose.yml

# Canviar ports de:
    ports:
      - "5432:5432"
# A:
    ports:
      - "127.0.0.1:5432:5432"  # Només localhost

# Aplicar canvis
docker compose down
docker compose up -d
```

**Si necessites accés extern (menys segur):**

```bash
# Permetre només des de la teva IP (canvia X.X.X.X)
sudo ufw allow from X.X.X.X to any port 5432
```

## 🔄 Backups Automàtics

### 17. Configurar cron per backups diaris

```bash
# Crear script de backup
nano /opt/serveis-extraordinaris/backup.sh
```

**Contingut del script:**

```bash
#!/bin/bash
BACKUP_DIR="/opt/serveis-extraordinaris/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_$DATE.sql"

# Crear backup
cd /opt/serveis-extraordinaris
docker compose exec -T postgres pg_dump -U serveis_user serveis_extraordinaris > "$BACKUP_FILE"

# Comprimir
gzip "$BACKUP_FILE"

# Eliminar backups antics (conservar últims 30 dies)
find "$BACKUP_DIR" -name "backup_*.sql.gz" -mtime +30 -delete

echo "Backup creat: ${BACKUP_FILE}.gz"
```

```bash
# Donar permisos d'execució
chmod +x /opt/serveis-extraordinaris/backup.sh

# Provar script
/opt/serveis-extraordinaris/backup.sh

# Afegir a cron (cada dia a les 3:00 AM)
crontab -e

# Afegir línia:
0 3 * * * /opt/serveis-extraordinaris/backup.sh >> /var/log/serveis-backup.log 2>&1
```

### 18. Script per netejar tokens

```bash
# Crear script
nano /opt/serveis-extraordinaris/cleanup_tokens.sh
```

**Contingut:**

```bash
#!/bin/bash
cd /opt/serveis-extraordinaris
docker compose exec -T postgres psql -U serveis_user -d serveis_extraordinaris -c "SELECT netejar_tokens_expirats();" >> /var/log/serveis-cleanup.log 2>&1
```

```bash
# Permisos
chmod +x /opt/serveis-extraordinaris/cleanup_tokens.sh

# Afegir a cron (cada dia a les 4:00 AM)
crontab -e

# Afegir:
0 4 * * * /opt/serveis-extraordinaris/cleanup_tokens.sh
```

## 📊 Monitorització

### 19. Configurar logs

```bash
# Veure logs en temps real
docker compose logs -f

# Veure només errors
docker compose logs | grep -i error

# Guardar logs a fitxer
docker compose logs > logs_$(date +%Y%m%d).txt
```

### 20. Monitoritzar recursos

```bash
# Recursos dels contenidors
docker stats

# Espai en disc
df -h
docker system df

# Mida de la base de dades
docker compose exec postgres psql -U serveis_user -d serveis_extraordinaris -c "SELECT pg_size_pretty(pg_database_size('serveis_extraordinaris'));"
```

## 🆘 Resolució de Problemes

### PostgreSQL no arranca

```bash
# Veure error exacte
docker compose logs postgres

# Reiniciar contenidor
docker compose restart postgres

# Si persisteix, recrear
docker compose down
docker compose up -d
```

### Base de dades corrupta

```bash
# Restaurar últim backup
cd /opt/serveis-extraordinaris
gunzip -k backups/backup_YYYYMMDD_HHMMSS.sql.gz
docker compose exec -T postgres psql -U serveis_user serveis_extraordinaris < backups/backup_YYYYMMDD_HHMMSS.sql
```

### Poc espai en disc

```bash
# Netejar imatges Docker antigues
docker system prune -a

# Comprimir logs
sudo journalctl --vacuum-time=7d

# Comprimir backups antics
gzip /opt/serveis-extraordinaris/backups/*.sql
```

## ✅ Checklist Final

- [ ] Docker i Docker Compose instal·lats
- [ ] Fitxers del projecte pujats
- [ ] `.env` configurat amb secrets segurs
- [ ] Contenidors funcionant (`docker compose ps`)
- [ ] Base de dades creada amb seed data
- [ ] Contrasenya admin canviada
- [ ] Firewall configurat (UFW)
- [ ] Backups automàtics configurats (cron)
- [ ] Logs revisats sense errors
- [ ] Accés PostgreSQL restringit (si cal)

## 🎯 Properes Fases

1. **Desenvolupar Backend API**
   - Crear carpeta `backend/`
   - Configurar Node.js + Express/Fastify
   - Implementar endpoints REST
   - Descomentar secció `backend` al `docker-compose.yml`

2. **Desenvolupar Frontend**
   - Crear carpeta `frontend/`
   - Configurar React/Vue/Svelte
   - Descomentar secció `frontend` al `docker-compose.yml`

3. **Configurar Nginx**
   - Descomentar secció `nginx` al `docker-compose.yml`
   - Afegir certificat SSL (Let's Encrypt)
   - Configurar reverse proxy

---

**Suport**: Per dubtes o problemes, revisa logs amb `docker compose logs`

**Data**: 29 de novembre de 2025
