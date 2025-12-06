# 🔧 MILLORES PENDENTS - FASE 2: Autenticació JWT

**Data**: 1 de desembre de 2025  
**Actualitzat**: 6 de desembre de 2025  
**Estat**: En implementació

---

## 📋 RESUM D'ERRORS I MANCANCES DETECTADES

| # | Problema | Severitat | Estat |
|---|----------|-----------|-------|
| 1 | Validació d'input inexistent | 🔴 Alta | ✅ **COMPLETAT** |
| 2 | Gestió d'errors inconsistent | 🟠 Mitjana | ✅ **COMPLETAT** |
| 3 | Manca rate limiting | 🔴 Alta | ✅ **COMPLETAT** |
| 4 | Logout no valida token | 🟠 Mitjana | ✅ **COMPLETAT** |
| 5 | Tokens expirats s'acumulen | 🟡 Baixa | ✅ **COMPLETAT** |
| 6 | Logging no estructurat | 🟡 Baixa | ✅ **COMPLETAT** |
| 7 | .env.example incomplet | 🟡 Baixa | ✅ **COMPLETAT** |
| 8 | Manca documentació API | 🟠 Mitjana | ⏳ Pendent |
| 9 | Sense tests unitaris | 🔴 Alta | ⏳ Pendent |
| 10 | CORS mal configurat | 🟠 Mitjana | ⏳ Pendent |

---

## ✅ 1. VALIDACIÓ D'INPUT - **COMPLETAT**

### Problema
Cap endpoint valida les dades d'entrada. Risc d'injeccions SQL, dades inconsistents i crashes.

### Solució Implementada
```bash
npm install express-validator  # ✅ Instal·lat
```

### Fitxers creats/modificats
- ✅ `src/middleware/validators.js` - Validadors per cada endpoint
- ✅ `src/routes/authRoutes.js` - Validadors integrats a les rutes
- ✅ `src/app.js` - Logger adjuntat a req
- ✅ `AUTH_EXAMPLES.md` - Documentació actualitzada amb validacions
- ✅ `schema.sql` - Camps opcionals (cognom_1, numero_professional)

### Validacions implementades
- **Register**: 
  - nom (2-100 caràcters, obligatori)
  - email (format vàlid, màxim 255 caràcters)
  - password (mínim 8 caràcters, 1 majúscula, 1 minúscula, 1 número, 1 especial)
  - rol (valors: admin/tecnic/usuari)
- **Login**: email i password obligatoris i format vàlid
- **Refresh**: refreshToken obligatori amb longitud mínima
- **Logout**: refreshToken obligatori amb longitud mínima

### Tests realitzats
✅ Dades invàlides rebutjades amb missatges clars  
✅ Dades vàlides acceptades i processades correctament  
✅ Errors 400 amb format consistent  

**Data completat**: 6 de desembre de 2025

---

## ✅ 2. GESTIÓ D'ERRORS CENTRALITZADA - **COMPLETAT**

### Problema
Errors gestionats diferent a cada capa (try-catch a cada controller), dificultat per debugar, formats inconsistents.

### Solució Implementada
Refactoritzat tot el codi per usar el middleware `errorHandler` centralitzat que ja existia.

### Fitxers modificats
- ✅ `src/services/authService.js` - Usa AppError (ConflictError, UnauthorizedError, ForbiddenError, NotFoundError)
- ✅ `src/controllers/authController.js` - Eliminats tots els try-catch, codi reduït de 229 a 116 línies
- ✅ `src/middleware/auth.js` - Usa asyncHandler i AppError
- ✅ `src/routes/authRoutes.js` - Tots els endpoints wrappejats amb asyncHandler
- ✅ `src/repositories/userRepository.js` - Corregits noms de columnes (data_registre_inicial, updated_at)

### Canvis implementats
**ABANS** (cada controller):
```javascript
async register(req, res) {
  try {
    // ... codi ...
  } catch (error) {
    if (error.message === 'EMAIL_ALREADY_EXISTS') {
      return res.status(409).json({ error: 'EMAIL_EXISTS', ... });
    }
    // ... més gestió manual ...
  }
}
```

