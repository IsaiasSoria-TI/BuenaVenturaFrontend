import api from './api';

const BASE_URL = '/api/inventario/historial-movimientos';

// Consulta los movimientos historicos del Kardex por periodo, articulo o busqueda libre.
export const historialMovimientoService = {
  buscar: async ({ periodo, idArticulo, busqueda } = {}) => {
    const { data } = await api.get(BASE_URL, {
      params: {
        periodo: periodo || undefined,
        idArticulo: idArticulo || undefined,
        busqueda: busqueda || undefined,
      },
    });

    return data;
  },
};
