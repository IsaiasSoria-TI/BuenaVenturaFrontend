import { createCrudService } from './createCrudService';

const BASE_URL = '/api/articulos';

// Centraliza el CRUD de articulos para que las pantallas no construyan URLs manualmente.
export const articuloService = createCrudService(BASE_URL);
