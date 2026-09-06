import * as React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Divider,
  FormControlLabel,
  IconButton,
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

import { compraService } from '../../../services/compraService';
import { proveedorService } from '../../../services/proveedorService';
import { articuloService } from '../../../services/articuloService';
import { impuestoService } from '../../../services/impuestoService';
import { pagoService } from '../../../services/pagoService.js';
import { monedaService } from '../../../services/monedaService';
import { tipoCambioService } from '../../../services/tipoCambioService';
import { useAutoClearMessage } from '../../../utils/useAutoClearMessage';
import { getApiErrorMessage } from '../../../utils/getApiErrorMessage';
import { getAutocompleteTextFieldProps } from '../../../utils/autocompleteTextField';
import Icon from '../../../components/MaterialSymbol';
import FormSkeleton from '../../../components/loading/FormSkeleton';
import {
  getCompraFechaBase,
  getFechaTipoCambio,
  isMonedaSoles,
} from '../../../utils/compraFormUtils';
import {
  DEFAULT_IGV_PERCENTAGE,
  calcularCompraPreview,
  formatCurrency,
  getCurrencyPrefix,
  getDefaultMonedaId,
  isIgvImpuesto,
  isMonedaSolesData,
} from './compraCalculations';
import { formatDateTimeInputPeru } from '../../../utils/formatters';

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
  fechaEmision: '',
  fechaIngresoProducto: '',
  tipoDocumento: 'FACTURA',
  observacion: '',
  zonaProduccion: '',
  numeroLote: '',
  detalles: [],
  impuestos: [createImpuesto()],
  aplicaIgv: false,
  porcentajeIgv: DEFAULT_IGV_PERCENTAGE,
  importeIgv: 0,
};

const initialNuevoDetalle = { articulo: null, peso: '', costoKilo: '' };

function formatMonedaOption(moneda) {
  const simbolo = moneda.simbolo ? ` (${moneda.simbolo})` : '';
  return `${moneda.codigo} - ${moneda.nombre}${simbolo}`;
}

function formatArticuloOption(articulo) {
  return articulo ? articulo.descripcion || '' : '';
}

