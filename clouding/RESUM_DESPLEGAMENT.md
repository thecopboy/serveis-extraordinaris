# 🚀 Desplegament PostgreSQL a Clouding - Resum

## 📦 Què s'ha Preparat

S'ha creat tota l'estructura necessària per desplegar PostgreSQL al teu servidor de Clouding de forma professional:

```
clouding/
├── README.md                          # Guia pas a pas COMPLETA
├── deploy.sh                          # Script automatitzat (recomanat)
├── install.sh                         # Instal·la Docker i dependències
├── docker-compose.production.yml     # Configuració PostgreSQL producció
├── .env.production                    # Variables d'entorn AMB SECRETS
├── backup.sh                          # Backup automàtic diari
└── cleanup_tokens.sh                  # Neteja tokens expirats
```

## 🔐 Secrets Generats

S'han generat **secrets criptogràficament segurs** per a producció:

```bash
POSTGRES_PASSWORD: qdxOu6SATwJpSrfPOWLEFRwrIPJs2ktqKRZRvw+r2zk=
JWT_SECRET:        5sdin7wIXDMuBMifHkpFkevb9b0kTCxLNXm8WQUH8I0=
JWT_REFRESH_SECRET: btQ+cJV2BbWGe3Q0qpXYx285IOX2awcIVeFNk9m2MMI=
```

⚠️ **IMPORTANT**: Aquests secrets estan a `clouding/.env.production` (NO es pujarà a Git)

---

## 🎯 Dues Opcions de Desplegament

### Opció 1: Script Automatitzat (RECOMANAT) 🏃

```bash
# Des del teu ordinador local
./clouding/deploy.sh
```

Aquest script:
- ✅ Comprova connexió SSH
- ✅ Instal·la Docker i dependències
- ✅ Puja tots els fitxers necessaris
- ✅ Inicia PostgreSQL
- ✅ Verifica la instal·lació
- ✅ Configura backups automàtics

**Només necessites:**
- IP del servidor Clouding
- Accés SSH (usuari/contrasenya o clau)

---

### Opció 2: Pas a Pas (EDUCATIU) 🎓

Segueix la guia completa a `clouding/README.md` per entendre cada pas:

1. **Preparar servidor** → Instalar Docker
2. **Pujar fitxers** → docker-compose, .env, schema.sql
3. **Iniciar PostgreSQL** → docker compose up -d
4. **Verificar** → Taules, dades seed, connexió
5. **Securitzar** → Canviar password admin
6. **Backups** → Configurar cron automàtic
7. **Monitoritzar** → Logs, recursos, backups

---

## 📋 Checklist Abans de Començar

- [ ] Tens un servidor Ubuntu 22.04/24.04 a Clouding
- [ ] Coneixes la **IP pública** del servidor
- [ ] Tens **accés SSH** (root o sudo)
- [ ] Has revisat els **secrets** a `clouding/.env.production`

---

## 🚀 Començar Ara

### Opció Ràpida (5 minuts)

```bash
# 1. Revisar secrets
cat clouding/.env.production

# 2. Executar desplegament
./clouding/deploy.sh

# 3. Seguir instruccions en pantalla
```

### Opció Detallada (15-20 minuts)

```bash
# Obrir guia completa
cat clouding/README.md

# O des de VS Code
code clouding/README.md
```

---

## 🔒 Configuració de Seguretat

El desplegament inclou:

- ✅ **PostgreSQL només accessible localment** (127.0.0.1:5432)
- ✅ **Firewall (UFW)** configurat
- ✅ **Secrets criptogràfics** de 256 bits
- ✅ **Backups automàtics** diaris (retenció 30 dies)
- ✅ **Logs** rotatius amb límit de mida
- ✅ **Healthcheck** PostgreSQL cada 10s

**⚠️ PENDENT**: Canviar contrasenya de l'usuari admin després del desplegament

---

## 📊 Després del Desplegament

### Verificar que funciona

```bash
# Connexió SSH
ssh root@IP_SERVIDOR

# Veure estat
cd /opt/serveis-extraordinaris
docker compose ps

# Veure logs
docker compose logs -f

# Provar connexió
docker compose exec postgres psql -U serveis_user -d serveis_extraordinaris -c "SELECT version();"
```

### Connectar el backend local

Un cop PostgreSQL estigui al servidor, pots:

1. **Desenvolupar localment** apuntant al servidor (per proves)
2. **Desplegar el backend** al mateix servidor quan estigui llest
3. **Afegir Nginx** amb SSL per exposar l'API públicament

---

## 🆘 Problemes Comuns

### No puc connectar per SSH

```bash
# Verificar connectivitat
ping IP_SERVIDOR

# Provar connexió SSH amb verbositat
ssh -v root@IP_SERVIDOR
```

### Docker no arranca

```bash
# Al servidor
sudo systemctl status docker
sudo systemctl start docker
```

### PostgreSQL no inicia

```bash
# Veure logs complets
docker compose logs postgres

# Reiniciar
docker compose restart postgres
```

---

## 📚 Documentació

- **Guia Completa**: `clouding/README.md`
- **Desplegament Original**: `DEPLOY.md`
- **Base de Dades**: `DATABASE_SCHEMA.md`
- **API Backend**: `API_PLANIFICACIO.md`

---

## 🎯 Properes Fases

Un cop PostgreSQL funcioni:

1. ✅ **PostgreSQL en producció** ← **ESTEM AQUÍ**
2. ⏳ **Desenvolupar FASE 2** (Autenticació JWT)
3. ⏳ **Desplegar Backend API** a Clouding
4. ⏳ **Desenvolupar Frontend**
5. ⏳ **Afegir Nginx + SSL**

---

**Data**: 30 de novembre de 2025  
**Versió PostgreSQL**: 16 Alpine  
**Ubicació Producció**: /opt/serveis-extraordinaris
