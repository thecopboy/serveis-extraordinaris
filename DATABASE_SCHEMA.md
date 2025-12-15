# Esquema de Base de Dades - Sistema de Gestió de Serveis Extraordinaris

## Base de Dades: PostgreSQL

---

## Taules i Relacions

### 1. `users` (Usuaris)

Emmagatzema la informació dels usuaris del sistema.

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    
    -- Dades personals
    nom VARCHAR(100) NOT NULL,
    cognom_1 VARCHAR(100) NOT NULL,
    cognom_2 VARCHAR(100),
    pseudonim VARCHAR(50) UNIQUE,
    
    -- Dades professionals
    numero_professional VARCHAR(50) NOT NULL, -- No és únic (diferents empreses poden tenir números iguals)
    departament VARCHAR(100), -- Opcional
    
    -- Autenticació
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    telefon VARCHAR(20), -- Opcional, per recuperació de compte
    
    -- Autorització i estat
    rol VARCHAR(50) NOT NULL DEFAULT 'user', -- 'admin', 'user', 'supervisor'
    actiu BOOLEAN NOT NULL DEFAULT true, -- Necessari per desactivar comptes
    
    -- Preferències d'interfície
    tema VARCHAR(20) DEFAULT 'clar', -- 'clar', 'fosc', 'auto'
    idioma VARCHAR(5) DEFAULT 'ca', -- 'ca', 'es', 'en'
    timezone VARCHAR(50) DEFAULT 'Europe/Madrid',
    
    -- Preferències de notificacions
    notificacions_email BOOLEAN DEFAULT true,
    notificacions_push BOOLEAN DEFAULT false,
    
    -- Preferències de visualització
    format_data VARCHAR(20) DEFAULT 'DD/MM/YYYY',
    format_hora VARCHAR(10) DEFAULT '24h', -- '24h' o '12h'
    
    -- Dates i tracking
    data_registre_inicial TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_ultima_connexio TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_numero_professional ON users(numero_professional);
