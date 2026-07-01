import React from 'react';
import PropTypes from 'prop-types';

import {
    Alert,
    Autocomplete,
    Box,
    Button,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Paper,
    Stack,
    TextField,
    Typography,
} from '@mui/material';

import { formatCompraCode, formatDateTimePeru } from '../../../utils/formatters';

function formatNumber(value) {
    if (value === null || value === undefined || value === '') return '0.00';

    const number = Number(value);
    if (Number.isNaN(number)) return '0.00';

    return number.toFixed(2);
}

function getCurrencyPrefix(item) {
    const normalize = (value) => String(value || '').trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
    const codigo = normalize(item?.codigo || item?.codigoMoneda);
    const nombre = normalize(item?.nombre || item?.moneda);
    const simbolo = String(item?.simbolo || item?.simboloMoneda || '').trim();

    if (codigo === 'PEN' || codigo === 'SOL' || nombre === 'SOLES' || nombre === 'SOL') return 'S/';
    if (codigo === 'USD' || nombre.includes('DOLAR')) return 'USD';
    return codigo || simbolo || item?.nombre || item?.moneda || '';
}

function formatCurrency(value, item) {
    const prefix = getCurrencyPrefix(item);
    const amount = formatNumber(value);
    return prefix ? `${prefix} ${amount}` : amount;
}

function getDetalleEnvase(detalle) {
    return (
        detalle?.tipoEnvase ||
        detalle?.envase ||
        detalle?.descripcionCategoria ||
        detalle?.categoria ||
        detalle?.tipoCategoria ||
        ''
    );
}

function getTiposEnvase(detalles) {
    return [...new Set(
        detalles
            .map(getDetalleEnvase)
            .map((value) => String(value || '').trim())
            .filter(Boolean)
    )];
}

function getEstadoChipStyles(estado) {
    if (estado === 'Completo') {
        return {
            backgroundColor: '#dcfce7',
            color: '#16a34a',
        };
    }

    if (estado === 'Completa parcial') {
        return {
            backgroundColor: '#dbeafe',
            color: '#2563eb',
        };
    }

    return {
        backgroundColor: '#fef3c7',
        color: '#d97706',
    };
}

function InfoValue({ label, value, strong = false, children = null }) {
    return (
        <Box>
            <Typography sx={{ fontSize: '0.8rem', color: '#64748b' }}>
                {label}
            </Typography>
            {children || (
                <Typography sx={{ fontWeight: strong ? 700 : 500, color: '#0f172a' }}>
                    {value || '-'}
                </Typography>
            )}
        </Box>
    );
}

InfoValue.propTypes = {
    label: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    strong: PropTypes.bool,
    children: PropTypes.node,
};

function renderCompraOption(props, option) {
    const { key, ...optionProps } = props;

    return (
        <Box key={key} component="li" {...optionProps}>
            <Box>
                <Typography sx={{ fontWeight: 700, fontSize: '0.92rem' }}>
                    Compra {formatCompraCode(option.idCompras)}
                </Typography>
                <Typography sx={{ fontSize: '0.82rem', color: '#64748b' }}>
                    {option.ruc} - {option.razonSocial}
                </Typography>
                <Typography sx={{ fontSize: '0.8rem', color: '#64748b' }}>
                    {option.articulo || 'Varios articulos'} | Peso: {formatNumber(option.pesoComprado)}
                </Typography>
            </Box>
        </Box>
    );
}

function filterCompraOptions(options, state) {
    const input = state.inputValue.toLowerCase().trim();

    return options
        .filter(
            (option) =>
                String(option.idCompras).includes(input) ||
                formatCompraCode(option.idCompras).toLowerCase().includes(input) ||
                option.ruc?.toLowerCase().includes(input) ||
                option.razonSocial?.toLowerCase().includes(input) ||
                option.articulo?.toLowerCase().includes(input)
        )
        .slice(0, 20);
}

// Selector aislado para mantener junta la busqueda y presentacion de compras pendientes.
function CompraSelector({
    comprasPendientes,
    selectedCompra,
    onSelectCompra,
    errorIdCompras,
}) {
    return (
        <Autocomplete
            fullWidth
            options={comprasPendientes}
            value={selectedCompra}
            onChange={onSelectCompra}
            getOptionLabel={(option) =>
                option
                    ? `Compra ${formatCompraCode(option.idCompras)} - ${option.ruc} - ${option.razonSocial}`
                    : ''
            }
            isOptionEqualToValue={(option, value) => option.idCompras === value.idCompras}
            filterOptions={filterCompraOptions}
            renderOption={renderCompraOption}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label="Compra disponible para recepcion"
                    placeholder="Busca por codigo, RUC, proveedor o articulo"
                    error={!!errorIdCompras}
                    helperText={errorIdCompras}
                />
            )}
        />
    );
}

