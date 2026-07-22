import React from 'react';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
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

import { configuracionService } from '../../../../services/configuracionService';
import ModalUsuarioSeguridad from './ModalUsuarioSeguridad';
import { useAutoClearMessage } from '../../../../utils/useAutoClearMessage';
import { getApiErrorMessage } from '../../../../utils/getApiErrorMessage';
import MaterialSymbol from '../../../../components/MaterialSymbol';
import TableSkeletonRows from '../../../../components/loading/TableSkeletonRows';

// Estado base para crear usuarios de seguridad desde configuracion.
const initialForm = {
    idUsuario: null,
    usuario: '',
    contrasena: '',
    nombres: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    telefono: '',
    dni: '',
    correo: '',
    flgActivo: 'true',
};

const Icon = MaterialSymbol;

function getEstadoChipStyles(flgActivo) {
    return flgActivo
        ? { backgroundColor: '#dcfce7', color: '#16a34a' }
        : { backgroundColor: '#fee2e2', color: '#dc2626' };
}

export default function SeguridadSection() {
    const [usuarios, setUsuarios] = React.useState([]);
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

    // Carga los usuarios que se administran desde la tabla de seguridad.
    const cargarUsuarios = React.useCallback(async () => {
        try {
            setLoading(true);
            setServerError('');
            const data = await configuracionService.listarUsuariosSeguridad();
            setUsuarios(Array.isArray(data) ? data : []);
            setPage(0);
        } catch {
            setServerError('Error al cargar usuarios');
        } finally {
            setLoading(false);
        }
    }, []);

    React.useEffect(() => {
        cargarUsuarios();
    }, [cargarUsuarios]);

    const handleOpenCreate = () => {
        setForm(initialForm);
        setEditing(false);
        setErrors({});
        setServerError('');
        setSuccess('');
        setOpen(true);
    };

    const handleOpenEdit = (usuario) => {
        setForm({
            idUsuario: usuario.idUsuario,
            usuario: usuario.usuario || '',
            contrasena: '',
            nombres: usuario.nombres || '',
            apellidoPaterno: usuario.apellidoPaterno || '',
            apellidoMaterno: usuario.apellidoMaterno || '',
            telefono: usuario.telefono || '',
            dni: usuario.dni || '',
            correo: usuario.correo || '',
            flgActivo: String(usuario.flgActivo !== false),
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
        // Valida campos obligatorios y formatos antes de crear o actualizar.
        const newErrors = {};

        if (!form.usuario.trim()) newErrors.usuario = 'Campo obligatorio';
        if (!editing && !form.contrasena.trim()) newErrors.contrasena = 'Campo obligatorio';
        if (!form.nombres.trim()) newErrors.nombres = 'Campo obligatorio';
        if (!form.apellidoPaterno.trim()) newErrors.apellidoPaterno = 'Campo obligatorio';
        if (form.telefono.trim() && !/^\d{1,9}$/.test(form.telefono.trim())) {
            newErrors.telefono = 'Ingrese hasta 9 digitos';
        }

        if (form.dni.trim() && !/^\d{8}$/.test(form.dni.trim())) {
            newErrors.dni = 'Ingrese 8 digitos';
        }

        if (form.correo.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo.trim())) {
            newErrors.correo = 'Correo invalido';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Transforma strings del formulario al formato que espera el backend.
    const buildPayload = () => ({
        usuario: form.usuario.trim(),
        contrasena: form.contrasena,
        nombres: form.nombres.trim(),
        apellidoPaterno: form.apellidoPaterno.trim(),
        apellidoMaterno: form.apellidoMaterno.trim(),
        telefono: form.telefono.trim(),
        dni: form.dni.trim(),
        correo: form.correo.trim(),
        flgActivo: form.flgActivo === 'true',
    });

    const handleSubmit = async () => {
        if (!validate()) return;

        try {
            setSaving(true);
            setServerError('');

            if (editing && form.idUsuario) {
                await configuracionService.actualizarUsuarioSeguridad(form.idUsuario, buildPayload());
                setSuccess('Usuario actualizado');
            } else {
                await configuracionService.crearUsuarioSeguridad(buildPayload());
                setSuccess('Usuario creado');
            }

            setOpen(false);
            await cargarUsuarios();
        } catch (error) {
            setServerError(getApiErrorMessage(error, 'Error al guardar usuario'));
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedDelete?.idUsuario) return;

        try {
            setServerError('');
            await configuracionService.inactivarUsuarioSeguridad(selectedDelete.idUsuario);
            setSuccess('Usuario inactivado');
            setDeleteDialog(false);
            setSelectedDelete(null);
            await cargarUsuarios();
        } catch (error) {
            setServerError(getApiErrorMessage(error, 'Error al inactivar usuario'));
        }
    };

    const usuariosPaginados = React.useMemo(() => {
        const start = page * rowsPerPage;
        return usuarios.slice(start, start + rowsPerPage);
    }, [usuarios, page, rowsPerPage]);

    return (
        <Box>
            <Card sx={{ borderRadius: 3 }}>
                <CardContent>
                    <Stack direction="row" sx={{ mb: 2, justifyContent: 'flex-end' }}>
                        <Button
                            variant="contained"
                            onClick={handleOpenCreate}
                            startIcon={<Icon name="add" size={18} color="#fff" />}
                            sx={{
                                textTransform: 'none',
                                fontWeight: 700,
                            }}
                        >
                            Nuevo usuario
                        </Button>
                    </Stack>

                    {serverError && <Alert severity="error" sx={{ mb: 2 }}>{serverError}</Alert>}
                    {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Usuario</TableCell>
                                    <TableCell>Nombre</TableCell>
                                    <TableCell>Contrasena</TableCell>
                                    <TableCell>Estado</TableCell>
                                    <TableCell align="center" sx={{ width: 112 }}>Acciones</TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {loading ? (
                                    <TableSkeletonRows columns={5} />
                                ) : usuarios.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} align="center">
                                            Sin registros
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    usuariosPaginados.map((usuario) => (
                                        <TableRow key={usuario.idUsuario}>
                                            <TableCell>{usuario.usuario}</TableCell>
                                            <TableCell>{usuario.nombre}</TableCell>
                                            <TableCell>{usuario.contrasena || '-'}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={usuario.flgActivo ? 'Activo' : 'Inactivo'}
                                                    size="small"
                                                    sx={getEstadoChipStyles(usuario.flgActivo)}
                                                />
                                            </TableCell>
                                            <TableCell align="center" sx={{ width: 112 }}>
                                                <IconButton
                                                    onClick={() => handleOpenEdit(usuario)}
                                                    sx={{ width: 36, height: 36 }}
                                                >
                                                    <Icon name="edit" size={20} color="#1976d2" />
                                                </IconButton>
                                                <IconButton
                                                    onClick={() => {
                                                        setSelectedDelete(usuario);
                                                        setDeleteDialog(true);
                                                    }}
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

                        {!loading && usuarios.length > 0 ? (
                            <TablePagination
                                component="div"
                                count={usuarios.length}
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

            <ModalUsuarioSeguridad
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
                <DialogTitle>Inactivar usuario</DialogTitle>
                <DialogContent>
                    Seguro que deseas inactivar este usuario?
                    {selectedDelete ? (
                        <Typography sx={{ mt: 1, fontWeight: 700 }}>
                            {selectedDelete.usuario}
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
