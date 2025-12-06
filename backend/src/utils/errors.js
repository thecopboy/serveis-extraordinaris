// Classe base per errors personalitzats
export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // Error controlat (no bug del sistema)
    Error.captureStackTrace(this, this.constructor);
  }
}

// 400 - Bad Request
export class BadRequestError extends AppError {
  constructor(message = 'Bad Request') {
    super(message, 400);
  }
}

// 401 - Unauthorized
export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401);
  }
}

// 403 - Forbidden
export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403);
  }
}

// 404 - Not Found
export class NotFoundError extends AppError {
  constructor(resource = 'Recurs') {
    super(`${resource} no trobat`, 404);
  }
}

// 409 - Conflict
export class ConflictError extends AppError {
  constructor(message = 'Conflict') {
    super(message, 409);
  }
}

// 422 - Unprocessable Entity (validació)
export class ValidationError extends AppError {
  constructor(message = 'Validation Error', errors = []) {
    super(message, 422);
    this.errors = errors;
  }
}

// 500 - Internal Server Error
export class InternalServerError extends AppError {
  constructor(message = 'Internal Server Error') {
    super(message, 500);
  }
}

// Helper per detectar si és un error PostgreSQL
export const isDatabaseError = (error) => {
  // Codis d'error PostgreSQL: https://www.postgresql.org/docs/current/errcodes-appendix.html
  // 08xxx - Connection errors
  // 22xxx - Data exceptions
  // 23xxx - Integrity constraint violations
  // 42xxx - Syntax errors or access rule violations
  return error.code && /^(08|22|23|42)/.test(error.code);
};

// Helper per convertir errors PostgreSQL a errors llegibles
export const parseDatabaseError = (error) => {
  // 23505 - Unique violation
  if (error.code === '23505') {
    const match = error.detail?.match(/Key \((.*?)\)=\((.*?)\)/);
    const field = match ? match[1] : 'field';
    return new ConflictError(`${field} already exists`);
  }
  
  // 23503 - Foreign key violation
  if (error.code === '23503') {
    return new BadRequestError('Referenced resource does not exist');
  }
  
  // 23502 - Not null violation
  if (error.code === '23502') {
    const field = error.column || 'field';
    return new BadRequestError(`${field} is required`);
  }
  
  // 22xxx - Data exceptions
  if (error.code.startsWith('22')) {
    return new BadRequestError('Invalid data format');
  }
  
  // 42xxx - Syntax/access errors
  if (error.code.startsWith('42')) {
    return new InternalServerError('Database query error');
  }
  
  // 08xxx - Connection errors
  if (error.code.startsWith('08')) {
    return new InternalServerError('Database connection error');
  }
  
  // Altres errors de BD
  return new InternalServerError('Database error');
};
