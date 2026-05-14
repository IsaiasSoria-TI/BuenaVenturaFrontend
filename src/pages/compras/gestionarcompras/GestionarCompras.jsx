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
  Tooltip,
  Typography,
} from '@mui/material';

import { compraService } from '../../../services/compraService';
import { proveedorService } from '../../../services/proveedorService';
import { articuloService } from '../../../services/articuloService';
import { impuestoService } from '../../../services/impuestoService';
import { pagoService } from '../../../services/pagoService';
import { monedaService } from '../../../services/monedaService';
import { tipoCambioService } from '../../../services/tipoCambioService';

import ModalDetalleCompra from './ModalDetalleCompra';
import ModalGestionarCompras from './ModalGestionarCompras';
import {
  formatCompraCode,
  formatDateTimeInputPeru,
  formatDateTimePeru,
} from '../../../utils/formatters';
import {
  DEFAULT_IGV_PERCENTAGE,
  calcularCompraPreview,
  formatNumber,
  getCompraIgv,
  getCompraImporteImpuestos,
  getCompraSubtotal,
  getCompraTotalFinal,
  getDefaultMonedaId,
  isIgvImpuesto,
} from './compraCalculations';

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

const createDetalle = () => ({
  tempId: Math.random().toString(36).substring(2) + Date.now(),
  idArticulo: '',
  peso: '',
  costoKilo: '',
});

const createImpuesto = () => ({
  tempId: Math.random().toString(36).substring(2) + Date.now(),
  idImpuesto: '',
});

const initialForm = {
  idCompras: null,
  idPago: '',
  idMoneda: '',
  idTipoCambio: null,
  tipoCambioAplicado: '',
  idProveedor: null,
  fechaCompras: '',
  zonaProduccion: '',
  numeroLote: '',
  detalles: [createDetalle()],
  impuestos: [createImpuesto()],
  aplicaIgv: false,
  porcentajeIgv: DEFAULT_IGV_PERCENTAGE,
  importeIgv: 0,
};

function getEstadoChipStyles(estado) {
  if (estado === 'Inactivo') {
    return {
      backgroundColor: '#f1f5f9',
      color: '#64748b',
    };
  }

  if (estado === 'Completo') {
    return {
      backgroundColor: '#dcfce7',
      color: '#16a34a',
    };
  }

  if (estado === 'Completa parcial') {
    return {
      backgroundColor: '#dbeafe',
      color: '#2563eb',
    };
  }

  if (estado === 'Pendiente') {
    return {
      backgroundColor: '#fef3c7',
      color: '#d97706',
    };
  }

  return {
    backgroundColor: '#fee2e2',
    color: '#dc2626',
  };
}

function getEstadoCompra(compra) {
  if (compra?.flgActivo === false) return 'Inactivo';
  return compra?.estado || '-';
}

function isMonedaSoles(moneda) {
  const codigo = String(moneda?.codigo || '').trim().toUpperCase();
  const nombre = String(moneda?.nombre || '').trim().toUpperCase();
  return codigo === 'PEN' || codigo === 'SOL' || nombre === 'SOLES' || nombre === 'SOL';
}

function getFechaTipoCambio(fechaCompras) {
  return fechaCompras ? String(fechaCompras).slice(0, 10) : '';
}

