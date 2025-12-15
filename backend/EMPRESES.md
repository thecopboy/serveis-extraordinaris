# 🏢 Gestió d'Empreses - Documentació

## Visió General

Sistema de gestió d'empreses amb **historial laboral complet**. Permet als usuaris:
- ✅ Registrar totes les empreses on han treballat o treballen
- ✅ Mantenir múltiples empreses actives simultàniament
- ✅ Guardar dates d'inici i fi de cada relació laboral
- ✅ Consultar històric complet

---

## Esquema de Dades

### Taula: `empreses`

```sql
CREATE TABLE empreses (
    id SERIAL PRIMARY KEY,
    usuari_id INTEGER NOT NULL,
    
    -- Informació bàsica
    nom VARCHAR(255) NOT NULL,
    cif VARCHAR(20),
    adreca TEXT,
    telefon VARCHAR(20),
    email VARCHAR(255),
    
    -- Dates de relació laboral
    data_inici DATE NOT NULL DEFAULT CURRENT_DATE,
    data_fi DATE,  -- NULL = encara hi treballa
    
    -- Metadades
    observacions TEXT,
    actiu BOOLEAN DEFAULT true,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### Característiques Clau

- **`data_fi = NULL`** → Encara treballa a l'empresa
- **`data_fi != NULL`** → Ha deixat de treballar-hi
- **Multi-empresa simultània** → Pot haver múltiples amb `data_fi = NULL`
- **Soft delete** → `actiu = false` amaga l'empresa sense perdre l'històric

---

## Endpoints API

Base URL: `/api/v1/empreses`  
**Autenticació requerida**: Sí (Bearer Token JWT)

### 1. Llistar empreses

**GET** `/api/v1/empreses`

Retorna totes les empreses de l'usuari (actives + històriques).

**Query Parameters:**
- `actives` (boolean, opcional): Si és `true`, només retorna empreses amb `data_fi = NULL`

**Exemple:**
```bash
# Totes les empreses
curl -H "Authorization: Bearer {token}" \
  http://localhost:5000/api/v1/empreses

# Només empreses actives
curl -H "Authorization: Bearer {token}" \
  http://localhost:5000/api/v1/empreses?actives=true
```

**Resposta:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nom": "Hospital Son Espases",
      "data_inici": "2020-01-15",
      "data_fi": null,
      "actiu": true
    },
    {
      "id": 2,
      "nom": "Hospital Manacor",
      "data_inici": "2018-01-01",
      "data_fi": "2019-12-31",
      "actiu": true
    }
  ]
}
```

---

### 2. Obtenir detall d'una empresa

**GET** `/api/v1/empreses/:id`

**Exemple:**
```bash
curl -H "Authorization: Bearer {token}" \
  http://localhost:5000/api/v1/empreses/1
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "nom": "Hospital Son Espases",
    "cif": "A12345678",
    "adreca": "Carrer de l'Hospital, 1",
    "telefon": "971123456",
    "email": "info@hospital.com",
    "data_inici": "2020-01-15",
    "data_fi": null,
    "observacions": "Notes...",
    "actiu": true,
    "created_at": "2025-12-15T10:00:00Z",
    "updated_at": "2025-12-15T10:00:00Z"
  }
}
```

---

### 3. Crear empresa

**POST** `/api/v1/empreses`

**Body (JSON):**
```json
{
  "nom": "Hospital Son Espases",  // Obligatori
  "cif": "A12345678",              // Opcional
  "adreca": "Carrer...",           // Opcional
  "telefon": "971123456",          // Opcional
  "email": "info@hospital.com",    // Opcional
  "data_inici": "2020-01-15",      // Opcional (per defecte avui)
  "data_fi": null,                 // Opcional (NULL = encara hi treballa)
  "observacions": "Notes..."       // Opcional
}
```

**Exemple:**
```bash
curl -X POST \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Hospital Son Espases",
    "data_inici": "2020-01-15"
  }' \
  http://localhost:5000/api/v1/empreses
```

**Resposta:**
```json
{
  "success": true,
  "message": "Empresa creada correctament",
  "data": {
    "id": 1,
    "nom": "Hospital Son Espases",
    "data_inici": "2020-01-15",
    "data_fi": null,
    ...
  }
}
```

---

### 4. Actualitzar empresa

**PUT** `/api/v1/empreses/:id`

**Body (JSON):** Mateixos camps que en crear (tots opcionals)

**Exemple:**
```bash
curl -X PUT \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "telefon": "971999888",
    "email": "nou@hospital.com"
  }' \
  http://localhost:5000/api/v1/empreses/1
```

---

### 5. Finalitzar relació laboral

**PATCH** `/api/v1/empreses/:id/finalitzar`

Marca que l'usuari ha deixat de treballar a aquesta empresa (assigna `data_fi`).

