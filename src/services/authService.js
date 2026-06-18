import api from './api';

// Envia credenciales al backend y devuelve los datos de sesion recibidos.
export const login = async (usuario, contrasena) => {
  const response = await api.post('/auth/login', { usuario, contrasena });
  return response.data;
};
