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
    Grid,
    Chip,
    CircularProgress,
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

    const cargarProveedores = React.useCallback(async () => {
        try {
            setLoading(true);
            const data = await proveedorService.listar();
            setProveedores(data);
        } catch (error) {
            console.error('Error al listar proveedores:', error);
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
            idBanco: '',
            cuentaBancaria: '',
            cuentaInterbancaria: '',
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

        if (!form.ruc.trim()) newErrors.ruc = 'El RUC es obligatorio';
        if (!form.razonSocial.trim()) newErrors.razonSocial = 'La razón social es obligatoria';
        if (!form.telefono.trim()) newErrors.telefono = 'El teléfono es obligatorio';
        if (!/^[0-9]{9}$/.test(form.telefono.trim())) {
            newErrors.telefono = 'El teléfono debe tener 9 dígitos';
        }
        if (!form.direccion.trim()) newErrors.direccion = 'La dirección es obligatoria';
        if (!form.representante.trim()) newErrors.representante = 'El representante es obligatorio';

        if (form.correo.trim()) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(form.correo.trim())) {
                newErrors.correo = 'El correo no es válido';
            }
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
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (idProveedor) => {
        const confirmado = window.confirm('¿Seguro que deseas eliminar este proveedor?');
        if (!confirmado) return;

        try {
            await proveedorService.eliminar(idProveedor);
            await cargarProveedores();
        } catch (error) {
            console.error('Error al eliminar proveedor:', error);
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
                                    <TableCell sx={{ fontWeight: 700 }}>ESTADO</TableCell>
                                    <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>ACCIONES</TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                                            <CircularProgress size={28} />
                                        </TableCell>
                                    </TableRow>
                                ) : proveedores.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} align="center" sx={{ py: 4, color: '#64748b' }}>
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
                                                <IconButton onClick={() => handleDelete(proveedor.idProveedor)}>
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

            <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
                <DialogTitle sx={{ fontWeight: 700 }}>
                    {editing ? 'Editar proveedor' : 'Nuevo proveedor'}
                </DialogTitle>

                <DialogContent dividers>
                    <Grid container spacing={2} sx={{ mt: 0.2 }}>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="RUC"
                                value={form.ruc}
                                onChange={handleChange('ruc')}
                                error={!!errors.ruc}
                                helperText={errors.ruc}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Razón social"
                                value={form.razonSocial}
                                onChange={handleChange('razonSocial')}
                                error={!!errors.razonSocial}
                                helperText={errors.razonSocial}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Teléfono"
                                value={form.telefono}
                                onChange={handleChange('telefono')}
                                error={!!errors.telefono}
                                helperText={errors.telefono}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Correo"
                                value={form.correo}
                                onChange={handleChange('correo')}
                                error={!!errors.correo}
                                helperText={errors.correo}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Dirección"
                                value={form.direccion}
                                onChange={handleChange('direccion')}
                                error={!!errors.direccion}
                                helperText={errors.direccion}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Representante"
                                value={form.representante}
                                onChange={handleChange('representante')}
                                error={!!errors.representante}
                                helperText={errors.representante}
                            />
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <TextField
                                fullWidth
                                label="Id banco"
                                value={form.idBanco}
                                onChange={handleChange('idBanco')}
                            />
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <TextField
                                fullWidth
                                label="Cuenta bancaria"
                                value={form.cuentaBancaria}
                                onChange={handleChange('cuentaBancaria')}
                            />
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <TextField
                                fullWidth
                                label="Cuenta interbancaria"
                                value={form.cuentaInterbancaria}
                                onChange={handleChange('cuentaInterbancaria')}
                            />
                        </Grid>
                    </Grid>
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
        </Box>
    );
}