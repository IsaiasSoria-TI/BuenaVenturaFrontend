import PropTypes from 'prop-types';
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    MenuItem,
    TextField,
} from '@mui/material';

// Opciones fijas de unidad de medida permitidas para los articulos.
const MEDIDAS = [
    { value: 'kg', label: 'Kilogramos (kg)' },
    { value: 'tn', label: 'Toneladas (tn)' },
];

function getSubmitLabel(saving, editing) {
    if (saving) return 'Guardando...';
    return editing ? 'Actualizar' : 'Registrar';
}

export default function ModalArticulo({
    open,
    onClose,
    editing,
    form,
    errors,
    saving,
    onChange,
    onSubmit,
    categorias,
    tiposEnvase,
}) {
    // Textos auxiliares: muestran errores si existen o ayuda por defecto.
    const helperDescripcion = errors.descripcion || '';
    const helperMedida = errors.medida || 'Seleccione la unidad';
    const helperTipoEnvase = errors.idTipoEnvase || 'Seleccione el tipo de envase';
    const helperStock =
        errors.stock || 'Opcional. Puede quedar vacío.';
    const helperCategoria = errors.idCategoria || 'Seleccione una categoría';

    const titulo = editing ? 'Editar artículo' : 'Nuevo artículo';
    const textoBoton = getSubmitLabel(saving, editing);

    const mostrarEstado = editing;

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle sx={{ fontWeight: 700 }}>{titulo}</DialogTitle>

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
                        helperText={helperDescripcion}
                    />

                    <TextField
                        select
                        fullWidth
                        label="Medida"
                        value={form.medida}
                        onChange={onChange('medida')}
                        error={!!errors.medida}
                        helperText={helperMedida}
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
                        type="text"
                        label="Stock de seguridad"
                        value={form.stock}
                        onChange={onChange('stock')}
                        error={!!errors.stock}
                        helperText={helperStock}
                        slotProps={{ htmlInput: { inputMode: 'decimal', pattern: '[0-9]*[.]?[0-9]*' } }}
                    />

                    <TextField
                        select
                        fullWidth
                        label="Tipo de envase"
                        value={form.idTipoEnvase}
                        onChange={onChange('idTipoEnvase')}
                        error={!!errors.idTipoEnvase}
                        helperText={helperTipoEnvase}
                    >
                        <MenuItem value="">
                            <em>Seleccione</em>
                        </MenuItem>

                        {tiposEnvase
                            .filter((tipoEnvase) => tipoEnvase.estado === 'Activo')
                            .map((tipoEnvase) => (
                                <MenuItem key={tipoEnvase.idTipoEnvase} value={tipoEnvase.idTipoEnvase}>
                                    {tipoEnvase.nombre}
                                </MenuItem>
                            ))}
                    </TextField>

                    <TextField
                        select
                        fullWidth
                        label="Categoría"
                        value={form.idCategoria}
                        onChange={onChange('idCategoria')}
                        error={!!errors.idCategoria}
                        helperText={helperCategoria}
                    >
                        <MenuItem value="">
                            <em>Seleccione</em>
                        </MenuItem>

                        {categorias
                            .filter((categoria) => categoria.estado === 'Activo')
                            .map((categoria) => (
                                <MenuItem key={categoria.idCategoria} value={categoria.idCategoria}>
                                    {categoria.descripcion}
                                </MenuItem>
                            ))}
                    </TextField>
                </Box>

                {mostrarEstado && (
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
                    {textoBoton}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

ModalArticulo.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    editing: PropTypes.bool.isRequired,
    form: PropTypes.shape({
        idArticulo: PropTypes.oneOfType([PropTypes.number, PropTypes.oneOf([null])]),
        descripcion: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        medida: PropTypes.string,
        idTipoEnvase: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        stock: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        idCategoria: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        estado: PropTypes.string,
    }).isRequired,
    errors: PropTypes.shape({
        descripcion: PropTypes.string,
        medida: PropTypes.string,
        idTipoEnvase: PropTypes.string,
        stock: PropTypes.string,
        idCategoria: PropTypes.string,
        estado: PropTypes.string,
    }).isRequired,
    saving: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    categorias: PropTypes.arrayOf(
        PropTypes.shape({
            idCategoria: PropTypes.number.isRequired,
            descripcion: PropTypes.string.isRequired,
            estado: PropTypes.string,
        })
    ).isRequired,
    tiposEnvase: PropTypes.arrayOf(
        PropTypes.shape({
            idTipoEnvase: PropTypes.number.isRequired,
            nombre: PropTypes.string,
            estado: PropTypes.string,
        })
    ).isRequired,
};
