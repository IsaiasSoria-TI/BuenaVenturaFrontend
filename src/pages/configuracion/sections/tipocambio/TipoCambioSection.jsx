import { Chip } from '@mui/material';

import { tipoCambioService } from '../../../../services/tipoCambioService';
import ModalTipoCambio from './ModalTipoCambio';
import { useCrudCatalogo } from '../../../../utils/useCrudCatalogo';
import CatalogoTableSection from '../../../../components/catalogo/CatalogoTableSection';

const initialForm = {
    idTipoCambio: null,
    fecha: '',
    valor: '',
    flgActivo: 'true',
};

function getEstadoChipStyles(flgActivo) {
    return flgActivo
        ? { backgroundColor: '#dcfce7', color: '#16a34a' }
        : { backgroundColor: '#fee2e2', color: '#dc2626' };
}

function formatDecimal(value) {
    const numero = Number(value);
    if (!Number.isFinite(numero)) return '0.0000';

    return numero.toLocaleString('es-PE', {
        minimumFractionDigits: 4,
        maximumFractionDigits: 4,
    });
}

function formatDate(value) {
    if (!value) return '-';
    const [year, month, day] = String(value).split('-');
    if (!year || !month || !day) return value;
    return `${day}/${month}/${year}`;
}

// Convierte el texto del input a numero valido con hasta cuatro decimales.
function parseValorDecimal(value) {
    const normalizado = String(value).trim().replace(',', '.');

    if (!/^\d+(\.\d{1,4})?$/.test(normalizado)) {
        return null;
    }

    const numero = Number(normalizado);
    return Number.isFinite(numero) && numero > 0 ? numero : null;
}

export default function TipoCambioSection() {
    const crud = useCrudCatalogo({
        service: tipoCambioService,
        idField: 'idTipoCambio',
        initialForm,
        mapRegistroToForm: (tipoCambio) => ({
            idTipoCambio: tipoCambio.idTipoCambio,
            fecha: tipoCambio.fecha || '',
            valor: tipoCambio.valor ?? '',
            flgActivo: String(Boolean(tipoCambio.flgActivo)),
        }),
        buildPayload: (form) => ({
            fecha: form.fecha,
            valor: parseValorDecimal(form.valor),
            flgActivo: form.flgActivo === 'true',
        }),
        validate: (form) => {
            const errors = {};

            if (!form.fecha) {
                errors.fecha = 'Campo obligatorio';
            }

            if (form.valor === '' || parseValorDecimal(form.valor) === null) {
                errors.valor = 'Ingrese un valor valido con hasta 4 decimales';
            }

            return errors;
        },
        mensajes: {
            crear: 'Tipo de cambio creado',
            actualizar: 'Tipo de cambio actualizado',
            inactivar: 'Tipo de cambio inactivado',
            errorCargar: 'Error al cargar tipos de cambio',
            errorGuardar: 'Error al guardar tipo de cambio',
            errorEliminar: 'Error al inactivar tipo de cambio',
        },
    });

    return (
        <CatalogoTableSection
            idField="idTipoCambio"
            loading={crud.loading}
            items={crud.items}
            itemsPaginados={crud.itemsPaginados}
            page={crud.page}
            rowsPerPage={crud.rowsPerPage}
            onPageChange={crud.setPage}
            onRowsPerPageChange={crud.setRowsPerPage}
            serverError={crud.serverError}
            success={crud.success}
            createLabel="Agregar"
            onCreate={crud.handleOpenCreate}
            onEdit={crud.handleOpenEdit}
            onDelete={crud.handleOpenDeleteDialog}
            deleteDialogOpen={crud.deleteDialog}
            deleteDialogTitle="Inactivar tipo de cambio"
            deleteDialogText={
                crud.selectedDelete
                    ? `${formatDate(crud.selectedDelete.fecha)} - ${formatDecimal(crud.selectedDelete.valor)}`
                    : '¿Seguro que deseas inactivar este tipo de cambio?'
            }
            onCloseDeleteDialog={crud.handleCloseDeleteDialog}
            onConfirmDelete={crud.handleConfirmDelete}
            columns={[
                { header: 'Fecha', render: (tipoCambio) => formatDate(tipoCambio.fecha) },
                {
                    header: 'Valor',
                    align: 'right',
                    render: (tipoCambio) => formatDecimal(tipoCambio.valor),
                },
                {
                    header: 'Estado',
                    render: (tipoCambio) => (
                        <Chip
                            label={tipoCambio.flgActivo ? 'Activo' : 'Inactivo'}
                            size="small"
                            sx={getEstadoChipStyles(tipoCambio.flgActivo)}
                        />
                    ),
                },
            ]}
        >
            <ModalTipoCambio
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
