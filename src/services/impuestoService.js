import api from './api';
import { createCrudService } from './createCrudService';

const BASE_URL = '/api/impuestos';

// Centraliza el CRUD de impuestos y la lista completa para selectores.
export const impuestoService = {
  ...createCrudService(BASE_URL),

  listarTodos: async () => {
    const { data } = await api.get(`${BASE_URL}/todos`);
    return data;
  },

};
