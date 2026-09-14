import * as React from 'react';
import { useAutoClearMessage } from './useAutoClearMessage';
import { getApiErrorMessage } from './getApiErrorMessage';

const initialState = (initialForm) => ({
    items: [],
    loading: true,
    saving: false,
    form: initialForm,
    errors: {},
    editing: false,
    open: false,
    deleteDialog: false,
    selectedDelete: null,
    serverError: '',
    success: '',
    page: 0,
    rowsPerPage: 5,
});

// Encapsula el flujo repetido en los catalogos de Configuracion: listar, crear,
// editar, inactivar y paginar. Cada seccion solo describe "que" hacer (service,
// forma del formulario, validacion, payload); el "como" vive aca una sola vez.
export function useCrudCatalogo({
    service,
    listMethod = 'listarTodos',
    idField,
    initialForm,
    mapRegistroToForm,
    buildPayload,
    validate,
    mensajes,
}) {
    const [state, setState] = React.useState(() => initialState(initialForm));

    // Referencia estable: useAutoClearMessage reinicia su temporizador cada vez
    // que el callback cambia de identidad, asi que no puede ser una arrow inline.
    const patch = React.useCallback((changes) => {
        setState((prev) => ({ ...prev, ...changes }));
    }, []);

    const clearSuccess = React.useCallback((success) => patch({ success }), [patch]);
    useAutoClearMessage(state.success, clearSuccess);

    const cargar = React.useCallback(async () => {
        try {
            patch({ loading: true, serverError: '' });
            const data = await service[listMethod]();
            patch({ items: Array.isArray(data) ? data : [], page: 0 });
        } catch (error) {
            patch({ serverError: getApiErrorMessage(error, mensajes.errorCargar) });
        } finally {
            patch({ loading: false });
        }
    }, [service, listMethod, mensajes.errorCargar, patch]);

    React.useEffect(() => {
        cargar();
    }, [cargar]);

    const handleOpenCreate = () => {
        patch({
            form: initialForm,
            editing: false,
            errors: {},
            serverError: '',
            success: '',
            open: true,
        });
    };

    const handleOpenEdit = (registro) => {
        patch({
            form: mapRegistroToForm(registro),
            editing: true,
            errors: {},
            serverError: '',
            success: '',
            open: true,
        });
    };

    const handleClose = () => {
        if (state.saving) return;
        patch({ open: false });
    };

    const handleChange = (field) => (event) => {
        setState((prev) => ({
            ...prev,
            form: { ...prev.form, [field]: event.target.value },
            errors: prev.errors[field] ? { ...prev.errors, [field]: '' } : prev.errors,
            serverError: '',
        }));
    };

    const handleSubmit = async () => {
        const newErrors = validate ? validate(state.form) : {};

        if (Object.keys(newErrors).length > 0) {
            patch({ errors: newErrors });
            return;
        }

        try {
            patch({ saving: true, serverError: '' });
            const payload = buildPayload(state.form);
            const id = state.form[idField];

            if (state.editing && id) {
                await service.actualizar(id, payload);
                patch({ success: mensajes.actualizar });
            } else {
                await service.crear(payload);
                patch({ success: mensajes.crear });
            }

            patch({ open: false });
            await cargar();
        } catch (error) {
            patch({ serverError: getApiErrorMessage(error, mensajes.errorGuardar) });
        } finally {
            patch({ saving: false });
        }
    };

    const handleOpenDeleteDialog = (registro) => {
        patch({ selectedDelete: registro, deleteDialog: true });
    };

    const handleCloseDeleteDialog = () => patch({ deleteDialog: false });

    const handleConfirmDelete = async () => {
        const id = state.selectedDelete?.[idField];
        if (!id) return;

        try {
            patch({ serverError: '' });
            await service.eliminar(id);
            patch({ success: mensajes.inactivar, deleteDialog: false, selectedDelete: null });
            await cargar();
        } catch (error) {
            patch({ serverError: getApiErrorMessage(error, mensajes.errorEliminar) });
        }
    };

    const setPage = (page) => patch({ page });
    const setRowsPerPage = (rowsPerPage) => patch({ rowsPerPage, page: 0 });

    const itemsPaginados = React.useMemo(() => {
        const start = state.page * state.rowsPerPage;
        return state.items.slice(start, start + state.rowsPerPage);
    }, [state.items, state.page, state.rowsPerPage]);

    return {
        ...state,
        itemsPaginados,
        handleOpenCreate,
        handleOpenEdit,
        handleClose,
        handleChange,
        handleSubmit,
        handleOpenDeleteDialog,
        handleCloseDeleteDialog,
        handleConfirmDelete,
        setPage,
        setRowsPerPage,
    };
}
