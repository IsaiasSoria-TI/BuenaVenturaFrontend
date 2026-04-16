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
  Chip,
  CircularProgress,
} from '@mui/material';

import { cuentaPagarService } from '../../services/cuentaPagarService';
import ModalCuentaPagar from './ModalCuentaPagar';

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

function formatDateTimeForTable(value) {
  if (!value) return '-';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value).replace('T', ' ').slice(0, 16);
  }

  return date.toLocaleString();
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

export default function CuentasPagar() {
  const [cuentas, setCuentas] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [open, setOpen] = React.useState(false);

  const cargarCuentas = React.useCallback(async () => {
    try {
      setLoading(true);
      const data = await cuentaPagarService.listar();
      setCuentas(data);
    } catch (error) {
      console.error('Error al listar cuentas por pagar:', error);
      console.error('status:', error?.response?.status);
      console.error('data:', error?.response?.data);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    cargarCuentas();
  }, [cargarCuentas]);

  const handleOpenCreate = React.useCallback(() => {
    setOpen(true);
  }, []);

  const handleCloseCreate = React.useCallback(() => {
    setOpen(false);
  }, []);

  const handleSaved = React.useCallback(async () => {
    setOpen(false);
    await cargarCuentas();
  }, [cargarCuentas]);

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
                Cuentas por pagar
              </Typography>
              <Typography sx={{ fontSize: '0.86rem', color: '#64748b', mt: 0.5 }}>
                Muestra recepciones registradas con factura y código de retención en estado pagado.
              </Typography>
            </Box>

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
              <Button
                variant="outlined"
                onClick={cargarCuentas}
                startIcon={<Icon name="refresh" size={18} />}
                sx={{
                  textTransform: 'none',
                  fontWeight: 700,
                  borderRadius: 2,
                }}
              >
                Actualizar
              </Button>

              <Button
                variant="contained"
                onClick={handleOpenCreate}
                startIcon={<Icon name="add" size={18} color="#fff" />}
                sx={{
                  textTransform: 'none',
                  fontWeight: 700,
                  borderRadius: 2,
                  boxShadow: 'none',
                }}
              >
                Añadir cuenta por pagar
              </Button>
            </Stack>
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
                  <TableCell sx={{ fontWeight: 700 }}>COMPRA</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>RECEPCIÓN</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>PROVEEDOR</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>RUC</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>ARTÍCULO</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>FACTURA</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>MONEDA</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>COD. RETENCIÓN</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>ESTADO</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>F. CREACIÓN</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={11} align="center" sx={{ py: 4 }}>
                      <CircularProgress size={28} />
                    </TableCell>
                  </TableRow>
                ) : cuentas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} align="center" sx={{ py: 4, color: '#64748b' }}>
                      No hay cuentas por pagar pagadas registradas.
                    </TableCell>
                  </TableRow>
                ) : (
                  cuentas.map((cuenta) => (
                    <TableRow key={cuenta.idCuentaPagar} hover>
                      <TableCell>{cuenta.idCuentaPagar}</TableCell>
                      <TableCell>{cuenta.idCompras}</TableCell>
                      <TableCell>{cuenta.idRecepciones}</TableCell>
                      <TableCell>{cuenta.proveedor || '-'}</TableCell>
                      <TableCell>{cuenta.ruc || '-'}</TableCell>
                      <TableCell>{cuenta.articulo || '-'}</TableCell>
                      <TableCell>{cuenta.numeroFactura}</TableCell>
                      <TableCell>{cuenta.moneda}</TableCell>
                      <TableCell>{cuenta.codigoDetRet}</TableCell>
                      <TableCell>
                        <Chip
                          label={cuenta.estado || '-'}
                          size="small"
                          sx={{
                            fontWeight: 700,
                            ...getEstadoChipStyles(cuenta.estado),
                          }}
                        />
                      </TableCell>
                      <TableCell>{formatDateTimeForTable(cuenta.fechaCreacion)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <ModalCuentaPagar
        open={open}
        onClose={handleCloseCreate}
        onSaved={handleSaved}
      />
    </Box>
  );
}