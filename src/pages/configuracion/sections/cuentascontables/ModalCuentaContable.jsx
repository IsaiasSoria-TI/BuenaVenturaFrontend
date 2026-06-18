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

function getSubmitLabel(saving, editing) {
    if (saving) return 'Guardando...';
    return editing ? 'Actualizar' : 'Registrar';
}

// Modal presentacional de cuentas contables; no llama servicios directamente.
export default function ModalCuentaContable({
    open,
    onClose,
    editing,
    form,
    errors,
    saving,
    handleChange,
    handleSubmit,
}) {
    const titulo = editing ? 'Editar cuenta contable' : 'Nueva cuenta contable';
    const textoBoton = getSubmitLabel(saving, editing);

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle sx={{ fontWeight: 700 }}>{titulo}</DialogTitle>

            <DialogContent dividers sx={{ pt: 2.5 }}>
                <Stack spacing={2}>
                    <TextField
                        fullWidth
                        label="Código"
                        value={form.codigo}
                        onChange={handleChange('codigo')}
                        error={!!errors.codigo}
                        helperText={errors.codigo || ''}
                    />

                    <TextField
                        fullWidth
                        label="Descripción"
                        value={form.descripcion}
                        onChange={handleChange('descripcion')}
                        error={!!errors.descripcion}
                        helperText={errors.descripcion || ''}
                    />

                    {editing && (
                        <TextField
                            select
                            fullWidth
                            label="Estado"
                            value={form.estado}
                            onChange={handleChange('estado')}
                        >
                            <MenuItem value="Activo">Activo</MenuItem>
                            <MenuItem value="Inactivo">Inactivo</MenuItem>
                        </TextField>
                    )}
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

ModalCuentaContable.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    editing: PropTypes.bool.isRequired,
    form: PropTypes.shape({
        idCuentaContable: PropTypes.oneOfType([PropTypes.number, PropTypes.oneOf([null])]),
        codigo: PropTypes.string.isRequired,
        descripcion: PropTypes.string.isRequired,
        estado: PropTypes.string.isRequired,
    }).isRequired,
    errors: PropTypes.shape({
        codigo: PropTypes.string,
        descripcion: PropTypes.string,
    }).isRequired,
    saving: PropTypes.bool.isRequired,
    handleChange: PropTypes.func.isRequired,
    handleSubmit: PropTypes.func.isRequired,
};
