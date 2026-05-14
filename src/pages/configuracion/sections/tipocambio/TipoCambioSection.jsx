import React from 'react';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    Typography,
} from '@mui/material';

import { tipoCambioService } from '../../../../services/tipoCambioService';
import ModalTipoCambio from './ModalTipoCambio';

const initialForm = {
    idTipoCambio: null,
    fecha: '',
    valor: '',
    flgActivo: 'true',
};

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
            }}
        >
            {name}
        </Box>
    );
}

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

function parseValorDecimal(value) {
    const normalizado = String(value).trim().replace(',', '.');

    if (!/^\d+(\.\d{1,4})?$/.test(normalizado)) {
        return null;
    }

    const numero = Number(normalizado);
    return Number.isFinite(numero) && numero > 0 ? numero : null;
}

export default function TipoCambioSection() {
    const [tiposCambio, setTiposCambio] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [saving, setSaving] = React.useState(false);
    const [form, setForm] = React.useState(initialForm);
    const [errors, setErrors] = React.useState({});
    const [editing, setEditing] = React.useState(false);
    const [open, setOpen] = React.useState(false);
    const [deleteDialog, setDeleteDialog] = React.useState(false);
    const [selectedDelete, setSelectedDelete] = React.useState(null);
    const [serverError, setServerError] = React.useState('');
    const [success, setSuccess] = React.useState('');
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(5);

    const cargarTiposCambio = React.useCallback(async () => {
        try {
            setLoading(true);
            setServerError('');
            const data = await tipoCambioService.listarTodos();
            setTiposCambio(Array.isArray(data) ? data : []);
            setPage(0);
        } catch (error) {
            console.error(error);
            setServerError('Error al cargar tipos de cambio');
        } finally {
            setLoading(false);
        }
    }, []);

    React.useEffect(() => {
        cargarTiposCambio();
    }, [cargarTiposCambio]);

    const handleOpenCreate = () => {
        setForm(initialForm);
        setEditing(false);
        setErrors({});
        setServerError('');
        setSuccess('');
        setOpen(true);
    };

    const handleOpenEdit = (tipoCambio) => {
        setForm({
            idTipoCambio: tipoCambio.idTipoCambio,
            fecha: tipoCambio.fecha || '',
            valor: tipoCambio.valor ?? '',
            flgActivo: String(Boolean(tipoCambio.flgActivo)),
        });
        setEditing(true);
        setErrors({});
        setServerError('');
        setSuccess('');
        setOpen(true);
    };

    const handleChange = (field) => (event) => {
        setForm((prev) => ({
            ...prev,
            [field]: event.target.value,
        }));

        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: '' }));
        }
    };

    const validate = () => {
        const newErrors = {};

        if (!form.fecha) {
            newErrors.fecha = 'Campo obligatorio';
        }

        if (form.valor === '' || parseValorDecimal(form.valor) === null) {
            newErrors.valor = 'Ingrese un valor valido con hasta 4 decimales';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;

        try {
            setSaving(true);
            setServerError('');

            const payload = {
                fecha: form.fecha,
                valor: parseValorDecimal(form.valor),
                flgActivo: form.flgActivo === 'true',
            };

            if (editing && form.idTipoCambio) {
                await tipoCambioService.actualizar(form.idTipoCambio, payload);
                setSuccess('Tipo de cambio actualizado');
            } else {
                await tipoCambioService.crear(payload);
                setSuccess('Tipo de cambio creado');
            }

            setOpen(false);
            await cargarTiposCambio();
        } catch (error) {
            console.error(error);
            const message = error?.response?.data?.message || error?.response?.data || 'Error al guardar tipo de cambio';
            setServerError(typeof message === 'string' ? message : 'Error al guardar tipo de cambio');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedDelete?.idTipoCambio) return;

        try {
            setServerError('');
            await tipoCambioService.eliminar(selectedDelete.idTipoCambio);
            setSuccess('Tipo de cambio inactivado');
            setDeleteDialog(false);
            setSelectedDelete(null);
            await cargarTiposCambio();
        } catch (error) {
            console.error(error);
            setServerError('Error al inactivar tipo de cambio');
        }
    };

    const tiposCambioPaginados = React.useMemo(() => {
        const start = page * rowsPerPage;
        return tiposCambio.slice(start, start + rowsPerPage);
    }, [tiposCambio, page, rowsPerPage]);

    return (
        <Box>
            <Card sx={{ borderRadius: 3 }}>
                <CardContent>
                    <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        justifyContent="space-between"
                        alignItems={{ xs: 'stretch', sm: 'center' }}
                        spacing={1.5}
                        sx={{ mb: 2 }}
                    >
                        <Typography fontWeight={700}>TIPO DE CAMBIO</Typography>
                        <Button
                            variant="contained"
                            onClick={handleOpenCreate}
                            startIcon={<Icon name="add" size={18} color="#fff" />}
                            sx={{ alignSelf: { xs: 'flex-start', sm: 'auto' } }}
                        >
                            Agregar
                        </Button>
                    </Stack>

                    {serverError ? <Alert severity="error" sx={{ mb: 2 }}>{serverError}</Alert> : null}
                    {success ? <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert> : null}

                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Fecha</TableCell>
                                    <TableCell align="right">Valor</TableCell>
                                    <TableCell>Estado</TableCell>
                                    <TableCell align="center">Acciones</TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={4} align="center">
                                            <CircularProgress />
                                        </TableCell>
                                    </TableRow>
                                ) : tiposCambio.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} align="center">
                                            Sin registros
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    tiposCambioPaginados.map((tipoCambio) => (
                                        <TableRow key={tipoCambio.idTipoCambio}>
                                            <TableCell>{formatDate(tipoCambio.fecha)}</TableCell>
                                            <TableCell align="right">{formatDecimal(tipoCambio.valor)}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={tipoCambio.flgActivo ? 'Activo' : 'Inactivo'}
                                                    size="small"
                                                    sx={getEstadoChipStyles(tipoCambio.flgActivo)}
                                                />
                                            </TableCell>
                                            <TableCell align="center">
                                                <IconButton onClick={() => handleOpenEdit(tipoCambio)}>
                                                    <Icon name="edit" size={20} color="#1976d2" />
                                                </IconButton>
                                                <IconButton onClick={() => {
                                                    setSelectedDelete(tipoCambio);
                                                    setDeleteDialog(true);
                                                }}>
                                                    <Icon name="delete" size={20} color="#ef4444" />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>

                        {!loading && tiposCambio.length > 0 ? (
                            <TablePagination
                                component="div"
                                count={tiposCambio.length}
                                page={page}
                                onPageChange={(_, newPage) => setPage(newPage)}
                                rowsPerPage={rowsPerPage}
                                onRowsPerPageChange={(event) => {
                                    setRowsPerPage(Number.parseInt(event.target.value, 10));
                                    setPage(0);
                                }}
                                rowsPerPageOptions={[5, 10, 20]}
                            />
                        ) : null}
                    </TableContainer>
                </CardContent>
            </Card>

            <ModalTipoCambio
                open={open}
                onClose={() => setOpen(false)}
                editing={editing}
                form={form}
                errors={errors}
                saving={saving}
                handleChange={handleChange}
                handleSubmit={handleSubmit}
            />

            <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
                <DialogTitle>Inactivar tipo de cambio</DialogTitle>
                <DialogContent>
                    Seguro que deseas inactivar este tipo de cambio?
                    {selectedDelete ? (
                        <Typography sx={{ mt: 1, fontWeight: 700 }}>
                            {formatDate(selectedDelete.fecha)} - {formatDecimal(selectedDelete.valor)}
                        </Typography>
                    ) : null}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialog(false)}>Cancelar</Button>
                    <Button color="error" onClick={handleDelete}>
                        Inactivar
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
