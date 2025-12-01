import pool from '../config/database.js';

/**
 * Repository per gestionar operacions amb la taula users
 */
class UserRepository {
  /**
   * Obtenir usuari per ID
   * @param {number} id 
   * @returns {Promise<object|null>}
   */
  async getUserById(id) {
    const query = `
      SELECT 
        id, nom, cognom_1, cognom_2, pseudonim,
        numero_professional, departament, email,
        password_hash, rol, actiu,
        creat_a, actualitzat_a
      FROM users
      WHERE id = $1 AND actiu = true
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  /**
   * Obtenir usuari per email
   * @param {string} email 
   * @returns {Promise<object|null>}
   */
  async getUserByEmail(email) {
    const query = `
      SELECT 
        id, nom, cognom_1, cognom_2, pseudonim,
        numero_professional, departament, email,
        password_hash, rol, actiu,
        creat_a, actualitzat_a
      FROM users
      WHERE email = $1
    `;
    
    const result = await pool.query(query, [email]);
    return result.rows[0] || null;
  }

  /**
   * Crear nou usuari
   * @param {object} userData 
   * @returns {Promise<object>}
   */
  async createUser(userData) {
    const {
      nom,
      cognom_1,
      cognom_2,
      pseudonim,
      numero_professional,
      departament,
      email,
      password_hash,
      rol = 'treballador'
    } = userData;

    const query = `
      INSERT INTO users (
        nom, cognom_1, cognom_2, pseudonim,
        numero_professional, departament, email,
        password_hash, rol, actiu
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true)
      RETURNING 
        id, nom, cognom_1, cognom_2, pseudonim,
        numero_professional, departament, email,
        rol, actiu, creat_a
    `;

    const values = [
      nom,
      cognom_1,
      cognom_2,
      pseudonim,
      numero_professional,
      departament,
      email,
      password_hash,
      rol
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  /**
   * Actualitzar usuari
   * @param {number} id 
   * @param {object} userData 
   * @returns {Promise<object|null>}
   */
  async updateUser(id, userData) {
    const {
      nom,
      cognom_1,
      cognom_2,
      pseudonim,
      numero_professional,
      departament,
      email
    } = userData;

    const query = `
      UPDATE users
      SET 
        nom = COALESCE($1, nom),
        cognom_1 = COALESCE($2, cognom_1),
        cognom_2 = $3,
        pseudonim = $4,
        numero_professional = $5,
        departament = $6,
        email = COALESCE($7, email),
        actualitzat_a = CURRENT_TIMESTAMP
      WHERE id = $8 AND actiu = true
      RETURNING 
        id, nom, cognom_1, cognom_2, pseudonim,
        numero_professional, departament, email,
        rol, actiu, actualitzat_a
    `;

    const values = [
      nom,
      cognom_1,
      cognom_2,
      pseudonim,
      numero_professional,
      departament,
      email,
      id
    ];

    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  /**
   * Desactivar usuari (soft delete)
   * @param {number} id 
   * @returns {Promise<boolean>}
   */
  async deactivateUser(id) {
    const query = `
      UPDATE users
      SET actiu = false, actualitzat_a = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id
    `;

    const result = await pool.query(query, [id]);
    return result.rowCount > 0;
  }

  /**
   * Verificar si email ja existeix
   * @param {string} email 
   * @param {number} excludeId - ID a excloure (per updates)
   * @returns {Promise<boolean>}
   */
  async emailExists(email, excludeId = null) {
    let query = 'SELECT 1 FROM users WHERE email = $1';
    const values = [email];

    if (excludeId) {
      query += ' AND id != $2';
      values.push(excludeId);
    }

    const result = await pool.query(query, values);
    return result.rowCount > 0;
  }
}

export default new UserRepository();
