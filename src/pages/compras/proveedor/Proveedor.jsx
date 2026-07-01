import * as React from 'react';
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
  InputAdornment,
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

import { proveedorService } from '../../../services/proveedorService';
import { tipoProveedorService } from '../../../services/tipoProveedorService';
import { bancoService } from '../../../services/bancoService';
import ModalProveedor from './ModalProveedor';

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
  idProveedor: null,
  ruc: '',
  razonSocial: '',
  idTipoProveedor: '',
  telefono: '',
  correo: '',
  direccion: '',
  representante: '',
  departamento: '',
  provincia: '',
  idBanco: '',
  cuentaBancaria: '',
  cuentaInterbancaria: '',
};

// Mensajes exactos del backend que se muestran junto al campo correspondiente.
const DUPLICATE_BANK_ACCOUNT_MESSAGE =
  'La cuenta bancaria ya está registrada en otro proveedor';
const DUPLICATE_INTERBANK_ACCOUNT_MESSAGE =
  'La cuenta interbancaria ya está registrada en otro proveedor';

function getEstadoChipStyles(flgActivo) {
  if (flgActivo) {
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

function formatCodigo(prefix, id) {
  if (id === null || id === undefined || id === '') return '-';
  return `${prefix}-${String(id).padStart(4, '0')}`;
}

function normalizeAccount(value) {
  return String(value || '').trim();
}

export default function Proveedor() {
  const [proveedores, setProveedores] = React.useState([]);
  const [tiposProveedor, setTiposProveedor] = React.useState([]);
  const [bancos, setBancos] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState(false);

  const [form, setForm] = React.useState(initialForm);
  const [errors, setErrors] = React.useState({});

  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [selectedDelete, setSelectedDelete] = React.useState(null);

  const [serverError, setServerError] = React.useState('');
  const [serverSuccess, setServerSuccess] = React.useState('');

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [searchTerm, setSearchTerm] = React.useState('');

  // Carga proveedores para la tabla principal.
  const cargarProveedores = React.useCallback(async () => {
    try {
      setLoading(true);
      setServerError('');

      const data = await proveedorService.listar();
      setProveedores(Array.isArray(data) ? data : []);
      setPage(0);
    } catch (error) {

      const message =
        error?.response?.data?.message ||
        error?.response?.data ||
        'No se pudo listar los proveedores.';

      setServerError(
        typeof message === 'string'
          ? message
          : 'No se pudo listar los proveedores.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Catalogo usado para clasificar al proveedor en el formulario.
  const cargarTiposProveedor = React.useCallback(async () => {
    try {
      const data = await tipoProveedorService.listar();
      setTiposProveedor(Array.isArray(data) ? data : []);
    } catch (error) {

      const message =
        error?.response?.data?.message ||
        error?.response?.data ||
        'No se pudo listar los tipos de proveedor.';

      setServerError(
        typeof message === 'string'
          ? message
          : 'No se pudo listar los tipos de proveedor.'
      );
    }
  }, []);

  // Catalogo de bancos para datos de pago del proveedor.
  const cargarBancos = React.useCallback(async () => {
    try {
      const data = await bancoService.listar();
      setBancos(Array.isArray(data) ? data : []);
    } catch (error) {

      const message =
        error?.response?.data?.message ||
        error?.response?.data ||
        'No se pudo listar los bancos.';

      setServerError(
        typeof message === 'string'
          ? message
          : 'No se pudo listar los bancos.'
      );
    }
  }, []);

  React.useEffect(() => {
    cargarProveedores();
    cargarTiposProveedor();
    cargarBancos();
  }, [cargarProveedores, cargarTiposProveedor, cargarBancos]);

  const handleOpenCreate = () => {
    setEditing(false);
    setForm(initialForm);
    setErrors({});
    setServerError('');
    setServerSuccess('');
    setOpen(true);
  };

  const handleOpenEdit = (proveedor) => {
    setEditing(true);
    setErrors({});
    setServerError('');
    setServerSuccess('');
    setForm({
      idProveedor: proveedor.idProveedor,
      ruc: proveedor.ruc || '',
      razonSocial: proveedor.razonSocial || '',
      idTipoProveedor: proveedor.idTipoProveedor ?? '',
      telefono: proveedor.telefono || '',
      correo: proveedor.correo || '',
      direccion: proveedor.direccion || '',
      representante: proveedor.representante || '',
      departamento: proveedor.departamento || '',
      provincia: proveedor.provincia || '',
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
    setServerError('');
    setServerSuccess('');
  };

  const handleChange = (field) => (event) => {
    const { value } = event.target;

    setForm((prev) => ({
      ...prev,
      [field]: value,
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

    if (serverSuccess) {
      setServerSuccess('');
    }
  };

  // Valida reglas de negocio del formulario antes de enviar al backend.
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

    if (!form.idTipoProveedor) {
      newErrors.idTipoProveedor = 'Seleccione un tipo de proveedor';
    }

    if (form.telefono.trim() && !/^[0-9]{9}$/.test(form.telefono.trim())) {
      newErrors.telefono = 'El teléfono debe tener 9 dígitos';
    }

    if (!form.direccion.trim()) {
      newErrors.direccion = 'La dirección es obligatoria';
    }

    if (!form.departamento.trim()) {
      newErrors.departamento = 'El departamento es obligatorio';
    }

    if (!form.provincia.trim()) {
      newErrors.provincia = 'La provincia es obligatoria';
    }

    if (form.correo.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(form.correo.trim())) {
        newErrors.correo = 'El correo no es válido';
      }
    }

    const cuentaBancaria = normalizeAccount(form.cuentaBancaria);
    const cuentaInterbancaria = normalizeAccount(form.cuentaInterbancaria);
    const idProveedorActual = form.idProveedor === null ? null : Number(form.idProveedor);

    const existeCuentaBancaria = cuentaBancaria
      ? proveedores.some((proveedor) =>
          proveedor.flgActivo !== false &&
          Number(proveedor.idProveedor) !== idProveedorActual &&
          normalizeAccount(proveedor.cuentaBancaria) === cuentaBancaria
        )
      : false;

    const existeCuentaInterbancaria = cuentaInterbancaria
      ? proveedores.some((proveedor) =>
          proveedor.flgActivo !== false &&
          Number(proveedor.idProveedor) !== idProveedorActual &&
          normalizeAccount(proveedor.cuentaInterbancaria) === cuentaInterbancaria
        )
      : false;

    if (existeCuentaBancaria) {
      newErrors.cuentaBancaria = DUPLICATE_BANK_ACCOUNT_MESSAGE;
    }

    if (existeCuentaInterbancaria) {
      newErrors.cuentaInterbancaria = DUPLICATE_INTERBANK_ACCOUNT_MESSAGE;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const setBackendFieldError = (message) => {
    if (message === DUPLICATE_BANK_ACCOUNT_MESSAGE) {
      setErrors((prev) => ({
        ...prev,
        cuentaBancaria: message,
      }));
      return;
    }

    if (message === DUPLICATE_INTERBANK_ACCOUNT_MESSAGE) {
      setErrors((prev) => ({
        ...prev,
        cuentaInterbancaria: message,
      }));
    }
  };

  // Limpia y transforma el formulario al contrato esperado por /api/proveedores.
  const buildPayload = () => ({
    idProveedor: form.idProveedor,
    ruc: form.ruc.trim(),
    razonSocial: form.razonSocial.trim(),
    idTipoProveedor: form.idTipoProveedor === '' ? null : Number(form.idTipoProveedor),
    telefono: form.telefono.trim() || null,
    correo: form.correo.trim() || null,
    direccion: form.direccion.trim(),
    representante: form.representante.trim() || null,
    departamento: form.departamento.trim() || null,
    provincia: form.provincia.trim() || null,
    idBanco: form.idBanco === '' ? null : Number(form.idBanco),
    cuentaBancaria: form.cuentaBancaria.trim() || null,
    cuentaInterbancaria: form.cuentaInterbancaria.trim() || null,
  });

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      setSaving(true);
      setServerError('');
      setServerSuccess('');

      const payload = buildPayload();

      if (editing && form.idProveedor) {
        await proveedorService.actualizar(form.idProveedor, payload);
        setServerSuccess('Proveedor actualizado correctamente.');
      } else {
        await proveedorService.crear(payload);
        setServerSuccess('Proveedor registrado correctamente.');
      }

      await cargarProveedores();
      handleClose();
    } catch (error) {

      const message =
        error?.response?.data?.message ||
        error?.response?.data ||
        'No se pudo guardar el proveedor.';

      const errorMessage =
        typeof message === 'string'
          ? message
          : 'No se pudo guardar el proveedor.';

      setBackendFieldError(errorMessage);
      setServerError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleOpenDeleteDialog = (proveedor) => {
    setSelectedDelete(proveedor);
    setServerError('');
    setServerSuccess('');
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setSelectedDelete(null);
    setDeleteDialogOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (!selectedDelete?.idProveedor) return;

    try {
      setServerError('');
      setServerSuccess('');

      await proveedorService.eliminar(selectedDelete.idProveedor);

      handleCloseDeleteDialog();
      await cargarProveedores();
      setServerSuccess('Proveedor inactivado correctamente.');
    } catch (error) {

      const message =
        error?.response?.data?.message ||
        error?.response?.data ||
        'No se pudo inactivar el proveedor.';

      setServerError(
        typeof message === 'string'
          ? message
          : 'No se pudo inactivar el proveedor.'
      );
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

  // Ordena proveedores activos primero para que el listado sea mas util en operacion.
  const proveedoresOrdenados = React.useMemo(() => {
    return [...proveedores].sort(
      (a, b) => Number(b.idProveedor) - Number(a.idProveedor)
    );
  }, [proveedores]);

  // Busqueda local por datos comerciales y bancarios del proveedor.
  const proveedoresFiltrados = React.useMemo(() => {
    const criterio = searchTerm.trim().toLowerCase();

    if (!criterio) return proveedoresOrdenados;

    return proveedoresOrdenados.filter((proveedor) => {
      const valoresBusqueda = [
        formatCodigo('PROV', proveedor.idProveedor),
        proveedor.ruc,
        proveedor.razonSocial,
        proveedor.nombreTipoProveedor,
        proveedor.direccion,
        proveedor.departamento,
        proveedor.provincia,
        proveedor.telefono,
        proveedor.representante,
      ];

      return valoresBusqueda.some((value) =>
        String(value || '').toLowerCase().includes(criterio)
      );
    });
  }, [proveedoresOrdenados, searchTerm]);

  const proveedoresPaginados = React.useMemo(() => {
    const inicio = page * rowsPerPage;
    const fin = inicio + rowsPerPage;
    return proveedoresFiltrados.slice(inicio, fin);
  }, [proveedoresFiltrados, page, rowsPerPage]);

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
                Gestiona, edita e inactiva proveedores.
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
              Nuevo proveedor
            </Button>
          </Stack>

          <TextField
            fullWidth
            size="small"
            placeholder="Buscar proveedor por código, RUC, razón social, tipo, dirección, departamento, provincia, teléfono o contacto..."
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

          {serverSuccess ? (
            <Alert severity="success" sx={{ mb: 2 }}>
              {serverSuccess}
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
                  <TableCell sx={{ fontWeight: 700 }}>CÓDIGO</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>RUC</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>TIPO PROVEEDOR</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>RAZÓN SOCIAL</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>DIRECCIÓN</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>DEPARTAMENTO</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>PROVINCIA</TableCell>
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
                    <TableCell colSpan={14} align="center" sx={{ py: 4 }}>
                      <CircularProgress size={28} />
                    </TableCell>
                  </TableRow>
                ) : proveedores.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={14} align="center" sx={{ py: 4, color: '#64748b' }}>
                      No hay proveedores registrados.
                    </TableCell>
                  </TableRow>
                ) : proveedoresFiltrados.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={14} align="center" sx={{ py: 4, color: '#64748b' }}>
                      No se encontraron proveedores con ese criterio.
                    </TableCell>
                  </TableRow>
                ) : (
                  proveedoresPaginados.map((proveedor) => (
                    <TableRow key={proveedor.idProveedor} hover>
                      <TableCell>{formatCodigo('PROV', proveedor.idProveedor)}</TableCell>
                      <TableCell>{proveedor.ruc}</TableCell>
                      <TableCell>{proveedor.nombreTipoProveedor || '-'}</TableCell>
                      <TableCell>{proveedor.razonSocial}</TableCell>
                      <TableCell>{proveedor.direccion}</TableCell>
                      <TableCell>{proveedor.departamento || '-'}</TableCell>
                      <TableCell>{proveedor.provincia || '-'}</TableCell>
                      <TableCell>{proveedor.telefono || '-'}</TableCell>
                      <TableCell>{proveedor.representante || '-'}</TableCell>
                      <TableCell>{proveedor.nombreBanco || '-'}</TableCell>
                      <TableCell>{proveedor.cuentaBancaria || '-'}</TableCell>
                      <TableCell>{proveedor.cuentaInterbancaria || '-'}</TableCell>
                      <TableCell>
                        <Chip
                          label={proveedor.flgActivo ? 'Activo' : 'Inactivo'}
                          size="small"
                          sx={{
                            fontWeight: 700,
                            ...getEstadoChipStyles(proveedor.flgActivo),
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

            {!loading && proveedoresFiltrados.length > 0 ? (
              <TablePagination
                component="div"
                count={proveedoresFiltrados.length}
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

      <ModalProveedor
        open={open}
        onClose={handleClose}
        editing={editing}
        form={form}
        errors={errors}
        saving={saving}
        serverError={serverError}
        serverSuccess={serverSuccess}
        tiposProveedor={tiposProveedor}
        bancos={bancos}
        onChange={handleChange}
        onSubmit={handleSubmit}
      />

      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle sx={{ fontWeight: 700 }}>Confirmar inactivación</DialogTitle>

        <DialogContent>
          <Typography sx={{ color: '#475569' }}>
            ¿Seguro que deseas inactivar este proveedor?
          </Typography>

          {selectedDelete ? (
            <Typography sx={{ mt: 1, fontWeight: 700, color: '#0f172a' }}>
              {selectedDelete.razonSocial}
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
