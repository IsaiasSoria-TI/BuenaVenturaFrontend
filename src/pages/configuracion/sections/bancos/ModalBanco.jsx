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
import PropTypes from 'prop-types';

function getSubmitLabel(saving, editing) {
    if (saving) return 'Guardando...';
    return editing ? 'Actualizar' : 'Registrar';
}

// Modal simple de catalogo: recibe valores y callbacks desde BancosSection.
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
    const title = editing ? 'Editar banco' : 'Nuevo banco';
    const submitLabel = getSubmitLabel(saving, editing);

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle sx={{ fontWeight: 700 }}>{title}</DialogTitle>

            <DialogContent dividers>
                <Stack spacing={2}>
                    <TextField
                        label="Nombre del banco"
                        fullWidth
                        value={form.nombre}
                        onChange={handleChange('nombre')}
                        error={!!errors.nombre}
                        helperText={errors.nombre}
                    />

                    {editing && (
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
                    {submitLabel}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

ModalBanco.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    editing: PropTypes.bool.isRequired,
    form: PropTypes.shape({
        idBanco: PropTypes.oneOfType([PropTypes.number, PropTypes.oneOf([null])]),
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