**Body (JSON):**
```json
{
  "data_fi": "2025-12-31"  // Opcional (per defecte avui)
}
```

**Exemple:**
```bash
# Amb data específica
curl -X PATCH \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"data_fi": "2025-12-31"}' \
  http://localhost:5000/api/v1/empreses/1/finalitzar

# Sense data (s'usa avui)
curl -X PATCH \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{}' \
  http://localhost:5000/api/v1/empreses/1/finalitzar
```

**Resposta:**
```json
{
  "success": true,
  "message": "Relació laboral finalitzada correctament",
  "data": {
    "id": 1,
    "nom": "Hospital Son Espases",
    "data_inici": "2020-01-15",
    "data_fi": "2025-12-31",  // ← Actualitzada
    ...
  }
}
```

---

### 6. Eliminar empresa (soft delete)

**DELETE** `/api/v1/empreses/:id`

Marca l'empresa com inactiva (`actiu = false`) sense perdre l'històric.

**Exemple:**
```bash
curl -X DELETE \
  -H "Authorization: Bearer {token}" \
  http://localhost:5000/api/v1/empreses/1
```

**Resposta:**
```json
{
  "success": true,
  "message": "Empresa eliminada correctament"
}
```

---

## Casos d'Ús Típics

### 1. Treballador amb una empresa actual

```json
{
  "nom": "Hospital Son Espases",
  "data_inici": "2020-01-15",
  "data_fi": null  // ← Encara hi treballa
}
```

### 2. Treballador pluriempleado (2 empreses simultànies)

```json
[
  {
    "nom": "Hospital Sant Joan",
    "data_inici": "2020-01-15",
    "data_fi": null  // ← Empresa activa
  },
  {
    "nom": "Clínica Juaneda",
    "data_inici": "2023-06-01",
    "data_fi": null  // ← També activa
  }
]
```

### 3. Historial complet (empresa anterior + actual)

```json
[
  {
    "nom": "Hospital Manacor",
    "data_inici": "2018-01-01",
    "data_fi": "2019-12-31"  // ← Ja no hi treballa
  },
  {
    "nom": "Hospital Son Llàtzer",
    "data_inici": "2020-01-01",
    "data_fi": null  // ← Empresa actual
  }
]
```

---

## Validacions

### Crear/Actualitzar Empresa

- ✅ **nom**: Obligatori, 2-255 caràcters
- ✅ **cif**: Opcional, màxim 20 caràcters
- ✅ **email**: Opcional, format email vàlid
- ✅ **data_inici**: Opcional, format ISO8601 (YYYY-MM-DD)
- ✅ **data_fi**: Opcional, format ISO8601, ha de ser >= data_inici
- ✅ **observacions**: Opcional, màxim 1000 caràcters

### Finalitzar Relació

- ✅ L'empresa no pot tenir ja una `data_fi` assignada
- ✅ `data_fi` ha de ser >= `data_inici`

---

## Codis d'Estat HTTP

| Codi | Descripció |
|------|-----------|
| 200  | Operació exitosa |
| 201  | Empresa creada correctament |
| 400  | Error de validació (dades invàlides) |
| 401  | No autenticat (token invàlid o absent) |
| 404  | Empresa no trobada o no pertany a l'usuari |
| 500  | Error intern del servidor |

---

## Swagger UI

Documentació interactiva disponible a:
```
http://localhost:5000/api-docs
```

---

## Exemples Complets

### 1. Registrar empresa on encara treballa

```bash
curl -X POST \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Hospital Son Espases",
    "cif": "A12345678",
    "data_inici": "2020-01-15"
  }' \
  http://localhost:5000/api/v1/empreses
```

### 2. Registrar empresa del passat (amb data de fi)

```bash
curl -X POST \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Hospital Manacor",
    "data_inici": "2018-01-01",
    "data_fi": "2019-12-31",
    "observacions": "Primera feina com a bomber"
  }' \
  http://localhost:5000/api/v1/empreses
```

### 3. Consultar només empreses actives

```bash
curl -H "Authorization: Bearer eyJhbGc..." \
  http://localhost:5000/api/v1/empreses?actives=true
```

### 4. Marcar que has deixat de treballar a una empresa

```bash
curl -X PATCH \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{"data_fi": "2025-12-31"}' \
  http://localhost:5000/api/v1/empreses/1/finalitzar
```

---

## Migració de Base de Dades

Per crear la taula, executa:

```bash
psql -U postgres -d serveis_extraordinaris -f backend/migrations/003_create_empreses.sql
```

O des del codi:

```javascript
import { query } from './config/database.js';
import fs from 'fs';

const sql = fs.readFileSync('./migrations/003_create_empreses.sql', 'utf8');
await query(sql);
```

---

**Data de creació**: 15 de desembre de 2025  
**Versió**: 1.0.0
