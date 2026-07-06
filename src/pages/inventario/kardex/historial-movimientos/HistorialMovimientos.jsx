import * as React from 'react';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  InputAdornment,
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
import { historialMovimientoService } from '../../../../services/historialMovimientoService';
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

function formatCurrencySoles(value) {
  return `S/ ${formatNumber(value)}`;
}

function getMovimientoColor(tipoMovimiento) {
  const tipo = String(tipoMovimiento || '').toUpperCase();

  if (tipo === 'COMPRA') return { color: '#166534', backgroundColor: '#dcfce7' };
  if (tipo === 'VENTA') return { color: '#991b1b', backgroundColor: '#fee2e2' };
  if (tipo === 'AJUSTE') return { color: '#854d0e', backgroundColor: '#fef3c7' };
  if (tipo === 'TRANSFERENCIA') return { color: '#1e40af', backgroundColor: '#dbeafe' };

  return { color: '#334155', backgroundColor: '#e2e8f0' };
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

          setServerError(typeof message === 'string' ? message : 'No se pudo cargar el catalogo de articulos.');
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
      const message =
        error?.response?.data?.message ||
        error?.response?.data ||
        'No se pudo consultar el historial de movimientos.';

      setServerError(
        typeof message === 'string' ? message : 'No se pudo consultar el historial de movimientos.'
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
              alignItems={{ xs: 'stretch', md: 'center' }}
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
                    {...params}
                    label="Articulo"
                    placeholder="Codigo o descripcion"
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <>
                          <InputAdornment position="start">
                            <Icon name="search" size={19} color="#64748b" />
                          </InputAdornment>
                          {params.InputProps?.startAdornment}
                        </>
                      ),
                    }}
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
              <Table sx={{ minWidth: 1100 }}>
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
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                        <CircularProgress size={28} />
                      </TableCell>
                    </TableRow>
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
                            <Stack spacing={0.25}>
                              <Typography sx={{ fontSize: '0.84rem', fontWeight: 700, color: '#0f172a' }}>
                                {movimiento.codigoMovimiento || movimiento.documento || '-'}
                              </Typography>
                              <Typography sx={{ fontSize: '0.78rem', color: '#64748b' }}>
                                {movimiento.codigoArticulo || formatArticuloCode(movimiento.idArticulo)}
                              </Typography>
                            </Stack>
                          </TableCell>
                          <TableCell>{movimiento.proveedorMotivo || '-'}</TableCell>
                          <TableCell>
                            <Chip
                              label={movimiento.tipoMovimiento || '-'}
                              size="small"
                              sx={{
                                ...getMovimientoColor(movimiento.tipoMovimiento),
                                fontWeight: 700,
                                borderRadius: 1.5,
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Stack spacing={0.25}>
                              <Typography sx={{ fontSize: '0.84rem', color: '#0f172a' }}>
                                {movimiento.detalle || movimiento.descripcionArticulo || '-'}
                              </Typography>
                              <Typography sx={{ fontSize: '0.78rem', color: '#64748b' }}>
                                Cantidad: {formatNumber(movimiento.movimientoCantidad)} | Saldo: {formatNumber(movimiento.saldo)}
                              </Typography>
                            </Stack>
                          </TableCell>
                          <TableCell>{formatDatePeru(movimiento.fechaMovimiento)}</TableCell>
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
    </Box>
  );
}
