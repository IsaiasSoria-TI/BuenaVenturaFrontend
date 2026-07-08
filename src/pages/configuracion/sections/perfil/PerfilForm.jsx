import PropTypes from 'prop-types';
import {
    Box,
    Button,
    CircularProgress,
    Stack,
    TextField,
    Typography,
} from '@mui/material';

// Formulario presentacional: recibe estado, errores y acciones desde PerfilSection.
export default function PerfilForm({
    form,
    errors,
    saving,
    onChange,
    onSubmit,
}) {
    return (
        <Box
            sx={{
                border: '1px solid #e2e8f0',
                borderRadius: 3,
                p: 2,
                backgroundColor: '#fff',
            }}
        >
            <Typography sx={{ fontWeight: 700, color: '#0f172a', mb: 2 }}>
                Datos personales
            </Typography>

            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
                    gap: 2,
                }}
            >
                <Box>
                    <TextField
                        fullWidth
                        label="Nombres"
                        value={form.nombres}
                        onChange={onChange('nombres')}
                        error={!!errors.nombres}
                        helperText={errors.nombres || ''}
                    />
                </Box>

                <Box>
                    <TextField
                        fullWidth
                        label="Usuario"
                        value={form.usuario}
                        onChange={onChange('usuario')}
                        error={!!errors.usuario}
                        helperText={errors.usuario || ''}
                    />
                </Box>

                <Box>
                    <TextField
                        fullWidth
                        label="Apellido paterno"
                        value={form.apellidoPaterno}
                        onChange={onChange('apellidoPaterno')}
                        error={!!errors.apellidoPaterno}
                        helperText={errors.apellidoPaterno || ''}
                    />
                </Box>

                <Box>
                    <TextField
                        fullWidth
                        label="Apellido materno"
                        value={form.apellidoMaterno}
                        onChange={onChange('apellidoMaterno')}
                        error={!!errors.apellidoMaterno}
                        helperText={errors.apellidoMaterno || ''}
                    />
                </Box>

                <Box>
                    <TextField
                        fullWidth
                        label="Teléfono"
                        value={form.telefono}
                        onChange={onChange('telefono')}
                        error={!!errors.telefono}
                        helperText={errors.telefono || ''}
                    />
                </Box>

                <Box>
                    <TextField
                        fullWidth
                        label="Correo"
                        value={form.correo}
                        onChange={onChange('correo')}
                        error={!!errors.correo}
                        helperText={errors.correo || ''}
                    />
                </Box>
            </Box>

            <Stack direction="row" sx={{ mt: 3, justifyContent: 'flex-end' }}>
                <Button
                    variant="contained"
                    onClick={onSubmit}
                    disabled={saving}
                    sx={{
                        textTransform: 'none',
                        fontWeight: 700,
                        borderRadius: '8px',
                        boxShadow: 'none',
                        minWidth: 160,
                    }}
                >
                    {saving ? (
                        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                            <CircularProgress size={18} color="inherit" />
                            <span>Guardando...</span>
                        </Stack>
                    ) : (
                        'Guardar cambios'
                    )}
                </Button>
            </Stack>
        </Box>
    );
}

PerfilForm.propTypes = {
    form: PropTypes.shape({
        nombres: PropTypes.string.isRequired,
        apellidoPaterno: PropTypes.string.isRequired,
        apellidoMaterno: PropTypes.string,
        usuario: PropTypes.string.isRequired,
        telefono: PropTypes.string.isRequired,
        correo: PropTypes.string.isRequired,
    }).isRequired,
    errors: PropTypes.shape({
        nombres: PropTypes.string,
        apellidoPaterno: PropTypes.string,
        apellidoMaterno: PropTypes.string,
        usuario: PropTypes.string,
        telefono: PropTypes.string,
        correo: PropTypes.string,
    }).isRequired,
    saving: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
};
