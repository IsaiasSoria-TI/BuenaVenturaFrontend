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
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Chip,
    CircularProgress,
    MenuItem,
} from '@mui/material';
import { proveedorService } from '../../services/proveedorService';

const Icon = ({ name, size = 20, color = 'inherit' }) => (
    <span
        className="material-symbols-rounded"
        style={{
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
    </span>
);

const BANCOS = [
    { id: 1, nombre: 'BCP' },
    { id: 2, nombre: 'BBVA' },
    { id: 3, nombre: 'Interbank' },
    { id: 4, nombre: 'Scotiabank' },
    { id: 5, nombre: 'Banco de la Nación' },
    { id: 6, nombre: 'Otros' },
];

const initialForm = {
    idProveedor: null,
    ruc: '',
    razonSocial: '',
    telefono: '',
    correo: '',
    direccion: '',
    representante: '',
    idBanco: '',
    cuentaBancaria: '',
    cuentaInterbancaria: '',
};

export default function Proveedor() {
    const [proveedores, setProveedores] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [saving, setSaving] = React.useState(false);
    const [open, setOpen] = React.useState(false);
    const [editing, setEditing] = React.useState(false);
    const [form, setForm] = React.useState(initialForm);
    const [errors, setErrors] = React.useState({});
    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
    const [selectedDelete, setSelectedDelete] = React.useState(null);

    const cargarProveedores = React.useCallback(async () => {
        try {
            setLoading(true);
            const data = await proveedorService.listar();
            setProveedores(data);
        } catch (error) {
            console.error('Error al listar proveedores:', error);
            console.error('status:', error?.response?.status);
            console.error('data:', error?.response?.data);
        } finally {
            setLoading(false);
        }
    }, []);

    React.useEffect(() => {
        cargarProveedores();
    }, [cargarProveedores]);

    const handleOpenCreate = () => {
        setEditing(false);
        setForm(initialForm);
        setErrors({});
        setOpen(true);
    };

    const handleOpenEdit = (proveedor) => {
        setEditing(true);
        setErrors({});
        setForm({
            idProveedor: proveedor.idProveedor,
            ruc: proveedor.ruc || '',
            razonSocial: proveedor.razonSocial || '',
            telefono: proveedor.telefono || '',
            correo: proveedor.correo || '',
            direccion: proveedor.direccion || '',
            representante: proveedor.representante || '',
            idBanco: proveedor.idBanco ?? '',
            cuentaBancaria: proveedor.cuentaBancaria || '',
            cuentaInterbancaria: proveedor.cuentaInterbancaria || '',
        });
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
    };

    const validate = () => {
        const newErrors = {};

        if (!form.ruc.trim()) {
            newErrors.ruc = 'El RUC es obligatorio';
        } else if (!/^[0-9]{11}$/.test(form.ruc.trim())) {
            newErrors.ruc = 'El RUC debe tener 11 dígitos';
        }

        if (!form.razonSocial.trim()) {
            newErrors.razonSocial = 'La razón social es obligatoria';
        }

        if (!form.telefono.trim()) {
            newErrors.telefono = 'El teléfono es obligatorio';
        }

        if (form.telefono.trim() && !/^[0-9]{9}$/.test(form.telefono.trim())) {
            newErrors.telefono = 'El teléfono debe tener 9 dígitos';
        }

        if (!form.direccion.trim()) {
            newErrors.direccion = 'La dirección es obligatoria';
        }

        if (!form.representante.trim()) {
            newErrors.representante = 'El representante es obligatorio';
        }

        if (form.correo.trim()) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(form.correo.trim())) {
                newErrors.correo = 'El correo no es válido';
            }
        }

        if (!form.idBanco) {
            newErrors.idBanco = 'Seleccione un banco';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const buildPayload = () => ({
        idProveedor: form.idProveedor,
        ruc: form.ruc.trim(),
        razonSocial: form.razonSocial.trim(),
        telefono: form.telefono.trim(),
        correo: form.correo.trim() || null,
        direccion: form.direccion.trim(),
        representante: form.representante.trim(),
        idBanco: form.idBanco === '' ? null : Number(form.idBanco),
        cuentaBancaria: form.cuentaBancaria.trim() || null,
        cuentaInterbancaria: form.cuentaInterbancaria.trim() || null,
    });

    const handleSubmit = async () => {
        if (!validate()) return;

        try {
            setSaving(true);
            const payload = buildPayload();

            if (editing && form.idProveedor) {
                await proveedorService.actualizar(form.idProveedor, payload);
            } else {
                await proveedorService.crear(payload);
            }

            handleClose();
            await cargarProveedores();
        } catch (error) {
            console.error('Error al guardar proveedor:', error);
            console.error('status:', error?.response?.status);
            console.error('data:', error?.response?.data);
        } finally {
            setSaving(false);
        }
    };

    const handleOpenDeleteDialog = (proveedor) => {
        setSelectedDelete(proveedor);
        setDeleteDialogOpen(true);
    };

    const handleCloseDeleteDialog = () => {
        setSelectedDelete(null);
        setDeleteDialogOpen(false);
    };

    const handleConfirmDelete = async () => {
        if (!selectedDelete?.idProveedor) return;

        try {
            await proveedorService.eliminar(selectedDelete.idProveedor);
            handleCloseDeleteDialog();
            await cargarProveedores();
        } catch (error) {
            console.error('Error al eliminar proveedor:', error);
            console.error('status:', error?.response?.status);
            console.error('data:', error?.response?.data);
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
                                Proveedores
                            </Typography>
                            <Typography sx={{ fontSize: '0.86rem', color: '#64748b', mt: 0.5 }}>
                                Gestiona, edita y elimina proveedores.
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
                            Nuevo proveedor
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
                                    <TableCell sx={{ fontWeight: 700 }}>RUC</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>RAZÓN SOCIAL</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>DIRECCIÓN</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>TELÉFONO</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>CONTACTO</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>BANCO</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>CUENTA BANCARIA</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>CUENTA INTERBANCARIA</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>ESTADO</TableCell>
                                    <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>ACCIONES</TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={11} align="center" sx={{ py: 4 }}>
                                            <CircularProgress size={28} />
                                        </TableCell>
                                    </TableRow>
                                ) : proveedores.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={11} align="center" sx={{ py: 4, color: '#64748b' }}>
                                            No hay proveedores registrados.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    proveedores.map((proveedor) => (
                                        <TableRow key={proveedor.idProveedor} hover>
                                            <TableCell>{proveedor.idProveedor}</TableCell>
                                            <TableCell>{proveedor.ruc}</TableCell>
                                            <TableCell>{proveedor.razonSocial}</TableCell>
                                            <TableCell>{proveedor.direccion}</TableCell>
                                            <TableCell>{proveedor.telefono}</TableCell>
                                            <TableCell>{proveedor.representante}</TableCell>
                                            <TableCell>{proveedor.nombreBanco || '-'}</TableCell>
                                            <TableCell>{proveedor.cuentaBancaria || '-'}</TableCell>
                                            <TableCell>{proveedor.cuentaInterbancaria || '-'}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={proveedor.flgActivo ? 'Activo' : 'Inactivo'}
                                                    size="small"
                                                    sx={{
                                                        fontWeight: 700,
                                                        backgroundColor: proveedor.flgActivo ? '#dcfce7' : '#fee2e2',
                                                        color: proveedor.flgActivo ? '#16a34a' : '#dc2626',
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell align="center">
                                                <IconButton onClick={() => handleOpenEdit(proveedor)}>
                                                    <Icon name="edit" size={20} color="#1976d2" />
                                                </IconButton>
                                                <IconButton onClick={() => handleOpenDeleteDialog(proveedor)}>
                                                    <Icon name="delete" size={20} color="#ef4444" />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>

            <Dialog open={open} onClose={handleClose} fullWidth maxWidth="lg">
                <DialogTitle sx={{ fontWeight: 700 }}>
                    {editing ? 'Editar proveedor' : 'Nuevo proveedor'}
                </DialogTitle>

                <DialogContent dividers sx={{ pt: 2.5 }}>
                    <Stack spacing={2}>
                        <Box
                            sx={{
                                display: 'grid',
                                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr 1fr' },
                                gap: 2,
                            }}
                        >
                            <TextField
                                fullWidth
                                label="RUC"
                                value={form.ruc}
                                onChange={handleChange('ruc')}
                                error={!!errors.ruc}
                                helperText={errors.ruc}
                                inputProps={{ maxLength: 11 }}
                            />

                            <TextField
                                fullWidth
                                label="Razón social"
                                value={form.razonSocial}
                                onChange={handleChange('razonSocial')}
                                error={!!errors.razonSocial}
                                helperText={errors.razonSocial}
                            />

                            <TextField
                                fullWidth
                                label="Teléfono"
                                value={form.telefono}
                                onChange={handleChange('telefono')}
                                error={!!errors.telefono}
                                helperText={errors.telefono}
                            />

                            <TextField
                                fullWidth
                                label="Correo"
                                value={form.correo}
                                onChange={handleChange('correo')}
                                error={!!errors.correo}
                                helperText={errors.correo}
                            />
                        </Box>

                        <Box
                            sx={{
                                display: 'grid',
                                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr 1fr' },
                                gap: 2,
                            }}
                        >
                            <TextField
                                fullWidth
                                label="Dirección"
                                value={form.direccion}
                                onChange={handleChange('direccion')}
                                error={!!errors.direccion}
                                helperText={errors.direccion}
                            />

                            <TextField
                                fullWidth
                                label="Representante"
                                value={form.representante}
                                onChange={handleChange('representante')}
                                error={!!errors.representante}
                                helperText={errors.representante}
                            />

                            <TextField
                                select
                                fullWidth
                                label="Banco"
                                value={form.idBanco}
                                onChange={handleChange('idBanco')}
                                error={!!errors.idBanco}
                                helperText={errors.idBanco}
                                SelectProps={{
                                    MenuProps: {
                                        PaperProps: {
                                            sx: {
                                                maxHeight: 280,
                                            },
                                        },
                                    },
                                }}
                            >
                                <MenuItem value="">
                                    <em>Seleccione</em>
                                </MenuItem>
                                {BANCOS.map((banco) => (
                                    <MenuItem key={banco.id} value={banco.id}>
                                        {banco.nombre}
                                    </MenuItem>
                                ))}
                            </TextField>

                            <TextField
                                fullWidth
                                label="Cuenta bancaria"
                                value={form.cuentaBancaria}
                                onChange={handleChange('cuentaBancaria')}
                            />
                        </Box>

                        <Box
                            sx={{
                                display: 'grid',
                                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr 1fr' },
                                gap: 2,
                            }}
                        >
                            <TextField
                                fullWidth
                                label="Cuenta interbancaria"
                                value={form.cuentaInterbancaria}
                                onChange={handleChange('cuentaInterbancaria')}
                            />
                        </Box>
                    </Stack>
                </DialogContent>

                <DialogActions sx={{ px: 3, py: 2 }}>
                    <Button onClick={handleClose} disabled={saving} sx={{ textTransform: 'none' }}>
                        Cancelar
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleSubmit}
                        disabled={saving}
                        sx={{ textTransform: 'none', fontWeight: 700, boxShadow: 'none' }}
                    >
                        {saving ? 'Guardando...' : editing ? 'Actualizar' : 'Registrar'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
                <DialogTitle sx={{ fontWeight: 700 }}>Confirmar eliminación</DialogTitle>
                <DialogContent>
                    <Typography sx={{ color: '#475569' }}>
                        ¿Seguro que deseas eliminar este proveedor?
                    </Typography>
                    {selectedDelete && (
                        <Typography sx={{ mt: 1, fontWeight: 700, color: '#0f172a' }}>
                            {selectedDelete.razonSocial}
                        </Typography>
                    )}
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
                        Eliminar
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}