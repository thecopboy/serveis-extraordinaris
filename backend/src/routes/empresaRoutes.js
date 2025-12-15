import express from 'express';
import empresaController from '../controllers/empresaController.js';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { 
  validateCreateEmpresa, 
  validateUpdateEmpresa,
  validateFinalitzarEmpresa 
} from '../middleware/validators.js';

const router = express.Router();

// Totes les rutes d'empreses requereixen autenticació
router.use(authenticate);

/**
 * @swagger
 * /empreses:
 *   get:
 *     summary: Llistar empreses de l'usuari
 *     description: Retorna totes les empreses (actives i històriques) de l'usuari autenticat. Es pot filtrar per només actives.
 *     tags: [Empreses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: actives
 *         schema:
 *           type: boolean
 *         description: Si és true, només retorna empreses amb data_fi = NULL
 *     responses:
 *       200:
 *         description: Llista d'empreses
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Empresa'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/', asyncHandler(empresaController.getAll));

/**
 * @swagger
 * /empreses/{id}:
 *   get:
 *     summary: Obtenir detall d'una empresa
 *     description: Retorna les dades completes d'una empresa específica de l'usuari autenticat
 *     tags: [Empreses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'empresa
 *     responses:
 *       200:
 *         description: Detall de l'empresa
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Empresa'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/:id', asyncHandler(empresaController.getById));

/**
 * @swagger
 * /empreses:
 *   post:
 *     summary: Crear nova empresa
 *     description: Crea una nova empresa per a l'usuari autenticat
 *     tags: [Empreses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EmpresaInput'
 *     responses:
 *       201:
 *         description: Empresa creada correctament
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Empresa creada correctament
 *                 data:
 *                   $ref: '#/components/schemas/Empresa'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.post('/', validateCreateEmpresa, asyncHandler(empresaController.create));

/**
 * @swagger
 * /empreses/{id}:
 *   put:
 *     summary: Actualitzar empresa
 *     description: Actualitza les dades d'una empresa existent de l'usuari autenticat
 *     tags: [Empreses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'empresa
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EmpresaInput'
 *     responses:
 *       200:
 *         description: Empresa actualitzada correctament
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Empresa actualitzada correctament
 *                 data:
 *                   $ref: '#/components/schemas/Empresa'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.put('/:id', validateUpdateEmpresa, asyncHandler(empresaController.update));

/**
 * @swagger
 * /empreses/{id}:
 *   delete:
 *     summary: Eliminar empresa
 *     description: Elimina una empresa (soft delete) de l'usuari autenticat
 *     tags: [Empreses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'empresa
 *     responses:
 *       200:
 *         description: Empresa eliminada correctament
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Empresa eliminada correctament
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.delete('/:id', asyncHandler(empresaController.delete));

/**
 * @swagger
 * /empreses/{id}/finalitzar:
 *   patch:
 *     summary: Finalitzar relació laboral
 *     description: Marca que l'usuari ha deixat de treballar a aquesta empresa (assigna data_fi)
 *     tags: [Empreses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'empresa
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               data_fi:
 *                 type: string
 *                 format: date
 *                 description: Data de fi de la relació (si no s'indica, s'usa la data actual)
 *                 example: '2025-12-31'
 *     responses:
 *       200:
 *         description: Relació laboral finalitzada correctament
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Relació laboral finalitzada correctament
 *                 data:
 *                   $ref: '#/components/schemas/Empresa'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.patch('/:id/finalitzar', validateFinalitzarEmpresa, asyncHandler(empresaController.finalitzar));

export default router;
