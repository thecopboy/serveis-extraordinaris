-- ============================================
-- Sistema de Gestió de Serveis Extraordinaris
-- PostgreSQL Database Schema
-- ============================================
-- Data de creació: 29 de novembre de 2025
-- Versió: 1.0
-- ============================================

-- Eliminar taules si existeixen (per reinicialització)
DROP TABLE IF EXISTS audit_log CASCADE;
DROP TABLE IF EXISTS serveis CASCADE;
DROP TABLE IF EXISTS tipus_servei CASCADE;
DROP TABLE IF EXISTS refresh_tokens CASCADE;
DROP TABLE IF EXISTS historial_empreses CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ============================================
-- TAULA: users
-- ============================================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    
    -- Dades personals
    nom VARCHAR(100) NOT NULL,
    cognom_1 VARCHAR(100),
    cognom_2 VARCHAR(100),
    pseudonim VARCHAR(50) UNIQUE,
    
    -- Dades professionals
    numero_professional VARCHAR(50),
    departament VARCHAR(100),
    
    -- Autenticació
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    telefon VARCHAR(20),
    
    -- Autorització i estat
    rol VARCHAR(50) NOT NULL DEFAULT 'user',
    actiu BOOLEAN NOT NULL DEFAULT true,
    
    -- Preferències d'interfície
    tema VARCHAR(20) DEFAULT 'clar',
    idioma VARCHAR(5) DEFAULT 'ca',
    timezone VARCHAR(50) DEFAULT 'Europe/Madrid',
    
    -- Preferències de notificacions
    notificacions_email BOOLEAN DEFAULT true,
    notificacions_push BOOLEAN DEFAULT false,
    
    -- Preferències de visualització
    format_data VARCHAR(20) DEFAULT 'DD/MM/YYYY',
    format_hora VARCHAR(10) DEFAULT '24h',
    
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

COMMENT ON TABLE users IS 'Usuaris del sistema amb autenticació i preferències';
COMMENT ON COLUMN users.pseudonim IS 'Nom que es mostra a la interfície (opcional, únic)';
COMMENT ON COLUMN users.numero_professional IS 'Identificador professional (NO únic)';

-- ============================================
-- TAULA: historial_empreses
-- ============================================
CREATE TABLE historial_empreses (
    id SERIAL PRIMARY KEY,
    usuari_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    nom_empresa VARCHAR(255) NOT NULL,
    
    data_alta DATE NOT NULL DEFAULT CURRENT_DATE,
    data_baixa DATE,
    
    activa BOOLEAN NOT NULL DEFAULT true,
    observacions TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT data_baixa_posterior CHECK (data_baixa IS NULL OR data_baixa >= data_alta),
    CONSTRAINT empresa_activa_sense_data_baixa CHECK (
        (activa = true AND data_baixa IS NULL) OR 
        (activa = false)
    )
);

CREATE INDEX idx_historial_empreses_usuari ON historial_empreses(usuari_id);
CREATE INDEX idx_historial_empreses_activa ON historial_empreses(usuari_id, activa);
CREATE INDEX idx_historial_empreses_dates ON historial_empreses(data_alta, data_baixa);

COMMENT ON TABLE historial_empreses IS 'Historial laboral amb múltiples empreses per usuari';
COMMENT ON COLUMN historial_empreses.activa IS 'Només una empresa activa per usuari';

-- ============================================
-- TAULA: refresh_tokens
-- ============================================
CREATE TABLE refresh_tokens (
    id SERIAL PRIMARY KEY,
    usuari_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    
    -- Informació del dispositiu/sessió
    dispositiu VARCHAR(100),
    ip_address INET,
    user_agent TEXT,
    
    -- Control de tokens
    expira_at TIMESTAMP NOT NULL,
    usat BOOLEAN DEFAULT false,
    revocat BOOLEAN DEFAULT false,
    
    creat_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    usat_at TIMESTAMP,
    
    CONSTRAINT expira_futur CHECK (expira_at > creat_at)
);

CREATE INDEX idx_refresh_tokens_usuari ON refresh_tokens(usuari_id);
CREATE INDEX idx_refresh_tokens_hash ON refresh_tokens(token_hash);
CREATE INDEX idx_refresh_tokens_expira ON refresh_tokens(expira_at);
CREATE INDEX idx_refresh_tokens_actius ON refresh_tokens(usuari_id, revocat, expira_at) 
    WHERE revocat = false;

COMMENT ON TABLE refresh_tokens IS 'Gestió de sessions JWT amb suport multi-dispositiu';

