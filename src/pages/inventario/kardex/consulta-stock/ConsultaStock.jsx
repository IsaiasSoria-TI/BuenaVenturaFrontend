import * as React from 'react';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
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
import { consultaStockService } from '../../../../services/consultaStockService';
import { getAutocompleteTextFieldProps } from '../../../../utils/autocompleteTextField';
import { formatDatePeru } from '../../../../utils/formatters';

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

function getCurrentPeriod() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

function formatArticuloCode(idArticulo) {
  if (idArticulo === null || idArticulo === undefined || idArticulo === '') return '-';
  return `ART-${String(idArticulo).padStart(4, '0')}`;
}

function formatNumber(value) {
  if (value === null || value === undefined || value === '') return '0.00';

  const number = Number(value);
  if (Number.isNaN(number)) return '0.00';

  return number.toFixed(2);
}

function formatPeriod(period) {
  if (!period || !period.includes('-')) return period || '-';
  const [year, month] = period.split('-');
  return `${month}-${year}`;
}

export default function ConsultaStock() {
  const [periodo, setPeriodo] = React.useState(getCurrentPeriod);
  const [articulos, setArticulos] = React.useState([]);
  const [selectedArticulo, setSelectedArticulo] = React.useState(null);
  const [loadingArticulos, setLoadingArticulos] = React.useState(true);
  const [loadingMovimientos, setLoadingMovimientos] = React.useState(false);
  const [movimientos, setMovimientos] = React.useState([]);
  const [serverError, setServerError] = React.useState('');
  const [searched, setSearched] = React.useState(false);

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
          const message =
            error?.response?.data?.message ||
            error?.response?.data ||
            'No se pudo cargar el catalogo de articulos.';

          setServerError(
            typeof message === 'string'
              ? message
              : 'No se pudo cargar el catalogo de articulos.'
          );
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

  const handleBuscar = async () => {
    if (!periodo || !selectedArticulo?.idArticulo) return;

    try {
      setLoadingMovimientos(true);
      setServerError('');
      setSearched(true);

      const data = await consultaStockService.consultar({
        periodo,
        idArticulo: selectedArticulo.idArticulo,
      });

      setMovimientos(Array.isArray(data) ? data : []);
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data ||
        'No se pudo consultar los movimientos de stock.';

      setServerError(
        typeof message === 'string'
          ? message
          : 'No se pudo consultar los movimientos de stock.'
      );
      setMovimientos([]);
    } finally {
      setLoadingMovimientos(false);
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
                fullWidth
                size="small"
                loading={loadingArticulos}
                options={articulos}
                value={selectedArticulo}
                onChange={(_event, value) => {
                  setSelectedArticulo(value);
                  setSearched(false);
                  setMovimientos([]);
                }}
                getOptionLabel={(option) =>
                  option
                    ? `${formatArticuloCode(option.idArticulo)} - ${option.descripcion || ''}`
                    : ''
                }
                isOptionEqualToValue={(option, value) => option.idArticulo === value.idArticulo}
                noOptionsText="No se encontraron articulos"
                loadingText="Cargando articulos..."
                renderInput={(params) => (
                  <TextField
                    {...getAutocompleteTextFieldProps(params)}
                    label="Buscar producto"
                    placeholder="Codigo o descripcion"
                  />
                )}
              />

              <Button
                variant="contained"
                onClick={handleBuscar}
                disabled={!periodo || !selectedArticulo || loadingMovimientos}
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

            {selectedArticulo ? (
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' },
                  gap: 1.5,
                }}
              >
                <Box sx={{ p: 1.5, border: '1px solid #e2e8f0', borderRadius: 2 }}>
                  <Typography sx={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>
                    ARTICULO
                  </Typography>
                  <Typography sx={{ fontSize: '0.9rem', color: '#0f172a', fontWeight: 700 }}>
                    {formatArticuloCode(selectedArticulo.idArticulo)}
                  </Typography>
                </Box>

                <Box sx={{ p: 1.5, border: '1px solid #e2e8f0', borderRadius: 2 }}>
                  <Typography sx={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>
                    DESCRIPCION
                  </Typography>
                  <Typography sx={{ fontSize: '0.9rem', color: '#0f172a', fontWeight: 700 }}>
                    {selectedArticulo.descripcion || '-'}
                  </Typography>
                </Box>

                <Box sx={{ p: 1.5, border: '1px solid #e2e8f0', borderRadius: 2 }}>
                  <Typography sx={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>
                    STOCK ACTUAL
                  </Typography>
                  <Typography sx={{ fontSize: '0.9rem', color: '#0f172a', fontWeight: 700 }}>
                    {formatNumber(selectedArticulo.stock)}
                  </Typography>
                </Box>
              </Box>
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
              <Table sx={{ minWidth: 900 }}>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f8fafc' }}>
                    <TableCell sx={{ fontWeight: 700 }}>FECHA MOVIMIENTO</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>DOCUMENTO</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>TIPO DE MOVIMIENTO</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>STOCK INICIAL</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>MOVIMIENTO CANTIDAD</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>SALDO</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {showLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                        <CircularProgress size={28} />
                      </TableCell>
                    </TableRow>
                  ) : null}

                  {!showLoading && showInitialState ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4, color: '#64748b' }}>
                        Selecciona un periodo y un producto para consultar movimientos.
                      </TableCell>
                    </TableRow>
                  ) : null}

                  {!showLoading && showEmptyState ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4, color: '#64748b' }}>
                        No hay movimientos registrados para {formatPeriod(periodo)}.
                      </TableCell>
                    </TableRow>
                  ) : null}

                  {!showLoading && movimientos.length > 0
                    ? movimientos.map((movimiento) => (
                        <TableRow key={movimiento.idConsultaStockMovimiento} hover>
                          <TableCell>{formatDatePeru(movimiento.fechaMovimiento)}</TableCell>
                          <TableCell>{movimiento.documento || '-'}</TableCell>
                          <TableCell>{movimiento.tipoMovimiento || '-'}</TableCell>
                          <TableCell align="right">{formatNumber(movimiento.stockInicial)}</TableCell>
                          <TableCell align="right">{formatNumber(movimiento.movimientoCantidad)}</TableCell>
                          <TableCell align="right">{formatNumber(movimiento.saldo)}</TableCell>
                        </TableRow>
                      ))
                    : null}
                </TableBody>
              </Table>
            </TableContainer>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
