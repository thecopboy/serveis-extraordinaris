# Planificació API REST - Serveis Extraordinaris

## 📋 Visió General

API REST per gestionar serveis extraordinaris amb autenticació JWT i gestió multi-tenant.

**Base URL**: `/api/v1`

---

## 🎯 Fases d'Implementació

### FASE 1: Infraestructura Base ⚙️
**Objectiu**: Estructura del projecte i configuració inicial

- [x] 1.1. Crear estructura de carpetes backend
- [x] 1.2. Inicialitzar npm i instal·lar dependències base
- [x] 1.3. Configurar variables d'entorn (.env)
- [x] 1.4. Configurar connexió a PostgreSQL
- [x] 1.5. Crear servidor Express bàsic
- [x] 1.6. Configurar middleware bàsics (cors, json, helmet)
- [x] 1.7. Sistema de logging (Pino)
- [x] 1.8. Gestió centralitzada d'errors

**Dependències**:
```json
{
  "express": "^4.18.0",
  "pg": "^8.11.0",
  "cors": "^2.8.5",
  "helmet": "^7.1.0",
  "pino": "^10.1.0",
  "pino-pretty": "^13.1.2"
}
```

**Notes importants**:
- No cal `dotenv` ni `nodemon` amb Node.js 20.6+
  - Variables d'entorn: `node --env-file=.env`
  - Watch mode: `node --watch`
- Usem **Pino** en lloc de Morgan (més ràpid, més modern, logging complet)

---

### FASE 2: Autenticació i Usuaris 🔐
**Objectiu**: Sistema d'autenticació JWT complet

#### 2.1. Model i Repositori d'Usuaris
- [x] Crear repository pattern per usuaris
- [x] Queries SQL (getUserById, getUserByEmail, createUser, etc.)

#### 2.2. Endpoints d'Autenticació
- [x] `POST /api/v1/auth/register` - Registre d'usuari
- [x] `POST /api/v1/auth/login` - Login (retorna access + refresh token)
- [x] `POST /api/v1/auth/refresh` - Renovar access token
- [x] `POST /api/v1/auth/logout` - Logout (invalida refresh token)
- [x] `POST /api/v1/auth/logout-all` - Logout de tots els dispositius
- [x] `GET /api/v1/auth/me` - Obtenir perfil usuari actual

#### 2.3. Middleware d'Autenticació
- [x] Middleware `authenticate` (verifica JWT)
- [x] Middleware `authorize` (verifica rols)
- [x] Gestió de refresh tokens a la BD

**Dependències**:
```json
{
  "jsonwebtoken": "^9.0.0",
  "bcrypt": "^5.1.0"
}
```

**Endpoints**:
```
POST   /api/v1/auth/register      (public)
POST   /api/v1/auth/login         (public)
POST   /api/v1/auth/refresh       (public)
POST   /api/v1/auth/logout        (authenticated)
GET    /api/v1/auth/me            (authenticated)
```

---

### FASE 3: Gestió d'Empreses 🏢
**Objectiu**: CRUD d'empreses amb historial laboral per usuari

**Nota**: Esquema final amb dates d'inici/fi + multi-empresa simultània

#### 3.1. Repository d'Empreses
- [x] getAllByUserId, getById, create, update, delete
- [x] getActivesByUserId (només empreses amb data_fi = NULL)
- [x] setDataFi (finalitzar relació laboral)
- [x] Validar que l'empresa pertany a l'usuari

#### 3.2. Endpoints d'Empreses
- [x] `GET /api/v1/empreses` - Llistar empreses de l'usuari (amb filtres)
- [x] `GET /api/v1/empreses/:id` - Obtenir detall
- [x] `POST /api/v1/empreses` - Crear empresa
- [x] `PUT /api/v1/empreses/:id` - Actualitzar empresa
- [x] `DELETE /api/v1/empreses/:id` - Eliminar empresa (soft delete)
- [x] `PATCH /api/v1/empreses/:id/finalitzar` - Marcar data de fi (deixar de treballar-hi)

**Endpoints**:
```
GET    /api/v1/empreses           (authenticated)
GET    /api/v1/empreses/:id       (authenticated)
POST   /api/v1/empreses           (authenticated)
PUT    /api/v1/empreses/:id       (authenticated)
DELETE /api/v1/empreses/:id       (authenticated)
```

---

### FASE 4: Tipus de Serveis 📝
**Objectiu**: CRUD de tipus de serveis per usuari

#### 4.1. Repository de Tipus de Serveis
- [ ] CRUD bàsic amb filtre per usuari
- [ ] Validar que només l'usuari pot modificar els seus tipus

