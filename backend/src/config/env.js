// Validació i càrrega de variables d'entorn
const requiredEnvVars = [
  'DB_HOST',
  'DB_PORT',
  'DB_USER',
  'DB_PASSWORD',
  'DB_NAME',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
];

const optionalEnvVars = {
  NODE_ENV: 'development',
  PORT: '5000',
  HOST: 'localhost',
  CORS_ORIGIN: 'http://localhost:3000',
  LOG_LEVEL: 'info',
  JWT_ACCESS_EXPIRES_IN: '15m',
  JWT_REFRESH_EXPIRES_IN: '7d',
};

// Validar variables obligatòries
export const validateEnv = () => {
  const missing = [];
  
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  }
  
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      `Please check your .env file.`
    );
  }
  
  // Aplicar valors per defecte per variables opcionals
  for (const [key, defaultValue] of Object.entries(optionalEnvVars)) {
    if (!process.env[key]) {
      process.env[key] = defaultValue;
    }
  }
  
  // Validar que DB_PORT és un número vàlid
  const dbPort = parseInt(process.env.DB_PORT, 10);
  if (isNaN(dbPort) || dbPort < 1 || dbPort > 65535) {
    throw new Error(`Invalid DB_PORT: ${process.env.DB_PORT}. Must be a number between 1 and 65535.`);
  }
  
  // Validar que PORT és un número vàlid
  const port = parseInt(process.env.PORT, 10);
  if (isNaN(port) || port < 1 || port > 65535) {
    throw new Error(`Invalid PORT: ${process.env.PORT}. Must be a number between 1 and 65535.`);
  }
  
  return true;
};

// Exportar configuració validada
export const config = {
  node: {
    env: process.env.NODE_ENV,
  },
  server: {
    port: parseInt(process.env.PORT, 10),
    host: process.env.HOST,
  },
  database: {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    name: process.env.DB_NAME,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
  },
  cors: {
    origin: process.env.CORS_ORIGIN,
  },
  logging: {
    level: process.env.LOG_LEVEL,
  },
};
