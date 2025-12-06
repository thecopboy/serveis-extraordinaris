# Planificació: Sistema de Gestió de Serveis Extraordinaris

## Visió General del Projecte

Sistema web multiusuari per a la gestió personalitzada de serveis extraordinaris, accessible des de dispositius mòbils i escriptori.

---

## Stack Tecnològic

### Frontend
- **Llenguatge**: Vanilla JavaScript (ES6+)
- **UI Framework**: Web Components (natiu)
- **Target**: Responsive (mòbil + escriptori)
- **Build Tools**: Per definir (opcional: Vite, webpack, o cap)

### Backend
- **Opcions**: Node.js o Python
- **API**: REST o GraphQL (per definir)

### Base de Dades
- **Tipus**: Per determinar (PostgreSQL, SQLite, MongoDB, etc.)
- **Hosting**: Servidor propi (opció gratuïta)

---

## Funcionalitats Principals

### 1. Gestió d'Usuaris
- Sistema multiusuari
- Autenticació i autorització
- Perfils d'usuari

### 2. Registre de Serveis
- Alta/baixa/modificació de serveis extraordinaris
- Associació a usuari
- Data i hora del servei
- Tipus de servei (definible)

### 3. Definició de Tipus de Serveis
- **Serveis remunerats amb diners**
  - Tarifa base
  - Factors multiplicadors (nocturn, festiu, cap de setmana, etc.)
- **Serveis compensats amb hores**
  - Equivalència horària
  - Factors multiplicadors

### 4. Càlculs
- **Càlcul d'hores**
  - Hores treballades
  - Hores acumulades
  - Hores compensades
- **Càlcul de pagaments**
  - Import brut
  - Aplicació de factors
  - Històric de pagaments

### 5. Consultes i Informes
- **Consulta mensual**
  - Resum del mes
  - Serveis realitzats
  - Totals (hores/diners)
- **Consulta anual**
  - Resum de l'any
  - Estadístiques
  - Gràfiques
- **Consulta personalitzada**
  - Rang de dates custom
  - Filtres per tipus de servei
  - Exportació de dades

### 6. Generació de Reports
- Format PDF
- Format Excel/CSV
- Detall de serveis
- Resums i totals

---

## Models de Dades (Esborrany)

### Usuari
- ID
- Nom complet
- Email
- Contrasenya (hash)
- Rol
- Data de creació
- Configuració personal

### TipusServei
- ID
- Nom
- Descripció
- Tipus de remuneració (diners/hores)
- Tarifa base
- Factor multiplicador per defecte
- Actiu/Inactiu

### Servei (Registre)
- ID
- Usuari ID
- Tipus de servei ID
- Data i hora inici
- Data i hora fi
- Durada (hores)
- Factor multiplicador aplicat
- Import calculat (si és remunerat)
- Hores compensades (si és compensació)
- Observacions
- Estat (pendent, aprovat, pagat, compensat)
- Data de creació

### FactorMultiplicador
- ID
- Nom (nocturn, festiu, cap de setmana, etc.)
- Valor del factor (ex: 1.5, 2.0)
- Descripció

---

## Casos d'Ús Principals

1. **Registrar un servei extraordinari**
   - L'usuari selecciona tipus de servei
   - Introdueix data/hora inici i fi
   - El sistema calcula automàticament durada i import/hores
   - Aplica factors si correspon

2. **Consultar serveis del mes actual**
   - Vista de calendari o llista
   - Totals acumulats
   - Detall per tipus

3. **Generar informe trimestral**
   - Selecciona rang de dates
   - Selecciona format (PDF/Excel)
   - Sistema genera i descarrega

4. **Configurar nou tipus de servei**
   - Administrador defineix nom i tarifes
   - Estableix factors aplicables
   - Guarda configuració

---

## Fases d'Implementació (Actualitzades amb experiència real)

### ⚠️ IMPORTANT: Lliçons apreses del desenvolupament real

Aquesta secció reflecteix l'experiència real d'implementació. Les fases originals eren massa optimistes. A continuació, la planificació realista basada en el projecte real.

---

### FASE 0: Preparació i Infraestructura (1-2 dies)
**Sovint ignorada però CRÍTICA**

#### Setup inicial del projecte
- [ ] Crear repositori Git amb .gitignore adequat
- [ ] Configurar estructura de carpetes (backend/frontend/docs)
- [ ] Crear README.md amb instruccions d'instal·lació
- [ ] Configurar EditorConfig per consistència

#### Base de dades
- [ ] Instal·lar PostgreSQL (Docker recomanat per facilitat)
- [ ] Crear base de dades i usuari
- [ ] Documentar comandes d'accés i gestió
- [ ] Crear script de backup inicial

#### Variables d'entorn
- [ ] Crear .env.example COMPLET des del principi
  - ⚠️ **APRÈS**: No fer-ho després, fer-ho ara
  - Documentar TOTES les variables amb comentaris
  - Incloure exemples realistes
  - Instruccions de generació de secrets (openssl rand -base64 32)
- [ ] Crear .env real amb valors de desenvolupament
- [ ] Afegir .env al .gitignore

