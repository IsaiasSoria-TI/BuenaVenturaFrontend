import { createCrudService } from './createCrudService';

const BASE_URL = '/api/cuentas-contables';

// Centraliza el CRUD de cuentas contables usadas por categorias y reportes.
export const cuentaContableService = createCrudService(BASE_URL);