#### 4.2. Endpoints de Tipus de Serveis
- [ ] `GET /api/v1/tipus-serveis` - Llistar tipus
- [ ] `GET /api/v1/tipus-serveis/:id` - Obtenir detall
- [ ] `POST /api/v1/tipus-serveis` - Crear tipus
- [ ] `PUT /api/v1/tipus-serveis/:id` - Actualitzar tipus
- [ ] `DELETE /api/v1/tipus-serveis/:id` - Eliminar tipus

**Endpoints**:
```
GET    /api/v1/tipus-serveis           (authenticated)
GET    /api/v1/tipus-serveis/:id       (authenticated)
POST   /api/v1/tipus-serveis           (authenticated)
PUT    /api/v1/tipus-serveis/:id       (authenticated)
DELETE /api/v1/tipus-serveis/:id       (authenticated)
```

---

### FASE 5: Registre de Serveis 📊
**Objectiu**: CRUD de serveis extraordinaris amb càlculs automàtics

#### 5.1. Repository de Serveis
- [ ] CRUD amb càlculs (els triggers de PostgreSQL ja calculen automàticament)
- [ ] Queries per filtres (per mes, any, empresa, tipus)
- [ ] Validar que el servei pertany a l'usuari

#### 5.2. Endpoints de Serveis
- [ ] `GET /api/v1/serveis` - Llistar serveis (amb filtres)
- [ ] `GET /api/v1/serveis/:id` - Obtenir detall
- [ ] `POST /api/v1/serveis` - Crear servei
- [ ] `PUT /api/v1/serveis/:id` - Actualitzar servei
- [ ] `DELETE /api/v1/serveis/:id` - Eliminar servei

#### 5.3. Query Parameters per Filtres
- `?mes=11&any=2025` - Filtrar per mes i any
- `?empresa_id=1` - Filtrar per empresa
- `?tipus_servei_id=2` - Filtrar per tipus
- `?data_inici=2025-01-01&data_fi=2025-12-31` - Rang de dates

**Endpoints**:
```
GET    /api/v1/serveis                 (authenticated)
GET    /api/v1/serveis/:id             (authenticated)
POST   /api/v1/serveis                 (authenticated)
PUT    /api/v1/serveis/:id             (authenticated)
DELETE /api/v1/serveis/:id             (authenticated)
```

---

### FASE 6: Informes i Estadístiques 📈
**Objectiu**: Endpoints per consultes i resums

#### 6.1. Endpoints de Resums
- [ ] `GET /api/v1/informes/resum-mensual?mes=11&any=2025`
- [ ] `GET /api/v1/informes/resum-anual?any=2025`
- [ ] `GET /api/v1/informes/resum-personalitzat?data_inici=X&data_fi=Y`

#### 6.2. Resposta Tipus
```json
{
  "periode": "Novembre 2025",
  "total_serveis": 15,
  "total_hores": 45.5,
  "total_hores_compensades": 10.0,
  "total_import_brut": 1250.50,
  "per_tipus": [
    {
      "tipus_servei": "Guàrdia nocturna",
      "quantitat": 5,
      "hores": 25.0,
      "import": 750.00
    }
  ],
  "per_empresa": [...]
}
```

**Endpoints**:
```
GET    /api/v1/informes/resum-mensual        (authenticated)
GET    /api/v1/informes/resum-anual          (authenticated)
GET    /api/v1/informes/resum-personalitzat  (authenticated)
```

---

### FASE 7: Generació de PDFs 📄
**Objectiu**: Exportar informes a PDF

#### 7.1. Configurar PDFKit
- [ ] Instal·lar i configurar PDFKit
- [ ] Crear plantilla base de PDF

#### 7.2. Endpoints de Descàrrega
- [ ] `GET /api/v1/informes/pdf/mensual?mes=11&any=2025`
- [ ] `GET /api/v1/informes/pdf/anual?any=2025`
- [ ] `GET /api/v1/informes/pdf/personalitzat?data_inici=X&data_fi=Y`

**Dependències**:
```json
{
  "pdfkit": "^0.14.0"
}
```

**Endpoints**:
```
GET    /api/v1/informes/pdf/mensual           (authenticated)
GET    /api/v1/informes/pdf/anual             (authenticated)
GET    /api/v1/informes/pdf/personalitzat     (authenticated)
```

---

### FASE 8: Validacions i Millores 🛡️
**Objectiu**: Robustesa i qualitat

#### 8.1. Validació d'Entrada
- [ ] Instal·lar i configurar Joi o Zod
- [ ] Validar tots els endpoints

#### 8.2. Rate Limiting
- [ ] Protegir endpoints d'autenticació
- [ ] Límits generals per usuari

#### 8.3. Tests
- [ ] Tests unitaris de repositories
- [ ] Tests d'integració d'endpoints