#### Documentació inicial
- [ ] DATABASE_SCHEMA.md amb diagrama ER
- [ ] DEPLOY.md amb instruccions de desplegament
- [ ] API_EXAMPLES.md (si és API REST)

**Temps estimat**: 1-2 dies (NO menystenir aquesta fase!)

---

### FASE 1: Autenticació JWT (3-5 dies)
**Més complex del previst - Planifica 5 dies, no 2**

#### 1.1 Setup inicial del backend (Dia 1)
- [ ] Inicialitzar projecte Node.js amb `npm init`
- [ ] Instal·lar dependencies inicials:
  ```bash
  # Essencials
  npm install express pg bcrypt jsonwebtoken
  
  # Middleware de seguretat (INSTAL·LAR DES DE L'INICI)
  npm install cors helmet express-rate-limit
  
  # Logging estructurat (NO console.log!)
  npm install pino pino-pretty
  
  # Validació (ESSENCIAL des del principi)
  npm install express-validator
  
  # Jobs programats
  npm install node-cron
  
  # Documentació API
  npm install swagger-jsdoc swagger-ui-express
  ```

- [ ] Configurar estructura de carpetes (veure secció "Estructura recomanada")
- [ ] Crear fitxer de configuració d'entorn robust

#### 1.2 Esquema de base de dades (Dia 1)
- [ ] Crear taula `usuaris` amb tots els camps necessaris:
  ```sql
  - id (SERIAL PRIMARY KEY)
  - email (VARCHAR(255) UNIQUE NOT NULL)
  - password_hash (VARCHAR(255) NOT NULL)
  - nom (VARCHAR(100) NOT NULL)
  - cognom_1 (VARCHAR(100)) -- Opcional!
  - cognom_2 (VARCHAR(100)) -- Opcional!
  - numero_professional (VARCHAR(50)) -- Opcional!
  - rol (VARCHAR(20) NOT NULL) -- admin/tecnic/usuari
  - actiu (BOOLEAN DEFAULT true)
  - data_registre_inicial (TIMESTAMP DEFAULT NOW())
  - updated_at (TIMESTAMP DEFAULT NOW())
  ```

- [ ] Crear taula `refresh_tokens`:
  ```sql
  - id (SERIAL PRIMARY KEY)
  - user_id (INTEGER REFERENCES usuaris(id) ON DELETE CASCADE)
  - token (VARCHAR(500) UNIQUE NOT NULL)
  - expira_at (TIMESTAMP NOT NULL)
  - creat_at (TIMESTAMP DEFAULT NOW())
  - revocat (BOOLEAN DEFAULT false)
  - CONSTRAINT expira_futur CHECK (expira_at > creat_at)
  ```

- [ ] Crear índexs per rendiment:
  ```sql
  CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
  CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);
  CREATE INDEX idx_refresh_tokens_expira_at ON refresh_tokens(expira_at);
  ```

#### 1.3 Implementació d'autenticació (Dies 2-3)
- [ ] **Repository layer** (accés a BD):
  - userRepository.js (create, findByEmail, findById, update)
  - refreshTokenRepository.js (create, findByToken, revokeToken, revokeAllByUserId, deleteExpired)

- [ ] **Service layer** (lògica de negoci):
  - authService.js amb funcions:
    - register(userData) - Hash password, crear usuari i tokens
    - login(email, password) - Verificar, generar tokens
    - refresh(refreshToken) - Validar i generar nou accessToken
    - logout(refreshToken) - Revocar token específic
    - logoutAll(userId) - Revocar tots els tokens de l'usuari

- [ ] **Controller layer**:
  - authController.js (register, login, refresh, logout, logoutAll, me)
  - ⚠️ **IMPORTANT**: Usar asyncHandler des del principi (no try-catch manual)

- [ ] **Middleware**:
  - auth.js - Verificar JWT i adjuntar usuari a req.user
  - errorHandler.js - Gestió centralitzada d'errors
  - asyncHandler.js - Wrapper per funcions async
  - requestId.js - Generar UUID per cada petició (traçabilitat)

#### 1.4 Seguretat i validació (Dia 3-4)
⚠️ **NO DEIXAR PER DESPRÉS - FER DES DE L'INICI**

- [ ] **Validació d'inputs** (validators.js):
  - validateRegister: email, password (mínim 8 chars, majúscula, minúscula, número, especial), nom, rol
  - validateLogin: email, password
  - validateRefresh: refreshToken
  - validateLogout: refreshToken

- [ ] **Rate limiting** (rateLimiter.js):
  - loginLimiter: 5 intents / 15 minuts
  - registerLimiter: 3 registres / 1 hora
  - apiLimiter: 100 peticions / 15 minuts

- [ ] **CORS amb whitelist** (corsConfig.js):
  - Múltiples origins des de .env (CORS_ORIGINS)
  - Validació dinàmica contra whitelist
  - Credentials enabled per JWT
  - Error handler específic per CORS

- [ ] **Logging estructurat amb Pino**:
  - NO usar console.log/error mai
  - logger.js amb nivells configurables
  - Helpers: logRequest(), logQuery(), logError()
  - Metadata estructurada (requestId, userId, durada, etc.)

#### 1.5 Millores essencials (Dia 4-5)
⚠️ **APRÈS**: Aquestes NO són opcionals, són ESSENCIALS

