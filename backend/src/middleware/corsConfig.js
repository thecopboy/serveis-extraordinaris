import { config } from '../config/env.js';
import logger from '../utils/logger.js';

/**
 * Configuració avançada de CORS amb whitelist d'origins
 * 
 * Permet múltiples origins des de variables d'entorn i valida cada petició
 * contra la whitelist. Això evita que origins no autoritzats puguin accedir
 * a l'API.
 */

// Parsejar origins permesos des de variable d'entorn
// Format esperat: "http://localhost:3000,http://localhost:5173,https://app.bombers.cat"
const allowedOrigins = config.cors.origins
  ? config.cors.origins.split(',').map(origin => origin.trim())
  : ['http://localhost:3000']; // Fallback per defecte

logger.info({ allowedOrigins }, 'CORS origins configurats');

/**
 * Opcions de configuració CORS
 */
export const corsOptions = {
  /**
   * Funció que valida l'origin de cada petició
   * @param {string} origin - Origin de la petició (header Origin)
   * @param {function} callback - Callback(error, allow)
   */
  origin: (origin, callback) => {
    // Permetre peticions sense origin (aplicacions mòbils, Postman, curl, etc.)
    if (!origin) {
      logger.debug('Petició sense origin (Postman/curl/app mòbil) - permesa');
      return callback(null, true);
    }

    // Comprovar si l'origin està a la whitelist
    if (allowedOrigins.includes(origin)) {
      logger.debug({ origin }, 'Origin permès per CORS');
      callback(null, true);
    } else {
      logger.warn({ origin, allowedOrigins }, 'Origin bloquejat per CORS');
      callback(new Error(`Origin ${origin} no permès per la política CORS`));
    }
  },

  /**
   * Permetre credentials (cookies, headers d'autenticació)
   * Necessari per JWT en headers Authorization
   */
  credentials: true,

  /**
   * Mètodes HTTP permesos
   */
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],

  /**
   * Headers permesos en les peticions
   */
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
  ],

  /**
   * Headers exposats en les respostes
   * Permet al client accedir a aquests headers
   */
  exposedHeaders: [
    'X-Total-Count',
    'X-Page',
    'X-Per-Page',
    'RateLimit-Limit',
    'RateLimit-Remaining',
    'RateLimit-Reset',
  ],

  /**
   * Temps de cache per preflight requests (OPTIONS)
   * 86400 segons = 24 hores
   */
  maxAge: 86400,

  /**
   * Permetre que el navegador envïi el header Origin
   */
  optionsSuccessStatus: 204,
};

/**
 * Middleware per gestionar errors de CORS
 */
export function corsErrorHandler(err, req, res, next) {
  if (err.message && err.message.includes('CORS')) {
    logger.error(
      {
        origin: req.headers.origin,
        method: req.method,
        path: req.path,
        ip: req.ip,
      },
      'Error de CORS: origin no permès'
    );

    return res.status(403).json({
      success: false,
      error: 'CORS_ERROR',
      message: 'Origin no permès. Contacta amb l\'administrador.',
      statusCode: 403,
    });
  }

  next(err);
}

export default corsOptions;
