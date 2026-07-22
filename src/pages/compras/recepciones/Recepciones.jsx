import React from 'react';

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
    TablePagination,
    IconButton,
    Tooltip,
    TextField,
    InputAdornment,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    MenuItem,
} from '@mui/material';

import { recepcionService } from '../../../services/recepcionService';
import ModalDetalleRecepcion from './ModalDetalleRecepcion';
import ModalRecepcion from './ModalRecepcion';
import {
    formatCompraCode,
    formatDateWithCurrentTimePeru,
    formatRecepcionCode,
} from '../../../utils/formatters';
import { useAutoClearMessage } from '../../../utils/useAutoClearMessage';
import { getApiErrorMessage } from '../../../utils/getApiErrorMessage';
import MaterialSymbol from '../../../components/MaterialSymbol';
import TableSkeletonRows from '../../../components/loading/TableSkeletonRows';

const Icon = MaterialSymbol;

const initialForm = {
    idCompras: null,
    guiaRemision: '',
    tipoEnvase: '',
    cantidadEnvase: '',
    detalles: [],
};

// Mantiene el formato de importes consistente dentro del modulo de recepciones.
function formatNumber(value) {
    if (value === null || value === undefined || value === '') return '0.00';

    const number = Number(value);
    if (Number.isNaN(number)) return '0.00';

    return number.toFixed(2);
}

