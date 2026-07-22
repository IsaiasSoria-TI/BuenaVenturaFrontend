import { createCrudService } from './createCrudService';

const BASE_URL = '/api/proveedores';

// Centraliza las llamadas HTTP del mantenimiento de proveedores.
export const proveedorService = createCrudService(BASE_URL);
