import React from 'react';
import PropTypes from 'prop-types';
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

export default function ModalTipoProveedor({
    open,
    onClose,
    editing,
    form,
    errors,
    saving,
    handleChange,
    handleSubmit,
}) {
    const titulo = editing ? 'Editar tipo de proveedor' : 'Nuevo tipo de proveedor';
    const textoBoton = saving
        ? 'Guardando...'
        : editing
            ? 'Actualizar'
            : 'Registrar';

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle sx={{ fontWeight: 700 }}>{titulo}</DialogTitle>

            <DialogContent dividers sx={{ pt: 2.5 }}>
                <Stack spacing={2}>
                    <TextField
                        fullWidth
                        label="Nombre"
                        value={form.nombre}
                        onChange={handleChange('nombre')}
                        error={!!errors.nombre}
                        helperText={errors.nombre || ''}
                    />

                    {editing ? (
                        <TextField
                            select
                            fullWidth
                            label="Estado"
                            value={form.flgActivo}
                            onChange={handleChange('flgActivo')}
                        >
                            <MenuItem value="true">Activo</MenuItem>
                            <MenuItem value="false">Inactivo</MenuItem>
                        </TextField>
                    ) : null}
                </Stack>
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button onClick={onClose} disabled={saving} sx={{ textTransform: 'none' }}>
                    Cancelar
                </Button>

                <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={saving}
                    sx={{ textTransform: 'none', fontWeight: 700, boxShadow: 'none' }}
                >
                    {textoBoton}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

ModalTipoProveedor.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    editing: PropTypes.bool.isRequired,
    form: PropTypes.shape({
        idTipoProveedor: PropTypes.oneOfType([PropTypes.number, PropTypes.oneOf([null])]),
        nombre: PropTypes.string.isRequired,
        flgActivo: PropTypes.string.isRequired,
    }).isRequired,
    errors: PropTypes.shape({
        nombre: PropTypes.string,
    }).isRequired,
    saving: PropTypes.bool.isRequired,
    handleChange: PropTypes.func.isRequired,
    handleSubmit: PropTypes.func.isRequired,
};
