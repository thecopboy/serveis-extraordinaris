-- Taula d'empreses amb historial laboral
-- Permet múltiples empreses actives simultàniament (data_fi = NULL)

CREATE TABLE IF NOT EXISTS empreses (
    id SERIAL PRIMARY KEY,
    usuari_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Informació bàsica
    nom VARCHAR(255) NOT NULL,
    cif VARCHAR(20),
    adreca TEXT,
    telefon VARCHAR(20),
    email VARCHAR(255),
    
    -- Dates de relació laboral
    data_inici DATE NOT NULL DEFAULT CURRENT_DATE,
    data_fi DATE,  -- NULL = encara hi treballa
    
    -- Metadades
    observacions TEXT,
    actiu BOOLEAN DEFAULT true,  -- Soft delete
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Restriccions
    CONSTRAINT data_fi_posterior CHECK (data_fi IS NULL OR data_fi >= data_inici),
    CONSTRAINT email_valid CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Índexs per millorar el rendiment
CREATE INDEX IF NOT EXISTS idx_empreses_usuari ON empreses(usuari_id);
CREATE INDEX IF NOT EXISTS idx_empreses_usuari_actives ON empreses(usuari_id, data_fi) WHERE data_fi IS NULL;
CREATE INDEX IF NOT EXISTS idx_empreses_dates ON empreses(data_inici, data_fi);
CREATE INDEX IF NOT EXISTS idx_empreses_actiu ON empreses(actiu);

-- Trigger per actualitzar updated_at automàticament
CREATE OR REPLACE FUNCTION update_empreses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_update_empreses_updated_at 
    BEFORE UPDATE ON empreses
    FOR EACH ROW 
    EXECUTE FUNCTION update_empreses_updated_at();

-- Comentaris per documentació
COMMENT ON TABLE empreses IS 'Registre d''empreses amb historial laboral dels usuaris';
COMMENT ON COLUMN empreses.data_fi IS 'NULL indica que l''usuari encara hi treballa';
COMMENT ON COLUMN empreses.actiu IS 'Soft delete - false amaga l''empresa sense perdre l''històric';