function formatInteger(value) {
    if (value === null || value === undefined || value === '') return '0';

    const number = Number(value);
    if (!Number.isFinite(number)) return '0';

    return String(Math.trunc(number));
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

function splitTiposEnvase(value) {
    return String(value || '')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
}

function getTiposEnvase(detalles) {
    return [...new Set(
        detalles
            .flatMap((detalle) => splitTiposEnvase(detalle.tipoEnvase || detalle.envase || ''))
    )];
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
    const [editForm, setEditForm] = React.useState({ guiaRemision: '', tipoEnvase: '', cantidadEnvase: '' });
    const [editSaving, setEditSaving] = React.useState(false);
    const [successMessage, setSuccessMessage] = React.useState('');

    useAutoClearMessage(successMessage, setSuccessMessage);

    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(5);
    const [searchTerm, setSearchTerm] = React.useState('');

    const editTiposEnvase = React.useMemo(() => {
        if (!selectedEdit) return [];

        const detalles = Array.isArray(selectedEdit.detalles) ? selectedEdit.detalles : [];
        return [...new Set([
            ...splitTiposEnvase(selectedEdit.tipoEnvase),
            ...getTiposEnvase(detalles),
        ])];
    }, [selectedEdit]);

    // Carga las recepciones ya registradas para el listado principal.
    const cargarRecepciones = React.useCallback(async () => {
        try {
            setLoading(true);

            const data = await recepcionService.listar();
            setRecepciones(Array.isArray(data) ? data : []);
            setPage(0);
        } catch {
            // La tabla conserva su estado actual si falla la recarga.
        } finally {
            setLoading(false);
        }
    }, []);

    // Obtiene compras pendientes de recepcion para alimentar el selector del modal.
    const cargarComprasDisponibles = React.useCallback(async () => {
        try {
            setComprasLoading(true);

            const data = await recepcionService.listarComprasPendientes();
            setComprasDisponibles(Array.isArray(data) ? data : []);
        } catch {
            // El selector de compras queda vacio si el catalogo no responde.
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
            tipoEnvase: splitTiposEnvase(recepcion.tipoEnvase)[0] || '',
            cantidadEnvase: recepcion.cantidadEnvase ?? '',
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

        const cantidadEnvase = Number(editForm.cantidadEnvase || 0);
        const tipoEnvase = editForm.tipoEnvase.trim();
        if (!tipoEnvase) {
            setErrors((prev) => ({
                ...prev,
                tipoEnvase: 'Seleccione el tipo de envase',
            }));
            return;
        }

        if (!Number.isFinite(cantidadEnvase) || !Number.isInteger(cantidadEnvase) || cantidadEnvase < 0) {
            setErrors((prev) => ({
                ...prev,
                cantidadEnvase: !Number.isFinite(cantidadEnvase)
                    ? 'Ingrese una cantidad valida'
                    : !Number.isInteger(cantidadEnvase)
                        ? 'Ingrese un numero entero'
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
                tipoEnvase,
                cantidadEnvase,
            });

            setSuccessMessage('Datos de recepcion actualizados correctamente.');
            handleCloseEditDialog();
            await cargarRecepciones();
        } catch (error) {
            setServerError(getApiErrorMessage(error, 'No se pudieron actualizar los datos de recepcion.'));
        } finally {
            setEditSaving(false);
        }
    };

    // Trae el detalle pendiente de una compra para construir las filas de recepcion.
    const cargarDetalleCompra = async (idCompras) => {
        try {
            setDetalleLoading(true);
            setServerError('');

            const data = await recepcionService.verDetalleCompra(idCompras);
            setDetalleCompra(data);

            const detallesForm = Array.isArray(data.detalles)
                ? data.detalles.map((detalle) => ({
                    idCompraDetalle: detalle.idCompraDetalle,
                    idArticulo: detalle.idArticulo,
                    idCategoria: detalle.idCategoria,
                    articulo: detalle.articulo || '',
                    descripcionCategoria: detalle.descripcionCategoria || '',
                    tipoEnvase: detalle.tipoEnvase || '',
                    medida: detalle.medida || '',
                    pesoComprado: detalle.pesoComprado ?? 0,
                    totalRecibido: detalle.totalRecibido ?? 0,
                    pesoPendiente: detalle.pesoPendiente ?? 0,
                    recibido: '',
                }))
                : [];
            const tiposEnvase = getTiposEnvase(detallesForm);

            setForm((prev) => ({
                ...prev,
                idCompras,
                tipoEnvase: tiposEnvase[0] || '',
                detalles: detallesForm,
            }));
        } catch (error) {

            setDetalleCompra(null);
            setForm((prev) => ({
                ...prev,
                tipoEnvase: '',
                detalles: [],
            }));

            setServerError(getApiErrorMessage(error, 'No se pudo cargar el detalle de la compra.'));
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

    // Valida que la recepcion no exceda el peso pendiente de la compra.
    const validate = () => {
        const newErrors = {};

        if (!form.idCompras) {
            newErrors.idCompras = 'Seleccione una compra disponible';
        }

        if (!form.detalles.length) {
            newErrors.detalles = 'La compra no tiene detalles disponibles';
        }

        if (!form.tipoEnvase.trim()) {
            newErrors.tipoEnvase = 'Seleccione el tipo de envase';
        }

        const cantidadEnvase = Number(form.cantidadEnvase || 0);
        if (!Number.isFinite(cantidadEnvase)) {
            newErrors.cantidadEnvase = 'Ingrese una cantidad valida';
        } else if (!Number.isInteger(cantidadEnvase)) {
            newErrors.cantidadEnvase = 'Ingrese un numero entero';
        } else if (cantidadEnvase < 0) {
            newErrors.cantidadEnvase = 'No puede ser negativo';
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

    // Convierte el formulario al contrato de registro esperado por /api/recepciones.
    const buildPayload = () => ({
        idCompras: Number(form.idCompras),
        guiaRemision: form.guiaRemision.trim() || null,
        tipoEnvase: form.tipoEnvase.trim(),
        cantidadEnvase: Number(form.cantidadEnvase || 0),
        detalles: form.detalles
            .filter((detalle) => Number(detalle.recibido || 0) > 0)
            .map((detalle) => ({
                idCompraDetalle: Number(detalle.idCompraDetalle),
                recibido: Number(detalle.recibido),
            })),
    });

    // Suma los pesos digitados para mostrar el impacto antes de guardar.
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

            setServerError(getApiErrorMessage(error, 'No se pudo registrar la recepcion.'));
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

    // Filtro local del listado para busquedas rapidas por compra, proveedor o guia.
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
                recepcion.tipoEnvase,
                recepcion.cantidadEnvase,
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
                        spacing={2}
                        sx={{
                            mb: 2.5,
                            alignItems: { xs: 'stretch', md: 'center' },
                            justifyContent: 'space-between',
                        }}
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
                                borderRadius: '8px',
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
                                    <TableCell sx={{ fontWeight: 700 }}>TIPO ENVASE</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>CANTIDAD</TableCell>
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
                                    <TableSkeletonRows columns={15} />
                                ) : null}

                                {showEmpty ? (
                                    <TableRow>
                                        <TableCell colSpan={15} align="center" sx={{ py: 4, color: '#64748b' }}>
                                            No hay recepciones registradas.
                                        </TableCell>
                                    </TableRow>
                                ) : null}

                                {showNoResults ? (
                                    <TableRow>
                                        <TableCell colSpan={15} align="center" sx={{ py: 4, color: '#64748b' }}>
                                            No se encontraron recepciones con ese criterio.
                                        </TableCell>
                                    </TableRow>
                                ) : null}

                                {showRows
                                    ? recepcionesPaginadas.map((recepcion) => (
                                        <TableRow key={recepcion.idRecepciones} hover>
                                            <TableCell>{formatRecepcionCode(recepcion.idRecepciones)}</TableCell>
                                            <TableCell>{formatDateWithCurrentTimePeru(recepcion.fechaRecepcion)}</TableCell>
                                            <TableCell>{formatCompraCode(recepcion.idCompras)}</TableCell>
                                            <TableCell>{recepcion.guiaRemision || '-'}</TableCell>
                                            <TableCell>{recepcion.tipoEnvase || '-'}</TableCell>
                                            <TableCell>{formatInteger(recepcion.cantidadEnvase)}</TableCell>
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
                                                <Tooltip title="Editar guia y envase">
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
                            select
                            fullWidth
                            label="TIPO DE ENVASE"
                            value={editForm.tipoEnvase}
                            onChange={handleEditChange('tipoEnvase')}
                            error={!!errors.tipoEnvase}
                            helperText={errors.tipoEnvase || 'Tomado del maestro de articulos'}
                        >
                            <MenuItem value="">
                                <em>Seleccione</em>
                            </MenuItem>
                            {editTiposEnvase.map((tipoEnvase) => (
                                <MenuItem key={tipoEnvase} value={tipoEnvase}>
                                    {tipoEnvase}
                                </MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            fullWidth
                            type="text"
                            label="CANTIDAD"
                            value={editForm.cantidadEnvase}
                            onChange={handleEditChange('cantidadEnvase')}
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
