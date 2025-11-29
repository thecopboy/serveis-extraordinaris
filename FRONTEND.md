# Frontend - Vanilla JavaScript + Web Components

Arquitectura frontend amb Vanilla JavaScript i Web Components natius (sense frameworks).

## 🎯 Filosofia

- **Zero dependències** de frameworks (React, Vue, Angular)
- **Web Components natius** per modularitat
- **ES6+ modules** per organització
- **CSS Variables** per temes
- **Service Worker** per PWA (opcional)
- **100% estàndards web**

## 📁 Estructura Proposada

```
frontend/
├── index.html                    # Punt d'entrada
├── manifest.json                 # PWA manifest
├── service-worker.js             # Cache i offline (opcional)
│
├── assets/
│   ├── css/
│   │   ├── reset.css            # CSS reset
│   │   ├── variables.css        # CSS variables (colors, fonts)
│   │   ├── global.css           # Estils globals
│   │   └── themes.css           # Temes (clar/fosc)
│   ├── icons/                   # Icones SVG
│   └── images/                  # Imatges
│
├── js/
│   ├── main.js                  # Inicialització aplicació
│   ├── router.js                # Router SPA
│   ├── api.js                   # Client API REST
│   ├── auth.js                  # Gestió autenticació JWT
│   ├── store.js                 # State management (Proxy)
│   └── utils.js                 # Utilitats
│
├── components/                   # Web Components
│   ├── base/
│   │   ├── app-header.js        # Header amb navegació
│   │   ├── app-footer.js        # Footer
│   │   ├── app-sidebar.js       # Sidebar/menú
│   │   └── app-modal.js         # Modal reutilitzable
│   │
│   ├── auth/
│   │   ├── login-form.js        # Formulari login
│   │   ├── register-form.js     # Formulari registre
│   │   └── session-list.js      # Llistat sessions actives
│   │
│   ├── serveis/
│   │   ├── servei-card.js       # Targeta servei
│   │   ├── servei-form.js       # Formulari crear/editar
│   │   ├── servei-list.js       # Llistat serveis
│   │   └── servei-calendar.js   # Calendari (opcional)
│   │
│   ├── tipus-servei/
│   │   ├── tipus-form.js        # Formulari tipus servei
│   │   └── tipus-list.js        # Llistat tipus
│   │
│   └── ui/
│       ├── loading-spinner.js   # Spinner càrrega
│       ├── toast-notification.js # Notificacions
│       ├── confirm-dialog.js    # Diàleg confirmació
│       └── date-picker.js       # Selector dates (opcional)
│
└── pages/                        # Pàgines/vistes
    ├── dashboard.js             # Dashboard principal
    ├── serveis.js               # Gestió serveis
    ├── tipus-servei.js          # Gestió tipus servei
    ├── perfil.js                # Perfil usuari
    ├── estadistiques.js         # Estadístiques/gràfics
    └── admin.js                 # Panel admin (si cal)
```

## 🧩 Exemple Web Component

### Component Base (`servei-card.js`)

```javascript
class ServeiCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  static get observedAttributes() {
    return ['servei-id', 'nom', 'hores', 'import'];
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this.render();
    }
  }

  get serveiData() {
    return {
      id: this.getAttribute('servei-id'),
      nom: this.getAttribute('nom'),
      hores: this.getAttribute('hores'),
      import: this.getAttribute('import'),
    };
  }

  render() {
    const { nom, hores, import: importTotal } = this.serveiData;

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 1rem;
          margin-bottom: 1rem;
          background: var(--card-bg);
          transition: transform 0.2s;
        }

        :host(:hover) {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }

        .header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.5rem;
        }

        .title {
          font-size: 1.2rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .stats {
          display: flex;
          gap: 1rem;
          color: var(--text-secondary);
        }

        .actions {
          margin-top: 1rem;
          display: flex;
          gap: 0.5rem;
        }

        button {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.9rem;
        }

        .btn-edit {
          background: var(--primary-color);
          color: white;
        }

        .btn-delete {
          background: var(--danger-color);
          color: white;
        }
      </style>

      <div class="header">
        <span class="title">${nom}</span>
      </div>

      <div class="stats">
        ${hores ? `<span>⏱️ ${hores}h</span>` : ''}
        ${importTotal ? `<span>💰 ${importTotal}€</span>` : ''}
      </div>

      <div class="actions">
        <button class="btn-edit">Editar</button>
        <button class="btn-delete">Eliminar</button>
      </div>
    `;

    // Event listeners
    this.shadowRoot.querySelector('.btn-edit').addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('edit', { 
        detail: this.serveiData,
        bubbles: true,
        composed: true 
      }));
    });

    this.shadowRoot.querySelector('.btn-delete').addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('delete', { 
        detail: this.serveiData,
        bubbles: true,
        composed: true 
      }));
    });
  }
}

customElements.define('servei-card', ServeiCard);
```

### Ús del Component

```html
<servei-card 
  servei-id="1"
  nom="Guàrdia Nocturna"
  hores="8.5"
  import="170"
></servei-card>

<script>
document.querySelector('servei-card').addEventListener('edit', (e) => {
  console.log('Editar servei:', e.detail);
});
</script>
```

## 🔄 Router SPA (`router.js`)

```javascript
class Router {
  constructor(routes) {
    this.routes = routes;
    this.currentRoute = null;
    
    window.addEventListener('popstate', () => this.handleRoute());
    document.addEventListener('click', (e) => {
      if (e.target.matches('[data-link]')) {
        e.preventDefault();
        this.navigate(e.target.getAttribute('href'));
      }
    });
    
    this.handleRoute();
  }

  navigate(path) {
    window.history.pushState(null, null, path);
    this.handleRoute();
  }