function formatPorcentaje(value) {
  const numero = Number(value);
  if (!Number.isFinite(numero)) return '0.00';

  return numero.toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function GestionarCompras() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const idCompraEditar = searchParams.get('id');
  const editing = Boolean(idCompraEditar);

  const [proveedores, setProveedores] = React.useState([]);
  const [articulos, setArticulos] = React.useState([]);
  const [impuestos, setImpuestos] = React.useState([]);
  const [pagos, setPagos] = React.useState([]);
  const [monedas, setMonedas] = React.useState([]);

  const [catalogLoading, setCatalogLoading] = React.useState(true);
  const [loadingCompra, setLoadingCompra] = React.useState(editing);
  const [saving, setSaving] = React.useState(false);
  const [tipoCambioLoading, setTipoCambioLoading] = React.useState(false);

  const [form, setForm] = React.useState(initialForm);
  const [tipoCambioBase, setTipoCambioBase] = React.useState(null);
  const [errors, setErrors] = React.useState({});
  const [selectedProveedor, setSelectedProveedor] = React.useState(null);
  const [nuevoDetalle, setNuevoDetalle] = React.useState(initialNuevoDetalle);
  const [nuevoDetalleError, setNuevoDetalleError] = React.useState({});
  const [detallesPage, setDetallesPage] = React.useState(0);
  const [detallesRowsPerPage, setDetallesRowsPerPage] = React.useState(5);

  const [serverError, setServerError] = React.useState('');
  const [successMessage, setSuccessMessage] = React.useState('');

  useAutoClearMessage(successMessage, setSuccessMessage);

  // Carga catalogos necesarios para registrar compras: proveedor, articulo, impuesto, pago y moneda.
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
    } catch {
      setServerError('No se pudieron cargar los catálogos.');
    } finally {
      setCatalogLoading(false);
    }
  }, []);

  React.useEffect(() => {
    cargarCatalogos();
  }, [cargarCatalogos]);

  const resetForm = React.useCallback(() => {
    setForm({
      ...initialForm,
      idMoneda: getDefaultMonedaId(monedas),
      fechaCompras: formatDateTimeInputPeru(new Date()),
      fechaEmision: formatDateTimeInputPeru(new Date()),
      fechaIngresoProducto: formatDateTimeInputPeru(new Date()),
      impuestos: [createImpuesto()],
    });
    setTipoCambioBase(null);
    setSelectedProveedor(null);
    setNuevoDetalle(initialNuevoDetalle);
    setNuevoDetalleError({});
    setErrors({});
    setServerError('');
    setSuccessMessage('');
  }, [monedas]);

  // Carga la compra a editar segun el id recibido por query param.
  React.useEffect(() => {
    if (catalogLoading) return;

    if (!editing) {
      resetForm();
      setLoadingCompra(false);
      return;
    }

    let active = true;

    async function cargarCompraEditar() {
      try {
        setLoadingCompra(true);
        setServerError('');

        const compras = await compraService.listar();
        const compra = Array.isArray(compras)
          ? compras.find((item) => String(item.idCompras) === String(idCompraEditar))
          : null;

        if (!active) return;

        if (!compra) {
          setServerError('No se encontró la compra solicitada.');
          setLoadingCompra(false);
          return;
        }

        const proveedorEncontrado =
          proveedores.find((proveedor) => proveedor.idProveedor === compra.idProveedor) || null;

        const detalles =
          Array.isArray(compra.detalles) && compra.detalles.length > 0
            ? compra.detalles.map((detalle) => ({
              tempId: Math.random().toString(36).substring(2) + Date.now(),
              idArticulo: detalle.idArticulo ?? '',
              descripcionArticulo:
                detalle.descripcionArticulo ||
                articulos.find((articulo) => articulo.idArticulo === detalle.idArticulo)?.descripcion ||
                '',
              peso: detalle.peso ?? '',
              costoKilo: detalle.costoKilo ?? '',
            }))
            : [];

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

        const fechaCompras = formatDateTimeInputPeru(compra.fechaCompras);
        const fechaEmision = formatDateTimeInputPeru(compra.fechaEmision || compra.fechaCompras);
        const fechaIngresoProducto = formatDateTimeInputPeru(
          compra.fechaIngresoProducto || compra.fechaEmision || compra.fechaCompras
        );

        setSelectedProveedor(proveedorEncontrado);
        setTipoCambioBase({
          idMoneda: compra.idMoneda ?? getDefaultMonedaId(monedas),
          fecha: getFechaTipoCambio(fechaEmision || fechaCompras),
        });
        setForm({
          idCompras: compra.idCompras,
          idPago: compra.idPago ?? '',
          idMoneda: compra.idMoneda ?? getDefaultMonedaId(monedas),
          idTipoCambio: compra.idTipoCambio ?? null,
          tipoCambioAplicado: compra.tipoCambioAplicado ?? '',
          idProveedor: compra.idProveedor ?? null,
          fechaCompras,
          fechaEmision,
          fechaIngresoProducto,
          tipoDocumento: compra.tipoDocumento || 'FACTURA',
          observacion: compra.observacion || '',
          zonaProduccion: compra.zonaProduccion || '',
          numeroLote: compra.numeroLote ?? '',
          detalles,
          impuestos: impuestosCompra,
          aplicaIgv: Boolean(compra.aplicaIgv),
          porcentajeIgv: compra.porcentajeIgv ?? DEFAULT_IGV_PERCENTAGE,
          importeIgv: compra.importeIgv ?? 0,
        });
        setErrors({});
        setNuevoDetalle(initialNuevoDetalle);
        setNuevoDetalleError({});
      } catch (error) {
        if (active) {
          setServerError(getApiErrorMessage(error, 'No se pudo cargar la compra a editar.'));
        }
      } finally {
        if (active) {
          setLoadingCompra(false);
        }
      }
    }

    cargarCompraEditar();

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing, idCompraEditar, catalogLoading]);

  // Resuelve automaticamente el tipo de cambio cuando la compra usa moneda distinta a soles.
  React.useEffect(() => {
    if (loadingCompra) return undefined;

    const monedaSeleccionada = monedas.find((moneda) => moneda.idMoneda === Number(form.idMoneda));
    const fechaTipoCambio = getFechaTipoCambio(form.fechaEmision || form.fechaCompras);

    if (!monedaSeleccionada || !fechaTipoCambio) {
      setForm((prev) => ({ ...prev, idTipoCambio: null, tipoCambioAplicado: '' }));
      setTipoCambioLoading(false);
      return undefined;
    }

    if (isMonedaSoles(monedaSeleccionada)) {
      setForm((prev) => ({ ...prev, idTipoCambio: null, tipoCambioAplicado: '' }));
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
        const message = getApiErrorMessage(
          error,
          'No existe tipo de cambio registrado para la fecha seleccionada.'
        );

        setForm((prev) => ({ ...prev, idTipoCambio: null, tipoCambioAplicado: '' }));
        setErrors((prev) => ({ ...prev, tipoCambioAplicado: message }));
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
    form.fechaEmision,
    form.idMoneda,
    form.tipoCambioAplicado,
    loadingCompra,
    monedas,
    tipoCambioBase,
  ]);

  const handleChange = (field) => (event) => {
    const { value } = event.target;

    setForm((prev) => ({
      ...prev,
      [field]: value,
      ...(field === 'fechaEmision' ? { fechaCompras: value } : {}),
    }));

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: '',
        ...(field === 'fechaEmision' ? { fechaCompras: '' } : {}),
      }));
    }

    if (serverError) setServerError('');
    if (successMessage) setSuccessMessage('');
  };

  const handleIgvChange = (event) => {
    const { checked } = event.target;

    setForm((prev) => ({
      ...prev,
      aplicaIgv: checked,
      porcentajeIgv: prev.porcentajeIgv === '' ? DEFAULT_IGV_PERCENTAGE : prev.porcentajeIgv,
    }));

    if (errors.porcentajeIgv) {
      setErrors((prev) => ({ ...prev, porcentajeIgv: '' }));
    }
  };

  const handleAddDetalle = () => {
    const nuevoErrors = {};

    if (!nuevoDetalle.articulo?.idArticulo) nuevoErrors.articulo = 'Seleccione un artículo';
    if (!nuevoDetalle.peso || Number(nuevoDetalle.peso) <= 0) nuevoErrors.peso = 'El peso debe ser mayor a 0';
    if (!nuevoDetalle.costoKilo || Number(nuevoDetalle.costoKilo) <= 0) {
      nuevoErrors.costoKilo = 'El costo debe ser mayor a 0';
    }

    setNuevoDetalleError(nuevoErrors);
    if (Object.keys(nuevoErrors).length > 0) return;

    setForm((prev) => ({
      ...prev,
      detalles: [
        ...prev.detalles,
        {
          tempId: Math.random().toString(36).substring(2) + Date.now(),
          idArticulo: nuevoDetalle.articulo.idArticulo,
          descripcionArticulo: nuevoDetalle.articulo.descripcion,
          peso: nuevoDetalle.peso,
          costoKilo: nuevoDetalle.costoKilo,
        },
      ],
    }));

    setNuevoDetalle(initialNuevoDetalle);
    setNuevoDetalleError({});
    setErrors((prev) => ({ ...prev, detalles: '' }));

    const totalDespues = form.detalles.length + 1;
    const ultimaPagina = Math.max(0, Math.ceil(totalDespues / detallesRowsPerPage) - 1);
    setDetallesPage(ultimaPagina);
  };

  const handleRemoveDetalle = (tempId) => {
    setForm((prev) => ({
      ...prev,
      detalles: prev.detalles.filter((detalle) => detalle.tempId !== tempId),
    }));
  };

  // Evita quedar en una pagina vacia cuando se quitan articulos o se recarga una compra para editar.
  React.useEffect(() => {
    const ultimaPagina = Math.max(0, Math.ceil(form.detalles.length / detallesRowsPerPage) - 1);
    setDetallesPage((prev) => (prev > ultimaPagina ? ultimaPagina : prev));
  }, [form.detalles.length, detallesRowsPerPage]);

  const detallesPaginados = React.useMemo(() => {
    const inicio = detallesPage * detallesRowsPerPage;
    return form.detalles.slice(inicio, inicio + detallesRowsPerPage);
  }, [form.detalles, detallesPage, detallesRowsPerPage]);

  const handleChangeDetallesPage = (_event, newPage) => {
    setDetallesPage(newPage);
  };

  const handleChangeDetallesRowsPerPage = (event) => {
    setDetallesRowsPerPage(Number.parseInt(event.target.value, 10));
    setDetallesPage(0);
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
      setErrors((prev) => ({ ...prev, [errorKey]: '' }));
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

  // Precalcula importes visibles sin esperar la respuesta del backend.
  const {
    subtotalPreview,
    subtotalTributarioPreview,
    igvPreview,
    igvTributarioPreview,
    totalGeneralPreview,
  } = React.useMemo(() => calcularCompraPreview(form), [form]);

  const validate = () => {
    const newErrors = {};

    if (!form.idPago) newErrors.idPago = 'Seleccione una condición de pago';

    if (!form.idMoneda || !monedas.some((moneda) => moneda.idMoneda === Number(form.idMoneda))) {
      newErrors.idMoneda = 'Seleccione una moneda';
    }

    const monedaSeleccionada = monedas.find((moneda) => moneda.idMoneda === Number(form.idMoneda));
    if (monedaSeleccionada && !isMonedaSoles(monedaSeleccionada) && !form.tipoCambioAplicado) {
      newErrors.tipoCambioAplicado = 'No existe tipo de cambio registrado para la fecha seleccionada.';
    }

    if (!form.idProveedor) newErrors.idProveedor = 'Seleccione un proveedor';
    if (!getCompraFechaBase(form)) newErrors.fechaEmision = 'La fecha de emision es obligatoria';
    if (!form.fechaIngresoProducto) newErrors.fechaIngresoProducto = 'La fecha de ingreso es obligatoria';
    if (!form.tipoDocumento?.trim()) newErrors.tipoDocumento = 'Seleccione un tipo de documento';
    if (!form.zonaProduccion.trim()) newErrors.zonaProduccion = 'La zona de producción es obligatoria';

    if (form.numeroLote === '' || Number(form.numeroLote) < 0) {
      newErrors.numeroLote = 'El numero de lote debe ser 0 o mayor';
    }

    if (!form.detalles.length) newErrors.detalles = 'Debe agregar al menos un artículo';

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

  const getImpuestosPayload = () => {
    const impuestosSeleccionados = new Set();

    return form.impuestos
      .filter((impuesto) => impuesto.idImpuesto)
      .map((impuesto) => Number(impuesto.idImpuesto))
      .filter((idImpuesto) => {
        if (impuestosSeleccionados.has(idImpuesto)) return false;
        impuestosSeleccionados.add(idImpuesto);
        return true;
      })
      .map((idImpuesto) => ({ idImpuesto }));
  };

  const buildPayload = () => ({
    idPago: Number(form.idPago),
    idMoneda: Number(form.idMoneda),
    idTipoCambio: form.idTipoCambio ? Number(form.idTipoCambio) : null,
    tipoCambioAplicado: form.tipoCambioAplicado ? Number(form.tipoCambioAplicado) : null,
    idProveedor: Number(form.idProveedor),
    fechaCompras: getCompraFechaBase(form),
    fechaEmision: getCompraFechaBase(form),
    fechaIngresoProducto: form.fechaIngresoProducto,
    tipoDocumento: form.tipoDocumento?.trim() || 'FACTURA',
    observacion: form.observacion?.trim() || null,
    zonaProduccion: form.zonaProduccion.trim(),
    numeroLote: Number(form.numeroLote),
    detalles: form.detalles.map((detalle) => ({
      idArticulo: Number(detalle.idArticulo),
      peso: Number(detalle.peso),
      costoKilo: Number(detalle.costoKilo),
    })),
    impuestos: getImpuestosPayload(),
    aplicaIgv: Boolean(form.aplicaIgv),
    porcentajeIgv: Number(form.porcentajeIgv ?? DEFAULT_IGV_PERCENTAGE),
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
      } else {
        await compraService.crear(payload);
      }

      navigate('/dashboard/compras/historial', {
        state: { successMessage: editing ? 'Compra actualizada correctamente.' : 'Compra registrada correctamente.' },
      });
    } catch (error) {
      setServerError(getApiErrorMessage(error, 'No se pudo guardar la compra.'));
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/dashboard/compras/historial');
  };

  const monedaSeleccionada = React.useMemo(
    () => monedas.find((moneda) => moneda.idMoneda === Number(form.idMoneda)) || null,
    [form.idMoneda, monedas]
  );
  const monedaLabel = getCurrencyPrefix(monedaSeleccionada) || 'moneda';
  const mostrarTipoCambio = Boolean(monedaSeleccionada && !isMonedaSolesData(monedaSeleccionada));
  const tipoCambioTexto = tipoCambioLoading
    ? 'Consultando...'
    : form.tipoCambioAplicado || 'No disponible';

  const impuestosDisponibles = impuestos;

  const isLoading = catalogLoading || loadingCompra;

  return (
    <Box>
      <Stack spacing={2.5}>
        <Box>
          <Typography sx={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>
            {editing ? 'Editar compra' : 'Nueva compra'}
          </Typography>
          <Typography sx={{ fontSize: '0.86rem', color: '#64748b', mt: 0.5 }}>
            Completa los datos del proveedor, agrega los artículos y revisa los totales antes de guardar.
          </Typography>
        </Box>

        {successMessage ? <Alert severity="success">{successMessage}</Alert> : null}
        {serverError ? <Alert severity="error">{serverError}</Alert> : null}

        {isLoading ? (
          <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e2e8f0' }}>
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
              <FormSkeleton fields={8} />
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Seccion 1: proveedor y datos del documento */}
            <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e2e8f0' }}>
              <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                <Typography sx={{ fontWeight: 700, color: '#0f172a', mb: 2 }}>
                  Proveedor y datos del documento
                </Typography>

                <Stack spacing={2.5}>
                  <Autocomplete
                    fullWidth
                    options={proveedores}
                    value={selectedProveedor}
                    onChange={(_, newValue) => {
                      setSelectedProveedor(newValue);
                      setForm((prev) => ({
                        ...prev,
                        idProveedor: newValue ? newValue.idProveedor : null,
                      }));

                      if (errors.idProveedor) {
                        setErrors((prev) => ({ ...prev, idProveedor: '' }));
                      }
                    }}
                    getOptionLabel={(option) => (option ? `${option.ruc} - ${option.razonSocial}` : '')}
                    isOptionEqualToValue={(option, value) => option.idProveedor === value.idProveedor}
                    filterOptions={(options, state) => {
                      const input = state.inputValue.toLowerCase().trim();

                      return options
                        .filter(
                          (option) =>
                            option.ruc?.toLowerCase().includes(input) ||
                            option.razonSocial?.toLowerCase().includes(input)
                        )
                        .slice(0, 20);
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...getAutocompleteTextFieldProps(params)}
                        label="Proveedor"
                        placeholder="Buscar por RUC o razón social"
                        error={!!errors.idProveedor}
                        helperText={errors.idProveedor}
                      />
                    )}
                  />

                  {selectedProveedor ? (
                    <Box sx={{ p: 1.5, borderRadius: 2, backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                      <Typography sx={{ fontSize: '0.8rem', color: '#64748b' }}>Razón social</Typography>
                      <Typography sx={{ fontWeight: 700, color: '#0f172a' }}>
                        {selectedProveedor.razonSocial}
                      </Typography>
                      {selectedProveedor.direccion ? (
                        <>
                          <Typography sx={{ mt: 1, fontSize: '0.8rem', color: '#64748b' }}>Dirección</Typography>
                          <Typography sx={{ color: '#334155' }}>{selectedProveedor.direccion}</Typography>
                        </>
                      ) : null}
                    </Box>
                  ) : null}

                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 2 }}>
                    <TextField
                      fullWidth
                      type="datetime-local"
                      label="Fecha emision"
                      value={form.fechaEmision || form.fechaCompras}
                      onChange={handleChange('fechaEmision')}
                      error={!!errors.fechaEmision || !!errors.fechaCompras}
                      helperText={errors.fechaEmision || errors.fechaCompras}
                      slotProps={{ inputLabel: { shrink: true } }}
                    />

                    <TextField
                      fullWidth
                      type="datetime-local"
                      label="Fecha ingreso producto"
                      value={form.fechaIngresoProducto}
                      onChange={handleChange('fechaIngresoProducto')}
                      error={!!errors.fechaIngresoProducto}
                      helperText={errors.fechaIngresoProducto}
                      slotProps={{ inputLabel: { shrink: true } }}
                    />

                    <TextField
                      select
                      fullWidth
                      label="Tipo"
                      value={form.tipoDocumento || 'FACTURA'}
                      onChange={handleChange('tipoDocumento')}
                      error={!!errors.tipoDocumento}
                      helperText={errors.tipoDocumento}
                    >
                      <MenuItem value="FACTURA">FACTURA</MenuItem>
                      <MenuItem value="BOLETA">BOLETA</MenuItem>
                      <MenuItem value="GUIA">GUIA</MenuItem>
                      <MenuItem value="OTRO">OTRO</MenuItem>
                    </TextField>
                  </Box>

                  <TextField
                    fullWidth
                    label="Observacion"
                    value={form.observacion}
                    onChange={handleChange('observacion')}
                    multiline
                    minRows={2}
                  />

                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 2 }}>
                    <TextField
                      select
                      fullWidth
                      label="Condición de pago"
                      value={form.idPago}
                      onChange={handleChange('idPago')}
                      error={!!errors.idPago}
                      helperText={errors.idPago}
                    >
                      <MenuItem value="">
                        <em>Seleccione</em>
                      </MenuItem>
                      {pagos.map((item) => (
                        <MenuItem key={item.idPago} value={item.idPago}>
                          {item.pago}
                          {item.dias != null ? ` (${item.dias} días)` : ''}
                        </MenuItem>
                      ))}
                    </TextField>

                    <TextField
                      select
                      fullWidth
                      label="Moneda"
                      value={form.idMoneda}
                      onChange={handleChange('idMoneda')}
                      error={!!errors.idMoneda}
                      helperText={errors.idMoneda || (monedas.length === 0 ? 'No hay monedas configuradas' : '')}
                    >
                      <MenuItem value="">
                        <em>Seleccione</em>
                      </MenuItem>
                      {monedas.map((moneda) => (
                        <MenuItem key={moneda.idMoneda} value={moneda.idMoneda}>
                          {formatMonedaOption(moneda)}
                        </MenuItem>
                      ))}
                    </TextField>

                    <TextField
                      fullWidth
                      label="Zona de producción"
                      value={form.zonaProduccion}
                      onChange={handleChange('zonaProduccion')}
                      error={!!errors.zonaProduccion}
                      helperText={errors.zonaProduccion}
                    />

                    <TextField
                      fullWidth
                      type="text"
                      label="Numero de lote"
                      value={form.numeroLote}
                      onChange={handleChange('numeroLote')}
                      error={!!errors.numeroLote}
                      helperText={errors.numeroLote}
                      slotProps={{ htmlInput: { inputMode: 'decimal', pattern: '[0-9]*[.]?[0-9]*' } }}
                    />
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            {/* Seccion 2: articulos de la compra */}
            <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e2e8f0' }}>
              <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                <Typography sx={{ fontWeight: 700, color: '#0f172a' }}>Artículos de la compra</Typography>
                <Typography sx={{ fontSize: '0.85rem', color: '#64748b', mb: 2 }}>
                  Busca el artículo, ingresa peso y costo por kilo, y agrégalo a la lista.
                </Typography>

                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: '1.6fr 1fr 1fr 1fr auto' },
                    gap: 1.5,
                    alignItems: 'flex-start',
                  }}
                >
                  <Autocomplete
                    fullWidth
                    options={articulos}
                    value={nuevoDetalle.articulo}
                    onChange={(_, value) => {
                      setNuevoDetalle((prev) => ({ ...prev, articulo: value }));
                      setNuevoDetalleError((prev) => ({ ...prev, articulo: '' }));
                    }}
                    getOptionLabel={formatArticuloOption}
                    isOptionEqualToValue={(option, value) => option.idArticulo === value.idArticulo}
                    renderInput={(params) => (
                      <TextField
                        {...getAutocompleteTextFieldProps(params)}
                        label="Artículo"
                        placeholder="Buscar artículo"
                        error={!!nuevoDetalleError.articulo}
                        helperText={nuevoDetalleError.articulo}
                      />
                    )}
                  />

                  <TextField
                    fullWidth
                    type="text"
                    label="Peso"
                    value={nuevoDetalle.peso}
                    onChange={(event) => {
                      setNuevoDetalle((prev) => ({ ...prev, peso: event.target.value }));
                      setNuevoDetalleError((prev) => ({ ...prev, peso: '' }));
                    }}
                    error={!!nuevoDetalleError.peso}
                    helperText={nuevoDetalleError.peso}
                    slotProps={{ htmlInput: { min: 0.01, step: '0.01' } }}
                  />

                  <TextField
                    fullWidth
                    type="text"
                    label={`Costo kilo (${monedaLabel})`}
                    value={nuevoDetalle.costoKilo}
                    onChange={(event) => {
                      setNuevoDetalle((prev) => ({ ...prev, costoKilo: event.target.value }));
                      setNuevoDetalleError((prev) => ({ ...prev, costoKilo: '' }));
                    }}
                    error={!!nuevoDetalleError.costoKilo}
                    helperText={nuevoDetalleError.costoKilo}
                    slotProps={{ htmlInput: { min: 0.01, step: '0.01' } }}
                  />

                  <TextField
                    fullWidth
                    label={`Subtotal (${monedaLabel})`}
                    value={(Number(nuevoDetalle.peso || 0) * Number(nuevoDetalle.costoKilo || 0)).toFixed(2)}
                    slotProps={{ input: { readOnly: true } }}
                  />

                  <Button
                    variant="contained"
                    onClick={handleAddDetalle}
                    startIcon={<Icon name="add" size={18} color="#fff" />}
                    sx={{ height: '56px', textTransform: 'none', fontWeight: 700, boxShadow: 'none' }}
                  >
                    Agregar
                  </Button>
                </Box>

                {errors.detalles ? (
                  <Typography sx={{ mt: 1.5, color: '#dc2626', fontSize: '0.8rem' }}>{errors.detalles}</Typography>
                ) : null}

                <Divider sx={{ my: 2.5 }} />

                <Typography sx={{ fontWeight: 700, color: '#0f172a', mb: 1.5, fontSize: '0.9rem' }}>
                  Lista del producto que se va agregando
                </Typography>

                <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2.5, overflowX: 'auto' }}>
                  <Table sx={{ minWidth: 640 }}>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#f8fafc' }}>
                        <TableCell sx={{ fontWeight: 700 }}>Artículo</TableCell>
                        <TableCell sx={{ fontWeight: 700 }} align="right">Peso</TableCell>
                        <TableCell sx={{ fontWeight: 700 }} align="right">Costo kilo</TableCell>
                        <TableCell sx={{ fontWeight: 700 }} align="right">Subtotal</TableCell>
                        <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Quitar</TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {form.detalles.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} align="center" sx={{ py: 3, color: '#64748b' }}>
                            Aún no agregaste artículos.
                          </TableCell>
                        </TableRow>
                      ) : (
                        detallesPaginados.map((detalle) => (
                          <TableRow key={detalle.tempId} hover>
                            <TableCell>{detalle.descripcionArticulo || '-'}</TableCell>
                            <TableCell align="right">{Number(detalle.peso || 0).toFixed(2)}</TableCell>
                            <TableCell align="right">
                              {formatCurrency(detalle.costoKilo, { codigo: monedaSeleccionada?.codigo })}
                            </TableCell>
                            <TableCell align="right">
                              {formatCurrency(
                                Number(detalle.peso || 0) * Number(detalle.costoKilo || 0),
                                { codigo: monedaSeleccionada?.codigo }
                              )}
                            </TableCell>
                            <TableCell align="center">
                              <IconButton color="error" onClick={() => handleRemoveDetalle(detalle.tempId)}>
                                <Icon name="delete" size={20} color="#ef4444" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>

                  {form.detalles.length > 0 ? (
                    <TablePagination
                      component="div"
                      count={form.detalles.length}
                      page={detallesPage}
                      onPageChange={handleChangeDetallesPage}
                      rowsPerPage={detallesRowsPerPage}
                      onRowsPerPageChange={handleChangeDetallesRowsPerPage}
                      rowsPerPageOptions={[5, 10, 20]}
                      labelRowsPerPage="Filas por página:"
                    />
                  ) : null}
                </TableContainer>
              </CardContent>
            </Card>

            {/* Seccion 3: IGV, totales y retencion/detraccion referencial */}
            <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e2e8f0' }}>
              <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                <Stack spacing={0.5} sx={{ mb: 1.5 }}>
                  <Typography sx={{ fontWeight: 700, color: '#0f172a' }}>IGV</Typography>
                  <Typography sx={{ fontSize: '0.85rem', color: '#64748b' }}>
                    Define si la compra aplica IGV y revisa el importe calculado.
                  </Typography>
                </Stack>

                <Paper elevation={0} sx={{ p: 1.5, border: '1px solid #e2e8f0', borderRadius: 2 }}>
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', md: form.aplicaIgv ? '1.2fr 1fr 1fr' : '1.2fr 1fr' },
                      gap: 1.5,
                      alignItems: 'center',
                    }}
                  >
                    <FormControlLabel
                      control={<Checkbox checked={Boolean(form.aplicaIgv)} onChange={handleIgvChange} />}
                      label="Aplicar IGV"
                      sx={{ m: 0 }}
                    />

                    <TextField
                      fullWidth
                      type="text"
                      label="Porcentaje IGV"
                      value={form.porcentajeIgv}
                      onChange={handleChange('porcentajeIgv')}
                      error={!!errors.porcentajeIgv}
                      helperText={errors.porcentajeIgv}
                      slotProps={{ htmlInput: { min: 0, step: '0.01' } }}
                    />

                    {form.aplicaIgv ? (
                      <TextField
                        fullWidth
                        label={`Importe IGV (${monedaLabel})`}
                        value={igvPreview}
                        slotProps={{ input: { readOnly: true } }}
                      />
                    ) : null}
                  </Box>
                </Paper>

                <Divider sx={{ my: 2.5 }} />

                <Stack spacing={1}>
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 2 }}>
                    <TextField
                      fullWidth
                      label={`Subtotal (${monedaLabel})`}
                      value={subtotalPreview}
                      slotProps={{ input: { readOnly: true } }}
                    />

                    <TextField
                      fullWidth
                      label={`IGV (${monedaLabel})`}
                      value={form.aplicaIgv ? igvPreview : '0.00'}
                      slotProps={{ input: { readOnly: true } }}
                    />

                    <TextField
                      fullWidth
                      label={`Total final (${monedaLabel})`}
                      value={totalGeneralPreview}
                      slotProps={{ input: { readOnly: true } }}
                    />
                  </Box>

                  {mostrarTipoCambio ? (
                    <Typography sx={{ fontSize: '0.78rem', color: errors.tipoCambioAplicado ? '#dc2626' : '#64748b' }}>
                      Tipo de cambio aplicado: {tipoCambioTexto}
                      {errors.tipoCambioAplicado ? ` - ${errors.tipoCambioAplicado}` : ''}
                    </Typography>
                  ) : null}
                </Stack>

                <Divider sx={{ my: 2.5 }} />

                <Stack
                  direction={{ xs: 'column', md: 'row' }}
                  spacing={1.5}
                  sx={{ mb: 1.5, alignItems: { xs: 'stretch', md: 'center' }, justifyContent: 'space-between' }}
                >
                  <Box>
                    <Typography sx={{ fontWeight: 700, color: '#0f172a' }}>
                      Retención / detracción referencial
                    </Typography>
                    <Typography sx={{ fontSize: '0.85rem', color: '#64748b' }}>
                      Agrega retenciones o detracciones solo como referencia; no afectan el total final.
                    </Typography>
                  </Box>

                  <Button
                    variant="outlined"
                    onClick={handleAddImpuesto}
                    startIcon={<Icon name="add" size={18} />}
                    sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '8px' }}
                  >
                    Agregar ret./det.
                  </Button>
                </Stack>

                <Stack spacing={1.25}>
                  {form.impuestos.map((impuestoItem, index) => {
                    const impuestoSeleccionado = impuestosDisponibles.find(
                      (item) => item.idImpuesto === Number(impuestoItem.idImpuesto)
                    );

                    const baseImpuestos = Number(subtotalTributarioPreview) + Number(igvTributarioPreview);
                    const importe = impuestoSeleccionado
                      ? (baseImpuestos * Number(impuestoSeleccionado.valor || 0)) / 100
                      : 0;

                    return (
                      <Paper key={impuestoItem.tempId} elevation={0} sx={{ p: 1.5, border: '1px solid #e2e8f0', borderRadius: 2 }}>
                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.5fr 1fr auto' }, gap: 1.5, alignItems: 'center' }}>
                          <TextField
                            select
                            fullWidth
                            label="Retención / detracción referencial"
                            value={impuestoItem.idImpuesto}
                            onChange={(event) => handleImpuestoChange(index, 'idImpuesto', event.target.value)}
                            error={!!errors[`impuesto_${index}_idImpuesto`]}
                            helperText={errors[`impuesto_${index}_idImpuesto`]}
                          >
                            <MenuItem value="">
                              <em>Seleccione</em>
                            </MenuItem>
                            {impuestosDisponibles.map((item) => (
                              <MenuItem key={item.idImpuesto} value={item.idImpuesto}>
                                {item.tipoImpuesto} ({formatPorcentaje(item.valor)}%)
                              </MenuItem>
                            ))}
                          </TextField>

                          <TextField
                            fullWidth
                            label="Importe referencial (S/)"
                            value={formatCurrency(importe, { codigo: 'PEN' })}
                            slotProps={{ input: { readOnly: true } }}
                          />

                          <IconButton
                            color="error"
                            onClick={() => handleRemoveImpuesto(index)}
                            disabled={form.impuestos.length === 1}
                          >
                            <Icon name="delete" size={20} />
                          </IconButton>
                        </Box>
                      </Paper>
                    );
                  })}
                </Stack>
              </CardContent>
            </Card>

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} justifyContent="flex-end">
              <Button onClick={handleCancel} disabled={saving} sx={{ textTransform: 'none' }}>
                Cancelar
              </Button>

              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={saving}
                sx={{ textTransform: 'none', fontWeight: 700, boxShadow: 'none', minWidth: 180 }}
              >
                {saving ? 'Guardando...' : editing ? 'Actualizar compra' : 'Registrar compra'}
              </Button>
            </Stack>
          </>
        )}
      </Stack>
    </Box>
  );
}
