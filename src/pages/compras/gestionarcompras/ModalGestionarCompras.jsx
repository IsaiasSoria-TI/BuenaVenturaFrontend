import * as React from 'react';
import PropTypes from 'prop-types';

import {
    Autocomplete,
    Box,
    Button,
    Checkbox,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControlLabel,
    IconButton,
    MenuItem,
    Paper,
    Stack,
    TextField,
    Typography,
} from '@mui/material';

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

function isIgvImpuesto(impuesto) {
    const tipo = String(impuesto?.tipoImpuesto || '').replace(/[.\s]/g, '').toUpperCase();
    return tipo === 'IGV';
}

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
    handleIgvChange,
    handleSubmit,
    handleDetalleChange,
    handleAddDetalle,
    handleRemoveDetalle,
    handleImpuestoChange,
    handleAddImpuesto,
    handleRemoveImpuesto,
    subtotalPreview,
    totalImpuestosPreview,
    igvPreview,
    totalGeneralPreview,
}) {
    const impuestosDisponibles = React.useMemo(
        () => impuestos.filter((item) => !isIgvImpuesto(item)),
        [impuestos]
    );

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
            <DialogTitle sx={{ fontWeight: 700 }}>
                {editing ? 'Editar compra' : 'Nueva compra'}
            </DialogTitle>

            <DialogContent dividers sx={{ pt: 2.5 }}>
                {catalogLoading ? (
                    <Box sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
                        <CircularProgress size={26} />
                    </Box>
                ) : (
                    <Stack spacing={2.5}>
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

                                return options
                                    .filter(
                                        (option) =>
                                            option.ruc?.toLowerCase().includes(input) ||
                                            option.razonSocial?.toLowerCase().includes(input)
                                    )
                                    .slice(0, 20);
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Proveedor"
                                    placeholder="Buscar por RUC o razón social"
                                    error={!!errors.idProveedor}
                                    helperText={errors.idProveedor}
                                />
                            )}
                        />

                        {selectedProveedor ? (
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
                                {selectedProveedor.direccion ? (
                                    <>
                                        <Typography sx={{ mt: 1, fontSize: '0.8rem', color: '#64748b' }}>
                                            Dirección
                                        </Typography>
                                        <Typography sx={{ color: '#334155' }}>
                                            {selectedProveedor.direccion}
                                        </Typography>
                                    </>
                                ) : null}
                            </Box>
                        ) : null}

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
                                        {item.pago}
                                        {item.dias != null ? ` (${item.dias} días)` : ''}
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
                                slotProps={{
                                    input: {
                                        inputProps: { min: 0, step: '0.01' },
                                    },
                                }}
                            />
                        </Box>

                        <Divider />

                        <Box>
                            <Stack
                                direction={{ xs: 'column', md: 'row' }}
                                justifyContent="space-between"
                                alignItems={{ xs: 'stretch', md: 'center' }}
                                spacing={1.5}
                                sx={{ mb: 1.5 }}
                            >
                                <Box>
                                    <Typography sx={{ fontWeight: 700, color: '#0f172a' }}>
                                        Artículos de la compra
                                    </Typography>
                                    <Typography sx={{ fontSize: '0.85rem', color: '#64748b' }}>
                                        Agrega uno o varios artículos.
                                    </Typography>
                                </Box>

                                <Button
                                    variant="outlined"
                                    onClick={handleAddDetalle}
                                    startIcon={<Icon name="add" size={18} />}
                                    sx={{ textTransform: 'none', fontWeight: 700 }}
                                >
                                    Agregar artículo
                                </Button>
                            </Stack>

                            <Stack spacing={1.5}>
                                {form.detalles.map((detalle, index) => (
                                    <Paper
                                        key={detalle.tempId}
                                        elevation={0}
                                        sx={{
                                            p: 2,
                                            border: '1px solid #e2e8f0',
                                            borderRadius: 2,
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                display: 'grid',
                                                gridTemplateColumns: {
                                                    xs: '1fr',
                                                    md: '1.5fr 1fr 1fr 1fr auto',
                                                },
                                                gap: 2,
                                                alignItems: 'center',
                                            }}
                                        >
                                            <TextField
                                                select
                                                fullWidth
                                                label="Artículo"
                                                value={detalle.idArticulo}
                                                onChange={(event) =>
                                                    handleDetalleChange(index, 'idArticulo', event.target.value)
                                                }
                                                error={!!errors[`detalle_${index}_idArticulo`]}
                                                helperText={errors[`detalle_${index}_idArticulo`]}
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
                                                fullWidth
                                                type="number"
                                                label="Peso"
                                                value={detalle.peso}
                                                onChange={(event) =>
                                                    handleDetalleChange(index, 'peso', event.target.value)
                                                }
                                                error={!!errors[`detalle_${index}_peso`]}
                                                helperText={errors[`detalle_${index}_peso`]}
                                                slotProps={{
                                                    input: {
                                                        inputProps: { min: 0.01, step: '0.01' },
                                                    },
                                                }}
                                            />

                                            <TextField
                                                fullWidth
                                                type="number"
                                                label="Costo kilo"
                                                value={detalle.costoKilo}
                                                onChange={(event) =>
                                                    handleDetalleChange(index, 'costoKilo', event.target.value)
                                                }
                                                error={!!errors[`detalle_${index}_costoKilo`]}
                                                helperText={errors[`detalle_${index}_costoKilo`]}
                                                slotProps={{
                                                    input: {
                                                        inputProps: { min: 0.01, step: '0.01' },
                                                    },
                                                }}
                                            />

                                            <TextField
                                                fullWidth
                                                label="Subtotal"
                                                value={(
                                                    Number(detalle.peso || 0) * Number(detalle.costoKilo || 0)
                                                ).toFixed(2)}
                                                slotProps={{
                                                    input: { readOnly: true },
                                                }}
                                            />

                                            <IconButton
                                                color="error"
                                                onClick={() => handleRemoveDetalle(index)}
                                                disabled={form.detalles.length === 1}
                                            >
                                                <Icon name="delete" size={20} />
                                            </IconButton>
                                        </Box>
                                    </Paper>
                                ))}
                            </Stack>

                            {errors.detalles ? (
                                <Typography sx={{ mt: 1, color: '#dc2626', fontSize: '0.8rem' }}>
                                    {errors.detalles}
                                </Typography>
                            ) : null}
                        </Box>

                        <Divider />

                        <Box>
                            <Stack spacing={0.5} sx={{ mb: 1.5 }}>
                                <Typography sx={{ fontWeight: 700, color: '#0f172a' }}>
                                    IGV
                                </Typography>
                                <Typography sx={{ fontSize: '0.85rem', color: '#64748b' }}>
                                    Define si la compra aplica IGV y revisa el importe calculado.
                                </Typography>
                            </Stack>

                            <Paper
                                elevation={0}
                                sx={{
                                    p: 1.5,
                                    border: '1px solid #e2e8f0',
                                    borderRadius: 2,
                                }}
                            >
                                <Box
                                    sx={{
                                        display: 'grid',
                                        gridTemplateColumns: {
                                            xs: '1fr',
                                            md: form.aplicaIgv ? '1.2fr 1fr 1fr' : '1.2fr 1fr',
                                        },
                                        gap: 1.5,
                                        alignItems: 'center',
                                    }}
                                >
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={Boolean(form.aplicaIgv)}
                                                onChange={handleIgvChange}
                                            />
                                        }
                                        label="Aplicar IGV"
                                        sx={{ m: 0 }}
                                    />

                                    <TextField
                                        fullWidth
                                        type="number"
                                        label="Porcentaje IGV"
                                        value={form.porcentajeIgv}
                                        onChange={handleChange('porcentajeIgv')}
                                        error={!!errors.porcentajeIgv}
                                        helperText={errors.porcentajeIgv}
                                        slotProps={{
                                            input: {
                                                inputProps: { min: 0, step: '0.01' },
                                            },
                                        }}
                                    />

                                    {form.aplicaIgv ? (
                                        <TextField
                                            fullWidth
                                            label="Importe IGV"
                                            value={igvPreview}
                                            slotProps={{
                                                input: { readOnly: true },
                                            }}
                                        />
                                    ) : null}
                                </Box>
                            </Paper>
                        </Box>

                        <Divider />

                        <Box>
                            <Stack
                                direction={{ xs: 'column', md: 'row' }}
                                justifyContent="space-between"
                                alignItems={{ xs: 'stretch', md: 'center' }}
                                spacing={1.5}
                                sx={{ mb: 1.5 }}
                            >
                                <Box>
                                    <Typography sx={{ fontWeight: 700, color: '#0f172a' }}>
                                        Retencion / detraccion
                                    </Typography>
                                    <Typography sx={{ fontSize: '0.85rem', color: '#64748b' }}>
                                        Agrega retenciones o detracciones aplicables.
                                    </Typography>
                                </Box>

                                <Button
                                    variant="outlined"
                                    onClick={handleAddImpuesto}
                                    startIcon={<Icon name="add" size={18} />}
                                    sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
                                >
                                    Agregar ret./det.
                                </Button>
                            </Stack>

                            <Stack spacing={1.25}>
                                {form.impuestos.map((impuestoItem, index) => {
                                    const impuestoSeleccionado = impuestosDisponibles.find(
                                        (item) => item.idImpuesto === Number(impuestoItem.idImpuesto)
                                    );

                                    const baseImpuestos = Number(subtotalPreview) + Number(igvPreview);
                                    const importe = impuestoSeleccionado
                                        ? (baseImpuestos * Number(impuestoSeleccionado.valor || 0)) / 100
                                        : 0;

                                    return (
                                        <Paper
                                            key={impuestoItem.tempId}
                                            elevation={0}
                                            sx={{
                                                p: 1.5,
                                                border: '1px solid #e2e8f0',
                                                borderRadius: 2,
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    display: 'grid',
                                                    gridTemplateColumns: {
                                                        xs: '1fr',
                                                        md: '1.5fr 1fr 1fr auto',
                                                    },
                                                    gap: 1.5,
                                                    alignItems: 'center',
                                                }}
                                            >
                                                <TextField
                                                    select
                                                    fullWidth
                                                    label="Retencion / detraccion"
                                                    value={impuestoItem.idImpuesto}
                                                    onChange={(event) =>
                                                        handleImpuestoChange(index, 'idImpuesto', event.target.value)
                                                    }
                                                    error={!!errors[`impuesto_${index}_idImpuesto`]}
                                                    helperText={errors[`impuesto_${index}_idImpuesto`]}
                                                >
                                                    <MenuItem value="">
                                                        <em>Seleccione</em>
                                                    </MenuItem>
                                                    {impuestosDisponibles.map((item) => (
                                                        <MenuItem key={item.idImpuesto} value={item.idImpuesto}>
                                                            {item.tipoImpuesto} ({item.valor}%)
                                                        </MenuItem>
                                                    ))}
                                                </TextField>

                                                <TextField
                                                    fullWidth
                                                    label="Porcentaje"
                                                    value={impuestoSeleccionado ? `${impuestoSeleccionado.valor}%` : '0%'}
                                                    slotProps={{
                                                        input: { readOnly: true },
                                                    }}
                                                />

                                                <TextField
                                                    fullWidth
                                                    label="Importe"
                                                    value={importe.toFixed(2)}
                                                    slotProps={{
                                                        input: { readOnly: true },
                                                    }}
                                                />

                                                <IconButton
                                                    color="error"
                                                    onClick={() => handleRemoveImpuesto(index)}
                                                    disabled={form.impuestos.length === 1}
                                                >
                                                    <Icon name="delete" size={20} />
                                                </IconButton>
                                            </Box>
                                        </Paper>
                                    );
                                })}
                            </Stack>

                            {errors.impuestos ? (
                                <Typography sx={{ mt: 1, color: '#dc2626', fontSize: '0.8rem' }}>
                                    {errors.impuestos}
                                </Typography>
                            ) : null}
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
                                fullWidth
                                label="Subtotal"
                                value={subtotalPreview}
                                slotProps={{
                                    input: { readOnly: true },
                                }}
                            />

                            <TextField
                                fullWidth
                                label="IGV"
                                value={form.aplicaIgv ? igvPreview : '0.00'}
                                slotProps={{
                                    input: { readOnly: true },
                                }}
                            />

                            <TextField
                                fullWidth
                                label="Retencion / detraccion"
                                value={totalImpuestosPreview}
                                slotProps={{
                                    input: { readOnly: true },
                                }}
                            />

                            <TextField
                                fullWidth
                                label="Total final"
                                value={totalGeneralPreview}
                                slotProps={{
                                    input: { readOnly: true },
                                }}
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

