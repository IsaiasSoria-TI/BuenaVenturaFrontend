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

import { cuentaPagarService } from '../../services/cuentaPagarService';
import ModalDetalleCuentaPagar from './ModalDetalleCuentaPagar';
import ModalCuentaPagar from './ModalCuentaPagar';
import {
  formatCompraCode,
  formatCuentaPagarCode,
  formatDateTimePeru,
  formatRecepcionCode,
} from '../../utils/formatters';

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
  const [detailDialogOpen, setDetailDialogOpen] = React.useState(false);
  const [selectedDetail, setSelectedDetail] = React.useState(null);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [selectedEdit, setSelectedEdit] = React.useState(null);
  const [editForm, setEditForm] = React.useState({
    numeroFactura: '',
    moneda: 'PEN',
    codigoDetRet: '',
  });
  const [editSaving, setEditSaving] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [selectedDelete, setSelectedDelete] = React.useState(null);
  const [deleteSaving, setDeleteSaving] = React.useState(false);

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

  const handleOpenDetailDialog = (cuenta) => {
    setSelectedDetail(cuenta);
    setDetailDialogOpen(true);
  };

  const handleCloseDetailDialog = () => {
    setDetailDialogOpen(false);
    setSelectedDetail(null);
  };

  const handleOpenEditDialog = (cuenta) => {
    setSelectedEdit(cuenta);
    setEditForm({
      numeroFactura: cuenta.numeroFactura || '',
      moneda: cuenta.moneda || 'PEN',
      codigoDetRet: cuenta.codigoDetRet || '',
    });
    setServerError('');
    setServerSuccess('');
    setEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    if (editSaving) return;

    setEditDialogOpen(false);
    setSelectedEdit(null);
  };

  const handleEditChange = (field) => (event) => {
    setEditForm((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleSubmitEdit = async () => {
    if (!selectedEdit?.idCuentaPagar) return;

    try {
      setEditSaving(true);
      setServerError('');
      setServerSuccess('');

      await cuentaPagarService.actualizar(selectedEdit.idCuentaPagar, {
        tipoFactura: 'UNICA',
        numeroFactura: editForm.numeroFactura.trim(),
        moneda: editForm.moneda,
        codigoDetRet: editForm.codigoDetRet.trim(),
        detalles: [
          {
            idCompras: selectedEdit.idCompras,
            idRecepciones: selectedEdit.idRecepciones,
            numeroFactura: null,
          },
        ],
      });

      setServerSuccess('Cuenta por pagar actualizada correctamente.');
      setEditDialogOpen(false);
      setSelectedEdit(null);
      await cargarCuentas();
    } catch (error) {
      console.error('Error al actualizar cuenta por pagar:', error);

      const message =
        error?.response?.data?.message ||
        error?.response?.data ||
        'No se pudo actualizar la cuenta por pagar.';

      setServerError(
        typeof message === 'string'
          ? message
          : 'No se pudo actualizar la cuenta por pagar.'
      );
    } finally {
      setEditSaving(false);
    }
  };

  const handleOpenDeleteDialog = (cuenta) => {
    setSelectedDelete(cuenta);
    setServerError('');
    setServerSuccess('');
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    if (deleteSaving) return;

    setDeleteDialogOpen(false);
    setSelectedDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!selectedDelete?.idCuentaPagar) return;

    try {
      setDeleteSaving(true);
      setServerError('');
      setServerSuccess('');

      await cuentaPagarService.eliminar(selectedDelete.idCuentaPagar);
      setServerSuccess('Cuenta por pagar anulada correctamente.');
      setDeleteDialogOpen(false);
      setSelectedDelete(null);
      await cargarCuentas();
    } catch (error) {
      console.error('Error al anular cuenta por pagar:', error);

      const message =
        error?.response?.data?.message ||
        error?.response?.data ||
        'No se pudo anular la cuenta por pagar.';

      setServerError(
        typeof message === 'string'
          ? message
          : 'No se pudo anular la cuenta por pagar.'
      );
    } finally {
      setDeleteSaving(false);
    }
  };

  const handleChangePage = (_event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(Number.parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const cuentasFiltradas = React.useMemo(() => {
    const criterio = searchTerm.trim().toLowerCase();
    if (!criterio) return cuentas;

    return cuentas.filter((cuenta) => {
      const valoresBusqueda = [
        formatCuentaPagarCode(cuenta.idCuentaPagar),
        formatCompraCode(cuenta.idCompras),
        formatRecepcionCode(cuenta.idRecepciones),
        cuenta.proveedor,
        cuenta.ruc,
        cuenta.articulo,
        cuenta.numeroFactura,
        cuenta.moneda,
        cuenta.codigoDetRet,
        cuenta.estado,
        formatDateTimePeru(cuenta.fechaCreacion),
        cuenta.fechaCreacion,
      ];

      return valoresBusqueda.some((value) =>
        String(value || '').toLowerCase().includes(criterio)
      );
    });
  }, [cuentas, searchTerm]);

  const cuentasOrdenadas = React.useMemo(() => {
    return [...cuentasFiltradas].sort(
      (a, b) => new Date(b.fechaCreacion || 0) - new Date(a.fechaCreacion || 0)
    );
  }, [cuentasFiltradas]);

  const cuentasPaginadas = React.useMemo(() => {
    const inicio = page * rowsPerPage;
    const fin = inicio + rowsPerPage;
    return cuentasOrdenadas.slice(inicio, fin);
  }, [cuentasOrdenadas, page, rowsPerPage]);

  const showLoading = loading;
  const showEmpty = !loading && cuentas.length === 0;
  const showNoResults = !loading && cuentas.length > 0 && cuentasFiltradas.length === 0;
  const showRows = !loading && cuentasFiltradas.length > 0;

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

          <TextField
            fullWidth
            size="small"
            placeholder="Buscar factura..."
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
            sx={{ mb: 2 }}
          />

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
                  <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>ACCIONES</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {showLoading ? (
                  <TableRow>
                    <TableCell colSpan={12} align="center" sx={{ py: 4 }}>
                      <CircularProgress size={28} />
                    </TableCell>
                  </TableRow>
                ) : null}

                {showEmpty ? (
                  <TableRow>
                    <TableCell colSpan={12} align="center" sx={{ py: 4, color: '#64748b' }}>
                      No hay cuentas por pagar registradas.
                    </TableCell>
                  </TableRow>
                ) : null}

                {showNoResults ? (
                  <TableRow>
                    <TableCell colSpan={12} align="center" sx={{ py: 4, color: '#64748b' }}>
                      No se encontraron cuentas por pagar con ese criterio.
                    </TableCell>
                  </TableRow>
                ) : null}

                {showRows
                  ? cuentasPaginadas.map((cuenta) => (
                    <TableRow key={cuenta.idCuentaPagar} hover>
                      <TableCell>{formatCuentaPagarCode(cuenta.idCuentaPagar)}</TableCell>
                      <TableCell>{formatCompraCode(cuenta.idCompras)}</TableCell>
                      <TableCell>{formatRecepcionCode(cuenta.idRecepciones)}</TableCell>
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
                      <TableCell>{formatDateTimePeru(cuenta.fechaCreacion)}</TableCell>
                      <TableCell align="center">
                        <Tooltip title="Ver detalle">
                          <IconButton onClick={() => handleOpenDetailDialog(cuenta)}>
                            <Icon name="visibility" size={20} color="#0f766e" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Editar factura">
                          <IconButton onClick={() => handleOpenEditDialog(cuenta)}>
                            <Icon name="edit" size={20} color="#1976d2" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Anular">
                          <IconButton onClick={() => handleOpenDeleteDialog(cuenta)}>
                            <Icon name="delete" size={20} color="#ef4444" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                  : null}
              </TableBody>
            </Table>

            {showRows ? (
              <TablePagination
                component="div"
                count={cuentasFiltradas.length}
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

      <ModalDetalleCuentaPagar
        open={detailDialogOpen}
        onClose={handleCloseDetailDialog}
        cuenta={selectedDetail}
      />

      <Dialog open={editDialogOpen} onClose={handleCloseEditDialog} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 700 }}>Editar factura</DialogTitle>
        <DialogContent dividers sx={{ pt: 2.5 }}>
          <Stack spacing={2}>
            {selectedEdit ? (
              <Typography sx={{ fontSize: '0.85rem', color: '#64748b' }}>
                {formatCuentaPagarCode(selectedEdit.idCuentaPagar)} - {formatCompraCode(selectedEdit.idCompras)}
              </Typography>
            ) : null}

            <TextField
              fullWidth
              label="Número de factura"
              value={editForm.numeroFactura}
              onChange={handleEditChange('numeroFactura')}
            />

            <TextField
              select
              fullWidth
              label="Moneda"
              value={editForm.moneda}
              onChange={handleEditChange('moneda')}
            >
              <MenuItem value="PEN">PEN</MenuItem>
              <MenuItem value="USD">USD</MenuItem>
            </TextField>

            <TextField
              fullWidth
              label="Código de detracción/retención"
              value={editForm.codigoDetRet}
              onChange={handleEditChange('codigoDetRet')}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleCloseEditDialog} disabled={editSaving} sx={{ textTransform: 'none' }}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmitEdit}
            disabled={editSaving || !editForm.numeroFactura.trim() || !editForm.codigoDetRet.trim()}
            sx={{ textTransform: 'none', fontWeight: 700, boxShadow: 'none' }}
          >
            {editSaving ? 'Guardando...' : 'Actualizar'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle sx={{ fontWeight: 700 }}>Confirmar anulación</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: '#475569' }}>
            ¿Seguro que deseas anular esta cuenta por pagar?
          </Typography>
          {selectedDelete ? (
            <Typography sx={{ mt: 1, fontWeight: 700, color: '#0f172a' }}>
              {formatCuentaPagarCode(selectedDelete.idCuentaPagar)} - {selectedDelete.numeroFactura || '-'}
            </Typography>
          ) : null}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleCloseDeleteDialog} disabled={deleteSaving} sx={{ textTransform: 'none' }}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmDelete}
            disabled={deleteSaving}
            sx={{ textTransform: 'none', fontWeight: 700, boxShadow: 'none' }}
          >
            {deleteSaving ? 'Anulando...' : 'Anular'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
