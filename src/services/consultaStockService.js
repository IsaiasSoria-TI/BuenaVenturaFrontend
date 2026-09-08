import api from './api';

const BASE_URL = '/api/inventario/consulta-stock';

// Centraliza la consulta de movimientos que alimenta Kardex > Consulta de Stock.
export const consultaStockService = {
  consultar: async ({ periodo, idArticulo }) => {
    const { data } = await api.get(BASE_URL, {
      params: {
        periodo,
        idArticulo,
      },
    });

    return data;
  },

  consultarPorTipoEnvase: async ({ periodo, idTipoEnvase }) => {
    const { data } = await api.get(`${BASE_URL}/por-envase`, {
      params: {
        periodo,
        idTipoEnvase,
      },
    });

    return data;
  },
};
