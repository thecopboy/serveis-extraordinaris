import { body, validationResult } from 'express-validator';

/**
 * Middleware per processar els resultats de la validació
 * Si hi ha errors, retorna un 400 amb els missatges d'error
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

/**
 * Validació per al registre d'usuaris
 */
const validateRegister = [
  body('nom')
    .trim()
    .notEmpty().withMessage('El nom és obligatori')
    .isLength({ min: 2, max: 100 }).withMessage('El nom ha de tenir entre 2 i 100 caràcters'),
  
  body('email')
    .trim()
    .notEmpty().withMessage("L'email és obligatori")
    .isEmail().withMessage("L'email no és vàlid")
    .normalizeEmail()
    .isLength({ max: 255 }).withMessage("L'email és massa llarg"),
  
  body('password')
    .notEmpty().withMessage('La contrasenya és obligatòria')
    .isLength({ min: 8 }).withMessage('La contrasenya ha de tenir almenys 8 caràcters')
    .matches(/[A-Z]/).withMessage('La contrasenya ha de contenir almenys una majúscula')
    .matches(/[a-z]/).withMessage('La contrasenya ha de contenir almenys una minúscula')
    .matches(/[0-9]/).withMessage('La contrasenya ha de contenir almenys un número')
    .matches(/[!@#$%^&*]/).withMessage('La contrasenya ha de contenir almenys un caràcter especial (!@#$%^&*)'),
  
  body('rol')
    .optional()
    .isIn(['admin', 'tecnic', 'usuari']).withMessage("El rol ha de ser 'admin', 'tecnic' o 'usuari'"),
  
  handleValidationErrors
];

/**
 * Validació per al login
 */
const validateLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage("L'email és obligatori")
    .isEmail().withMessage("L'email no és vàlid")
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('La contrasenya és obligatòria'),
  
  handleValidationErrors
];

/**
 * Validació per al refresh token
 */
const validateRefresh = [
  body('refreshToken')
    .notEmpty().withMessage('El refresh token és obligatori')
    .isString().withMessage('El refresh token ha de ser una cadena de text')
    .isLength({ min: 10 }).withMessage('El refresh token no és vàlid'),
  
  handleValidationErrors
];

/**
 * Validació per al logout
 */
const validateLogout = [
  body('refreshToken')
    .notEmpty().withMessage('El refresh token és obligatori')
    .isString().withMessage('El refresh token ha de ser una cadena de text')
    .isLength({ min: 10 }).withMessage('El refresh token no és vàlid'),
  
  handleValidationErrors
];

export {
  validateRegister,
  validateLogin,
  validateRefresh,
  validateLogout
};