CompraSelector.propTypes = {
    comprasPendientes: PropTypes.arrayOf(PropTypes.object).isRequired,
    selectedCompra: PropTypes.oneOfType([PropTypes.object, PropTypes.oneOf([null])]),
    onSelectCompra: PropTypes.func.isRequired,
    errorIdCompras: PropTypes.string.isRequired,
};

function ResumenCompra({ detalleCompra }) {
    const estadoCompra = detalleCompra?.estado || '-';

    return (
        <Box
            sx={{
                p: 2,
                borderRadius: 2,
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
            }}
        >
            <Typography sx={{ fontWeight: 700, color: '#0f172a', mb: 1.5 }}>
                Detalle de compra seleccionada
            </Typography>

            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                    gap: 1.5,
                }}
            >
                <InfoValue
                    label="Codigo de compra"
                    value={formatCompraCode(detalleCompra.idCompras)}
                    strong
                />
                <InfoValue label="Fecha de compra" value={formatDateTimePeru(detalleCompra.fechaCompras)} />
                <InfoValue label="Proveedor" value={detalleCompra.razonSocial} strong />
                <InfoValue label="RUC" value={detalleCompra.ruc} />
                <InfoValue label="Zona de produccion" value={detalleCompra.zonaProduccion || '-'} />
                <InfoValue label="Numero de lote" value={formatNumber(detalleCompra.numeroLote)} />
                <InfoValue label="Moneda" value={getCurrencyPrefix(detalleCompra) || '-'} />
                <InfoValue label="Total compra" value={formatCurrency(detalleCompra.costoTotal, detalleCompra)} />
                <InfoValue label="Estado de compra">
                    <Chip
                        label={estadoCompra}
                        size="small"
                        sx={{
                            mt: 0.5,
                            fontWeight: 700,
                            ...getEstadoChipStyles(estadoCompra),
                        }}
                    />
                </InfoValue>
            </Box>
        </Box>
    );
}

ResumenCompra.propTypes = {
    detalleCompra: PropTypes.object.isRequired,
};

// Datos operativos generales de la recepcion.
function DatosRecepcion({ form, onFieldChange }) {
    return (
        <Box
            sx={{
                display: 'grid',
                gridTemplateColumns: '1fr',
                gap: 2,
            }}
        >
            <TextField
                fullWidth
                label="GUIA DE REMISION"
                value={form.guiaRemision}
                onChange={onFieldChange('guiaRemision')}
            />
        </Box>
    );
}

DatosRecepcion.propTypes = {
    form: PropTypes.shape({
        guiaRemision: PropTypes.string,
        tipoEnvase: PropTypes.string,
        cantidadEnvase: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    }).isRequired,
    onFieldChange: PropTypes.func.isRequired,
};

function EnvaseSection({ detalles, form, errors, onFieldChange }) {
    const tiposEnvase = getTiposEnvase(detalles);
    const envasePlaceholder = tiposEnvase.length ? tiposEnvase.join(', ') : 'Ej. Jaba, Caja, Bandeja';

    return (
        <Box>
            <Divider sx={{ mb: 2 }} />

            <Typography sx={{ fontWeight: 700, color: '#0f172a', mb: 0.5 }}>
                Envase
            </Typography>
            <Typography sx={{ color: '#64748b', fontSize: '0.85rem', mb: 1.5 }}>
                Registra el tipo de envase usado y la cantidad recibida.
            </Typography>

            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: '1.4fr 0.8fr' },
                    gap: 2,
                    alignItems: 'start',
                }}
            >
                <TextField
                    fullWidth
                    label="TIPO DE ENVASE"
                    value={form.tipoEnvase || envasePlaceholder}
                    helperText="Tomado del maestro de articulos"
                    slotProps={{ input: { readOnly: true } }}
                    sx={{
                        '& .MuiInputBase-root': {
                            backgroundColor: '#f8fafc',
                        },
                    }}
                />

                <TextField
                    fullWidth
                    type="text"
                    label="CANTIDAD"
                    value={form.cantidadEnvase}
                    onChange={onFieldChange('cantidadEnvase')}
                    error={!!errors.cantidadEnvase}
                    helperText={errors.cantidadEnvase || ''}
                    slotProps={{
                        htmlInput: {
                            min: 0,
                            step: 1,
                            inputMode: 'numeric',
                            pattern: '[0-9]*',
                        },
                    }}
                />
            </Box>
        </Box>
    );
}

