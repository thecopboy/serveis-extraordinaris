import empresaRepository from '../repositories/empresaRepository.js';
import { ValidationError, NotFoundError } from '../utils/errors.js';

/**
 * Service per lògica de negoci d'empreses
 */
class EmpresaService {
  /**
   * Obtenir totes les empreses d'un usuari
   * @param {number} userId 
   * @param {boolean} nomasActives 
   * @returns {Promise<Array>}
   */
  async getAllByUserId(userId, nomasActives = false) {
    return empresaRepository.getAllByUserId(userId, nomasActives);
  }

  /**
   * Obtenir empresa per ID
   * @param {number} id 
   * @param {number} userId 
   * @returns {Promise<object>}
   */
  async getById(id, userId) {
    const empresa = await empresaRepository.getById(id, userId);
    
    if (!empresa) {
      throw new NotFoundError('Empresa no trobada');
    }
    
    return empresa;
  }

  /**
   * Crear nova empresa
   * @param {number} userId 
   * @param {object} empresaData 
   * @returns {Promise<object>}
   */
  async create(userId, empresaData) {
    // Validacions
    if (!empresaData.nom || empresaData.nom.trim() === '') {
      throw new ValidationError('El nom de l\'empresa és obligatori');
    }

    // Validar dates si s'informen
    if (empresaData.data_inici && empresaData.data_fi) {
      const dataInici = new Date(empresaData.data_inici);
      const dataFi = new Date(empresaData.data_fi);
      
      if (dataFi < dataInici) {
        throw new ValidationError('La data de fi no pot ser anterior a la data d\'inici');
      }
    }

    return empresaRepository.create(userId, empresaData);
  }

  /**
   * Actualitzar empresa
   * @param {number} id 
   * @param {number} userId 
   * @param {object} empresaData 
   * @returns {Promise<object>}
   */
  async update(id, userId, empresaData) {
    // Verificar que existeix
    const empresaExistent = await empresaRepository.getById(id, userId);
    if (!empresaExistent) {
      throw new NotFoundError('Empresa no trobada');
    }

    // Validacions
    if (empresaData.nom !== undefined && empresaData.nom.trim() === '') {
      throw new ValidationError('El nom de l\'empresa no pot estar buit');
    }

    // Validar dates si s'informen
    if (empresaData.data_inici && empresaData.data_fi) {
      const dataInici = new Date(empresaData.data_inici);
      const dataFi = new Date(empresaData.data_fi);
      
      if (dataFi < dataInici) {
        throw new ValidationError('La data de fi no pot ser anterior a la data d\'inici');
      }
    }

    const empresaActualitzada = await empresaRepository.update(id, userId, empresaData);
    
    if (!empresaActualitzada) {
      throw new NotFoundError('Empresa no trobada');
    }
    
    return empresaActualitzada;
  }

  /**
   * Eliminar empresa (soft delete)
   * @param {number} id 
   * @param {number} userId 
   * @returns {Promise<void>}
   */
  async delete(id, userId) {
    const eliminada = await empresaRepository.delete(id, userId);
    
    if (!eliminada) {
      throw new NotFoundError('Empresa no trobada');
    }
  }

  /**
   * Marcar que l'usuari ha deixat de treballar a una empresa
   * @param {number} id 
   * @param {number} userId 
   * @param {Date} dataFi 
   * @returns {Promise<object>}
   */
  async finalizarRelacio(id, userId, dataFi) {
    // Verificar que existeix
    const empresa = await empresaRepository.getById(id, userId);
    if (!empresa) {
      throw new NotFoundError('Empresa no trobada');
    }

    // Validar que no tingui ja una data de fi
    if (empresa.data_fi) {
      throw new ValidationError('Aquesta empresa ja té una data de fi assignada');
    }

    // Validar que la data de fi no sigui anterior a la data d'inici
    const dataInici = new Date(empresa.data_inici);
    const dataFiFinal = new Date(dataFi);
    
    if (dataFiFinal < dataInici) {
      throw new ValidationError('La data de fi no pot ser anterior a la data d\'inici');
    }

    return empresaRepository.setDataFi(id, userId, dataFi);
  }

  /**
   * Obtenir només empreses actives (on encara treballa)
   * @param {number} userId 
   * @returns {Promise<Array>}
   */
  async getActivesByUserId(userId) {
    return empresaRepository.getActivesByUserId(userId);
  }
}

export default new EmpresaService();
