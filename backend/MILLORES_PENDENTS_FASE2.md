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
| 5 | Tokens expirats s'acumulen | 🟡 Baixa | ⏳ Pendent |
| 6 | Logging no estructurat | 🟡 Baixa | ⏳ Pendent |
| 7 | .env.example incomplet | 🟡 Baixa | ⏳ Pendent |
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

## 🟡 5. NETEJA AUTOMÀTICA DE TOKENS

### Problema
Tokens expirats s'acumulen a la BD indefinidament.

### Solució
```bash
npm install node-cron
```

### Fitxers a crear/modificar
- ✅ `src/jobs/cleanupTokens.js` - Job amb node-cron
- ✅ `src/server.js` - Iniciar job en producció

### Configuració
- Executar cada dia a les 3:00 AM
- Cridar `netejar_tokens_expirats()` de PostgreSQL

### Codi complet
Veure secció "5. NETEJA AUTOMÀTICA" al document de revisió.

---

## 🟡 6. LOGGING ESTRUCTURAT

### Problema
Logs amb `console.log`, difícils de filtrar i analitzar.

### Solució
```bash
npm install winston
```

### Fitxers a crear/modificar
- ✅ `src/utils/logger.js` - Logger amb Winston
- ✅ `.gitignore` - Afegir `logs/`
- ✅ Tots els controllers - Usar logger en lloc de console.log

### Configuració
- Logs a fitxers: `logs/error.log`, `logs/combined.log`
- Format JSON per producció
- Format coloritzat per desenvolupament

### Codi complet
Veure secció "6. LOGGING" al document de revisió.

---

## 🟡 7. ACTUALITZAR .env.example

### Problema
Fitxer .env.example incomplet, falten variables necessàries.

### Solució
Actualitzar amb totes les variables necessàries i comentaris explicatius.

### Variables a afegir
- `ALLOWED_ORIGINS` - Per CORS
- `LOG_LEVEL` - Per Winston
- Comentaris amb exemples

### Codi complet
Veure secció "7. .ENV.EXAMPLE" al document de revisió.

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
