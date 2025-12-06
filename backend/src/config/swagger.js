import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Serveis Extraordinaris API',
      version: '1.0.0',
      description: 'API per la gestió de serveis extraordinaris dels bombers',
      contact: {
        name: 'Pau López (themacboy)',
        email: 'themacboy72@gmail.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000/api/v1',
        description: 'Servidor de desenvolupament',
      },
      {
        url: 'https://api.serveisextraordinaris.com/api/v1',
        description: 'Servidor de producció',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Introdueix el token JWT rebut al fer login',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            error: {
              type: 'string',
              example: 'VALIDATION_ERROR',
            },
            message: {
              type: 'string',
              example: 'Les dades proporcionades no són vàlides',
            },
            statusCode: {
              type: 'integer',
              example: 400,
            },
            details: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string' },
                  message: { type: 'string' },
                },
              },
            },
            requestId: {
              type: 'string',
              example: '123e4567-e89b-12d3-a456-426614174000',
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 1,
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'usuari@example.com',
            },
            nom: {
              type: 'string',
              example: 'Joan',
            },
            cognom_1: {
              type: 'string',
              nullable: true,
              example: 'Garcia',
            },
            cognom_2: {
              type: 'string',
              nullable: true,
              example: 'Pérez',
            },
            numero_professional: {
              type: 'string',
              nullable: true,
              example: 'B12345',
            },
            rol: {
              type: 'string',
              enum: ['admin', 'tecnic', 'usuari'],
              example: 'usuari',
            },
            actiu: {
              type: 'boolean',
              example: true,
            },
            data_registre_inicial: {
              type: 'string',
              format: 'date-time',
              example: '2025-12-06T10:00:00Z',
            },
          },
        },
        RegisterRequest: {
          type: 'object',
          required: ['email', 'password', 'nom', 'rol'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              example: 'usuari@example.com',
              description: 'Email únic de l\'usuari',
            },
            password: {
              type: 'string',
              format: 'password',
              minLength: 8,
              example: 'Password123!',
              description: 'Contrasenya (mínim 8 caràcters, 1 majúscula, 1 minúscula, 1 número, 1 especial)',
            },
            nom: {
              type: 'string',
              minLength: 2,
              maxLength: 100,
              example: 'Joan',
              description: 'Nom de l\'usuari',
            },
            cognom_1: {
              type: 'string',
              nullable: true,
              example: 'Garcia',
              description: 'Primer cognom (opcional)',
            },
            cognom_2: {
              type: 'string',
              nullable: true,
              example: 'Pérez',
              description: 'Segon cognom (opcional)',
            },
            numero_professional: {
              type: 'string',
              nullable: true,
              example: 'B12345',
              description: 'Número professional de bomber (opcional)',
            },
            rol: {
              type: 'string',
              enum: ['admin', 'tecnic', 'usuari'],
              example: 'usuari',
              description: 'Rol de l\'usuari',
            },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              example: 'usuari@example.com',
            },
            password: {
              type: 'string',
              format: 'password',
              example: 'Password123!',
            },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            data: {
              type: 'object',
              properties: {
                accessToken: {
                  type: 'string',
                  description: 'JWT token per autenticació (expira en 15 minuts)',
                  example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                },
                refreshToken: {
                  type: 'string',
                  description: 'Token per renovar l\'access token (expira en 7 dies)',
                  example: 'a1b2c3d4e5f6g7h8i9j0...',
                },
                user: {
                  $ref: '#/components/schemas/User',
                },
              },
            },
          },
        },
        RefreshRequest: {
          type: 'object',
          required: ['refreshToken'],
          properties: {
            refreshToken: {
              type: 'string',
              description: 'Refresh token rebut al fer login o registre',
              example: 'a1b2c3d4e5f6g7h8i9j0...',
            },
          },
        },
        LogoutRequest: {
          type: 'object',
          required: ['refreshToken'],
          properties: {
            refreshToken: {
              type: 'string',
              description: 'Refresh token a revocar',
              example: 'a1b2c3d4e5f6g7h8i9j0...',
            },
          },
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            message: {
              type: 'string',
              example: 'Operació realitzada correctament',
            },
          },
        },
      },
    },
    tags: [
      {
        name: 'Auth',
        description: 'Endpoints d\'autenticació i gestió de sessions',
      },
    ],
  },
  apis: ['./src/routes/*.js'], // Fitxers on buscar anotacions JSDoc
};

export const swaggerSpec = swaggerJsdoc(options);
