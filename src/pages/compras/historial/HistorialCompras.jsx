import * as React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import {
  Alert,
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
  InputAdornment,
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
  Tooltip,
  Typography,
} from '@mui/material';

import { compraService } from '../../../services/compraService';
import { useAutoClearMessage } from '../../../utils/useAutoClearMessage';
import { getApiErrorMessage } from '../../../utils/getApiErrorMessage';
import Icon from '../../../components/MaterialSymbol';
import TableSkeletonRows from '../../../components/loading/TableSkeletonRows';
import { formatCompraCode, formatDateTimePeru } from '../../../utils/formatters';
import {
  formatCompraCurrency,
  formatNumber,
  formatSoles,
  getCompraIgv,
  getCompraImporteImpuestos,
  getCompraSubtotal,
  getCompraTotalFinal,
} from '../gestionarcompras/compraCalculations';

import ModalDetalleCompra from '../gestionarcompras/ModalDetalleCompra';

const ESTADOS = ['Todos', 'Pendiente', 'Completa parcial', 'Completo', 'Inactivo'];

function getEstadoChipStyles(estado) {
  if (estado === 'Inactivo') {
    return { backgroundColor: '#f1f5f9', color: '#64748b' };
  }

  if (estado === 'Completo') {
    return { backgroundColor: '#dcfce7', color: '#16a34a' };
  }

  if (estado === 'Completa parcial') {
    return { backgroundColor: '#dbeafe', color: '#2563eb' };
  }

  if (estado === 'Pendiente') {
    return { backgroundColor: '#fef3c7', color: '#d97706' };
  }

  return { backgroundColor: '#fee2e2', color: '#dc2626' };
}

function getEstadoCompra(compra) {
  if (compra?.flgActivo === false) return 'Inactivo';
  return compra?.estado || '-';
}

