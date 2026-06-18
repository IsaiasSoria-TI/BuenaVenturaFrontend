import PropTypes from 'prop-types';
import { Box, Button, Stack, Typography } from '@mui/material';

// Opciones visibles del menu de configuracion; cada key se usa en Configuracion.jsx.
const MENU_OPTIONS = [
    {
        key: 'perfil',
        label: 'Perfil',
        description: 'Datos personales',
    },
    {
        key: 'seguridad',
        label: 'Seguridad',
        description: 'Contraseña y acceso',
    },
    {
        key: 'cuentas-contables',
        label: 'Cuentas contables',
        description: 'Códigos contables',
    },
    {
        key: 'tipos-proveedor',
        label: 'Tipos de proveedor',
        description: 'Catalogo de proveedores',
    },
    {
        key: 'categorias',
        label: 'Categorías',
        description: 'Asignación a cuenta contable',
    },
    {
        key: 'bancos',
        label: 'Bancos',
        description: 'Catálogo de bancos',
    },
    {
        key: 'impuestos',
        label: 'Impuestos',
        description: 'Catálogo tributario',
    },
    {
        key: 'tipo-cambio',
        label: 'Tipo de cambio',
        description: 'Valor diario',
    },
];

export default function ConfiguracionMenu({ seccionActiva, onChangeSeccion }) {
    return (
        <Box
            sx={{
                width: '100%',
                maxWidth: 320,
                border: '1px solid #e2e8f0',
                borderRadius: 3,
                p: 1.5,
                backgroundColor: '#fff',
            }}
        >
            <Typography
                sx={{
                    fontWeight: 700,
                    color: '#0f172a',
                    mb: 1.5,
                    textAlign: 'center',
                    fontSize: '1rem',
                }}
            >
                Opciones
            </Typography>

            <Stack spacing={1}>
                {MENU_OPTIONS.map((option) => {
                    // El estado activo cambia estilos y evita que el usuario pierda contexto.
                    const active = seccionActiva === option.key;

                    return (
                        <Button
                            key={option.key}
                            fullWidth
                            onClick={() => onChangeSeccion(option.key)}
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'flex-start',
                                justifyContent: 'center',
                                textTransform: 'none',
                                borderRadius: 2.5,
                                px: 2,
                                py: 1.5,
                                minHeight: 72,
                                backgroundColor: active ? '#eff6ff' : '#fff',
                                border: active ? '1px solid #bfdbfe' : '1px solid #e2e8f0',
                                color: active ? '#2563eb' : '#0f172a',
                                boxShadow: 'none',
                                '&:hover': {
                                    backgroundColor: active ? '#dbeafe' : '#f8fafc',
                                    boxShadow: 'none',
                                },
                            }}
                        >
                            <Typography
                                sx={{
                                    fontWeight: 700,
                                    fontSize: '0.92rem',
                                    textAlign: 'left',
                                    width: '100%',
                                }}
                            >
                                {option.label}
                            </Typography>

                            <Typography
                                sx={{
                                    fontSize: '0.78rem',
                                    color: active ? '#2563eb' : '#64748b',
                                    mt: 0.25,
                                    textAlign: 'left',
                                    width: '100%',
                                }}
                            >
                                {option.description}
                            </Typography>
                        </Button>
                    );
                })}
            </Stack>
        </Box>
    );
}

ConfiguracionMenu.propTypes = {
    seccionActiva: PropTypes.string.isRequired,
    onChangeSeccion: PropTypes.func.isRequired,
};
