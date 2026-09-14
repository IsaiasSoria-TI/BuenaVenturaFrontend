import { Chip } from '@mui/material';

import { impuestoService } from '../../../../services/impuestoService';
import ModalImpuesto from './ModalImpuesto';
import { useCrudCatalogo } from '../../../../utils/useCrudCatalogo';
import CatalogoTableSection from '../../../../components/catalogo/CatalogoTableSection';

const initialForm = {
    idImpuesto: null,
    tipoImpuesto: '',
    valor: '',
    flgActivo: 'true',
};

function getEstadoChipStyles(flgActivo) {
    return flgActivo
        ? { backgroundColor: '#dcfce7', color: '#16a34a' }
        : { backgroundColor: '#fee2e2', color: '#dc2626' };
}

function formatPorcentaje(value) {
    const numero = Number(value);
    if (!Number.isFinite(numero)) return '0.00';

    return numero.toLocaleString('es-PE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

// Acepta coma o punto decimal y limita el valor a dos decimales.
function parseValorDecimal(value) {
    const normalizado = String(value).trim().replace(',', '.');

    if (!/^\d+(\.\d{1,2})?$/.test(normalizado)) {
        return null;
    }

    const numero = Number(normalizado);
    return Number.isFinite(numero) ? numero : null;
}

export default function ImpuestosSection() {
    const crud = useCrudCatalogo({
        service: impuestoService,
        idField: 'idImpuesto',
        initialForm,
        mapRegistroToForm: (impuesto) => ({
            idImpuesto: impuesto.idImpuesto,
            tipoImpuesto: impuesto.tipoImpuesto || '',
            valor: impuesto.valor ?? '',
            flgActivo: String(Boolean(impuesto.flgActivo)),
        }),
        buildPayload: (form) => ({
            tipoImpuesto: form.tipoImpuesto.trim(),
            valor: parseValorDecimal(form.valor),
            flgActivo: form.flgActivo === 'true',
        }),
        validate: (form) => {
            const errors = {};

            if (!form.tipoImpuesto.trim()) {
                errors.tipoImpuesto = 'Campo obligatorio';
            }

            if (form.valor === '' || parseValorDecimal(form.valor) === null) {
                errors.valor = 'Ingrese un valor válido con hasta 2 decimales';
            }

            return errors;
        },
        mensajes: {
            crear: 'Impuesto creado',
            actualizar: 'Impuesto actualizado',
            inactivar: 'Impuesto inactivado',
            errorCargar: 'Error al cargar impuestos',
            errorGuardar: 'Error al guardar impuesto',
            errorEliminar: 'Error al eliminar',
        },
    });

    return (
        <CatalogoTableSection
            idField="idImpuesto"
            loading={crud.loading}
            items={crud.items}
            itemsPaginados={crud.itemsPaginados}
            page={crud.page}
            rowsPerPage={crud.rowsPerPage}
            onPageChange={crud.setPage}
            onRowsPerPageChange={crud.setRowsPerPage}
            serverError={crud.serverError}
            success={crud.success}
            createLabel="Nuevo impuesto"
            onCreate={crud.handleOpenCreate}
            onEdit={crud.handleOpenEdit}
            onDelete={crud.handleOpenDeleteDialog}
            deleteDialogOpen={crud.deleteDialog}
            deleteDialogTitle="Inactivar impuesto"
            deleteDialogText={`¿Seguro que deseas inactivar "${crud.selectedDelete?.tipoImpuesto ?? ''}"?`}
            onCloseDeleteDialog={crud.handleCloseDeleteDialog}
            onConfirmDelete={crud.handleConfirmDelete}
            columns={[
                { header: 'Tipo impuesto', render: (impuesto) => impuesto.tipoImpuesto },
                { header: 'Valor', render: (impuesto) => `${formatPorcentaje(impuesto.valor)}%` },
                {
                    header: 'Estado',
                    render: (impuesto) => (
                        <Chip
                            label={impuesto.flgActivo ? 'Activo' : 'Inactivo'}
                            size="small"
                            sx={getEstadoChipStyles(impuesto.flgActivo)}
                        />
                    ),
                },
            ]}
        >
            <ModalImpuesto
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
