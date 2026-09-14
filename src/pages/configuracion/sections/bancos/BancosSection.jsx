import { Chip } from '@mui/material';

import { bancoService } from '../../../../services/bancoService';
import ModalBanco from './ModalBanco';
import { useCrudCatalogo } from '../../../../utils/useCrudCatalogo';
import CatalogoTableSection from '../../../../components/catalogo/CatalogoTableSection';

const initialForm = { idBanco: null, nombre: '', flgActivo: 'true' };

function getEstadoChipStyles(flgActivo) {
    return flgActivo
        ? { backgroundColor: '#dcfce7', color: '#16a34a' }
        : { backgroundColor: '#fee2e2', color: '#dc2626' };
}

export default function BancosSection() {
    const crud = useCrudCatalogo({
        service: bancoService,
        idField: 'idBanco',
        initialForm,
        mapRegistroToForm: (banco) => ({
            idBanco: banco.idBanco,
            nombre: banco.nombre || '',
            flgActivo: String(Boolean(banco.flgActivo)),
        }),
        buildPayload: (form) => ({
            nombre: form.nombre.trim(),
            flgActivo: form.flgActivo === 'true',
        }),
        validate: (form) => (form.nombre.trim() ? {} : { nombre: 'Campo obligatorio' }),
        mensajes: {
            crear: 'Banco creado',
            actualizar: 'Banco actualizado',
            inactivar: 'Banco inactivado',
            errorCargar: 'Error al cargar bancos',
            errorGuardar: 'Error al guardar banco',
            errorEliminar: 'Error al eliminar',
        },
    });

    return (
        <CatalogoTableSection
            idField="idBanco"
            loading={crud.loading}
            items={crud.items}
            itemsPaginados={crud.itemsPaginados}
            page={crud.page}
            rowsPerPage={crud.rowsPerPage}
            onPageChange={crud.setPage}
            onRowsPerPageChange={crud.setRowsPerPage}
            serverError={crud.serverError}
            success={crud.success}
            createLabel="Nuevo banco"
            onCreate={crud.handleOpenCreate}
            onEdit={crud.handleOpenEdit}
            onDelete={crud.handleOpenDeleteDialog}
            deleteDialogOpen={crud.deleteDialog}
            deleteDialogTitle="Inactivar banco"
            deleteDialogText={`¿Seguro que deseas inactivar "${crud.selectedDelete?.nombre ?? ''}"?`}
            onCloseDeleteDialog={crud.handleCloseDeleteDialog}
            onConfirmDelete={crud.handleConfirmDelete}
            columns={[
                { header: 'Nombre', render: (banco) => banco.nombre },
                {
                    header: 'Estado',
                    render: (banco) => (
                        <Chip
                            label={banco.flgActivo ? 'Activo' : 'Inactivo'}
                            size="small"
                            sx={getEstadoChipStyles(banco.flgActivo)}
                        />
                    ),
                },
            ]}
        >
            <ModalBanco
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