EnvaseSection.propTypes = {
    detalles: PropTypes.arrayOf(PropTypes.object).isRequired,
    form: PropTypes.shape({
        tipoEnvase: PropTypes.string,
        cantidadEnvase: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    }).isRequired,
    errors: PropTypes.objectOf(PropTypes.string).isRequired,
    onFieldChange: PropTypes.func.isRequired,
};

function ResumenPesos({ detalleCompra }) {
    return (
        <Box
            sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' },
                gap: 2,
            }}
        >
            <TextField
                fullWidth
                label="Peso comprado"
                value={formatNumber(detalleCompra?.pesoComprado)}
                slotProps={{ input: { readOnly: true } }}
            />

            <TextField
                fullWidth
                label="Total recibido"
                value={formatNumber(detalleCompra?.totalRecibido)}
                slotProps={{ input: { readOnly: true } }}
            />

            <TextField
                fullWidth
                label="Peso pendiente"
                value={formatNumber(detalleCompra?.pesoPendiente)}
                slotProps={{ input: { readOnly: true } }}
            />
        </Box>
    );
}

ResumenPesos.propTypes = {
    detalleCompra: PropTypes.object.isRequired,
};

// Fila editable de recepcion: controla el peso recibido por articulo comprado.
const DetalleRecepcionItem = React.memo(function DetalleRecepcionItem({
    detalle,
    index,
    error,
    onDetalleChange,
}) {
    const pendiente = Number(detalle.pesoPendiente || 0);
    const estaCompleto = pendiente <= 0;

    return (
        <Paper
            elevation={0}
            sx={{
                p: 2,
                border: '1px solid #e2e8f0',
                borderRadius: 2,
                backgroundColor: estaCompleto ? '#f8fafc' : '#fff',
            }}
        >
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                        xs: '1fr',
                        md: '1.5fr 0.8fr 0.8fr 0.8fr 1fr',
                    },
                    gap: 2,
                    alignItems: 'center',
                }}
            >
                <TextField
                    fullWidth
                    label="Articulo"
                    value={detalle.articulo}
                    slotProps={{ input: { readOnly: true } }}
                />

                <TextField
                    fullWidth
                    label="Medida"
                    value={detalle.medida || '-'}
                    slotProps={{ input: { readOnly: true } }}
                />

                <TextField
                    fullWidth
                    label="Comprado"
                    value={formatNumber(detalle.pesoComprado)}
                    slotProps={{ input: { readOnly: true } }}
                />

                <TextField
                    fullWidth
                    label="Pendiente"
                    value={formatNumber(detalle.pesoPendiente)}
                    slotProps={{ input: { readOnly: true } }}
                />

                <TextField
                    fullWidth
                    type="text"
                    label="Recibir"
                    value={detalle.recibido}
                    onChange={(event) => onDetalleChange(index, event.target.value)}
                    error={!!error}
                    helperText={error || ''}
                    disabled={estaCompleto}
                    slotProps={{
                        htmlInput: {
                            min: 0,
                            max: pendiente,
                            step: '0.01',
                            inputMode: 'decimal',
                            pattern: '[0-9]*[.]?[0-9]*',
                        },
                    }}
                />
            </Box>
        </Paper>
    );
});

DetalleRecepcionItem.propTypes = {
    detalle: PropTypes.shape({
        idArticulo: PropTypes.number,
        idCategoria: PropTypes.number,
        articulo: PropTypes.string,
        descripcionCategoria: PropTypes.string,
        tipoEnvase: PropTypes.string,
        medida: PropTypes.string,
        pesoComprado: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        pesoPendiente: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        recibido: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    }).isRequired,
    index: PropTypes.number.isRequired,
    error: PropTypes.string,
    onDetalleChange: PropTypes.func.isRequired,
};

function DetallesRecepcion({ detalles, errors, onDetalleChange }) {
    return (
        <Box>
            <Typography sx={{ fontWeight: 700, color: '#0f172a', mb: 1 }}>
                Articulos pendientes
            </Typography>

            <Stack spacing={1.5}>
                {detalles.map((detalle, index) => (
                    <DetalleRecepcionItem
                        key={detalle.idCompraDetalle}
                        detalle={detalle}
                        index={index}
                        error={errors[`detalle_${index}_recibido`] || ''}
                        onDetalleChange={onDetalleChange}
                    />
                ))}
            </Stack>

            {errors.detalles ? (
                <Typography sx={{ mt: 1, color: '#dc2626', fontSize: '0.8rem' }}>
                    {errors.detalles}
                </Typography>
            ) : null}
        </Box>
    );
}

