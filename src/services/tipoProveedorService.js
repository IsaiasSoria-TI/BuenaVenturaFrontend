import api from './api';
import { createCrudService } from './createCrudService';

const BASE_URL = '/api/tipos-proveedor';

// Centraliza el CRUD de tipos de proveedor y las listas usadas por formularios.
export const tipoProveedorService = {
    ...createCrudService(BASE_URL),

    listarTodos: async () => {
        const { data } = await api.get(`${BASE_URL}/todos`);
        return data;
    },

};
