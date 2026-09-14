import * as React from 'react';
import { Chip } from '@mui/material';

import { categoriaService } from '../../../../services/categoriaService';
import { cuentaContableService } from '../../../../services/cuentaContableService';
import ModalCategoria from './ModalCategoria';
import { useCrudCatalogo } from '../../../../utils/useCrudCatalogo';
import CatalogoTableSection from '../../../../components/catalogo/CatalogoTableSection';

const initialForm = {
    idCategoria: null,
    descripcion: '',
    idCuentaContable: '',
    estado: 'Activo',
};

function getEstadoChipStyles(estado) {
    return estado === 'Activo'
        ? { backgroundColor: '#dcfce7', color: '#16a34a' }
        : { backgroundColor: '#fee2e2', color: '#dc2626' };
}

export default function CategoriasSection() {
    // Las cuentas contables alimentan el selector del modal; no forman parte del CRUD de categorias.
    const [cuentasContables, setCuentasContables] = React.useState([]);
    const [catalogLoading, setCatalogLoading] = React.useState(true);

    React.useEffect(() => {
        let activo = true;

        cuentaContableService
            .listar()
            .then((data) => {
                if (activo) setCuentasContables(Array.isArray(data) ? data : []);
            })
            .catch(() => {
                // Si falla este catalogo, el formulario conserva el selector vacio.
            })
            .finally(() => {
                if (activo) setCatalogLoading(false);
            });

        return () => {
            activo = false;
        };
    }, []);

    const crud = useCrudCatalogo({
        service: categoriaService,
        listMethod: 'listar',
        idField: 'idCategoria',
        initialForm,
        mapRegistroToForm: (categoria) => ({
            idCategoria: categoria.idCategoria,
            descripcion: categoria.descripcion || '',
            idCuentaContable: categoria.idCuentaContable ?? '',
            estado: categoria.estado || 'Activo',
        }),
        buildPayload: (form) => ({
            descripcion: form.descripcion.trim(),
            idCuentaContable: Number(form.idCuentaContable),
            estado: form.estado,
        }),
        validate: (form) => {
            const errors = {};
            if (!form.descripcion.trim()) errors.descripcion = 'La descripción es obligatoria';
            if (!form.idCuentaContable) errors.idCuentaContable = 'La cuenta contable es obligatoria';
            return errors;
        },
        mensajes: {
            crear: 'Categoría registrada correctamente.',
            actualizar: 'Categoría actualizada correctamente.',
            inactivar: 'Categoría inactivada correctamente.',
            errorCargar: 'No se pudo listar las categorias.',
            errorGuardar: 'No se pudo guardar la categoria.',
            errorEliminar: 'No se pudo eliminar la categoria.',
        },
    });

    return (
        <CatalogoTableSection
            idField="idCategoria"
            loading={crud.loading || catalogLoading}
            items={crud.items}
            itemsPaginados={crud.itemsPaginados}
            page={crud.page}
            rowsPerPage={crud.rowsPerPage}
            onPageChange={crud.setPage}
            onRowsPerPageChange={crud.setRowsPerPage}
            serverError={crud.serverError}
            success={crud.success}
            createLabel="Nueva categoría"
            onCreate={crud.handleOpenCreate}
            onEdit={crud.handleOpenEdit}
            onDelete={crud.handleOpenDeleteDialog}
            deleteDialogOpen={crud.deleteDialog}
            deleteDialogTitle="Confirmar eliminación"
            deleteDialogText={
                crud.selectedDelete
                    ? `¿Seguro que deseas inactivar esta categoría? Categoría: ${crud.selectedDelete.descripcion}`
                    : '¿Seguro que deseas inactivar esta categoría?'
            }
            onCloseDeleteDialog={crud.handleCloseDeleteDialog}
            onConfirmDelete={crud.handleConfirmDelete}
            columns={[
                { header: 'Descripción', render: (categoria) => categoria.descripcion },
                { header: 'Cuenta contable', render: (categoria) => categoria.codigoCuentaContable },
                {
                    header: 'Estado',
                    render: (categoria) => (
                        <Chip
                            label={categoria.estado || '-'}
                            size="small"
                            sx={{ fontWeight: 700, ...getEstadoChipStyles(categoria.estado) }}
                        />
                    ),
                },
            ]}
        >
            <ModalCategoria
                open={crud.open}
                onClose={crud.handleClose}
                editing={crud.editing}
                form={crud.form}
                errors={crud.errors}
                saving={crud.saving}
                cuentasContables={cuentasContables}
                handleChange={crud.handleChange}
                handleSubmit={crud.handleSubmit}
            />
        </CatalogoTableSection>
    );
}
