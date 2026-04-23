import React from 'react';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    IconButton,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    Paper,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
} from '@mui/material';

import { bancoService } from '../../../../services/bancoService';
import ModalBanco from './ModalBanco';

const initialForm = {
    idBanco: null,
    descripcion: '',
    estado: 'Activo',
};

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

    const cargarBancos = async () => {
        try {
            setLoading(true);
            const data = await bancoService.listar();
            setBancos(data || []);
        } catch (error) {
            setServerError('Error al cargar bancos');
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        cargarBancos();
    }, []);

    const handleChange = (field) => (e) => {
        setForm({ ...form, [field]: e.target.value });
    };

    const handleSubmit = async () => {
        if (!form.descripcion.trim()) {
            setErrors({ descripcion: 'Campo obligatorio' });
            return;
        }

        try {
            setSaving(true);

            if (editing) {
                await bancoService.actualizar(form.idBanco, form);
                setSuccess('Banco actualizado');
            } else {
                await bancoService.crear(form);
                setSuccess('Banco creado');
            }

            setOpen(false);
            cargarBancos();
        } catch (e) {
            setServerError('Error al guardar banco');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        try {
            await bancoService.eliminar(selectedDelete.idBanco);
            setSuccess('Banco eliminado');
            setDeleteDialog(false);
            cargarBancos();
        } catch {
            setServerError('Error al eliminar');
        }
    };

    return (
        <Box>
            <Card sx={{ borderRadius: 3 }}>
                <CardContent>
                    <Stack direction="row" justifyContent="space-between" mb={2}>
                        <Typography fontWeight={700}>Bancos</Typography>

                        <Button
                            variant="contained"
                            onClick={() => {
                                setForm(initialForm);
                                setEditing(false);
                                setOpen(true);
                            }}
                        >
                            Nuevo banco
                        </Button>
                    </Stack>

                    {serverError && <Alert severity="error">{serverError}</Alert>}
                    {success && <Alert severity="success">{success}</Alert>}

                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Nombre</TableCell>
                                    <TableCell>Estado</TableCell>
                                    <TableCell align="center">Acciones</TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={3} align="center">
                                            <CircularProgress />
                                        </TableCell>
                                    </TableRow>
                                ) : bancos.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={3} align="center">
                                            Sin registros
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    bancos.map((b) => (
                                        <TableRow key={b.idBanco}>
                                            <TableCell>{b.descripcion}</TableCell>

                                            <TableCell>
                                                <Chip label={b.estado} />
                                            </TableCell>

                                            <TableCell align="center">
                                                <IconButton
                                                    onClick={() => {
                                                        setForm(b);
                                                        setEditing(true);
                                                        setOpen(true);
                                                    }}
                                                >
                                                    ✏️
                                                </IconButton>

                                                <IconButton
                                                    onClick={() => {
                                                        setSelectedDelete(b);
                                                        setDeleteDialog(true);
                                                    }}
                                                >
                                                    🗑️
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

            <Dialog open={deleteDialog}>
                <DialogTitle>Eliminar banco</DialogTitle>
                <DialogContent>¿Seguro?</DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialog(false)}>Cancelar</Button>
                    <Button color="error" onClick={handleDelete}>
                        Eliminar
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}