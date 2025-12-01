# 🚀 Desplegament PostgreSQL - Guia Ràpida

## ⚡ Desplegament des de Zero (GARANTIT)

```bash
# Al servidor
cd ~/serveis-extraordinaris
git pull  # Si ja està clonat
./clouding/start-fresh.sh
```

Aquest script:
- ✅ Elimina volums antics (garanteix que no hi ha restes)
- ✅ Inicia PostgreSQL des de zero
- ✅ Carrega l'schema automàticament (6 taules)
- ✅ Carrega dades seed (usuari admin, tipus de serveis)
- ✅ Verifica que tot funciona

---

## 🎯 Primera Instal·lació

### 1. Clonar repositori
```bash
ssh themacboy@IP_SERVIDOR
cd ~
git clone https://github.com/thecopboy/serveis-extraordinaris.git
cd serveis-extraordinaris
```

### 2. Configurar variables d'entorn (secrets)
```bash
# Des del teu ordinador local
scp clouding/.env.production themacboy@IP_SERVIDOR:~/serveis-extraordinaris/.env
```

⚠️ **Important**: El fitxer `.env.production` conté secrets i NO està a Git!

### 3. Copiar docker-compose
```bash
# Al servidor
cd ~/serveis-extraordinaris
cp clouding/docker-compose.production.yml docker-compose.yml
```

### 4. Iniciar PostgreSQL
```bash
./clouding/start-fresh.sh
```

---

## 🔧 Problemes Resolts

### ✅ Error IMMUTABLE (resolt)
**Problema**: L'índex `idx_refresh_tokens_actius` usava `CURRENT_TIMESTAMP` que no és immutable.  
**Solució**: Eliminat de l'índex parcial. Ara només filtra per `revocat = false`.

### ✅ Ruta schema.sql (resolt)
**Problema**: Docker-compose buscava `../schema.sql` (incorrecte).  
**Solució**: Corregit a `./schema.sql` (a l'arrel del projecte).

### ✅ Warning version obsolet (resolt)
**Problema**: Docker Compose mostrava warning sobre `version: '3.8'`.  
**Solució**: Eliminat atribut obsolet.

---

## 📋 Ús Normal

### Iniciar PostgreSQL
```bash
cd ~/serveis-extraordinaris
docker compose up -d
```

### Parar PostgreSQL
```bash
docker compose stop
```

### Reiniciar (manté dades)
```bash
docker compose restart
```

### Reiniciar des de zero (elimina dades)
```bash
./clouding/start-fresh.sh
```

---

## 🔍 Verificar Estat

```bash
cd ~/serveis-extraordinaris
./clouding/check-status.sh
```

Ha de mostrar:
- ✅ 6 taules creades
- ✅ Usuari admin present
- ✅ PostgreSQL healthy

---

## 📁 Estructura de Fitxers al Servidor

```
~/serveis-extraordinaris/
├── docker-compose.yml       # Copiat de clouding/docker-compose.production.yml
├── .env                     # Copiat de clouding/.env.production (SECRETS!)
├── schema.sql              # Schema SQL amb 6 taules
├── backups/                # Backups automàtics
├── clouding/
│   ├── start-fresh.sh      # ⭐ Iniciar des de zero
│   ├── check-status.sh     # Verificar estat
│   ├── backup.sh           # Backup manual
│   ├── cleanup_tokens.sh   # Neteja tokens
│   └── clean-all.sh        # Eliminar tot
└── ...
```

---

## 📊 Columnes de les Taules

### users
- `id`, `nom`, `cognom_1`, `email`, `password_hash`, `rol`, etc.

### tipus_servei
- `id`, `nom`, `tipus_remuneracio`, `tarifa_base`, `hores_equivalents`, etc.

### serveis
- `id`, `usuari_id`, `empresa_id`, `tipus_servei_id`, `data`, `hores`, etc.

---

## 🆘 Troubleshooting

### No es creen les 6 taules

```bash
# Verificar que schema.sql existeix a l'arrel
ls -lh ~/serveis-extraordinaris/schema.sql

# Veure logs d'errors
docker compose logs postgres | grep -i error

# Reset complet
./clouding/start-fresh.sh
```

### Volum amb dades antigues

```bash
# El script start-fresh.sh ja s'encarrega d'això!
./clouding/start-fresh.sh
```

### Verificar connexió

```bash
docker compose exec postgres pg_isready -U serveis_user -d serveis_extraordinaris
```

---

## 🔐 Seguretat

- ✅ PostgreSQL accessible només des de localhost (127.0.0.1:5432)
- ✅ Secrets NO pujats a GitHub
- ✅ Backups amb retenció de 30 dies
- ⚠️ **Pendent**: Canviar password de l'usuari admin

---

## 🔄 Actualitzacions

Quan facis canvis al codi:

```bash
# Al servidor
cd ~/serveis-extraordinaris
git pull
docker compose restart  # Si cal
```

---

**Data**: 1 de desembre de 2025  
**Estat**: PostgreSQL funcionant correctament amb 6 taules + dades seed ✅

