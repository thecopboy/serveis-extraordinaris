import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import logger from './utils/logger.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { requestId } from './middleware/requestId.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import { config } from './config/env.js';

const app = express();

// Request ID únic per cada petició (traçabilitat)
app.use(requestId);

// Middleware de seguretat
app.use(helmet());

// CORS
app.use(cors({
  origin: config.cors.origin,
  credentials: true
}));

// Parsing de JSON i URL-encoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiter global per tota l'API (aplicat DESPRÉS del parsing)
app.use('/api/', apiLimiter);

// Adjuntar logger a cada petició
app.use((req, res, next) => {
  req.log = logger;
  next();
});

// Logger personalitzat per peticions HTTP
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      requestId: req.id,
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    };
    
    if (res.statusCode >= 500) {
      logger.error(logData, 'HTTP Request');
    } else if (res.statusCode >= 400) {
      logger.warn(logData, 'HTTP Request');
    } else {
      logger.info(logData, 'HTTP Request');
    }
  });
  
  next();
});

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    // Comprovar connexió a PostgreSQL
    const { testConnection } = await import('./config/database.js');
    await testConnection();
    
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: config.node.env,
      database: 'connected',
      memory: {
        used: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
        total: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`,
      },
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      environment: config.node.env,
      database: 'disconnected',
      error: error.message,
    });
  }
});

// Ruta de benvinguda
app.get('/', (req, res) => {
  res.json({
    message: '🚀 API Serveis Extraordinaris',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      api: '/api/v1'
    }
  });
});

// Ruta base de l'API
app.get('/api/v1', (req, res) => {
  res.json({
    message: 'API v1 - Serveis Extraordinaris',
    status: 'ready',
    endpoints: {
      auth: '/api/v1/auth'
    }
  });
});

// ========================================
// RUTES DE L'API
// ========================================

// Importar i registrar rutes d'autenticació
import authRoutes from './routes/authRoutes.js';
app.use('/api/v1/auth', authRoutes);

// ========================================

// Ruta de test d'errors (només development)
if (process.env.NODE_ENV === 'development') {
  app.get('/api/v1/test-errors/:type', async (req, res, next) => {
    try {
      const { NotFoundError, ValidationError, BadRequestError } = await import('./utils/errors.js');
      
      switch (req.params.type) {
        case 'not-found':
          throw new NotFoundError('Test Resource');
        case 'validation':
          throw new ValidationError('Validation failed', [
            { field: 'email', message: 'Invalid email format' },
            { field: 'password', message: 'Password too short' }
          ]);
        case 'bad-request':
          throw new BadRequestError('Invalid request parameters');
        case 'server-error':
          throw new Error('Unexpected server error');
        default:
          res.json({ message: 'Use: not-found, validation, bad-request, server-error' });
      }
    } catch (error) {
      next(error);
    }
  });
}

// Gestió de rutes no trobades (404)
app.use(notFoundHandler);

// Gestió centralitzada d'errors
app.use(errorHandler);

export default app;
