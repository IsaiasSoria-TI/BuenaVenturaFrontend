import * as React from 'react';

import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  TextField,
  CircularProgress,
  Autocomplete,
  Alert,
  Divider,
  Typography,
  Chip,
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

    if (estado === 'Pendiente') {
        return {
            backgroundColor: '#fef3c7',
            color: '#d97706',
        };
    }

    return {
        backgroundColor: '#fee2e2',
        color: '#dc2626',
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
    handleChange,
    handleSubmit,
    recibidoActual,
    pendienteLuegoRegistro,
}) {
    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle sx={{ fontWeight: 700 }}>Nueva recepción</DialogTitle>

            <DialogContent dividers sx={{ pt: 2.5 }}>
                <Stack spacing={2}>
                    {serverError && <Alert severity="error">{serverError}</Alert>}

                    {comprasLoading ? (
                        <Box sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
                            <CircularProgress size={26} />
                        </Box>
                    ) : (
                        <>
                            <Autocomplete
                                fullWidth
                                options={comprasPendientes}
                                value={selectedCompra}
                                onChange={(_, newValue) => {
                                    setSelectedCompra(newValue);
                                    setForm((prev) => ({
                                        ...prev,
                                        idCompras: newValue ? newValue.idCompras : null,
                                    }));

                                    if (setErrors && errors.idCompras) {
                                        setErrors((prev) => ({
                                            ...prev,
                                            idCompras: '',
                                        }));
                                    }

                                    if (newValue?.idCompras) {
                                        cargarDetalleCompra(newValue.idCompras);
                                    }
                                }}
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

                                    const filtered = options.filter(
                                        (option) =>
                                            String(option.idCompras).includes(input) ||
                                            option.ruc?.toLowerCase().includes(input) ||
                                            option.razonSocial?.toLowerCase().includes(input) ||
                                            option.articulo?.toLowerCase().includes(input)
                                    );

                                    return filtered.slice(0, 20);
                                }}
                                renderOption={(props, option) => (
                                    <Box component="li" {...props}>
                                        <Box>
                                            <Typography sx={{ fontWeight: 700, fontSize: '0.92rem' }}>
                                                Compra #{option.idCompras}
                                            </Typography>
                                            <Typography sx={{ fontSize: '0.82rem', color: '#64748b' }}>
                                                {option.ruc} - {option.razonSocial}
                                            </Typography>
                                            <Typography sx={{ fontSize: '0.8rem', color: '#64748b' }}>
                                                {option.articulo} | Peso: {formatNumber(option.pesoComprado)}
                                            </Typography>
                                        </Box>
                                    </Box>
                                )}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Compra pendiente"
                                        placeholder="Busca por código, RUC, proveedor o artículo"
                                        error={!!errors.idCompras}
                                        helperText={errors.idCompras}
                                    />
                                )}
                            />

                            {detalleLoading ? (
                                <Box sx={{ py: 3, display: 'flex', justifyContent: 'center' }}>
                                    <CircularProgress size={24} />
                                </Box>
                            ) : detalleCompra ? (
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
                                                <Typography sx={{ fontWeight: 700 }}>
                                                    #{detalleCompra.idCompras}
                                                </Typography>
                                            </Box>

                                            <Box>
                                                <Typography sx={{ fontSize: '0.8rem', color: '#64748b' }}>
                                                    Fecha de compra
                                                </Typography>
                                                <Typography>
                                                    {formatDateTimeForTable(detalleCompra.fechaCompras)}
                                                </Typography>
                                            </Box>

                                            <Box>
                                                <Typography sx={{ fontSize: '0.8rem', color: '#64748b' }}>
                                                    Proveedor
                                                </Typography>
                                                <Typography sx={{ fontWeight: 700 }}>
                                                    {detalleCompra.razonSocial}
                                                </Typography>
                                            </Box>

                                            <Box>
                                                <Typography sx={{ fontSize: '0.8rem', color: '#64748b' }}>
                                                    RUC
                                                </Typography>
                                                <Typography>{detalleCompra.ruc}</Typography>
                                            </Box>

                                            <Box>
                                                <Typography sx={{ fontSize: '0.8rem', color: '#64748b' }}>
                                                    Artículo
                                                </Typography>
                                                <Typography>{detalleCompra.articulo}</Typography>
                                            </Box>

                                            <Box>
                                                <Typography sx={{ fontSize: '0.8rem', color: '#64748b' }}>
                                                    Medida
                                                </Typography>
                                                <Typography>{detalleCompra.medida}</Typography>
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
                                                <Typography>{formatNumber(detalleCompra.hectareas)}</Typography>
                                            </Box>

                                            <Box>
                                                <Typography sx={{ fontSize: '0.8rem', color: '#64748b' }}>
                                                    Costo por kilo
                                                </Typography>
                                                <Typography>{formatNumber(detalleCompra.costoKilo)}</Typography>
                                            </Box>

                                            <Box>
                                                <Typography sx={{ fontSize: '0.8rem', color: '#64748b' }}>
                                                    Costo total
                                                </Typography>
                                                <Typography>{formatNumber(detalleCompra.costoTotal)}</Typography>
                                            </Box>

                                            <Box>
                                                <Typography sx={{ fontSize: '0.8rem', color: '#64748b' }}>
                                                    Estado
                                                </Typography>
                                                <Chip
                                                    label={detalleCompra.estado || '-'}
                                                    size="small"
                                                    sx={{
                                                        mt: 0.5,
                                                        fontWeight: 700,
                                                        ...getEstadoChipStyles(detalleCompra.estado),
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
                                            value={formatNumber(detalleCompra.pesoComprado)}
                                            InputProps={{ readOnly: true }}
                                        />

                                        <TextField
                                            fullWidth
                                            label="Total recibido"
                                            value={formatNumber(detalleCompra.totalRecibido)}
                                            InputProps={{ readOnly: true }}
                                        />

                                        <TextField
                                            fullWidth
                                            label="Peso pendiente"
                                            value={formatNumber(detalleCompra.pesoPendiente)}
                                            InputProps={{ readOnly: true }}
                                        />
                                    </Box>

                                    <TextField
                                        fullWidth
                                        type="number"
                                        label="Peso recibido"
                                        value={form.recibido}
                                        onChange={handleChange('recibido')}
                                        error={!!errors.recibido}
                                        helperText={errors.recibido}
                                        inputProps={{
                                            min: 0.01,
                                            step: '0.01',
                                            max: detalleCompra.pesoPendiente || undefined,
                                        }}
                                    />

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
                                            value={formatNumber(recibidoActual)}
                                            InputProps={{ readOnly: true }}
                                        />

                                        <TextField
                                            fullWidth
                                            label="Pendiente después del registro"
                                            value={formatNumber(pendienteLuegoRegistro)}
                                            InputProps={{ readOnly: true }}
                                        />
                                    </Box>
                                </>
                            ) : (
                                <Alert severity="info">
                                    Selecciona una compra pendiente para visualizar su detalle y registrar la recepción.
                                </Alert>
                            )}
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