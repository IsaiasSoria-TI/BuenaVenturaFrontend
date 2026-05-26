import api from './api';

const BASE_URL = '/api/recepciones';

// Centraliza las llamadas HTTP usadas para crear y consultar recepciones de compras.
export const recepcionService = {
  listar: async () => {
    const { data } = await api.get(BASE_URL);
    return data;
  },

  listarComprasPendientes: async () => {
    const { data } = await api.get(`${BASE_URL}/compras-pendientes`);
    return data;
  },

  verDetalleCompra: async (idCompras) => {
    const { data } = await api.get(`${BASE_URL}/detalle-compra/${idCompras}`);
    return data;
  },

  registrar: async (payload) => {
    const { data } = await api.post(BASE_URL, payload);
    return data;
  },

  actualizarDatos: async (idRecepciones, payload) => {
    const { data } = await api.put(`${BASE_URL}/${idRecepciones}/datos`, payload);
    return data;
  },
};
