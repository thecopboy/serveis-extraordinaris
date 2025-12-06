import rateLimit from 'express-rate-limit';

/**
 * Rate limiter per login - Estricte
 * Prevé brute force attacks
 */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minuts
  max: 5, // Màxim 5 intents
  message: {
    error: true,
    message: 'Massa intents de login. Prova-ho de nou en 15 minuts.',
    statusCode: 429
  },
  standardHeaders: true, // Retorna info als headers `RateLimit-*`
  legacyHeaders: false, // Desactiva headers `X-RateLimit-*`
  skipSuccessfulRequests: false, // Comptar també els èxits (recomanat per login)
  handler: (req, res) => {
    req.log.warn({
      ip: req.ip,
      endpoint: req.path,
      remainingAttempts: 0
    }, 'Rate limit exceeded - Login');
    
    res.status(429).json({
      error: true,
      message: 'Massa intents de login. Prova-ho de nou en 15 minuts.',
      statusCode: 429,
      retryAfter: '15 minuts'
    });
  }
});

/**
 * Rate limiter per register - Molt estricte
 * Prevé creació massiva de comptes
 */
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 3, // Màxim 3 registres
  message: {
    error: true,
    message: 'Massa registres des d\'aquesta IP. Prova-ho de nou en 1 hora.',
    statusCode: 429
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // No comptar intents fallits (validació)
  handler: (req, res) => {
    req.log.warn({
      ip: req.ip,
      endpoint: req.path,
      body: req.body.email
    }, 'Rate limit exceeded - Register');
    
    res.status(429).json({
      error: true,
      message: 'Massa registres des d\'aquesta IP. Prova-ho de nou en 1 hora.',
      statusCode: 429,
      retryAfter: '1 hora'
    });
  }
});

/**
 * Rate limiter global per tota l'API - Moderat
 * Protegeix contra saturació general
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minuts
  max: 100, // Màxim 100 peticions
  message: {
    error: true,
    message: 'Massa peticions des d\'aquesta IP. Prova-ho de nou més tard.',
    statusCode: 429
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  handler: (req, res) => {
    req.log.warn({
      ip: req.ip,
      endpoint: req.path
    }, 'Rate limit exceeded - Global API');
    
    res.status(429).json({
      error: true,
      message: 'Massa peticions. Prova-ho de nou en 15 minuts.',
      statusCode: 429
    });
  }
});
