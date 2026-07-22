import api from './api';
import { createCrudService } from './createCrudService';

const BASE_URL = '/api/bancos';

// Centraliza el CRUD de bancos usados por proveedores y configuracion.
export const bancoService = {
    ...createCrudService(BASE_URL),

    listarTodos: async () => {
        const { data } = await api.get(`${BASE_URL}/todos`);
        return data;
    },

};
