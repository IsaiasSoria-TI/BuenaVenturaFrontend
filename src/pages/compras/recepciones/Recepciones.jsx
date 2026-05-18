import React from 'react';
import PropTypes from 'prop-types';

import {
    Alert,
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
    IconButton,
    Tooltip,
    TextField,
    InputAdornment,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
} from '@mui/material';

import { recepcionService } from '../../../services/recepcionService';
import ModalDetalleRecepcion from './ModalDetalleRecepcion';
import ModalRecepcion from './ModalRecepcion';
import {
    formatCompraCode,
    formatDateTimePeru,
    formatRecepcionCode,
} from '../../../utils/formatters';

function Icon({ name, size = 20, color = 'inherit' }) {
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

const initialForm = {
    idCompras: null,
    guiaRemision: '',
    cantidadJabas: '',
    detalles: [],
};

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

function getArticulosResumen(recepcion) {
    if (Array.isArray(recepcion.detalles) && recepcion.detalles.length > 0) {
        return recepcion.detalles
            .map((detalle) => detalle.articulo)
            .filter(Boolean)
            .join(', ');
    }

    return recepcion.articulo || '-';
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
    const [detailDialogOpen, setDetailDialogOpen] = React.useState(false);
    const [selectedDetail, setSelectedDetail] = React.useState(null);
    const [editDialogOpen, setEditDialogOpen] = React.useState(false);
    const [selectedEdit, setSelectedEdit] = React.useState(null);
    const [editForm, setEditForm] = React.useState({ guiaRemision: '', cantidadJabas: '' });
    const [editSaving, setEditSaving] = React.useState(false);
    const [successMessage, setSuccessMessage] = React.useState('');

    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(5);
    const [searchTerm, setSearchTerm] = React.useState('');

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

    const handleOpenDetailDialog = (recepcion) => {
        setSelectedDetail(recepcion);
        setDetailDialogOpen(true);
    };

    const handleCloseDetailDialog = () => {
        setDetailDialogOpen(false);
        setSelectedDetail(null);
    };

    const handleOpenEditDialog = (recepcion) => {
        setSelectedEdit(recepcion);
        setEditForm({
            guiaRemision: recepcion.guiaRemision || '',
            cantidadJabas: recepcion.cantidadJabas ?? '',
        });
        setErrors({});
        setServerError('');
        setSuccessMessage('');
        setEditDialogOpen(true);
    };

    const handleCloseEditDialog = () => {
        if (editSaving) return;

        setEditDialogOpen(false);
        setSelectedEdit(null);
        setErrors({});
    };

    const handleEditChange = (field) => (event) => {
        setEditForm((prev) => ({
            ...prev,
            [field]: event.target.value,
        }));

        if (errors[field]) {
            setErrors((prev) => ({
                ...prev,
                [field]: '',
            }));
        }
    };

    const handleSubmitEdit = async () => {
        if (!selectedEdit?.idRecepciones) return;

        const cantidadJabas = Number(editForm.cantidadJabas || 0);
        if (!Number.isFinite(cantidadJabas) || cantidadJabas < 0) {
            setErrors((prev) => ({
                ...prev,
                cantidadJabas: !Number.isFinite(cantidadJabas)
                    ? 'Ingrese una cantidad valida'
                    : 'No puede ser negativo',
            }));
            return;
        }

        try {
            setEditSaving(true);
            setServerError('');
            setSuccessMessage('');

            await recepcionService.actualizarDatos(selectedEdit.idRecepciones, {
                guiaRemision: editForm.guiaRemision.trim() || null,
                cantidadJabas,
            });

            setSuccessMessage('Datos de recepcion actualizados correctamente.');
            handleCloseEditDialog();
            await cargarRecepciones();
        } catch (error) {
            console.error('Error al actualizar datos de recepcion:', error);
            const message =
                error?.response?.data?.message ||
                error?.response?.data ||
                'No se pudieron actualizar los datos de recepcion.';
            setServerError(typeof message === 'string' ? message : 'No se pudieron actualizar los datos de recepcion.');
        } finally {
            setEditSaving(false);
        }
    };

    const cargarDetalleCompra = async (idCompras) => {
        try {
            setDetalleLoading(true);
            setServerError('');

            const data = await recepcionService.verDetalleCompra(idCompras);
            setDetalleCompra(data);

            const detallesForm = Array.isArray(data.detalles)
                ? data.detalles.map((detalle) => ({
                    idCompraDetalle: detalle.idCompraDetalle,
                    articulo: detalle.articulo || '',
                    medida: detalle.medida || '',
                    pesoComprado: detalle.pesoComprado ?? 0,
                    totalRecibido: detalle.totalRecibido ?? 0,
                    pesoPendiente: detalle.pesoPendiente ?? 0,
                    recibido: '',
                }))
                : [];

            setForm((prev) => ({
                ...prev,
                idCompras,
                detalles: detallesForm,
            }));
        } catch (error) {
            console.error('Error al cargar detalle de compra:', error);
            console.error('status:', error?.response?.status);
            console.error('data:', error?.response?.data);

            setDetalleCompra(null);
            setForm((prev) => ({
                ...prev,
                detalles: [],
            }));

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

    const handleDetalleChange = (index, value) => {
        setForm((prev) => ({
            ...prev,
            detalles: prev.detalles.map((detalle, detalleIndex) =>
                detalleIndex === index ? { ...detalle, recibido: value } : detalle
            ),
        }));

        const errorKey = `detalle_${index}_recibido`;
        if (errors[errorKey]) {
            setErrors((prev) => ({
                ...prev,
                [errorKey]: '',
            }));
        }

        if (errors.detalles) {
            setErrors((prev) => ({
                ...prev,
                detalles: '',
            }));
        }

        if (serverError) {
            setServerError('');
        }
    };

    const validate = () => {
        const newErrors = {};

        if (!form.idCompras) {
            newErrors.idCompras = 'Seleccione una compra disponible';
        }

        if (!form.detalles.length) {
            newErrors.detalles = 'La compra no tiene detalles disponibles';
        }

        const cantidadJabas = Number(form.cantidadJabas || 0);
        if (!Number.isFinite(cantidadJabas)) {
            newErrors.cantidadJabas = 'Ingrese una cantidad valida';
        } else if (cantidadJabas < 0) {
            newErrors.cantidadJabas = 'No puede ser negativo';
        }

        let tieneRecibido = false;

        form.detalles.forEach((detalle, index) => {
            const recibido = Number(detalle.recibido || 0);
            const pendiente = Number(detalle.pesoPendiente || 0);

            if (recibido > 0) {
                tieneRecibido = true;
            }

            if (recibido < 0) {
                newErrors[`detalle_${index}_recibido`] = 'No puede ser negativo';
            }

            if (recibido > pendiente) {
                newErrors[`detalle_${index}_recibido`] = 'No puede exceder el pendiente';
            }
        });

        if (!tieneRecibido) {
            newErrors.detalles = 'Ingrese al menos un peso recibido';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const buildPayload = () => ({
        idCompras: Number(form.idCompras),
        guiaRemision: form.guiaRemision.trim() || null,
        cantidadJabas: Number(form.cantidadJabas || 0),
        detalles: form.detalles
            .filter((detalle) => Number(detalle.recibido || 0) > 0)
            .map((detalle) => ({
                idCompraDetalle: Number(detalle.idCompraDetalle),
                recibido: Number(detalle.recibido),
            })),
    });

    const totalRecepcionActual = React.useMemo(() => {
        return form.detalles.reduce((total, detalle) => {
            return total + Number(detalle.recibido || 0);
        }, 0);
    }, [form.detalles]);

    const totalPendienteActual = React.useMemo(() => {
        return form.detalles.reduce((total, detalle) => {
            return total + Number(detalle.pesoPendiente || 0);
        }, 0);
    }, [form.detalles]);

    const pendienteLuegoRegistro = Math.max(totalPendienteActual - totalRecepcionActual, 0);

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

    const handleChangePage = (_event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(Number.parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
        setPage(0);
    };

    const recepcionesFiltradas = React.useMemo(() => {
        const criterio = searchTerm.trim().toLowerCase();
        if (!criterio) return recepciones;

        return recepciones.filter((recepcion) => {
            const valoresBusqueda = [
                formatRecepcionCode(recepcion.idRecepciones),
                formatCompraCode(recepcion.idCompras),
                recepcion.ruc,
                recepcion.razonSocial,
                recepcion.estadoCompra,
                recepcion.estado,
                recepcion.guiaRemision,
                recepcion.cantidadJabas,
                getArticulosResumen(recepcion),
            ];
            return valoresBusqueda.some((value) =>
                String(value || '').toLowerCase().includes(criterio)
            );
        });
    }, [recepciones, searchTerm]);

    const recepcionesPaginadas = React.useMemo(() => {
        const inicio = page * rowsPerPage;
        const fin = inicio + rowsPerPage;
        return recepcionesFiltradas.slice(inicio, fin);
    }, [recepcionesFiltradas, page, rowsPerPage]);

    const showLoading = loading;
    const showEmpty = !loading && recepciones.length === 0;
    const showNoResults = !loading && recepciones.length > 0 && recepcionesFiltradas.length === 0;
    const showRows = !loading && recepcionesFiltradas.length > 0;

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
                                Registra recepciones parciales o completas por artículo.
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

                    <TextField
                        fullWidth
                        size="small"
                        placeholder="Buscar recepciones por código, RUC, proveedor, estado o artículos..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Icon name="search" size={18} color="#64748b" />
                                    </InputAdornment>
                                ),
                            },
                        }}
                        sx={{ mb: 2 }}
                    />

                    {successMessage ? (
                        <Alert severity="success" sx={{ mb: 2 }}>
                            {successMessage}
                        </Alert>
                    ) : null}

                    {serverError ? (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {serverError}
                        </Alert>
                    ) : null}

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
                                    <TableCell sx={{ fontWeight: 700 }}>GUIA</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>JABAS</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>RUC</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>PROVEEDOR</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>ARTÍCULOS</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>TOTAL COMPRA</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>PESO COMPRADO</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>RECIBIDO</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>ESTADO COMPRA</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>ESTADO RECEPCIÓN</TableCell>
                                    <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>ACCIONES</TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {showLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={14} align="center" sx={{ py: 4 }}>
                                            <CircularProgress size={28} />
                                        </TableCell>
                                    </TableRow>
                                ) : null}

                                {showEmpty ? (
                                    <TableRow>
                                        <TableCell colSpan={14} align="center" sx={{ py: 4, color: '#64748b' }}>
                                            No hay recepciones registradas.
                                        </TableCell>
                                    </TableRow>
                                ) : null}

                                {showNoResults ? (
                                    <TableRow>
                                        <TableCell colSpan={14} align="center" sx={{ py: 4, color: '#64748b' }}>
                                            No se encontraron recepciones con ese criterio.
                                        </TableCell>
                                    </TableRow>
                                ) : null}

                                {showRows
                                    ? recepcionesPaginadas.map((recepcion) => (
                                        <TableRow key={recepcion.idRecepciones} hover>
                                            <TableCell>{formatRecepcionCode(recepcion.idRecepciones)}</TableCell>
                                            <TableCell>{formatDateTimePeru(recepcion.fechaRecepcion)}</TableCell>
                                            <TableCell>{formatCompraCode(recepcion.idCompras)}</TableCell>
                                            <TableCell>{recepcion.guiaRemision || '-'}</TableCell>
                                            <TableCell>{formatNumber(recepcion.cantidadJabas)}</TableCell>
                                            <TableCell>{recepcion.ruc}</TableCell>
                                            <TableCell>{recepcion.razonSocial}</TableCell>
                                            <TableCell>{getArticulosResumen(recepcion)}</TableCell>
                                            <TableCell>{formatCurrency(recepcion.costoTotal, recepcion)}</TableCell>
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
                                            <TableCell align="center">
                                                <Tooltip title="Ver detalle">
                                                    <IconButton onClick={() => handleOpenDetailDialog(recepcion)}>
                                                        <Icon name="visibility" size={20} color="#0f766e" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Editar guia y jabas">
                                                    <IconButton onClick={() => handleOpenEditDialog(recepcion)}>
                                                        <Icon name="edit" size={20} color="#1976d2" />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                    : null}
                            </TableBody>
                        </Table>

                        {showRows ? (
                            <TablePagination
                                component="div"
                                count={recepcionesFiltradas.length}
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
                handleDetalleChange={handleDetalleChange}
                handleSubmit={handleSubmit}
                totalRecepcionActual={totalRecepcionActual}
                pendienteLuegoRegistro={pendienteLuegoRegistro}
            />

            <ModalDetalleRecepcion
                open={detailDialogOpen}
                onClose={handleCloseDetailDialog}
                recepcion={selectedDetail}
            />

            <Dialog open={editDialogOpen} onClose={handleCloseEditDialog} fullWidth maxWidth="sm">
                <DialogTitle sx={{ fontWeight: 700 }}>Editar datos de recepcion</DialogTitle>
                <DialogContent dividers sx={{ pt: 2.5 }}>
                    <Stack spacing={2}>
                        {selectedEdit ? (
                            <Typography sx={{ fontSize: '0.85rem', color: '#64748b' }}>
                                {formatRecepcionCode(selectedEdit.idRecepciones)} - Compra {formatCompraCode(selectedEdit.idCompras)}
                            </Typography>
                        ) : null}

                        <TextField
                            fullWidth
                            label="GUIA DE REMISION"
                            value={editForm.guiaRemision}
                            onChange={handleEditChange('guiaRemision')}
                        />

                        <TextField
                            fullWidth
                            type="number"
                            label="CANTIDAD JABAS"
                            value={editForm.cantidadJabas}
                            onChange={handleEditChange('cantidadJabas')}
                            error={!!errors.cantidadJabas}
                            helperText={errors.cantidadJabas || ''}
                            slotProps={{
                                input: {
                                    inputProps: {
                                        min: 0,
                                        step: '0.01',
                                    },
                                },
                            }}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ px: 3, py: 2 }}>
                    <Button onClick={handleCloseEditDialog} disabled={editSaving} sx={{ textTransform: 'none' }}>
                        Cancelar
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleSubmitEdit}
                        disabled={editSaving}
                        sx={{ textTransform: 'none', fontWeight: 700, boxShadow: 'none' }}
                    >
                        {editSaving ? 'Guardando...' : 'Actualizar'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
