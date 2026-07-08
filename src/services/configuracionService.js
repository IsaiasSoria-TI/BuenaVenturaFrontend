import api from './api';

const BASE_URL = '/api/configuracion';

// Agrupa endpoints de configuracion general: perfil propio y usuarios de seguridad.
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

  listarUsuariosSeguridad: async () => {
    const { data } = await api.get(`${BASE_URL}/seguridad/usuarios`);
    return data;
  },

  crearUsuarioSeguridad: async (payload) => {
    const { data } = await api.post(`${BASE_URL}/seguridad/usuarios`, payload);
    return data;
  },

  actualizarUsuarioSeguridad: async (idUsuario, payload) => {
    const { data } = await api.put(`${BASE_URL}/seguridad/usuarios/${idUsuario}`, payload);
    return data;
  },

  inactivarUsuarioSeguridad: async (idUsuario) => {
    await api.delete(`${BASE_URL}/seguridad/usuarios/${idUsuario}`);
  },
};
