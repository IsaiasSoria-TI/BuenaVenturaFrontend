import React from 'react';
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

import { bancoService } from '../../../../services/bancoService';
import ModalBanco from './ModalBanco';
import { useAutoClearMessage } from '../../../../utils/useAutoClearMessage';

// Estado inicial para crear o editar bancos del catalogo.
const initialForm = {
    idBanco: null,
    nombre: '',
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

Icon.propTypes = {
    name: PropTypes.string.isRequired,
    size: PropTypes.number,
    color: PropTypes.string,
};

function getEstadoChipStyles(flgActivo) {
    return flgActivo
        ? { backgroundColor: '#dcfce7', color: '#16a34a' }
        : { backgroundColor: '#fee2e2', color: '#dc2626' };
}

export default function BancosSection() {
    const [bancos, setBancos] = React.useState([]);
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
    useAutoClearMessage(success, setSuccess);
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(5);

    // Trae bancos activos e inactivos para poder administrarlos desde configuracion.
    const cargarBancos = React.useCallback(async () => {
        try {
            setLoading(true);
            setServerError('');
            const data = await bancoService.listarTodos();
            setBancos(Array.isArray(data) ? data : []);
            setPage(0);
        } catch {
            setServerError('Error al cargar bancos');
        } finally {
            setLoading(false);
        }
    }, []);

    React.useEffect(() => {
        cargarBancos();
    }, [cargarBancos]);

    const handleOpenCreate = () => {
        setForm(initialForm);
        setEditing(false);
        setErrors({});
        setServerError('');
        setSuccess('');
        setOpen(true);
    };

    const handleOpenEdit = (banco) => {
        setForm({
            idBanco: banco.idBanco,
            nombre: banco.nombre || '',
            flgActivo: String(Boolean(banco.flgActivo)),
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

    const handleSubmit = async () => {
        // Validacion minima antes de enviar el payload al backend.
        if (!form.nombre.trim()) {
            setErrors({ nombre: 'Campo obligatorio' });
            return;
        }

        try {
            setSaving(true);
            setServerError('');

            const payload = {
                nombre: form.nombre.trim(),
                flgActivo: form.flgActivo === 'true',
            };

            if (editing && form.idBanco) {
                await bancoService.actualizar(form.idBanco, payload);
                setSuccess('Banco actualizado');
            } else {
                await bancoService.crear(payload);
                setSuccess('Banco creado');
            }

            setOpen(false);
            await cargarBancos();
        } catch (error) {
            const message = error?.response?.data?.message || error?.response?.data || 'Error al guardar banco';
            setServerError(typeof message === 'string' ? message : 'Error al guardar banco');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedDelete?.idBanco) return;

        try {
            setServerError('');
            await bancoService.eliminar(selectedDelete.idBanco);
            setSuccess('Banco inactivado');
            setDeleteDialog(false);
            setSelectedDelete(null);
            await cargarBancos();
        } catch {
            setServerError('Error al eliminar');
        }
    };

    const bancosPaginados = React.useMemo(() => {
        const start = page * rowsPerPage;
        return bancos.slice(start, start + rowsPerPage);
    }, [bancos, page, rowsPerPage]);

    const renderTableRows = () => {
        if (loading) {
            return (
                <TableRow>
                    <TableCell colSpan={3} align="center">
                        <CircularProgress />
                    </TableCell>
                </TableRow>
            );
        }

        if (bancos.length === 0) {
            return (
                <TableRow>
                    <TableCell colSpan={3} align="center">
                        Sin registros
                    </TableCell>
                </TableRow>
            );
        }

        return bancosPaginados.map((banco) => (
            <TableRow key={banco.idBanco}>
                <TableCell>{banco.nombre}</TableCell>
                <TableCell>
                    <Chip
                        label={banco.flgActivo ? 'Activo' : 'Inactivo'}
                        size="small"
                        sx={getEstadoChipStyles(banco.flgActivo)}
                    />
                </TableCell>
                <TableCell align="center" sx={{ width: 112 }}>
                    <IconButton onClick={() => handleOpenEdit(banco)} sx={{ width: 36, height: 36 }}>
                        <Icon name="edit" size={20} color="#1976d2" />
                    </IconButton>
                    <IconButton
                        onClick={() => {
                            setSelectedDelete(banco);
                            setDeleteDialog(true);
                        }}
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
                            }}
                        >
                            Nuevo banco
                        </Button>
                    </Stack>

                    {serverError && <Alert severity="error" sx={{ mb: 2 }}>{serverError}</Alert>}
                    {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

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
                                {renderTableRows()}
                            </TableBody>
                        </Table>

                        {!loading && bancos.length > 0 && (
                            <TablePagination
                                component="div"
                                count={bancos.length}
                                page={page}
                                onPageChange={(_, newPage) => setPage(newPage)}
                                rowsPerPage={rowsPerPage}
                                onRowsPerPageChange={(event) => {
                                    setRowsPerPage(Number.parseInt(event.target.value, 10));
                                    setPage(0);
                                }}
                                rowsPerPageOptions={[5, 10, 20]}
                            />
                        )}
                    </TableContainer>
                </CardContent>
            </Card>

            <ModalBanco
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
                <DialogTitle>Inactivar banco</DialogTitle>
                <DialogContent>
                    ¿Seguro que deseas inactivar este banco?
                    {selectedDelete && (
                        <Typography sx={{ mt: 1, fontWeight: 700 }}>
                            {selectedDelete.nombre}
                        </Typography>
                    )}
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
