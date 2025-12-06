# 📚 Documentació API amb Swagger

## Accés a la documentació

Un cop el servidor estigui en marxa, pots accedir a la documentació interactiva de l'API a:

**URL**: [http://localhost:5000/api-docs](http://localhost:5000/api-docs)

## Característiques

### 🎯 Interfície interactiva
- **Try it out**: Prova cada endpoint directament des del navegador
- **Autenticació**: Botó "Authorize" per afegir el Bearer Token
- **Exemples**: Cada endpoint té exemples de request i response
- **Validació**: Veus els tipus de dades i validacions requerides

### 📖 Endpoints documentats

#### 🔓 Públics (sense autenticació)
- **POST /auth/register** - Crear nou compte
- **POST /auth/login** - Iniciar sessió
- **POST /auth/refresh** - Renovar access token
- **POST /auth/logout** - Tancar sessió

#### 🔒 Privats (requereixen Bearer Token)
- **POST /auth/logout-all** - Tancar sessió a tots els dispositius
- **GET /auth/me** - Obtenir perfil de l'usuari

### 🔐 Com autenticar-se

1. Fes login amb **POST /auth/login** (prova "Try it out")
2. Copia el `accessToken` de la resposta
3. Clica el botó **"Authorize"** a dalt a la dreta
4. Enganxa el token (sense "Bearer", només el token)
5. Clica "Authorize" i ja pots provar endpoints privats

### 📝 Exemples de peticions

#### Register
```json
{
  "email": "usuari@example.com",
  "password": "Password123!",
  "nom": "Joan",
  "cognom_1": "Garcia",
  "rol": "usuari"
}
```

#### Login
```json
{
  "email": "usuari@example.com",
  "password": "Password123!"
}
```

#### Refresh
```json
{
  "refreshToken": "a1b2c3d4e5f6g7h8i9j0..."
}
```

### 🎨 Personalització

La interfície està personalitzada amb:
- Títol: "Serveis Extraordinaris API"
- Barra superior oculta (més espai per l'API)
- Esquemes de dades reutilitzables
- Tags per organitzar endpoints

### 🚀 Configuració

El Swagger està configurat a `src/config/swagger.js` amb:
- **OpenAPI 3.0.0**
- Dos servidors (desenvolupament i producció)
- Esquemes de seguretat (Bearer JWT)
- Esquemes de dades reutilitzables
- Tags per organització

Les anotacions JSDoc estan a `src/routes/authRoutes.js`.

### 📦 Dependencies

```json
{
  "swagger-jsdoc": "^7.0.1",
  "swagger-ui-express": "^5.0.1"
}
```

### 🔧 Manteniment

Per afegir nous endpoints:

1. Afegir anotació `@swagger` al fitxer de rutes
2. Seguir el format OpenAPI 3.0
3. Reutilitzar esquemes de `swagger.js`
4. Especificar tags, security i responses

Exemple:
```javascript
/**
 * @swagger
 * /nou-endpoint:
 *   post:
 *     summary: Descripció breu
 *     description: Descripció detallada
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NomEsquema'
 *     responses:
 *       200:
 *         description: Resposta exitosa
 */
```

### 🌐 Producció

En producció, pots:
- **Mantenir Swagger**: Útil per desenvolupadors frontend
- **Desactivar Swagger**: Si la documentació és només interna

Per desactivar en producció, modifica `src/app.js`:
```javascript
if (config.node.env !== 'production') {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}
```

### 📊 Beneficis

✅ Documentació sempre actualitzada (està al codi)  
✅ Testing interactiu sense Postman  
✅ Onboarding ràpid per nous desenvolupadors  
✅ Contracte clar entre frontend i backend  
✅ Validacions visibles i explícites  

---

**Creat**: 6 de desembre de 2025  
**Per**: Pau López (themacboy)  
**Millora**: #8 - Documentació API amb Swagger
