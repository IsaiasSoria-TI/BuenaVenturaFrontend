import api from './api';

const BASE_URL = '/api/configuracion';

// Agrupa endpoints de configuracion general: perfil propio.
export const configuracionService = {
  obtenerPerfil: async (usuarioId) => {
    const { data } = await api.get(`${BASE_URL}/perfil`, {
      params: { usuarioId },
    });
    return data;
  },

  actualizarPerfil: async (usuarioId, payload) => {
    const { data } = await api.put(`${BASE_URL}/perfil`, payload, {
      params: { usuarioId },
    });
    return data;
  },
};
