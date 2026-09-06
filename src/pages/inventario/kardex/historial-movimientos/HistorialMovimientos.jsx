import * as React from 'react';
import {
  Alert,
  Autocomplete,
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
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';

import { articuloService } from '../../../../services/articuloService';
import { compraService } from '../../../../services/compraService';
import { historialMovimientoService } from '../../../../services/historialMovimientoService';
import { monedaService } from '../../../../services/monedaService';
import { motivoMovimientoService } from '../../../../services/motivoMovimientoService';
import { pagoService } from '../../../../services/pagoService.js';
import { proveedorService } from '../../../../services/proveedorService';
import { tipoCambioService } from '../../../../services/tipoCambioService';
import { getAutocompleteTextFieldProps } from '../../../../utils/autocompleteTextField';
import { formatArticuloCode, formatDatePeru } from '../../../../utils/formatters';
import { getApiErrorMessage } from '../../../../utils/getApiErrorMessage';
import Icon from '../../../../components/MaterialSymbol';
import TableSkeletonRows from '../../../../components/loading/TableSkeletonRows';
import FormSkeleton from '../../../../components/loading/FormSkeleton';
import {
  getCompraFechaBase,
  getFechaTipoCambio,
  isMonedaSoles,
} from '../../../../utils/compraFormUtils';
import {
  getDefaultMonedaId,
} from '../../../compras/gestionarcompras/compraCalculations';

const FALLBACK_MOTIVOS = [
  { codigo: 'STOCK_INICIAL', nombre: 'STOCK INICIAL', naturaleza: 'INGRESO' },
  { codigo: 'COMPRA', nombre: 'COMPRA', naturaleza: 'INGRESO' },
  { codigo: 'TRASLADO_ENTRE_ALMACENES', nombre: 'TRASLADO ENTRE ALMACENES', naturaleza: 'TRANSFERENCIA' },
  { codigo: 'DEGUSTACION', nombre: 'DEGUSTACION', naturaleza: 'SALIDA' },
  { codigo: 'PRODUCCION', nombre: 'PRODUCCION', naturaleza: 'INGRESO' },
  { codigo: 'MERMA', nombre: 'MERMA', naturaleza: 'SALIDA' },
  { codigo: 'AJUSTE_INVENTARIO', nombre: 'AJUSTE DE INVENTARIO', naturaleza: 'AJUSTE' },
];

const MANUAL_FORM_DEFAULT = {
  tipoMovimiento: 'INGRESO',
  fechaTransaccion: '',
  articulo: null,
  motivo: 'AJUSTE DE INVENTARIO',
  detalle: '',
  responsable: '',
  cantidad: '',
  totalSoles: '',
};

const COMPRA_FORM_DEFAULT = {
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
};

function getCurrentPeriod() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

function getCurrentDateTimeInput() {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 16);
}

function getCurrentDateInput() {
  return getCurrentDateTimeInput().slice(0, 10);
}

function toLocalDateTimeInput(dateValue) {
  return dateValue ? `${dateValue}T00:00:00` : '';
}

function formatNumber(value) {
  if (value === null || value === undefined || value === '') return '0.00';

  const number = Number(value);
  if (Number.isNaN(number)) return '0.00';

  return number.toFixed(2);
}

function formatCurrencySoles(value) {
  return `S/ ${formatNumber(value)}`;
}

function getMovimientoColor(tipoMovimiento) {
  const tipo = normalizeTipoMovimiento(tipoMovimiento);

  if (tipo === 'INGRESO') return { color: '#166534', backgroundColor: '#dcfce7' };
  if (tipo === 'SALIDA') return { color: '#991b1b', backgroundColor: '#fee2e2' };
  if (tipo === 'AJUSTE') return { color: '#854d0e', backgroundColor: '#fef3c7' };
  if (tipo === 'TRANSFERENCIA') return { color: '#1e40af', backgroundColor: '#dbeafe' };

  return { color: '#334155', backgroundColor: '#e2e8f0' };
}

function normalizeTipoMovimiento(tipoMovimiento) {
  const tipo = String(tipoMovimiento || '').toUpperCase();

  if (tipo === 'COMPRA' || tipo === 'ENTRADA' || tipo === 'INGRESO') return 'INGRESO';
  if (tipo === 'VENTA' || tipo === 'SALIDA') return 'SALIDA';

  return tipo;
}

