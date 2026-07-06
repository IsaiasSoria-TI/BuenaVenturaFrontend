import api from './api';

const BASE_URL = '/api/inventario/motivos-movimiento';

// Catalogo de motivos usado por Kardex > Historial de movimientos.
export const motivoMovimientoService = {
  listar: async () => {
    const { data } = await api.get(BASE_URL);
    return data;
  },
};
