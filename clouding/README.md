# Desplegament a Clouding - Guia Pas a Pas

Aquesta guia et portarà pas a pas per desplegar PostgreSQL al teu servidor de Clouding.

## 📋 Prerequisits

- Servidor Ubuntu 22.04 o 24.04 a Clouding
- Accés SSH al servidor
- IP pública del servidor

---

## 🚀 PAS 1: Preparar el Servidor

### 1.1. Connectar per SSH

```bash
# Des del teu ordinador local
ssh root@IP_DEL_TEU_SERVIDOR

# O si uses clau SSH
ssh -i ~/.ssh/la_teva_clau root@IP_DEL_TEU_SERVIDOR
```

### 1.2. Executar script d'instal·lació

**Opció A: Pujar i executar localment**

```bash
# Des del teu ordinador, puja l'script
scp clouding/install.sh root@IP_SERVIDOR:/tmp/install.sh

# Al servidor
ssh root@IP_SERVIDOR
chmod +x /tmp/install.sh
/tmp/install.sh
```

**Opció B: Executar remotament directament**

```bash
# Des del teu ordinador (executa tot d'un cop)
cat clouding/install.sh | ssh root@IP_SERVIDOR 'bash -s'
```

Aquest script farà:
- ✅ Actualitzar el sistema
- ✅ Instal·lar Docker i Docker Compose
- ✅ Configurar firewall (UFW)
- ✅ Crear directori `/opt/serveis-extraordinaris`
- ✅ Crear carpetes `backups/` i `logs/`

⚠️ **IMPORTANT**: Si Docker s'ha instal·lat ara, **reconnecta SSH** abans de continuar.

---

## 📦 PAS 2: Pujar Fitxers al Servidor

Ara puja els fitxers necessaris des del teu ordinador local:

```bash
# Des del directori del projecte al teu ordinador local
cd /workspaces/serveis-extraordinaris

# Pujar docker-compose
scp clouding/docker-compose.production.yml root@IP_SERVIDOR:/opt/serveis-extraordinaris/docker-compose.yml

# Pujar variables d'entorn (AMB SECRETS!)
scp clouding/.env.production root@IP_SERVIDOR:/opt/serveis-extraordinaris/.env

# Pujar schema SQL
scp schema.sql root@IP_SERVIDOR:/opt/serveis-extraordinaris/schema.sql

# Pujar scripts de backup
scp clouding/backup.sh root@IP_SERVIDOR:/opt/serveis-extraordinaris/backup.sh
scp clouding/cleanup_tokens.sh root@IP_SERVIDOR:/opt/serveis-extraordinaris/cleanup_tokens.sh
```

---

## 🔐 PAS 3: Verificar Variables d'Entorn

Al servidor, comprova que les variables s'han pujat correctament:

```bash
ssh root@IP_SERVIDOR

cd /opt/serveis-extraordinaris

# Veure el fitxer .env (sense mostrar secrets complets)
cat .env | head -5

# Verificar que els 3 secrets estan presents
grep -c "SECRET\|PASSWORD" .env
# Ha de retornar: 3
```

---

## 🐳 PAS 4: Iniciar PostgreSQL

```bash
# Al servidor
cd /opt/serveis-extraordinaris

# Descarregar imatge PostgreSQL
docker compose pull

# Iniciar PostgreSQL en segon pla
docker compose up -d

# Veure logs en temps real
docker compose logs -f
```

**Sortida esperada:**
```
✓ Container serveis-postgres-prod  Started
```

Prem `Ctrl+C` per sortir dels logs.

---

## ✅ PAS 5: Verificar Instal·lació

### 5.1. Estat dels contenidors

```bash
docker compose ps
```

Hauria de mostrar:
```
NAME                      STATUS         PORTS
serveis-postgres-prod     Up (healthy)   127.0.0.1:5432->5432/tcp
```

### 5.2. Verificar connexió PostgreSQL

```bash
docker compose exec postgres psql -U serveis_user -d serveis_extraordinaris -c "SELECT version();"
```

Hauria de mostrar la versió de PostgreSQL.

### 5.3. Verificar taules creades

```bash
docker compose exec postgres psql -U serveis_user -d serveis_extraordinaris

# Dins de psql:
\dt

# Hauria de llistar 6 taules:
# - users
# - refresh_tokens
# - empreses
# - tipus_servei
# - serveis
# - audit_log

# Veure usuari admin seed
SELECT id, email, nom FROM users;

# Sortir
\q
```

### 5.4. Verificar dades seed

```bash
# Comprovar usuari admin
docker compose exec postgres psql -U serveis_user -d serveis_extraordinaris -c "SELECT email, nom, rol FROM users;"

# Comprovar tipus de serveis predefinits
docker compose exec postgres psql -U serveis_user -d serveis_extraordinaris -c "SELECT nom, preu_hora FROM tipus_servei;"
```

---

## 🔐 PAS 6: Securitzar Instal·lació

### 6.1. Canviar contrasenya de l'usuari admin

L'usuari admin té contrasenya `Admin123!`. Cal canviar-la:

