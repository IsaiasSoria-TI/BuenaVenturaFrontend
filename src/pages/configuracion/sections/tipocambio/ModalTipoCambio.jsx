import React from 'react';
import {
    Button,
    Checkbox,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    MenuItem,
    Stack,
    TextField,
} from '@mui/material';

export default function ModalTipoCambio({
    open,
    onClose,
    editing,
    form,
    errors,
    saving,
    handleChange,
    handleSubmit,
}) {
    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle sx={{ fontWeight: 700 }}>
                {editing ? 'Editar tipo de cambio' : 'Nuevo tipo de cambio'}
            </DialogTitle>

            <DialogContent dividers>
                <Stack spacing={2}>
                    <TextField
                        fullWidth
                        type="date"
                        label="Fecha"
                        value={form.fecha}
                        onChange={handleChange('fecha')}
                        error={!!errors.fecha}
                        helperText={errors.fecha}
                        slotProps={{
                            inputLabel: { shrink: true },
                        }}
                    />

                    <TextField
                        fullWidth
                        type="number"
                        label="Valor"
                        value={form.valor}
                        onChange={handleChange('valor')}
                        error={!!errors.valor}
                        helperText={errors.valor}
                        slotProps={{
                            input: {
                                inputProps: { min: 0, step: '0.0001', inputMode: 'decimal' },
                            },
                        }}
                    />

                    <FormControlLabel
                        control={<Checkbox checked disabled />}
                        label="Mantener hasta siguiente fecha"
                    />

                    {editing ? (
                        <TextField
                            select
                            label="Estado"
                            fullWidth
                            value={form.flgActivo}
                            onChange={handleChange('flgActivo')}
                        >
                            <MenuItem value="true">Activo</MenuItem>
                            <MenuItem value="false">Inactivo</MenuItem>
                        </TextField>
                    ) : null}
                </Stack>
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose} disabled={saving}>Cancelar</Button>
                <Button variant="contained" onClick={handleSubmit} disabled={saving}>
                    {saving ? 'Guardando...' : editing ? 'Actualizar' : 'Registrar'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
