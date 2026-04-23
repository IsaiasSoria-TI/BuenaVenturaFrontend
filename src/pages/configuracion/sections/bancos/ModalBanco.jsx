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

export default function ModalBanco({
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
                {editing ? 'Editar banco' : 'Nuevo banco'}
            </DialogTitle>

            <DialogContent dividers>
                <Stack spacing={2}>
                    <TextField
                        label="Nombre del banco"
                        fullWidth
                        value={form.descripcion}
                        onChange={handleChange('descripcion')}
                        error={!!errors.descripcion}
                        helperText={errors.descripcion}
                    />

                    {editing && (
                        <TextField
                            select
                            label="Estado"
                            fullWidth
                            value={form.estado}
                            onChange={handleChange('estado')}
                        >
                            <MenuItem value="Activo">Activo</MenuItem>
                            <MenuItem value="Inactivo">Inactivo</MenuItem>
                        </TextField>
                    )}
                </Stack>
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose}>Cancelar</Button>

                <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={saving}
                >
                    {saving ? 'Guardando...' : editing ? 'Actualizar' : 'Registrar'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}