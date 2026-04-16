import api from './api';

const BASE_URL = '/api/impuestos';

export const impuestoService = {
  listar: async () => {
    const { data } = await api.get(BASE_URL);
    return data;
  },
};