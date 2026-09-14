import { Chip } from '@mui/material';

import { cuentaContableService } from '../../../../services/cuentaContableService';
import ModalCuentaContable from './ModalCuentaContable';
import { useCrudCatalogo } from '../../../../utils/useCrudCatalogo';
import CatalogoTableSection from '../../../../components/catalogo/CatalogoTableSection';

const initialForm = {
    idCuentaContable: null,
    codigo: '',
    descripcion: '',
    estado: 'Activo',
};

function getEstadoChipStyles(estado) {
    return estado === 'Activo'
        ? { backgroundColor: '#dcfce7', color: '#16a34a' }
        : { backgroundColor: '#fee2e2', color: '#dc2626' };
}

export default function CuentasContablesSection() {
    const crud = useCrudCatalogo({
        service: cuentaContableService,
        listMethod: 'listar',
        idField: 'idCuentaContable',
        initialForm,
        mapRegistroToForm: (cuenta) => ({
            idCuentaContable: cuenta.idCuentaContable,
            codigo: cuenta.codigo || '',
            descripcion: cuenta.descripcion || '',
            estado: cuenta.estado || 'Activo',
        }),
        buildPayload: (form) => ({
            codigo: form.codigo.trim(),
            descripcion: form.descripcion.trim(),
            estado: form.estado,
        }),
        validate: (form) => {
            const errors = {};
            if (!form.codigo.trim()) errors.codigo = 'Código requerido';
            if (!form.descripcion.trim()) errors.descripcion = 'Descripción requerida';
            return errors;
        },
        mensajes: {
            crear: 'Registrado correctamente',
            actualizar: 'Actualizado correctamente',
            inactivar: 'Inactivado correctamente',
            errorCargar: 'No se pudo listar las cuentas contables.',
            errorGuardar: 'Error al guardar',
            errorEliminar: 'Error al eliminar',
        },
    });

    return (
        <CatalogoTableSection
            idField="idCuentaContable"
            loading={crud.loading}
            items={crud.items}
            itemsPaginados={crud.itemsPaginados}
            page={crud.page}
            rowsPerPage={crud.rowsPerPage}
            onPageChange={crud.setPage}
            onRowsPerPageChange={crud.setRowsPerPage}
            serverError={crud.serverError}
            success={crud.success}
            createLabel="Nueva cuenta"
            onCreate={crud.handleOpenCreate}
            onEdit={crud.handleOpenEdit}
            onDelete={crud.handleOpenDeleteDialog}
            deleteDialogOpen={crud.deleteDialog}
            deleteDialogTitle="Confirmar"
            deleteDialogText="¿Deseas inactivar esta cuenta?"
            onCloseDeleteDialog={crud.handleCloseDeleteDialog}
            onConfirmDelete={crud.handleConfirmDelete}
            columns={[
                { header: 'Código', render: (cuenta) => cuenta.codigo },
                { header: 'Descripción', render: (cuenta) => cuenta.descripcion },
                {
                    header: 'Estado',
                    render: (cuenta) => (
                        <Chip
                            label={cuenta.estado}
                            size="small"
                            sx={getEstadoChipStyles(cuenta.estado)}
                        />
                    ),
                },
            ]}
        >
            <ModalCuentaContable
                open={crud.open}
                onClose={crud.handleClose}
                editing={crud.editing}
                form={crud.form}
                errors={crud.errors}
                saving={crud.saving}
                handleChange={crud.handleChange}
                handleSubmit={crud.handleSubmit}
            />
        </CatalogoTableSection>
    );
}
