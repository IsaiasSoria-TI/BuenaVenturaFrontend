import * as React from 'react';
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  TextField,
  CircularProgress,
  Alert,
  Autocomplete,
  Typography,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  Chip,
  MenuItem,
} from '@mui/material';

import { cuentaPagarService } from '../../services/cuentaPagarService';

const initialForm = {
  tipoFactura: 'UNICA',
  numeroFactura: '',
  moneda: 'PEN',
  codigoDetRet: '',
};

function formatDateTimeForTable(value) {
  if (!value) return '-';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value).replace('T', ' ').slice(0, 16);
  }

  return date.toLocaleString();
}

function formatNumber(value) {
  if (value === null || value === undefined || value === '') return '0.00';
  const number = Number(value);
  if (Number.isNaN(number)) return '0.00';
  return number.toFixed(2);
}

function getEstadoChipStyles(estado) {
  if (estado === 'Completo') {
    return {
      backgroundColor: '#dcfce7',
      color: '#16a34a',
    };
  }

  if (estado === 'Pagado') {
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

const RecepcionesTable = React.memo(function RecepcionesTable({
  recepciones,
  selectedRecepciones,
  toggleRecepcion,
  isRecepcionSelected,
  form,
  updateNumeroFacturaDetalle,
  errors,
}) {
  return (
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
            <TableCell sx={{ fontWeight: 700 }}>SEL.</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>RECEPCIÓN</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>FECHA</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>RECIBIDO</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>ESTADO</TableCell>
            {form.tipoFactura === 'MULTIPLE' && (
              <TableCell sx={{ fontWeight: 700 }}>FACTURA</TableCell>
            )}
          </TableRow>
        </TableHead>

        <TableBody>
          {recepciones.map((recepcion) => (
            <TableRow key={recepcion.idRecepciones} hover>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={isRecepcionSelected(recepcion.idRecepciones)}
                  onChange={() => toggleRecepcion(recepcion)}
                />
              </TableCell>
              <TableCell>{recepcion.idRecepciones}</TableCell>
              <TableCell>{formatDateTimeForTable(recepcion.fechaRecepcion)}</TableCell>
              <TableCell>{formatNumber(recepcion.recibido)}</TableCell>
              <TableCell>
                <Chip
                  label={recepcion.estadoRecepcion || '-'}
                  size="small"
                  sx={{
                    fontWeight: 700,
                    ...getEstadoChipStyles(recepcion.estadoRecepcion),
                  }}
                />
              </TableCell>

              {form.tipoFactura === 'MULTIPLE' && (
                <TableCell sx={{ minWidth: 220 }}>
                  {isRecepcionSelected(recepcion.idRecepciones) ? (
                    <TextField
                      fullWidth
                      size="small"
                      label="N° factura"
                      value={
                        selectedRecepciones.find(
                          (item) => item.idRecepciones === recepcion.idRecepciones
                        )?.numeroFactura || ''
                      }
                      onChange={(event) =>
                        updateNumeroFacturaDetalle(
                          recepcion.idRecepciones,
                          event.target.value
                        )
                      }
                      error={!!errors.numeroFacturaDetalle}
                    />
                  ) : (
                    <Typography sx={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                      Selecciona la recepción
                    </Typography>
                  )}
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
});

export default function ModalCuentaPagar({ open, onClose, onSaved }) {
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

  const cargarComprasValidas = React.useCallback(async () => {
    try {
      setComprasLoading(true);
      const data = await cuentaPagarService.listarComprasValidas();
      setComprasValidas(data);
    } catch (error) {
      console.error('Error al listar compras válidas:', error);
      console.error('status:', error?.response?.status);
      console.error('data:', error?.response?.data);
    } finally {
      setComprasLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (open) {
      setForm(initialForm);
      setErrors({});
      setServerError('');
      setSelectedCompra(null);
      setDetalleCompra(null);
      setSelectedRecepciones([]);
      cargarComprasValidas();
    }
  }, [open, cargarComprasValidas]);

  const handleChange = React.useCallback(
    (field) => (event) => {
      const value = event.target.value;

      setForm((prev) => ({
        ...prev,
        [field]: value,
      }));

      setErrors((prev) => ({
        ...prev,
        [field]: '',
      }));

      if (serverError) {
        setServerError('');
      }
    },
    [serverError]
  );

  const cargarDetalleCompra = React.useCallback(async (idCompras) => {
    try {
      setDetalleLoading(true);
      setDetalleCompra(null);
      setSelectedRecepciones([]);
      setServerError('');

      const data = await cuentaPagarService.verDetalleCompra(idCompras);
      setDetalleCompra(data);
    } catch (error) {
      console.error('Error al cargar detalle de compra:', error);
      console.error('status:', error?.response?.status);
      console.error('data:', error?.response?.data);

      const message =
        error?.response?.data?.message ||
        error?.response?.data ||
        'No se pudo cargar el detalle de la compra.';

      setServerError(
        typeof message === 'string'
          ? message
          : 'No se pudo cargar el detalle de la compra.'
      );
    } finally {
      setDetalleLoading(false);
    }
  }, []);

  const toggleRecepcion = React.useCallback(
    (recepcion) => {
      setSelectedRecepciones((prev) => {
        const exists = prev.some((item) => item.idRecepciones === recepcion.idRecepciones);

        if (exists) {
          return prev.filter((item) => item.idRecepciones !== recepcion.idRecepciones);
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

    if (!selectedCompra?.idCompras) {
      newErrors.idCompras = 'Seleccione una compra completa';
    }

    if (!form.tipoFactura) {
      newErrors.tipoFactura = 'Seleccione el tipo de factura';
    }

    if (!form.moneda) {
      newErrors.moneda = 'Seleccione la moneda';
    }

    if (!form.codigoDetRet.trim()) {
      newErrors.codigoDetRet = 'El código de retención es obligatorio';
    }

    if (selectedRecepciones.length === 0) {
      newErrors.detalles = 'Seleccione al menos una recepción';
    }

    if (form.tipoFactura === 'UNICA' && !form.numeroFactura.trim()) {
      newErrors.numeroFactura = 'El número de factura es obligatorio';
    }

    if (form.tipoFactura === 'MULTIPLE') {
      const missingFactura = selectedRecepciones.some(
        (item) => !item.numeroFactura?.trim()
      );

      if (missingFactura) {
        newErrors.numeroFacturaDetalle =
          'Cada recepción seleccionada debe tener número de factura';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [selectedCompra, form, selectedRecepciones]);

  const buildPayload = React.useCallback(() => {
    return {
      tipoFactura: form.tipoFactura,
      numeroFactura: form.tipoFactura === 'UNICA' ? form.numeroFactura.trim() : null,
      moneda: form.moneda,
      codigoDetRet: form.codigoDetRet.trim(),
      detalles: selectedRecepciones.map((item) => ({
        idCompras: item.idCompras,
        idRecepciones: item.idRecepciones,
        numeroFactura:
          form.tipoFactura === 'MULTIPLE' ? item.numeroFactura?.trim() || null : null,
      })),
    };
  }, [form, selectedRecepciones]);

  const handleSubmit = React.useCallback(async () => {
    if (!validate()) return;

    try {
      setSaving(true);
      setServerError('');

      const payload = buildPayload();
      await cuentaPagarService.registrar(payload);

      onSaved();
    } catch (error) {
      console.error('Error al registrar cuenta por pagar:', error);
      console.error('status:', error?.response?.status);
      console.error('data:', error?.response?.data);

      const message =
        error?.response?.data?.message ||
        error?.response?.data ||
        'No se pudo registrar la cuenta por pagar.';

      setServerError(
        typeof message === 'string'
          ? message
          : 'No se pudo registrar la cuenta por pagar.'
      );
    } finally {
      setSaving(false);
    }
  }, [validate, buildPayload, onSaved]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <DialogTitle sx={{ fontWeight: 700 }}>Añadir cuenta por pagar</DialogTitle>

      <DialogContent dividers sx={{ pt: 2.5 }}>
        <Stack spacing={2}>
          {serverError && <Alert severity="error">{serverError}</Alert>}

          {comprasLoading ? (
            <Box sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
              <CircularProgress size={26} />
            </Box>
          ) : (
            <>
              <Autocomplete
                fullWidth
                options={comprasValidas}
                value={selectedCompra}
                onChange={(_, newValue) => {
                  setSelectedCompra(newValue);
                  setDetalleCompra(null);
                  setSelectedRecepciones([]);
                  setServerError('');

                  if (newValue?.idCompras) {
                    cargarDetalleCompra(newValue.idCompras);
                  }

                  setErrors((prev) => ({
                    ...prev,
                    idCompras: '',
                  }));
                }}
                getOptionLabel={(option) =>
                  option
                    ? `Compra #${option.idCompras} - ${option.ruc} - ${option.razonSocial}`
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
                        option.ruc?.toLowerCase().includes(input) ||
                        option.razonSocial?.toLowerCase().includes(input) ||
                        option.articulo?.toLowerCase().includes(input)
                    )
                    .slice(0, 20);
                }}
                renderOption={(props, option) => (
                  <Box component="li" {...props}>
                    <Box>
                      <Typography sx={{ fontWeight: 700, fontSize: '0.92rem' }}>
                        Compra #{option.idCompras}
                      </Typography>
                      <Typography sx={{ fontSize: '0.82rem', color: '#64748b' }}>
                        {option.ruc} - {option.razonSocial}
                      </Typography>
                      <Typography sx={{ fontSize: '0.8rem', color: '#64748b' }}>
                        {option.articulo} | Importe: {formatNumber(option.costoTotal)}
                      </Typography>
                    </Box>
                  </Box>
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Compras con recepciones completas"
                    placeholder="Busca por compra, RUC, proveedor o artículo"
                    error={!!errors.idCompras}
                    helperText={errors.idCompras}
                  />
                )}
              />

              {detalleLoading ? (
                <Box sx={{ py: 3, display: 'flex', justifyContent: 'center' }}>
                  <CircularProgress size={24} />
                </Box>
              ) : detalleCompra ? (
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
                          #{detalleCompra.numeroOperacion}
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
                          Artículo
                        </Typography>
                        <Typography>{detalleCompra.descripcionArticulo}</Typography>
                      </Box>

                      <Box>
                        <Typography sx={{ fontSize: '0.8rem', color: '#64748b' }}>
                          Importe
                        </Typography>
                        <Typography>{formatNumber(detalleCompra.importe)}</Typography>
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
                      Recepciones completas disponibles
                    </Typography>

                    {errors.detalles && (
                      <Alert severity="warning" sx={{ mb: 2 }}>
                        {errors.detalles}
                      </Alert>
                    )}

                    {detalleCompra.recepcionesDisponibles?.length === 0 ? (
                      <Alert severity="info">
                        Esta compra no tiene recepciones completas disponibles.
                      </Alert>
                    ) : (
                      <RecepcionesTable
                        recepciones={detalleCompra.recepcionesDisponibles}
                        selectedRecepciones={selectedRecepciones}
                        toggleRecepcion={toggleRecepcion}
                        isRecepcionSelected={isRecepcionSelected}
                        form={form}
                        updateNumeroFacturaDetalle={updateNumeroFacturaDetalle}
                        errors={errors}
                      />
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
                      helperText={errors.tipoFactura}
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
                      error={!!errors.moneda}
                      helperText={errors.moneda}
                    >
                      <MenuItem value="PEN">PEN</MenuItem>
                      <MenuItem value="USD">USD</MenuItem>
                    </TextField>

                    <TextField
                      fullWidth
                      label="Código de retención"
                      value={form.codigoDetRet}
                      onChange={handleChange('codigoDetRet')}
                      error={!!errors.codigoDetRet}
                      helperText={errors.codigoDetRet}
                    />

                    {form.tipoFactura === 'UNICA' ? (
                      <TextField
                        fullWidth
                        label="Número de factura"
                        value={form.numeroFactura}
                        onChange={handleChange('numeroFactura')}
                        error={!!errors.numeroFactura}
                        helperText={errors.numeroFactura}
                      />
                    ) : (
                      <TextField
                        fullWidth
                        label="Número de factura"
                        value="Se registra por recepción"
                        InputProps={{ readOnly: true }}
                        error={!!errors.numeroFacturaDetalle}
                        helperText={errors.numeroFacturaDetalle}
                      />
                    )}
                  </Box>
                </>
              ) : (
                <Alert severity="info">
                  Selecciona una compra completa para visualizar sus recepciones completas disponibles.
                </Alert>
              )}
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
          disabled={saving || comprasLoading || detalleLoading || !detalleCompra}
          sx={{ textTransform: 'none', fontWeight: 700, boxShadow: 'none' }}
        >
          {saving ? 'Guardando...' : 'Registrar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}