import { Chip } from '@mui/material';

import { tipoProveedorService } from '../../../../services/tipoProveedorService';
import ModalTipoProveedor from './ModalTipoProveedor';
import { useCrudCatalogo } from '../../../../utils/useCrudCatalogo';
import CatalogoTableSection from '../../../../components/catalogo/CatalogoTableSection';

const initialForm = { idTipoProveedor: null, nombre: '', flgActivo: 'true' };

function getEstadoChipStyles(flgActivo) {
    return flgActivo
        ? { backgroundColor: '#dcfce7', color: '#16a34a' }
        : { backgroundColor: '#fee2e2', color: '#dc2626' };
}

export default function TiposProveedorSection() {
    const crud = useCrudCatalogo({
        service: tipoProveedorService,
        idField: 'idTipoProveedor',
        initialForm,
        mapRegistroToForm: (tipoProveedor) => ({
            idTipoProveedor: tipoProveedor.idTipoProveedor,
            nombre: tipoProveedor.nombre || '',
            flgActivo: String(Boolean(tipoProveedor.flgActivo)),
        }),
        buildPayload: (form) => ({
            nombre: form.nombre.trim(),
            flgActivo: form.flgActivo === 'true',
        }),
        validate: (form) => (form.nombre.trim() ? {} : { nombre: 'Nombre requerido' }),
        mensajes: {
            crear: 'Registrado correctamente',
            actualizar: 'Actualizado correctamente',
            inactivar: 'Inactivado correctamente',
            errorCargar: 'No se pudo listar los tipos de proveedor.',
            errorGuardar: 'Error al guardar',
            errorEliminar: 'Error al eliminar',
        },
    });

    return (
        <CatalogoTableSection
            idField="idTipoProveedor"
            loading={crud.loading}
            items={crud.items}
            itemsPaginados={crud.itemsPaginados}
            page={crud.page}
            rowsPerPage={crud.rowsPerPage}
            onPageChange={crud.setPage}
            onRowsPerPageChange={crud.setRowsPerPage}
            serverError={crud.serverError}
            success={crud.success}
            createLabel="Nuevo tipo"
            onCreate={crud.handleOpenCreate}
            onEdit={crud.handleOpenEdit}
            onDelete={crud.handleOpenDeleteDialog}
            deleteDialogOpen={crud.deleteDialog}
            deleteDialogTitle="Confirmar"
            deleteDialogText="Deseas inactivar este tipo de proveedor?"
            onCloseDeleteDialog={crud.handleCloseDeleteDialog}
            onConfirmDelete={crud.handleConfirmDelete}
            columns={[
                { header: 'Nombre', render: (tipo) => tipo.nombre },
                {
                    header: 'Estado',
                    render: (tipo) => (
                        <Chip
                            label={tipo.flgActivo ? 'Activo' : 'Inactivo'}
                            size="small"
                            sx={getEstadoChipStyles(tipo.flgActivo)}
                        />
                    ),
                },
            ]}
        >
            <ModalTipoProveedor
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
