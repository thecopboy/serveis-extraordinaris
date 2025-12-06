import cron from 'node-cron';
import pool from '../config/database.js';
import logger from '../utils/logger.js';

/**
 * Elimina tokens expirats i revocats de la base de dades
 * @returns {Promise<number>} Nombre de tokens eliminats
 */
export async function cleanupExpiredTokens() {
  try {
    const result = await pool.query(`
      DELETE FROM refresh_tokens
      WHERE expira_at < NOW() OR revocat = true
    `);
    
    const count = result.rowCount;
    logger.info({ tokensDeleted: count }, 'Neteja de tokens completada');
    return count;
  } catch (error) {
    logger.error({ error: error.message, stack: error.stack }, 'Error en la neteja de tokens');
    throw error;
  }
}

/**
 * Inicia el job de neteja automàtica de tokens
 * S'executa cada dia a les 3:00 AM
 */
export function startTokenCleanupJob() {
  const schedule = process.env.CLEANUP_SCHEDULE || '0 3 * * *';
  const enabled = process.env.CLEANUP_ENABLED !== 'false';
  
  if (!enabled) {
    logger.info('Job de neteja de tokens desactivat (CLEANUP_ENABLED=false)');
    return;
  }
  
  // Programar execució
  cron.schedule(schedule, async () => {
    logger.info('Iniciant neteja automàtica de tokens...');
    try {
      await cleanupExpiredTokens();
    } catch (error) {
      logger.error({ error: error.message }, 'Error durant la neteja programada');
    }
  });
  
  logger.info({ schedule }, 'Job de neteja de tokens programat');
}

// Permet executar manualment: node --env-file=.env src/jobs/cleanupTokens.js --run-now
if (process.argv[2] === '--run-now') {
  logger.info('Executant neteja manual de tokens...');
  cleanupExpiredTokens()
    .then(count => {
      logger.info({ tokensDeleted: count }, 'Neteja manual completada');
      process.exit(0);
    })
    .catch(error => {
      logger.error({ error: error.message, stack: error.stack }, 'Error en neteja manual');
      process.exit(1);
    });
}
