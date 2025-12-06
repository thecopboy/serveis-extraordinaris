import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import userRepository from '../repositories/userRepository.js';
import refreshTokenRepository from '../repositories/refreshTokenRepository.js';
import { 
  ConflictError, 
  UnauthorizedError, 
  ForbiddenError, 
  NotFoundError 
} from '../utils/errors.js';

const {
  JWT_SECRET,
  JWT_REFRESH_SECRET,
  JWT_EXPIRES_IN = '15m',
  JWT_REFRESH_EXPIRES_IN = '7d'
} = process.env;

/**
 * Servei d'autenticació JWT
 */
class AuthService {
  /**
   * Registrar nou usuari
   * @param {object} userData 
   * @returns {Promise<object>}
   */
  async register(userData) {
    const { email, password, ...rest } = userData;

    // Verificar si l'email ja existeix
    const emailInUse = await userRepository.emailExists(email);
    if (emailInUse) {
      throw new ConflictError('Aquest email ja està registrat');
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Crear usuari
    const user = await userRepository.createUser({
      ...rest,
      email,
      password_hash
    });

    // No retornem el password_hash
    delete user.password_hash;
    
    return user;
  }

  /**
   * Login d'usuari
   * @param {string} email 
   * @param {string} password 
   * @param {string} userAgent 
   * @param {string} ipAddress 
   * @returns {Promise<object>} Access token + Refresh token
   */
  async login(email, password, userAgent, ipAddress) {
    // Obtenir usuari
    const user = await userRepository.getUserByEmail(email);
    
    if (!user) {
      throw new UnauthorizedError('Email o contrasenya incorrectes');
    }

    if (!user.actiu) {
      throw new ForbiddenError('Aquest usuari està desactivat');
    }

    // Verificar password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!isValidPassword) {
      throw new UnauthorizedError('Email o contrasenya incorrectes');
    }

    // Generar tokens
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    // Guardar refresh token a la BD
    const expiresAt = new Date(Date.now() + this.parseExpiry(JWT_REFRESH_EXPIRES_IN));
    await refreshTokenRepository.createToken(
      user.id,
      refreshToken,
      userAgent,
      ipAddress,
      expiresAt
    );

    // No retornem el password_hash
    delete user.password_hash;

    return {
      user,
      accessToken,
      refreshToken,
      expiresIn: JWT_EXPIRES_IN
    };
  }

  /**
   * Renovar access token amb refresh token
   * @param {string} refreshToken 
   * @param {string} userAgent 
   * @param {string} ipAddress 
   * @returns {Promise<object>}
   */
  async refresh(refreshToken, userAgent, ipAddress) {
    // Verificar que el token existeix i és vàlid
    const tokenData = await refreshTokenRepository.getTokenByValue(refreshToken);
    
    if (!tokenData) {
      throw new UnauthorizedError('Refresh token invàlid o expirat');
    }

    // Verificar JWT
    try {
      jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    } catch (error) {
      // Revocar token si és invàlid
      await refreshTokenRepository.revokeToken(refreshToken);
      throw new UnauthorizedError('Refresh token invàlid o expirat');
    }

    // Obtenir usuari
    const user = await userRepository.getUserById(tokenData.usuari_id);
    
    if (!user || !user.actiu) {
      throw new NotFoundError('Usuari');
    }

    // Generar nou access token
    const accessToken = this.generateAccessToken(user);

    // Opcional: Rotar refresh token (més segur)
    // const newRefreshToken = this.generateRefreshToken(user);
    // await refreshTokenRepository.revokeToken(refreshToken);
    // await refreshTokenRepository.createToken(...);

    delete user.password_hash;

    return {
      user,
      accessToken,
      expiresIn: JWT_EXPIRES_IN
    };
  }

  /**
   * Logout (revocar refresh token)
   * @param {string} refreshToken 
   * @returns {Promise<boolean>}
   */
  async logout(refreshToken) {
    return await refreshTokenRepository.revokeToken(refreshToken);
  }

  /**
   * Logout de tots els dispositius
   * @param {number} userId 
   * @returns {Promise<number>}
   */
  async logoutAll(userId) {
    return await refreshTokenRepository.revokeAllUserTokens(userId);
  }

  /**
   * Generar access token (curt)
   * @param {object} user 
   * @returns {string}
   */
  generateAccessToken(user) {
    const payload = {
      userId: user.id,
      email: user.email,
      rol: user.rol
    };

    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
      issuer: 'serveis-extraordinaris-api'
    });
  }

  /**
   * Generar refresh token (llarg)
   * @param {object} user 
   * @returns {string}
   */
  generateRefreshToken(user) {
    const payload = {
      userId: user.id,
      type: 'refresh'
    };

    return jwt.sign(payload, JWT_REFRESH_SECRET, {
      expiresIn: JWT_REFRESH_EXPIRES_IN,
      issuer: 'serveis-extraordinaris-api'
    });
  }

  /**
   * Verificar access token
   * @param {string} token 
   * @returns {object} Payload decodificat
   */
  verifyAccessToken(token) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      throw new UnauthorizedError('Token d\'accés invàlid o expirat');
    }
  }

  /**
   * Convertir string d'expiry a millisegons
   * @param {string} expiry - Ex: '15m', '7d', '24h'
   * @returns {number} Millisegons
   */
  parseExpiry(expiry) {
    const match = expiry.match(/^(\d+)([smhd])$/);
    if (!match) return 900000; // 15m per defecte

    const [, value, unit] = match;
    const multipliers = {
      s: 1000,
      m: 60000,
      h: 3600000,
      d: 86400000
    };

    return parseInt(value) * multipliers[unit];
  }
}

export default new AuthService();