**DESPRÉS** (molt més net):
```javascript
async register(req, res, next) {
  const userData = req.body;
  const user = await authService.register(userData);
  res.status(201).json({ success: true, data: user });
  // Si hi ha error, asyncHandler ho captura i envia a errorHandler
}
```

### Tests realitzats
✅ Email duplicat → 409 Conflict amb missatge consistent  
✅ Login amb contrasenya incorrecta → 401 Unauthorized  
✅ Accés sense token → 401 Unauthorized  
✅ Format consistent a totes les respostes d'error  
✅ Logging automàtic amb context complet  

### Beneficis aconseguits
- 📉 Codi reduït: authController.js de 229 → 116 línies (-49%)
- 🎯 Format consistent: Totes les respostes d'error segueixen el mateix patró
- 🔍 Logging automàtic: errorHandler fa log amb requestId, body, params, etc.
- 🛡️ Més segur: Si t'oblides d'un try-catch, asyncHandler ho captura
- 🧹 Més net: Controllers són funcions curtes i llegibles

**Data completat**: 6 de desembre de 2025

---

## ✅ 3. RATE LIMITING - **COMPLETAT**

### Problema
No hi ha protecció contra brute force attacks al login/register.

### Solució Implementada
```bash
npm install express-rate-limit  # ✅ Instal·lat
```

