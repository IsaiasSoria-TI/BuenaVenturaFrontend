import React from 'react';
import PropTypes from 'prop-types';

import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
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
import FormSkeleton from '../../components/loading/FormSkeleton';

import { cuentaPagarService } from '../../services/cuentaPagarService';
import { getAutocompleteTextFieldProps } from '../../utils/autocompleteTextField';
import {
  formatCompraCode,
  formatDateTimePeru,
  formatRecepcionCode,
} from '../../utils/formatters';
import { useAutoClearMessage } from '../../utils/useAutoClearMessage';
import { getApiErrorMessage } from '../../utils/getApiErrorMessage';

// Valores iniciales del formulario cuando se abre el modal para registrar una cuenta.
const initialForm = {
  tipoFactura: 'UNICA',
  numeroFactura: '',
  moneda: '',
  codigoDetRet: '',
};

function getDefaultMonedaCodigo(monedas) {
  const monedaPen = monedas.find((moneda) => moneda.codigo === 'PEN');
  return monedaPen?.codigo || monedas[0]?.codigo || '';
}

function formatMonedaOption(moneda) {
  const simbolo = moneda.simbolo ? ` (${moneda.simbolo})` : '';
  return `${moneda.codigo} - ${moneda.nombre}${simbolo}`;
}

function formatNumber(value) {
  if (value === null || value === undefined || value === '') return '0.00';

  const number = Number(value);
  if (Number.isNaN(number)) return '0.00';

  return number.toFixed(2);
}

function getCurrencyPrefix(item) {
  const normalize = (value) => String(value || '').trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
  const codigo = normalize(item?.codigo || item?.codigoMoneda);
  const nombre = normalize(item?.nombre || item?.moneda);
  const simbolo = String(item?.simbolo || item?.simboloMoneda || '').trim();

  if (codigo === 'PEN' || codigo === 'SOL' || nombre === 'SOLES' || nombre === 'SOL') return 'S/';
  if (codigo === 'USD' || nombre.includes('DOLAR')) return 'USD';
  return codigo || simbolo || item?.nombre || item?.moneda || '';
}

function formatCurrency(value, item) {
  const prefix = getCurrencyPrefix(item);
  const amount = formatNumber(value);
  return prefix ? `${prefix} ${amount}` : amount;
}

