import * as React from 'react';
import PropTypes from 'prop-types';

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
import { useAutoClearMessage } from '../../../../utils/useAutoClearMessage';

/* ICON COMPONENT */
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

Icon.propTypes = {
    name: PropTypes.string.isRequired,
    size: PropTypes.number,
    color: PropTypes.string,
};

// Estado inicial usado por el formulario de cuenta contable.
const initialForm = {
    idCuentaContable: null,
    codigo: '',
    descripcion: '',
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

    useAutoClearMessage(successMessage, setSuccessMessage);

    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
    const [selectedDelete, setSelectedDelete] = React.useState(null);

    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(5);

    // Carga el catalogo de cuentas contables que se muestra en la tabla.
    const cargarCuentas = React.useCallback(async () => {
        try {
            setLoading(true);
            setServerError('');
            const data = await cuentaContableService.listar();
            setCuentas(Array.isArray(data) ? data : []);
            setPage(0);
        } catch {
            setServerError('No se pudo listar las cuentas contables.');
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
        setOpen(true);
    };

    const handleOpenEdit = (cuenta) => {
        setEditing(true);
        setForm({
            idCuentaContable: cuenta.idCuentaContable,
            codigo: cuenta.codigo || '',
            descripcion: cuenta.descripcion || '',
            estado: cuenta.estado || 'Activo',
        });
        setErrors({});
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
    };

    const validate = () => {
        const newErrors = {};

        if (!form.codigo.trim()) {
            newErrors.codigo = 'Código requerido';
        }

        if (!form.descripcion.trim()) {
            newErrors.descripcion = 'Descripción requerida';
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
                codigo: form.codigo.trim(),
                descripcion: form.descripcion.trim(),
                estado: form.estado,
            };

            if (editing && form.idCuentaContable) {
                await cuentaContableService.actualizar(
                    form.idCuentaContable,
                    payload
                );
                setSuccessMessage('Actualizado correctamente');
            } else {
                await cuentaContableService.crear(payload);
                setSuccessMessage('Registrado correctamente');
            }

            handleClose();
            await cargarCuentas();
        } catch {
            setServerError('Error al guardar');
        } finally {
            setSaving(false);
        }
    };

    const handleOpenDeleteDialog = (cuenta) => {
        setSelectedDelete(cuenta);
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!selectedDelete) return;

        try {
            await cuentaContableService.eliminar(
                selectedDelete.idCuentaContable
            );
            setSuccessMessage('Inactivado correctamente');
            setDeleteDialogOpen(false);
            await cargarCuentas();
        } catch {
            setServerError('Error al eliminar');
        }
    };

    const cuentasPaginadas = React.useMemo(() => {
        const start = page * rowsPerPage;
        return cuentas.slice(start, start + rowsPerPage);
    }, [cuentas, page, rowsPerPage]);

    const renderTableRows = () => {
        if (loading) {
            return (
                <TableRow>
                    <TableCell colSpan={4} align="center">
                        <CircularProgress />
                    </TableCell>
                </TableRow>
            );
        }

        return cuentasPaginadas.map((cuenta) => (
            <TableRow key={cuenta.idCuentaContable}>
                <TableCell>{cuenta.codigo}</TableCell>
                <TableCell>{cuenta.descripcion}</TableCell>
                <TableCell>
                    <Chip
                        label={cuenta.estado}
                        size="small"
                        sx={getEstadoChipStyles(cuenta.estado)}
                    />
                </TableCell>
                <TableCell align="center" sx={{ width: 112 }}>
                    <IconButton onClick={() => handleOpenEdit(cuenta)} sx={{ width: 36, height: 36 }}>
                        <Icon name="edit" size={20} color="#1976d2" />
                    </IconButton>
                    <IconButton
                        onClick={() => handleOpenDeleteDialog(cuenta)}
                        sx={{ width: 36, height: 36 }}
                    >
                        <Icon name="delete" size={20} color="#ef4444" />
                    </IconButton>
                </TableCell>
            </TableRow>
        ));
    };

    return (
        <Box>
            <Card sx={{ borderRadius: 3 }}>
                <CardContent>
                    <Stack direction="row" justifyContent="flex-end" sx={{ mb: 2 }}>
                        <Button
                            variant="contained"
                            onClick={handleOpenCreate}
                            startIcon={<Icon name="add" size={18} color="#fff" />}
                            sx={{
                                textTransform: 'none',
                                fontWeight: 700,
                                borderRadius: '8px',
                                boxShadow: 'none',
                            }}
                        >
                            Nueva cuenta
                        </Button>
                    </Stack>

                    {successMessage && <Alert severity="success">{successMessage}</Alert>}
                    {serverError && <Alert severity="error">{serverError}</Alert>}

                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Código</TableCell>
                                    <TableCell>Descripción</TableCell>
                                    <TableCell>Estado</TableCell>
                                    <TableCell align="center" sx={{ width: 112 }}>Acciones</TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>{renderTableRows()}</TableBody>
                        </Table>

                        <TablePagination
                            component="div"
                            count={cuentas.length}
                            page={page}
                            onPageChange={(_event, newPage) => setPage(newPage)}
                            rowsPerPage={rowsPerPage}
                            onRowsPerPageChange={(e) => {
                                setRowsPerPage(parseInt(e.target.value, 10));
                                setPage(0);
                            }}
                            rowsPerPageOptions={[5, 10, 20]}
                        />
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

            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>Confirmar</DialogTitle>
                <DialogContent>
                    ¿Deseas inactivar esta cuenta?
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
                    <Button color="error" onClick={handleConfirmDelete}>
                        Inactivar
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
