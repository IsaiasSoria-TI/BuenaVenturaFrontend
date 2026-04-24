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

function formatDateTimeForTable(value) {
    if (!value) return '-';

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return String(value).replace('T', ' ').slice(0, 16);
    }

    return date.toLocaleString();
}

function formatNumber(value) {
    if (value === null || value === undefined || value === '') return '0.00';

    const number = Number(value);
    if (Number.isNaN(number)) return '0.00';

    return number.toFixed(2);
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

    const estadoCompra = detalleCompra?.estado || '-';
    const pesoComprado = formatNumber(detalleCompra?.pesoComprado);
    const totalRecibido = formatNumber(detalleCompra?.totalRecibido);
    const pesoPendiente = formatNumber(detalleCompra?.pesoPendiente);
    const hectareas = formatNumber(detalleCompra?.hectareas);
    const costoTotal = formatNumber(detalleCompra?.costoTotal);

    const mostrarCargaCompras = comprasLoading;
    const mostrarCargaDetalle = !comprasLoading && detalleLoading;
    const mostrarDetalle = !comprasLoading && !detalleLoading && !!detalleCompra;
    const mostrarInfoInicial = !comprasLoading && !detalleLoading && !detalleCompra;

    const handleSelectCompra = (_event, newValue) => {
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
    };

    const renderCompraOption = (props, option) => (
        <Box component="li" {...props}>
            <Box>
                <Typography sx={{ fontWeight: 700, fontSize: '0.92rem' }}>
                    Compra #{option.idCompras}
                </Typography>
                <Typography sx={{ fontSize: '0.82rem', color: '#64748b' }}>
                    {option.ruc} - {option.razonSocial}
                </Typography>
                <Typography sx={{ fontSize: '0.8rem', color: '#64748b' }}>
                    {option.articulo || 'Varios artículos'} | Peso: {formatNumber(option.pesoComprado)}
                </Typography>
            </Box>
        </Box>
    );

    const renderDetalleCompra = () => (
        <>
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
                    <Box>
                        <Typography sx={{ fontSize: '0.8rem', color: '#64748b' }}>
                            Código de compra
                        </Typography>
                        <Typography sx={{ fontWeight: 700 }}>#{detalleCompra.idCompras}</Typography>
                    </Box>

                    <Box>
                        <Typography sx={{ fontSize: '0.8rem', color: '#64748b' }}>
                            Fecha de compra
                        </Typography>
                        <Typography>{formatDateTimeForTable(detalleCompra.fechaCompras)}</Typography>
                    </Box>

                    <Box>
                        <Typography sx={{ fontSize: '0.8rem', color: '#64748b' }}>
                            Proveedor
                        </Typography>
                        <Typography sx={{ fontWeight: 700 }}>{detalleCompra.razonSocial}</Typography>
                    </Box>

                    <Box>
                        <Typography sx={{ fontSize: '0.8rem', color: '#64748b' }}>
                            RUC
                        </Typography>
                        <Typography>{detalleCompra.ruc}</Typography>
                    </Box>

                    <Box>
                        <Typography sx={{ fontSize: '0.8rem', color: '#64748b' }}>
                            Zona de producción
                        </Typography>
                        <Typography>{detalleCompra.zonaProduccion || '-'}</Typography>
                    </Box>

                    <Box>
                        <Typography sx={{ fontSize: '0.8rem', color: '#64748b' }}>
                            Hectáreas
                        </Typography>
                        <Typography>{hectareas}</Typography>
                    </Box>

                    <Box>
                        <Typography sx={{ fontSize: '0.8rem', color: '#64748b' }}>
                            Costo total
                        </Typography>
                        <Typography>{costoTotal}</Typography>
                    </Box>

                    <Box>
                        <Typography sx={{ fontSize: '0.8rem', color: '#64748b' }}>
                            Estado de compra
                        </Typography>
                        <Chip
                            label={estadoCompra}
                            size="small"
                            sx={{
                                mt: 0.5,
                                fontWeight: 700,
                                ...getEstadoChipStyles(estadoCompra),
                            }}
                        />
                    </Box>
                </Box>
            </Box>

            <Divider />

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
                    value={pesoComprado}
                    slotProps={{ input: { readOnly: true } }}
                />

                <TextField
                    fullWidth
                    label="Total recibido"
                    value={totalRecibido}
                    slotProps={{ input: { readOnly: true } }}
                />

                <TextField
                    fullWidth
                    label="Peso pendiente"
                    value={pesoPendiente}
                    slotProps={{ input: { readOnly: true } }}
                />
            </Box>

            <Box>
                <Typography sx={{ fontWeight: 700, color: '#0f172a', mb: 1 }}>
                    Artículos pendientes
                </Typography>

                <Stack spacing={1.5}>
                    {form.detalles.map((detalle, index) => {
                        const pendiente = Number(detalle.pesoPendiente || 0);
                        const estaCompleto = pendiente <= 0;

                        return (
                            <Paper
                                key={detalle.idCompraDetalle}
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
                                        label="Artículo"
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
                                        type="number"
                                        label="Recibir"
                                        value={detalle.recibido}
                                        onChange={(event) => handleDetalleChange(index, event.target.value)}
                                        error={!!errors[`detalle_${index}_recibido`]}
                                        helperText={errors[`detalle_${index}_recibido`] || ''}
                                        disabled={estaCompleto}
                                        slotProps={{
                                            input: {
                                                inputProps: {
                                                    min: 0,
                                                    max: pendiente,
                                                    step: '0.01',
                                                },
                                            },
                                        }}
                                    />
                                </Box>
                            </Paper>
                        );
                    })}
                </Stack>

                {errors.detalles ? (
                    <Typography sx={{ mt: 1, color: '#dc2626', fontSize: '0.8rem' }}>
                        {errors.detalles}
                    </Typography>
                ) : null}
            </Box>

            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                    gap: 2,
                }}
            >
                <TextField
                    fullWidth
                    label="Recepción actual"
                    value={formatNumber(totalRecepcionActual)}
                    slotProps={{ input: { readOnly: true } }}
                />

                <TextField
                    fullWidth
                    label="Pendiente después del registro"
                    value={formatNumber(pendienteLuegoRegistro)}
                    slotProps={{ input: { readOnly: true } }}
                />
            </Box>
        </>
    );

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
            <DialogTitle sx={{ fontWeight: 700 }}>Nueva recepción</DialogTitle>

            <DialogContent dividers sx={{ pt: 2.5 }}>
                <Stack spacing={2}>
                    {serverError ? <Alert severity="error">{serverError}</Alert> : null}

                    {mostrarCargaCompras ? (
                        <Box sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
                            <CircularProgress size={26} />
                        </Box>
                    ) : (
                        <>
                            <Autocomplete
                                fullWidth
                                options={comprasPendientes}
                                value={selectedCompra}
                                onChange={handleSelectCompra}
                                getOptionLabel={(option) =>
                                    option
                                        ? `Compra #${option.idCompras} - ${option.ruc} - ${option.razonSocial}`
                                        : ''
                                }
                                isOptionEqualToValue={(option, value) =>
                                    option.idCompras === value.idCompras
                                }
                                filterOptions={(options, state) => {
                                    const input = state.inputValue.toLowerCase().trim();

                                    return options
                                        .filter(
                                            (option) =>
                                                String(option.idCompras).includes(input) ||
                                                option.ruc?.toLowerCase().includes(input) ||
                                                option.razonSocial?.toLowerCase().includes(input) ||
                                                option.articulo?.toLowerCase().includes(input)
                                        )
                                        .slice(0, 20);
                                }}
                                renderOption={renderCompraOption}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Compra disponible para recepción"
                                        placeholder="Busca por código, RUC, proveedor o artículo"
                                        error={!!errors.idCompras}
                                        helperText={errorIdCompras}
                                    />
                                )}
                            />

                            {mostrarCargaDetalle ? (
                                <Box sx={{ py: 3, display: 'flex', justifyContent: 'center' }}>
                                    <CircularProgress size={24} />
                                </Box>
                            ) : null}

                            {mostrarDetalle ? renderDetalleCompra() : null}

                            {mostrarInfoInicial ? (
                                <Alert severity="info">
                                    Selecciona una compra disponible para visualizar sus artículos pendientes.
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
    hectareas: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
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
        detalles: PropTypes.arrayOf(
            PropTypes.shape({
                idCompraDetalle: PropTypes.number,
                articulo: PropTypes.string,
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