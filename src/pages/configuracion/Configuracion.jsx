import React from 'react';
import { Box, Card, CardContent, Stack } from '@mui/material';
import ConfiguracionMenu from './components/ConfiguracionMenu';
import PerfilSection from './sections/PerfilSection';
import SeguridadSection from './sections/SeguridadSection';
import BancosSection from './sections/BancosSection';

export default function Configuracion() {
    const [seccionActiva, setSeccionActiva] = React.useState('perfil');

    const renderContenido = () => {
        switch (seccionActiva) {
            case 'perfil':
                return <PerfilSection />;
            case 'seguridad':
                return <SeguridadSection />;
            case 'bancos':
                return <BancosSection />;
            default:
                return <PerfilSection />;
        }
    };

    return (
        <Box>
            <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e2e8f0' }}>
                <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                    <Stack
                        direction={{ xs: 'column', lg: 'row' }}
                        spacing={3}
                        alignItems="stretch"
                        justifyContent="center"
                    >
                        <Box
                            sx={{
                                width: { xs: '100%', lg: 290 },
                                flexShrink: 0,
                                display: 'flex',
                                justifyContent: 'center',
                            }}
                        >
                            <ConfiguracionMenu
                                seccionActiva={seccionActiva}
                                onChangeSeccion={setSeccionActiva}
                            />
                        </Box>

                        <Box sx={{ flex: 1, minWidth: 0 }}>
                            {renderContenido()}
                        </Box>
                    </Stack>
                </CardContent>
            </Card>
        </Box>
    );
}