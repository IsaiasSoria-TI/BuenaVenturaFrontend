import * as React from 'react';

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
  InputAdornment,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';

import { tipoEnvaseService } from '../../../services/tipoEnvaseService';
import { useAutoClearMessage } from '../../../utils/useAutoClearMessage';
import { getApiErrorMessage } from '../../../utils/getApiErrorMessage';
import Icon from '../../../components/MaterialSymbol';
import TableSkeletonRows from '../../../components/loading/TableSkeletonRows';

const initialForm = {
  idTipoEnvase: null,
  nombre: '',
  estado: 'Activo',
};

function getEstadoChipStyles(estado) {
  if (estado === 'Activo') {
    return { backgroundColor: '#dcfce7', color: '#16a34a' };
  }

  return { backgroundColor: '#fee2e2', color: '#dc2626' };
}

export default function TipoEnvase() {
  const [tiposEnvase, setTiposEnvase] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  const [form, setForm] = React.useState(initialForm);
  const [errors, setErrors] = React.useState({});

  const [serverError, setServerError] = React.useState('');
  const [successMessage, setSuccessMessage] = React.useState('');

  useAutoClearMessage(successMessage, setSuccessMessage);

  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [selectedDelete, setSelectedDelete] = React.useState(null);

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [searchTerm, setSearchTerm] = React.useState('');

  const cargarTiposEnvase = React.useCallback(async () => {
    try {
      setLoading(true);
      setServerError('');

      const data = await tipoEnvaseService.listar();
      setTiposEnvase(Array.isArray(data) ? data : []);
      setPage(0);
    } catch (error) {
      setServerError(getApiErrorMessage(error, 'No se pudo listar los tipos de envase.'));
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    cargarTiposEnvase();
  }, [cargarTiposEnvase]);

  const handleOpenCreate = () => {
    setEditing(false);
    setForm(initialForm);
    setErrors({});
    setServerError('');
    setSuccessMessage('');
    setOpen(true);
  };

  const handleOpenEdit = (tipoEnvase) => {
    setEditing(true);
    setForm({
      idTipoEnvase: tipoEnvase.idTipoEnvase,
      nombre: tipoEnvase.nombre || '',
      estado: tipoEnvase.estado || 'Activo',
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
    setForm((prev) => ({ ...prev, [field]: event.target.value }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }

    if (serverError) setServerError('');
    if (successMessage) setSuccessMessage('');
  };

  const validate = () => {
    const newErrors = {};

    if (!form.nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio';
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
        nombre: form.nombre.trim(),
        estado: form.estado,
      };

      if (editing && form.idTipoEnvase) {
        await tipoEnvaseService.actualizar(form.idTipoEnvase, payload);
        setSuccessMessage('Tipo de envase actualizado correctamente.');
      } else {
        await tipoEnvaseService.crear(payload);
        setSuccessMessage('Tipo de envase registrado correctamente.');
      }

      handleClose();
      await cargarTiposEnvase();
    } catch (error) {
      setServerError(getApiErrorMessage(error, 'No se pudo guardar el tipo de envase.'));
    } finally {
      setSaving(false);
    }
  };

  const handleOpenDeleteDialog = (tipoEnvase) => {
    setSelectedDelete(tipoEnvase);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setSelectedDelete(null);
    setDeleteDialogOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (!selectedDelete?.idTipoEnvase) return;

    try {
      setServerError('');
      setSuccessMessage('');

      await tipoEnvaseService.eliminar(selectedDelete.idTipoEnvase);
      setSuccessMessage('Tipo de envase inactivado correctamente.');
      handleCloseDeleteDialog();
      await cargarTiposEnvase();
    } catch (error) {
      setServerError(getApiErrorMessage(error, 'No se pudo inactivar el tipo de envase.'));
    }
  };

  const handleChangePage = (_event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(Number.parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const tiposEnvaseFiltrados = React.useMemo(() => {
    const criterio = searchTerm.trim().toLowerCase();
    if (!criterio) return tiposEnvase;

    return tiposEnvase.filter((tipoEnvase) => {
      const valoresBusqueda = [tipoEnvase.nombre, tipoEnvase.estado];
      return valoresBusqueda.some((value) => String(value || '').toLowerCase().includes(criterio));
    });
  }, [tiposEnvase, searchTerm]);

  const tiposEnvasePaginados = React.useMemo(() => {
    const inicio = page * rowsPerPage;
    return tiposEnvaseFiltrados.slice(inicio, inicio + rowsPerPage);
  }, [tiposEnvaseFiltrados, page, rowsPerPage]);

  const renderTableRows = () => {
    if (loading) {
      return <TableSkeletonRows columns={3} />;
    }

    if (tiposEnvase.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={3} align="center" sx={{ py: 4, color: '#64748b' }}>
            No hay tipos de envase registrados.
          </TableCell>
        </TableRow>
      );
    }

    if (tiposEnvaseFiltrados.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={3} align="center" sx={{ py: 4, color: '#64748b' }}>
            No se encontraron tipos de envase con ese criterio.
          </TableCell>
        </TableRow>
      );
    }

    return tiposEnvasePaginados.map((tipoEnvase) => (
      <TableRow key={tipoEnvase.idTipoEnvase} hover>
        <TableCell>{tipoEnvase.nombre || '-'}</TableCell>
        <TableCell>
          <Chip
            label={tipoEnvase.estado || '-'}
            size="small"
            sx={{ fontWeight: 700, ...getEstadoChipStyles(tipoEnvase.estado) }}
          />
        </TableCell>
        <TableCell align="center">
          <IconButton onClick={() => handleOpenEdit(tipoEnvase)}>
            <Icon name="edit" size={20} color="#1976d2" />
          </IconButton>
          <IconButton onClick={() => handleOpenDeleteDialog(tipoEnvase)}>
            <Icon name="delete" size={20} color="#ef4444" />
          </IconButton>
        </TableCell>
      </TableRow>
    ));
  };

  return (
    <Box>
      <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e2e8f0' }}>
        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={2}
            sx={{ mb: 2.5, alignItems: { xs: 'stretch', md: 'center' }, justifyContent: 'space-between' }}
          >
            <Box>
              <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
                Tipos de envase
              </Typography>
              <Typography sx={{ fontSize: '0.86rem', color: '#64748b', mt: 0.5 }}>
                Administra el catálogo de tipos de envase usados por los artículos.
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
                borderRadius: '8px',
                boxShadow: 'none',
              }}
            >
              Nuevo tipo de envase
            </Button>
          </Stack>

          <TextField
            fullWidth
            size="small"
            placeholder="Buscar por nombre o estado..."
            value={searchTerm}
            onChange={handleSearchChange}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Icon name="search" size={18} color="#64748b" />
                  </InputAdornment>
                ),
              },
            }}
            sx={{ mb: 2 }}
          />

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
            sx={{ border: '1px solid #e2e8f0', borderRadius: 2.5, overflowX: 'auto' }}
          >
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f8fafc' }}>
                  <TableCell sx={{ fontWeight: 700 }}>NOMBRE</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>ESTADO</TableCell>
                  <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>ACCIONES</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>{renderTableRows()}</TableBody>
            </Table>

            {!loading && tiposEnvaseFiltrados.length > 0 ? (
              <TablePagination
                component="div"
                count={tiposEnvaseFiltrados.length}
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

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 700 }}>
          {editing ? 'Editar tipo de envase' : 'Nuevo tipo de envase'}
        </DialogTitle>

        <DialogContent dividers sx={{ pt: 2.5 }}>
          <Stack spacing={2.5}>
            <TextField
              fullWidth
              label="Nombre"
              value={form.nombre}
              onChange={handleChange('nombre')}
              error={!!errors.nombre}
              helperText={errors.nombre}
              disabled={saving}
              autoFocus
            />

            {editing ? (
              <TextField
                select
                fullWidth
                label="Estado"
                value={form.estado}
                onChange={handleChange('estado')}
                disabled={saving}
              >
                <MenuItem value="Activo">Activo</MenuItem>
                <MenuItem value="Inactivo">Inactivo</MenuItem>
              </TextField>
            ) : null}
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
        <DialogTitle sx={{ fontWeight: 700 }}>Confirmar inactivación</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: '#475569' }}>
            ¿Seguro que deseas inactivar este tipo de envase?
          </Typography>
          {selectedDelete ? (
            <Typography sx={{ mt: 1, fontWeight: 700, color: '#0f172a' }}>
              {selectedDelete.nombre}
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