CREATE INDEX idx_users_pseudonim ON users(pseudonim);
CREATE INDEX idx_users_rol ON users(rol);
CREATE INDEX idx_users_actiu ON users(actiu);
```

**Camps:**
- `id`: Identificador únic
- `nom`: Nom de l'usuari
- `cognom_1`: Primer cognom
- `cognom_2`: Segon cognom (opcional)
- `pseudonim`: Nom que es mostra a la interfície (únic, opcional)
- `numero_professional`: Identificador professional (NO únic, diferents empreses poden tenir números iguals)
- `departament`: Departament on treballa (opcional)
- `email`: Correu electrònic (únic, serveix per login)
- `password_hash`: Hash bcrypt de la contrasenya
- `telefon`: Telèfon de contacte (opcional, per recuperació de compte)
- `rol`: Tipus d'usuari (admin, user, supervisor)
- `actiu`: Si l'usuari està actiu o desactivat (necessari)
- `tema`: Tema de la interfície (clar, fosc, auto)
- `idioma`: Idioma de la interfície (ca, es, en)
- `timezone`: Zona horària de l'usuari
- `notificacions_email`: Si vol rebre notificacions per email
- `notificacions_push`: Si vol rebre notificacions push
- `format_data`: Format de visualització de dates
- `format_hora`: Format d'hora (24h o 12h)
- `data_registre_inicial`: Data de creació del compte
- `data_ultima_connexio`: Data de últim accés
- `updated_at`: Data de última modificació

---

### 2. `empreses` (Historial d'Empreses)

Registre de les empreses on ha treballat o treballa cada usuari, amb dates d'inici i fi. Permet múltiples empreses actives simultàniament.

```sql
CREATE TABLE empreses (
    id SERIAL PRIMARY KEY,
    usuari_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Informació bàsica
    nom VARCHAR(255) NOT NULL,
    cif VARCHAR(20),
    adreca TEXT,
    telefon VARCHAR(20),
    email VARCHAR(255),
    
    -- Dates de relació laboral
    data_inici DATE NOT NULL DEFAULT CURRENT_DATE, -- Data d'incorporació (obligatori, per defecte data actual)
    data_fi DATE, -- Data de sortida (NULL si encara hi treballa)
    
    -- Metadades
    observacions TEXT, -- Notes addicionals
    actiu BOOLEAN DEFAULT true, -- Soft delete
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Restriccions
    CONSTRAINT data_fi_posterior CHECK (data_fi IS NULL OR data_fi >= data_inici),
    CONSTRAINT email_valid CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

CREATE INDEX idx_empreses_usuari ON empreses(usuari_id);
CREATE INDEX idx_empreses_usuari_actives ON empreses(usuari_id, data_fi) WHERE data_fi IS NULL;
CREATE INDEX idx_empreses_dates ON empreses(data_inici, data_fi);
CREATE INDEX idx_empreses_actiu ON empreses(actiu);
```

**Camps:**
- `id`: Identificador únic
- `usuari_id`: Usuari propietari del registre
- `nom`: Nom de l'empresa
- `cif`: CIF de l'empresa (opcional)
- `adreca`: Adreça de l'empresa (opcional)
- `telefon`: Telèfon de contacte (opcional)
- `email`: Email de contacte (opcional)
- `data_inici`: Data d'incorporació (obligatori, per defecte la data actual)
- `data_fi`: Data de sortida (NULL si encara hi treballa)
- `observacions`: Notes addicionals sobre la relació laboral
- `actiu`: Control de soft delete (false amaga l'empresa sense perdre l'històric)
- `created_at`: Data de creació del registre
- `updated_at`: Data d'última modificació

**Funcionalitats:**
- Permet tenir un historial complet d'empreses amb dates
- **Multi-empresa simultània**: Pot haver múltiples empreses amb data_fi = NULL (treballador pluriempleado)
- Informació de contacte completa (CIF, adreça, telèfon, email)
- Si `data_fi` és NULL, significa que encara hi treballa
- `data_inici` és obligatori i per defecte s'assigna la data actual
- Soft delete amb camp `actiu` per amagar empreses sense perdre l'històric

---

### 3. `refresh_tokens` (Tokens de Sessió JWT)

Gestió de múltiples sessions actives per usuari (mòbil, ordinador casa, feina, etc.).

```sql
CREATE TABLE refresh_tokens (
    id SERIAL PRIMARY KEY,
    usuari_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    
    -- Informació del dispositiu/sessió
    dispositiu VARCHAR(100), -- Ex: "Chrome - Windows 10", "Safari - iPhone 13"
    ip_address INET,
    user_agent TEXT,
    
    -- Control de tokens
    expira_at TIMESTAMP NOT NULL,
    usat BOOLEAN DEFAULT false, -- Si ja s'ha usat per renovar (opcional, per seguretat extra)
    revocat BOOLEAN DEFAULT false, -- Per tancar sessions remotament
    
    creat_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    usat_at TIMESTAMP, -- Última vegada que s'ha usat
    
    CONSTRAINT expira_futur CHECK (expira_at > creat_at)
);

CREATE INDEX idx_refresh_tokens_usuari ON refresh_tokens(usuari_id);
CREATE INDEX idx_refresh_tokens_hash ON refresh_tokens(token_hash);
CREATE INDEX idx_refresh_tokens_expira ON refresh_tokens(expira_at);
CREATE INDEX idx_refresh_tokens_actius ON refresh_tokens(usuari_id, revocat, expira_at) 
    WHERE revocat = false AND expira_at > CURRENT_TIMESTAMP;
```

**Camps:**
- `id`: Identificador únic
- `usuari_id`: Usuari propietari del token
- `token_hash`: Hash del refresh token (mai es guarda el token en clar)
- `dispositiu`: Descripció del dispositiu (generat pel frontend)
- `ip_address`: IP des d'on es va crear la sessió
- `user_agent`: Informació del navegador/app
- `expira_at`: Data d'expiració del token (típicament 7-30 dies)
- `usat`: Si el token ja s'ha utilitzat per renovar (seguretat extra)
- `revocat`: Per tancar la sessió remotament
- `creat_at`: Data de creació del token
- `usat_at`: Última vegada que s'ha usat per renovar access token

**Funcionalitats:**
- Permet múltiples sessions simultànies per usuari
- Permet veure sessions actives ("On estic connectat")
- Permet tancar sessions individuals o totes alhora
- Neteja automàtica de tokens expirats (via cron job)

---

### 4. `tipus_servei` (Tipus de Serveis)

Defineix els diferents tipus de serveis extraordinaris que cada usuari/empresa pot configurar.

```sql
CREATE TABLE tipus_servei (
    id SERIAL PRIMARY KEY,
    usuari_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- Cada usuari pot definir els seus tipus
    empresa_id INTEGER NOT NULL REFERENCES historial_empreses(id) ON DELETE CASCADE, -- Opcional: associar a una empresa específica
    
    -- Identificació del servei
    nom VARCHAR(100) NOT NULL,
    abreviatura VARCHAR(10) NOT NULL, -- Obligatori: Ex: "GN" per Guàrdia Nocturna
    descripcio TEXT,
    
    -- Tipus de remuneració
    tipus_remuneracio VARCHAR(20) NOT NULL, -- 'diners', 'hores'
    tarifa_base DECIMAL(10, 2), -- Per serveis amb diners (€/hora)
    hores_equivalents DECIMAL(5, 2), -- Per serveis amb hores (ex: 1.5h per cada 1h treballada)
    factor_multiplicador DECIMAL(5, 2) NOT NULL DEFAULT 1.00, -- Factor per defecte a aplicar (1.0 = sense increment)
    
    -- Configuració d'horari (opcional)
    hora_inici_proposada TIME, -- Hora d'inici proposada per aquest tipus de servei
    hora_fi_proposada TIME, -- Hora de fi proposada
    es_festiu BOOLEAN DEFAULT false, -- Si aquest servei es considera festiu
    
    -- Visualització (opcionals)
    color VARCHAR(7), -- Color hex per visualització (#FF5733)
    icona VARCHAR(10), -- Emoji unicode (opcional): Ex: "🌙", "☀️", "📚"
    
    -- Control
    actiu BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT tipus_remuneracio_valid CHECK (tipus_remuneracio IN ('diners', 'hores')),
    CONSTRAINT tarifa_o_hores CHECK (
        (tipus_remuneracio = 'diners' AND tarifa_base IS NOT NULL AND hores_equivalents IS NULL) OR
        (tipus_remuneracio = 'hores' AND hores_equivalents IS NOT NULL AND tarifa_base IS NULL)
    ),
    CONSTRAINT hora_fi_posterior CHECK (
        hora_inici_proposada IS NULL OR hora_fi_proposada IS NULL OR 
        hora_fi_proposada > hora_inici_proposada
    ),
    CONSTRAINT factor_multiplicador_positiu CHECK (factor_multiplicador > 0)
);

CREATE INDEX idx_tipus_servei_usuari ON tipus_servei(usuari_id);
CREATE INDEX idx_tipus_servei_empresa ON tipus_servei(empresa_id);
CREATE INDEX idx_tipus_servei_actiu ON tipus_servei(usuari_id, actiu);
CREATE INDEX idx_tipus_servei_tipus ON tipus_servei(tipus_remuneracio);
CREATE INDEX idx_tipus_servei_abreviatura ON tipus_servei(usuari_id, abreviatura);
```

**Camps:**
- `id`: Identificador únic
- `usuari_id`: Usuari propietari del tipus de servei (cada usuari pot definir els seus)
- `empresa_id`: Empresa associada (opcional, per filtrar per empresa si cal)
- `nom`: Nom del tipus de servei (ex: "Guàrdia nocturna", "Suport cap de setmana")
- `abreviatura`: Codi curt obligatori (ex: "GN", "SCM", "FORM")
- `descripcio`: Descripció detallada (opcional)
- `tipus_remuneracio`: Com es remunerarà aquest tipus de servei → 'diners' (només pagament monetari) o 'hores' (només compensació amb temps)
- `tarifa_base`: Import per hora (només si tipus_remuneracio='diners')
- `hores_equivalents`: Factor d'hores (només si tipus_remuneracio='hores', ex: 1.5 = cada hora treballada compta com 1.5h)
- `factor_multiplicador`: Factor per defecte a aplicar (1.0 = sense increment, 1.5 = +50%, 2.0 = +100%)
- `hora_inici_proposada`: Hora d'inici suggerida per aquest servei (opcional)
- `hora_fi_proposada`: Hora de fi suggerida per aquest servei (opcional)
- `es_festiu`: Si aquest tipus de servei es considera festiu per defecte
- `color`: Color hex per visualització al calendari/gràfics (opcional)
- `icona`: Emoji unicode representatiu (opcional, ex: "🌙", "☀️", "📚")
- `actiu`: Si està disponible per utilitzar

**Funcionalitats:**
- Cada usuari pot crear i gestionar els seus propis tipus de servei
- Es poden associar a empreses específiques (opcional)
- Horaris proposats per facilitar la introducció de serveis
- Camp `es_festiu` per identificar ràpidament serveis festius

---

### 5. `serveis` (Registre de Serveis Extraordinaris)

Registre principal dels serveis extraordinaris realitzats pels usuaris.

**Diferència entre `tipus_remuneracio` i `tipus_retorn`:**
- **`tipus_remuneracio`** (a `tipus_servei`): Defineix COM es pot remunerar aquest tipus de servei específic
  - Si és 'diners': Aquest tipus de servei té tarifa monetària (€/hora) i es pot pagar amb diners O compensar amb hores
  - Si és 'hores': Aquest tipus de servei NOMÉS es pot compensar amb temps lliure (no hi ha opció de pagament monetari)
- **`tipus_retorn`** (a `serveis`): L'usuari escull com vol cobrar aquest servei concret
  - Si tipus_servei.tipus_remuneracio='hores' → només pot ser 'hores'
  - Si tipus_servei.tipus_remuneracio='diners' → pot escollir 'diners' O 'hores'

```sql
CREATE TABLE serveis (
    id SERIAL PRIMARY KEY,
    usuari_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tipus_servei_id INTEGER NOT NULL REFERENCES tipus_servei(id) ON DELETE RESTRICT,
    
    -- Dates i duració
    data_inici TIMESTAMP NOT NULL,
    data_fi TIMESTAMP NOT NULL,
    durada_hores DECIMAL(5, 2) NOT NULL, -- Calculat automàticament (data_fi - data_inici)
    
    -- Tipus de retorn del servei
    tipus_retorn VARCHAR(20) NOT NULL, -- 'diners' o 'hores'
    
    -- Estat del servei
    estat VARCHAR(20) NOT NULL DEFAULT 'pendent', -- 'pendent', 'pagat', 'compensat'
    
    -- Càlculs finals (calculats automàticament segons tipus_servei)
    hores_totals DECIMAL(5, 2), -- Hores amb factors del tipus_servei aplicats
    import_total DECIMAL(10, 2), -- Import amb factors aplicats (si tipus_retorn és 'diners')
    
    -- Observacions
    observacions TEXT,
    
    -- Control de modificacions
    modificat BOOLEAN NOT NULL DEFAULT false,
    modificat_at TIMESTAMP,
    
    -- Auditoria
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT data_fi_posterior CHECK (data_fi > data_inici),
    CONSTRAINT durada_positiva CHECK (durada_hores > 0),
    CONSTRAINT tipus_retorn_valid CHECK (tipus_retorn IN ('diners', 'hores')),
    CONSTRAINT estat_valid CHECK (estat IN ('pendent', 'pagat', 'compensat')),
    CONSTRAINT estat_coherent_amb_tipus CHECK (
        (tipus_retorn = 'diners' AND estat IN ('pendent', 'pagat')) OR
        (tipus_retorn = 'hores' AND estat IN ('pendent', 'compensat'))
    ),
    CONSTRAINT modificat_at_si_modificat CHECK (
        (modificat = false AND modificat_at IS NULL) OR
        (modificat = true AND modificat_at IS NOT NULL)
    ),
    -- Validació: tipus_retorn ha de ser compatible amb tipus_remuneracio del tipus_servei
    -- Nota: Aquest constraint es valida amb un trigger perquè necessita consultar tipus_servei
    -- El trigger 'validar_tipus_retorn' s'encarregarà de garantir aquesta regla
    CONSTRAINT tipus_retorn_coherent_remuneracio CHECK (
        -- Validació bàsica: tipus_retorn sempre ha de ser 'diners' o 'hores'
        tipus_retorn IN ('diners', 'hores')
    )
);

CREATE INDEX idx_serveis_usuari ON serveis(usuari_id);
CREATE INDEX idx_serveis_tipus ON serveis(tipus_servei_id);
CREATE INDEX idx_serveis_data_inici ON serveis(data_inici);
CREATE INDEX idx_serveis_data_fi ON serveis(data_fi);
CREATE INDEX idx_serveis_estat ON serveis(estat);
CREATE INDEX idx_serveis_tipus_retorn ON serveis(tipus_retorn);
CREATE INDEX idx_serveis_usuari_dates ON serveis(usuari_id, data_inici, data_fi);
CREATE INDEX idx_serveis_estat_tipus ON serveis(estat, tipus_retorn);
```

**Camps:**
- `id`: Identificador únic
- `usuari_id`: Usuari que ha realitzat el servei
- `tipus_servei_id`: Tipus de servei realitzat (conté empresa_id, factors, tarifes)
- `data_inici`: Data i hora d'inici del servei
- `data_fi`: Data i hora de fi del servei
- `durada_hores`: Hores treballades (calculat automàticament: data_fi - data_inici)
- `tipus_retorn`: Com l'usuari vol cobrar el servei → 'diners' (pagament monetari) o 'hores' (compensació amb temps lliure). IMPORTANT: Si el tipus_servei té tipus_remuneracio='hores', només es pot escollir 'hores'. Si tipus_remuneracio='diners', es pot escollir 'diners' o 'hores'
- `estat`: Estat actual - 'pendent' (per defecte), 'pagat' (si tipus_retorn='diners'), 'compensat' (si tipus_retorn='hores')
- `hores_totals`: Hores finals calculades aplicant els factors del tipus_servei
- `import_total`: Import final calculat (només si tipus_retorn='diners')
- `observacions`: Notes addicionals sobre el servei
- `modificat`: Indica si el servei s'ha modificat després de crear-lo
- `modificat_at`: Data i hora de l'última modificació (NULL si no s'ha modificat)
- `created_at`: Data de creació del registre
- `updated_at`: Data d'última actualització automàtica

**Funcionalitats:**
- Els càlculs d'hores_totals i import_total s'obtenen sempre dels factors/tarifes del tipus_servei associat
- Restricció de tipus_retorn segons tipus_remuneracio:
  - Si tipus_servei.tipus_remuneracio='hores' → servei.tipus_retorn només pot ser 'hores'
  - Si tipus_servei.tipus_remuneracio='diners' → servei.tipus_retorn pot ser 'diners' o 'hores' (l'usuari decideix)
- L'estat només pot ser 'pagat' si tipus_retorn='diners', i 'compensat' si tipus_retorn='hores'
- No es poden rebutjar serveis - si no es vol pagar/compensar, simplement s'elimina el registre
- El camp modificat s'activa automàticament si es canvia qualsevol dada després de la creació

---

### 6. `audit_log` (Registre d'Auditoria) - OPCIONAL

Per a seguretat i traçabilitat d'accions importants.

```sql
CREATE TABLE audit_log (
    id SERIAL PRIMARY KEY,
    usuari_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    accio VARCHAR(50) NOT NULL, -- 'CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT'
    taula VARCHAR(50) NOT NULL, -- Taula afectada
    registre_id INTEGER, -- ID del registre afectat
    dades_abans JSONB, -- Estat anterior (per UPDATE/DELETE)
    dades_despres JSONB, -- Estat posterior (per CREATE/UPDATE)
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_usuari ON audit_log(usuari_id);
CREATE INDEX idx_audit_taula ON audit_log(taula);
CREATE INDEX idx_audit_created ON audit_log(created_at);
```

---

## Relacions entre Taules

```
users (1) ──── (N) serveis
users (1) ──── (N) empreses
users (1) ──── (N) refresh_tokens
users (1) ──── (N) tipus_servei
users (1) ──── (N) audit_log

empreses (1) ──── (N) tipus_servei

tipus_servei (1) ──── (N) serveis
```

---

## Vistes Útils

### Vista de Serveis Complets

Combina informació de serveis amb usuaris i tipus de servei:

```sql
CREATE VIEW vista_serveis_complets AS
SELECT 
    s.id,
    s.usuari_id,
    CONCAT(u.nom, ' ', u.cognom_1, COALESCE(' ' || u.cognom_2, '')) AS nom_complet,
    u.pseudonim,
    u.email,
    s.tipus_servei_id,
    ts.nom AS tipus_servei_nom,
    ts.abreviatura AS tipus_servei_abreviatura,
    ts.tipus_remuneracio,
    ts.es_festiu,
    he.nom_empresa,
    s.data_inici,
    s.data_fi,
    s.durada_hores,
    s.tipus_retorn,
    s.hores_totals,
    s.import_total,
    s.estat,
    s.observacions,
    s.modificat,
    s.modificat_at,
    s.created_at
FROM serveis s
JOIN users u ON s.usuari_id = u.id
JOIN tipus_servei ts ON s.tipus_servei_id = ts.id
JOIN empreses e ON ts.empresa_id = e.id;
```

### Vista de Resum Mensual per Usuari

```sql
CREATE VIEW vista_resum_mensual AS
SELECT 
    s.usuari_id,
    CONCAT(u.nom, ' ', u.cognom_1, COALESCE(' ' || u.cognom_2, '')) AS nom_complet,
    u.pseudonim,
    DATE_TRUNC('month', s.data_inici) AS mes,
    s.tipus_retorn,
    COUNT(*) AS total_serveis,
    SUM(s.durada_hores) AS hores_treballades,
    SUM(s.hores_totals) AS hores_totals_compensades,
    SUM(CASE WHEN s.tipus_retorn = 'diners' THEN s.import_total ELSE 0 END) AS import_total_mes
FROM serveis s
JOIN users u ON s.usuari_id = u.id
JOIN tipus_servei ts ON s.tipus_servei_id = ts.id
WHERE s.estat IN ('pagat', 'compensat')
GROUP BY s.usuari_id, u.nom, u.cognom_1, u.cognom_2, u.pseudonim, DATE_TRUNC('month', s.data_inici), s.tipus_retorn;
```

---

## Triggers i Funcions

### Trigger per actualitzar `updated_at`

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';
-- Aplicar a totes les taules necessàries
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_empreses_updated_at BEFORE UPDATE ON empreses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tipus_servei_updated_at BEFORE UPDATE ON tipus_servei
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_serveis_updated_at BEFORE UPDATE ON serveis
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Funció per netejar tokens expirats

```sql
CREATE OR REPLACE FUNCTION netejar_tokens_expirats()
RETURNS void AS $$
BEGIN
    DELETE FROM refresh_tokens 
    WHERE expira_at < CURRENT_TIMESTAMP 
    OR (revocat = true AND creat_at < CURRENT_TIMESTAMP - INTERVAL '30 days');
END;
$$ language 'plpgsql';

-- Opcional: Crear un cron job per executar aquesta funció diàriament
-- Amb pg_cron extension:
-- SELECT cron.schedule('netejar-tokens', '0 3 * * *', 'SELECT netejar_tokens_expirats()');
```

### Trigger per calcular durada_hores automàticament

```sql
CREATE OR REPLACE FUNCTION calcular_durada_servei()
RETURNS TRIGGER AS $$
BEGIN
    NEW.durada_hores = EXTRACT(EPOCH FROM (NEW.data_fi - NEW.data_inici)) / 3600;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_calcular_durada BEFORE INSERT OR UPDATE ON serveis
    FOR EACH ROW EXECUTE FUNCTION calcular_durada_servei();
```

### Trigger per gestionar empresa activa

**NOTA**: Aquest trigger ja NO existeix a la nova implementació d'`empreses`. 

La nova taula `empreses` **permet múltiples empreses actives simultàniament** (data_fi = NULL), ideal per treballadors pluriempleados. Ja no hi ha el camp `activa` ni la restricció d'una sola empresa activa.

### Trigger per validar tipus_retorn segons tipus_remuneracio

Aquest trigger garanteix que el `tipus_retorn` sigui compatible amb el `tipus_remuneracio` del tipus de servei:

```sql
CREATE OR REPLACE FUNCTION validar_tipus_retorn()
RETURNS TRIGGER AS $$
DECLARE
    v_tipus_remuneracio VARCHAR(20);
BEGIN
    -- Obtenir tipus_remuneracio del tipus_servei associat
    SELECT tipus_remuneracio INTO v_tipus_remuneracio
    FROM tipus_servei
    WHERE id = NEW.tipus_servei_id;
    
    -- Validar segons la lògica restrictiva:
    -- Si tipus_remuneracio='hores' → tipus_retorn només pot ser 'hores'
    -- Si tipus_remuneracio='diners' → tipus_retorn pot ser 'diners' o 'hores'
    IF v_tipus_remuneracio = 'hores' AND NEW.tipus_retorn != 'hores' THEN
        RAISE EXCEPTION 'Un servei amb tipus_remuneracio="hores" només pot tenir tipus_retorn="hores". No es pot pagar amb diners.';
    END IF;
    
    -- Si tipus_remuneracio='diners', tant 'diners' com 'hores' són vàlids (ja validat pel CHECK)
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_validar_tipus_retorn 
    BEFORE INSERT OR UPDATE ON serveis
    FOR EACH ROW EXECUTE FUNCTION validar_tipus_retorn();
```

### Trigger per actualitzar camp modificat

Quest trigger detecta quan s'edita un servei després de crear-lo i actualitza els camps `modificat` i `modificat_at`:

```sql
CREATE OR REPLACE FUNCTION actualitzar_modificat_servei()
RETURNS TRIGGER AS $$
BEGIN
    -- Només marcar com modificat si no és una inserció
    IF TG_OP = 'UPDATE' THEN
        -- Comprovar si s'ha canviat alguna dada rellevant (no updated_at)
        IF (OLD.tipus_servei_id != NEW.tipus_servei_id OR
            OLD.data_inici != NEW.data_inici OR
            OLD.data_fi != NEW.data_fi OR
            OLD.tipus_retorn != NEW.tipus_retorn OR
            OLD.estat != NEW.estat OR
            COALESCE(OLD.observacions, '') != COALESCE(NEW.observacions, '')) THEN
            
            NEW.modificat = true;
            NEW.modificat_at = CURRENT_TIMESTAMP;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_actualitzar_modificat 
    BEFORE UPDATE ON serveis
    FOR EACH ROW EXECUTE FUNCTION actualitzar_modificat_servei();
```

### Trigger per calcular hores_totals i import_total

Quest trigger calcula automàticament els valors finals aplicant els factors i tarifes del tipus de servei:

```sql
CREATE OR REPLACE FUNCTION calcular_totals_servei()
RETURNS TRIGGER AS $$
DECLARE
    v_tipus_remuneracio VARCHAR(20);
    v_tarifa_base DECIMAL(10, 2);
    v_hores_equivalents DECIMAL(5, 2);
    v_factor_multiplicador DECIMAL(5, 2);
BEGIN
    -- Obtenir dades del tipus_servei
    SELECT 
        tipus_remuneracio, 
        tarifa_base, 
        hores_equivalents,
        factor_multiplicador
    INTO 
        v_tipus_remuneracio, 
        v_tarifa_base, 
        v_hores_equivalents,
        v_factor_multiplicador
    FROM tipus_servei
    WHERE id = NEW.tipus_servei_id;
    
    -- Calcular hores_totals segons el tipus de remuneració
    IF v_tipus_remuneracio = 'hores' THEN
        -- Aplicar hores_equivalents i factor_multiplicador
        NEW.hores_totals = NEW.durada_hores * v_hores_equivalents * v_factor_multiplicador;
        NEW.import_total = NULL; -- No hi ha import si es paga amb hores
    ELSIF v_tipus_remuneracio = 'diners' THEN
        IF NEW.tipus_retorn = 'hores' THEN
            -- L'usuari ha escollit cobrar amb hores en un servei de diners
            -- Aplicar només el factor_multiplicador (la tarifa_base es cancel·la)
            NEW.hores_totals = NEW.durada_hores * v_factor_multiplicador;
            NEW.import_total = NULL;
        ELSE
            -- L'usuari cobra amb diners
            NEW.hores_totals = NULL;
            NEW.import_total = NEW.durada_hores * v_tarifa_base * v_factor_multiplicador;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_calcular_totals 
    BEFORE INSERT OR UPDATE ON serveis
    FOR EACH ROW EXECUTE FUNCTION calcular_totals_servei();
```

**Nota important sobre l'ordre dels triggers:**
PostgreSQL executa els triggers BEFORE en ordre alfabètic per defecte. Per garantir l'ordre correcte:
1. `trigger_calcular_durada` - calcula durada_hores (necessari per calcular_totals)
2. `trigger_validar_tipus_retorn` - valida compatibilitat tipus_retorn
3. `trigger_calcular_totals` - calcula hores_totals i import_total
4. `trigger_actualitzar_modificat` - detecta modificacions

Si cal controlar l'ordre explícitament, es poden renombrar amb prefixos numèrics (ex: `trigger_01_calcular_durada`).

---

### Dades Seed (Inicials)

### Usuari Administrador per Defecte

```sql
-- Contrasenya: Admin123! (hash bcrypt)
INSERT INTO users (
    nom, 
    cognom_1, 
    cognom_2, 
    pseudonim, 
    numero_professional, 
    departament,
    email, 
    password_hash, 
    rol,
    actiu
) VALUES (
    'Admin',
    'Sistema',
    NULL,
    'admin',
    'ADM-00001',
    'Administració',
    'admin@serveis.local',
    '$2b$10$rKjQXQBxzYVhZYqVp9JHKu0Y8yqPJxWkVx0J8YJFYZqVp9JHKu0Y8',
    'admin',
    true
);

-- Empresa activa de l'usuari admin
INSERT INTO empreses (usuari_id, nom, data_inici, data_fi) VALUES
(1, 'Sistema', CURRENT_DATE, NULL);
```

### Tipus de Serveis Predefinits per l'Admin

```sql
-- Exemples de tipus de servei per l'usuari admin (usuari_id = 1, empresa_id = 1)
INSERT INTO tipus_servei (
    usuari_id, 
    empresa_id, 
    nom, 
    abreviatura, 
    descripcio, 
    tipus_remuneracio, 
    tarifa_base, 
    hora_inici_proposada, 
    hora_fi_proposada, 
    es_festiu,
    color
) VALUES
(1, 1, 'Guàrdia Diària', 'GD', 'Guàrdia en horari laboral estàndard', 'diners', 15.00, '08:00:00', '16:00:00', false, '#3B82F6'),
(1, 1, 'Guàrdia Nocturna', 'GN', 'Guàrdia en horari nocturn', 'diners', 20.00, '22:00:00', '06:00:00', false, '#1E40AF'),
(1, 1, 'Suport Cap de Setmana', 'SCM', 'Treball en dissabte o diumenge', 'diners', 18.00, '09:00:00', '17:00:00', false, '#8B5CF6'),
(1, 1, 'Servei Festiu', 'SF', 'Servei en dia festiu oficial', 'diners', 25.00, NULL, NULL, true, '#EF4444');

INSERT INTO tipus_servei (
    usuari_id, 
    empresa_id, 
    nom, 
    abreviatura, 
    descripcio, 
    tipus_remuneracio, 
    hores_equivalents,
    color
) VALUES
(1, 1, 'Hores de Compensació', 'HC', 'Serveis compensats amb temps lliure', 'hores', 1.00, '#10B981'),
(1, 1, 'Formació Extra', 'FORM', 'Hores de formació fora de l''horari laboral', 'hores', 1.50, '#F59E0B');
```

---

## Índexs i Optimitzacions

Els índexs ja definits a cada taula estan optimitzats per a:
- Cerques per usuari
- Cerques per rang de dates
- Filtres per estat i tipus
- Relacions entre taules

### Índexs Compostos Addicionals (si cal rendiment extra)

```sql
-- Per consultes mensuals ràpides
CREATE INDEX idx_serveis_mes_usuari ON serveis(usuari_id, DATE_TRUNC('month', data_inici));

-- Per cerques de serveis processats (pagats o compensats) en un rang de dates
CREATE INDEX idx_serveis_processats_dates ON serveis(estat, data_inici, data_fi) 
WHERE estat IN ('pagat', 'compensat');

-- Per cerques de serveis pendents
CREATE INDEX idx_serveis_pendents ON serveis(usuari_id, estat, data_inici)
WHERE estat = 'pendent';
```

---

## Consideracions de Seguretat

1. **Row Level Security (RLS)** - Opcional per PostgreSQL:
   - Els usuaris normals només poden veure els seus propis serveis
   - Els admins poden veure tots els serveis

```sql
-- Exemple RLS
ALTER TABLE serveis ENABLE ROW LEVEL SECURITY;

CREATE POLICY serveis_user_policy ON serveis
    FOR ALL
    TO authenticated_user
    USING (usuari_id = current_user_id());

CREATE POLICY serveis_admin_policy ON serveis
    FOR ALL
    TO admin_user
    USING (true);
```

## Estimació de Creixement

Per a 10 usuaris actius durant 1 any:
- **users**: 10 registres (~5 KB, incloent preferències)
- **empreses**: ~20 registres (2 empreses/usuari de mitjana) (~8 KB amb camps addicionals)
- **refresh_tokens**: ~30 registres actius (3 dispositius/usuari) (~15 KB)
- **tipus_servei**: ~50 registres (5 tipus/usuari de mitjana) (~10 KB)
- **serveis**: ~1200 registres (10 serveis/usuari/mes × 12 mesos) (~500 KB)
- **audit_log**: ~10000 registres (~5 MB)

**Total estimat**: ~5.5 MB/any per 10 usuaris (molt manejable)

**Neteja recomanada:**
- Tokens expirats: Neteja automàtica diària
- Audit log: Mantenir només últims 12 mesos (opcional)
- Historial empreses: Conservar sempre (és històric important)

---

**Data de creació**: 29 de novembre de 2025  
**Última actualització**: 29 de novembre de 2025
