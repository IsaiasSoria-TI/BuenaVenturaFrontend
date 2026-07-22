import { createCrudService } from './createCrudService';

const BASE_URL = '/api/compras';

// Centraliza las llamadas HTTP del modulo de gestion de compras.
export const compraService = createCrudService(BASE_URL);
