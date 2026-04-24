import React from 'react';
import PropTypes from 'prop-types';

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from '@mui/material';

import { cuentaPagarService } from '../../services/cuentaPagarService';
import ModalCuentaPagar from './ModalCuentaPagar';

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

function formatDateTimeForTable(value) {
  if (!value) return '-';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value).replace('T', ' ').slice(0, 16);
  }

  return date.toLocaleString();
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

export default function CuentasPagar() {
  const [cuentas, setCuentas] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [open, setOpen] = React.useState(false);
  const [serverError, setServerError] = React.useState('');
  const [serverSuccess, setServerSuccess] = React.useState('');
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);

  const cargarCuentas = React.useCallback(async () => {
    try {
      setLoading(true);
      setServerError('');

      const data = await cuentaPagarService.listar();
      setCuentas(Array.isArray(data) ? data : []);
      setPage(0);
    } catch (error) {
      console.error('Error al listar cuentas por pagar:', error);

      const message =
        error?.response?.data?.message ||
        error?.response?.data ||
        'No se pudo listar las cuentas por pagar.';

      setServerError(
        typeof message === 'string'
          ? message
          : 'No se pudo listar las cuentas por pagar.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    cargarCuentas();
  }, [cargarCuentas]);

  const handleOpenCreate = () => {
    setServerError('');
    setServerSuccess('');
    setOpen(true);
  };

  const handleCloseCreate = () => {
    setOpen(false);
  };

  const handleSaved = async () => {
    setOpen(false);
    setServerError('');
    setServerSuccess('Cuenta por pagar registrada correctamente.');
    await cargarCuentas();
  };

  const handleChangePage = (_event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(Number.parseInt(event.target.value, 10));
    setPage(0);
  };

  const cuentasOrdenadas = React.useMemo(() => {
    return [...cuentas].sort(
      (a, b) => new Date(b.fechaCreacion || 0) - new Date(a.fechaCreacion || 0)
    );
  }, [cuentas]);

  const cuentasPaginadas = React.useMemo(() => {
    const inicio = page * rowsPerPage;
    const fin = inicio + rowsPerPage;
    return cuentasOrdenadas.slice(inicio, fin);
  }, [cuentasOrdenadas, page, rowsPerPage]);

  const showLoading = loading;
  const showEmpty = !loading && cuentas.length === 0;
  const showRows = !loading && cuentas.length > 0;

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
                Registra facturas a partir de recepciones parciales o completas.
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
                  <TableCell sx={{ fontWeight: 700 }}>COMPRA</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>RECEPCIÓN</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>PROVEEDOR</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>RUC</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>ARTÍCULO</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>FACTURA</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>MONEDA</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>COD. DET/RET</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>ESTADO</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>F. CREACIÓN</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {showLoading ? (
                  <TableRow>
                    <TableCell colSpan={11} align="center" sx={{ py: 4 }}>
                      <CircularProgress size={28} />
                    </TableCell>
                  </TableRow>
                ) : null}

                {showEmpty ? (
                  <TableRow>
                    <TableCell colSpan={11} align="center" sx={{ py: 4, color: '#64748b' }}>
                      No hay cuentas por pagar registradas.
                    </TableCell>
                  </TableRow>
                ) : null}

                {showRows
                  ? cuentasPaginadas.map((cuenta) => (
                    <TableRow key={cuenta.idCuentaPagar} hover>
                      <TableCell>{cuenta.idCuentaPagar}</TableCell>
                      <TableCell>{cuenta.idCompras}</TableCell>
                      <TableCell>{cuenta.idRecepciones}</TableCell>
                      <TableCell>{cuenta.proveedor || '-'}</TableCell>
                      <TableCell>{cuenta.ruc || '-'}</TableCell>
                      <TableCell>{cuenta.articulo || 'Varios artículos'}</TableCell>
                      <TableCell>{cuenta.numeroFactura || '-'}</TableCell>
                      <TableCell>{cuenta.moneda || '-'}</TableCell>
                      <TableCell>{cuenta.codigoDetRet || '-'}</TableCell>
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
                  : null}
              </TableBody>
            </Table>

            {showRows ? (
              <TablePagination
                component="div"
                count={cuentas.length}
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

      <ModalCuentaPagar
        open={open}
        onClose={handleCloseCreate}
        onSaved={handleSaved}
      />
    </Box>
  );
}