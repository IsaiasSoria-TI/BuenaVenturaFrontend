import api from './api';

const BASE_URL = '/api/configuracion';

export const configuracionService = {
  obtenerPerfil: async () => {
    const { data } = await api.get(`${BASE_URL}/perfil`);
    return data;
  },

  actualizarPerfil: async (payload) => {
    const { data } = await api.put(`${BASE_URL}/perfil`, payload);
    return data;
  },
};