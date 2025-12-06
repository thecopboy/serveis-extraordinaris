import authService from '../services/authService.js';
import userRepository from '../repositories/userRepository.js';
import { NotFoundError } from '../utils/errors.js';

/**
 * Controller per gestionar autenticació
 */
class AuthController {
  /**
   * POST /api/v1/auth/register
   * Registrar nou usuari
   */
  async register(req, res, next) {
    const userData = req.body;
    const user = await authService.register(userData);

    req.log.info({ userId: user.id }, 'Usuari registrat correctament');

    res.status(201).json({
      success: true,
      data: user,
      message: 'Usuari creat correctament'
    });
  }

  /**
   * POST /api/v1/auth/login
   * Login d'usuari
   */
  async login(req, res, next) {
    const { email, password } = req.body;
    const userAgent = req.headers['user-agent'] || 'unknown';
    const ipAddress = req.ip || req.connection.remoteAddress;

    const result = await authService.login(email, password, userAgent, ipAddress);

    req.log.info({ userId: result.user.id }, 'Login correcte');

    res.json({
      success: true,
      data: result,
      message: 'Login correcte'
    });
  }

  /**
   * POST /api/v1/auth/refresh
   * Renovar access token
   */
  async refresh(req, res, next) {
    const { refreshToken } = req.body;
    const userAgent = req.headers['user-agent'] || 'unknown';
    const ipAddress = req.ip || req.connection.remoteAddress;

    const result = await authService.refresh(refreshToken, userAgent, ipAddress);

    res.json({
      success: true,
      data: result,
      message: 'Token renovat correctament'
    });
  }

  /**
   * POST /api/v1/auth/logout
   * Logout (revocar refresh token)
   */
  async logout(req, res, next) {
    const { refreshToken } = req.body;
    await authService.logout(refreshToken);

    req.log.info({ userId: req.user?.id }, 'Logout correcte');

    res.json({
      success: true,
      message: 'Logout correcte'
    });
  }

  /**
   * POST /api/v1/auth/logout-all
   * Logout de tots els dispositius
   */
  async logoutAll(req, res, next) {
    const userId = req.user.id;
    const count = await authService.logoutAll(userId);

    req.log.info({ userId, tokensRevoked: count }, 'Logout de tots els dispositius');

    res.json({
      success: true,
      data: { tokensRevoked: count },
      message: `S'han revocat ${count} tokens`
    });
  }

  /**
   * GET /api/v1/auth/me
   * Obtenir informació de l'usuari actual
   */
  async me(req, res, next) {
    const user = await userRepository.getUserById(req.user.id);

    if (!user) {
      throw new NotFoundError('Usuari');
    }

    delete user.password_hash;

    res.json({
      success: true,
      data: user
    });
  }
}

export default new AuthController();
