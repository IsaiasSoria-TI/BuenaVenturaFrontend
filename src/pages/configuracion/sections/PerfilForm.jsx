import React from 'react';
import PropTypes from 'prop-types';
import {
    Box,
    Button,
    CircularProgress,
    Grid,
    Stack,
    TextField,
    Typography,
} from '@mui/material';

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

            <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                    <TextField
                        fullWidth
                        label="Nombres"
                        value={form.nombres}
                        onChange={onChange('nombres')}
                        error={!!errors.nombres}
                        helperText={errors.nombres || ''}
                    />
                </Grid>

                <Grid item xs={12} md={6}>
                    <TextField
                        fullWidth
                        label="Usuario"
                        value={form.usuario}
                        onChange={onChange('usuario')}
                        error={!!errors.usuario}
                        helperText={errors.usuario || ''}
                    />
                </Grid>

                <Grid item xs={12} md={6}>
                    <TextField
                        fullWidth
                        label="Apellido paterno"
                        value={form.apellidoPaterno}
                        onChange={onChange('apellidoPaterno')}
                        error={!!errors.apellidoPaterno}
                        helperText={errors.apellidoPaterno || ''}
                    />
                </Grid>

                <Grid item xs={12} md={6}>
                    <TextField
                        fullWidth
                        label="Apellido materno"
                        value={form.apellidoMaterno}
                        onChange={onChange('apellidoMaterno')}
                        error={!!errors.apellidoMaterno}
                        helperText={errors.apellidoMaterno || ''}
                    />
                </Grid>

                <Grid item xs={12} md={6}>
                    <TextField
                        fullWidth
                        label="Teléfono"
                        value={form.telefono}
                        onChange={onChange('telefono')}
                        error={!!errors.telefono}
                        helperText={errors.telefono || ''}
                    />
                </Grid>

                <Grid item xs={12} md={6}>
                    <TextField
                        fullWidth
                        label="Correo"
                        value={form.correo}
                        onChange={onChange('correo')}
                        error={!!errors.correo}
                        helperText={errors.correo || ''}
                    />
                </Grid>
            </Grid>

            <Stack direction="row" justifyContent="flex-end" sx={{ mt: 3 }}>
                <Button
                    variant="contained"
                    onClick={onSubmit}
                    disabled={saving}
                    sx={{
                        textTransform: 'none',
                        fontWeight: 700,
                        borderRadius: 2,
                        boxShadow: 'none',
                        minWidth: 160,
                    }}
                >
                    {saving ? (
                        <Stack direction="row" spacing={1} alignItems="center">
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
        apellidoMaterno: PropTypes.string.isRequired,
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