**Dependències**:
```json
{
  "joi": "^17.11.0",
  "express-rate-limit": "^7.1.0",
  "jest": "^29.7.0",
  "supertest": "^6.3.0"
}
```

---

## 📁 Estructura de Carpetes Proposada

```
backend/
├── src/
│   ├── config/              # Configuració (db, jwt, etc.)
│   │   ├── database.js
│   │   └── jwt.js
│   ├── middleware/          # Middleware globals
│   │   ├── authenticate.js
│   │   ├── authorize.js
│   │   ├── errorHandler.js
│   │   └── validateRequest.js
│   ├── repositories/        # Accés a base de dades
│   │   ├── userRepository.js
│   │   ├── empresaRepository.js
│   │   ├── tipusServeiRepository.js
│   │   └── serveiRepository.js
│   ├── services/            # Lògica de negoci
│   │   ├── authService.js
│   │   ├── empresaService.js
│   │   ├── tipusServeiService.js
│   │   ├── serveiService.js
│   │   └── informeService.js
│   ├── controllers/         # Gestió de peticions
│   │   ├── authController.js
│   │   ├── empresaController.js
│   │   ├── tipusServeiController.js
│   │   ├── serveiController.js
│   │   └── informeController.js
│   ├── routes/              # Definició de rutes
│   │   ├── auth.routes.js
│   │   ├── empresa.routes.js
│   │   ├── tipusServei.routes.js
│   │   ├── servei.routes.js
│   │   └── informe.routes.js
│   ├── validators/          # Schemas de validació
│   │   ├── authValidator.js
│   │   ├── empresaValidator.js
│   │   └── serveiValidator.js
│   ├── utils/               # Utilitats
│   │   ├── logger.js
│   │   ├── errors.js
│   │   └── pdfGenerator.js
│   ├── app.js               # Configuració d'Express
│   └── server.js            # Punt d'entrada
├── tests/                   # Tests
│   ├── unit/
│   └── integration/
├── .env.example             # Variables d'entorn
├── .gitignore
├── package.json
├── Dockerfile               # Per dockeritzar (opcional)
└── README.md
```

---

## 🔄 Flux de Treball Recomanat

### Per Cada Fase:
1. ✅ **Planificar**: Revisar aquesta planificació
2. 🛠️ **Implementar**: Crear fitxers necessaris
3. 🧪 **Testejar**: Provar amb Postman/Thunder Client
4. 📝 **Documentar**: Afegir exemples d'ús
5. ✔️ **Validar**: Confirmar que tot funciona abans de seguir

### Ordre Recomanat:
```
FASE 1 → FASE 2 → FASE 3 → FASE 4 → FASE 5 → FASE 6 → FASE 7 → FASE 8
```

**Cada fase és autònoma i funcional** abans de passar a la següent.

---

## 🎯 Estat Actual

- ✅ **Base de Dades**: PostgreSQL amb schema complet
- ✅ **Docker**: Contenidor PostgreSQL funcionant
- ✅ **FASE 1 COMPLETADA**: Infraestructura base amb qualitat prioritària
  - Servidor Express configurat
  - Connexió PostgreSQL validada
  - Sistema de logging amb Pino
  - Gestió d'errors professional
  - Validació de variables d'entorn
  - Request ID per traçabilitat
- ✅ **FASE 2 COMPLETADA**: Autenticació i Usuaris
  - Repository pattern implementat (userRepository, refreshTokenRepository)
  - Endpoints d'autenticació complets (register, login, refresh, logout, logout-all, me)
  - Middleware d'autenticació i autorització
  - Validació d'inputs amb express-validator
  - Rate limiting per seguretat
  - Documentació Swagger completa
- ✅ **FASE 3 COMPLETADA**: Gestió d'Empreses
  - Taula `empreses` amb dates d'inici/fi (historial laboral complet)
  - Repository d'empreses amb 8 mètodes (CRUD + actives + finalitzar)
  - Service amb validacions de negoci
  - 6 endpoints REST amb autenticació
  - Validació d'inputs per crear/actualitzar
  - Suport multi-empresa simultània (data_fi = NULL)
  - Documentació Swagger completa
- ⏳ **FASE 4**: Tipus de Serveis (següent)

---

## 📝 Notes Importants

1. **Multi-tenant**: Tots els endpoints filtren per `user_id` automàticament
2. **Triggers PostgreSQL**: Els càlculs es fan a la BD, no a l'API
3. **Soft Delete**: Les empreses i tipus de serveis tenen `actiu` en lloc de eliminar-se
4. **JWT**: Access token (15 min) + Refresh token (7 dies)
5. **Validació**: Sempre validar que els recursos pertanyen a l'usuari

---

**Data de creació**: 30 de novembre de 2025  
**Última actualització**: 30 de novembre de 2025