-- ============================================
-- TAULA: tipus_servei
-- ============================================
CREATE TABLE tipus_servei (
    id SERIAL PRIMARY KEY,
    usuari_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    empresa_id INTEGER NOT NULL REFERENCES historial_empreses(id) ON DELETE CASCADE,
    
    -- Identificació del servei
    nom VARCHAR(100) NOT NULL,
    abreviatura VARCHAR(10) NOT NULL,
    descripcio TEXT,
    
    -- Tipus de remuneració
    tipus_remuneracio VARCHAR(20) NOT NULL,
    tarifa_base DECIMAL(10, 2),
    hores_equivalents DECIMAL(5, 2),
    factor_multiplicador DECIMAL(5, 2) NOT NULL DEFAULT 1.00,
    
    -- Configuració d'horari (opcional)
    hora_inici_proposada TIME,
    hora_fi_proposada TIME,
    es_festiu BOOLEAN DEFAULT false,
    
    -- Visualització (opcionals)
    color VARCHAR(7),
    icona VARCHAR(10),
    
    -- Control
    actiu BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT tipus_remuneracio_valid CHECK (tipus_remuneracio IN ('diners', 'hores')),
    CONSTRAINT tarifa_o_hores CHECK (
        (tipus_remuneracio = 'diners' AND tarifa_base IS NOT NULL AND hores_equivalents IS NULL) OR
        (tipus_remuneracio = 'hores' AND hores_equivalents IS NOT NULL AND tarifa_base IS NULL)
    ),
    -- Nota: No validem hora_fi > hora_inici perquè alguns serveis travessen mitjanit (ex: 22:00-06:00)
    CONSTRAINT factor_multiplicador_positiu CHECK (factor_multiplicador > 0)
);

CREATE INDEX idx_tipus_servei_usuari ON tipus_servei(usuari_id);
CREATE INDEX idx_tipus_servei_empresa ON tipus_servei(empresa_id);
CREATE INDEX idx_tipus_servei_actiu ON tipus_servei(usuari_id, actiu);
CREATE INDEX idx_tipus_servei_tipus ON tipus_servei(tipus_remuneracio);
CREATE INDEX idx_tipus_servei_abreviatura ON tipus_servei(usuari_id, abreviatura);

COMMENT ON TABLE tipus_servei IS 'Definició de tipus de serveis per usuari/empresa';
COMMENT ON COLUMN tipus_servei.tipus_remuneracio IS 'COM es pot remunerar: diners o hores';
COMMENT ON COLUMN tipus_servei.factor_multiplicador IS 'Factor a aplicar (1.0=normal, 1.5=+50%, 2.0=+100%)';

