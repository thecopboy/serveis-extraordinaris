# Desplegament PostgreSQL a Clouding (via GitHub)

## 🎯 Flux Simplificat

Com que sincronitzes amb GitHub, el desplegament és molt més simple:

```
Local → GitHub → Servidor Clouding
```

---

## 📋 Prerequisits

1. ✅ Repositori pujat a GitHub
2. ✅ Accés SSH al servidor Clouding
3. ⚠️ **NO pujar** `clouding/.env.production` a GitHub (secrets!)

---

## 🚀 Desplegament Inicial

### Opció 1: Script Automatitzat

```bash
# 1. Al servidor, descarrega l'script
ssh themacboy@187.33.157.180
curl -O https://raw.githubusercontent.com/thecopboy/serveis-extraordinaris/main/clouding/deploy-github.sh
chmod +x deploy-github.sh

# 2. Puja el fitxer .env (des del teu ordinador local)
scp clouding/.env.production themacboy@187.33.157.180:~/env-temp

# 3. Al servidor, executa
./deploy-github.sh
# Quan digui que falta .env.production:
mkdir -p ~/serveis-extraordinaris/clouding
mv ~/env-temp ~/serveis-extraordinaris/clouding/.env.production
./deploy-github.sh
```

### Opció 2: Manual (Pas a Pas)

```bash
# Al servidor
cd ~
git clone https://github.com/thecopboy/serveis-extraordinaris.git
cd serveis-extraordinaris

# Pujar .env des del local (en un altre terminal)
scp clouding/.env.production themacboy@187.33.157.180:~/serveis-extraordinaris/clouding/

# Al servidor, preparar fitxers
cp clouding/docker-compose.production.yml docker-compose.yml
cp clouding/.env.production .env
mkdir -p backups logs
chmod +x clouding/*.sh

# Iniciar PostgreSQL
docker compose up -d

# Verificar
docker compose ps
docker compose logs -f
```

---

## 🔄 Actualitzacions Futures

Quan facis canvis al codi:

```bash
# 1. Al teu local
git add .
git commit -m "Canvis X"
git push

# 2. Al servidor
ssh themacboy@187.33.157.180
cd ~/serveis-extraordinaris
git pull
docker compose restart  # Si cal
```

---

## 📝 Fitxers que NO van a GitHub

Aquests fitxers estan a `.gitignore` (per seguretat):

- ❌ `clouding/.env.production` - Secrets de producció
- ❌ `.env` - Variables d'entorn locals
- ❌ `backups/*.sql.gz` - Backups de la BD

**Aquests s'han de pujar manualment amb `scp`**

---

## 🔐 Gestió de Secrets

### Primera vegada (ja fet):
```bash
# Ja tens clouding/.env.production amb els secrets
cat clouding/.env.production  # Veure'ls
```

### Actualitzar secrets al servidor:
```bash
# Des del local
scp clouding/.env.production themacboy@187.33.157.180:~/serveis-extraordinaris/.env

# Al servidor
ssh themacboy@187.33.157.180
cd ~/serveis-extraordinaris
docker compose restart
```

---

## ✅ Avantatges d'aquesta Configuració

- ✅ **Codi sincronitzat** automàticament via Git
- ✅ **Secrets separats** (no es pugen a GitHub)
- ✅ **Actualitzacions ràpides** amb `git pull`
- ✅ **Historial de canvis** amb Git
- ✅ **Rollback fàcil** amb `git checkout`

---

## 🗑️ Eliminar Tot i Començar de Zero

Si vols netejar-ho tot:

```bash
ssh themacboy@187.33.157.180
cd ~/serveis-extraordinaris
./clouding/clean-all.sh
```

---

**Data**: 1 de desembre de 2025
