import PropTypes from 'prop-types';
import { Box, Card, CardContent, Typography } from '@mui/material';
import MaterialSymbol from '../MaterialSymbol';

const Icon = MaterialSymbol;

// Pantalla generica para modulos aun no desarrollados; evita que rutas sin pagina propia caigan al login.
export default function ModuloEnConstruccion({ titulo, descripcion, icono }) {
    return (
        <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e2e8f0' }}>
            <CardContent
                sx={{
                    p: { xs: 3, md: 5 },
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    gap: 1.5,
                }}
            >
                <Box
                    sx={{
                        width: 56,
                        height: 56,
                        borderRadius: 3,
                        backgroundColor: '#eff6ff',
                        display: 'grid',
                        placeItems: 'center',
                    }}
                >
                    <Icon name={icono} size={28} color="#1976d2" />
                </Box>

                <Typography sx={{ fontWeight: 700, fontSize: '1.05rem', color: '#0f172a' }}>
                    {titulo}
                </Typography>

                <Typography sx={{ fontSize: '0.85rem', color: '#94a3b8', maxWidth: 420, lineHeight: 1.6 }}>
                    {descripcion}
                </Typography>
            </CardContent>
        </Card>
    );
}

ModuloEnConstruccion.propTypes = {
    titulo: PropTypes.string.isRequired,
    descripcion: PropTypes.string,
    icono: PropTypes.string,
};

ModuloEnConstruccion.defaultProps = {
    descripcion: 'Este modulo esta en construccion y estara disponible proximamente.',
    icono: 'construction',
};