export default function GestionarCompras() {
  const [compras, setCompras] = React.useState([]);
  const [proveedores, setProveedores] = React.useState([]);
  const [articulos, setArticulos] = React.useState([]);
  const [impuestos, setImpuestos] = React.useState([]);
  const [pagos, setPagos] = React.useState([]);
  const [monedas, setMonedas] = React.useState([]);

  const [loading, setLoading] = React.useState(true);
  const [catalogLoading, setCatalogLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [tipoCambioLoading, setTipoCambioLoading] = React.useState(false);

  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState(false);

  const [form, setForm] = React.useState(initialForm);
  const [tipoCambioBase, setTipoCambioBase] = React.useState(null);
  const [errors, setErrors] = React.useState({});
  const [selectedProveedor, setSelectedProveedor] = React.useState(null);

  const [serverError, setServerError] = React.useState('');
  const [successMessage, setSuccessMessage] = React.useState('');

  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [selectedDelete, setSelectedDelete] = React.useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = React.useState(false);
  const [selectedDetail, setSelectedDetail] = React.useState(null);

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [searchTerm, setSearchTerm] = React.useState('');

  const cargarCompras = React.useCallback(async () => {
    try {
      setLoading(true);
      setServerError('');

      const data = await compraService.listar();
      setCompras(Array.isArray(data) ? data : []);
      setPage(0);
    } catch (error) {
      console.error('Error al listar compras:', error);
      console.error('status:', error?.response?.status);
      console.error('data:', error?.response?.data);

      const message =
        error?.response?.data?.message ||
        error?.response?.data ||
        'No se pudo listar las compras.';

      setServerError(typeof message === 'string' ? message : 'No se pudo listar las compras.');
    } finally {
      setLoading(false);
    }
  }, []);

  const cargarCatalogos = React.useCallback(async () => {
    try {
      setCatalogLoading(true);

      const [proveedoresData, articulosData, impuestosData, pagosData, monedasData] = await Promise.all([
        proveedorService.listar(),
        articuloService.listar(),
        impuestoService.listar(),
        pagoService.listar(),
        monedaService.listar(),
      ]);

      setProveedores(Array.isArray(proveedoresData) ? proveedoresData : []);
      setArticulos(Array.isArray(articulosData) ? articulosData : []);
      setImpuestos(Array.isArray(impuestosData) ? impuestosData.filter((item) => !isIgvImpuesto(item)) : []);
      setPagos(Array.isArray(pagosData) ? pagosData : []);
      setMonedas(Array.isArray(monedasData) ? monedasData : []);
    } catch (error) {
      console.error('Error al cargar catálogos:', error);
      console.error('status:', error?.response?.status);
      console.error('data:', error?.response?.data);
      setServerError('No se pudieron cargar los catálogos.');
    } finally {
      setCatalogLoading(false);
    }
  }, []);

  React.useEffect(() => {
    cargarCompras();
    cargarCatalogos();
  }, [cargarCompras, cargarCatalogos]);

  React.useEffect(() => {
    if (!open) return undefined;

    const monedaSeleccionada = monedas.find((moneda) => moneda.idMoneda === Number(form.idMoneda));
    const fechaTipoCambio = getFechaTipoCambio(form.fechaCompras);

    if (!monedaSeleccionada || !fechaTipoCambio) {
      setForm((prev) => ({
        ...prev,
        idTipoCambio: null,
        tipoCambioAplicado: '',
      }));
      setTipoCambioLoading(false);
      return undefined;
    }

    if (isMonedaSoles(monedaSeleccionada)) {
      setForm((prev) => ({
        ...prev,
        idTipoCambio: null,
        tipoCambioAplicado: '',
      }));
      setErrors((prev) => ({ ...prev, tipoCambioAplicado: '' }));
      setTipoCambioLoading(false);
      return undefined;
    }

    if (
      editing &&
      tipoCambioBase &&
      tipoCambioBase.idMoneda === Number(form.idMoneda) &&
      tipoCambioBase.fecha === fechaTipoCambio &&
      form.tipoCambioAplicado
    ) {
      setErrors((prev) => ({ ...prev, tipoCambioAplicado: '' }));
      setTipoCambioLoading(false);
      return undefined;
    }

    let cancelled = false;
    setTipoCambioLoading(true);

    tipoCambioService.buscarAplicable(fechaTipoCambio)
      .then((data) => {
        if (cancelled) return;

        setForm((prev) => {
          if (
            Number(prev.idMoneda) !== Number(form.idMoneda) ||
            getFechaTipoCambio(prev.fechaCompras) !== fechaTipoCambio
          ) {
            return prev;
          }

          return {
            ...prev,
            idTipoCambio: data.idTipoCambio ?? null,
            tipoCambioAplicado: data.valor ?? '',
          };
        });
        setErrors((prev) => ({ ...prev, tipoCambioAplicado: '' }));
      })
      .catch((error) => {
        if (cancelled) return;
        const message =
          error?.response?.data?.message ||
          error?.response?.data ||
          'No existe tipo de cambio registrado para la fecha seleccionada.';

        setForm((prev) => ({
          ...prev,
          idTipoCambio: null,
          tipoCambioAplicado: '',
        }));
        setErrors((prev) => ({
          ...prev,
          tipoCambioAplicado: typeof message === 'string'
            ? message
            : 'No existe tipo de cambio registrado para la fecha seleccionada.',
        }));
      })
      .finally(() => {
        if (!cancelled) {
          setTipoCambioLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [
    editing,
    form.fechaCompras,
    form.idMoneda,
    form.tipoCambioAplicado,
    monedas,
    open,
    tipoCambioBase,
  ]);

  const handleOpenCreate = () => {
    setEditing(false);
    setForm({
      ...initialForm,
      idMoneda: getDefaultMonedaId(monedas),
      idTipoCambio: null,
      tipoCambioAplicado: '',
      detalles: [createDetalle()],
      impuestos: [createImpuesto()],
    });
    setTipoCambioBase(null);
    setSelectedProveedor(null);
    setErrors({});
    setServerError('');
    setSuccessMessage('');
    setOpen(true);
  };

  const handleOpenEdit = (compra) => {
    const proveedorEncontrado =
      proveedores.find((proveedor) => proveedor.idProveedor === compra.idProveedor) || null;

    const detalles =
      Array.isArray(compra.detalles) && compra.detalles.length > 0
        ? compra.detalles.map((detalle) => ({
          tempId: Math.random().toString(36).substring(2) + Date.now(),
          idArticulo: detalle.idArticulo ?? '',
          peso: detalle.peso ?? '',
          costoKilo: detalle.costoKilo ?? '',
        }))
        : [
          {
            tempId: Math.random().toString(36).substring(2) + Date.now(),
            idArticulo: compra.idArticulo ?? '',
            peso: compra.peso ?? '',
            costoKilo: compra.costoKilo ?? '',
          },
        ];

    const impuestosNormalesCompra = Array.isArray(compra.impuestos)
      ? compra.impuestos.filter((impuesto) => !isIgvImpuesto(impuesto))
      : [];

    const impuestosCompra =
      impuestosNormalesCompra.length > 0
        ? impuestosNormalesCompra.map((impuesto) => ({
          tempId: Math.random().toString(36).substring(2) + Date.now(),
          idImpuesto: impuesto.idImpuesto ?? '',
        }))
        : [createImpuesto()];

    setEditing(true);
    setErrors({});
    setServerError('');
    setSuccessMessage('');
    setSelectedProveedor(proveedorEncontrado);
    const fechaCompras = formatDateTimeInputPeru(compra.fechaCompras);
    setTipoCambioBase({
      idMoneda: compra.idMoneda ?? getDefaultMonedaId(monedas),
      fecha: getFechaTipoCambio(fechaCompras),
    });
    setForm({
      idCompras: compra.idCompras,
      idPago: compra.idPago ?? '',
      idMoneda: compra.idMoneda ?? getDefaultMonedaId(monedas),
      idTipoCambio: compra.idTipoCambio ?? null,
      tipoCambioAplicado: compra.tipoCambioAplicado ?? '',
      idProveedor: compra.idProveedor ?? null,
      fechaCompras,
      zonaProduccion: compra.zonaProduccion || '',
      numeroLote: compra.numeroLote ?? '',
      detalles,
      impuestos: impuestosCompra,
      aplicaIgv: Boolean(compra.aplicaIgv),
      porcentajeIgv: compra.porcentajeIgv ?? DEFAULT_IGV_PERCENTAGE,
      importeIgv: compra.importeIgv ?? 0,
    });
    setOpen(true);
  };

  const handleClose = () => {
    if (saving) return;

    setOpen(false);
    setTipoCambioBase(null);
    setForm({
      ...initialForm,
      idTipoCambio: null,
      tipoCambioAplicado: '',
      detalles: [createDetalle()],
      impuestos: [createImpuesto()],
    });
    setSelectedProveedor(null);
    setErrors({});
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

    if (successMessage) {
      setSuccessMessage('');
    }
  };

  const handleIgvChange = (event) => {
    const { checked } = event.target;

    setForm((prev) => ({
      ...prev,
      aplicaIgv: checked,
      porcentajeIgv: prev.porcentajeIgv === '' ? DEFAULT_IGV_PERCENTAGE : prev.porcentajeIgv,
    }));

    if (errors.porcentajeIgv) {
      setErrors((prev) => ({
        ...prev,
        porcentajeIgv: '',
      }));
    }

    if (serverError) {
      setServerError('');
    }

    if (successMessage) {
      setSuccessMessage('');
    }
  };

  const handleDetalleChange = (index, field, value) => {
    setForm((prev) => ({
      ...prev,
      detalles: prev.detalles.map((detalle, detalleIndex) =>
        detalleIndex === index ? { ...detalle, [field]: value } : detalle
      ),
    }));

    const errorKey = `detalle_${index}_${field}`;
    if (errors[errorKey]) {
      setErrors((prev) => ({
        ...prev,
        [errorKey]: '',
      }));
    }
  };

  const handleAddDetalle = () => {
    setForm((prev) => ({
      ...prev,
      detalles: [...prev.detalles, createDetalle()],
    }));
  };

  const handleRemoveDetalle = (index) => {
    setForm((prev) => {
      if (prev.detalles.length === 1) return prev;

      return {
        ...prev,
        detalles: prev.detalles.filter((_, detalleIndex) => detalleIndex !== index),
      };
    });
  };

  const handleImpuestoChange = (index, field, value) => {
    setForm((prev) => ({
      ...prev,
      impuestos: prev.impuestos.map((impuesto, impuestoIndex) =>
        impuestoIndex === index ? { ...impuesto, [field]: value } : impuesto
      ),
    }));

    const errorKey = `impuesto_${index}_${field}`;
    if (errors[errorKey]) {
      setErrors((prev) => ({
        ...prev,
        [errorKey]: '',
      }));
    }
  };

  const handleAddImpuesto = () => {
    setForm((prev) => ({
      ...prev,
      impuestos: [...prev.impuestos, createImpuesto()],
    }));
  };

  const handleRemoveImpuesto = (index) => {
    setForm((prev) => {
      if (prev.impuestos.length === 1) return prev;

      return {
        ...prev,
        impuestos: prev.impuestos.filter((_, impuestoIndex) => impuestoIndex !== index),
      };
    });
  };

  const { subtotalPreview, igvPreview, totalGeneralPreview } = React.useMemo(
    () => calcularCompraPreview(form),
    [form]
  );

  const validate = () => {
    const newErrors = {};

    if (!form.idPago) {
      newErrors.idPago = 'Seleccione una condición de pago';
    }

    if (!form.idMoneda || !monedas.some((moneda) => moneda.idMoneda === Number(form.idMoneda))) {
      newErrors.idMoneda = 'Seleccione una moneda';
    }

    const monedaSeleccionada = monedas.find((moneda) => moneda.idMoneda === Number(form.idMoneda));
    if (monedaSeleccionada && !isMonedaSoles(monedaSeleccionada) && !form.tipoCambioAplicado) {
      newErrors.tipoCambioAplicado = 'No existe tipo de cambio registrado para la fecha seleccionada.';
    }

    if (!form.idProveedor) {
      newErrors.idProveedor = 'Seleccione un proveedor';
    }

    if (!form.fechaCompras) {
      newErrors.fechaCompras = 'La fecha de compra es obligatoria';
    }

    if (!form.zonaProduccion.trim()) {
      newErrors.zonaProduccion = 'La zona de producción es obligatoria';
    }

    if (form.numeroLote === '' || Number(form.numeroLote) < 0) {
      newErrors.numeroLote = 'El número de lotes debe ser 0 o mayor';
    }

    if (!form.detalles.length) {
      newErrors.detalles = 'Debe agregar al menos un artículo';
    }

    form.detalles.forEach((detalle, index) => {
      if (!detalle.idArticulo) {
        newErrors[`detalle_${index}_idArticulo`] = 'Seleccione un artículo';
      }

      if (detalle.peso === '' || Number(detalle.peso) <= 0) {
        newErrors[`detalle_${index}_peso`] = 'El peso debe ser mayor a 0';
      }

      if (detalle.costoKilo === '' || Number(detalle.costoKilo) <= 0) {
        newErrors[`detalle_${index}_costoKilo`] = 'El costo debe ser mayor a 0';
      }
    });

    form.impuestos.forEach((impuesto, index) => {
      if (impuesto.idImpuesto && !impuestos.some((item) => item.idImpuesto === Number(impuesto.idImpuesto))) {
        newErrors[`impuesto_${index}_idImpuesto`] = 'Seleccione un impuesto';
      }
    });

    if (
      form.aplicaIgv &&
      (form.porcentajeIgv === '' || Number(form.porcentajeIgv) < 0 || Number.isNaN(Number(form.porcentajeIgv)))
    ) {
      newErrors.porcentajeIgv = 'El porcentaje de IGV debe ser 0 o mayor';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const buildPayload = () => ({
    idPago: Number(form.idPago),
    idMoneda: Number(form.idMoneda),
    idTipoCambio: form.idTipoCambio ? Number(form.idTipoCambio) : null,
    tipoCambioAplicado: form.tipoCambioAplicado ? Number(form.tipoCambioAplicado) : null,
    idProveedor: Number(form.idProveedor),
    fechaCompras: form.fechaCompras,
    zonaProduccion: form.zonaProduccion.trim(),
    numeroLote: Number(form.numeroLote),
    detalles: form.detalles.map((detalle) => ({
      idArticulo: Number(detalle.idArticulo),
      peso: Number(detalle.peso),
      costoKilo: Number(detalle.costoKilo),
    })),
    impuestos: form.impuestos
      .filter((impuesto) => impuesto.idImpuesto)
      .map((impuesto) => ({
        idImpuesto: Number(impuesto.idImpuesto),
      })),
    aplicaIgv: Boolean(form.aplicaIgv),
    porcentajeIgv: Number(form.porcentajeIgv || DEFAULT_IGV_PERCENTAGE),
  });

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      setSaving(true);
      setServerError('');
      setSuccessMessage('');

      const payload = buildPayload();

      if (editing && form.idCompras) {
        await compraService.actualizar(form.idCompras, payload);
        setSuccessMessage('Compra actualizada correctamente.');
      } else {
        await compraService.crear(payload);
        setSuccessMessage('Compra registrada correctamente.');
      }

      handleClose();
      await cargarCompras();
    } catch (error) {
      console.error('Error al guardar compra:', error);
      console.error('status:', error?.response?.status);
      console.error('data:', error?.response?.data);

      const message =
        error?.response?.data?.message ||
        error?.response?.data ||
        'No se pudo guardar la compra.';

      setServerError(typeof message === 'string' ? message : 'No se pudo guardar la compra.');
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

  const handleOpenDetailDialog = (compra) => {
    setSelectedDetail(compra);
    setDetailDialogOpen(true);
  };

  const handleCloseDetailDialog = () => {
    setDetailDialogOpen(false);
    setSelectedDetail(null);
  };

  const handleConfirmDelete = async () => {
    if (!selectedDelete?.idCompras) return;

    try {
      setServerError('');
      setSuccessMessage('');

      await compraService.eliminar(selectedDelete.idCompras);
      setSuccessMessage('Compra inactivada correctamente.');
      handleCloseDeleteDialog();
      await cargarCompras();
    } catch (error) {
      console.error('Error al inactivar compra:', error);
      console.error('status:', error?.response?.status);
      console.error('data:', error?.response?.data);

      const message =
        error?.response?.data?.message ||
        error?.response?.data ||
        'No se pudo inactivar la compra.';

      setServerError(typeof message === 'string' ? message : 'No se pudo inactivar la compra.');
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

  const comprasFiltradas = React.useMemo(() => {
    const criterio = searchTerm.trim().toLowerCase();

    if (!criterio) return compras;

    return compras.filter((compra) => {
      const valoresBusqueda = [
        formatCompraCode(compra.idCompras),
        compra.idCompras,
        formatDateTimePeru(compra.fechaCompras),
        compra.fechaCompras,
        compra.ruc,
        compra.razonSocial,
        getEstadoCompra(compra),
      ];

      return valoresBusqueda.some((value) =>
        String(value || '').toLowerCase().includes(criterio)
      );
    });
  }, [compras, searchTerm]);

  const comprasPaginadas = React.useMemo(() => {
    const inicio = page * rowsPerPage;
    const fin = inicio + rowsPerPage;
    return comprasFiltradas.slice(inicio, fin);
  }, [comprasFiltradas, page, rowsPerPage]);

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
                Registra compras con múltiples artículos e impuestos.
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

          <TextField
            fullWidth
            size="small"
            placeholder="Buscar por código, RUC, proveedor, fecha, estado..."
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
            sx={{
              border: '1px solid #e2e8f0',
              borderRadius: 2.5,
              overflowX: 'auto',
            }}
          >
            <Table sx={{ minWidth: 1180 }}>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f8fafc' }}>
                  <TableCell sx={{ fontWeight: 700 }}>CÓDIGO</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>FECHA</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>RUC</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>PROVEEDOR</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="right">SUBTOTAL</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="right">IGV</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="right">RET./DET. REF.</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="right">PESO TOTAL</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="right">TOTAL FINAL</TableCell>
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
                ) : compras.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} align="center" sx={{ py: 4, color: '#64748b' }}>
                      No hay compras registradas.
                    </TableCell>
                  </TableRow>
                ) : comprasFiltradas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} align="center" sx={{ py: 4, color: '#64748b' }}>
                      No se encontraron compras con ese criterio.
                    </TableCell>
                  </TableRow>
                ) : (
                  comprasPaginadas.map((compra) => (
                    <TableRow key={compra.idCompras} hover>
                      <TableCell>{formatCompraCode(compra.idCompras)}</TableCell>
                      <TableCell>{formatDateTimePeru(compra.fechaCompras)}</TableCell>
                      <TableCell>{compra.ruc}</TableCell>
                      <TableCell>{compra.razonSocial}</TableCell>
                      <TableCell align="right">{formatNumber(getCompraSubtotal(compra))}</TableCell>
                      <TableCell align="right">{formatNumber(getCompraIgv(compra))}</TableCell>
                      <TableCell align="right">{formatNumber(getCompraImporteImpuestos(compra))}</TableCell>
                      <TableCell align="right">{formatNumber(compra.peso)}</TableCell>
                      <TableCell align="right">{formatNumber(getCompraTotalFinal(compra))}</TableCell>
                      <TableCell>
                        <Chip
                          label={getEstadoCompra(compra)}
                          size="small"
                          sx={{
                            fontWeight: 700,
                            ...getEstadoChipStyles(getEstadoCompra(compra)),
                          }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Ver detalle">
                          <IconButton onClick={() => handleOpenDetailDialog(compra)}>
                            <Icon name="visibility" size={20} color="#0f766e" />
                          </IconButton>
                        </Tooltip>
                        <IconButton
                          onClick={() => handleOpenEdit(compra)}
                          disabled={compra.flgActivo === false}
                        >
                          <Icon name="edit" size={20} color="#1976d2" />
                        </IconButton>
                        <IconButton
                          onClick={() => handleOpenDeleteDialog(compra)}
                          disabled={compra.flgActivo === false}
                        >
                          <Icon name="delete" size={20} color="#ef4444" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {!loading && comprasFiltradas.length > 0 ? (
              <TablePagination
                component="div"
                count={comprasFiltradas.length}
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
        monedas={monedas}
        selectedProveedor={selectedProveedor}
        setSelectedProveedor={setSelectedProveedor}
        setForm={setForm}
        setErrors={setErrors}
        handleChange={handleChange}
        handleIgvChange={handleIgvChange}
        handleSubmit={handleSubmit}
        handleDetalleChange={handleDetalleChange}
        handleAddDetalle={handleAddDetalle}
        handleRemoveDetalle={handleRemoveDetalle}
        handleImpuestoChange={handleImpuestoChange}
        handleAddImpuesto={handleAddImpuesto}
        handleRemoveImpuesto={handleRemoveImpuesto}
        tipoCambioLoading={tipoCambioLoading}
        subtotalPreview={subtotalPreview}
        igvPreview={igvPreview}
        totalGeneralPreview={totalGeneralPreview}
      />

      <ModalDetalleCompra
        open={detailDialogOpen}
        onClose={handleCloseDetailDialog}
        compra={selectedDetail}
      />

      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle sx={{ fontWeight: 700 }}>Confirmar inactivación</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: '#475569' }}>
            ¿Seguro que deseas inactivar esta compra?
          </Typography>
          {selectedDelete ? (
            <Typography sx={{ mt: 1, fontWeight: 700, color: '#0f172a' }}>
              Compra {formatCompraCode(selectedDelete.idCompras)} - {selectedDelete.razonSocial}
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
