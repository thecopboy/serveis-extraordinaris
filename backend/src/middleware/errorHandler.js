import { logError } from '../utils/logger.js';
import { AppError, isDatabaseError, parseDatabaseError } from '../utils/errors.js';

// Middleware de gestió d'errors
export const errorHandler = (err, req, res, next) => {
  let error = err;
  
  // Convertir errors PostgreSQL a errors llegibles
  if (isDatabaseError(err)) {
    error = parseDatabaseError(err);
  }
  
  // Si no és un AppError, convertir-lo
  if (!(error instanceof AppError)) {
    error = new AppError(
      error.message || 'Internal Server Error',
      error.statusCode || 500
    );
  }
  
  // Log de l'error amb context
  const logContext = {
    requestId: req.id,
    method: req.method,
    url: req.url,
    ip: req.ip,
    userId: req.user?.id, // Si hi ha usuari autenticat
    body: req.body,
    params: req.params,
    query: req.query,
  };
  
  // Només loggem stack trace en errors no operacionals (bugs reals)
  if (error.isOperational) {
    logError(error, logContext);
  } else {
    console.error('💥 Error no controlat:', err);
    logError(err, { ...logContext, isOperational: false });
  }
  
  // Preparar resposta
  const response = {
    error: true,
    message: error.message,
    statusCode: error.statusCode,
  };
  
  // Afegir errors de validació si existeixen
  if (error.errors && Array.isArray(error.errors)) {
    response.errors = error.errors;
  }
  
  // En development, afegir stack trace
  if (process.env.NODE_ENV === 'development') {
    response.stack = error.stack;
  }
  
  // Enviar resposta
  res.status(error.statusCode).json(response);
};

// Middleware per capturar rutes no trobades (404)
export const notFoundHandler = (req, res, next) => {
  const error = new AppError(
    `Route ${req.method} ${req.originalUrl} not found`,
    404
  );
  next(error);
};

// Middleware per capturar errors async (evita try-catch a tots els controllers)
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
