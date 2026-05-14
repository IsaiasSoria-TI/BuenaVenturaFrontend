import api from './api';

const BASE_URL = '/api/monedas';

export const monedaService = {
  listar: async () => {
    const { data } = await api.get(BASE_URL);
    return data;
  },
};
