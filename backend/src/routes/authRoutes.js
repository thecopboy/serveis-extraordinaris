import express from 'express';
import authController from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   POST /api/v1/auth/register
 * @desc    Registrar nou usuari
 * @access  Public
 */
router.post('/register', authController.register);

/**
 * @route   POST /api/v1/auth/login
 * @desc    Login d'usuari (retorna access + refresh token)
 * @access  Public
 */
router.post('/login', authController.login);

/**
 * @route   POST /api/v1/auth/refresh
 * @desc    Renovar access token amb refresh token
 * @access  Public
 */
router.post('/refresh', authController.refresh);

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Logout (revocar refresh token)
 * @access  Private
 */
router.post('/logout', authController.logout);

/**
 * @route   POST /api/v1/auth/logout-all
 * @desc    Logout de tots els dispositius
 * @access  Private
 */
router.post('/logout-all', authenticate, authController.logoutAll);

/**
 * @route   GET /api/v1/auth/me
 * @desc    Obtenir informació de l'usuari actual
 * @access  Private
 */
router.get('/me', authenticate, authController.me);

export default router;
