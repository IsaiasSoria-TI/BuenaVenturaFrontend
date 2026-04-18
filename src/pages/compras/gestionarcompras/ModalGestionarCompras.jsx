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
  MenuItem,
  Typography,
  CircularProgress,
  Autocomplete,
} from '@mui/material';

export default function ModalGestionarCompras({
    open,
    onClose,
    editing,
    saving,
    catalogLoading,
    form,
    errors,
    proveedores,
    articulos,
    impuestos,
    pagos,
    selectedProveedor,
    setSelectedProveedor,
    setForm,
    setErrors,
    handleChange,
    handleSubmit,
    costoTotalPreview,
    importeImpuestoPreview,
}) {
    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle sx={{ fontWeight: 700 }}>
                {editing ? 'Editar compra' : 'Nueva compra'}
            </DialogTitle>

            <DialogContent dividers sx={{ pt: 2.5 }}>
                {catalogLoading ? (
                    <Box sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
                        <CircularProgress size={26} />
                    </Box>
                ) : (
                    <Stack spacing={2}>
                        <Autocomplete
                            fullWidth
                            options={proveedores}
                            value={selectedProveedor}
                            onChange={(_, newValue) => {
                                setSelectedProveedor(newValue);
                                setForm((prev) => ({
                                    ...prev,
                                    idProveedor: newValue ? newValue.idProveedor : null,
                                }));

                                if (errors.idProveedor) {
                                    setErrors((prev) => ({
                                        ...prev,
                                        idProveedor: '',
                                    }));
                                }
                            }}
                            getOptionLabel={(option) =>
                                option ? `${option.ruc} - ${option.razonSocial}` : ''
                            }
                            isOptionEqualToValue={(option, value) =>
                                option.idProveedor === value.idProveedor
                            }
                            filterOptions={(options, state) => {
                                const input = state.inputValue.toLowerCase().trim();

                                const filtered = options.filter(
                                    (option) =>
                                        option.ruc?.toLowerCase().includes(input) ||
                                        option.razonSocial?.toLowerCase().includes(input)
                                );

                                return filtered.slice(0, 20);
                            }}
                            renderOption={(props, option) => (
                                <Box component="li" {...props}>
                                    <Box>
                                        <Typography sx={{ fontWeight: 700, fontSize: '0.92rem' }}>
                                            {option.ruc}
                                        </Typography>
                                        <Typography sx={{ fontSize: '0.82rem', color: '#64748b' }}>
                                            {option.razonSocial}
                                        </Typography>
                                    </Box>
                                </Box>
                            )}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Proveedor (buscar por RUC)"
                                    placeholder="Escribe RUC o razón social"
                                    error={!!errors.idProveedor}
                                    helperText={errors.idProveedor}
                                />
                            )}
                        />

                        {selectedProveedor && (
                            <Box
                                sx={{
                                    p: 1.5,
                                    borderRadius: 2,
                                    backgroundColor: '#f8fafc',
                                    border: '1px solid #e2e8f0',
                                }}
                            >
                                <Typography sx={{ fontSize: '0.8rem', color: '#64748b' }}>
                                    Razón social
                                </Typography>
                                <Typography sx={{ fontWeight: 700, color: '#0f172a' }}>
                                    {selectedProveedor.razonSocial}
                                </Typography>

                                {selectedProveedor.direccion && (
                                    <>
                                        <Typography sx={{ mt: 1, fontSize: '0.8rem', color: '#64748b' }}>
                                            Dirección
                                        </Typography>
                                        <Typography sx={{ color: '#334155' }}>
                                            {selectedProveedor.direccion}
                                        </Typography>
                                    </>
                                )}
                            </Box>
                        )}

                        <Box
                            sx={{
                                display: 'grid',
                                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' },
                                gap: 2,
                            }}
                        >
                            <TextField
                                select
                                fullWidth
                                label="Artículo"
                                value={form.idArticulo}
                                onChange={handleChange('idArticulo')}
                                error={!!errors.idArticulo}
                                helperText={errors.idArticulo}
                            >
                                <MenuItem value="">
                                    <em>Seleccione</em>
                                </MenuItem>
                                {articulos.map((articulo) => (
                                    <MenuItem key={articulo.idArticulo} value={articulo.idArticulo}>
                                        {articulo.descripcion}
                                    </MenuItem>
                                ))}
                            </TextField>

                            <TextField
                                select
                                fullWidth
                                label="Impuesto"
                                value={form.idImpuesto}
                                onChange={handleChange('idImpuesto')}
                                error={!!errors.idImpuesto}
                                helperText={errors.idImpuesto}
                            >
                                <MenuItem value="">
                                    <em>Seleccione</em>
                                </MenuItem>
                                {impuestos.map((item) => (
                                    <MenuItem key={item.idImpuesto} value={item.idImpuesto}>
                                        {item.tipoImpuesto} ({item.valor}%)
                                    </MenuItem>
                                ))}
                            </TextField>

                            <TextField
                                select
                                fullWidth
                                label="Condición de pago"
                                value={form.idPago}
                                onChange={handleChange('idPago')}
                                error={!!errors.idPago}
                                helperText={errors.idPago}
                            >
                                <MenuItem value="">
                                    <em>Seleccione</em>
                                </MenuItem>
                                {pagos.map((item) => (
                                    <MenuItem key={item.idPago} value={item.idPago}>
                                        {item.pago}{item.dias != null ? ` (${item.dias} días)` : ''}
                                    </MenuItem>
                                ))}
                            </TextField>

                            <TextField
                                fullWidth
                                type="datetime-local"
                                label="Fecha de compra"
                                value={form.fechaCompras}
                                onChange={handleChange('fechaCompras')}
                                error={!!errors.fechaCompras}
                                helperText={errors.fechaCompras}
                                slotProps={{
                                    inputLabel: { shrink: true },
                                }}
                                InputProps={{
                                    sx: {
                                        '& input': {
                                            paddingTop: '16.5px',
                                            paddingBottom: '16.5px',
                                        },
                                        '& input::-webkit-datetime-edit': {
                                            lineHeight: 1.5,
                                        },
                                        '& input::-webkit-calendar-picker-indicator': {
                                            cursor: 'pointer',
                                        },
                                    },
                                }}
                            />

                            <TextField
                                fullWidth
                                label="Zona de producción"
                                value={form.zonaProduccion}
                                onChange={handleChange('zonaProduccion')}
                                error={!!errors.zonaProduccion}
                                helperText={errors.zonaProduccion}
                            />

                            <TextField
                                fullWidth
                                type="number"
                                label="Hectáreas"
                                value={form.hectareas}
                                onChange={handleChange('hectareas')}
                                error={!!errors.hectareas}
                                helperText={errors.hectareas}
                                inputProps={{ min: 0, step: '0.01' }}
                            />

                            <TextField
                                fullWidth
                                type="number"
                                label="Peso"
                                value={form.peso}
                                onChange={handleChange('peso')}
                                error={!!errors.peso}
                                helperText={errors.peso}
                                inputProps={{ min: 0.01, step: '0.01' }}
                            />

                            <TextField
                                fullWidth
                                type="number"
                                label="Costo por kilo"
                                value={form.costoKilo}
                                onChange={handleChange('costoKilo')}
                                error={!!errors.costoKilo}
                                helperText={errors.costoKilo}
                                inputProps={{ min: 0.01, step: '0.01' }}
                            />
                        </Box>

                        <Box
                            sx={{
                                display: 'grid',
                                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                                gap: 2,
                            }}
                        >
                            <TextField
                                fullWidth
                                label="Costo total"
                                value={costoTotalPreview}
                                InputProps={{ readOnly: true }}
                            />
                            <TextField
                                fullWidth
                                label="Importe impuesto"
                                value={importeImpuestoPreview}
                                InputProps={{ readOnly: true }}
                            />
                        </Box>
                    </Stack>
                )}
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button onClick={onClose} disabled={saving} sx={{ textTransform: 'none' }}>
                    Cancelar
                </Button>
                <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={saving || catalogLoading}
                    sx={{ textTransform: 'none', fontWeight: 700, boxShadow: 'none' }}
                >
                    {saving ? 'Guardando...' : editing ? 'Actualizar' : 'Registrar'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}