```bash
# Generar nou hash bcrypt
# Opció A: Amb Python (normalment disponible)
python3 -c "import crypt; print(crypt.crypt('LaTevaNOVAcontrasenya', crypt.mksalt(crypt.METHOD_SHA512)))"

# Opció B: Instal·lar bcrypt i generar
sudo apt install -y python3-bcrypt
python3 << EOF
import bcrypt
password = b'LaTevaNOVAcontrasenya'
hashed = bcrypt.hashpw(password, bcrypt.gensalt(rounds=10))
print(hashed.decode())
EOF
```

Actualitzar a la base de dades:

```bash
docker compose exec postgres psql -U serveis_user -d serveis_extraordinaris

-- Substitueix NOU_HASH pel hash generat
UPDATE users 
SET password_hash = 'NOU_HASH_AQUI' 
WHERE email = 'admin@serveis.local';

-- Verificar
SELECT email, nom FROM users WHERE email = 'admin@serveis.local';

\q
```

### 6.2. Protegir fitxers sensibles

```bash
# Restringir permisos del .env
chmod 600 /opt/serveis-extraordinaris/.env

# Només el propietari pot llegir
ls -la /opt/serveis-extraordinaris/.env
# Ha de mostrar: -rw------- 
```

---

## 🔄 PAS 7: Configurar Backups Automàtics

### 7.1. Donar permisos d'execució als scripts

```bash
chmod +x /opt/serveis-extraordinaris/backup.sh
chmod +x /opt/serveis-extraordinaris/cleanup_tokens.sh
```

### 7.2. Provar backup manual

```bash
/opt/serveis-extraordinaris/backup.sh
```

Hauria de crear: `/opt/serveis-extraordinaris/backups/backup_YYYYMMDD_HHMMSS.sql.gz`

### 7.3. Configurar cron per backups automàtics

```bash
# Editar crontab
crontab -e

# Afegir aquestes línies al final:

# Backup diari a les 3:00 AM
0 3 * * * /opt/serveis-extraordinaris/backup.sh >> /var/log/serveis-backup.log 2>&1

# Neteja de tokens expirats a les 4:00 AM
0 4 * * * /opt/serveis-extraordinaris/cleanup_tokens.sh >> /var/log/serveis-cleanup.log 2>&1

# Guardar i sortir (Ctrl+O, Enter, Ctrl+X si uses nano)
```

### 7.4. Verificar cron

```bash
# Llistar tasques programades
crontab -l

# Veure logs de cron
sudo tail -f /var/log/cron.log
```

---

## 📊 PAS 8: Monitorització

### 8.1. Veure logs

```bash
# Logs de PostgreSQL
docker compose logs -f postgres

# Només errors
docker compose logs postgres | grep -i error

# Últimes 50 línies
docker compose logs --tail=50 postgres
```

### 8.2. Monitoritzar recursos

```bash
# Recursos del contenidor
docker stats serveis-postgres-prod

# Espai en disc
df -h

# Mida de la base de dades
docker compose exec postgres psql -U serveis_user -d serveis_extraordinaris -c "SELECT pg_size_pretty(pg_database_size('serveis_extraordinaris'));"

# Mida dels backups
du -sh /opt/serveis-extraordinaris/backups
```

---

## 🔧 Comandes Útils

### Reiniciar PostgreSQL

```bash
cd /opt/serveis-extraordinaris
docker compose restart postgres
```

### Parar PostgreSQL

```bash
docker compose stop
```

### Parar i eliminar contenidors (manté dades)

```bash
docker compose down
```

### Veure logs d'errors

```bash
docker compose logs postgres | grep -i "error\|fatal\|panic"
```

### Restaurar backup

```bash
# Descomprimir backup
gunzip -k /opt/serveis-extraordinaris/backups/backup_20251130_030000.sql.gz

# Restaurar
docker compose exec -T postgres psql -U serveis_user serveis_extraordinaris < /opt/serveis-extraordinaris/backups/backup_20251130_030000.sql
```

---

## ✅ Checklist Final

- [ ] Script d'instal·lació executat correctament
- [ ] Docker i Docker Compose instal·lats
- [ ] Fitxers pujats al servidor (docker-compose.yml, .env, schema.sql)
- [ ] PostgreSQL iniciat i funcionant (`docker compose ps`)
- [ ] Base de dades creada amb 6 taules
- [ ] Dades seed verificades (usuari admin, tipus de serveis)
- [ ] Contrasenya admin canviada
- [ ] Permisos del .env restringits (chmod 600)
- [ ] Backup manual provat
- [ ] Cron configurat per backups automàtics
- [ ] Firewall activat (UFW)
- [ ] Logs revisats sense errors

---

## 🎯 Propera Fase

Un cop PostgreSQL estigui funcionant correctament, podràs:

1. **Connectar el backend** local a la BD de producció per desenvolupament
2. **Desplegar el backend** al mateix servidor quan estigui llest
3. **Afegir Nginx** com a reverse proxy amb SSL

---

**Suport**: Si tens problemes, revisa els logs amb `docker compose logs -f`

**Data**: 30 de novembre de 2025
