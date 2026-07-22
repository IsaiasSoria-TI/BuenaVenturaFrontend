import api from './api';
import { createCrudService } from './createCrudService';

const BASE_URL = '/api/tipos-cambio';

// Centraliza tipos de cambio; buscarAplicable devuelve el tipo usado para una fecha de compra.
export const tipoCambioService = {
  ...createCrudService(BASE_URL),

  listarTodos: async () => {
    const { data } = await api.get(`${BASE_URL}/todos`);
    return data;
  },

  buscarAplicable: async (fecha) => {
    const { data } = await api.get(`${BASE_URL}/aplicable`, {
      params: { fecha },
    });
    return data;
  },

};
