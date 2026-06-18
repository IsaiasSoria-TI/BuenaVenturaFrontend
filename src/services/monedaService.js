import api from './api';

const BASE_URL = '/api/monedas';

// Catologo de monedas disponible para compras y cuentas por pagar.
export const monedaService = {
  listar: async () => {
    const { data } = await api.get(BASE_URL);
    return data;
  },
};
