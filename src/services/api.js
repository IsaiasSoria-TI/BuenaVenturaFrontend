import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080',
});

const publicRoutes = [
  '/auth/login',
  '/api/proveedores',
  '/api/impuestos',
  '/api/pagos',
  '/api/recepciones',
];

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

export default api;