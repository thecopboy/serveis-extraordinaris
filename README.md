# Sistema de Gestió de Serveis Extraordinaris

Sistema complet per gestionar serveis extraordinaris amb compensació en diners o hores.

## 🎯 Stack Tecnològic

### Backend
- **Base de dades**: PostgreSQL 16 (Alpine)
- **API REST**: Node.js + Express/Fastify (planificat)
- **Autenticació**: JWT (Access + Refresh tokens)
- **Seguretat**: Bcrypt per passwords, Row Level Security (RLS)

### Frontend
- **JavaScript**: Vanilla JavaScript (ES6+ modules)
- **Components**: Web Components natius (Custom Elements + Shadow DOM)
- **Arquitectura**: SPA amb router natiu (History API)
- **Estils**: CSS Variables + CSS natiu (zero preprocessors)
- **Build**: Zero build tools (opcional: esbuild per minificar)
- **PWA**: Service Worker + Web App Manifest (opcional)

### Infraestructura
- **Contenidors**: Docker + Docker Compose
- **Reverse Proxy**: Nginx (planificat)
- **SSL**: Let's Encrypt (planificat)
- **Hosting**: Clouding (Ubuntu Server)

## 🚀 Característiques

- ✅ Gestió d'usuaris amb autenticació JWT multi-dispositiu
- ✅ Historial d'empreses multi-tenant
- ✅ Tipus de serveis configurables per usuari
- ✅ Registre de serveis amb càlculs automàtics (triggers)
- ✅ Compensació flexible: diners o hores
- ✅ Suport multi-dispositiu (web, mòbil)
- ✅ Triggers PostgreSQL per lògica de negoci
- ✅ Auditoria completa d'accions (opcional)
- ✅ Temes clar/fosc
- ✅ Internacionalització (ca, es, en)

## 📋 Prerequisits

- **Ubuntu Server** (recomanat 22.04 LTS o superior)
- **Docker** i **Docker Compose**
- Mínim **2GB RAM** i **10GB disc**

## 🔧 Instal·lació a Clouding

### Servidor de Producció
- **Host**: 187.33.157.180
- **Usuari**: themacboy
- **SO**: Ubuntu 24.04.3 LTS
- **Docker**: 29.1.1
- **Docker Compose**: v2.40.3

### 1. Instal·lar Docker

```bash
# Actualitzar sistema
sudo apt update && sudo apt upgrade -y

# Instal·lar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Afegir usuari al grup docker
sudo usermod -aG docker $USER

# Instal·lar Docker Compose
sudo apt install docker-compose-plugin -y

# Verificar instal·lació
docker --version
docker compose version
```

### 2. Clonar projecte

```bash
# Clonar des de GitHub
cd ~
git clone https://github.com/thecopboy/serveis-extraordinaris.git
cd serveis-extraordinaris
```

### 3. Configurar variables d'entorn

```bash
# Des del teu ordinador local, copiar secrets
scp clouding/.env.production themacboy@187.33.157.180:~/serveis-extraordinaris/.env

# Verificar
cat .env | grep POSTGRES_USER
# Ha de mostrar: POSTGRES_USER=themacboy
```

**Variables configurades**:
- `POSTGRES_USER=themacboy` (superusuari PostgreSQL)
- `POSTGRES_DB=serveis_extraordinaris`
- `POSTGRES_PASSWORD=...` (secret generat 256-bit)
- `JWT_SECRET=...` (secret 256-bit)
- `JWT_REFRESH_SECRET=...` (secret 256-bit)

### 4. Iniciar PostgreSQL

```bash
# Executar script d'inicialització
./clouding/start-fresh.sh
```

Aquest script:
- Elimina contenidors i volums antics
- Inicia PostgreSQL amb docker-compose.production.yml
- Carrega l'schema.sql (6 taules + triggers + vistes)
- Carrega dades seed (usuari admin + tipus de serveis)
- Verifica que tot funciona correctament

### 5. Verificar instal·lació

```bash
# Comprovar estat complet
./clouding/check-status.sh

# Connexió manual a PostgreSQL
cd ~/serveis-extraordinaris/clouding
docker compose -f docker-compose.production.yml exec postgres psql -U themacboy -d serveis_extraordinaris

# Dins de psql:
\dt                           # Veure 6 taules
SELECT * FROM users;          # Veure usuari admin
\q                            # Sortir
```

## 📦 Estructura del Projecte

```
serveis-extraordinaris/
├── docker-compose.yml        # Configuració Docker
├── .env.example              # Variables d'entorn (plantilla)
├── .env                      # Variables d'entorn (NO pujar a Git)
├── schema.sql                # Esquema PostgreSQL complet
├── DATABASE_SCHEMA.md        # Documentació detallada
├── FRONTEND.md              # Arquitectura frontend
├── DEPLOY.md                # Guia de desplegament
├── PLANIFICACIO.md          # Planificació del projecte
├── backups/                  # Backups de la BD
├── backend/                  # API REST (planificat)
│   ├── src/
│   ├── package.json
│   └── Dockerfile
└── frontend/                 # Vanilla JS + Web Components (planificat)
    ├── index.html
    ├── js/
    ├── components/
    ├── pages/
    └── assets/
```

## 🔐 Credencials per Defecte

**⚠️ CANVIAR EN PRODUCCIÓ!**

- **Email**: `themacboy72@gmail.com`
- **Nom**: Pau López
- **Pseudònim**: themacboy
- **Contrasenya**: `Admin123!`
- **Rol**: Admin

## 🛠️ Comandes Útils

### Gestió de contenidors