DetallesRecepcion.propTypes = {
    detalles: PropTypes.arrayOf(PropTypes.object).isRequired,
    errors: PropTypes.objectOf(PropTypes.string).isRequired,
    onDetalleChange: PropTypes.func.isRequired,
};

// Muestra el impacto del registro antes de guardar la recepcion.
function TotalesRecepcion({ totalRecepcionActual, pendienteLuegoRegistro }) {
    return (
        <Box
            sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                gap: 2,
            }}
        >
            <TextField
                fullWidth
                label="Recepcion actual"
                value={formatNumber(totalRecepcionActual)}
                slotProps={{ input: { readOnly: true } }}
            />

            <TextField
                fullWidth
                label="Pendiente despues del registro"
                value={formatNumber(pendienteLuegoRegistro)}
                slotProps={{ input: { readOnly: true } }}
            />
        </Box>
    );
}

TotalesRecepcion.propTypes = {
    totalRecepcionActual: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    pendienteLuegoRegistro: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
};

function DetalleCompraSeleccionada({
    detalleCompra,
    form,
    errors,
    onFieldChange,
    onDetalleChange,
    totalRecepcionActual,
    pendienteLuegoRegistro,
}) {
    return (
        <>
            <ResumenCompra detalleCompra={detalleCompra} />
            <Divider />
            <DatosRecepcion form={form} onFieldChange={onFieldChange} />
            <EnvaseSection
                detalles={form.detalles}
                form={form}
                errors={errors}
                onFieldChange={onFieldChange}
            />
            <ResumenPesos detalleCompra={detalleCompra} />
            <DetallesRecepcion
                detalles={form.detalles}
                errors={errors}
                onDetalleChange={onDetalleChange}
            />
            <TotalesRecepcion
                totalRecepcionActual={totalRecepcionActual}
                pendienteLuegoRegistro={pendienteLuegoRegistro}
            />
        </>
    );
}

DetalleCompraSeleccionada.propTypes = {
    detalleCompra: PropTypes.object.isRequired,
    form: PropTypes.shape({
        guiaRemision: PropTypes.string,
        tipoEnvase: PropTypes.string,
        cantidadEnvase: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        detalles: PropTypes.arrayOf(PropTypes.object).isRequired,
    }).isRequired,
    errors: PropTypes.objectOf(PropTypes.string).isRequired,
    onFieldChange: PropTypes.func.isRequired,
    onDetalleChange: PropTypes.func.isRequired,
    totalRecepcionActual: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    pendienteLuegoRegistro: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
};

