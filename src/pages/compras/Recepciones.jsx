import * as React from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Chip,
    CircularProgress,
    Autocomplete,
    Alert,
    Divider,
} from '@mui/material';

import { recepcionService } from '../../services/recepcionService';

const Icon = ({ name, size = 20, color = 'inherit' }) => (
    <Box
        component="span"
        className="material-symbols-rounded"
        sx={{
            fontSize: size,
            color,
            lineHeight: 1,
            userSelect: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontVariationSettings: '"FILL" 0, "wght" 500, "GRAD" 0, "opsz" 24',
        }}
    >
        {name}
    </Box>
);

const initialForm = {
    idCompras: null,
    recibido: '',
};

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

export default function Recepciones() {
    const [recepciones, setRecepciones] = React.useState([]);
    const [comprasPendientes, setComprasPendientes] = React.useState([]);
    const [detalleCompra, setDetalleCompra] = React.useState(null);

    const [loading, setLoading] = React.useState(true);
    const [comprasLoading, setComprasLoading] = React.useState(true);
    const [detalleLoading, setDetalleLoading] = React.useState(false);
    const [saving, setSaving] = React.useState(false);

    const [open, setOpen] = React.useState(false);

    const [form, setForm] = React.useState(initialForm);
    const [errors, setErrors] = React.useState({});
    const [selectedCompra, setSelectedCompra] = React.useState(null);
    const [serverError, setServerError] = React.useState('');

    const cargarRecepciones = React.useCallback(async () => {
        try {
            setLoading(true);
            const data = await recepcionService.listar();
            setRecepciones(data);
        } catch (error) {
            console.error('Error al listar recepciones:', error);
            console.error('status:', error?.response?.status);
            console.error('data:', error?.response?.data);
        } finally {
            setLoading(false);
        }
    }, []);

    const cargarComprasPendientes = React.useCallback(async () => {
        try {
            setComprasLoading(true);
            const data = await recepcionService.listarComprasPendientes();
            setComprasPendientes(data);
        } catch (error) {
            console.error('Error al listar compras pendientes:', error);
            console.error('status:', error?.response?.status);
            console.error('data:', error?.response?.data);
        } finally {
            setComprasLoading(false);
        }
    }, []);

    React.useEffect(() => {
        cargarRecepciones();
        cargarComprasPendientes();
    }, [cargarRecepciones, cargarComprasPendientes]);

    const handleOpenCreate = () => {
        setForm(initialForm);
        setErrors({});
        setSelectedCompra(null);
        setDetalleCompra(null);
        setServerError('');
        setOpen(true);
    };

    const handleClose = () => {
        if (saving) return;

        setOpen(false);
        setForm(initialForm);
        setSelectedCompra(null);
        setDetalleCompra(null);
        setErrors({});
        setServerError('');
    };

    const handleChange = (field) => (event) => {
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

        if (serverError) {
            setServerError('');
        }
    };

    const cargarDetalleCompra = async (idCompras) => {
        try {
            setDetalleLoading(true);
            setServerError('');
            const data = await recepcionService.verDetalleCompra(idCompras);
            setDetalleCompra(data);
        } catch (error) {
            console.error('Error al cargar detalle de compra:', error);
            console.error('status:', error?.response?.status);
            console.error('data:', error?.response?.data);

            setDetalleCompra(null);

            const message =
                error?.response?.data?.message ||
                error?.response?.data ||
                'No se pudo cargar el detalle de la compra.';

            setServerError(
                typeof message === 'string'
                    ? message
                    : 'No se pudo cargar el detalle de la compra.'
            );
        } finally {
            setDetalleLoading(false);
        }
    };

    const validate = () => {
        const newErrors = {};

        if (!form.idCompras) {
            newErrors.idCompras = 'Seleccione una compra pendiente';
        }

        if (form.recibido === '' || Number(form.recibido) <= 0) {
            newErrors.recibido = 'El peso recibido debe ser mayor a 0';
        }

        if (
            detalleCompra &&
            form.recibido !== '' &&
            Number(form.recibido) > Number(detalleCompra.pesoPendiente)
        ) {
            newErrors.recibido = 'El peso recibido no puede exceder el peso pendiente';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const buildPayload = () => ({
        idCompras: Number(form.idCompras),
        recibido: Number(form.recibido),
    });

    const recibidoActual = form.recibido === '' ? 0 : Number(form.recibido);
    const pesoPendienteActual = Number(detalleCompra?.pesoPendiente || 0);
    const pendienteLuegoRegistro = Math.max(pesoPendienteActual - recibidoActual, 0);

    const handleSubmit = async () => {
        if (!validate()) return;

        try {
            setSaving(true);
            setServerError('');

            const payload = buildPayload();
            await recepcionService.registrar(payload);

            handleClose();
            await Promise.all([cargarRecepciones(), cargarComprasPendientes()]);
        } catch (error) {
            console.error('Error al registrar recepción:', error);
            console.error('status:', error?.response?.status);
            console.error('data:', error?.response?.data);

            const message =
                error?.response?.data?.message ||
                error?.response?.data ||
                'No se pudo registrar la recepción.';

            setServerError(
                typeof message === 'string'
                    ? message
                    : 'No se pudo registrar la recepción.'
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <Box>
            <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e2e8f0' }}>
                <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                    <Stack
                        direction={{ xs: 'column', md: 'row' }}
                        justifyContent="space-between"
                        alignItems={{ xs: 'stretch', md: 'center' }}
                        spacing={2}
                        sx={{ mb: 2.5 }}
                    >
                        <Box>
                            <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
                                Gestionar recepciones
                            </Typography>
                            <Typography sx={{ fontSize: '0.86rem', color: '#64748b', mt: 0.5 }}>
                                Registra recepciones parciales o completas de compras pendientes.
                            </Typography>
                        </Box>

                        <Button
                            variant="contained"
                            onClick={handleOpenCreate}
                            startIcon={<Icon name="add" size={18} color="#fff" />}
                            sx={{
                                alignSelf: { xs: 'flex-start', md: 'auto' },
                                textTransform: 'none',
                                fontWeight: 700,
                                borderRadius: 2,
                                boxShadow: 'none',
                            }}
                        >
                            Nueva recepción
                        </Button>
                    </Stack>

                    <TableContainer
                        component={Paper}
                        elevation={0}
                        sx={{
                            border: '1px solid #e2e8f0',
                            borderRadius: 2.5,
                            overflow: 'hidden',
                        }}
                    >
                        <Table>
                            <TableHead>
                                <TableRow sx={{ backgroundColor: '#f8fafc' }}>
                                    <TableCell sx={{ fontWeight: 700 }}>CÓDIGO</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>FECHA</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>COMPRA</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>RUC</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>PROVEEDOR</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>ARTÍCULO</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>MEDIDA</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>PESO COMPRADO</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>RECIBIDO</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>ESTADO COMPRA</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>ESTADO RECEPCIÓN</TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={11} align="center" sx={{ py: 4 }}>
                                            <CircularProgress size={28} />
                                        </TableCell>
                                    </TableRow>
                                ) : recepciones.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={11} align="center" sx={{ py: 4, color: '#64748b' }}>
                                            No hay recepciones registradas.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    recepciones.map((recepcion) => (
                                        <TableRow key={recepcion.idRecepciones} hover>
                                            <TableCell>{recepcion.idRecepciones}</TableCell>
                                            <TableCell>{formatDateTimeForTable(recepcion.fechaRecepcion)}</TableCell>
                                            <TableCell>{recepcion.idCompras}</TableCell>
                                            <TableCell>{recepcion.ruc}</TableCell>
                                            <TableCell>{recepcion.razonSocial}</TableCell>
                                            <TableCell>{recepcion.articulo}</TableCell>
                                            <TableCell>{recepcion.medida}</TableCell>
                                            <TableCell>{formatNumber(recepcion.pesoComprado)}</TableCell>
                                            <TableCell>{formatNumber(recepcion.recibido)}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={recepcion.estadoCompra || '-'}
                                                    size="small"
                                                    sx={{
                                                        fontWeight: 700,
                                                        ...getEstadoChipStyles(recepcion.estadoCompra),
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={recepcion.estado || '-'}
                                                    size="small"
                                                    sx={{
                                                        fontWeight: 700,
                                                        ...getEstadoChipStyles(recepcion.estado),
                                                    }}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>

            <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
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
                                        setDetalleCompra(null);
                                        setServerError('');

                                        if (newValue?.idCompras) {
                                            cargarDetalleCompra(newValue.idCompras);
                                        }

                                        if (errors.idCompras) {
                                            setErrors((prev) => ({
                                                ...prev,
                                                idCompras: '',
                                            }));
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
                    <Button onClick={handleClose} disabled={saving} sx={{ textTransform: 'none' }}>
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
        </Box>
    );
}