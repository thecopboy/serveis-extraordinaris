# 🔧 MILLORES PENDENTS - FASE 2: Autenticació JWT

**Data**: 1 de desembre de 2025  
**Estat**: Pendent d'implementació

---

## 📋 RESUM D'ERRORS I MANCANCES DETECTADES

| # | Problema | Severitat | Estat |
|---|----------|-----------|-------|
| 1 | Validació d'input inexistent | 🔴 Alta | ⏳ Pendent |
| 2 | Gestió d'errors inconsistent | 🟠 Mitjana | ⏳ Pendent |
| 3 | Manca rate limiting | 🔴 Alta | ⏳ Pendent |
| 4 | Logout no valida token | 🟠 Mitjana | ⏳ Pendent |
| 5 | Tokens expirats s'acumulen | 🟡 Baixa | ⏳ Pendent |
| 6 | Logging no estructurat | 🟡 Baixa | ⏳ Pendent |
| 7 | .env.example incomplet | 🟡 Baixa | ⏳ Pendent |
| 8 | Manca documentació API | 🟠 Mitjana | ⏳ Pendent |
| 9 | Sense tests unitaris | 🔴 Alta | ⏳ Pendent |
| 10 | CORS mal configurat | 🟠 Mitjana | ⏳ Pendent |

---

## 🔴 1. VALIDACIÓ D'INPUT

### Problema
Cap endpoint valida les dades d'entrada. Risc d'injeccions SQL, dades inconsistents i crashes.

### Solució
```bash
npm install express-validator
```

### Fitxers a crear/modificar
- ✅ `src/middleware/validators.js` - Validadors per cada endpoint
- ✅ `src/routes/authRoutes.js` - Afegir validadors a les rutes

### Validacions necessàries
- **Register**: nom, email (format), password (min 8 chars, complexitat), rol
- **Login**: email, password obligatoris
- **Refresh**: refreshToken format JWT

### Codi complet
Veure secció "1. VALIDACIÓ D'INPUT" al document de revisió.

---

## 🔴 2. GESTIÓ D'ERRORS CENTRALITZADA

### Problema
Errors gestionats diferent a cada capa, dificultat per debugar.

### Solució
Crear middleware `errorHandler` que gestioni tots els errors de manera consistent.

### Fitxers a crear/modificar
- ✅ `src/middleware/errorHandler.js` - Middleware centralitzat
- ✅ `src/app.js` - Registrar errorHandler al final
- ✅ Tots els controllers - Usar `next(error)` en lloc de `res.status().json()`

### Errors a gestionar
- JWT errors (TokenExpiredError, JsonWebTokenError)
- BD errors (23505 - unique constraint)
- Errors de negoci (EMAIL_ALREADY_EXISTS, INVALID_CREDENTIALS)
- Errors genèrics (500)

### Codi complet
Veure secció "2. GESTIÓ D'ERRORS" al document de revisió.

---

## 🔴 3. RATE LIMITING

### Problema
No hi ha protecció contra brute force attacks al login/register.

### Solució
```bash
npm install express-rate-limit
```

### Fitxers a crear/modificar
- ✅ `src/middleware/rateLimiter.js` - 3 rate limiters
  - `loginLimiter`: 5 intents / 15 minuts
  - `registerLimiter`: 3 registres / 1 hora
  - `apiLimiter`: 100 peticions / 15 minuts
- ✅ `src/routes/authRoutes.js` - Afegir limiters
- ✅ `src/app.js` - Rate limiter global

### Codi complet
Veure secció "3. RATE LIMITING" al document de revisió.

---

## 🟠 4. VALIDACIÓ DE LOGOUT

### Problema
El logout accepta qualsevol string sense verificar si el token existeix.

### Solució
Modificar `revokeToken()` per retornar `boolean` i validar al controller.

### Fitxers a modificar
- ✅ `src/repositories/refreshTokenRepository.js` - Retornar boolean
- ✅ `src/controllers/authController.js` - Validar resposta

### Codi complet
Veure secció "4. VALIDACIÓ DE LOGOUT" al document de revisió.

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