- [ ] **Gestió d'errors centralitzada**:
  - AppError base class
  - Classes específiques: ValidationError, UnauthorizedError, NotFoundError, ConflictError
  - errorHandler middleware que captura TOT
  - Format consistent de respostes d'error

- [ ] **Neteja automàtica de tokens** (jobs/cleanupTokens.js):
  - node-cron per executar cada dia a les 3:00 AM
  - DELETE tokens expirats o revocats
  - Logging estructurat del resultat
  - Variables d'entorn: CLEANUP_SCHEDULE, CLEANUP_ENABLED

- [ ] **Documentació API amb Swagger**:
  - config/swagger.js amb esquemes reutilitzables
  - Anotacions @swagger a tots els endpoints
  - Interfície interactiva a /api-docs
  - Exemples de peticions i respostes
  - Documentació de codis d'estat

- [ ] **Validació robusta de logout**:
  - Comprovar que el token existeix a la BD
  - Verificar que no està ja revocat
  - WHERE revocat = false a la query UPDATE
  - Retornar 404 si token no trobat

#### 1.6 Testing manual (Dia 5)
- [ ] Provar tots els endpoints amb Swagger UI
- [ ] Verificar rate limiting (5 intents de login fallits)
- [ ] Provar CORS amb diferents origins
- [ ] Verificar tokens expiren correctament
- [ ] Provar logout i logout-all
- [ ] Verificar neteja automàtica de tokens (manual: --run-now)

**Temps real**: 5 dies (no 2 com es pensava inicialment)

**Lliçons apreses**:
- La seguretat NO és opcional, implementar des de l'inici
- La validació d'inputs estalvia hores de debugging
- El logging estructurat és imprescindible per producció
- Els tests unitaris són opcionals en projectes petits, Swagger és suficient
- CORS mal configurat causa problemes difícils de debugar

---

### FASE 2: CRUD de Serveis Extraordinaris (2-3 dies)
**Nota**: Més ràpid ara que tens l'arquitectura sòlida de FASE 1

#### 2.1 Esquema de base de dades (Dia 1)
- [ ] Crear taula `serveis_extraordinaris`:
  ```sql
  - id (SERIAL PRIMARY KEY)
  - usuari_id (INTEGER REFERENCES usuaris(id) ON DELETE CASCADE)
  - data_servei (DATE NOT NULL)
  - torn (VARCHAR(20) NOT NULL) -- matí/tarda/nit
  - tipus_servei (VARCHAR(50) NOT NULL)
  - hores (DECIMAL(4,2) NOT NULL)
  - import (DECIMAL(10,2))
  - validat (BOOLEAN DEFAULT false)
  - validat_per (INTEGER REFERENCES usuaris(id))
  - validat_at (TIMESTAMP)
  - observacions (TEXT)
  - creat_at (TIMESTAMP DEFAULT NOW())
  - updated_at (TIMESTAMP DEFAULT NOW())
  ```

- [ ] Crear taula `tipus_serveis`:
  ```sql
  - id (SERIAL PRIMARY KEY)
  - codi (VARCHAR(20) UNIQUE NOT NULL)
  - nom (VARCHAR(100) NOT NULL)
  - descripcio (TEXT)
  - tarifa_base (DECIMAL(10,2) NOT NULL)
  - actiu (BOOLEAN DEFAULT true)
  ```

- [ ] Índexs:
  ```sql
  CREATE INDEX idx_serveis_usuari_data ON serveis_extraordinaris(usuari_id, data_servei);
  CREATE INDEX idx_serveis_validat ON serveis_extraordinaris(validat);
  ```

#### 2.2 Implementació CRUD (Dia 2)
- [ ] Repository: serveiRepository.js
- [ ] Service: serveiService.js
- [ ] Controller: serveiController.js
- [ ] Routes: serveiRoutes.js amb permisos per rol
- [ ] Validació: validateServei middleware

#### 2.3 Consultes i informes (Dia 3)
- [ ] Endpoint: GET /api/serveis/mensuals/:any/:mes
- [ ] Endpoint: GET /api/serveis/pendents-validar (només admin)
- [ ] Endpoint: PATCH /api/serveis/:id/validar (només admin)

**Temps estimat**: 2-3 dies amb l'arquitectura ja definida

---

### FASE 3: Interfície web amb React (5-7 dies)
**Frontend modern amb Vite**

#### 3.1 Setup (Dia 1)
- [ ] Crear projecte amb Vite: `npm create vite@latest frontend -- --template react`
- [ ] Instal·lar dependencies:
  ```bash
  npm install react-router-dom axios
  npm install @tanstack/react-query
  npm install zustand
  npm install react-hook-form
  npm install date-fns
  ```

#### 3.2 Autenticació frontend (Dies 2-3)
- [ ] Store de Zustand per auth
- [ ] Interceptor Axios per JWT
- [ ] Refresh automàtic de tokens
- [ ] Protected routes
- [ ] Login/Register forms amb validació

#### 3.3 CRUD de serveis (Dies 4-5)
- [ ] Llistat de serveis amb filtres
- [ ] Formulari crear/editar servei
- [ ] Validació de serveis (admin)
- [ ] Informes mensuals

