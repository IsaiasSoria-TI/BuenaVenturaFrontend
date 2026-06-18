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

import { tipoProveedorService } from '../../../../services/tipoProveedorService';
import ModalTipoProveedor from './ModalTipoProveedor';

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

// Estado base del formulario de tipos de proveedor.
const initialForm = {
    idTipoProveedor: null,
    nombre: '',
    flgActivo: 'true',
};

function getEstadoChipStyles(flgActivo) {
    if (flgActivo) {
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

export default function TiposProveedorSection() {
    const [tiposProveedor, setTiposProveedor] = React.useState([]);
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

    // Carga todos los tipos para listar, editar o inactivar registros existentes.
    const cargarTiposProveedor = React.useCallback(async () => {
        try {
            setLoading(true);
            setServerError('');
            const data = await tipoProveedorService.listarTodos();
            setTiposProveedor(Array.isArray(data) ? data : []);
            setPage(0);
        } catch {
            setServerError('No se pudo listar los tipos de proveedor.');
        } finally {
            setLoading(false);
        }
    }, []);

    React.useEffect(() => {
        cargarTiposProveedor();
    }, [cargarTiposProveedor]);

    const handleOpenCreate = () => {
        setEditing(false);
        setForm(initialForm);
        setErrors({});
        setOpen(true);
    };

    const handleOpenEdit = (tipoProveedor) => {
        setEditing(true);
        setForm({
            idTipoProveedor: tipoProveedor.idTipoProveedor,
            nombre: tipoProveedor.nombre || '',
            flgActivo: String(Boolean(tipoProveedor.flgActivo)),
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

        if (!form.nombre.trim()) {
            newErrors.nombre = 'Nombre requerido';
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
                nombre: form.nombre.trim(),
                flgActivo: form.flgActivo === 'true',
            };

            if (editing && form.idTipoProveedor) {
                await tipoProveedorService.actualizar(form.idTipoProveedor, payload);
                setSuccessMessage('Actualizado correctamente');
            } else {
                await tipoProveedorService.crear(payload);
                setSuccessMessage('Registrado correctamente');
            }

            handleClose();
            await cargarTiposProveedor();
        } catch {
            setServerError('Error al guardar');
        } finally {
            setSaving(false);
        }
    };

    const handleOpenDeleteDialog = (tipoProveedor) => {
        setSelectedDelete(tipoProveedor);
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!selectedDelete) return;

        try {
            await tipoProveedorService.eliminar(selectedDelete.idTipoProveedor);
            setSuccessMessage('Inactivado correctamente');
            setDeleteDialogOpen(false);
            await cargarTiposProveedor();
        } catch {
            setServerError('Error al eliminar');
        }
    };

    const tiposProveedorPaginados = React.useMemo(() => {
        const start = page * rowsPerPage;
        return tiposProveedor.slice(start, start + rowsPerPage);
    }, [tiposProveedor, page, rowsPerPage]);

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
                        <Typography fontWeight={700}>
                            Tipos de proveedor
                        </Typography>

                        <Button
                            variant="contained"
                            onClick={handleOpenCreate}
                            startIcon={<Icon name="add" size={18} color="#fff" />}
                            sx={{
                                alignSelf: { xs: 'flex-start', sm: 'auto' },
                                textTransform: 'none',
                                fontWeight: 700,
                                borderRadius: 2,
                                boxShadow: 'none',
                            }}
                        >
                            Nuevo tipo
                        </Button>
                    </Stack>

                    {successMessage && <Alert severity="success">{successMessage}</Alert>}
                    {serverError && <Alert severity="error">{serverError}</Alert>}

                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Nombre</TableCell>
                                    <TableCell>Estado</TableCell>
                                    <TableCell align="center" sx={{ width: 112 }}>Acciones</TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={3} align="center">
                                            <CircularProgress />
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    tiposProveedorPaginados.map((tipoProveedor) => (
                                        <TableRow key={tipoProveedor.idTipoProveedor}>
                                            <TableCell>{tipoProveedor.nombre}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={tipoProveedor.flgActivo ? 'Activo' : 'Inactivo'}
                                                    size="small"
                                                    sx={getEstadoChipStyles(tipoProveedor.flgActivo)}
                                                />
                                            </TableCell>
                                            <TableCell align="center" sx={{ width: 112 }}>
                                                <IconButton onClick={() => handleOpenEdit(tipoProveedor)} sx={{ width: 36, height: 36 }}>
                                                    <Icon name="edit" size={20} color="#1976d2" />
                                                </IconButton>
                                                <IconButton
                                                    onClick={() => handleOpenDeleteDialog(tipoProveedor)}
                                                    sx={{ width: 36, height: 36 }}
                                                >
                                                    <Icon name="delete" size={20} color="#ef4444" />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>

                        <TablePagination
                            component="div"
                            count={tiposProveedor.length}
                            page={page}
                            onPageChange={(e, p) => setPage(p)}
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

            <ModalTipoProveedor
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
                    Deseas inactivar este tipo de proveedor?
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
