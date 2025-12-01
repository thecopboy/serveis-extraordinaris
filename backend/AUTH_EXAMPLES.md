# 🔐 API Autenticació - Exemples d'Ús

## Base URL
```
http://localhost:5000/api/v1
```

---

## 1. Registrar Nou Usuari

**Endpoint**: `POST /api/v1/auth/register`

**Body**:
```json
{
  "nom": "Maria",
  "cognom_1": "García",
  "cognom_2": "López",
  "pseudonim": "maria.garcia",
  "numero_professional": "EMP-00123",
  "departament": "Recursos Humans",
  "email": "maria@exemple.cat",
  "password": "SecurePassword123!",
  "rol": "treballador"
}
```

**Response** (201):
```json
{
  "success": true,
  "data": {
    "id": 2,
    "nom": "Maria",
    "cognom_1": "García",
    "email": "maria@exemple.cat",
    "rol": "treballador",
    "actiu": true,
    "creat_a": "2025-12-01T03:30:00.000Z"
  },
  "message": "Usuari creat correctament"
}
```

**cURL**:
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Maria",
    "cognom_1": "García",
    "email": "maria@exemple.cat",
    "password": "SecurePassword123!",
    "rol": "treballador"
  }'
```

---

## 2. Login

**Endpoint**: `POST /api/v1/auth/login`

**Body**:
```json
{
  "email": "themacboy72@gmail.com",
  "password": "Admin123!"
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "nom": "Pau",
      "cognom_1": "López",
      "pseudonim": "themacboy",
      "email": "themacboy72@gmail.com",
      "rol": "admin",
      "actiu": true
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "15m"
  },
  "message": "Login correcte"
}
```

**cURL**:
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "themacboy72@gmail.com",
    "password": "Admin123!"
  }'
```

---

## 3. Obtenir Informació de l'Usuari Actual

**Endpoint**: `GET /api/v1/auth/me`

**Headers**:
```
Authorization: Bearer <accessToken>
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "nom": "Pau",
    "cognom_1": "López",
    "cognom_2": null,
    "pseudonim": "themacboy",
    "numero_professional": "ADM-00001",
    "departament": "Administració",
    "email": "themacboy72@gmail.com",
    "rol": "admin",
    "actiu": true,
    "creat_a": "2025-12-01T03:00:00.000Z",
    "actualitzat_a": "2025-12-01T03:00:00.000Z"
  }
}
```

**cURL**:
```bash
curl -X GET http://localhost:5000/api/v1/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## 4. Renovar Access Token

**Endpoint**: `POST /api/v1/auth/refresh`

**Body**:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "nom": "Pau",
      "email": "themacboy72@gmail.com",
      "rol": "admin"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "15m"
  },
  "message": "Token renovat correctament"
}
```

**cURL**:
```bash
curl -X POST http://localhost:5000/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'
```

---

## 5. Logout (Revocar Refresh Token)

**Endpoint**: `POST /api/v1/auth/logout`

**Body**:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response** (200):
```json
{
  "success": true,
  "message": "Logout correcte"
}
```

**cURL**:
```bash
curl -X POST http://localhost:5000/api/v1/auth/logout \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'
```

---

## 6. Logout de Tots els Dispositius

**Endpoint**: `POST /api/v1/auth/logout-all`

**Headers**:
```
Authorization: Bearer <accessToken>
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "tokensRevoked": 3
  },
  "message": "S'han revocat 3 tokens"
}
```

**cURL**:
```bash
curl -X POST http://localhost:5000/api/v1/auth/logout-all \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## Errors Comuns

### 401 Unauthorized
```json
{
  "error": "INVALID_CREDENTIALS",
  "message": "Email o contrasenya incorrectes"
}
```

### 409 Conflict
```json
{
  "error": "EMAIL_EXISTS",
  "message": "Aquest email ja està registrat"
}
```

### 403 Forbidden
```json
{
  "error": "USER_DEACTIVATED",
  "message": "Aquest usuari està desactivat"
}
```

---

## Flux Complet d'Autenticació

### 1. Registre
```bash
# Registrar usuari
POST /api/v1/auth/register
```

### 2. Login
```bash
# Login → Obtenir accessToken + refreshToken
POST /api/v1/auth/login
```

### 3. Usar API
```bash
# Fer peticions autenticades amb accessToken
GET /api/v1/auth/me
Header: Authorization: Bearer <accessToken>
```

### 4. Renovar Token (quan expira)
```bash
# Quan accessToken expira (15m), renovar amb refreshToken
POST /api/v1/auth/refresh
Body: { "refreshToken": "..." }
```

### 5. Logout
```bash
# Revocar refreshToken al tancar sessió
POST /api/v1/auth/logout
Body: { "refreshToken": "..." }
```

---

## Notes de Seguretat

1. **Access Token**: 
   - Duració curta (15 minuts)
   - Guardar només a memòria (no localStorage)
   - Enviar a cada petició via header Authorization

2. **Refresh Token**:
   - Duració llarga (7 dies)
   - Guardar a httpOnly cookie (recomanat) o localStorage
   - Només usar per renovar access token
   - Es pot revocar des del servidor

3. **Multi-dispositiu**:
   - Cada dispositiu té el seu propi refresh token
   - Es pot fer logout d'un dispositiu específic
   - O fer logout de tots els dispositius

4. **Password**:
   - Hash amb bcrypt (10 rounds)
   - Mai retornar el password_hash a les respostes
   - Validar complexitat al frontend

---

**Data**: 1 de desembre de 2025  
**Versió API**: 1.0.0  
**FASE 2 Completada**: Autenticació JWT ✅
