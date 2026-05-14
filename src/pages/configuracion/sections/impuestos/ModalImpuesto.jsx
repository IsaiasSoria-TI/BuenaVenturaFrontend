import React from 'react';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    MenuItem,
    Stack,
    TextField,
} from '@mui/material';

export default function ModalImpuesto({
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
                {editing ? 'Editar impuesto' : 'Nuevo impuesto'}
            </DialogTitle>

            <DialogContent dividers>
                <Stack spacing={2}>
                    <TextField
                        label="Tipo de impuesto"
                        fullWidth
                        value={form.tipoImpuesto}
                        onChange={handleChange('tipoImpuesto')}
                        error={!!errors.tipoImpuesto}
                        helperText={errors.tipoImpuesto}
                    />

                    <TextField
                        label="Valor (%)"
                        type="number"
                        fullWidth
                        value={form.valor}
                        onChange={handleChange('valor')}
                        error={!!errors.valor}
                        helperText={errors.valor}
                        slotProps={{
                            input: {
                                inputProps: { min: 0, step: '0.01', inputMode: 'decimal' },
                            },
                        }}
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
