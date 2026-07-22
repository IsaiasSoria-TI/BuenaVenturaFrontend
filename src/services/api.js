import axios from 'axios';
import { clearSession, getToken } from './sessionService';

const api = axios.create({
  baseURL: '/',
});

// Rutas que no deben llevar token JWT porque aun no existe una sesion iniciada.
const publicRoutes = ['/auth/login'];

// Antes de cada request, agrega el token al header Authorization si la ruta es privada.
api.interceptors.request.use((config) => {
  const token = getToken();
  const url = config.url || '';

  const isPublicRoute = publicRoutes.some(
    (route) => url === route || url.startsWith(`${route}/`)
  );

  if (token && !isPublicRoute) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Si el backend responde 401 o 403, se limpia la sesion local y se fuerza volver al login.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401 || error?.response?.status === 403) {
      clearSession();

      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;
