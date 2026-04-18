import * as React from 'react';
import {
    Box,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    MenuItem,
} from '@mui/material';

const MEDIDAS = [
    { value: 'kg', label: 'Kilogramos (kg)' },
    { value: 'tn', label: 'Toneladas (tn)' },
];

export default function ModalArticulo({
    open,
    onClose,
    editing,
    form,
    errors,
    saving,
    onChange,
    onSubmit,
}) {
    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle sx={{ fontWeight: 700 }}>
                {editing ? 'Editar artículo' : 'Nuevo artículo'}
            </DialogTitle>

            <DialogContent dividers sx={{ pt: 2.5 }}>
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', md: '1.4fr 1fr 1fr' },
                        gap: 2,
                        alignItems: 'start',
                    }}
                >
                    <TextField
                        fullWidth
                        label="Descripción"
                        value={form.descripcion}
                        onChange={onChange('descripcion')}
                        error={!!errors.descripcion}
                        helperText={errors.descripcion}
                    />

                    <TextField
                        select
                        fullWidth
                        label="Medida"
                        value={form.medida}
                        onChange={onChange('medida')}
                        error={!!errors.medida}
                        helperText={errors.medida || 'Seleccione la unidad'}
                    >
                        <MenuItem value="">
                            <em>Seleccione</em>
                        </MenuItem>
                        {MEDIDAS.map((medida) => (
                            <MenuItem key={medida.value} value={medida.value}>
                                {medida.label}
                            </MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        fullWidth
                        type="number"
                        label="Stock"
                        value={form.stock}
                        onChange={onChange('stock')}
                        error={!!errors.stock}
                        helperText={errors.stock || 'Opcional. Si lo dejas vacío, se guardará en 0.'}
                        inputProps={{ min: 0, step: '0.01' }}
                    />
                </Box>

                {editing && (
                    <Box sx={{ mt: 2 }}>
                        <TextField
                            select
                            fullWidth
                            label="Estado"
                            value={form.estado}
                            onChange={onChange('estado')}
                        >
                            <MenuItem value="Activo">Activo</MenuItem>
                            <MenuItem value="Inactivo">Inactivo</MenuItem>
                        </TextField>
                    </Box>
                )}
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button onClick={onClose} disabled={saving} sx={{ textTransform: 'none' }}>
                    Cancelar
                </Button>
                <Button
                    variant="contained"
                    onClick={onSubmit}
                    disabled={saving}
                    sx={{ textTransform: 'none', fontWeight: 700, boxShadow: 'none' }}
                >
                    {saving ? 'Guardando...' : editing ? 'Actualizar' : 'Registrar'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}