```bash
# Iniciar serveis
cd ~/serveis-extraordinaris/clouding
docker compose -f docker-compose.production.yml up -d

# Aturar serveis
docker compose -f docker-compose.production.yml down

# Reiniciar serveis
docker compose -f docker-compose.production.yml restart

# Veure logs en temps real
docker compose -f docker-compose.production.yml logs -f postgres

# Reiniciar des de zero (elimina dades!)
cd ~/serveis-extraordinaris
./clouding/start-fresh.sh

# Verificar estat complet
./clouding/check-status.sh
```

### Backups

```bash
# Backup manual
cd ~/serveis-extraordinaris
./clouding/backup.sh

# Backups automàtics (configurar cron)
crontab -e
# Afegir: 0 3 * * * /home/themacboy/serveis-extraordinaris/clouding/backup.sh >> /var/log/serveis-backup.log 2>&1

# Restaurar backup
cd ~/serveis-extraordinaris/clouding
gunzip -c ../backups/backup_20251201_030000.sql.gz | docker compose -f docker-compose.production.yml exec -T postgres psql -U themacboy -d serveis_extraordinaris
```

### Manteniment

```bash
# Netejar tokens expirats
cd ~/serveis-extraordinaris
./clouding/cleanup_tokens.sh

# Configurar neteja automàtica (cron)
crontab -e
# Afegir: 0 4 * * * /home/themacboy/serveis-extraordinaris/clouding/cleanup_tokens.sh >> /var/log/serveis-cleanup.log 2>&1

# Veure mida de la base de dades
cd ~/serveis-extraordinaris/clouding
docker compose -f docker-compose.production.yml exec postgres psql -U themacboy -d serveis_extraordinaris -c "SELECT pg_size_pretty(pg_database_size('serveis_extraordinaris'));"
```

### Actualitzacions

```bash
# Actualitzar codi des de GitHub
cd ~/serveis-extraordinaris
git pull

# Si has canviat l'schema SQL, recrear BD
./clouding/start-fresh.sh

# Si només has canviat configuració
cd clouding
docker compose -f docker-compose.production.yml restart
```

## 🌐 Configuració de Firewall (UFW)

```bash
# Permetre SSH
sudo ufw allow 22/tcp

# Permetre PostgreSQL (només si cal accés extern)
sudo ufw allow 5432/tcp

# Permetre HTTP/HTTPS (quan afegim Nginx)
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Activar firewall
sudo ufw enable
```

## 📊 Monitorització

```bash
# Veure recursos utilitzats
docker stats

# Veure mida dels volums
docker system df -v

# Veure connexions actives a PostgreSQL
docker compose exec postgres psql -U serveis_user -d serveis_extraordinaris -c "SELECT count(*) FROM pg_stat_activity WHERE state = 'active';"
```

## 🔄 Roadmap

### Fase 1: Base de Dades ✅ COMPLETAT
- [x] Disseny esquema PostgreSQL
- [x] Implementació triggers i validacions
- [x] Docker Compose per PostgreSQL
- [x] Scripts de backup
- [x] Desplegament a Clouding (187.33.157.180)
- [x] 6 taules creades amb seed data
- [x] Usuari admin personalitzat

### Fase 2: Backend API (En curs)
- [ ] Crear API REST (Node.js + Express/Fastify)
- [ ] Implementar autenticació JWT
- [ ] Endpoints CRUD per totes les entitats
- [ ] Validacions i gestió d'errors
- [ ] Tests unitaris i integració

### Fase 3: Frontend (Planificat)
- [ ] Estructura base amb Web Components
- [ ] Components base (header, modal, form)
- [ ] Router SPA
- [ ] Client API amb refresh token
- [ ] Pàgines principals (dashboard, serveis)
- [ ] Sistema de notificacions
- [ ] Temes clar/fosc

### Fase 4: Producció (Planificat)
- [ ] Nginx com a reverse proxy
- [ ] SSL amb Let's Encrypt
- [ ] Backups automàtics (cron)
- [ ] Monitorització (Prometheus/Grafana)
- [ ] CI/CD pipeline

## 📝 Notes Importants

1. **Seguretat**: Canvia SEMPRE les contrasenyes per defecte
2. **Backups**: Configura backups automàtics diaris
3. **Updates**: Mantén Docker i PostgreSQL actualitzats
4. **Logs**: Revisa logs periòdicament per detectar errors
5. **Recursos**: Monitoritza ús de CPU/RAM/Disc

## 🆘 Resolució de Problemes

### PostgreSQL no arranca

```bash
# Veure logs detallats
docker compose logs postgres

# Verificar permisos del volum
docker volume inspect serveis-extraordinaris_postgres_data

# Reiniciar amb volum net (PERDRÀS DADES!)
docker compose down -v
docker compose up -d
```

### No puc connectar a la base de dades

```bash
# Verificar que el contenidor està actiu
docker compose ps

# Verificar que el port està obert
sudo netstat -tulpn | grep 5432

# Provar connexió local
docker compose exec postgres psql -U serveis_user -d serveis_extraordinaris
```

## 📚 Documentació Addicional

- **[DATABASE_SCHEMA.md](DATABASE_SCHEMA.md)** - Esquema complet de base de dades
- **[FRONTEND.md](FRONTEND.md)** - Arquitectura frontend amb Web Components
- **[DEPLOY.md](DEPLOY.md)** - Guia completa de desplegament a Clouding
- **[PLANIFICACIO.md](PLANIFICACIO.md)** - Planificació i decisions de disseny

## 🤝 Contribució

Aquest és un projecte privat per ús intern.

## 📄 Llicència

Propietari - Tots els drets reservats.

---

**Data de creació**: 29 de novembre de 2025  
**Última actualització**: 1 de desembre de 2025  
**Versió**: 1.0.1  
**Estat**: PostgreSQL desplegat i funcionant ✅