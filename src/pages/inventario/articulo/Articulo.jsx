import * as React from 'react';
import PropTypes from 'prop-types';

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
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TablePagination,
  Alert,
} from '@mui/material';

import { articuloService } from '../../../services/articuloService';
import { categoriaService } from '../../../services/categoriaService';
import ModalArticulo from './ModalArticulo';

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
        fontVariationSettings: '"FILL" 0, "wght" 500, "GRAD" 0, "opsz" 24',
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

const initialForm = {
  idArticulo: null,
  descripcion: '',
  medida: '',
  stock: '',
  idCategoria: '',
  estado: 'Activo',
};

function formatNumber(value) {
  if (value === null || value === undefined || value === '') return '0.00';

  const number = Number(value);
  if (Number.isNaN(number)) return '0.00';

  return number.toFixed(2);
}

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

export default function Articulo() {
  const [articulos, setArticulos] = React.useState([]);
  const [categorias, setCategorias] = React.useState([]);

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

  const cargarArticulos = React.useCallback(async () => {
    try {
      setLoading(true);
      setServerError('');

      const data = await articuloService.listar();
      setArticulos(Array.isArray(data) ? data : []);
      setPage(0);
    } catch (error) {
      console.error('Error al listar artículos:', error);
      console.error('status:', error?.response?.status);
      console.error('data:', error?.response?.data);

      const message =
        error?.response?.data?.message ||
        error?.response?.data ||
        'No se pudo listar los artículos.';

      setServerError(
        typeof message === 'string'
          ? message
          : 'No se pudo listar los artículos.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const cargarCategorias = React.useCallback(async () => {
    try {
      setCatalogLoading(true);
      const data = await categoriaService.listar();
      setCategorias(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error al listar categorías:', error);
      console.error('status:', error?.response?.status);
      console.error('data:', error?.response?.data);
    } finally {
      setCatalogLoading(false);
    }
  }, []);

  React.useEffect(() => {
    cargarArticulos();
    cargarCategorias();
  }, [cargarArticulos, cargarCategorias]);

  const handleOpenCreate = () => {
    setEditing(false);
    setForm(initialForm);
    setErrors({});
    setServerError('');
    setSuccessMessage('');
    setOpen(true);
  };

  const handleOpenEdit = (articulo) => {
    setEditing(true);
    setErrors({});
    setServerError('');
    setSuccessMessage('');
    setForm({
      idArticulo: articulo.idArticulo,
      descripcion: articulo.descripcion || '',
      medida: articulo.medida || '',
      stock: articulo.stock ?? '',
      idCategoria: articulo.idCategoria ?? '',
      estado: articulo.estado || 'Activo',
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

    if (!form.medida) {
      newErrors.medida = 'La medida es obligatoria';
    }

    if (form.stock === '' || Number(form.stock) < 0) {
      newErrors.stock = 'El stock no puede ser negativo';
    }

    if (!form.idCategoria) {
      newErrors.idCategoria = 'Seleccione una categoría';
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
        medida: form.medida,
        stock: Number(form.stock),
        idCategoria: Number(form.idCategoria),
        estado: form.estado,
      };

      if (editing && form.idArticulo) {
        await articuloService.actualizar(form.idArticulo, payload);
        setSuccessMessage('Artículo actualizado correctamente.');
      } else {
        await articuloService.crear(payload);
        setSuccessMessage('Artículo registrado correctamente.');
      }

      handleClose();
      await cargarArticulos();
    } catch (error) {
      console.error('Error al guardar artículo:', error);
      console.error('status:', error?.response?.status);
      console.error('data:', error?.response?.data);

      const message =
        error?.response?.data?.message ||
        error?.response?.data ||
        'No se pudo guardar el artículo.';

      setServerError(
        typeof message === 'string'
          ? message
          : 'No se pudo guardar el artículo.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleOpenDeleteDialog = (articulo) => {
    setSelectedDelete(articulo);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setSelectedDelete(null);
    setDeleteDialogOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (!selectedDelete?.idArticulo) return;

    try {
      await articuloService.eliminar(selectedDelete.idArticulo);
      setSuccessMessage('Artículo inactivado correctamente.');
      handleCloseDeleteDialog();
      await cargarArticulos();
    } catch (error) {
      console.error('Error al eliminar artículo:', error);
      console.error('status:', error?.response?.status);
      console.error('data:', error?.response?.data);

      const message =
        error?.response?.data?.message ||
        error?.response?.data ||
        'No se pudo eliminar el artículo.';

      setServerError(
        typeof message === 'string'
          ? message
          : 'No se pudo eliminar el artículo.'
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

  const articulosPaginados = React.useMemo(() => {
    const inicio = page * rowsPerPage;
    const fin = inicio + rowsPerPage;
    return articulos.slice(inicio, fin);
  }, [articulos, page, rowsPerPage]);

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
                Artículos
              </Typography>
              <Typography sx={{ fontSize: '0.86rem', color: '#64748b', mt: 0.5 }}>
                Administra los artículos y asígnales una categoría.
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
              Nuevo artículo
            </Button>
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
                  <TableCell sx={{ fontWeight: 700 }}>DESCRIPCIÓN</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>MEDIDA</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>STOCK</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>CATEGORÍA</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>ESTADO</TableCell>
                  <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>ACCIONES</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {loading || catalogLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <CircularProgress size={28} />
                    </TableCell>
                  </TableRow>
                ) : articulos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4, color: '#64748b' }}>
                      No hay artículos registrados.
                    </TableCell>
                  </TableRow>
                ) : (
                  articulosPaginados.map((articulo) => (
                    <TableRow key={articulo.idArticulo} hover>
                      <TableCell>{articulo.descripcion}</TableCell>
                      <TableCell>{articulo.medida}</TableCell>
                      <TableCell>{formatNumber(articulo.stock)}</TableCell>
                      <TableCell>{articulo.descripcionCategoria || '-'}</TableCell>
                      <TableCell>
                        <Chip
                          label={articulo.estado || '-'}
                          size="small"
                          sx={{
                            fontWeight: 700,
                            ...getEstadoChipStyles(articulo.estado),
                          }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton onClick={() => handleOpenEdit(articulo)}>
                          <Icon name="edit" size={20} color="#1976d2" />
                        </IconButton>
                        <IconButton onClick={() => handleOpenDeleteDialog(articulo)}>
                          <Icon name="delete" size={20} color="#ef4444" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {!loading && !catalogLoading && articulos.length > 0 ? (
              <TablePagination
                component="div"
                count={articulos.length}
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

      <ModalArticulo
        open={open}
        onClose={handleClose}
        editing={editing}
        form={form}
        errors={errors}
        saving={saving}
        onChange={handleChange}
        onSubmit={handleSubmit}
        categorias={categorias}
      />

      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle sx={{ fontWeight: 700 }}>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: '#475569' }}>
            ¿Seguro que deseas inactivar este artículo?
          </Typography>
          {selectedDelete ? (
            <Typography sx={{ mt: 1, fontWeight: 700, color: '#0f172a' }}>
              Artículo: {selectedDelete.descripcion}
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