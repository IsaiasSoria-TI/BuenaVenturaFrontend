import api from './api';

const BASE_URL = '/api/cuentas-pagar';

export const cuentaPagarService = {
  listar: async () => {
    const { data } = await api.get(BASE_URL);
    return data;
  },

  listarComprasValidas: async () => {
    const { data } = await api.get(`${BASE_URL}/compras-validas`);
    return data;
  },

  verDetalleCompra: async (idCompras) => {
    const { data } = await api.get(`${BASE_URL}/compra/${idCompras}`);
    return data;
  },

  registrar: async (payload) => {
    const { data } = await api.post(BASE_URL, payload);
    return data;
  },

  actualizar: async (id, payload) => {
    const { data } = await api.put(`${BASE_URL}/${id}`, payload);
    return data;
  },

  eliminar: async (id) => {
    await api.delete(`${BASE_URL}/${id}`);
  },
};