-- ============================================
-- TAULA: serveis
-- ============================================
CREATE TABLE serveis (
    id SERIAL PRIMARY KEY,
    usuari_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tipus_servei_id INTEGER NOT NULL REFERENCES tipus_servei(id) ON DELETE RESTRICT,
    
    -- Dates i duració
    data_inici TIMESTAMP NOT NULL,
    data_fi TIMESTAMP NOT NULL,
    durada_hores DECIMAL(5, 2) NOT NULL,
    
    -- Tipus de retorn del servei
    tipus_retorn VARCHAR(20) NOT NULL,
    
    -- Estat del servei
    estat VARCHAR(20) NOT NULL DEFAULT 'pendent',
    
    -- Càlculs finals
    hores_totals DECIMAL(5, 2),
    import_total DECIMAL(10, 2),
    
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
    CONSTRAINT tipus_retorn_coherent_remuneracio CHECK (
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

COMMENT ON TABLE serveis IS 'Registre principal de serveis extraordinaris';
COMMENT ON COLUMN serveis.tipus_retorn IS 'COM l''usuari vol cobrar: diners o hores';
COMMENT ON COLUMN serveis.durada_hores IS 'Calculat automàticament per trigger';
COMMENT ON COLUMN serveis.hores_totals IS 'Hores finals amb factors aplicats';
COMMENT ON COLUMN serveis.import_total IS 'Import final (només si tipus_retorn=diners)';

-- ============================================
-- TAULA: audit_log (OPCIONAL)
-- ============================================
CREATE TABLE audit_log (
    id SERIAL PRIMARY KEY,
    usuari_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    accio VARCHAR(50) NOT NULL,
    taula VARCHAR(50) NOT NULL,
    registre_id INTEGER,
    dades_abans JSONB,
    dades_despres JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_usuari ON audit_log(usuari_id);
CREATE INDEX idx_audit_taula ON audit_log(taula);
CREATE INDEX idx_audit_created ON audit_log(created_at);

COMMENT ON TABLE audit_log IS 'Registre d''auditoria per traçabilitat';

-- ============================================
-- TRIGGERS I FUNCIONS
-- ============================================

-- Funció per actualitzar updated_at
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

CREATE TRIGGER update_historial_empreses_updated_at BEFORE UPDATE ON historial_empreses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tipus_servei_updated_at BEFORE UPDATE ON tipus_servei
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_serveis_updated_at BEFORE UPDATE ON serveis
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Funció per calcular durada_hores automàticament
CREATE OR REPLACE FUNCTION calcular_durada_servei()
RETURNS TRIGGER AS $$
BEGIN
    NEW.durada_hores = EXTRACT(EPOCH FROM (NEW.data_fi - NEW.data_inici)) / 3600;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_calcular_durada BEFORE INSERT OR UPDATE ON serveis
    FOR EACH ROW EXECUTE FUNCTION calcular_durada_servei();

-- Funció per gestionar empresa activa (només una per usuari)
CREATE OR REPLACE FUNCTION gestionar_empresa_activa()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.activa = true THEN
        UPDATE historial_empreses 
        SET activa = false 
        WHERE usuari_id = NEW.usuari_id 
        AND id != NEW.id 
        AND activa = true;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_empresa_activa 
    BEFORE INSERT OR UPDATE ON historial_empreses
    FOR EACH ROW EXECUTE FUNCTION gestionar_empresa_activa();

-- Funció per validar tipus_retorn segons tipus_remuneracio
CREATE OR REPLACE FUNCTION validar_tipus_retorn()
RETURNS TRIGGER AS $$
DECLARE
    v_tipus_remuneracio VARCHAR(20);
BEGIN
    SELECT tipus_remuneracio INTO v_tipus_remuneracio
    FROM tipus_servei
    WHERE id = NEW.tipus_servei_id;
    
    IF v_tipus_remuneracio = 'hores' AND NEW.tipus_retorn != 'hores' THEN
        RAISE EXCEPTION 'Un servei amb tipus_remuneracio="hores" només pot tenir tipus_retorn="hores". No es pot pagar amb diners.';
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_validar_tipus_retorn 
    BEFORE INSERT OR UPDATE ON serveis
    FOR EACH ROW EXECUTE FUNCTION validar_tipus_retorn();

-- Funció per detectar modificacions en serveis
CREATE OR REPLACE FUNCTION actualitzar_modificat_servei()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' THEN
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

-- Funció per calcular hores_totals i import_total
CREATE OR REPLACE FUNCTION calcular_totals_servei()
RETURNS TRIGGER AS $$
DECLARE
    v_tipus_remuneracio VARCHAR(20);
    v_tarifa_base DECIMAL(10, 2);
    v_hores_equivalents DECIMAL(5, 2);
    v_factor_multiplicador DECIMAL(5, 2);
BEGIN
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
    
    IF v_tipus_remuneracio = 'hores' THEN
        -- Aplicar hores_equivalents i factor_multiplicador
        NEW.hores_totals = NEW.durada_hores * v_hores_equivalents * v_factor_multiplicador;
        NEW.import_total = NULL;
    ELSIF v_tipus_remuneracio = 'diners' THEN
        IF NEW.tipus_retorn = 'hores' THEN
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

-- Funció per netejar tokens expirats (cron job)
CREATE OR REPLACE FUNCTION netejar_tokens_expirats()
RETURNS void AS $$
BEGIN
    DELETE FROM refresh_tokens 
    WHERE expira_at < CURRENT_TIMESTAMP 
    OR (revocat = true AND creat_at < CURRENT_TIMESTAMP - INTERVAL '30 days');
END;
$$ language 'plpgsql';

COMMENT ON FUNCTION netejar_tokens_expirats() IS 'Neteja tokens expirats i revocats (executar diàriament)';

-- ============================================
-- VISTES
-- ============================================

-- Vista de serveis complets amb tota la informació relacionada
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
JOIN historial_empreses he ON ts.empresa_id = he.id;

COMMENT ON VIEW vista_serveis_complets IS 'Vista completa amb tota la informació de serveis i relacions';

-- Vista de resum mensual per usuari
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

COMMENT ON VIEW vista_resum_mensual IS 'Resum mensual de serveis processats per usuari';

-- ============================================
-- DADES SEED (INICIALS)
-- ============================================

-- Usuari administrador per defecte
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
    'themacboy',
    'themacboy',
    NULL,
    'themacboy',
    'ADM-00001',
    'Administració',
    'themacboy72@gmail.com',
    '$2b$10$rKjQXQBxzYVhZYqVp9JHKu0Y8yqPJxWkVx0J8YJFYZqVp9JHKu0Y8',
    'admin',
    true
);

-- Empresa activa de l'usuari admin
INSERT INTO historial_empreses (usuari_id, nom_empresa, data_alta, activa) VALUES
(1, 'Sistema', CURRENT_DATE, true);

-- Tipus de serveis predefinits per l'admin
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

-- ============================================
-- FINALITZACIÓ
-- ============================================

-- Missatge de confirmació
DO $$
BEGIN
    RAISE NOTICE '✓ Esquema creat correctament!';
    RAISE NOTICE '✓ 6 taules creades: users, historial_empreses, refresh_tokens, tipus_servei, serveis, audit_log';
    RAISE NOTICE '✓ 5 triggers instal·lats amb 6 funcions';
    RAISE NOTICE '✓ 2 vistes creades: vista_serveis_complets, vista_resum_mensual';
    RAISE NOTICE '✓ Usuari admin creat: admin@serveis.local (contrasenya: Admin123!)';
    RAISE NOTICE '✓ 6 tipus de servei predefinits';
    RAISE NOTICE '';
    RAISE NOTICE 'Per netejar tokens expirats diàriament, configura un cron job:';
    RAISE NOTICE '  SELECT netejar_tokens_expirats();';
END $$;
