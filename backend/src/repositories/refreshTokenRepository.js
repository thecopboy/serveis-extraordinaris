import pool from '../config/database.js';

/**
 * Repository per gestionar refresh tokens
 */
class RefreshTokenRepository {
  /**
   * Crear nou refresh token
   * @param {number} userId 
   * @param {string} token 
   * @param {string} userAgent 
   * @param {string} ipAddress 
   * @param {Date} expiresAt 
   * @returns {Promise<object>}
   */
  async createToken(userId, token, userAgent, ipAddress, expiresAt) {
    const query = `
      INSERT INTO refresh_tokens (
        usuari_id, token, user_agent, ip_address, expira_at
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING id, usuari_id, token, expira_at, creat_a
    `;

    const values = [userId, token, userAgent, ipAddress, expiresAt];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  /**
   * Obtenir token per valor
   * @param {string} token 
   * @returns {Promise<object|null>}
   */
  async getTokenByValue(token) {
    const query = `
      SELECT 
        id, usuari_id, token, expira_at,
        revocat, revocat_a, user_agent, ip_address
      FROM refresh_tokens
      WHERE token = $1 
        AND revocat = false 
        AND expira_at > CURRENT_TIMESTAMP
    `;

    const result = await pool.query(query, [token]);
    return result.rows[0] || null;
  }

  /**
   * Revocar token
   * @param {string} token 
   * @returns {Promise<boolean>} true si s'ha revocat, false si no existia o ja estava revocat
   */
  async revokeToken(token) {
    const query = `
      UPDATE refresh_tokens
      SET revocat = true
      WHERE token = $1 AND revocat = false
      RETURNING id
    `;

    const result = await pool.query(query, [token]);
    return result.rowCount > 0;
  }

  /**
   * Revocar tots els tokens d'un usuari
   * @param {number} userId 
   * @returns {Promise<number>} Nombre de tokens revocats
   */
  async revokeAllUserTokens(userId) {
    const query = `
      UPDATE refresh_tokens
      SET revocat = true, revocat_a = CURRENT_TIMESTAMP
      WHERE usuari_id = $1 AND revocat = false
      RETURNING id
    `;

    const result = await pool.query(query, [userId]);
    return result.rowCount;
  }

  /**
   * Obtenir tokens actius d'un usuari
   * @param {number} userId 
   * @returns {Promise<Array>}
   */
  async getActiveTokensByUser(userId) {
    const query = `
      SELECT 
        id, token, user_agent, ip_address,
        creat_a, expira_at
      FROM refresh_tokens
      WHERE usuari_id = $1 
        AND revocat = false 
        AND expira_at > CURRENT_TIMESTAMP
      ORDER BY creat_a DESC
    `;

    const result = await pool.query(query, [userId]);
    return result.rows;
  }

  /**
   * Netejar tokens expirats (executar periòdicament)
   * @returns {Promise<number>} Tokens eliminats
   */
  async cleanExpiredTokens() {
    const result = await pool.query('SELECT netejar_tokens_expirats()');
    return result.rows[0].netejar_tokens_expirats;
  }
}

export default new RefreshTokenRepository();
