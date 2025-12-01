import authService from '../services/authService.js';
import userRepository from '../repositories/userRepository.js';

/**
 * Middleware per verificar JWT i autenticar usuari
 */
export const authenticate = async (req, res, next) => {
  try {
    // Obtenir token del header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'UNAUTHORIZED',
        message: 'Token d\'accés no proporcionat'
      });
    }

    const token = authHeader.substring(7); // Treure "Bearer "

    // Verificar token
    const decoded = authService.verifyAccessToken(token);

    // Obtenir usuari de la BD
    const user = await userRepository.getUserById(decoded.userId);

    if (!user || !user.actiu) {
      return res.status(401).json({
        error: 'UNAUTHORIZED',
        message: 'Usuari no vàlid o desactivat'
      });
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
  } catch (error) {
    if (error.message === 'INVALID_ACCESS_TOKEN') {
      return res.status(401).json({
        error: 'INVALID_TOKEN',
        message: 'Token d\'accés invàlid o expirat'
      });
    }

    req.log.error({ err: error }, 'Error en middleware authenticate');
    return res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Error intern del servidor'
    });
  }
};

/**
 * Middleware per verificar rols
 * @param {...string} allowedRoles - Rols permesos
 */
export const authorize = (...allowedRols) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'UNAUTHORIZED',
        message: 'Usuari no autenticat'
      });
    }

    if (!allowedRols.includes(req.user.rol)) {
      return res.status(403).json({
        error: 'FORBIDDEN',
        message: 'No tens permisos per accedir a aquest recurs'
      });
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
