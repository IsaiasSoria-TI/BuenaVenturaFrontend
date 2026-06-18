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

import { categoriaService } from '../../../../services/categoriaService';
import { cuentaContableService } from '../../../../services/cuentaContableService';
import ModalCategoria from './ModalCategoria';

// Icono simple basado en Material Symbols para acciones de la tabla.
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

Icon.propTypes = {
    name: PropTypes.string.isRequired,
    size: PropTypes.number,
    color: PropTypes.string,
};

// Estado base de la categoria; se reutiliza al abrir el modal en modo creacion.
const initialForm = {
    idCategoria: null,
    descripcion: '',
    idCuentaContable: '',
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

export default function CategoriasSection() {
    const [categorias, setCategorias] = React.useState([]);
    const [cuentasContables, setCuentasContables] = React.useState([]);

    const [loading, setLoading] = React.useState(true);
    const [catalogLoading, setCatalogLoading] = React.useState(true);
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

    // Carga las categorias que se listan en la tabla principal.
    const cargarCategorias = React.useCallback(async () => {
        try {
            setLoading(true);
            setServerError('');

            const data = await categoriaService.listar();
            setCategorias(Array.isArray(data) ? data : []);
            setPage(0);
        } catch (error) {

            const message =
                error?.response?.data?.message ||
                error?.response?.data ||
                'No se pudo listar las categorías.';

            setServerError(
                typeof message === 'string'
                    ? message
                    : 'No se pudo listar las categorías.'
            );
        } finally {
            setLoading(false);
        }
    }, []);

    const cargarCatalogos = React.useCallback(async () => {
        // Las cuentas contables alimentan el selector del modal de categoria.
        try {
            setCatalogLoading(true);
            const data = await cuentaContableService.listar();
            setCuentasContables(Array.isArray(data) ? data : []);
        } catch {
            // Si falla este catalogo, el formulario conserva el selector vacio.
        } finally {
            setCatalogLoading(false);
        }
    }, []);

    React.useEffect(() => {
        cargarCategorias();
        cargarCatalogos();
    }, [cargarCategorias, cargarCatalogos]);

    const handleOpenCreate = () => {
        setEditing(false);
        setForm(initialForm);
        setErrors({});
        setServerError('');
        setSuccessMessage('');
        setOpen(true);
    };

    const handleOpenEdit = (categoria) => {
        setEditing(true);
        setForm({
            idCategoria: categoria.idCategoria,
            descripcion: categoria.descripcion || '',
            idCuentaContable: categoria.idCuentaContable ?? '',
            estado: categoria.estado || 'Activo',
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

        if (!form.descripcion.trim()) {
            newErrors.descripcion = 'La descripción es obligatoria';
        }

        if (!form.idCuentaContable) {
            newErrors.idCuentaContable = 'La cuenta contable es obligatoria';
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
                descripcion: form.descripcion.trim(),
                idCuentaContable: Number(form.idCuentaContable),
                estado: form.estado,
            };

            if (editing && form.idCategoria) {
                await categoriaService.actualizar(form.idCategoria, payload);
                setSuccessMessage('Categoría actualizada correctamente.');
            } else {
                await categoriaService.crear(payload);
                setSuccessMessage('Categoría registrada correctamente.');
            }

            handleClose();
            await cargarCategorias();
        } catch (error) {

            const message =
                error?.response?.data?.message ||
                error?.response?.data ||
                'No se pudo guardar la categoría.';

            setServerError(
                typeof message === 'string'
                    ? message
                    : 'No se pudo guardar la categoría.'
            );
        } finally {
            setSaving(false);
        }
    };

    const handleOpenDeleteDialog = (categoria) => {
        setSelectedDelete(categoria);
        setDeleteDialogOpen(true);
    };

    const handleCloseDeleteDialog = () => {
        setSelectedDelete(null);
        setDeleteDialogOpen(false);
    };

    const handleConfirmDelete = async () => {
        if (!selectedDelete?.idCategoria) return;

        try {
            await categoriaService.eliminar(selectedDelete.idCategoria);
            setSuccessMessage('Categoría inactivada correctamente.');
            handleCloseDeleteDialog();
            await cargarCategorias();
        } catch (error) {

            const message =
                error?.response?.data?.message ||
                error?.response?.data ||
                'No se pudo eliminar la categoría.';

            setServerError(
                typeof message === 'string'
                    ? message
                    : 'No se pudo eliminar la categoría.'
            );
        }
    };

    const handleChangePage = (_event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const categoriasPaginadas = React.useMemo(() => {
        const inicio = page * rowsPerPage;
        const fin = inicio + rowsPerPage;
        return categorias.slice(inicio, fin);
    }, [categorias, page, rowsPerPage]);

    const renderTableRows = () => {
        if (loading || catalogLoading) {
            return (
                <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                        <CircularProgress size={28} />
                    </TableCell>
                </TableRow>
            );
        }

        if (categorias.length === 0) {
            return (
                <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 4, color: '#64748b' }}>
                        No hay categorÃ­as registradas.
                    </TableCell>
                </TableRow>
            );
        }

        return categoriasPaginadas.map((categoria) => (
            <TableRow key={categoria.idCategoria} hover>
                <TableCell>{categoria.descripcion}</TableCell>
                <TableCell>{categoria.codigoCuentaContable}</TableCell>
                <TableCell>
                    <Chip
                        label={categoria.estado || '-'}
                        size="small"
                        sx={{
                            fontWeight: 700,
                            ...getEstadoChipStyles(categoria.estado),
                        }}
                    />
                </TableCell>
                <TableCell align="center" sx={{ width: 112 }}>
                    <IconButton onClick={() => handleOpenEdit(categoria)} sx={{ width: 36, height: 36 }}>
                        <Icon name="edit" size={20} color="#1976d2" />
                    </IconButton>

                    <IconButton
                        onClick={() => handleOpenDeleteDialog(categoria)}
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
                                Categorías
                            </Typography>
                            <Typography sx={{ color: '#64748b', fontSize: '0.9rem' }}>
                                Crea categorías y asígnales una cuenta contable.
                            </Typography>
                        </Box>

                        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
                            <Button
                                variant="outlined"
                                onClick={cargarCategorias}
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
                                Nueva categoría
                            </Button>
                        </Stack>
                    </Stack>

                    {successMessage && (
                        <Alert severity="success" sx={{ mb: 2 }}>
                            {successMessage}
                        </Alert>
                    )}

                    {serverError && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {serverError}
                        </Alert>
                    )}

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
                                    <TableCell sx={{ fontWeight: 700 }}>DESCRIPCIÓN</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>CUENTA CONTABLE</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>ESTADO</TableCell>
                                    <TableCell sx={{ width: 112, fontWeight: 700, textAlign: 'center' }}>
                                        ACCIONES
                                    </TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>{renderTableRows()}</TableBody>
                        </Table>

                        {!loading && !catalogLoading && categorias.length > 0 && (
                            <TablePagination
                                component="div"
                                count={categorias.length}
                                page={page}
                                onPageChange={handleChangePage}
                                rowsPerPage={rowsPerPage}
                                onRowsPerPageChange={handleChangeRowsPerPage}
                                rowsPerPageOptions={[5, 10, 20]}
                                labelRowsPerPage="Filas por página:"
                            />
                        )}
                    </TableContainer>
                </CardContent>
            </Card>

            <ModalCategoria
                open={open}
                onClose={handleClose}
                editing={editing}
                form={form}
                errors={errors}
                saving={saving}
                cuentasContables={cuentasContables}
                handleChange={handleChange}
                handleSubmit={handleSubmit}
            />

            <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
                <DialogTitle sx={{ fontWeight: 700 }}>Confirmar eliminación</DialogTitle>
                <DialogContent>
                    <Typography sx={{ color: '#475569' }}>
                        ¿Seguro que deseas inactivar esta categoría?
                    </Typography>

                    {selectedDelete && (
                        <Typography sx={{ mt: 1, fontWeight: 700, color: '#0f172a' }}>
                            Categoría: {selectedDelete.descripcion}
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
                        Inactivar
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
