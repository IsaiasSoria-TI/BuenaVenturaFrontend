import api from './api';

export const login = async (usuario, contrasena) => {
  const response = await api.post('/auth/login', { usuario, contrasena });
  return response.data;
};