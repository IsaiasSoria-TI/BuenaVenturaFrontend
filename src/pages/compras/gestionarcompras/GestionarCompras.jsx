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
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TablePagination,
} from '@mui/material';

import { compraService } from '../../../services/compraService';
import { proveedorService } from '../../../services/proveedorService';
import { articuloService } from '../../../services/articuloService';
import { impuestoService } from '../../../services/impuestoService';
import { pagoService } from '../../../services/pagoService';

import ModalGestionarCompras from './ModalGestionarCompras';

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

const initialForm = {
  idCompras: null,
  idImpuesto: '',
  idPago: '',
  idProveedor: null,
  idArticulo: '',
  fechaCompras: '',
  zonaProduccion: '',
  hectareas: '',
  peso: '',
  costoKilo: '',
};

function formatDateTimeForInput(value) {
  if (!value) return '';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const pad = (n) => String(n).padStart(2, '0');

  const yyyy = date.getFullYear();
  const mm = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  const hh = pad(date.getHours());
  const mi = pad(date.getMinutes());

  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

function formatDateTimeForTable(value) {
  if (!value) return '-';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value).replace('T', ' ').slice(0, 16);
  }

  return date.toLocaleString();
}

export default function GestionarCompras() {
  const [compras, setCompras] = React.useState([]);
  const [proveedores, setProveedores] = React.useState([]);
  const [articulos, setArticulos] = React.useState([]);
  const [impuestos, setImpuestos] = React.useState([]);
  const [pagos, setPagos] = React.useState([]);

  const [loading, setLoading] = React.useState(true);
  const [catalogLoading, setCatalogLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState(false);

  const [form, setForm] = React.useState(initialForm);
  const [errors, setErrors] = React.useState({});

  const [selectedProveedor, setSelectedProveedor] = React.useState(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [selectedDelete, setSelectedDelete] = React.useState(null);

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);

  const cargarCompras = React.useCallback(async () => {
    try {
      setLoading(true);
      const data = await compraService.listar();
      setCompras(Array.isArray(data) ? data : []);
      setPage(0);
    } catch (error) {
      console.error('Error al listar compras:', error);
      console.error('status:', error?.response?.status);
      console.error('data:', error?.response?.data);
    } finally {
      setLoading(false);
    }
  }, []);

  const cargarCatalogos = React.useCallback(async () => {
    try {
      setCatalogLoading(true);

      const [
        proveedoresData,
        articulosData,
        impuestosData,
        pagosData,
      ] = await Promise.all([
        proveedorService.listar(),
        articuloService.listar(),
        impuestoService.listar(),
        pagoService.listar(),
      ]);

      setProveedores(proveedoresData);
      setArticulos(articulosData);
      setImpuestos(impuestosData);
      setPagos(pagosData);
    } catch (error) {
      console.error('Error al cargar catálogos:', error);
      console.error('status:', error?.response?.status);
      console.error('data:', error?.response?.data);
    } finally {
      setCatalogLoading(false);
    }
  }, []);

  React.useEffect(() => {
    cargarCompras();
    cargarCatalogos();
  }, [cargarCompras, cargarCatalogos]);

  const handleOpenCreate = () => {
    setEditing(false);
    setForm(initialForm);
    setSelectedProveedor(null);
    setErrors({});
    setOpen(true);
  };

  const handleOpenEdit = (compra) => {
    const proveedorEncontrado =
      proveedores.find((p) => p.idProveedor === compra.idProveedor) || null;

    setEditing(true);
    setErrors({});
    setForm({
      idCompras: compra.idCompras,
      idImpuesto: compra.idImpuesto ?? '',
      idPago: compra.idPago ?? '',
      idProveedor: compra.idProveedor ?? null,
      idArticulo: compra.idArticulo ?? '',
      fechaCompras: formatDateTimeForInput(compra.fechaCompras),
      zonaProduccion: compra.zonaProduccion || '',
      hectareas: compra.hectareas ?? '',
      peso: compra.peso ?? '',
      costoKilo: compra.costoKilo ?? '',
    });
    setSelectedProveedor(proveedorEncontrado);
    setOpen(true);
  };

  const handleClose = () => {
    if (saving) return;
    setOpen(false);
    setForm(initialForm);
    setSelectedProveedor(null);
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

    if (!form.idImpuesto) {
      newErrors.idImpuesto = 'Seleccione un impuesto';
    }

    if (!form.idPago) {
      newErrors.idPago = 'Seleccione una condición de pago';
    }

    if (!form.idProveedor) {
      newErrors.idProveedor = 'Seleccione un proveedor';
    }

    if (!form.idArticulo) {
      newErrors.idArticulo = 'Seleccione un artículo';
    }

    if (!form.fechaCompras) {
      newErrors.fechaCompras = 'La fecha de compra es obligatoria';
    }

    if (!form.zonaProduccion.trim()) {
      newErrors.zonaProduccion = 'La zona de producción es obligatoria';
    }

    if (form.hectareas === '' || Number(form.hectareas) < 0) {
      newErrors.hectareas = 'Las hectáreas deben ser 0 o mayores';
    }

    if (form.peso === '' || Number(form.peso) <= 0) {
      newErrors.peso = 'El peso debe ser mayor a 0';
    }

    if (form.costoKilo === '' || Number(form.costoKilo) <= 0) {
      newErrors.costoKilo = 'El costo por kilo debe ser mayor a 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const buildPayload = () => ({
    idImpuesto: Number(form.idImpuesto),
    idPago: Number(form.idPago),
    idProveedor: Number(form.idProveedor),
    idArticulo: Number(form.idArticulo),
    fechaCompras: form.fechaCompras,
    zonaProduccion: form.zonaProduccion.trim(),
    hectareas: Number(form.hectareas),
    peso: Number(form.peso),
    costoKilo: Number(form.costoKilo),
  });

  const impuestoSeleccionado =
    impuestos.find((item) => item.idImpuesto === Number(form.idImpuesto)) || null;

  const costoTotalPreview =
    form.peso !== '' && form.costoKilo !== ''
      ? (Number(form.peso) * Number(form.costoKilo)).toFixed(2)
      : '0.00';

  const importeImpuestoPreview =
    impuestoSeleccionado
      ? ((Number(costoTotalPreview) * Number(impuestoSeleccionado.valor || 0)) / 100).toFixed(2)
      : '0.00';

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      setSaving(true);
      const payload = buildPayload();

      if (editing && form.idCompras) {
        await compraService.actualizar(form.idCompras, payload);
      } else {
        await compraService.crear(payload);
      }

      handleClose();
      await cargarCompras();
    } catch (error) {
      console.error('Error al guardar compra:', error);
      console.error('status:', error?.response?.status);
      console.error('data:', error?.response?.data);
    } finally {
      setSaving(false);
    }
  };

  const handleOpenDeleteDialog = (compra) => {
    setSelectedDelete(compra);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setSelectedDelete(null);
    setDeleteDialogOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (!selectedDelete?.idCompras) return;

    try {
      await compraService.eliminar(selectedDelete.idCompras);
      handleCloseDeleteDialog();
      await cargarCompras();
    } catch (error) {
      console.error('Error al eliminar compra:', error);
      console.error('status:', error?.response?.status);
      console.error('data:', error?.response?.data);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const comprasPaginadas = React.useMemo(() => {
    const inicio = page * rowsPerPage;
    const fin = inicio + rowsPerPage;
    return compras.slice(inicio, fin);
  }, [compras, page, rowsPerPage]);

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
                Gestionar compras
              </Typography>
              <Typography sx={{ fontSize: '0.86rem', color: '#64748b', mt: 0.5 }}>
                Registra, edita y elimina compras.
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
              Nueva compra
            </Button>
          </Stack>

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
                  <TableCell sx={{ fontWeight: 700 }}>FECHA</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>RUC</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>PROVEEDOR</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>ARTÍCULO</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>PESO</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>COSTO TOTAL</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>ESTADO</TableCell>
                  <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>ACCIONES</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                      <CircularProgress size={28} />
                    </TableCell>
                  </TableRow>
                ) : compras.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 4, color: '#64748b' }}>
                      No hay compras registradas.
                    </TableCell>
                  </TableRow>
                ) : (
                  comprasPaginadas.map((compra) => (
                    <TableRow key={compra.idCompras} hover>
                      <TableCell>{compra.idCompras}</TableCell>
                      <TableCell>{formatDateTimeForTable(compra.fechaCompras)}</TableCell>
                      <TableCell>{compra.ruc}</TableCell>
                      <TableCell>{compra.razonSocial}</TableCell>
                      <TableCell>{compra.descripcionArticulo}</TableCell>
                      <TableCell>{compra.peso}</TableCell>
                      <TableCell>{compra.costoTotal}</TableCell>
                      <TableCell>
                        <Chip
                          label={compra.estado}
                          size="small"
                          sx={{
                            fontWeight: 700,
                            backgroundColor:
                              compra.estado === 'Completo'
                                ? '#dcfce7'
                                : compra.estado === 'Pendiente'
                                  ? '#fef3c7'
                                  : '#fee2e2',
                            color:
                              compra.estado === 'Completo'
                                ? '#16a34a'
                                : compra.estado === 'Pendiente'
                                  ? '#d97706'
                                  : '#dc2626',
                          }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton onClick={() => handleOpenEdit(compra)}>
                          <Icon name="edit" size={20} color="#1976d2" />
                        </IconButton>
                        <IconButton onClick={() => handleOpenDeleteDialog(compra)}>
                          <Icon name="delete" size={20} color="#ef4444" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {!loading && compras.length > 0 && (
              <TablePagination
                component="div"
                count={compras.length}
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

      <ModalGestionarCompras
        open={open}
        onClose={handleClose}
        editing={editing}
        saving={saving}
        catalogLoading={catalogLoading}
        form={form}
        errors={errors}
        proveedores={proveedores}
        articulos={articulos}
        impuestos={impuestos}
        pagos={pagos}
        selectedProveedor={selectedProveedor}
        setSelectedProveedor={setSelectedProveedor}
        setForm={setForm}
        setErrors={setErrors}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        costoTotalPreview={costoTotalPreview}
        importeImpuestoPreview={importeImpuestoPreview}
      />

      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle sx={{ fontWeight: 700 }}>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: '#475569' }}>
            ¿Seguro que deseas eliminar esta compra?
          </Typography>
          {selectedDelete && (
            <Typography sx={{ mt: 1, fontWeight: 700, color: '#0f172a' }}>
              Compra #{selectedDelete.idCompras} - {selectedDelete.razonSocial}
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