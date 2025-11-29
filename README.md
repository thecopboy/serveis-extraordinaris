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

### 2. Clonar o pujar el projecte

```bash
# Opció A: Clonar des de Git
git clone https://github.com/tuusuari/serveis-extraordinaris.git
cd serveis-extraordinaris

# Opció B: Pujar manualment amb scp
scp -r ./serveis-extraordinaris root@IP_SERVIDOR:/opt/
```

### 3. Configurar variables d'entorn

```bash
# Copiar fitxer d'exemple
cp .env.example .env

# Editar amb nano o vim
nano .env

# Generar secrets segurs
openssl rand -base64 32  # Per JWT_SECRET
openssl rand -base64 32  # Per JWT_REFRESH_SECRET
```

### 4. Iniciar els serveis

```bash
# Crear carpeta de backups
mkdir -p backups

# Pujar els contenidors
docker compose up -d

# Veure logs
docker compose logs -f postgres

# Verificar estat
docker compose ps
```

### 5. Verificar base de dades

```bash
# Connectar a PostgreSQL
docker compose exec postgres psql -U serveis_user -d serveis_extraordinaris

# Dins de psql:
\dt                           # Veure taules
\df                           # Veure funcions/triggers
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

- **Email**: `admin@serveis.local`
- **Contrasenya**: `Admin123!`
- **Rol**: Admin

## 🛠️ Comandes Útils

### Gestió de contenidors

```bash
# Aturar serveis
docker compose down

# Reiniciar serveis
docker compose restart

# Veure logs en temps real
docker compose logs -f

# Veure logs només de postgres
docker compose logs -f postgres
```

### Backups

```bash
# Crear backup manual
docker compose exec postgres pg_dump -U serveis_user serveis_extraordinaris > backups/backup_$(date +%Y%m%d_%H%M%S).sql

# Restaurar backup
docker compose exec -T postgres psql -U serveis_user serveis_extraordinaris < backups/backup_20251129_120000.sql
```

### Manteniment

```bash
# Netejar tokens expirats
docker compose exec postgres psql -U serveis_user -d serveis_extraordinaris -c "SELECT netejar_tokens_expirats();"

# Veure mida de la base de dades
docker compose exec postgres psql -U serveis_user -d serveis_extraordinaris -c "SELECT pg_size_pretty(pg_database_size('serveis_extraordinaris'));"
```

### Actualitzacions

```bash
# Actualitzar schema (amb precaució!)
docker compose exec -i postgres psql -U serveis_user serveis_extraordinaris < schema.sql

# Reiniciar només PostgreSQL
docker compose restart postgres
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

### Fase 1: Base de Dades ✅
- [x] Disseny esquema PostgreSQL
- [x] Implementació triggers i validacions
- [x] Docker Compose per PostgreSQL
- [x] Scripts de backup

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
**Última actualització**: 29 de novembre de 2025  
**Versió**: 1.0.0