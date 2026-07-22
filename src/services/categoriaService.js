import { createCrudService } from './createCrudService';

const BASE_URL = '/api/categorias';

// Centraliza el CRUD de categorias de inventario.
export const categoriaService = createCrudService(BASE_URL);