ModalGestionarCompras.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    editing: PropTypes.bool.isRequired,
    saving: PropTypes.bool.isRequired,
    catalogLoading: PropTypes.bool.isRequired,
    form: PropTypes.shape({
        idProveedor: PropTypes.oneOfType([PropTypes.number, PropTypes.oneOf([null])]),
        idPago: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        fechaCompras: PropTypes.string.isRequired,
        zonaProduccion: PropTypes.string.isRequired,
        hectareas: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        detalles: PropTypes.arrayOf(
            PropTypes.shape({
                tempId: PropTypes.string.isRequired,
                idArticulo: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
                peso: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
                costoKilo: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
            })
        ).isRequired,
        impuestos: PropTypes.arrayOf(
            PropTypes.shape({
                tempId: PropTypes.string.isRequired,
                idImpuesto: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
            })
        ).isRequired,
        aplicaIgv: PropTypes.bool.isRequired,
        porcentajeIgv: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        importeIgv: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    }).isRequired,
    errors: PropTypes.objectOf(PropTypes.string).isRequired,
    proveedores: PropTypes.arrayOf(PropTypes.object).isRequired,
    articulos: PropTypes.arrayOf(PropTypes.object).isRequired,
    impuestos: PropTypes.arrayOf(PropTypes.object).isRequired,
    pagos: PropTypes.arrayOf(PropTypes.object).isRequired,
    selectedProveedor: PropTypes.object,
    setSelectedProveedor: PropTypes.func.isRequired,
    setForm: PropTypes.func.isRequired,
    setErrors: PropTypes.func.isRequired,
    handleChange: PropTypes.func.isRequired,
    handleIgvChange: PropTypes.func.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    handleDetalleChange: PropTypes.func.isRequired,
    handleAddDetalle: PropTypes.func.isRequired,
    handleRemoveDetalle: PropTypes.func.isRequired,
    handleImpuestoChange: PropTypes.func.isRequired,
    handleAddImpuesto: PropTypes.func.isRequired,
    handleRemoveImpuesto: PropTypes.func.isRequired,
    subtotalPreview: PropTypes.string.isRequired,
    totalImpuestosPreview: PropTypes.string.isRequired,
    igvPreview: PropTypes.string.isRequired,
    totalGeneralPreview: PropTypes.string.isRequired,
};

ModalGestionarCompras.defaultProps = {
    selectedProveedor: null,
};
