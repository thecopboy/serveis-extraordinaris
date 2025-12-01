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
ssh themacboy@187.33.157.180
cd ~
git clone https://github.com/thecopboy/serveis-extraordinaris.git
cd serveis-extraordinaris
```

### 2. Configurar variables d'entorn (secrets)
```bash
# Des del teu ordinador local
scp clouding/.env.production themacboy@187.33.157.180:~/serveis-extraordinaris/.env
```

⚠️ **Important**: El fitxer `.env.production` conté secrets i NO està a Git!

**Variables configurades**:
- `POSTGRES_USER=themacboy` (superusuari PostgreSQL)
- `POSTGRES_DB=serveis_extraordinaris`
- `POSTGRES_PASSWORD=...` (secret generat)
- `JWT_SECRET=...` (secret 256-bit)
- `JWT_REFRESH_SECRET=...` (secret 256-bit)

### 3. Iniciar PostgreSQL
```bash
cd ~/serveis-extraordinaris
./clouding/start-fresh.sh
```

⚠️ **NO cal copiar docker-compose.yml** - L'script usa directament `clouding/docker-compose.production.yml`

---

## 🔧 Problemes Resolts

### ✅ Usuari PostgreSQL (resolt)
**Problema**: Confusió entre usuari `postgres` i `themacboy`.  
**Solució**: 
- Docker crea NOMÉS l'usuari definit a `POSTGRES_USER` (themacboy)
- Tots els scripts usen `$POSTGRES_USER` del fitxer `.env`
- Un sol usuari PostgreSQL amb privilegis de superusuari

### ✅ Ruta schema.sql (resolt)
**Problema**: Docker-compose buscava `./schema.sql` dins de `clouding/`.  
**Solució**: Corregit a `../schema.sql` (relatiu des de `clouding/` cap a l'arrel).

### ✅ Constraint hora_fi_posterior (resolt)
**Problema**: No permetia guàrdies nocturnes (22:00-06:00) que travessen mitjanit.  
**Solució**: Eliminat el constraint `hora_fi_posterior`.

### ✅ Warning version obsolet (resolt)
**Problema**: Docker Compose mostrava warning sobre `version: '3.8'`.  
**Solució**: Eliminat atribut obsolet.

---

## 📋 Ús Normal

### Iniciar PostgreSQL
```bash
cd ~/serveis-extraordinaris/clouding
docker compose -f docker-compose.production.yml up -d
```

### Parar PostgreSQL
```bash
cd ~/serveis-extraordinaris/clouding
docker compose -f docker-compose.production.yml stop
```

### Reiniciar (manté dades)
```bash
cd ~/serveis-extraordinaris/clouding
docker compose -f docker-compose.production.yml restart
```

### Reiniciar des de zero (elimina dades)
```bash
cd ~/serveis-extraordinaris
./clouding/start-fresh.sh
```

---

## 🔍 Verificar Estat

```bash
cd ~/serveis-extraordinaris
./clouding/check-status.sh
```

Ha de mostrar:
- ✅ 6 taules creades (propietari: themacboy)
- ✅ Usuari admin present (themacboy72@gmail.com)
- ✅ PostgreSQL healthy

---

## 📁 Estructura de Fitxers al Servidor

```
~/serveis-extraordinaris/
├── .env                     # Secrets (copiat de clouding/.env.production)
├── schema.sql               # Schema SQL amb 6 taules
├── clouding/
│   ├── docker-compose.production.yml  # Configuració Docker
│   ├── start-fresh.sh       # ⭐ Iniciar des de zero
│   ├── check-status.sh      # Verificar estat
│   ├── backup.sh            # Backup manual
│   ├── cleanup_tokens.sh    # Neteja tokens
│   ├── clean-all.sh         # Eliminar tot
│   └── backups/             # Backups automàtics (30 dies retenció)
└── ...
```

---

## 👤 Usuari Admin

**Credencials per defecte**:
- **Email**: themacboy72@gmail.com
- **Nom**: Pau López
- **Pseudònim**: themacboy
- **Contrasenya**: Admin123!
- **Rol**: admin

⚠️ **Canviar la contrasenya després del primer login!**

---

## 📊 Base de Dades

### Informació
- **Host**: localhost:5432 (dins del contenidor)
- **Database**: serveis_extraordinaris
- **User**: themacboy (superuser)
- **Taules**: 6 (users, historial_empreses, refresh_tokens, tipus_servei, serveis, audit_log)
- **Triggers**: 5 (timestamps automàtics, audit log)
- **Vistes**: 2 (vista_serveis_complets, vista_resum_mensual)

### Connexió des de l'aplicació
```javascript
// Node.js
const connectionString = `postgresql://themacboy:${POSTGRES_PASSWORD}@localhost:5432/serveis_extraordinaris`;
```

---

## 🆘 Troubleshooting

### Error: role "themacboy" does not exist

**Causa**: El fitxer `.env` no existeix o no es carrega correctament.

**Solució**:
```bash
# Verificar .env
cat ~/serveis-extraordinaris/.env | grep POSTGRES_USER

# Ha de mostrar: POSTGRES_USER=themacboy

# Si no existeix, copiar-lo
scp clouding/.env.production themacboy@187.33.157.180:~/serveis-extraordinaris/.env
```

### No es creen les 6 taules

```bash
# Verificar que schema.sql existeix a l'arrel
ls -lh ~/serveis-extraordinaris/schema.sql

# Veure logs d'errors
cd ~/serveis-extraordinaris/clouding
docker compose -f docker-compose.production.yml logs postgres | grep -i error

# Reset complet
cd ~/serveis-extraordinaris
./clouding/start-fresh.sh
```

### Error: could not read from input file: Is a directory

**Causa**: `clouding/schema.sql` és un directori en lloc d'un fitxer.

**Solució**:
```bash
cd ~/serveis-extraordinaris
rm -rf clouding/schema.sql  # Eliminar directori corrupte
git pull  # Actualitzar
./clouding/start-fresh.sh
```

---

## 🔐 Seguretat

- ✅ PostgreSQL accessible dins del contenidor (port 5432)
- ✅ Secrets NO pujats a GitHub
- ✅ Backups amb retenció de 30 dies
- ✅ Usuari PostgreSQL amb nom personalitzat (themacboy)
- ⚠️ **Pendent**: Canviar password de l'usuari admin de l'aplicació

---

## 🔄 Actualitzacions

Quan facis canvis al codi:

```bash
# Al servidor
cd ~/serveis-extraordinaris
git pull
cd clouding
docker compose -f docker-compose.production.yml restart
```

Si has canviat l'schema SQL:
```bash
cd ~/serveis-extraordinaris
git pull
./clouding/start-fresh.sh  # Recrear BD des de zero
```

---

**Data**: 1 de desembre de 2025  
**Estat**: PostgreSQL funcionant correctament amb 6 taules + dades seed ✅  
**Servidor**: Clouding Ubuntu (187.33.157.180)  
**PostgreSQL**: 16.11 Alpine  
**Usuari BD**: themacboy (superuser)

