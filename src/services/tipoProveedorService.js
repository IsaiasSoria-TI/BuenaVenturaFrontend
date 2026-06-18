import api from './api';

const BASE_URL = '/api/tipos-proveedor';

// Centraliza el CRUD de tipos de proveedor y las listas usadas por formularios.
export const tipoProveedorService = {
    listar: async () => {
        const { data } = await api.get(BASE_URL);
        return data;
    },

    listarTodos: async () => {
        const { data } = await api.get(`${BASE_URL}/todos`);
        return data;
    },

    crear: async (payload) => {
        const { data } = await api.post(BASE_URL, payload);
        return data;
    },

    actualizar: async (id, payload) => {
        const { data } = await api.put(`${BASE_URL}/${id}`, payload);
        return data;
    },

    eliminar: async (id) => {
        await api.delete(`${BASE_URL}/${id}`);
    },
};