export default function HistorialCompras() {
  const navigate = useNavigate();
  const location = useLocation();

  const [compras, setCompras] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [serverError, setServerError] = React.useState('');
  const [successMessage, setSuccessMessage] = React.useState(location.state?.successMessage || '');

  useAutoClearMessage(successMessage, setSuccessMessage);

  const [searchTerm, setSearchTerm] = React.useState('');
  const [estadoFiltro, setEstadoFiltro] = React.useState('Todos');
  const [fechaDesde, setFechaDesde] = React.useState('');
  const [fechaHasta, setFechaHasta] = React.useState('');

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const [detailDialogOpen, setDetailDialogOpen] = React.useState(false);
  const [selectedDetail, setSelectedDetail] = React.useState(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [selectedDelete, setSelectedDelete] = React.useState(null);

  React.useEffect(() => {
    if (location.state?.successMessage) {
      navigate(location.pathname, { replace: true, state: {} });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cargarCompras = React.useCallback(async () => {
    try {
      setLoading(true);
      setServerError('');

      const data = await compraService.listar();
      setCompras(Array.isArray(data) ? data : []);
      setPage(0);
    } catch (error) {
      setServerError(getApiErrorMessage(error, 'No se pudo cargar el historial de compras.'));
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    cargarCompras();
  }, [cargarCompras]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleEstadoChange = (event) => {
    setEstadoFiltro(event.target.value);
    setPage(0);
  };

  const handleFechaDesdeChange = (event) => {
    setFechaDesde(event.target.value);
    setPage(0);
  };

  const handleFechaHastaChange = (event) => {
    setFechaHasta(event.target.value);
    setPage(0);
  };

  const handleChangePage = (_event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(Number.parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDetailDialog = (compra) => {
    setSelectedDetail(compra);
    setDetailDialogOpen(true);
  };

  const handleCloseDetailDialog = () => {
    setDetailDialogOpen(false);
    setSelectedDetail(null);
  };

  const handleNuevaCompra = () => {
    navigate('/dashboard/compras/gestionar');
  };

  const handleEditarCompra = (compra) => {
    navigate(`/dashboard/compras/gestionar?id=${compra.idCompras}`);
  };

  const handleOpenDeleteDialog = (compra) => {
    setSelectedDelete(compra);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setSelectedDelete(null);
    setDeleteDialogOpen(false);
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
      setServerError(getApiErrorMessage(error, 'No se pudo inactivar la compra.'));
    }
  };

  const comprasFiltradas = React.useMemo(() => {
    const criterio = searchTerm.trim().toLowerCase();
    const desde = fechaDesde ? new Date(`${fechaDesde}T00:00:00`) : null;
    const hasta = fechaHasta ? new Date(`${fechaHasta}T23:59:59`) : null;

    return compras
      .filter((compra) => {
        if (estadoFiltro === 'Todos') return true;
        return getEstadoCompra(compra) === estadoFiltro;
      })
      .filter((compra) => {
        if (!desde && !hasta) return true;

        const fecha = compra.fechaCompras ? new Date(compra.fechaCompras) : null;
        if (!fecha) return false;

        if (desde && fecha < desde) return false;
        if (hasta && fecha > hasta) return false;

        return true;
      })
      .filter((compra) => {
        if (!criterio) return true;

        const valoresBusqueda = [
          formatCompraCode(compra.idCompras),
          compra.idCompras,
          formatDateTimePeru(compra.fechaCompras),
          compra.ruc,
          compra.razonSocial,
          getEstadoCompra(compra),
        ];

        return valoresBusqueda.some((value) => String(value || '').toLowerCase().includes(criterio));
      });
  }, [compras, searchTerm, estadoFiltro, fechaDesde, fechaHasta]);

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
            spacing={2}
            sx={{ mb: 2.5, alignItems: { xs: 'stretch', md: 'center' }, justifyContent: 'space-between' }}
          >
            <Box>
              <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
                Historial
              </Typography>
              <Typography sx={{ fontSize: '0.86rem', color: '#64748b', mt: 0.5 }}>
                Consulta el registro histórico de todas las compras, incluidas las inactivas.
              </Typography>
            </Box>

            <Button
              variant="contained"
              onClick={handleNuevaCompra}
              startIcon={<Icon name="add" size={18} color="#fff" />}
              sx={{
                alignSelf: { xs: 'flex-start', md: 'auto' },
                textTransform: 'none',
                fontWeight: 700,
                borderRadius: '8px',
                boxShadow: 'none',
              }}
            >
              Nueva compra
            </Button>
          </Stack>

          {successMessage ? (
            <Alert severity="success" sx={{ mb: 2 }}>
              {successMessage}
            </Alert>
          ) : null}

          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={1.5}
            sx={{ mb: 2, alignItems: { xs: 'stretch', md: 'center' } }}
          >
            <TextField
              fullWidth
              size="small"
              placeholder="Buscar por código, RUC, proveedor..."
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
            />

            <TextField
              select
              size="small"
              label="Estado"
              value={estadoFiltro}
              onChange={handleEstadoChange}
              sx={{ minWidth: { xs: '100%', md: 200 } }}
            >
              {ESTADOS.map((estado) => (
                <MenuItem key={estado} value={estado}>
                  {estado}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              size="small"
              type="date"
              label="Desde"
              value={fechaDesde}
              onChange={handleFechaDesdeChange}
              sx={{ minWidth: { xs: '100%', md: 170 } }}
              slotProps={{ inputLabel: { shrink: true } }}
            />

            <TextField
              size="small"
              type="date"
              label="Hasta"
              value={fechaHasta}
              onChange={handleFechaHastaChange}
              sx={{ minWidth: { xs: '100%', md: 170 } }}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Stack>

          {serverError ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {serverError}
            </Alert>
          ) : null}

          <TableContainer
            component={Paper}
            elevation={0}
            sx={{ border: '1px solid #e2e8f0', borderRadius: 2.5, overflowX: 'auto' }}
          >
            <Table sx={{ minWidth: 1080 }}>
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
                  <TableSkeletonRows columns={11} />
                ) : compras.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} align="center" sx={{ py: 4, color: '#64748b' }}>
                      No hay compras registradas.
                    </TableCell>
                  </TableRow>
                ) : comprasFiltradas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} align="center" sx={{ py: 4, color: '#64748b' }}>
                      No se encontraron compras con los filtros seleccionados.
                    </TableCell>
                  </TableRow>
                ) : (
                  comprasPaginadas.map((compra) => (
                    <TableRow key={compra.idCompras} hover>
                      <TableCell>{formatCompraCode(compra.idCompras)}</TableCell>
                      <TableCell>{formatDateTimePeru(compra.fechaCompras)}</TableCell>
                      <TableCell>{compra.ruc}</TableCell>
                      <TableCell>{compra.razonSocial}</TableCell>
                      <TableCell align="right">{formatCompraCurrency(compra, getCompraSubtotal(compra))}</TableCell>
                      <TableCell align="right">{formatCompraCurrency(compra, getCompraIgv(compra))}</TableCell>
                      <TableCell align="right">{formatSoles(getCompraImporteImpuestos(compra))}</TableCell>
                      <TableCell align="right">{formatNumber(compra.peso)}</TableCell>
                      <TableCell align="right">{formatCompraCurrency(compra, getCompraTotalFinal(compra))}</TableCell>
                      <TableCell>
                        <Chip
                          label={getEstadoCompra(compra)}
                          size="small"
                          sx={{ fontWeight: 700, ...getEstadoChipStyles(getEstadoCompra(compra)) }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Ver detalle">
                          <IconButton onClick={() => handleOpenDetailDialog(compra)}>
                            <Icon name="visibility" size={20} color="#0f766e" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Editar">
                          <IconButton
                            onClick={() => handleEditarCompra(compra)}
                            disabled={compra.flgActivo === false}
                          >
                            <Icon name="edit" size={20} color="#1976d2" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Inactivar">
                          <IconButton
                            onClick={() => handleOpenDeleteDialog(compra)}
                            disabled={compra.flgActivo === false}
                          >
                            <Icon name="delete" size={20} color="#ef4444" />
                          </IconButton>
                        </Tooltip>
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
                rowsPerPageOptions={[10, 20, 50]}
                labelRowsPerPage="Filas por página:"
              />
            ) : null}
          </TableContainer>
        </CardContent>
      </Card>

      <ModalDetalleCompra open={detailDialogOpen} onClose={handleCloseDetailDialog} compra={selectedDetail} />

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
