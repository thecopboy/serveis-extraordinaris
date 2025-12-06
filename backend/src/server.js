import app from './app.js';
import { testConnection, closePool } from './config/database.js';
import logger, { logError } from './utils/logger.js';
import { validateEnv, config } from './config/env.js';
import { startTokenCleanupJob } from './jobs/cleanupTokens.js';

// Validar variables d'entorn abans de començar
try {
  validateEnv();
  logger.info('Variables d\'entorn validades correctament');
} catch (error) {
  logger.error({ error: error.message }, 'Error validant variables d\'entorn');
  process.exit(1);
}

const PORT = config.server.port;
const HOST = config.server.host;

// Funció per iniciar el servidor
const startServer = async () => {
  try {
    // Testejar connexió a PostgreSQL
    logger.info('Connectant a PostgreSQL...');
    await testConnection();
    
    // Iniciar servidor Express
    const server = app.listen(PORT, HOST, () => {
      logger.info({
        url: `http://${HOST}:${PORT}`,
        environment: process.env.NODE_ENV,
        nodeVersion: process.version,
      }, 'Servidor iniciat correctament');
      
      // Iniciar job de neteja de tokens (només en producció)
      if (process.env.NODE_ENV === 'production') {
        startTokenCleanupJob();
      } else {
        logger.info('Job de neteja de tokens desactivat (només producció)');
      }
    });
    
    // Gestió de shutdown graciós
    const gracefulShutdown = async (signal) => {
      logger.warn({ signal }, 'Senyal de shutdown rebuda');
      
      server.close(async () => {
        logger.info('Servidor HTTP tancat');
        
        try {
          await closePool();
          logger.info('Shutdown completat correctament');
          process.exit(0);
        } catch (error) {
          logError(error, { context: 'Graceful Shutdown' });
          process.exit(1);
        }
      });
      
      // Forçar shutdown després de 10 segons
      setTimeout(() => {
        logger.error('Shutdown forçat després de 10s');
        process.exit(1);
      }, 10000);
    };
    
    // Escoltar senyals de shutdown
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    
  } catch (error) {
    logError(error, { context: 'Server Startup' });
    process.exit(1);
  }
};

// Iniciar servidor
startServer();
