import pool from '../config/database.js';

/**
 * Repository per gestionar operacions amb la taula empreses
 */
class EmpresaRepository {
  /**
   * Obtenir totes les empreses d'un usuari (actives i històriques)
   * @param {number} userId 
   * @param {boolean} nomasActives - Si true, només retorna empreses amb data_fi = NULL
   * @returns {Promise<Array>}
   */
  async getAllByUserId(userId, nomasActives = false) {
    let query = `
      SELECT 
        id, usuari_id, nom, cif, adreca, telefon, email,
        data_inici, data_fi, observacions, actiu,
        created_at, updated_at
      FROM empreses
      WHERE usuari_id = $1 AND actiu = true
    `;
    
    if (nomasActives) {
      query += ' AND data_fi IS NULL';
    }
    
    query += ' ORDER BY data_inici DESC';
    
    const result = await pool.query(query, [userId]);
    return result.rows;
  }

  /**
   * Obtenir empresa per ID (validant que pertany a l'usuari)
   * @param {number} id 
   * @param {number} userId 
   * @returns {Promise<object|null>}
   */
  async getById(id, userId) {
    const query = `
      SELECT 
        id, usuari_id, nom, cif, adreca, telefon, email,
        data_inici, data_fi, observacions, actiu,
        created_at, updated_at
      FROM empreses
      WHERE id = $1 AND usuari_id = $2 AND actiu = true
    `;
    
    const result = await pool.query(query, [id, userId]);
    return result.rows[0] || null;
  }

  /**
   * Crear nova empresa
   * @param {number} userId 
   * @param {object} empresaData 
   * @returns {Promise<object>}
   */
  async create(userId, empresaData) {
    const {
      nom,
      cif,
      adreca,
      telefon,
      email,
      data_inici,
      data_fi,
      observacions
    } = empresaData;

    const query = `
      INSERT INTO empreses (
        usuari_id, nom, cif, adreca, telefon, email,
        data_inici, data_fi, observacions, actiu
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true)
      RETURNING 
        id, usuari_id, nom, cif, adreca, telefon, email,
        data_inici, data_fi, observacions, actiu,
        created_at, updated_at
    `;

    const values = [
      userId,
      nom,
      cif || null,
      adreca || null,
      telefon || null,
      email || null,
      data_inici || new Date(),
      data_fi || null,
      observacions || null
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  /**
   * Actualitzar empresa
   * @param {number} id 
   * @param {number} userId 
   * @param {object} empresaData 
   * @returns {Promise<object|null>}
   */
  async update(id, userId, empresaData) {
    const {
      nom,
      cif,
      adreca,
      telefon,
      email,
      data_inici,
      data_fi,
      observacions
    } = empresaData;

    const query = `
      UPDATE empreses
      SET 
        nom = COALESCE($1, nom),
        cif = $2,
        adreca = $3,
        telefon = $4,
        email = $5,
        data_inici = COALESCE($6, data_inici),
        data_fi = $7,
        observacions = $8,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $9 AND usuari_id = $10 AND actiu = true
      RETURNING 
        id, usuari_id, nom, cif, adreca, telefon, email,
        data_inici, data_fi, observacions, actiu,
        created_at, updated_at
    `;

    const values = [
      nom,
      cif,
      adreca,
      telefon,
      email,
      data_inici,
      data_fi,
      observacions,
      id,
      userId
    ];

    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  /**
   * Eliminar empresa (soft delete)
   * @param {number} id 
   * @param {number} userId 
   * @returns {Promise<boolean>}
   */
  async delete(id, userId) {
    const query = `
      UPDATE empreses
      SET actiu = false, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND usuari_id = $2
      RETURNING id
    `;

    const result = await pool.query(query, [id, userId]);
    return result.rowCount > 0;
  }

  /**
   * Verificar si una empresa pertany a un usuari
   * @param {number} id 
   * @param {number} userId 
   * @returns {Promise<boolean>}
   */
  async belongsToUser(id, userId) {
    const query = 'SELECT 1 FROM empreses WHERE id = $1 AND usuari_id = $2 AND actiu = true';
    const result = await pool.query(query, [id, userId]);
    return result.rowCount > 0;
  }

  /**
   * Obtenir empreses actives (data_fi = NULL) d'un usuari
   * @param {number} userId 
   * @returns {Promise<Array>}
   */
  async getActivesByUserId(userId) {
    return this.getAllByUserId(userId, true);
  }

  /**
   * Marcar data de fi d'una empresa (quan l'usuari deixa de treballar-hi)
   * @param {number} id 
   * @param {number} userId 
   * @param {Date} dataFi 
   * @returns {Promise<object|null>}
   */
  async setDataFi(id, userId, dataFi) {
    const query = `
      UPDATE empreses
      SET data_fi = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2 AND usuari_id = $3 AND actiu = true
      RETURNING 
        id, usuari_id, nom, cif, adreca, telefon, email,
        data_inici, data_fi, observacions, actiu,
        created_at, updated_at
    `;

    const result = await pool.query(query, [dataFi, id, userId]);
    return result.rows[0] || null;
  }
}

export default new EmpresaRepository();