  async handleRoute() {
    const path = window.location.pathname;
    const route = this.routes.find(r => r.path === path) || this.routes[0];
    
    if (route.auth && !auth.isAuthenticated()) {
      this.navigate('/login');
      return;
    }

    this.currentRoute = route;
    const outlet = document.querySelector('#app');
    outlet.innerHTML = '';
    
    if (route.component) {
      const component = new route.component();
      outlet.appendChild(component);
    }
  }
}

// Exemple d'ús
const routes = [
  { path: '/', component: DashboardPage, auth: true },
  { path: '/serveis', component: ServeisPage, auth: true },
  { path: '/login', component: LoginPage, auth: false },
];

const router = new Router(routes);
```

## 🔌 Client API (`api.js`)

```javascript
class ApiClient {
  constructor(baseURL) {
    this.baseURL = baseURL;
  }

  async request(endpoint, options = {}) {
    const token = localStorage.getItem('access_token');
    
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, config);
      
      if (response.status === 401) {
        // Token expirat, intentar refresh
        const refreshed = await this.refreshToken();
        if (refreshed) {
          return this.request(endpoint, options);
        } else {
          auth.logout();
          router.navigate('/login');
          throw new Error('Session expired');
        }
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  async refreshToken() {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) return false;

    try {
      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (response.ok) {
        const { access_token } = await response.json();
        localStorage.setItem('access_token', access_token);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  // Mètodes REST
  get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}

const api = new ApiClient('/api');
export default api;
```

## 💾 State Management (`store.js`)

```javascript
class Store {
  constructor(initialState = {}) {
    this.state = new Proxy(initialState, {
      set: (target, property, value) => {
        target[property] = value;
        this.notify(property, value);
        return true;
      },
    });
    this.subscribers = new Map();
  }

  subscribe(property, callback) {
    if (!this.subscribers.has(property)) {
      this.subscribers.set(property, []);
    }
    this.subscribers.get(property).push(callback);

    // Retornar funció per unsubscribe
    return () => {
      const callbacks = this.subscribers.get(property);
      const index = callbacks.indexOf(callback);
      if (index > -1) callbacks.splice(index, 1);
    };
  }

  notify(property, value) {
    if (this.subscribers.has(property)) {
      this.subscribers.get(property).forEach(callback => callback(value));
    }
  }

  setState(updates) {
    Object.assign(this.state, updates);
  }

  getState() {
    return { ...this.state };
  }
}

// Store global
const store = new Store({
  user: null,
  serveis: [],
  tipusServei: [],
  loading: false,
});

export default store;
```

## 🎨 CSS Variables (`variables.css`)

```css
:root {
  /* Colors */
  --primary-color: #3B82F6;
  --secondary-color: #8B5CF6;
  --success-color: #10B981;
  --danger-color: #EF4444;
  --warning-color: #F59E0B;
  
  /* Text */
  --text-primary: #1F2937;
  --text-secondary: #6B7280;
  --text-disabled: #9CA3AF;
  
  /* Background */
  --bg-primary: #FFFFFF;
  --bg-secondary: #F9FAFB;
  --bg-tertiary: #F3F4F6;
  
  /* Borders */
  --border-color: #E5E7EB;
  --border-radius: 8px;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
  --shadow-md: 0 4px 6px rgba(0,0,0,0.1);
  --shadow-lg: 0 10px 15px rgba(0,0,0,0.1);
  
  /* Spacing */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  
  /* Typography */
  --font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  --font-size-2xl: 1.5rem;
}

/* Tema fosc */
[data-theme="fosc"] {
  --text-primary: #F9FAFB;
  --text-secondary: #D1D5DB;
  --bg-primary: #1F2937;
  --bg-secondary: #111827;
  --bg-tertiary: #374151;
  --border-color: #4B5563;
}
```

## 📦 HTML Base (`index.html`)

```html
<!DOCTYPE html>
<html lang="ca">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Serveis Extraordinaris</title>
  
  <link rel="manifest" href="/manifest.json">
  <link rel="icon" type="image/svg+xml" href="/assets/icons/favicon.svg">
  
  <link rel="stylesheet" href="/assets/css/reset.css">
  <link rel="stylesheet" href="/assets/css/variables.css">
  <link rel="stylesheet" href="/assets/css/global.css">
  <link rel="stylesheet" href="/assets/css/themes.css">
  
  <script type="module" src="/js/main.js"></script>
</head>
<body>
  <app-header></app-header>
  
  <main id="app">
    <!-- Router outlet -->
  </main>
  
  <app-footer></app-footer>
  
  <!-- Toast notifications -->
  <div id="toast-container"></div>
</body>
</html>
```

## 🚀 Avantatges d'aquesta Arquitectura

✅ **Zero build step** (opcional, pots afegir esbuild si vols)
✅ **Ràpid i lleuger** (pocs KB de JS)
✅ **Estàndards web** (funciona a tots els navegadors moderns)
✅ **Modular** (Web Components reutilitzables)
✅ **Escalable** (fàcil afegir components)
✅ **PWA ready** (Service Worker + Manifest)
✅ **SEO-friendly** (amb SSR mínim si cal)

## 📝 To-Do Frontend

- [ ] Crear estructura de carpetes
- [ ] Implementar router SPA
- [ ] Crear client API amb refresh token
- [ ] Implementar Web Components base (header, footer, modal)
- [ ] Crear components de serveis
- [ ] Implementar autenticació JWT
- [ ] Afegir state management
- [ ] Crear sistema de notificacions (toast)
- [ ] Implementar temes (clar/fosc)
- [ ] Afegir gràfics/estadístiques (Chart.js o canvas natiu)
- [ ] PWA: Service Worker + Manifest
- [ ] Tests amb Web Test Runner

---

**Sense frameworks, sense complicacions, 100% web estàndard! 🎯**
