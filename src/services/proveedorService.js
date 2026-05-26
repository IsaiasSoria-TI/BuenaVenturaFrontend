import api from './api';

const BASE_URL = '/api/proveedores';

// Centraliza las llamadas HTTP del mantenimiento de proveedores.
export const proveedorService = {
  listar: async () => {
    const { data } = await api.get(BASE_URL);
    return data;
  },

  crear: async (payload) => {
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