function getDefaultMotivo(motivos) {
  const opciones = motivos.length > 0 ? motivos : FALLBACK_MOTIVOS;
  return opciones.find((motivo) => motivo.codigo === 'AJUSTE_INVENTARIO')?.nombre || opciones[0]?.nombre || '';
}

function getDefaultPagoId(pagos) {
  const contado = pagos.find((pago) => String(pago?.pago || '').toUpperCase().includes('CONTADO'));
  return contado?.idPago || pagos[0]?.idPago || '';
}

function getTipoMovimientoByMotivo(motivoNombre, motivos) {
  const motivo = motivos.find((item) => item.nombre === motivoNombre);
  const naturaleza = String(motivo?.naturaleza || '').toUpperCase();

  if (naturaleza === 'INGRESO') return 'INGRESO';
  if (naturaleza === 'SALIDA') return 'SALIDA';

  return null;
}

export default function HistorialMovimientos() {
  const [periodo, setPeriodo] = React.useState(getCurrentPeriod);
  const [articulos, setArticulos] = React.useState([]);
  const [selectedArticulo, setSelectedArticulo] = React.useState(null);
  const [busqueda, setBusqueda] = React.useState('');
  const [loadingArticulos, setLoadingArticulos] = React.useState(true);
  const [loadingMovimientos, setLoadingMovimientos] = React.useState(false);
  const [movimientos, setMovimientos] = React.useState([]);
  const [serverError, setServerError] = React.useState('');
  const [searched, setSearched] = React.useState(false);
  const [manualOpen, setManualOpen] = React.useState(false);
  const [manualForm, setManualForm] = React.useState(MANUAL_FORM_DEFAULT);
  const [manualErrors, setManualErrors] = React.useState({});
  const [savingManual, setSavingManual] = React.useState(false);
  const [motivosMovimiento, setMotivosMovimiento] = React.useState(FALLBACK_MOTIVOS);
  const [loadingMotivos, setLoadingMotivos] = React.useState(false);
  const [proveedores, setProveedores] = React.useState([]);
  const [pagos, setPagos] = React.useState([]);
  const [monedas, setMonedas] = React.useState([]);
  const [loadingCompraCatalogos, setLoadingCompraCatalogos] = React.useState(true);
  const [compraOpen, setCompraOpen] = React.useState(false);
  const [compraForm, setCompraForm] = React.useState(COMPRA_FORM_DEFAULT);
  const [compraErrors, setCompraErrors] = React.useState({});
  const [selectedProveedorCompra, setSelectedProveedorCompra] = React.useState(null);
  const [savingCompra, setSavingCompra] = React.useState(false);
  const [tipoCambioLoading, setTipoCambioLoading] = React.useState(false);
  const [successMessage, setSuccessMessage] = React.useState('');

  React.useEffect(() => {
    let active = true;

    async function cargarArticulos() {
      try {
        setLoadingArticulos(true);
        setServerError('');
        const data = await articuloService.listar();

        if (active) {
          setArticulos(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        if (active) {
          setServerError(getApiErrorMessage(error, 'No se pudo cargar el catalogo de articulos.'));
        }
      } finally {
        if (active) {
          setLoadingArticulos(false);
        }
      }
    }

    cargarArticulos();

    return () => {
      active = false;
    };
  }, []);

  React.useEffect(() => {
    let active = true;

    async function cargarCatalogosCompra() {
      try {
        setLoadingCompraCatalogos(true);

        const [proveedoresData, pagosData, monedasData] = await Promise.all([
          proveedorService.listar(),
          pagoService.listar(),
          monedaService.listar(),
        ]);

        if (!active) return;

        setProveedores(Array.isArray(proveedoresData) ? proveedoresData : []);
        setPagos(Array.isArray(pagosData) ? pagosData : []);
        setMonedas(Array.isArray(monedasData) ? monedasData : []);
      } catch {
        if (active) {
          setServerError('No se pudieron cargar los catalogos para registrar compras.');
        }
      } finally {
        if (active) {
          setLoadingCompraCatalogos(false);
        }
      }
    }

    cargarCatalogosCompra();

    return () => {
      active = false;
    };
  }, []);

  React.useEffect(() => {
    let active = true;

    async function cargarMotivos() {
      try {
        setLoadingMotivos(true);
        const data = await motivoMovimientoService.listar();

        if (!active) return;

        const motivos = Array.isArray(data) && data.length > 0 ? data : FALLBACK_MOTIVOS;
        setMotivosMovimiento(motivos);
        setManualForm((prev) => ({
          ...prev,
          motivo: prev.motivo || getDefaultMotivo(motivos),
        }));
      } catch {
        if (active) {
          setMotivosMovimiento(FALLBACK_MOTIVOS);
        }
      } finally {
        if (active) {
          setLoadingMotivos(false);
        }
      }
    }

    cargarMotivos();

    return () => {
      active = false;
    };
  }, []);

  React.useEffect(() => {
    if (!compraOpen) return undefined;

    const monedaSeleccionada = monedas.find(
      (moneda) => moneda.idMoneda === Number(compraForm.idMoneda)
    );
    const fechaTipoCambio = getFechaTipoCambio(compraForm.fechaEmision || compraForm.fechaCompras);

    if (!monedaSeleccionada || !fechaTipoCambio) {
      setCompraForm((prev) => ({
        ...prev,
        idTipoCambio: null,
        tipoCambioAplicado: '',
      }));
      setTipoCambioLoading(false);
      return undefined;
    }

    if (isMonedaSoles(monedaSeleccionada)) {
      setCompraForm((prev) => ({
        ...prev,
        idTipoCambio: null,
        tipoCambioAplicado: '',
      }));
      setCompraErrors((prev) => ({ ...prev, tipoCambioAplicado: '' }));
      setTipoCambioLoading(false);
      return undefined;
    }

    let cancelled = false;
    setTipoCambioLoading(true);

    tipoCambioService.buscarAplicable(fechaTipoCambio)
      .then((data) => {
        if (cancelled) return;

        setCompraForm((prev) => {
          if (
            Number(prev.idMoneda) !== Number(compraForm.idMoneda) ||
            getFechaTipoCambio(prev.fechaEmision || prev.fechaCompras) !== fechaTipoCambio
          ) {
            return prev;
          }

          return {
            ...prev,
            idTipoCambio: data.idTipoCambio ?? null,
            tipoCambioAplicado: data.valor ?? '',
          };
        });
        setCompraErrors((prev) => ({ ...prev, tipoCambioAplicado: '' }));
      })
      .catch((error) => {
        if (cancelled) return;

        const message = getApiErrorMessage(
          error,
          'No existe tipo de cambio registrado para la fecha seleccionada.'
        );

        setCompraForm((prev) => ({
          ...prev,
          idTipoCambio: null,
          tipoCambioAplicado: '',
        }));
        setCompraErrors((prev) => ({
          ...prev,
          tipoCambioAplicado: message,
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
  }, [compraForm.fechaCompras, compraForm.fechaEmision, compraForm.idMoneda, compraOpen, monedas]);

  const handleBuscar = async () => {
    try {
      setLoadingMovimientos(true);
      setServerError('');
      setSearched(true);

      const data = await historialMovimientoService.buscar({
        periodo,
        idArticulo: selectedArticulo?.idArticulo,
        busqueda: selectedArticulo ? '' : busqueda.trim(),
      });

      setMovimientos(Array.isArray(data) ? data : []);
    } catch (error) {
      setServerError(getApiErrorMessage(error, 'No se pudo consultar el historial de movimientos.'));
      setMovimientos([]);
    } finally {
      setLoadingMovimientos(false);
    }
  };

  const handleOpenCompra = () => {
    const fechaActual = getCurrentDateInput();

    setCompraForm({
      ...COMPRA_FORM_DEFAULT,
      idPago: getDefaultPagoId(pagos),
      idMoneda: getDefaultMonedaId(monedas),
      fechaCompras: fechaActual,
      fechaEmision: fechaActual,
      fechaIngresoProducto: fechaActual,
      tipoDocumento: 'FACTURA',
    });
    setCompraErrors({});
    setSelectedProveedorCompra(null);
    setServerError('');
    setSuccessMessage('');
    setCompraOpen(true);
  };

  const handleCloseCompra = () => {
    if (savingCompra) return;

    setCompraOpen(false);
    setCompraForm(COMPRA_FORM_DEFAULT);
    setCompraErrors({});
    setSelectedProveedorCompra(null);
  };

  const handleCompraChange = (field) => (event) => {
    const { value } = event.target;

    setCompraForm((prev) => ({
      ...prev,
      [field]: value,
      ...(field === 'fechaEmision' ? { fechaCompras: value } : {}),
    }));

    if (compraErrors[field]) {
      setCompraErrors((prev) => ({
        ...prev,
        [field]: '',
        ...(field === 'fechaEmision' ? { fechaCompras: '' } : {}),
      }));
    }

    if (serverError) setServerError('');
    if (successMessage) setSuccessMessage('');
  };

  const validateCompraForm = () => {
    const errors = {};

    if (!compraForm.idPago) errors.idPago = 'Seleccione una condicion de pago';
    if (!compraForm.idMoneda) errors.idMoneda = 'Seleccione una moneda';
    if (!compraForm.idProveedor) errors.idProveedor = 'Seleccione un proveedor';
    if (!getCompraFechaBase(compraForm)) errors.fechaEmision = 'La fecha de emision es obligatoria';
    if (!compraForm.fechaIngresoProducto) errors.fechaIngresoProducto = 'La fecha de ingreso es obligatoria';
    if (!compraForm.tipoDocumento?.trim()) errors.tipoDocumento = 'Seleccione un tipo de documento';

    const monedaSeleccionada = monedas.find((moneda) => moneda.idMoneda === Number(compraForm.idMoneda));
    if (monedaSeleccionada && !isMonedaSoles(monedaSeleccionada) && !compraForm.tipoCambioAplicado) {
      errors.tipoCambioAplicado = 'No existe tipo de cambio registrado para la fecha seleccionada.';
    }

    setCompraErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const buildCompraPayload = () => ({
    idPago: Number(compraForm.idPago),
    idMoneda: Number(compraForm.idMoneda),
    idTipoCambio: compraForm.idTipoCambio ? Number(compraForm.idTipoCambio) : null,
    tipoCambioAplicado: compraForm.tipoCambioAplicado ? Number(compraForm.tipoCambioAplicado) : null,
    idProveedor: Number(compraForm.idProveedor),
    fechaCompras: toLocalDateTimeInput(getCompraFechaBase(compraForm)),
    fechaEmision: toLocalDateTimeInput(getCompraFechaBase(compraForm)),
    fechaIngresoProducto: toLocalDateTimeInput(compraForm.fechaIngresoProducto),
    tipoDocumento: compraForm.tipoDocumento?.trim() || 'FACTURA',
    observacion: compraForm.observacion?.trim() || null,
    zonaProduccion: 'DIRECTA',
    numeroLote: 0,
    detalles: [],
    impuestos: [],
    aplicaIgv: false,
    porcentajeIgv: 18,
  });

  const handleSubmitCompra = async () => {
    if (!validateCompraForm()) return;

    try {
      setSavingCompra(true);
      setServerError('');
      setSuccessMessage('');

      await compraService.crear(buildCompraPayload());
      handleCloseCompra();
      setSuccessMessage('Compra registrada correctamente. Registra la recepcion para impactar el stock.');
    } catch (error) {
      setServerError(getApiErrorMessage(error, 'No se pudo registrar la compra.'));
    } finally {
      setSavingCompra(false);
    }
  };

  const handleOpenManual = (tipoMovimiento = 'INGRESO') => {
    setManualErrors({});
    setManualForm({
      ...MANUAL_FORM_DEFAULT,
      tipoMovimiento,
      fechaTransaccion: getCurrentDateTimeInput(),
      articulo: selectedArticulo,
      motivo: getDefaultMotivo(motivosMovimiento),
    });
    setManualOpen(true);
  };

  const handleCloseManual = () => {
    if (savingManual) return;
    setManualOpen(false);
    setManualErrors({});
  };

  const handleManualFieldChange = (field) => (event) => {
    const { value } = event.target;

    setManualForm((prev) => ({
      ...prev,
      [field]: value,
      ...(field === 'motivo'
        ? {
          tipoMovimiento: getTipoMovimientoByMotivo(value, motivosMovimiento) || prev.tipoMovimiento,
        }
        : {}),
    }));
    setManualErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validateManualForm = () => {
    const errors = {};
    const cantidad = Number(manualForm.cantidad);
    const totalSoles = Number(manualForm.totalSoles);

    if (!manualForm.articulo?.idArticulo) errors.articulo = 'Selecciona un articulo';
    if (!manualForm.fechaTransaccion) errors.fechaTransaccion = 'Selecciona una fecha';
    if (!manualForm.motivo?.trim()) errors.motivo = 'Selecciona un motivo';
    if (!cantidad || cantidad <= 0) errors.cantidad = 'Ingresa una cantidad mayor a cero';
    if (Number.isNaN(totalSoles) || totalSoles < 0) errors.totalSoles = 'Ingresa un total valido';

    setManualErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const syncArticuloStock = (movimiento) => {
    if (!movimiento?.idArticulo) return;

    setArticulos((prev) =>
      prev.map((articulo) =>
        articulo.idArticulo === movimiento.idArticulo
          ? { ...articulo, stock: movimiento.saldo }
          : articulo
      )
    );

    setSelectedArticulo((prev) =>
      prev?.idArticulo === movimiento.idArticulo ? { ...prev, stock: movimiento.saldo } : prev
    );
  };

  const handleSubmitManual = async () => {
    if (!validateManualForm()) return;

    try {
      setSavingManual(true);
      setServerError('');

      const movimiento = await historialMovimientoService.registrarManual({
        idArticulo: manualForm.articulo.idArticulo,
        tipoMovimiento: manualForm.tipoMovimiento,
        fechaTransaccion: manualForm.fechaTransaccion,
        motivo: manualForm.motivo.trim(),
        detalle: manualForm.detalle.trim() || undefined,
        responsable: manualForm.responsable.trim() || undefined,
        cantidad: Number(manualForm.cantidad),
        totalSoles: Number(manualForm.totalSoles),
      });

      syncArticuloStock(movimiento);
      setManualOpen(false);

      if (searched) {
        await handleBuscar();
      } else {
        setMovimientos((prev) => [movimiento, ...prev]);
        setSearched(true);
      }
    } catch (error) {
      setServerError(getApiErrorMessage(error, 'No se pudo registrar el movimiento manual.'));
    } finally {
      setSavingManual(false);
    }
  };

  const showInitialState = !searched;
  const showEmptyState = searched && movimientos.length === 0;
  const showLoading = loadingArticulos || loadingMovimientos;

  return (
    <Box>
      <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e2e8f0' }}>
        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
          <Stack spacing={2.5}>
            {successMessage ? (
              <Alert severity="success">{successMessage}</Alert>
            ) : null}

            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={1.5}
              sx={{ alignItems: { xs: 'stretch', md: 'center' } }}
            >
              <Button
                variant="contained"
                onClick={handleOpenCompra}
                startIcon={<Icon name="inventory_2" size={18} color="#fff" />}
                sx={{
                  flex: 1,
                  textTransform: 'none',
                  fontWeight: 700,
                  boxShadow: 'none',
                  backgroundColor: '#16a34a',
                  '&:hover': { backgroundColor: '#15803d', boxShadow: 'none' },
                }}
              >
                Registro compra
              </Button>

              <Button
                variant="contained"
                onClick={() => handleOpenManual('INGRESO')}
                startIcon={<Icon name="sync_alt" size={18} color="#fff" />}
                sx={{
                  flex: 1,
                  textTransform: 'none',
                  fontWeight: 700,
                  boxShadow: 'none',
                  backgroundColor: '#0284c7',
                  '&:hover': { backgroundColor: '#0369a1', boxShadow: 'none' },
                }}
              >
                Entradas / Salidas
              </Button>
            </Stack>

            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={1.5}
              sx={{ alignItems: { xs: 'stretch', md: 'center' } }}
            >
              <TextField
                label="Periodo"
                type="month"
                size="small"
                value={periodo}
                onChange={(event) => {
                  setPeriodo(event.target.value);
                  setSearched(false);
                  setMovimientos([]);
                }}
                sx={{ minWidth: { xs: '100%', md: 220 } }}
                slotProps={{
                  inputLabel: { shrink: true },
                }}
              />

              <Autocomplete
                freeSolo
                fullWidth
                size="small"
                loading={loadingArticulos}
                options={articulos}
                value={selectedArticulo}
                inputValue={busqueda}
                onInputChange={(_event, value) => {
                  setBusqueda(value);
                  setSearched(false);
                  setMovimientos([]);
                }}
                onChange={(_event, value) => {
                  if (typeof value === 'string') {
                    setSelectedArticulo(null);
                    setBusqueda(value);
                  } else {
                    setSelectedArticulo(value);
                    setBusqueda(
                      value
                        ? `${formatArticuloCode(value.idArticulo)} - ${value.descripcion || ''}`
                        : ''
                    );
                  }

                  setSearched(false);
                  setMovimientos([]);
                }}
                getOptionLabel={(option) => {
                  if (typeof option === 'string') return option;
                  return option
                    ? `${formatArticuloCode(option.idArticulo)} - ${option.descripcion || ''}`
                    : '';
                }}
                isOptionEqualToValue={(option, value) =>
                  Boolean(value) && option.idArticulo === value.idArticulo
                }
                noOptionsText="No se encontraron articulos"
                loadingText="Cargando articulos..."
                renderInput={(params) => (
                  <TextField
                    {...getAutocompleteTextFieldProps(params)}
                    label="Articulo"
                    placeholder="Codigo o descripcion"
                  />
                )}
              />

              <Button
                variant="contained"
                onClick={handleBuscar}
                disabled={loadingMovimientos}
                startIcon={<Icon name="search" size={18} color="#fff" />}
                sx={{
                  minWidth: { xs: '100%', md: 180 },
                  textTransform: 'none',
                  fontWeight: 700,
                  boxShadow: 'none',
                }}
              >
                {loadingMovimientos ? 'Buscando...' : 'Buscar'}
              </Button>
            </Stack>

            {serverError ? <Alert severity="error">{serverError}</Alert> : null}

            <TableContainer
              component={Paper}
              elevation={0}
              sx={{
                border: '1px solid #e2e8f0',
                borderRadius: 2.5,
                overflowX: 'auto',
              }}
            >
              <Table sx={{ minWidth: 980 }}>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f8fafc' }}>
                    <TableCell sx={{ fontWeight: 700 }}>ID MOVIMIENTO</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>PROVEEDOR/MOTIVO</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>TIPO MOVIMIENTO</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>DETALLE</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>FECHA TRANSACCION</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>TOTAL S/.</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {showLoading ? (
                    <TableSkeletonRows columns={6} />
                  ) : null}

                  {!showLoading && showInitialState ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4, color: '#64748b' }}>
                        Selecciona filtros y ejecuta la busqueda.
                      </TableCell>
                    </TableRow>
                  ) : null}

                  {!showLoading && showEmptyState ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4, color: '#64748b' }}>
                        No hay movimientos registrados.
                      </TableCell>
                    </TableRow>
                  ) : null}

                  {!showLoading && movimientos.length > 0
                    ? movimientos.map((movimiento) => (
                        <TableRow key={movimiento.idMovimiento} hover>
                          <TableCell>
                            <Typography sx={{ fontSize: '0.84rem', fontWeight: 700, color: '#0f172a' }}>
                              {movimiento.codigoMovimiento || movimiento.documento || '-'}
                            </Typography>
                          </TableCell>
                          <TableCell>{movimiento.proveedorMotivo || '-'}</TableCell>
                          <TableCell>
                            <Chip
                              label={normalizeTipoMovimiento(movimiento.tipoMovimiento) || '-'}
                              size="small"
                              sx={{
                                ...getMovimientoColor(movimiento.tipoMovimiento),
                                fontWeight: 700,
                                borderRadius: 1.5,
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography sx={{ fontSize: '0.84rem', color: '#0f172a' }}>
                              {movimiento.detalle || movimiento.descripcionArticulo || '-'}
                            </Typography>
                          </TableCell>
                          <TableCell>{formatDatePeru(movimiento.fechaTransaccion || movimiento.fechaMovimiento)}</TableCell>
                          <TableCell align="right">{formatCurrencySoles(movimiento.totalSoles)}</TableCell>
                        </TableRow>
                      ))
                    : null}
                </TableBody>
              </Table>
            </TableContainer>
          </Stack>
        </CardContent>
      </Card>

      <Dialog open={compraOpen} onClose={handleCloseCompra} fullWidth maxWidth="md">
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            py: 1.5,
            color: '#fff',
            fontWeight: 700,
            backgroundColor: '#4caf50',
          }}
        >
          Crear Registro de Compra
          <IconButton
            size="small"
            onClick={handleCloseCompra}
            disabled={savingCompra}
            sx={{ color: '#fff' }}
          >
            <Icon name="close" size={22} color="#fff" />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ pt: 2.5 }}>
          {loadingCompraCatalogos ? (
            <FormSkeleton fields={8} />
          ) : (
            <Stack spacing={2.25}>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
                <TextField
                  fullWidth
                  type="date"
                  label="Fecha Emision"
                  value={compraForm.fechaEmision}
                  onChange={handleCompraChange('fechaEmision')}
                  error={!!compraErrors.fechaEmision}
                  helperText={compraErrors.fechaEmision}
                  disabled={savingCompra}
                  slotProps={{ inputLabel: { shrink: true } }}
                />

                <TextField
                  fullWidth
                  type="date"
                  label="Fecha Ingreso Producto"
                  value={compraForm.fechaIngresoProducto}
                  onChange={handleCompraChange('fechaIngresoProducto')}
                  error={!!compraErrors.fechaIngresoProducto}
                  helperText={compraErrors.fechaIngresoProducto}
                  disabled={savingCompra}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              </Stack>

              <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
                <Autocomplete
                  fullWidth
                  options={proveedores}
                  value={selectedProveedorCompra}
                  onChange={(_event, value) => {
                    setSelectedProveedorCompra(value);
                    setCompraForm((prev) => ({
                      ...prev,
                      idProveedor: value ? value.idProveedor : null,
                    }));
                    setCompraErrors((prev) => ({ ...prev, idProveedor: '' }));
                  }}
                  getOptionLabel={(option) => option?.razonSocial || ''}
                  isOptionEqualToValue={(option, value) => option.idProveedor === value.idProveedor}
                  disabled={savingCompra}
                  noOptionsText="No se encontraron proveedores"
                  renderInput={(params) => (
                    <TextField
                      {...getAutocompleteTextFieldProps(params)}
                      label="NOMBRE PROVEEDOR"
                      error={!!compraErrors.idProveedor}
                      helperText={compraErrors.idProveedor}
                    />
                  )}
                />
              </Stack>

              <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
                <TextField
                  select
                  fullWidth
                  label="Tipo"
                  value={compraForm.tipoDocumento}
                  onChange={handleCompraChange('tipoDocumento')}
                  error={!!compraErrors.tipoDocumento}
                  helperText={compraErrors.tipoDocumento}
                  disabled={savingCompra}
                >
                  <MenuItem value="FACTURA">FACTURA</MenuItem>
                  <MenuItem value="BOLETA">BOLETA</MenuItem>
                  <MenuItem value="GUIA">GUIA</MenuItem>
                  <MenuItem value="OTRO">OTRO</MenuItem>
                </TextField>
              </Stack>

              <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
                <TextField
                  select
                  fullWidth
                  label="Modo Pago"
                  value={compraForm.idPago}
                  onChange={handleCompraChange('idPago')}
                  error={!!compraErrors.idPago}
                  helperText={compraErrors.idPago}
                  disabled={savingCompra}
                >
                  {pagos.map((pago) => (
                    <MenuItem key={pago.idPago} value={pago.idPago}>
                      {String(pago.pago || '').toUpperCase()}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  select
                  fullWidth
                  label="Moneda"
                  value={compraForm.idMoneda}
                  onChange={handleCompraChange('idMoneda')}
                  error={!!compraErrors.idMoneda || !!compraErrors.tipoCambioAplicado}
                  helperText={compraErrors.idMoneda || compraErrors.tipoCambioAplicado}
                  disabled={savingCompra || tipoCambioLoading}
                >
                  {monedas.map((moneda) => (
                    <MenuItem key={moneda.idMoneda} value={moneda.idMoneda}>
                      {moneda.simbolo ? `${moneda.simbolo} ` : ''}
                      {moneda.nombre} ({moneda.codigo})
                    </MenuItem>
                  ))}
                </TextField>
              </Stack>

              <TextField
                fullWidth
                label="OBSERVACION"
                value={compraForm.observacion}
                onChange={handleCompraChange('observacion')}
                disabled={savingCompra}
              />
            </Stack>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2.25 }}>
          <Button
            fullWidth
            variant="contained"
            onClick={handleSubmitCompra}
            disabled={savingCompra || loadingCompraCatalogos}
            startIcon={<Icon name="add_circle" size={18} color="#fff" />}
            sx={{
              py: 1.25,
              textTransform: 'uppercase',
              fontWeight: 800,
              letterSpacing: 0,
              boxShadow: 'none',
              backgroundColor: '#4caf50',
              '&:hover': { backgroundColor: '#43a047', boxShadow: 'none' },
            }}
          >
            {savingCompra ? 'Guardando...' : 'Crear documento'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={manualOpen} onClose={handleCloseManual} fullWidth maxWidth="md">
        <DialogTitle sx={{ fontWeight: 700 }}>
          Crear movimiento de entrada / salida
        </DialogTitle>

        <DialogContent dividers>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
              <TextField
                select
                fullWidth
                label="Tipo movimiento"
                value={manualForm.tipoMovimiento}
                onChange={handleManualFieldChange('tipoMovimiento')}
                disabled={savingManual}
              >
                <MenuItem value="INGRESO">INGRESO</MenuItem>
                <MenuItem value="SALIDA">SALIDA</MenuItem>
              </TextField>

              <TextField
                fullWidth
                label="Fecha transaccion"
                type="datetime-local"
                value={manualForm.fechaTransaccion}
                onChange={handleManualFieldChange('fechaTransaccion')}
                error={!!manualErrors.fechaTransaccion}
                helperText={manualErrors.fechaTransaccion}
                disabled={savingManual}
                slotProps={{
                  inputLabel: { shrink: true },
                }}
              />
            </Stack>

            <Autocomplete
              fullWidth
              loading={loadingArticulos}
              options={articulos}
              value={manualForm.articulo}
              onChange={(_event, value) => {
                setManualForm((prev) => ({ ...prev, articulo: value }));
                setManualErrors((prev) => ({ ...prev, articulo: '' }));
              }}
              getOptionLabel={(option) =>
                option ? `${formatArticuloCode(option.idArticulo)} - ${option.descripcion || ''}` : ''
              }
              isOptionEqualToValue={(option, value) => option.idArticulo === value.idArticulo}
              noOptionsText="No se encontraron articulos"
              loadingText="Cargando articulos..."
              disabled={savingManual}
              renderInput={(params) => (
                <TextField
                  {...getAutocompleteTextFieldProps(params)}
                  label="Articulo"
                  error={!!manualErrors.articulo}
                  helperText={manualErrors.articulo}
                />
              )}
            />

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
              <TextField
                select
                fullWidth
                label="Motivo"
                value={manualForm.motivo}
                onChange={handleManualFieldChange('motivo')}
                error={!!manualErrors.motivo}
                helperText={manualErrors.motivo}
                disabled={savingManual || loadingMotivos}
              >
                {motivosMovimiento.map((motivo) => (
                  <MenuItem key={motivo.codigo || motivo.nombre} value={motivo.nombre}>
                    {motivo.nombre}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                fullWidth
                label="Responsable"
                value={manualForm.responsable}
                onChange={handleManualFieldChange('responsable')}
                disabled={savingManual}
              />
            </Stack>

            <TextField
              fullWidth
              label="Detalle"
              value={manualForm.detalle}
              onChange={handleManualFieldChange('detalle')}
              disabled={savingManual}
              multiline
              minRows={2}
            />

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
              <TextField
                fullWidth
                label="Cantidad"
                type="number"
                value={manualForm.cantidad}
                onChange={handleManualFieldChange('cantidad')}
                error={!!manualErrors.cantidad}
                helperText={manualErrors.cantidad}
                disabled={savingManual}
                slotProps={{
                  htmlInput: { min: 0, step: '0.01' },
                }}
                sx={{
                  '& input[type=number]': {
                    MozAppearance: 'textfield',
                  },
                  '& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button': {
                    WebkitAppearance: 'none',
                    margin: 0,
                  },
                }}
              />

              <TextField
                fullWidth
                label="Total S/."
                type="number"
                value={manualForm.totalSoles}
                onChange={handleManualFieldChange('totalSoles')}
                error={!!manualErrors.totalSoles}
                helperText={manualErrors.totalSoles || 'Importe valorizado en soles'}
                disabled={savingManual}
                slotProps={{
                  htmlInput: { min: 0, step: '0.01' },
                }}
              />
            </Stack>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleCloseManual} disabled={savingManual} sx={{ textTransform: 'none' }}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmitManual}
            disabled={savingManual}
            startIcon={<Icon name="add_circle" size={18} color="#fff" />}
            sx={{ textTransform: 'none', fontWeight: 700, boxShadow: 'none' }}
          >
            {savingManual ? 'Guardando...' : 'Crear documento de ajuste'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
