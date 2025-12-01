import { randomUUID } from 'crypto';

// Middleware per afegir Request ID únic a cada petició
export const requestId = (req, res, next) => {
  // Intentar obtenir Request ID del header (per traçabilitat distribuïda)
  const requestId = req.headers['x-request-id'] || randomUUID();
  
  // Afegir a la request
  req.id = requestId;
  
  // Afegir al response header
  res.setHeader('X-Request-ID', requestId);
  
  next();
};
