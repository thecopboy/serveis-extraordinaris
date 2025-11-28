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

## Fases d'Implementació (Proposta)

### Fase 1: MVP (Producte Mínim Viable)
- [ ] Autenticació bàsica
- [ ] CRUD de serveis extraordinaris
- [ ] Tipus de serveis predefinits
- [ ] Consulta mensual simple
- [ ] Càlculs bàsics

### Fase 2: Funcionalitats Avançades
- [ ] Factors multiplicadors configurables
- [ ] Consultes personalitzades
- [ ] Generació de reports PDF
- [ ] Dashboard amb gràfiques

### Fase 3: Optimitzacions
- [ ] Export a Excel/CSV
- [ ] Notificacions
- [ ] Gestió avançada d'usuaris
- [ ] Auditoria de canvis

---

## Notes i Decisions Pendents

- [ ] Definir si Node.js o Python per al backend
- [ ] Seleccionar base de dades específica
- [ ] Decidir entre REST o GraphQL
- [ ] Definir estratègia d'autenticació (JWT, sessions, OAuth)
- [ ] Determinar llibreries per generació de PDFs
- [ ] Planificar estructura de carpetes del projecte
- [ ] Definir convencions de codi i estils

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

## Decisions Tècniques Recomanades

### Stack Proposat (Pendent de confirmació)

#### Frontend
- Vanilla JavaScript (ES6+)
- Web Components (natiu)
- CSS Variables per temes
- Fetch API per HTTP
- LocalStorage per cache (opcional)

#### Backend (Recomanació: Node.js)
- **Node.js + Express** (familiar si coneixes JS)
  - Ecosistema ampli de llibreries
  - Mateixa sintaxi que frontend
  - Bon rendiment per I/O
- **Alternatives**: Python + FastAPI/Flask

#### Base de Dades (Recomanació: PostgreSQL)
- PostgreSQL 15+ amb auto-hosting
- ORM: Sequelize (Node.js) o Prisma
- Migracions automàtiques

#### API (Recomanació: REST)
- **REST** per simplicitat i estandardització
- Versionat d'API (/api/v1/)
- Documentació amb Swagger/OpenAPI

#### Autenticació (Recomanació: JWT)
- JWT per tokens
- HttpOnly cookies per refresh tokens
- Expiració curta (15-30 min) per access tokens

---

## Notes i Decisions Pendents

### A Decidir Properament
- [ ] Confirmar Node.js vs Python per al backend
- [ ] Confirmar PostgreSQL com a base de dades
- [ ] Decidir si utilitzar un ORM o SQL directe
- [ ] Seleccionar llibreria per generació de PDFs (jsPDF, PDFKit, etc.)
- [ ] Decidir si utilitzar build tool (Vite recomanat) o servir fitxers estàtics
- [ ] Definir estratègia de deploy (Docker, VPS, etc.)
- [ ] Determinar si implementar PWA des de l'inici o més endavant

### Opcionals per Discutir
- [ ] Mode fosc/clar
- [ ] Funcionalitat offline (PWA)
- [ ] Notificacions push
- [ ] CI/CD automàtic
- [ ] Dockerització del projecte
- [ ] Tests automatitzats des de l'inici

---

**Data de creació**: 28 de novembre de 2025  
**Última actualització**: 28 de novembre de 2025
