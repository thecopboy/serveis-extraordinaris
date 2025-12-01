import pino from 'pino';

// Configuració del logger segons l'entorn
const isDevelopment = process.env.NODE_ENV === 'development';
const logLevel = process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info');

// Opcions del logger
const loggerOptions = {
  level: logLevel,
  // En development: format amb colors i llegible
  // En production: JSON per processar després
  ...(isDevelopment && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
        singleLine: false,
      },
    },
  }),
  // En production: JSON estructurat
  ...(!isDevelopment && {
    formatters: {
      level: (label) => {
        return { level: label };
      },
    },
    timestamp: () => `,"time":"${new Date().toISOString()}"`,
  }),
};

// Crear instància del logger
const logger = pino(loggerOptions);

// Helper per logs de peticions HTTP
export const logRequest = (req, res, duration) => {
  const logData = {
    method: req.method,
    url: req.url,
    status: res.statusCode,
    duration: `${duration}ms`,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('user-agent'),
  };

  if (res.statusCode >= 500) {
    logger.error(logData, 'HTTP Request Error');
  } else if (res.statusCode >= 400) {
    logger.warn(logData, 'HTTP Request Warning');
  } else {
    logger.info(logData, 'HTTP Request');
  }
};

// Helper per logs de base de dades
export const logQuery = (query, duration, rows) => {
  if (isDevelopment) {
    logger.debug({
      query: query.substring(0, 100) + (query.length > 100 ? '...' : ''),
      duration: `${duration}ms`,
      rows,
    }, 'Database Query');
  }
};

// Helper per logs d'errors
export const logError = (error, context = {}) => {
  logger.error({
    error: {
      message: error.message,
      stack: error.stack,
      name: error.name,
    },
    ...context,
  }, 'Application Error');
};

export default logger;