### Fitxers creats/modificats
- ✅ `src/middleware/rateLimiter.js` - 3 rate limiters (loginLimiter, registerLimiter, apiLimiter)
- ✅ `src/routes/authRoutes.js` - Limiters integrats a /register i /login
- ✅ `src/app.js` - Rate limiter global per /api/*

### Configuració implementada
- **loginLimiter**: Màxim 5 intents / 15 minuts (brute force protection)
- **registerLimiter**: Màxim 3 registres / 1 hora (spam protection)
- **apiLimiter**: Màxim 100 peticions / 15 minuts (DoS protection)

### Tests realitzats
✅ Login: Intent 6 blocat amb 429 després de 5 intents fallits  
✅ Missatge clar: "Massa intents de login. Prova-ho de nou en 15 minuts."  
✅ Headers RateLimit-* correctes (Limit, Remaining, Reset)  
✅ Logging automàtic amb IP i endpoint  

### Beneficis aconseguits
- 🛡️ Protecció contra brute force: Impossible provar >5 contrasenyes en 15min
- 🚫 Prevenció de spam: Limita creació massiva de comptes
- ⚡ Protecció DoS: Limita peticions globals a l'API
- 📊 Transparència: Headers informatius per al client
- 📝 Traçabilitat: Logging automàtic de cada bloqueig

**Data completat**: 6 de desembre de 2025

---

## ✅ 4. VALIDACIÓ DE LOGOUT - **COMPLETAT**

### Problema
El logout acceptava qualsevol string sense verificar si el token existeix a la base de dades o ja estava revocat. Això permetia fer logout amb tokens inventats sense cap error.

### Solució Implementada
Modificat `revokeToken()` per retornar boolean i validar al servei si el token existeix i no està revocat.

### Fitxers modificats
- ✅ `src/repositories/refreshTokenRepository.js` - Modificat revokeToken() per retornar boolean
- ✅ `src/services/authService.js` - Validar resposta i llançar NotFoundError si falla
- ✅ `src/utils/errors.js` - Traduït NotFoundError a català ("no trobat")

### Canvis implementats
**Repository** (`refreshTokenRepository.js`):
```javascript
async revokeToken(token) {
  const query = `
    UPDATE refresh_tokens
    SET revocat = true
    WHERE token = $1 AND revocat = false
    RETURNING id
  `;

  const result = await pool.query(query, [token]);
  return result.rowCount > 0;  // true si s'ha revocat, false si no existeix o ja estava revocat
}
```

**Service** (`authService.js`):
```javascript
async logout(refreshToken) {
  const revoked = await refreshTokenRepository.revokeToken(refreshToken);
  
  if (!revoked) {
    throw new NotFoundError('Token');  // 404: Token no trobat
  }
  
  return true;
}
```

### Tests realitzats
✅ Logout amb token vàlid → 200 Success amb "Logout correcte"  
✅ Logout amb token ja revocat → 404 amb "Token no trobat"  
✅ Logout amb token inventat → 404 amb "Token no trobat"  

### Beneficis aconseguits
- 🔒 Seguretat millorada: No es pot fer logout amb tokens falsos
- 🎯 Validació correcta: Només tokens vàlids i no revocats poden ser revocats
- 📊 Errors clars: Codi 404 amb missatge informatiu
- 🧹 Codi més net: WHERE revocat = false evita dobles revocacions
- 🌍 Missatges en català: NotFoundError ara retorna "no trobat"

**Data completat**: 6 de desembre de 2025

---

## ✅ 5. NETEJA AUTOMÀTICA DE TOKENS - **COMPLETAT**

### Problema
Tokens expirats i revocats s'acumulaven a la base de dades indefinidament. Sense mecanisme de neteja automàtica, la taula `refresh_tokens` creixeria constantment afectant el rendiment.

### Solució Implementada
```bash
npm install node-cron  # ✅ Instal·lat
```

Job automàtic amb `node-cron` que s'executa cada dia a les 3:00 AM i elimina tokens expirats o revocats.

### Fitxers creats/modificats
- ✅ `src/jobs/cleanupTokens.js` - Job amb node-cron i funció de neteja
- ✅ `src/server.js` - Integració del job (només en producció)

### Implementació
**Job de neteja** (`src/jobs/cleanupTokens.js`):
```javascript
export async function cleanupExpiredTokens() {
  const result = await pool.query(`
    DELETE FROM refresh_tokens
    WHERE expira_at < NOW() OR revocat = true
  `);
  
  console.log(`✅ Neteja completada: ${result.rowCount} tokens eliminats`);
  return result.rowCount;
}

export function startTokenCleanupJob() {
  cron.schedule('0 3 * * *', async () => {
    console.log('🧹 Iniciant neteja automàtica de tokens...');
    await cleanupExpiredTokens();
  });
}
```

**Integració al servidor** (`src/server.js`):
```javascript
if (process.env.NODE_ENV === 'production') {
  startTokenCleanupJob();
}
```

### Configuració
- **Schedule**: `'0 3 * * *'` (cada dia a les 3:00 AM)
- **Variables d'entorn**:
  - `CLEANUP_SCHEDULE` - Personalitzar horari (opcional)
  - `CLEANUP_ENABLED` - Activar/desactivar (opcional)
- **Execució manual**: `node --env-file=.env src/jobs/cleanupTokens.js --run-now`

### Tests realitzats
✅ Test amb 6 tokens (2 vàlids, 3 expirats, 2 revocats) → 4 eliminats  
✅ Només tokens vàlids i no revocats es mantenen a la BD  
✅ Execució manual funciona correctament  
✅ Log automàtic amb nombre de tokens eliminats  

### Beneficis aconseguits
- 🧹 Base de dades neta: Eliminació automàtica de tokens inútils
- ⚡ Millor rendiment: Menys registres = queries més ràpides
- 🔒 Seguretat: Tokens expirats/revocats desapareixen físicament
- ⏰ Automàtic: No cal intervenció manual
- 📊 Configurable: Horari personalitzable per variables d'entorn
- 🔧 Testing fàcil: Opció --run-now per executar manualment

**Data completat**: 6 de desembre de 2025

---

## ✅ 6. LOGGING ESTRUCTURAT - **COMPLETAT**

### Problema
Alguns fitxers encara utilitzaven `console.log/error` en lloc del logger estructurat (Pino), dificultant el filtrat i anàlisi de logs en producció.

### Solució Implementada
Substituïts tots els `console.log/error/warn` per crides al logger de Pino que ja estava implementat al projecte.

### Fitxers modificats
- ✅ `src/jobs/cleanupTokens.js` - 11 console.* substituïts per logger
- ✅ `src/server.js` - 1 console.error substituït per logger.error
- ✅ `src/middleware/errorHandler.js` - 1 console.error substituït per logError

### Canvis implementats
**ABANS** (console.log):
```javascript
console.log(`✅ Neteja completada: ${count} tokens eliminats`);
console.error('❌ Error en la neteja:', error.message);
```

**DESPRÉS** (Pino estructurat):
```javascript
logger.info({ tokensDeleted: count }, 'Neteja de tokens completada');
logger.error({ error: error.message, stack: error.stack }, 'Error en la neteja de tokens');
```

**Desenvolupament** (pino-pretty):
```
[02:20:44.044] INFO: Neteja de tokens completada
    tokensDeleted: 2
```

**Producció** (JSON):
```json
{"level":"info","time":"2025-12-06T02:20:44.044Z","tokensDeleted":2,"msg":"Neteja de tokens completada"}
```

### Logger ja implementat (Pino)
El projecte ja tenia **Pino** configurat correctament:
- ✅ Format JSON en producció (fàcil de parsejar)
- ✅ Format coloritzat en desenvolupament (pino-pretty)
- ✅ Nivells configurables: `LOG_LEVEL` (trace/debug/info/warn/error/fatal)
- ✅ Helpers: `logRequest()`, `logQuery()`, `logError()`
- ✅ Context automàtic: timestamps, nivells, metadata estructurada

### Tests realitzats
✅ Neteja manual amb logging estructurat: 2 tokens eliminats  
✅ Format correcte en desenvolupament (pino-pretty amb colors)  
✅ Metadata estructurada: `{ tokensDeleted: 2 }`  
✅ Cap `console.log` restant al codi (`grep` retorna 0 resultats)  

### Beneficis aconseguits
- 📊 **100% logging estructurat**: Tot el codi usa Pino
- 🔍 **Fàcil cerca**: Logs en JSON parseables
- 🎯 **Context ric**: Metadata estructurada (no strings concatenats)
- ⚡ **Millor rendiment**: Pino és 5-10x més ràpid que console.log
- 🎨 **Desenvolupament agradable**: pino-pretty amb colors
- 📈 **Integració externa**: Compatible amb ELK, Datadog, CloudWatch, etc.
- 🔧 **Filtrable**: Per nivell (info/error/warn) i per camp

**Data completat**: 6 de desembre de 2025

---

## ✅ 7. ACTUALITZAR .env.example - **COMPLETAT**

### Problema
El fitxer `.env.example` estava incomplet i sense documentació adequada. Faltaven variables noves (CLEANUP_*), comentaris explicatius i instruccions per configurar l'entorn.

### Solució Implementada
Creat un `.env.example` complet, ben documentat i organitzat per seccions amb comentaris detallats, exemples i instruccions de seguretat.

### Fitxers modificats
- ✅ `.env.example` - Reescrit completament amb documentació extensa
- ✅ `.env` - Corregit `JWT_EXPIRES_IN` → `JWT_ACCESS_EXPIRES_IN` i afegides variables noves

### Estructura del nou .env.example
```bash
# =============================================================================
# SERVEIS EXTRAORDINARIS - CONFIGURACIÓ D'ENTORN
# =============================================================================

# ENTORN D'EXECUCIÓ
NODE_ENV=development  # development | production | test

# SERVIDOR
PORT=5000
HOST=localhost  # 0.0.0.0 en producció

# BASE DE DADES
DB_HOST=localhost
DB_PORT=5432
DB_USER=serveis_user
DB_PASSWORD=ChangeMeInProduction!
DB_NAME=serveis_extraordinaris

# JWT
JWT_SECRET=your-secret-here  # openssl rand -base64 32
JWT_REFRESH_SECRET=your-refresh-secret-here
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:3000

# LOGGING
LOG_LEVEL=debug  # trace|debug|info|warn|error|fatal

# JOBS PROGRAMATS
CLEANUP_SCHEDULE=0 3 * * *  # Cada dia a les 3:00 AM
CLEANUP_ENABLED=true
```

### Variables afegides
1. **CLEANUP_SCHEDULE** - Horari del job de neteja (sintaxi cron)
2. **CLEANUP_ENABLED** - Activar/desactivar job de neteja

### Variables corregides
- **JWT_EXPIRES_IN** → **JWT_ACCESS_EXPIRES_IN** (nom correcte segons el codi)

### Millores implementades

**1. Organització per seccions:**
- Entorn d'execució
- Configuració del servidor
- Base de dades
- Autenticació JWT
- CORS
- Logging
- Jobs programats
- Notes addicionals

**2. Comentaris detallats:**
- Què fa cada variable
- Valors permesos
- Exemples realistes
- Recomanacions per producció

**3. Instruccions de seguretat:**
- Com generar secrets JWT: `openssl rand -base64 32`
- Warnings sobre contrasenyes
- Recordatoris de canviar valors en producció
- Guia de primer desplegament

**4. Exemples pràctics:**
- Format cron amb guia visual
- Múltiples origins per CORS
- Diferents configuracions development/production

**5. Documentació inline:**
```bash
# Horari del job de neteja de tokens expirats/revocats
# Format cron: minut hora dia mes dia_setmana
# 
# Exemples:
#   '0 3 * * *'    → Cada dia a les 3:00 AM (recomanat)
#   '0 */6 * * *'  → Cada 6 hores
#   '*/30 * * * *' → Cada 30 minuts (només per testing)
# 
# Guia ràpida:
#   ┌─────── minut (0-59)
#   │ ┌───── hora (0-23)
#   │ │ ┌─── dia del mes (1-31)
#   │ │ │ ┌─ mes (1-12)
#   │ │ │ │ ┌ dia de la setmana (0-7)
#   * * * * *
CLEANUP_SCHEDULE=0 3 * * *
```

### Beneficis aconseguits
- 📚 **Documentació viva**: El .env.example és documentació completa
- 🚀 **Onboarding ràpid**: Nous desenvolupadors configuren tot en 5 minuts
- 🔒 **Seguretat**: Warnings i instruccions eviten errors de configuració
- ✅ **Complet**: Totes les variables usades pel codi documentades
- 🎯 **Exemples**: Valors d'exemple realistes i funcionals
- 🛡️ **Millors pràctiques**: Guies de producció i seguretat
- 📄 **Mantenible**: Fàcil afegir noves variables seguint el format

**Data completat**: 6 de desembre de 2025

---

## 🟠 8. DOCUMENTACIÓ API (SWAGGER)

### Problema
No hi ha documentació interactiva de l'API.

### Solució
```bash
npm install swagger-jsdoc swagger-ui-express
```

### Fitxers a crear/modificar
- ✅ `src/config/swagger.js` - Configuració Swagger
- ✅ `src/app.js` - Registrar `/api-docs`
- ✅ `src/routes/authRoutes.js` - Afegir comentaris JSDoc

### Resultat
Documentació interactiva a `http://localhost:3000/api-docs`

