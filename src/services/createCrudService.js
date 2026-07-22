import api from './api';

export const createCrudService = (baseUrl) => ({
  listar: async () => {
    const { data } = await api.get(baseUrl);
    return data;
  },

  crear: async (payload) => {
    const { data } = await api.post(baseUrl, payload);
    return data;
  },

  actualizar: async (id, payload) => {
    const { data } = await api.put(`${baseUrl}/${id}`, payload);
    return data;
  },

  eliminar: async (id) => {
    await api.delete(`${baseUrl}/${id}`);
  },
});
