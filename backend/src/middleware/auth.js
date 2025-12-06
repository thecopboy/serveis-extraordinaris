import authService from '../services/authService.js';
import userRepository from '../repositories/userRepository.js';
import { UnauthorizedError, ForbiddenError } from '../utils/errors.js';
import { asyncHandler } from './errorHandler.js';

/**
 * Middleware per verificar JWT i autenticar usuari
 */
const authenticateInternal = async (req, res, next) => {
  // Obtenir token del header Authorization
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError('Token d\'accés no proporcionat');
  }

  const token = authHeader.substring(7); // Treure "Bearer "

  // Verificar token (authService llança UnauthorizedError si és invàlid)
  const decoded = authService.verifyAccessToken(token);

  // Obtenir usuari de la BD
  const user = await userRepository.getUserById(decoded.userId);

  if (!user || !user.actiu) {
    throw new UnauthorizedError('Usuari no vàlid o desactivat');
  }

  // Afegir usuari al request
  req.user = {
    id: user.id,
    email: user.email,
    rol: user.rol,
    nom: user.nom,
    cognom_1: user.cognom_1
  };

  next();
};

export const authenticate = asyncHandler(authenticateInternal);

/**
 * Middleware per verificar rols
 * @param {...string} allowedRoles - Rols permesos
 */
export const authorize = (...allowedRols) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new UnauthorizedError('Usuari no autenticat');
    }

    if (!allowedRols.includes(req.user.rol)) {
      throw new ForbiddenError('No tens permisos per accedir a aquest recurs');
    }

    next();
  };
};

/**
 * Middleware opcional - No fa res si no hi ha token
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.substring(7);
    const decoded = authService.verifyAccessToken(token);
    const user = await userRepository.getUserById(decoded.userId);

    if (user && user.actiu) {
      req.user = {
        id: user.id,
        email: user.email,
        rol: user.rol
      };
    }

    next();
  } catch (error) {
    // Si falla, simplement no afegim user al request
    next();
  }
};
