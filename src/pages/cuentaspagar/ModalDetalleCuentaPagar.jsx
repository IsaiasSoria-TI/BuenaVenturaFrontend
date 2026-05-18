import * as React from 'react';
import PropTypes from 'prop-types';

import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';

import {
  formatCompraCode,
  formatCuentaPagarCode,
  formatDateTimePeru,
  formatRecepcionCode,
} from '../../utils/formatters';

function toNumber(value) {
  if (value === null || value === undefined || value === '') return 0;

  const number = Number(value);
  return Number.isNaN(number) ? 0 : number;
}

function formatNumber(value) {
  return toNumber(value).toFixed(2);
}

function getCurrencyPrefix(item) {
  const normalize = (value) => String(value || '').trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
  const codigo = normalize(item?.codigo || item?.codigoMoneda || item?.moneda);
  const nombre = normalize(item?.nombre);
  const simbolo = String(item?.simbolo || item?.simboloMoneda || '').trim();

  if (codigo === 'PEN' || codigo === 'SOL' || nombre === 'SOLES' || nombre === 'SOL') return 'S/';
  if (codigo === 'USD' || nombre.includes('DOLAR')) return 'USD';
  return codigo || simbolo || item?.moneda || '';
}

function formatCurrency(value, item) {
  if (value === null || value === undefined || value === '') return '-';
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

function InfoItem({ label, value, strong = false, children = null }) {
  return (
    <Box>
      <Typography sx={{ fontSize: '0.8rem', color: '#64748b' }}>{label}</Typography>
      {children || (
        <Typography sx={{ fontWeight: strong ? 700 : 500, color: '#0f172a' }}>
          {value || '-'}
        </Typography>
      )}
    </Box>
  );
}

InfoItem.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  strong: PropTypes.bool,
  children: PropTypes.node,
};

function getDetalleArticulo(detalle) {
  return detalle.articulo || detalle.descripcionArticulo || detalle.descripcion || '-';
}

function getDetalleMedida(detalle) {
  return detalle.medida || detalle.unidad || '-';
}

function getDetalleRecibido(detalle) {
  return detalle.recibido ?? detalle.pesoRecibido ?? detalle.totalRecibido;
}

function getDetalleImporte(detalle) {
  return detalle.importe ?? detalle.monto ?? detalle.costoTotal ?? detalle.subtotal;
}

export default function ModalDetalleCuentaPagar({ open, onClose, cuenta = null }) {
  const detallesDisponibles = Array.isArray(cuenta?.detalles);
  const detalles = detallesDisponibles ? cuenta.detalles : [];
  const estado = cuenta?.estado || '-';
  const monedaLabel = getCurrencyPrefix(cuenta) || '-';

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <DialogTitle sx={{ fontWeight: 700 }}>Detalle de cuenta por pagar</DialogTitle>

      <DialogContent dividers sx={{ pt: 2.5 }}>
        <Stack spacing={2.5}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 2,
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
            }}
          >
            <Typography sx={{ fontWeight: 700, color: '#0f172a', mb: 1.5 }}>
              Información general
            </Typography>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: '1fr 1fr',
                  md: '1fr 1fr 1fr 1fr',
                },
                gap: 1.5,
              }}
            >
              <InfoItem
                label="Código cuenta"
                value={formatCuentaPagarCode(cuenta?.idCuentaPagar)}
                strong
              />
              <InfoItem
                label="Operación"
                value={formatCompraCode(cuenta?.idCompras)}
              />
              <InfoItem
                label="Código recepción"
                value={formatRecepcionCode(cuenta?.idRecepciones)}
              />
              <InfoItem label="RUC proveedor" value={cuenta?.ruc || '-'} />
              <InfoItem label="Proveedor" value={cuenta?.proveedor || '-'} strong />
              <InfoItem label="Factura" value={cuenta?.numeroFactura || '-'} />
              <InfoItem label="Moneda" value={monedaLabel} />
              <InfoItem label="Importe compra" value={formatCurrency(cuenta?.importeCompra, cuenta)} />
              <InfoItem label="Código det/ret" value={cuenta?.codigoDetRet || '-'} />
              <InfoItem label="Estado">
                <Chip
                  label={estado}
                  size="small"
                  sx={{
                    mt: 0.5,
                    fontWeight: 700,
                    ...getEstadoChipStyles(estado),
                  }}
                />
              </InfoItem>
              <InfoItem label="Fecha creación" value={formatDateTimePeru(cuenta?.fechaCreacion)} />
            </Box>
          </Paper>

          <Box>
            <Typography sx={{ fontWeight: 700, color: '#0f172a', mb: 1 }}>
              Detalles
            </Typography>

            {!detallesDisponibles ? (
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  border: '1px solid #e2e8f0',
                  borderRadius: 2,
                  color: '#64748b',
                  textAlign: 'center',
                }}
              >
                Los detalles no están disponibles en esta respuesta.
              </Paper>
            ) : (
              <TableContainer
                component={Paper}
                elevation={0}
                sx={{
                  border: '1px solid #e2e8f0',
                  borderRadius: 2,
                  overflowX: 'auto',
                }}
              >
                <Table sx={{ minWidth: 820 }}>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f8fafc' }}>
                      <TableCell sx={{ fontWeight: 700 }}>ARTÍCULO</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>MEDIDA</TableCell>
                      <TableCell sx={{ fontWeight: 700 }} align="right">
                        RECIBIDO
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700 }} align="right">
                        COSTO KILO ({monedaLabel})
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700 }} align="right">
                        IMPORTE ({monedaLabel})
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>ESTADO</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {detalles.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 3, color: '#64748b' }}>
                          No hay detalles registrados para esta cuenta por pagar.
                        </TableCell>
                      </TableRow>
                    ) : (
                      detalles.map((detalle, index) => {
                        const estadoDetalle = detalle.estado || '-';
                        const key =
                          detalle.idCuentaPagarDetalle ||
                          detalle.idRecepcionDetalle ||
                          detalle.idCompraDetalle ||
                          `${detalle.idArticulo}-${index}`;

                        return (
                          <TableRow key={key} hover>
                            <TableCell>{getDetalleArticulo(detalle)}</TableCell>
                            <TableCell>{getDetalleMedida(detalle)}</TableCell>
                            <TableCell align="right">{formatNumber(getDetalleRecibido(detalle))}</TableCell>
                            <TableCell align="right">{formatCurrency(detalle.costoKilo, cuenta)}</TableCell>
                            <TableCell align="right">{formatCurrency(getDetalleImporte(detalle), cuenta)}</TableCell>
                            <TableCell>
                              <Chip
                                label={estadoDetalle}
                                size="small"
                                sx={{
                                  fontWeight: 700,
                                  ...getEstadoChipStyles(estadoDetalle),
                                }}
                              />
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} sx={{ textTransform: 'none', fontWeight: 700 }}>
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
}

ModalDetalleCuentaPagar.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  cuenta: PropTypes.shape({
    idCuentaPagar: PropTypes.number,
    idCompras: PropTypes.number,
    idRecepciones: PropTypes.number,
    ruc: PropTypes.string,
    proveedor: PropTypes.string,
    numeroFactura: PropTypes.string,
    moneda: PropTypes.string,
    codigoDetRet: PropTypes.string,
    estado: PropTypes.string,
    fechaCreacion: PropTypes.string,
    detalles: PropTypes.arrayOf(PropTypes.object),
  }),
};