### Codi complet
Veure secció "8. SWAGGER" al document de revisió.

---

## 🔴 9. TESTS UNITARIS

### Problema
No hi ha tests, dificultat per detectar regressions.

### Solució
```bash
npm install --save-dev jest supertest @types/jest
```

### Fitxers a crear/modificar
- ✅ `jest.config.js` - Configuració Jest
- ✅ `src/__tests__/auth.test.js` - Tests d'autenticació
- ✅ `package.json` - Scripts de test

### Tests a implementar
- Register: usuari nou, email duplicat, validació
- Login: credencials correctes, incorrectes
- Me: amb token, sense token
- Refresh: token vàlid, invàlid
- Logout: token vàlid, invàlid

### Codi complet
Veure secció "9. TESTS" al document de revisió.

---

## 🟠 10. CORS BEN CONFIGURAT

### Problema
CORS permet tots els origins, risc de seguretat.

### Solució
Configurar whitelist d'origins permesos.

### Fitxers a modificar
- ✅ `src/app.js` - CORS amb whitelist
- ✅ `.env` - Variable `ALLOWED_ORIGINS`

### Configuració
- Whitelist d'origins
- Permetre credentials (cookies)
- Mètodes permesos: GET, POST, PUT, DELETE, PATCH
- Headers permesos: Content-Type, Authorization

