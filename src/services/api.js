import axios from 'axios';

const defaultBaseURL = '/';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || defaultBaseURL,
});

// Rutas que no deben llevar token JWT porque aun no existe una sesion iniciada.
const publicRoutes = ['/auth/login'];

const clearSession = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('username');
  localStorage.removeItem('user');
};

// Antes de cada request, agrega el token al header Authorization si la ruta es privada.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  const url = config.url || '';

  const isPublicRoute = publicRoutes.some(
    (route) => url === route || url.startsWith(`${route}/`)
  );

  if (token && !isPublicRoute) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Si el backend responde 401, se limpia la sesion local y se fuerza volver al login.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      clearSession();

      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;
