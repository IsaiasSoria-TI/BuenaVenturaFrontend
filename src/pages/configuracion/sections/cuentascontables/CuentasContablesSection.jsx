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

import { cuentaContableService } from '../../../../services/cuentaContableService';
import ModalCuentaContable from './ModalCuentaContable';

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
    idCuentaContable: null,
    codigo: '',
    estado: 'Activo',
};

function getEstadoChipStyles(estado) {
    if (estado === 'Activo') {
        return {
            backgroundColor: '#dcfce7',
            color: '#16a34a',
        };
    }

    return {
        backgroundColor: '#fee2e2',
        color: '#dc2626',
    };
}

export default function CuentasContablesSection() {
    const [cuentas, setCuentas] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [saving, setSaving] = React.useState(false);

    const [open, setOpen] = React.useState(false);
    const [editing, setEditing] = React.useState(false);

    const [form, setForm] = React.useState(initialForm);
    const [errors, setErrors] = React.useState({});
    const [serverError, setServerError] = React.useState('');
    const [successMessage, setSuccessMessage] = React.useState('');

    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
    const [selectedDelete, setSelectedDelete] = React.useState(null);

    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(5);

    const cargarCuentas = React.useCallback(async () => {
        try {
            setLoading(true);
            setServerError('');

            const data = await cuentaContableService.listar();
            setCuentas(Array.isArray(data) ? data : []);
            setPage(0);
        } catch (error) {
            console.error('Error al listar cuentas contables:', error);

            const message =
                error?.response?.data?.message ||
                error?.response?.data ||
                'No se pudo listar las cuentas contables.';

            setServerError(
                typeof message === 'string'
                    ? message
                    : 'No se pudo listar las cuentas contables.'
            );
        } finally {
            setLoading(false);
        }
    }, []);

    React.useEffect(() => {
        cargarCuentas();
    }, [cargarCuentas]);

    const handleOpenCreate = () => {
        setEditing(false);
        setForm(initialForm);
        setErrors({});
        setServerError('');
        setSuccessMessage('');
        setOpen(true);
    };

    const handleOpenEdit = (cuenta) => {
        setEditing(true);
        setForm({
            idCuentaContable: cuenta.idCuentaContable,
            codigo: cuenta.codigo || '',
            estado: cuenta.estado || 'Activo',
        });
        setErrors({});
        setServerError('');
        setSuccessMessage('');
        setOpen(true);
    };

    const handleClose = () => {
        if (saving) return;

        setOpen(false);
        setForm(initialForm);
        setErrors({});
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

        if (successMessage) {
            setSuccessMessage('');
        }
    };

    const validate = () => {
        const newErrors = {};

        if (!form.codigo.trim()) {
            newErrors.codigo = 'El código es obligatorio';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;

        try {
            setSaving(true);
            setServerError('');
            setSuccessMessage('');

            const payload = {
                codigo: form.codigo.trim(),
                estado: form.estado,
            };

            if (editing && form.idCuentaContable) {
                await cuentaContableService.actualizar(form.idCuentaContable, payload);
                setSuccessMessage('Cuenta contable actualizada correctamente.');
            } else {
                await cuentaContableService.crear(payload);
                setSuccessMessage('Cuenta contable registrada correctamente.');
            }

            handleClose();
            await cargarCuentas();
        } catch (error) {
            console.error('Error al guardar cuenta contable:', error);

            const message =
                error?.response?.data?.message ||
                error?.response?.data ||
                'No se pudo guardar la cuenta contable.';

            setServerError(
                typeof message === 'string'
                    ? message
                    : 'No se pudo guardar la cuenta contable.'
            );
        } finally {
            setSaving(false);
        }
    };

    const handleOpenDeleteDialog = (cuenta) => {
        setSelectedDelete(cuenta);
        setDeleteDialogOpen(true);
    };

    const handleCloseDeleteDialog = () => {
        setSelectedDelete(null);
        setDeleteDialogOpen(false);
    };

    const handleConfirmDelete = async () => {
        if (!selectedDelete?.idCuentaContable) return;

        try {
            await cuentaContableService.eliminar(selectedDelete.idCuentaContable);
            setSuccessMessage('Cuenta contable inactivada correctamente.');
            handleCloseDeleteDialog();
            await cargarCuentas();
        } catch (error) {
            console.error('Error al eliminar cuenta contable:', error);

            const message =
                error?.response?.data?.message ||
                error?.response?.data ||
                'No se pudo eliminar la cuenta contable.';

            setServerError(
                typeof message === 'string'
                    ? message
                    : 'No se pudo eliminar la cuenta contable.'
            );
        }
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const cuentasPaginadas = React.useMemo(() => {
        const inicio = page * rowsPerPage;
        const fin = inicio + rowsPerPage;
        return cuentas.slice(inicio, fin);
    }, [cuentas, page, rowsPerPage]);

    return (
        <Box>
            <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e2e8f0' }}>
                <CardContent>
                    <Stack
                        direction={{ xs: 'column', md: 'row' }}
                        justifyContent="space-between"
                        alignItems={{ xs: 'stretch', md: 'center' }}
                        spacing={2}
                        sx={{ mb: 2.5 }}
                    >
                        <Box>
                            <Typography sx={{ fontWeight: 700, color: '#0f172a', mb: 0.5 }}>
                                Cuentas contables
                            </Typography>
                            <Typography sx={{ color: '#64748b', fontSize: '0.9rem' }}>
                                Administra los códigos contables que luego serán asignados a las categorías.
                            </Typography>
                        </Box>

                        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
                            <Button
                                variant="outlined"
                                onClick={cargarCuentas}
                                startIcon={<Icon name="refresh" size={18} />}
                                sx={{
                                    textTransform: 'none',
                                    fontWeight: 700,
                                    borderRadius: 2,
                                }}
                            >
                                Actualizar
                            </Button>

                            <Button
                                variant="contained"
                                onClick={handleOpenCreate}
                                startIcon={<Icon name="add" size={18} color="#fff" />}
                                sx={{
                                    textTransform: 'none',
                                    fontWeight: 700,
                                    borderRadius: 2,
                                    boxShadow: 'none',
                                }}
                            >
                                Nueva cuenta contable
                            </Button>
                        </Stack>
                    </Stack>

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
                                    <TableCell sx={{ fontWeight: 700 }}>ESTADO</TableCell>
                                    <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>
                                        ACCIONES
                                    </TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                                            <CircularProgress size={28} />
                                        </TableCell>
                                    </TableRow>
                                ) : cuentas.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={3} align="center" sx={{ py: 4, color: '#64748b' }}>
                                            No hay cuentas contables registradas.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    cuentasPaginadas.map((cuenta) => (
                                        <TableRow key={cuenta.idCuentaContable} hover>
                                            <TableCell>{cuenta.codigo}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={cuenta.estado || '-'}
                                                    size="small"
                                                    sx={{
                                                        fontWeight: 700,
                                                        ...getEstadoChipStyles(cuenta.estado),
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell align="center">
                                                <IconButton onClick={() => handleOpenEdit(cuenta)}>
                                                    <Icon name="edit" size={20} color="#1976d2" />
                                                </IconButton>

                                                <IconButton onClick={() => handleOpenDeleteDialog(cuenta)}>
                                                    <Icon name="delete" size={20} color="#ef4444" />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>

                        {!loading && cuentas.length > 0 ? (
                            <TablePagination
                                component="div"
                                count={cuentas.length}
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

            <ModalCuentaContable
                open={open}
                onClose={handleClose}
                editing={editing}
                form={form}
                errors={errors}
                saving={saving}
                handleChange={handleChange}
                handleSubmit={handleSubmit}
            />

            <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
                <DialogTitle sx={{ fontWeight: 700 }}>Confirmar eliminación</DialogTitle>
                <DialogContent>
                    <Typography sx={{ color: '#475569' }}>
                        ¿Seguro que deseas inactivar esta cuenta contable?
                    </Typography>

                    {selectedDelete ? (
                        <Typography sx={{ mt: 1, fontWeight: 700, color: '#0f172a' }}>
                            Código: {selectedDelete.codigo}
                        </Typography>
                    ) : null}
                </DialogContent>

                <DialogActions sx={{ px: 3, py: 2 }}>
                    <Button onClick={handleCloseDeleteDialog} sx={{ textTransform: 'none' }}>
                        Cancelar
                    </Button>

                    <Button
                        variant="contained"
                        color="error"
                        onClick={handleConfirmDelete}
                        sx={{ textTransform: 'none', fontWeight: 700, boxShadow: 'none' }}
                    >
                        Inactivar
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}