### Codi complet
Veure secció "10. CORS" al document de revisió.

---

## 🚀 INSTAL·LACIÓ RÀPIDA (TOT DE COP)

Quan vulguis implementar totes les millores:

```bash
cd backend

# Instal·lar dependencies
npm install express-validator express-rate-limit winston node-cron swagger-jsdoc swagger-ui-express

# Instal·lar dev dependencies
npm install --save-dev jest supertest @types/jest

# Crear estructura de carpetes
mkdir -p logs src/__tests__ src/jobs

# Executar tests
npm test
```

---

## 📝 ORDRE D'IMPLEMENTACIÓ RECOMANAT

### FASE 1: Seguretat (Alta prioritat)
1. ✅ **Validació d'input** (1-2 hores)
2. ✅ **Rate limiting** (30 minuts)
3. ✅ **CORS** (15 minuts)

### FASE 2: Mantenibilitat
4. ✅ **Gestió d'errors** (1 hora)
5. ✅ **Logging** (30 minuts)
6. ✅ **Validació logout** (15 minuts)

### FASE 3: Qualitat
7. ✅ **Tests unitaris** (2-3 hores)
8. ✅ **Documentació Swagger** (1 hora)

### FASE 4: Optimització
9. ✅ **Neteja automàtica tokens** (30 minuts)
10. ✅ **Actualitzar .env.example** (10 minuts)

