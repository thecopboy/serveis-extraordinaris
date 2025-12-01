import pg from 'pg';
import logger, { logQuery, logError } from '../utils/logger.js';
import { config } from './env.js';

const { Pool } = pg;

// Configuració del pool de connexions
const pool = new Pool({
  host: config.database.host,
  port: config.database.port,
  user: config.database.user,
  password: config.database.password,
  database: config.database.name,
  max: 20, // Màxim de connexions al pool
  idleTimeoutMillis: 30000, // Temps màxim d'inactivitat
  connectionTimeoutMillis: 2000, // Temps màxim per connectar
});

// Event listeners per monitoritzar el pool
pool.on('connect', () => {
  logger.debug('Nova connexió establerta amb PostgreSQL');
});

pool.on('error', (err) => {
  logError(err, { context: 'PostgreSQL Pool' });
  process.exit(-1);
});

// Funció per testejar la connexió
export const testConnection = async () => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    logger.info({ timestamp: result.rows[0].now }, 'Connexió a PostgreSQL exitosa');
    client.release();
    return true;
  } catch (error) {
    logError(error, { context: 'PostgreSQL Connection Test' });
    throw error;
  }
};

// Query helper amb gestió d'errors
export const query = async (text, params) => {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    
    logQuery(text, duration, result.rowCount);
    
    return result;
  } catch (error) {
    logError(error, { context: 'Database Query', query: text });
    throw error;
  }
};

// Funció per obtenir un client per transaccions
export const getClient = async () => {
  const client = await pool.connect();
  
  const originalRelease = client.release.bind(client);
  
  // Timeout per alliberar automàticament després de 5 segons
  const timeout = setTimeout(() => {
    logger.warn('Client no alliberat després de 5 segons');
    originalRelease();
  }, 5000);
  
  // Override release per netejar timeout
  client.release = () => {
    clearTimeout(timeout);
    client.release = originalRelease;
    return originalRelease();
  };
  
  return client;
};

// Tancar totes les connexions (per shutdown graciós)
export const closePool = async () => {
  await pool.end();
  logger.info('Pool de PostgreSQL tancat');
};

export default pool;