#### 3.4 UX i millores (Dies 6-7)
- [ ] Loading states
- [ ] Error handling
- [ ] Toasts/notificacions
- [ ] Responsive design
- [ ] Dark mode (opcional)

**Temps estimat**: 5-7 dies

---

### FASE 4: Desplegament (2-3 dies)

#### 4.1 Preparació backend
- [ ] Variables d'entorn de producció (.env.production.example)
- [ ] HTTPS obligatori
- [ ] CORS amb domini real
- [ ] Rate limiting ajustat
- [ ] Logs a fitxer (no només consola)
- [ ] Health check endpoint: GET /api/health

#### 4.2 Preparació frontend
- [ ] Build de producció: `npm run build`
- [ ] Variables d'entorn (VITE_API_URL)
- [ ] Configurar dominis CORS_ORIGINS al backend

#### 4.3 Base de dades producció
- [ ] Backup de dades
- [ ] Migrations automàtiques (opcional: fer servir pg-migrate)
- [ ] SSL activat

#### 4.4 Deploy
- [ ] Backend a servidor (VPS/AWS/Heroku)
- [ ] Frontend a Netlify/Vercel/Cloudflare Pages
- [ ] Configurar dominis
- [ ] SSL/TLS certificats (Let's Encrypt)
- [ ] Monitorització bàsica (PM2 per Node.js)

**Temps estimat**: 2-3 dies (més si hi ha problemes)

---

## 🎓 Lliçons Apreses del Desenvolupament Real

### Decisions Tècniques Confirmades

#### ✅ El que va funcionar bé

1. **Node.js amb Express**
   - Ràpid de desenvolupar
   - Ecosistema de middleware robust
   - Fàcil integració amb PostgreSQL via `pg`
   - **Recomanació**: Ideal per APIs REST de mida petita-mitjana

2. **PostgreSQL com a base de dades**
   - Relacions entre taules molt clares
   - Constraints (UNIQUE, FOREIGN KEY) eviten errors
   - ON DELETE CASCADE estalvia molta lògica manual
   - **Trampa**: Camps opcionals → sempre definir DEFAULT o NOT NULL explícitament

3. **JWT amb Access + Refresh Tokens**
   - Access token curt (15 min) per seguretat
   - Refresh token llarg (7 dies) per UX
   - Guardar refresh a BD permet revocació
   - **CRÍTIC**: Sempre validar que el refresh token existeix i no està revocat

4. **Arquitectura en capes**
   - Repository (accés a BD) → Service (lògica) → Controller (HTTP)
   - Reutilització de codi
   - Testable (encara que no es facin tests)
   - **Recomanació**: No saltar-se cap capa, encara que sembli overhead

5. **Middleware chains d'Express**
   - Composició de funcionalitats (auth, validació, rate limiting, logging)
   - Ordre important: helmet → cors → rate-limiter → auth → validació → controller
   - asyncHandler elimina try-catch repetitius

6. **Logging estructurat amb Pino**
   - JSON format llegible per màquines (útil per agregadors com ELK)
   - Nivells de log configurables per entorn
   - Rendiment superior a console.log
   - **Recomanació**: Mai usar console.log en producció

7. **express-validator per validació**
   - DSL declarativa i clara
   - Missatges d'error customitzables
   - Sanitització automàtica
   - **Millor que**: Joi (més verbós), validació manual (propens a errors)

8. **Swagger per documentació d'API**
   - Genera documentació interactiva des del codi
   - "Try it out" substitueix Postman per testing manual
   - Mantenir JSDoc anotacions en sincronització amb el codi
   - **Alternativa millor que**: Documentació manual (sempre desactualitzada)

9. **CORS amb whitelist**
   - Més segur que `origin: '*'`
   - Suport multi-origen des del principi (dev: localhost:3000,localhost:5173)
   - `credentials: true` necessari per JWT en cookies/headers
   - **Trampa**: Sempre incloure `http://` o `https://`, sense trailing slash

10. **Rate limiting agressiu**
    - Login: 5 intents / 15 min
    - Register: 3 intents / 1 hora
    - Prevé atacs de força bruta sense impactar usuaris reals
    - **Recomanació**: Diferents limitadors per diferents endpoints

#### ❌ Errors a evitar

1. **.env.example incomplet**
   - **Error**: Afegir variables una a una quan es necessiten
   - **Correcte**: Crear .env.example complet des de l'inici amb comentaris explicatius
   - **Incloure**: Exemples de generació de secrets (openssl), formats esperats, advertències

2. **console.log en producció**
   - **Error**: Dependre de console.log/error
   - **Correcte**: Logging estructurat (Pino) des del dia 1
   - **Per què**: Traçabilitat, nivells de log, format JSON, rendiment

3. **Validació deixada per després**
   - **Error**: "Ja validarem més endavant"
   - **Correcte**: Validació d'inputs des del primer endpoint
   - **Conseqüència**: Errors de BD críptics, seguretat compromesa

4. **CORS amb origin: '*'**
   - **Error**: Permetre qualsevol origen per "facilitat"
   - **Correcte**: Whitelist des del principi amb CORS_ORIGINS
   - **Per què**: Seguretat bàsica, prevé CSRF

5. **Secrets hardcodejats**
   - **Error**: JWT_SECRET directament al codi
   - **Correcte**: Sempre des de variables d'entorn
   - **CRÍTIC**: Mai fer commit de secrets reals

6. **No gestionar tokens expirats**
   - **Error**: Deixar tokens expirats a la BD indefinidament
   - **Correcte**: Job de neteja amb node-cron (diari a les 3 AM)
   - **Benefici**: Reducció de mida de taula, millor rendiment

7. **Errors HTTP inconsistents**
   - **Error**: Barrejar 400/500 sense criteri
   - **Correcte**: Classes d'error específiques (ValidationError → 400, UnauthorizedError → 401)
   - **Benefici**: Client pot gestionar errors de forma consistent

8. **Logout sense validació**
   - **Error**: `UPDATE refresh_tokens SET revocat = true WHERE token = ?`
   - **Correcte**: Validar que existeix i no està ja revocat
   - **Per què**: Millor UX (404 si token no existeix) i traçabilitat

#### ⚠️ Tests unitaris: Quan SÍ i quan NO

**Projecte real**: 6 endpoints, 1-2 desenvolupadors, projecte intern
**Decisió**: NO fer tests unitaris, usar Swagger per testing manual
**Justificació**:
- Cost > Benefici en projectes petits
- Swagger UI substitueix tests d'integració manuals
- Maintenance overhead de tests (doble feina per cada canvi)
- Tests poden donar falsa sensació de seguretat

**QUAN fer tests**:
- ✅ Projecte gran (>20 endpoints)
- ✅ Equip gran (>3 desenvolupadors)
- ✅ Lògica de negoci complexa (càlculs, algoritmes)
- ✅ API pública o crítica
- ✅ Refactors frequents
- ✅ CI/CD automàtic

**QUAN NO fer tests**:
- ❌ Projecte intern petit (<10 endpoints)
- ❌ Equip petit (1-2 devs)
- ❌ Deadlines ajustats
- ❌ CRUD simples sense lògica complexa
- ❌ Prototip o MVP inicial

**Alternativa**: Documentació Swagger + testing manual estructurat

---

### Estructura de Projecte Recomanada

```
backend/
├── src/
│   ├── config/          # Configuració (env.js, db.js, swagger.js)
│   ├── controllers/     # Controladors HTTP (authController.js, ...)
│   ├── middleware/      # Middleware (auth.js, errorHandler.js, validators.js, corsConfig.js, rateLimiter.js)
│   ├── models/          # Models de dades (User.js, RefreshToken.js)
│   ├── repositories/    # Accés a BD (userRepository.js, refreshTokenRepository.js)
│   ├── routes/          # Definició de rutes (authRoutes.js, ...)
│   ├── services/        # Lògica de negoci (authService.js, ...)
│   ├── utils/           # Utilitats (logger.js, asyncHandler.js, AppError.js)
│   ├── jobs/            # Tasques programades (cleanupTokens.js)
│   └── app.js           # Aplicació Express
├── logs/                # Logs (gitignored)
├── .env                 # Variables d'entorn (gitignored)
├── .env.example         # Plantilla amb documentació
├── package.json
├── schema.sql           # Esquema de BD inicial
├── DATABASE_SCHEMA.md   # Documentació de BD
├── DEPLOY.md            # Instruccions de desplegament
└── README.md            # Instruccions d'instal·lació

frontend/
├── src/
│   ├── components/      # Components React
│   ├── pages/           # Pàgines (Login, Dashboard, ...)
│   ├── hooks/           # Custom hooks
│   ├── services/        # Clients API (authService.js, ...)
│   ├── store/           # Zustand stores
│   ├── utils/           # Utilitats
│   ├── App.jsx
│   └── main.jsx
├── .env                 # VITE_API_URL (gitignored)
├── .env.example
├── package.json
└── index.html
```

---

### Dependencies Essencials (backend)

**Producció**:
```json
{
  "express": "^4.18.2",           // Framework web
  "pg": "^8.11.3",                 // Client PostgreSQL
  "bcrypt": "^5.1.1",              // Hash de passwords
  "jsonwebtoken": "^9.0.2",        // JWT
  "cors": "^2.8.5",                // CORS amb whitelist
  "helmet": "^7.1.0",              // Headers de seguretat
  "express-rate-limit": "^7.1.5",  // Rate limiting
  "express-validator": "^7.0.1",   // Validació d'inputs
  "pino": "^8.17.2",               // Logging estructurat
  "pino-pretty": "^10.3.1",        // Logging llegible en dev
  "node-cron": "^3.0.3",           // Jobs programats
  "swagger-jsdoc": "^6.2.8",       // Generació de Swagger
  "swagger-ui-express": "^5.0.0"   // Interfície Swagger
}
```

**Desenvolupament**:
```json
{
  "nodemon": "^3.0.2"              // Auto-reload en dev
}
```

---

### Variables d'Entorn Essencials

**Obligatòries**:
```env
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
JWT_SECRET=<openssl rand -base64 32>
JWT_REFRESH_SECRET=<openssl rand -base64 64>
```

**Opcionals però recomanades**:
```env
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
LOG_LEVEL=info
CLEANUP_ENABLED=true
CLEANUP_SCHEDULE=0 3 * * *
```

---

### Checklist de Seguretat (Producció)

- [ ] JWT secrets generats amb openssl (mínim 32 bytes)
- [ ] Helmet activat amb configuració per defecte
- [ ] CORS amb whitelist (mai origin: '*')
- [ ] Rate limiting en tots els endpoints públics
- [ ] Validació d'inputs amb express-validator
- [ ] Passwords hasheats amb bcrypt (cost factor 12)
- [ ] HTTPS obligatori (redirect HTTP → HTTPS)
- [ ] Variables d'entorn en fitxer .env (mai al codi)
- [ ] .env afegit a .gitignore
- [ ] Logs estructurats amb Pino (no console.log)
- [ ] Error handling centralitzat (no exposar stack traces)
- [ ] Tokens expirats netejats automàticament
- [ ] ON DELETE CASCADE a foreign keys
- [ ] Índexs a camps buscats freqüentment
- [ ] Health check endpoint per monitorització

---

### Recomanacions per Futures Millores

1. **Migracions de BD automàtiques**
   - Eina: `node-pg-migrate` o `Sequelize migrations`
   - Benefici: Versionat de canvis a l'esquema

2. **Tokens en cookies HTTP-only**
   - Més segur que localStorage
   - Prevé XSS
   - Requereix CORS amb credentials

3. **2FA (autenticació de dos factors)**
   - Només si el projecte ho requereix (bancs, salut, etc.)
   - Llibreria: `speakeasy` per TOTP

4. **Paginació en tots els listats**
   - Evita carregar 1000+ registres
   - Paràmetres: `?page=1&limit=20`

5. **Webhooks per notificacions**
   - Alternativa a polling
   - Útil per integracions externes

6. **GraphQL en lloc de REST**
   - Només si el frontend necessita flexibilitat
   - Overhead de configuració significatiu

7. **Contenidorització amb Docker**
   - `docker-compose.yml` per dev
   - Facilita desplegament

---

## Notes i Decisions Tècniques (CONFIRMADES)

### Decisions confirmades durant el desenvolupament

✅ **Backend**: Node.js amb Express
- Justificació: Ecosistema madur, middleware robust, comunitat gran
- Alternatives considerades: Python/Flask (més lent), Go (overkill per projecte petit)

✅ **Base de dades**: PostgreSQL
- Justificació: Relacional robust, constraints, ACID compliant
- Alternatives: MySQL (menys features), MongoDB (no relacional, no adequat)

✅ **API**: REST amb JSON
- Justificació: Simplicitat, cacheable, stateless
- Alternatives: GraphQL (overhead innecessari per projecte petit)

✅ **Autenticació**: JWT (Access + Refresh)
- Justificació: Stateless, escalable, revocable amb refresh tokens a BD
- Durades confirmades: 15 min access, 7 dies refresh

✅ **Validació**: express-validator
- Justificació: Declarativa, integrada amb Express, sanitització automàtica
- Alternatives: Joi (més verbós), Yup (orientat a frontend)

✅ **Logging**: Pino
- Justificació: Ràpid, estructurat (JSON), nivells configurables
- Alternatives: Winston (més lent), Morgan (només HTTP)

✅ **Documentació**: Swagger/OpenAPI 3.0
- Justificació: Interactiva, genera des del codi, substitueix Postman
- Alternatives: Postman Collection (manual), README (desactualitzada)

✅ **Rate Limiting**: express-rate-limit
- Justificació: Simple, efectiu, configuració per endpoint
- Configuració final: Login 5/15min, Register 3/1h, API 100/15min

✅ **CORS**: Whitelist multi-origen
- Justificació: Seguretat, suport dev (localhost:3000,5173) i producció
- Alternatives: origin:'*' (insegur), proxy invers (overhead)

❌ **Tests unitaris**: DESCARTATS per projecte petit
- Justificació: Cost > Benefici, Swagger suficient, 6 endpoints simples
- Reconsiderar si: >20 endpoints, >3 devs, lògica complexa

---

## Arquitectura i Patrons de Disseny

### Patrons Frontend (Vanilla JS + Web Components)

#### Organització del Codi
- **ES6 Modules**: Codi organitzat en mòduls independents i importables
- **Component Pattern**: Cada Web Component és autònom i reutilitzable
- **Observer Pattern / State Management**: Gestió centralitzada de l'estat de l'aplicació

#### Capes d'Abstracció
- **Router**: Sistema de routing client-side per navegació SPA
- **Service Layer**: Capa de serveis per gestionar crides a l'API
- **Repository Pattern**: Abstracció de les crides HTTP i gestió de dades

#### Estructura de Components
```
components/
├── base/           (Components base reutilitzables)
├── layout/         (Header, footer, sidebar, etc.)
├── forms/          (Formularis i inputs)
├── tables/         (Taules de dades)
└── views/          (Vistes principals de l'aplicació)
```

### Patrons Backend

#### Arquitectura
- **MVC o Clean Architecture**: Separació clara de responsabilitats
  - Controllers: Gestió de peticions HTTP
  - Services: Lògica de negoci
  - Repositories: Accés a dades
  - Models: Entitats de domini

#### Patrons Aplicats
- **Repository Pattern**: Abstracció de l'accés a base de dades
- **Service Layer**: Lògica de negoci separada dels controllers
- **Middleware Pattern**: Per autenticació, validació, logging, error handling
- **DTO (Data Transfer Objects)**: Validació i transformació d'entrada/sortida

#### Estructura Proposada
```
backend/
├── controllers/    (Gestió de rutes i peticions)
├── services/       (Lògica de negoci)
├── repositories/   (Accés a base de dades)
├── models/         (Definició d'entitats)
├── middleware/     (Auth, validació, logging)
├── dto/            (Validació d'entrada/sortida)
├── config/         (Configuració de l'aplicació)
└── utils/          (Utilitats generals)
```

---

## Aspectes Tècnics i Bones Pràctiques

### Seguretat

#### Autenticació i Autorització
- **JWT (JSON Web Tokens)** per autenticació stateless
- **Bcrypt** per hash de contrasenyes
- **Refresh tokens** per renovar sessions
- **Role-based access control (RBAC)** per autorització

#### Protecció de l'Aplicació
- **HTTPS** obligatori en producció
- **CORS** configurat correctament
- **Rate limiting** a l'API per prevenir abusos
- **Validació i sanitització** de tots els inputs
- **Protecció CSRF** en formularis
- **Headers de seguretat** (Helmet.js o equivalent)

### Base de Dades

#### Recomanacions
- **PostgreSQL** (recomanat per projectes multiusuari)
  - Relacions complexes ben suportades
  - ACID compliance
  - Gratuït i auto-hostejable
  - Bon rendiment amb índexs adequats
  
#### Gestió
- **Migracions amb control de versions** (tipus Flyway, Liquibase o ORM migrations)
- **Índexs** en camps de cerca freqüent (user_id, dates, tipus_servei_id)
- **Backup automàtic** i estratègia de recuperació
- **Seed data** per desenvolupament i testing

### Qualitat del Codi

#### Eines i Convencions
- **ESLint** per mantenir consistència de codi
- **Prettier** per formatació automàtica
- **EditorConfig** per consistència entre editors
- **Tests unitaris** (Jest, Vitest o similar)
- **Tests d'integració** per endpoints d'API
- **Documentació d'API** amb Swagger/OpenAPI (si REST)

#### Git Flow
- **Branques per funcionalitats** (feature branches)
- **Pull requests** amb revisió de codi
- **Commits semàntics** (Conventional Commits)
- **CI/CD** bàsic (opcional en MVP)

### UX/UI

#### Design System
- **Variables CSS** (Custom Properties) per temes i colors
- **Mode fosc/clar** (opcional, però valorat pels usuaris)
- **Components consistents** i reutilitzables
- **Responsive design** amb mobile-first approach

#### Experiència d'Usuari
- **Loading states** i spinners per feedback visual
- **Toasts/Notifications** per confirmacions i errors
- **Validació en temps real** als formularis
- **Error handling** amb missatges comprensibles
- **Accessibilitat** (ARIA labels, navegació per teclat)

#### Funcionalitats Avançades (Opcionals)
- **PWA (Progressive Web App)** per funcionar offline
- **Service Workers** per cache de recursos
- **Notificacions push** (si és necessari)
- **Instal·lació a l'escriptori/mòbil**

---

## Decisions Tècniques Recomanades (ACTUALITZADES)

### Stack Confirmat (Implementat amb èxit)

#### Frontend (PENDENT - FASE 3)
- **Recomanació**: React + Vite (no Vanilla JS)
- Justificació: Ecosistema madur, component libraries, dev experience
- State management: Zustand (simple) o Redux Toolkit (complex)
- HTTP client: Axios amb interceptors per JWT refresh automàtic
- Forms: react-hook-form (rendiment) + yup/zod (validació)
- UI: Tailwind CSS o Material-UI (segons preferència)

#### Backend ✅ IMPLEMENTAT
- **Node.js 22+ amb Express**
- Arquitectura en 3 capes: Repository → Service → Controller
- Middleware chains per composició de funcionalitats
- asyncHandler per evitar try-catch repetitius
- **Resultat**: Codi net, mantenible, escalable

#### Base de Dades ✅ IMPLEMENTAT
- **PostgreSQL 16** amb connexió directa via `pg`
- SQL directe (sense ORM) per control total i rendiment
- Constraints a nivell de BD (UNIQUE, FOREIGN KEY, CHECK)
- Índexs estratègics per rendiment
- **Lliçó**: ORM afegeix overhead innecessari en projectes petits

#### API ✅ IMPLEMENTAT
- **REST amb JSON**
- Versionat: `/api/v1/` (preparat per futures versions)
- Documentació: Swagger/OpenAPI 3.0 interactiva
- Codis d'estat HTTP consistents (400/401/403/404/409/429/500)
- **Resultat**: API clara, autodocumentada, fàcil de testejar

#### Autenticació ✅ IMPLEMENTAT
- **JWT amb dual-token**:
  - Access token: 15 min (curt per seguretat)
  - Refresh token: 7 dies (UX), guardat a BD per revocació
- bcrypt per hash de passwords (cost factor 12)
- Middleware d'auth per protegir endpoints
- **Resultat**: Segur, escalable, revocable

---

## Cronologia Real del Desenvolupament

### 28 novembre 2025: Inici del projecte
- Planificació inicial (aquest document)
- Disseny de base de dades
- Decisions d'arquitectura

### 29 novembre - 2 desembre 2025: FASE 1 - Autenticació JWT
- Setup del projecte backend
- Implementació del sistema d'autenticació base
- Esquema de BD (usuaris + refresh_tokens)
- Endpoints: register, login, refresh, logout, me

### 3-6 desembre 2025: FASE 2 - 10 Millores de Seguretat i Qualitat
#### Millora #1: Validació robusta d'inputs ✅
- express-validator amb regles estrictes
- Missatges d'error personalitzats
- Sanitització automàtica

#### Millora #2: Gestió d'errors centralitzada ✅
- AppError base class
- Classes específiques per tipus d'error
- errorHandler middleware global
- Format JSON consistent

#### Millora #3: Rate limiting ✅
- express-rate-limit configurats per endpoint
- Login: 5/15min, Register: 3/1h, API: 100/15min
- Missatges personalitzats en límits

#### Millora #4: Validació de logout ✅
- Verificar existència de token abans de revocar
- Comprovar que no està ja revocat
- Retornar 404 si no trobat

#### Millora #5: Neteja automàtica de tokens ✅
- node-cron per execució diària (3:00 AM)
- DELETE tokens expirats i revocats
- Logging del resultat amb Pino
- Comando manual: `--run-now`

#### Millora #6: Logging estructurat ✅
- Pino per logs JSON estructurats
- Nivells configurables (trace/debug/info/warn/error/fatal)
- Metadata: requestId, userId, duration, query
- Format pretty en dev, JSON en prod

#### Millora #7: .env.example complet ✅
- Documentació de TOTES les variables
- Exemples de generació de secrets
- Advertències de seguretat
- Valors per defecte raonables

#### Millora #8: Documentació API amb Swagger ✅
- swagger-jsdoc + swagger-ui-express
- OpenAPI 3.0.0 amb esquemes reutilitzables
- Anotacions @swagger a tots els endpoints
- Interfície interactiva a /api-docs
- "Try it out" amb autenticació JWT

#### Millora #9: Tests unitaris ⏸️ ATURAT
- Anàlisi cost/benefici
- **Decisió**: Innecessari per projecte de 6 endpoints
- Swagger UI suficient per testing manual
- Reconsiderar si creix >20 endpoints

#### Millora #10: CORS amb whitelist ✅
- Suport multi-origen (CORS_ORIGINS)
- Validació dinàmica contra whitelist
- Error handler específic per CORS
- Logging de origins permesos/bloquejats

**Resultat FASE 2**: 9/10 millores completades (90%), 1 aturada racionalment

### 6 desembre 2025: Actualització de Planificació
- Captura de lliçons apreses
- Confirmació de decisions tècniques
- Estructura recomanada definitiva
- Checklist de seguretat validada

**Estat actual**: Backend complet i robust, preparat per FASE 3 (frontend)

---

## Aspectes Tècnics i Bones Pràctiques (VALIDATS)

### Control de Versions ✅ IMPLEMENTAT
- **Git** amb .gitignore complet (.env, node_modules, logs/)
- **Commits semàntics**: feat:, fix:, docs:, refactor:, etc.
- Branques: main (producció), desenvolupament en main directament (projecte petit)
- **Lliçó**: Commits freqüents i atòmics (1 millora = 1 commit)

### Seguretat ✅ IMPLEMENTAT
- Helmet per headers de seguretat (CSP, XSS, etc.)
- CORS amb whitelist multi-origen
- Rate limiting per endpoint
- express-validator per sanitització
- bcrypt per passwords (cost 12)
- JWT secrets de 32+ bytes (openssl)
- Error messages sense informació sensible

### Rendiment ✅ IMPLEMENTAT
- Índexs estratègics a BD (user_id, token, expira_at)
- Pino logging (millor rendiment que Winston)
- Neteja automàtica de tokens (evita taules grans)
- Connexió persistent a BD (pool)

### Mantenibilitat ✅ IMPLEMENTAT
- Arquitectura en capes (separació de responsabilitats)
- asyncHandler per codi DRY
- Configuració centralitzada (config/env.js)
- Logging estructurat (traçabilitat)
- Swagger (documentació autogenerada)
- .env.example complet (onboarding ràpid)

### UX/UI (PENDENT - FASE 3)
- Loading states i spinners
- Toasts per feedback
- Validació en temps real
- Error handling amb missatges clars
- Responsive design (mobile-first)
- Dark mode (opcional)

---

**Data de creació**: 28 de novembre de 2025  
**Última actualització**: 6 de desembre de 2025  
**Estat**: Document viu - Actualitzat amb aprenentatges reals del desenvolupament  
**Completitud**: FASE 0 ✅ | FASE 1 ✅ | FASE 2 ✅ (90%) | FASE 3 🔜 | FASE 4 ⏳

