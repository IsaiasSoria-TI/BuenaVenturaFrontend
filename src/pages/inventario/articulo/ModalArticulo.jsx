import React from 'react';
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
    categorias,
}) {
    const helperDescripcion = errors.descripcion || '';
    const helperMedida = errors.medida || 'Seleccione la unidad';
    const helperStock =
        errors.stock || 'Opcional. Si lo dejas vacío, se guardará en 0.';
    const helperCategoria = errors.idCategoria || 'Seleccione una categoría';

    const titulo = editing ? 'Editar artículo' : 'Nuevo artículo';
    const textoBoton = saving
        ? 'Guardando...'
        : editing
            ? 'Actualizar'
            : 'Registrar';

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
                        type="number"
                        label="Stock De Seguridad"
                        value={form.stock}
                        onChange={onChange('stock')}
                        error={!!errors.stock}
                        helperText={helperStock}
                        inputProps={{ min: 0, step: '0.01' }}
                    />

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

                {mostrarEstado ? (
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
                ) : null}
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
        stock: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        idCategoria: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        estado: PropTypes.string,
    }).isRequired,
    errors: PropTypes.shape({
        descripcion: PropTypes.string,
        medida: PropTypes.string,
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
};