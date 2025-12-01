import authService from '../services/authService.js';
import userRepository from '../repositories/userRepository.js';

/**
 * Controller per gestionar autenticació
 */
class AuthController {
  /**
   * POST /api/v1/auth/register
   * Registrar nou usuari
   */
  async register(req, res) {
    try {
      const userData = req.body;

      const user = await authService.register(userData);

      req.log.info({ userId: user.id }, 'Usuari registrat correctament');

      res.status(201).json({
        success: true,
        data: user,
        message: 'Usuari creat correctament'
      });
    } catch (error) {
      if (error.message === 'EMAIL_ALREADY_EXISTS') {
        return res.status(409).json({
          error: 'EMAIL_EXISTS',
          message: 'Aquest email ja està registrat'
        });
      }

      req.log.error({ err: error }, 'Error en registre d\'usuari');
      res.status(500).json({
        error: 'REGISTER_ERROR',
        message: 'Error en crear l\'usuari'
      });
    }
  }

  /**
   * POST /api/v1/auth/login
   * Login d'usuari
   */
  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          error: 'MISSING_FIELDS',
          message: 'Email i contrasenya són obligatoris'
        });
      }

      const userAgent = req.headers['user-agent'] || 'unknown';
      const ipAddress = req.ip || req.connection.remoteAddress;

      const result = await authService.login(email, password, userAgent, ipAddress);

      req.log.info({ userId: result.user.id }, 'Login correcte');

      res.json({
        success: true,
        data: result,
        message: 'Login correcte'
      });
    } catch (error) {
      if (error.message === 'INVALID_CREDENTIALS') {
        return res.status(401).json({
          error: 'INVALID_CREDENTIALS',
          message: 'Email o contrasenya incorrectes'
        });
      }

      if (error.message === 'USER_DEACTIVATED') {
        return res.status(403).json({
          error: 'USER_DEACTIVATED',
          message: 'Aquest usuari està desactivat'
        });
      }

      req.log.error({ err: error }, 'Error en login');
      res.status(500).json({
        error: 'LOGIN_ERROR',
        message: 'Error en el login'
      });
    }
  }

  /**
   * POST /api/v1/auth/refresh
   * Renovar access token
   */
  async refresh(req, res) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          error: 'MISSING_TOKEN',
          message: 'Refresh token no proporcionat'
        });
      }

      const userAgent = req.headers['user-agent'] || 'unknown';
      const ipAddress = req.ip || req.connection.remoteAddress;

      const result = await authService.refresh(refreshToken, userAgent, ipAddress);

      res.json({
        success: true,
        data: result,
        message: 'Token renovat correctament'
      });
    } catch (error) {
      if (error.message === 'INVALID_REFRESH_TOKEN') {
        return res.status(401).json({
          error: 'INVALID_REFRESH_TOKEN',
          message: 'Refresh token invàlid o expirat'
        });
      }

      if (error.message === 'USER_NOT_FOUND') {
        return res.status(404).json({
          error: 'USER_NOT_FOUND',
          message: 'Usuari no trobat'
        });
      }

      req.log.error({ err: error }, 'Error en refresh token');
      res.status(500).json({
        error: 'REFRESH_ERROR',
        message: 'Error en renovar el token'
      });
    }
  }

  /**
   * POST /api/v1/auth/logout
   * Logout (revocar refresh token)
   */
  async logout(req, res) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          error: 'MISSING_TOKEN',
          message: 'Refresh token no proporcionat'
        });
      }

      await authService.logout(refreshToken);

      req.log.info({ userId: req.user?.id }, 'Logout correcte');

      res.json({
        success: true,
        message: 'Logout correcte'
      });
    } catch (error) {
      req.log.error({ err: error }, 'Error en logout');
      res.status(500).json({
        error: 'LOGOUT_ERROR',
        message: 'Error en el logout'
      });
    }
  }

  /**
   * POST /api/v1/auth/logout-all
   * Logout de tots els dispositius
   */
  async logoutAll(req, res) {
    try {
      const userId = req.user.id;

      const count = await authService.logoutAll(userId);

      req.log.info({ userId, tokensRevoked: count }, 'Logout de tots els dispositius');

      res.json({
        success: true,
        data: { tokensRevoked: count },
        message: `S'han revocat ${count} tokens`
      });
    } catch (error) {
      req.log.error({ err: error }, 'Error en logout-all');
      res.status(500).json({
        error: 'LOGOUT_ALL_ERROR',
        message: 'Error en revocar els tokens'
      });
    }
  }

  /**
   * GET /api/v1/auth/me
   * Obtenir informació de l'usuari actual
   */
  async me(req, res) {
    try {
      const user = await userRepository.getUserById(req.user.id);

      if (!user) {
        return res.status(404).json({
          error: 'USER_NOT_FOUND',
          message: 'Usuari no trobat'
        });
      }

      delete user.password_hash;

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      req.log.error({ err: error }, 'Error en obtenir usuari actual');
      res.status(500).json({
        error: 'GET_ME_ERROR',
        message: 'Error en obtenir l\'usuari'
      });
    }
  }
}

export default new AuthController();