// Modal presentacional para registrar recepciones de una compra seleccionada.
export default function ModalRecepcion({
    open,
    onClose,
    saving,
    comprasLoading,
    detalleLoading,
    comprasPendientes,
    selectedCompra,
    setSelectedCompra,
    form,
    setForm,
    errors,
    setErrors,
    detalleCompra,
    serverError,
    cargarDetalleCompra,
    handleDetalleChange,
    handleSubmit,
    totalRecepcionActual,
    pendienteLuegoRegistro,
}) {
    const errorIdCompras = errors.idCompras || '';

    const mostrarCargaCompras = comprasLoading;
    const mostrarCargaDetalle = !comprasLoading && detalleLoading;
    const mostrarDetalle = !comprasLoading && !detalleLoading && !!detalleCompra;
    const mostrarInfoInicial = !comprasLoading && !detalleLoading && !detalleCompra;

    const handleSelectCompra = React.useCallback((_event, newValue) => {
        setSelectedCompra(newValue);

        setForm((prev) => ({
            ...prev,
            idCompras: newValue ? newValue.idCompras : null,
            detalles: [],
        }));

        if (errors.idCompras) {
            setErrors((prev) => ({
                ...prev,
                idCompras: '',
            }));
        }

        if (newValue?.idCompras) {
            cargarDetalleCompra(newValue.idCompras);
        }
    }, [cargarDetalleCompra, errors.idCompras, setErrors, setForm, setSelectedCompra]);

    const handleRecepcionFieldChange = React.useCallback((field) => (event) => {
        setForm((prev) => ({
            ...prev,
            [field]: event.target.value,
        }));

        if (errors[field]) {
            setErrors((prev) => ({
                ...prev,
                [field]: '',
            }));
        }
    }, [errors, setErrors, setForm]);

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
            <DialogTitle sx={{ fontWeight: 700 }}>Nueva recepcion</DialogTitle>

            <DialogContent dividers sx={{ pt: 2.5 }}>
                <Stack spacing={2}>
                    {serverError && <Alert severity="error">{serverError}</Alert>}

                    {mostrarCargaCompras ? (
                        <Box sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
                            <CircularProgress size={26} />
                        </Box>
                    ) : (
                        <>
                            <CompraSelector
                                comprasPendientes={comprasPendientes}
                                selectedCompra={selectedCompra}
                                onSelectCompra={handleSelectCompra}
                                errorIdCompras={errorIdCompras}
                            />

                            {mostrarCargaDetalle ? (
                                <Box sx={{ py: 3, display: 'flex', justifyContent: 'center' }}>
                                    <CircularProgress size={24} />
                                </Box>
                            ) : null}

                            {mostrarDetalle ? (
                                <DetalleCompraSeleccionada
                                    detalleCompra={detalleCompra}
                                    form={form}
                                    errors={errors}
                                    onFieldChange={handleRecepcionFieldChange}
                                    onDetalleChange={handleDetalleChange}
                                    totalRecepcionActual={totalRecepcionActual}
                                    pendienteLuegoRegistro={pendienteLuegoRegistro}
                                />
                            ) : null}

                            {mostrarInfoInicial ? (
                                <Alert severity="info">
                                    Selecciona una compra disponible para visualizar sus articulos pendientes.
                                </Alert>
                            ) : null}
                        </>
                    )}
                </Stack>
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button onClick={onClose} disabled={saving} sx={{ textTransform: 'none' }}>
                    Cancelar
                </Button>

                <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={saving || comprasLoading || detalleLoading || !detalleCompra}
                    sx={{ textTransform: 'none', fontWeight: 700, boxShadow: 'none' }}
                >
                    {saving ? 'Guardando...' : 'Registrar'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

const compraOptionShape = PropTypes.shape({
    idCompras: PropTypes.number,
    ruc: PropTypes.string,
    razonSocial: PropTypes.string,
    articulo: PropTypes.string,
    pesoComprado: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
});

const detalleCompraShape = PropTypes.shape({
    idCompras: PropTypes.number,
    fechaCompras: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    razonSocial: PropTypes.string,
    ruc: PropTypes.string,
    zonaProduccion: PropTypes.string,
    numeroLote: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    costoTotal: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    estado: PropTypes.string,
    pesoComprado: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    totalRecibido: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    pesoPendiente: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    detalles: PropTypes.arrayOf(PropTypes.object),
});

ModalRecepcion.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    saving: PropTypes.bool.isRequired,
    comprasLoading: PropTypes.bool.isRequired,
    detalleLoading: PropTypes.bool.isRequired,
    comprasPendientes: PropTypes.arrayOf(compraOptionShape).isRequired,
    selectedCompra: PropTypes.oneOfType([compraOptionShape, PropTypes.oneOf([null])]),
    setSelectedCompra: PropTypes.func.isRequired,
    form: PropTypes.shape({
        idCompras: PropTypes.oneOfType([PropTypes.number, PropTypes.oneOf([null])]),
        guiaRemision: PropTypes.string,
        tipoEnvase: PropTypes.string,
        cantidadEnvase: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        detalles: PropTypes.arrayOf(
            PropTypes.shape({
                idCompraDetalle: PropTypes.number,
                idArticulo: PropTypes.number,
                idCategoria: PropTypes.number,
                articulo: PropTypes.string,
                descripcionCategoria: PropTypes.string,
                tipoEnvase: PropTypes.string,
                medida: PropTypes.string,
                pesoComprado: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
                totalRecibido: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
                pesoPendiente: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
                recibido: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
            })
        ).isRequired,
    }).isRequired,
    setForm: PropTypes.func.isRequired,
    errors: PropTypes.objectOf(PropTypes.string).isRequired,
    setErrors: PropTypes.func.isRequired,
    detalleCompra: PropTypes.oneOfType([detalleCompraShape, PropTypes.oneOf([null])]),
    serverError: PropTypes.string,
    cargarDetalleCompra: PropTypes.func.isRequired,
    handleDetalleChange: PropTypes.func.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    totalRecepcionActual: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    pendienteLuegoRegistro: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
};

ModalRecepcion.defaultProps = {
    selectedCompra: null,
    detalleCompra: null,
    serverError: '',
};
