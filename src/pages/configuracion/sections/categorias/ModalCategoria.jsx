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

// Modal presentacional de categorias; la pantalla padre controla validacion y guardado.
export default function ModalCategoria({
    open,
    onClose,
    editing,
    form,
    errors,
    saving,
    cuentasContables,
    handleChange,
    handleSubmit,
}) {
    const titulo = editing ? 'Editar categoría' : 'Nueva categoría';
    const textoBoton = getSubmitLabel(saving, editing);

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle sx={{ fontWeight: 700 }}>{titulo}</DialogTitle>

            <DialogContent dividers sx={{ pt: 2.5 }}>
                <Stack spacing={2}>
                    <TextField
                        fullWidth
                        label="Descripción"
                        value={form.descripcion}
                        onChange={handleChange('descripcion')}
                        error={!!errors.descripcion}
                        helperText={errors.descripcion || ''}
                    />

                    <TextField
                        select
                        fullWidth
                        label="Cuenta contable"
                        value={form.idCuentaContable}
                        onChange={handleChange('idCuentaContable')}
                        error={!!errors.idCuentaContable}
                        helperText={errors.idCuentaContable || ''}
                    >
                        <MenuItem value="">
                            <em>Seleccione</em>
                        </MenuItem>

                        {cuentasContables
                            .filter((item) => item.estado === 'Activo')
                            .map((item) => (
                                <MenuItem key={item.idCuentaContable} value={item.idCuentaContable}>
                                    {item.codigo} - {item.descripcion}
                                </MenuItem>
                            ))}
                    </TextField>

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

ModalCategoria.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    editing: PropTypes.bool.isRequired,
    form: PropTypes.shape({
        idCategoria: PropTypes.oneOfType([PropTypes.number, PropTypes.oneOf([null])]),
        descripcion: PropTypes.string.isRequired,
        idCuentaContable: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        estado: PropTypes.string.isRequired,
    }).isRequired,
    errors: PropTypes.shape({
        descripcion: PropTypes.string,
        idCuentaContable: PropTypes.string,
    }).isRequired,
    saving: PropTypes.bool.isRequired,
    cuentasContables: PropTypes.arrayOf(
        PropTypes.shape({
            idCuentaContable: PropTypes.number.isRequired,
            codigo: PropTypes.string.isRequired,
            descripcion: PropTypes.string.isRequired,
            estado: PropTypes.string.isRequired,
        })
    ).isRequired,
    handleChange: PropTypes.func.isRequired,
    handleSubmit: PropTypes.func.isRequired,
};
