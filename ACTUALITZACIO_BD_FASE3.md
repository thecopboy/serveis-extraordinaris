# 🔄 Actualització Base de Dades - FASE 3

## Resum dels Canvis

La taula d'empreses ha estat redissenyada per suportar millor l'historial laboral:

### ❌ Abans: `historial_empreses`
- Camp `activa` (només 1 empresa activa per usuari)
- Camp `nom_empresa`
- Camps `data_alta` / `data_baixa`
- Trigger per gestionar empresa única activa

### ✅ Ara: `empreses`
- **Multi-empresa simultània** (múltiples amb `data_fi = NULL`)
- Camp `nom` (més curt i clar)
- Camps `data_inici` / `data_fi` (més semàntics)
- Informació completa: `cif`, `adreca`, `telefon`, `email`
- Soft delete amb camp `actiu`
- **SENSE trigger** d'empresa única

---

## 📝 Fitxers Actualitzats

✅ **schema.sql** - Esquema principal actualitzat  
✅ **DATABASE_SCHEMA.md** - Documentació actualitzada  
✅ **backend/migrations/003_create_empreses.sql** - Migració nova  
✅ **backend/src/repositories/empresaRepository.js** - CRUD implementat  
✅ **backend/src/services/empresaService.js** - Lògica de negoci  
✅ **backend/src/controllers/empresaController.js** - Endpoints  
✅ **backend/src/routes/empresaRoutes.js** - Routes definides  
✅ **backend/src/config/swagger.js** - Documentació API  
✅ **backend/EMPRESES.md** - Guia d'ús completa  

---

## 🚀 Com Aplicar els Canvis

### Opció 1: Recrear Base de Dades (RECOMANAT per desenvolupament)

**⚠️ ADVERTÈNCIA: Elimina TOTES les dades existents!**

```bash
# Executar script automàtic
./recreate-database.sh
```

Aquest script:
1. Para el contenidor Docker
2. (Opcional) Elimina el volum de dades
3. Aixeca el contenidor (aplica schema.sql automàticament)
4. Crea usuari admin i empresa de prova

### Opció 2: Migració Manual (Conserva dades)

Si vols conservar les dades existents:

```bash
# 1. Backup de la base de dades
docker exec serveis-postgres pg_dump -U serveis_user serveis_extraordinaris > backup_$(date +%Y%m%d_%H%M%S).sql

# 2. Renombrar taula antiga
docker exec -it serveis-postgres psql -U serveis_user -d serveis_extraordinaris -c "
  ALTER TABLE historial_empreses RENAME TO historial_empreses_old;
"

# 3. Crear taula nova
docker exec -it serveis-postgres psql -U serveis_user -d serveis_extraordinaris < backend/migrations/003_create_empreses.sql

# 4. Migrar dades
docker exec -it serveis-postgres psql -U serveis_user -d serveis_extraordinaris -c "
  INSERT INTO empreses (usuari_id, nom, data_inici, data_fi, observacions, actiu, created_at, updated_at)
  SELECT 
    usuari_id, 
    nom_empresa, 
    data_alta, 
    data_baixa, 
    observacions, 
    CASE WHEN activa THEN true ELSE false END,
    created_at, 
    updated_at
  FROM historial_empreses_old;
"

# 5. Verificar
docker exec -it serveis-postgres psql -U serveis_user -d serveis_extraordinaris -c "SELECT COUNT(*) FROM empreses;"

# 6. (Opcional) Eliminar taula antiga
docker exec -it serveis-postgres psql -U serveis_user -d serveis_extraordinaris -c "DROP TABLE historial_empreses_old CASCADE;"
```

### Opció 3: Docker Compose Fresh Start

```bash
# Eliminar tot i començar de zero
docker-compose down -v
docker-compose up -d

# El schema.sql s'aplicarà automàticament
```

---

## ✅ Verificar Aplicació

Després d'aplicar els canvis, verifica:

```bash
# 1. Comprovar que la taula existeix
docker exec -it serveis-postgres psql -U serveis_user -d serveis_extraordinaris -c "\d empreses"

# 2. Veure columnes
docker exec -it serveis-postgres psql -U serveis_user -d serveis_extraordinaris -c "\d+ empreses"

# 3. Comprovar seed data
docker exec -it serveis-postgres psql -U serveis_user -d serveis_extraordinaris -c "SELECT * FROM empreses;"

# 4. Provar endpoint d'empreses
curl -H "Authorization: Bearer {token}" http://localhost:5000/api/v1/empreses
```

Hauries de veure:
```
 id | usuari_id | nom     | data_inici | data_fi | actiu 
----+-----------+---------+------------+---------+-------
  1 |         1 | Sistema | 2025-12-15 | NULL    | t
```

---

## 🧪 Provar els Nous Endpoints

```bash
# 1. Login
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"themacboy72@gmail.com","password":"Admin123!"}'

# Guardar el accessToken rebut

# 2. Crear empresa
curl -X POST http://localhost:5000/api/v1/empreses \
  -H "Authorization: Bearer {accessToken}" \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Hospital Son Espases",
    "cif": "A12345678",
    "data_inici": "2020-01-15"
  }'

# 3. Llistar empreses
curl -H "Authorization: Bearer {accessToken}" \
  http://localhost:5000/api/v1/empreses

# 4. Només empreses actives
curl -H "Authorization: Bearer {accessToken}" \
  http://localhost:5000/api/v1/empreses?actives=true
```

---

## 📚 Documentació

- **API Endpoints**: [backend/EMPRESES.md](backend/EMPRESES.md)
- **Esquema BD**: [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md)
- **Swagger UI**: http://localhost:5000/api-docs

---

## 🐛 Troubleshooting

### Error: "relation empreses does not exist"
```bash
# La taula no s'ha creat. Executar:
./recreate-database.sh
```

### Error: "column nom_empresa does not exist"
```bash
# Encara tens la taula antiga. Opcions:
# 1. Recrear BD (elimina dades): ./recreate-database.sh
# 2. Migració manual (conserva dades): veure Opció 2
```

### Error: "foreign key constraint fails"
```bash
# La taula tipus_servei encara referencia historial_empreses
# Cal recrear tota la BD:
./recreate-database.sh
```

---

## 📅 Pròxims Passos

Una vegada la base de dades està actualitzada:

1. ✅ FASE 1: Infraestructura - **COMPLETADA**
2. ✅ FASE 2: Autenticació - **COMPLETADA**
3. ✅ FASE 3: Empreses - **COMPLETADA**
4. ⏳ FASE 4: Tipus de Serveis - **SEGÜENT**

---

**Data**: 15 de desembre de 2025  
**Versió**: 1.0.0
