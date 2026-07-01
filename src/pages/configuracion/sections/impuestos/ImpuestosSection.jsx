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

import { impuestoService } from '../../../../services/impuestoService';
import ModalImpuesto from './ModalImpuesto';
import { useAutoClearMessage } from '../../../../utils/useAutoClearMessage';

// Estado inicial del formulario para crear o editar impuestos.
const initialForm = {
    idImpuesto: null,
    tipoImpuesto: '',
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

function formatPorcentaje(value) {
    const numero = Number(value);
    if (!Number.isFinite(numero)) return '0.00';

    return numero.toLocaleString('es-PE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

// Acepta coma o punto decimal y limita el valor a dos decimales.
function parseValorDecimal(value) {
    const normalizado = String(value).trim().replace(',', '.');

    if (!/^\d+(\.\d{1,2})?$/.test(normalizado)) {
        return null;
    }

    const numero = Number(normalizado);
    if (!Number.isFinite(numero)) {
        return null;
    }

    return numero;
}

export default function ImpuestosSection() {
    const [impuestos, setImpuestos] = React.useState([]);
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

    // Lista todos los impuestos para que tambien puedan reactivarse los inactivos.
    const cargarImpuestos = React.useCallback(async () => {
        try {
            setLoading(true);
            setServerError('');
            const data = await impuestoService.listarTodos();
            setImpuestos(Array.isArray(data) ? data : []);
            setPage(0);
        } catch {
            setServerError('Error al cargar impuestos');
        } finally {
            setLoading(false);
        }
    }, []);

    React.useEffect(() => {
        cargarImpuestos();
    }, [cargarImpuestos]);

    const handleOpenCreate = () => {
        setForm(initialForm);
        setEditing(false);
        setErrors({});
        setServerError('');
        setSuccess('');
        setOpen(true);
    };

    const handleOpenEdit = (impuesto) => {
        setForm({
            idImpuesto: impuesto.idImpuesto,
            tipoImpuesto: impuesto.tipoImpuesto || '',
            valor: impuesto.valor ?? '',
            flgActivo: String(Boolean(impuesto.flgActivo)),
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

        if (!form.tipoImpuesto.trim()) {
            newErrors.tipoImpuesto = 'Campo obligatorio';
        }

        if (form.valor === '' || parseValorDecimal(form.valor) === null) {
            newErrors.valor = 'Ingrese un valor válido con hasta 2 decimales';
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
                tipoImpuesto: form.tipoImpuesto.trim(),
                valor: parseValorDecimal(form.valor),
                flgActivo: form.flgActivo === 'true',
            };

            if (editing && form.idImpuesto) {
                await impuestoService.actualizar(form.idImpuesto, payload);
                setSuccess('Impuesto actualizado');
            } else {
                await impuestoService.crear(payload);
                setSuccess('Impuesto creado');
            }

            setOpen(false);
            await cargarImpuestos();
        } catch (error) {
            const message = error?.response?.data?.message || error?.response?.data || 'Error al guardar impuesto';
            setServerError(typeof message === 'string' ? message : 'Error al guardar impuesto');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedDelete?.idImpuesto) return;

        try {
            setServerError('');
            await impuestoService.eliminar(selectedDelete.idImpuesto);
            setSuccess('Impuesto inactivado');
            setDeleteDialog(false);
            setSelectedDelete(null);
            await cargarImpuestos();
        } catch {
            setServerError('Error al eliminar');
        }
    };

    const impuestosPaginados = React.useMemo(() => {
        const start = page * rowsPerPage;
        return impuestos.slice(start, start + rowsPerPage);
    }, [impuestos, page, rowsPerPage]);

    return (
        <Box>
            <Card sx={{ borderRadius: 3 }}>
                <CardContent>
                    <Stack direction="row" justifyContent="flex-end" sx={{ mb: 2 }}>
                        <Button
                            variant="contained"
                            onClick={handleOpenCreate}
                            startIcon={<Icon name="add" size={18} color="#fff" />}
                        >
                            Nuevo impuesto
                        </Button>
                    </Stack>

                    {serverError && <Alert severity="error" sx={{ mb: 2 }}>{serverError}</Alert>}
                    {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Tipo impuesto</TableCell>
                                    <TableCell>Valor</TableCell>
                                    <TableCell>Estado</TableCell>
                                    <TableCell align="center" sx={{ width: 112 }}>Acciones</TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={4} align="center">
                                            <CircularProgress />
                                        </TableCell>
                                    </TableRow>
                                ) : impuestos.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} align="center">
                                            Sin registros
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    impuestosPaginados.map((impuesto) => (
                                        <TableRow key={impuesto.idImpuesto}>
                                            <TableCell>{impuesto.tipoImpuesto}</TableCell>
                                            <TableCell>{formatPorcentaje(impuesto.valor)}%</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={impuesto.flgActivo ? 'Activo' : 'Inactivo'}
                                                    size="small"
                                                    sx={getEstadoChipStyles(impuesto.flgActivo)}
                                                />
                                            </TableCell>
                                            <TableCell align="center" sx={{ width: 112 }}>
                                                <IconButton onClick={() => handleOpenEdit(impuesto)} sx={{ width: 36, height: 36 }}>
                                                    <Icon name="edit" size={20} color="#1976d2" />
                                                </IconButton>
                                                <IconButton
                                                    onClick={() => {
                                                        setSelectedDelete(impuesto);
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

                        {!loading && impuestos.length > 0 ? (
                            <TablePagination
                                component="div"
                                count={impuestos.length}
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

            <ModalImpuesto
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
                <DialogTitle>Inactivar impuesto</DialogTitle>
                <DialogContent>
                    ¿Seguro que deseas inactivar este impuesto?
                    {selectedDelete ? (
                        <Typography sx={{ mt: 1, fontWeight: 700 }}>
                            {selectedDelete.tipoImpuesto}
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
