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
  Chip,
  CircularProgress,
} from '@mui/material';
import { articuloService } from '../../../services/articuloService';
import ModalArticulo from './ModalArticulo';

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

const MEDIDAS = [
  { value: 'kg', label: 'Kilogramos (kg)' },
  { value: 'tn', label: 'Toneladas (tn)' },
];

const initialForm = {
  idArticulo: null,
  descripcion: '',
  medida: '',
  stock: '',
  estado: 'Activo',
};

export default function Articulo() {
  const [articulos, setArticulos] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState(false);
  const [form, setForm] = React.useState(initialForm);
  const [errors, setErrors] = React.useState({});
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [selectedDelete, setSelectedDelete] = React.useState(null);

  const cargarArticulos = React.useCallback(async () => {
    try {
      setLoading(true);
      const data = await articuloService.listar();
      setArticulos(data);
    } catch (error) {
      console.error('Error al listar artículos:', error);
      console.error('status:', error?.response?.status);
      console.error('data:', error?.response?.data);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    cargarArticulos();
  }, [cargarArticulos]);

  const handleOpenCreate = () => {
    setEditing(false);
    setForm(initialForm);
    setErrors({});
    setOpen(true);
  };

  const handleOpenEdit = (articulo) => {
    setEditing(true);
    setErrors({});
    setForm({
      idArticulo: articulo.idArticulo,
      descripcion: articulo.descripcion || '',
      medida: articulo.medida || '',
      stock: articulo.stock ?? '',
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
  };

  const validate = () => {
    const newErrors = {};

    if (!form.descripcion.trim()) {
      newErrors.descripcion = 'La descripción es obligatoria';
    }

    if (!form.medida) {
      newErrors.medida = 'Seleccione una medida';
    }

    if (form.stock !== '' && Number(form.stock) < 0) {
      newErrors.stock = 'El stock no puede ser negativo';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const buildPayload = () => ({
    descripcion: form.descripcion.trim(),
    medida: form.medida,
    stock: form.stock === '' ? null : Number(form.stock),
    estado: form.estado || 'Activo',
  });

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      setSaving(true);
      const payload = buildPayload();

      if (editing && form.idArticulo) {
        await articuloService.actualizar(form.idArticulo, payload);
      } else {
        await articuloService.crear(payload);
      }

      handleClose();
      await cargarArticulos();
    } catch (error) {
      console.error('Error al guardar artículo:', error);
      console.error('status:', error?.response?.status);
      console.error('data:', error?.response?.data);
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
      handleCloseDeleteDialog();
      await cargarArticulos();
    } catch (error) {
      console.error('Error al eliminar artículo:', error);
      console.error('status:', error?.response?.status);
      console.error('data:', error?.response?.data);
    }
  };

  const getMedidaLabel = (medida) => {
    const found = MEDIDAS.find((m) => m.value === medida);
    return found ? found.label : medida || '-';
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
                Artículos
              </Typography>
              <Typography sx={{ fontSize: '0.86rem', color: '#64748b', mt: 0.5 }}>
                Gestiona, edita y elimina artículos de inventario.
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
                  <TableCell sx={{ fontWeight: 700 }}>DESCRIPCIÓN</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>MEDIDA</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>STOCK DE SEGURIDAD</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>ESTADO</TableCell>
                  <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>ACCIONES</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {loading ? (
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
                  articulos.map((articulo) => (
                    <TableRow key={articulo.idArticulo} hover>
                      <TableCell>{articulo.idArticulo}</TableCell>
                      <TableCell>{articulo.descripcion}</TableCell>
                      <TableCell>{getMedidaLabel(articulo.medida)}</TableCell>
                      <TableCell>{articulo.stock ?? 0}</TableCell>
                      <TableCell>
                        <Chip
                          label={articulo.estado === 'Activo' ? 'Activo' : 'Inactivo'}
                          size="small"
                          sx={{
                            fontWeight: 700,
                            backgroundColor: articulo.estado === 'Activo' ? '#dcfce7' : '#fee2e2',
                            color: articulo.estado === 'Activo' ? '#16a34a' : '#dc2626',
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
      />

      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle sx={{ fontWeight: 700 }}>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: '#475569' }}>
            ¿Seguro que deseas eliminar este artículo?
          </Typography>
          {selectedDelete && (
            <Typography sx={{ mt: 1, fontWeight: 700, color: '#0f172a' }}>
              {selectedDelete.descripcion}
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