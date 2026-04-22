import React from 'react';
import PropTypes from 'prop-types';

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
    Chip,
    CircularProgress,
    TablePagination,
} from '@mui/material';

import { recepcionService } from '../../../services/recepcionService';
import ModalRecepcion from './ModalRecepcion';

function Icon({ name, size, color }) {
    return (
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
}

Icon.propTypes = {
    name: PropTypes.string.isRequired,
    size: PropTypes.number,
    color: PropTypes.string,
};

Icon.defaultProps = {
    size: 20,
    color: 'inherit',
};

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

export default function Recepciones() {
    const [recepciones, setRecepciones] = React.useState([]);
    const [comprasDisponibles, setComprasDisponibles] = React.useState([]);
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
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(5);

    const cargarRecepciones = React.useCallback(async () => {
        try {
            setLoading(true);
            const data = await recepcionService.listar();
            setRecepciones(Array.isArray(data) ? data : []);
            setPage(0);
        } catch (error) {
            console.error('Error al listar recepciones:', error);
            console.error('status:', error?.response?.status);
            console.error('data:', error?.response?.data);
        } finally {
            setLoading(false);
        }
    }, []);

    const cargarComprasDisponibles = React.useCallback(async () => {
        try {
            setComprasLoading(true);
            const data = await recepcionService.listarComprasPendientes();
            setComprasDisponibles(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error al listar compras disponibles:', error);
            console.error('status:', error?.response?.status);
            console.error('data:', error?.response?.data);
        } finally {
            setComprasLoading(false);
        }
    }, []);

    React.useEffect(() => {
        cargarRecepciones();
        cargarComprasDisponibles();
    }, [cargarRecepciones, cargarComprasDisponibles]);

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
            newErrors.idCompras = 'Seleccione una compra disponible';
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
            await Promise.all([cargarRecepciones(), cargarComprasDisponibles()]);
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

    const handleChangePage = (_, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const recepcionesPaginadas = React.useMemo(() => {
        const inicio = page * rowsPerPage;
        const fin = inicio + rowsPerPage;
        return recepciones.slice(inicio, fin);
    }, [recepciones, page, rowsPerPage]);

    const showLoading = loading;
    const showEmpty = !loading && recepciones.length === 0;
    const showRows = !loading && recepciones.length > 0;

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
                                Registra recepciones parciales o completas de compras disponibles.
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
                            overflowX: 'auto',
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
                                {showLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={11} align="center" sx={{ py: 4 }}>
                                            <CircularProgress size={28} />
                                        </TableCell>
                                    </TableRow>
                                ) : null}

                                {showEmpty ? (
                                    <TableRow>
                                        <TableCell colSpan={11} align="center" sx={{ py: 4, color: '#64748b' }}>
                                            No hay recepciones registradas.
                                        </TableCell>
                                    </TableRow>
                                ) : null}

                                {showRows
                                    ? recepcionesPaginadas.map((recepcion) => (
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
                                    : null}
                            </TableBody>
                        </Table>

                        {showRows ? (
                            <TablePagination
                                component="div"
                                count={recepciones.length}
                                page={page}
                                onPageChange={handleChangePage}
                                rowsPerPage={rowsPerPage}
                                onRowsPerPageChange={handleChangeRowsPerPage}
                                rowsPerPageOptions={[5, 10, 20]}
                                labelRowsPerPage="Filas por página:"
                            />
                        ) : null}
                    </TableContainer>
                </CardContent>
            </Card>

            <ModalRecepcion
                open={open}
                onClose={handleClose}
                saving={saving}
                comprasLoading={comprasLoading}
                detalleLoading={detalleLoading}
                comprasPendientes={comprasDisponibles}
                selectedCompra={selectedCompra}
                setSelectedCompra={setSelectedCompra}
                form={form}
                setForm={setForm}
                errors={errors}
                setErrors={setErrors}
                detalleCompra={detalleCompra}
                serverError={serverError}
                cargarDetalleCompra={cargarDetalleCompra}
                handleChange={handleChange}
                handleSubmit={handleSubmit}
                recibidoActual={recibidoActual}
                pendienteLuegoRegistro={pendienteLuegoRegistro}
            />
        </Box>
    );
}