import { createCrudService } from './createCrudService';

const BASE_URL = '/api/inventario/tipos-envase';

// Centraliza el CRUD del catalogo de tipos de envase.
export const tipoEnvaseService = createCrudService(BASE_URL);
