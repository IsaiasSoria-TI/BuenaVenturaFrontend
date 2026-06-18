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
import PropTypes from 'prop-types';

function getSubmitLabel(saving, editing) {
    if (saving) return 'Guardando...';
    return editing ? 'Actualizar' : 'Registrar';
}

// Modal presentacional de tipo de cambio; recibe datos y handlers desde la seccion padre.
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
    const title = editing ? 'Editar tipo de cambio' : 'Nuevo tipo de cambio';
    const submitLabel = getSubmitLabel(saving, editing);

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle sx={{ fontWeight: 700 }}>{title}</DialogTitle>

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
                            htmlInput: { min: 0, step: '0.0001', inputMode: 'decimal' },
                        }}
                    />

                    <FormControlLabel
                        control={<Checkbox defaultChecked disabled />}
                        label="Mantener hasta siguiente fecha"
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
                <Button onClick={onClose} disabled={saving}>Cancelar</Button>
                <Button variant="contained" onClick={handleSubmit} disabled={saving}>
                    {submitLabel}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

ModalTipoCambio.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    editing: PropTypes.bool.isRequired,
    form: PropTypes.shape({
        fecha: PropTypes.string.isRequired,
        valor: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        flgActivo: PropTypes.string.isRequired,
    }).isRequired,
    errors: PropTypes.objectOf(PropTypes.string).isRequired,
    saving: PropTypes.bool.isRequired,
    handleChange: PropTypes.func.isRequired,
    handleSubmit: PropTypes.func.isRequired,
};