**Total estimat**: 8-10 hores

---

## 📚 RECURSOS

### Documentació oficial
- [express-validator](https://express-validator.github.io/docs/)
- [express-rate-limit](https://github.com/express-rate-limit/express-rate-limit)
- [Winston](https://github.com/winstonjs/winston)
- [Jest](https://jestjs.io/)
- [Swagger](https://swagger.io/docs/)
- [node-cron](https://github.com/node-cron/node-cron)

### Bones pràctiques
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [REST API Best Practices](https://restfulapi.net/)

---

## ✅ CHECKLIST DE VERIFICACIÓ

Quan implementis una millora, marca-la:

- [ ] 1. Validació d'input
- [ ] 2. Gestió d'errors
- [ ] 3. Rate limiting
- [ ] 4. Validació logout
- [ ] 5. Neteja automàtica
- [ ] 6. Logging estructurat
- [ ] 7. .env.example actualitzat
- [ ] 8. Documentació Swagger
- [ ] 9. Tests unitaris
- [ ] 10. CORS configurat

---

## 💡 NOTES ADDICIONALS

### Desplegament a producció
Quan despleguis a Clouding, recorda:
- Generar nous JWT secrets
- Configurar ALLOWED_ORIGINS amb el domini real
- Activar jobs de neteja (node-cron)
- Configurar nivell de logging a 'info' o 'warn'
- Desactivar Swagger en producció (opcional)

### Backups
Els scripts de backup existents (`clouding/backup.sh`) són compatibles amb les millores.

### Monitorització
Considera afegir en el futur:
- Prometheus + Grafana
- PM2 per gestió de processos
- Health checks avançats

---

**Document creat**: 1 de desembre de 2025  
**Per**: Pau López (themacboy)  
**Projecte**: Serveis Extraordinaris - FASE 2  
**Estat**: ⏳ Pendent d'implementació gradual