function getEstadoChipStyles(estado) {
  if (estado === 'Completo' || estado === 'Pagado') {
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

  return {
    backgroundColor: '#fef3c7',
    color: '#d97706',
  };
}

// Tabla interna de recepciones seleccionables para armar una cuenta por pagar.
function RecepcionesTable({
  recepciones,
  selectedRecepciones,
  toggleRecepcion,
  isRecepcionSelected,
  tipoFactura,
  updateNumeroFacturaDetalle,
  errors,
}) {
  const mostrarFacturaPorRecepcion = tipoFactura === 'MULTIPLE';
  const errorNumeroFacturaDetalle = !!errors.numeroFacturaDetalle;

  return (
    <TableContainer
      component={Paper}
      elevation={0}
      sx={{
        border: '1px solid #e2e8f0',
        borderRadius: 2.5,
        overflowX: 'auto',
      }}
    >
      <Table size="small">
        <TableHead>
          <TableRow sx={{ backgroundColor: '#f8fafc' }}>
            <TableCell padding="checkbox" sx={{ fontWeight: 700 }}>SEL.</TableCell>
            <TableCell sx={{ fontWeight: 700, px: 1 }}>RECEPCIÓN</TableCell>
            <TableCell sx={{ fontWeight: 700, px: 1 }}>FECHA</TableCell>
            <TableCell sx={{ fontWeight: 700, px: 1 }}>RECIBIDO</TableCell>
            <TableCell sx={{ fontWeight: 700, px: 1 }}>ESTADO</TableCell>
            {mostrarFacturaPorRecepcion ? (
              <TableCell sx={{ fontWeight: 700, px: 1 }}>FACTURA</TableCell>
            ) : null}
          </TableRow>
        </TableHead>

        <TableBody>
          {recepciones.map((recepcion) => {
            const seleccionada = isRecepcionSelected(recepcion.idRecepciones);
            const recepcionSeleccionada = selectedRecepciones.find(
              (item) => item.idRecepciones === recepcion.idRecepciones
            );

            return (
              <TableRow key={recepcion.idRecepciones} hover>
                <TableCell padding="checkbox">
                  <Checkbox
                    size="small"
                    checked={seleccionada}
                    onChange={() => toggleRecepcion(recepcion)}
                  />
                </TableCell>

                <TableCell sx={{ px: 1 }}>{formatRecepcionCode(recepcion.idRecepciones)}</TableCell>
                <TableCell sx={{ px: 1 }}>{formatDateTimePeru(recepcion.fechaRecepcion)}</TableCell>
                <TableCell sx={{ px: 1 }}>{formatNumber(recepcion.recibido)}</TableCell>

                <TableCell sx={{ px: 1 }}>
                  <Chip
                    label={recepcion.estadoRecepcion || '-'}
                    size="small"
                    sx={{
                      fontWeight: 700,
                      ...getEstadoChipStyles(recepcion.estadoRecepcion),
                    }}
                  />
                </TableCell>

                {mostrarFacturaPorRecepcion ? (
                  <TableCell sx={{ px: 1, minWidth: 170 }}>
                    {seleccionada ? (
                      <TextField
                        fullWidth
                        size="small"
                        label="N° factura"
                        value={recepcionSeleccionada?.numeroFactura || ''}
                        onChange={(event) =>
                          updateNumeroFacturaDetalle(
                            recepcion.idRecepciones,
                            event.target.value
                          )
                        }
                        error={errorNumeroFacturaDetalle}
                      />
                    ) : (
                      <Typography sx={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                        Selecciona la recepción
                      </Typography>
                    )}
                  </TableCell>
                ) : null}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

RecepcionesTable.propTypes = {
  recepciones: PropTypes.arrayOf(
    PropTypes.shape({
      idRecepciones: PropTypes.number,
      fechaRecepcion: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.instanceOf(Date),
      ]),
      recibido: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      estadoRecepcion: PropTypes.string,
    })
  ).isRequired,
  selectedRecepciones: PropTypes.arrayOf(
    PropTypes.shape({
      idCompras: PropTypes.number,
      idRecepciones: PropTypes.number,
      numeroFactura: PropTypes.string,
    })
  ).isRequired,
  toggleRecepcion: PropTypes.func.isRequired,
  isRecepcionSelected: PropTypes.func.isRequired,
  tipoFactura: PropTypes.string.isRequired,
  updateNumeroFacturaDetalle: PropTypes.func.isRequired,
  errors: PropTypes.objectOf(PropTypes.string).isRequired,
};

export default function ModalCuentaPagar({ open, onClose, onSaved, monedas, manual = false }) {
  const [comprasValidas, setComprasValidas] = React.useState([]);
  const [detalleCompra, setDetalleCompra] = React.useState(null);

  const [comprasLoading, setComprasLoading] = React.useState(true);
  const [detalleLoading, setDetalleLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  const [selectedCompra, setSelectedCompra] = React.useState(null);
  const [selectedRecepciones, setSelectedRecepciones] = React.useState([]);

  const [form, setForm] = React.useState(initialForm);
  const [errors, setErrors] = React.useState({});
  const [serverError, setServerError] = React.useState('');
  const [serverSuccess, setServerSuccess] = React.useState('');

  useAutoClearMessage(serverSuccess, setServerSuccess);

  const cargarComprasValidas = React.useCallback(async () => {
    try {
      setComprasLoading(true);
      setServerError('');

      const data = await cuentaPagarService.listarComprasValidas();
      setComprasValidas(Array.isArray(data) ? data : []);
    } catch (error) {

      setServerError(getApiErrorMessage(error, 'No se pudo listar las compras validas.'));
    } finally {
      setComprasLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (!open) return;

    setForm({
      ...initialForm,
      moneda: getDefaultMonedaCodigo(monedas),
    });
    setErrors({});
    setServerError('');
    setServerSuccess('');
    setSelectedCompra(null);
    setDetalleCompra(null);
    setSelectedRecepciones([]);
    if (manual) {
      setComprasValidas([]);
      setComprasLoading(false);
      return;
    }

    cargarComprasValidas();
  }, [open, cargarComprasValidas, monedas, manual]);

  React.useEffect(() => {
    if (!open || form.moneda || monedas.length === 0) return;

    setForm((prev) => ({
      ...prev,
      moneda: getDefaultMonedaCodigo(monedas),
    }));
  }, [open, form.moneda, monedas]);

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

  const cargarDetalleCompra = React.useCallback(async (idCompras) => {
    try {
      setDetalleLoading(true);
      setDetalleCompra(null);
      setSelectedRecepciones([]);
      setServerError('');
      setServerSuccess('');

      const data = await cuentaPagarService.verDetalleCompra(idCompras);
      setDetalleCompra(data);
      setForm((prev) => ({
        ...prev,
        moneda: data.codigoMoneda || prev.moneda,
      }));
    } catch (error) {

      setServerError(getApiErrorMessage(error, 'No se pudo cargar el detalle de la compra.'));
    } finally {
      setDetalleLoading(false);
    }
  }, []);

  const handleSelectCompra = (_event, newValue) => {
    setSelectedCompra(newValue);
    setDetalleCompra(null);
    setSelectedRecepciones([]);
    setServerError('');
    setServerSuccess('');

    if (newValue?.idCompras) {
      cargarDetalleCompra(newValue.idCompras);
    }

    if (errors.idCompras) {
      setErrors((prev) => ({
        ...prev,
        idCompras: '',
      }));
    }
  };

  const toggleRecepcion = React.useCallback(
    (recepcion) => {
      if (!detalleCompra) return;

      setSelectedRecepciones((prev) => {
        const exists = prev.some(
          (item) => item.idRecepciones === recepcion.idRecepciones
        );

        if (exists) {
          return prev.filter(
            (item) => item.idRecepciones !== recepcion.idRecepciones
          );
        }

        return [
          ...prev,
          {
            idCompras: detalleCompra.idCompras,
            idRecepciones: recepcion.idRecepciones,
            numeroFactura: '',
          },
        ];
      });

      setErrors((prev) => ({
        ...prev,
        detalles: '',
      }));
    },
    [detalleCompra]
  );

  const updateNumeroFacturaDetalle = React.useCallback((idRecepciones, value) => {
    setSelectedRecepciones((prev) =>
      prev.map((item) =>
        item.idRecepciones === idRecepciones
          ? { ...item, numeroFactura: value }
          : item
      )
    );
  }, []);

  const isRecepcionSelected = React.useCallback(
    (idRecepciones) =>
      selectedRecepciones.some((item) => item.idRecepciones === idRecepciones),
    [selectedRecepciones]
  );

  const validate = React.useCallback(() => {
    const newErrors = {};

    if (!manual && !selectedCompra?.idCompras) {
      newErrors.idCompras = 'Seleccione una compra válida';
    }

    if (!form.tipoFactura) {
      newErrors.tipoFactura = 'Seleccione el tipo de factura';
    }

    if (!form.moneda || !monedas.some((moneda) => moneda.codigo === form.moneda)) {
      newErrors.moneda = 'Seleccione la moneda';
    }

    if (!form.codigoDetRet.trim()) {
      newErrors.codigoDetRet = 'El código de detracción/retención es obligatorio';
    }

    if (!manual && selectedRecepciones.length === 0) {
      newErrors.detalles = 'Seleccione al menos una recepción';
    }

    if (form.tipoFactura === 'UNICA' && !form.numeroFactura.trim()) {
      newErrors.numeroFactura = 'El número de factura es obligatorio';
    }

    if (!manual && form.tipoFactura === 'MULTIPLE') {
      const faltaFactura = selectedRecepciones.some(
        (item) => !item.numeroFactura?.trim()
      );

      if (faltaFactura) {
        newErrors.numeroFacturaDetalle =
          'Cada recepción seleccionada debe tener número de factura';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [selectedCompra, form, selectedRecepciones, monedas, manual]);

  const buildPayload = React.useCallback(() => {
    if (manual) {
      return {
        manual: true,
        tipoFactura: 'UNICA',
        numeroFactura: form.numeroFactura.trim(),
        moneda: form.moneda,
        codigoDetRet: form.codigoDetRet.trim(),
        detalles: [],
      };
    }

    return {
      manual: false,
      tipoFactura: form.tipoFactura,
      numeroFactura: form.tipoFactura === 'UNICA' ? form.numeroFactura.trim() : null,
      moneda: form.moneda,
      codigoDetRet: form.codigoDetRet.trim(),
      detalles: selectedRecepciones.map((item) => ({
        idCompras: item.idCompras,
        idRecepciones: item.idRecepciones,
        numeroFactura:
          form.tipoFactura === 'MULTIPLE'
            ? item.numeroFactura?.trim() || null
            : null,
      })),
    };
  }, [form, selectedRecepciones, manual]);

  const handleSubmit = React.useCallback(async () => {
    if (!validate()) return;

    try {
      setSaving(true);
      setServerError('');
      setServerSuccess('');

      const payload = buildPayload();
      await cuentaPagarService.registrar(payload);

      setServerSuccess('Cuenta por pagar registrada correctamente.');

      window.setTimeout(() => {
        onSaved();
      }, 500);
    } catch (error) {

      setServerError(getApiErrorMessage(error, 'No se pudo registrar la cuenta por pagar.'));
    } finally {
      setSaving(false);
    }
  }, [validate, buildPayload, onSaved]);

  const recepcionesDisponibles = detalleCompra?.recepcionesDisponibles || [];
  const hasRecepcionesDisponibles = recepcionesDisponibles.length > 0;

  const showFacturaUnica = form.tipoFactura === 'UNICA';
  const showFacturaMultiple = form.tipoFactura === 'MULTIPLE';

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <DialogTitle sx={{ fontWeight: 700 }}>Añadir cuenta por pagar</DialogTitle>

      <DialogContent dividers sx={{ pt: 2.5 }}>
        <Stack spacing={2}>
          {serverError && <Alert severity="error">{serverError}</Alert>}
          {serverSuccess && <Alert severity="success">{serverSuccess}</Alert>}

          {manual ? (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' },
                gap: 2,
              }}
            >
              <TextField
                fullWidth
                label="Numero de factura"
                value={form.numeroFactura}
                onChange={handleChange('numeroFactura')}
                error={!!errors.numeroFactura}
                helperText={errors.numeroFactura || ''}
              />

              <TextField
                fullWidth
                label="Moneda"
                select
                value={form.moneda}
                onChange={handleChange('moneda')}
                error={!!errors.moneda}
                helperText={errors.moneda || (monedas.length === 0 ? 'No hay monedas configuradas' : '')}
              >
                {monedas.map((moneda) => (
                  <MenuItem key={moneda.idMoneda} value={moneda.codigo}>
                    {formatMonedaOption(moneda)}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                fullWidth
                label="Codigo de detraccion/retencion"
                value={form.codigoDetRet}
                onChange={handleChange('codigoDetRet')}
                error={!!errors.codigoDetRet}
                helperText={errors.codigoDetRet || ''}
              />
            </Box>
          ) : comprasLoading ? (
            <FormSkeleton fields={5} />
          ) : (
            <>
              <Autocomplete
                fullWidth
                options={comprasValidas}
                value={selectedCompra}
                onChange={handleSelectCompra}
                getOptionLabel={(option) =>
                  option
                    ? `Compra ${formatCompraCode(option.idCompras)} - ${option.ruc} - ${option.razonSocial}`
                    : ''
                }
                isOptionEqualToValue={(option, value) =>
                  option.idCompras === value.idCompras
                }
                filterOptions={(options, state) => {
                  const input = state.inputValue.toLowerCase().trim();

                  return options
                    .filter(
                      (option) =>
                        String(option.idCompras).includes(input) ||
                        formatCompraCode(option.idCompras).toLowerCase().includes(input) ||
                        option.ruc?.toLowerCase().includes(input) ||
                        option.razonSocial?.toLowerCase().includes(input) ||
                        option.articulo?.toLowerCase().includes(input)
                    )
                    .slice(0, 20);
                }}
                renderOption={(props, option) => {
                  const { key, ...optionProps } = props;

                  return (
                  <Box key={key} component="li" {...optionProps}>
                    <Box>
                      <Typography sx={{ fontWeight: 700, fontSize: '0.92rem' }}>
                        Compra {formatCompraCode(option.idCompras)}
                      </Typography>
                      <Typography sx={{ fontSize: '0.82rem', color: '#64748b' }}>
                        {option.ruc} - {option.razonSocial}
                      </Typography>
                      <Typography sx={{ fontSize: '0.8rem', color: '#64748b' }}>
                        {option.articulo || 'Varios artículos'} | Importe: {formatCurrency(option.costoTotal, option)}
                      </Typography>
                    </Box>
                  </Box>
                  );
                }}
                renderInput={(params) => (
                  <TextField
                    {...getAutocompleteTextFieldProps(params)}
                    label="Compras con recepciones válidas"
                    placeholder="Busca por compra, RUC o proveedor"
                    error={!!errors.idCompras}
                    helperText={errors.idCompras || ''}
                  />
                )}
              />

              {detalleLoading ? (
                <FormSkeleton fields={4} />
              ) : null}

              {!detalleLoading && detalleCompra ? (
                <>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      backgroundColor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    <Typography sx={{ fontWeight: 700, color: '#0f172a', mb: 1.5 }}>
                      Detalle de compra
                    </Typography>

                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' },
                        gap: 1.5,
                      }}
                    >
                      <Box>
                        <Typography sx={{ fontSize: '0.8rem', color: '#64748b' }}>
                          Operación
                        </Typography>
                        <Typography sx={{ fontWeight: 700 }}>
                          {formatCompraCode(detalleCompra.numeroOperacion)}
                        </Typography>
                      </Box>

                      <Box>
                        <Typography sx={{ fontSize: '0.8rem', color: '#64748b' }}>
                          RUC
                        </Typography>
                        <Typography>{detalleCompra.ruc}</Typography>
                      </Box>

                      <Box>
                        <Typography sx={{ fontSize: '0.8rem', color: '#64748b' }}>
                          Proveedor
                        </Typography>
                        <Typography sx={{ fontWeight: 700 }}>
                          {detalleCompra.razonSocial}
                        </Typography>
                      </Box>

                      <Box>
                        <Typography sx={{ fontSize: '0.8rem', color: '#64748b' }}>
                          Moneda
                        </Typography>
                        <Typography>{getCurrencyPrefix(detalleCompra) || '-'}</Typography>
                      </Box>

                      <Box>
                        <Typography sx={{ fontSize: '0.8rem', color: '#64748b' }}>
                          Importe compra
                        </Typography>
                        <Typography>{formatCurrency(detalleCompra.importe, detalleCompra)}</Typography>
                      </Box>

                      <Box>
                        <Typography sx={{ fontSize: '0.8rem', color: '#64748b' }}>
                          Condición de pago
                        </Typography>
                        <Typography>{detalleCompra.condicionPago}</Typography>
                      </Box>
                    </Box>
                  </Box>

                  <Divider />

                  <Box>
                    <Typography sx={{ fontWeight: 700, color: '#0f172a', mb: 1.5 }}>
                      Recepciones disponibles
                    </Typography>

                    {errors.detalles ? (
                      <Alert severity="warning" sx={{ mb: 2 }}>
                        {errors.detalles}
                      </Alert>
                    ) : null}

                    {hasRecepcionesDisponibles ? (
                      <RecepcionesTable
                        recepciones={recepcionesDisponibles}
                        selectedRecepciones={selectedRecepciones}
                        toggleRecepcion={toggleRecepcion}
                        isRecepcionSelected={isRecepcionSelected}
                        tipoFactura={form.tipoFactura}
                        updateNumeroFacturaDetalle={updateNumeroFacturaDetalle}
                        errors={errors}
                      />
                    ) : (
                      <Alert severity="info">
                        Esta compra no tiene recepciones disponibles.
                      </Alert>
                    )}
                  </Box>

                  <Divider />

                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr 1fr' },
                      gap: 2,
                    }}
                  >
                    <TextField
                      select
                      fullWidth
                      label="Tipo factura"
                      value={form.tipoFactura}
                      onChange={handleChange('tipoFactura')}
                      error={!!errors.tipoFactura}
                      helperText={errors.tipoFactura || ''}
                    >
                      <MenuItem value="UNICA">Única</MenuItem>
                      <MenuItem value="MULTIPLE">Múltiple</MenuItem>
                    </TextField>

                    <TextField
                      fullWidth
                      label="Moneda"
                      select
                      value={form.moneda}
                      onChange={handleChange('moneda')}
                      disabled
                      error={!!errors.moneda}
                      helperText={errors.moneda || 'Moneda tomada de la compra'}
                      sx={{
                        '& .MuiInputBase-root.Mui-disabled': {
                          backgroundColor: '#f1f5f9',
                        },
                        '& .MuiInputBase-input.Mui-disabled': {
                          WebkitTextFillColor: '#475569',
                        },
                      }}
                    >
                      {monedas.map((moneda) => (
                        <MenuItem key={moneda.idMoneda} value={moneda.codigo}>
                          {formatMonedaOption(moneda)}
                        </MenuItem>
                      ))}
                    </TextField>

                    <TextField
                      fullWidth
                      label="Código de detracción/retención"
                      value={form.codigoDetRet}
                      onChange={handleChange('codigoDetRet')}
                      error={!!errors.codigoDetRet}
                      helperText={errors.codigoDetRet || ''}
                    />

                    {showFacturaUnica ? (
                      <TextField
                        fullWidth
                        label="Número de factura"
                        value={form.numeroFactura}
                        onChange={handleChange('numeroFactura')}
                        error={!!errors.numeroFactura}
                        helperText={errors.numeroFactura || ''}
                      />
                    ) : null}

                    {showFacturaMultiple ? (
                      <TextField
                        fullWidth
                        label="Número de factura"
                        value="Se registra por recepción"
                        slotProps={{ input: { readOnly: true } }}
                        error={!!errors.numeroFacturaDetalle}
                        helperText={errors.numeroFacturaDetalle || ''}
                      />
                    ) : null}
                  </Box>
                </>
              ) : null}

              {!detalleLoading && !detalleCompra ? (
                <Alert severity="info">
                  Selecciona una compra válida para visualizar sus recepciones disponibles.
                </Alert>
              ) : null}
            </>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={saving} sx={{ textTransform: 'none' }}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={saving || (!manual && (comprasLoading || detalleLoading || !detalleCompra))}
          sx={{ textTransform: 'none', fontWeight: 700, boxShadow: 'none' }}
        >
          {saving ? 'Guardando...' : 'Registrar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

ModalCuentaPagar.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSaved: PropTypes.func.isRequired,
  manual: PropTypes.bool,
  monedas: PropTypes.arrayOf(
    PropTypes.shape({
      idMoneda: PropTypes.number,
      codigo: PropTypes.string.isRequired,
      nombre: PropTypes.string.isRequired,
      simbolo: PropTypes.string,
    })
  ).isRequired,
};
