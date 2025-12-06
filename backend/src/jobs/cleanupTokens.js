import cron from 'node-cron';
import pool from '../config/database.js';

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
    console.log(`✅ Neteja de tokens completada: ${count} tokens eliminats`);
    return count;
  } catch (error) {
    console.error('❌ Error en la neteja de tokens:', error.message);
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
    console.log('⏸️  Job de neteja de tokens desactivat (CLEANUP_ENABLED=false)');
    return;
  }
  
  // Programar execució
  cron.schedule(schedule, async () => {
    console.log(`🧹 [${new Date().toISOString()}] Iniciant neteja automàtica de tokens...`);
    try {
      await cleanupExpiredTokens();
    } catch (error) {
      console.error('❌ Error durant la neteja programada:', error.message);
    }
  });
  
  console.log(`⏰ Job de neteja de tokens programat: ${schedule}`);
  console.log('   (Cada dia a les 3:00 AM en producció)');
}

// Permet executar manualment: node --env-file=.env src/jobs/cleanupTokens.js --run-now
if (process.argv[2] === '--run-now') {
  console.log('🧹 Executant neteja manual de tokens...');
  cleanupExpiredTokens()
    .then(count => {
      console.log(`✅ Neteja completada: ${count} tokens eliminats`);
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Error:', error.message);
      process.exit(1);
    });
}
