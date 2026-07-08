import api from './api';

const BASE_URL = '/api/pagos';

// Catologo de condiciones o formas de pago usado al registrar compras.
export const pagoService = {
  listar: async () => {
    const { data } = await api.get(BASE_URL);
    return data;
  },
};
