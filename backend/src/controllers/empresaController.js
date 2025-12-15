import empresaService from '../services/empresaService.js';

/**
 * Controller per gestionar peticions d'empreses
 */
class EmpresaController {
  /**
   * GET /api/v1/empreses
   * Obtenir totes les empreses de l'usuari autenticat
   */
  async getAll(req, res) {
    const userId = req.user.id;
    const nomasActives = req.query.actives === 'true';
    
    const empreses = await empresaService.getAllByUserId(userId, nomasActives);
    
    res.json({
      success: true,
      data: empreses
    });
  }

  /**
   * GET /api/v1/empreses/:id
   * Obtenir detall d'una empresa
   */
  async getById(req, res) {
    const { id } = req.params;
    const userId = req.user.id;
    
    const empresa = await empresaService.getById(parseInt(id), userId);
    
    res.json({
      success: true,
      data: empresa
    });
  }

  /**
   * POST /api/v1/empreses
   * Crear nova empresa
   */
  async create(req, res) {
    const userId = req.user.id;
    const empresaData = req.body;
    
    const novaEmpresa = await empresaService.create(userId, empresaData);
    
    res.status(201).json({
      success: true,
      message: 'Empresa creada correctament',
      data: novaEmpresa
    });
  }

  /**
   * PUT /api/v1/empreses/:id
   * Actualitzar empresa
   */
  async update(req, res) {
    const { id } = req.params;
    const userId = req.user.id;
    const empresaData = req.body;
    
    const empresaActualitzada = await empresaService.update(parseInt(id), userId, empresaData);
    
    res.json({
      success: true,
      message: 'Empresa actualitzada correctament',
      data: empresaActualitzada
    });
  }

  /**
   * DELETE /api/v1/empreses/:id
   * Eliminar empresa (soft delete)
   */
  async delete(req, res) {
    const { id } = req.params;
    const userId = req.user.id;
    
    await empresaService.delete(parseInt(id), userId);
    
    res.json({
      success: true,
      message: 'Empresa eliminada correctament'
    });
  }

  /**
   * PATCH /api/v1/empreses/:id/finalitzar
   * Marcar que l'usuari ha deixat de treballar a aquesta empresa
   */
  async finalitzar(req, res) {
    const { id } = req.params;
    const userId = req.user.id;
    const { data_fi } = req.body;
    
    const empresaActualitzada = await empresaService.finalizarRelacio(
      parseInt(id), 
      userId, 
      data_fi || new Date()
    );
    
    res.json({
      success: true,
      message: 'Relació laboral finalitzada correctament',
      data: empresaActualitzada
    });
  }
}

export default new EmpresaController();
