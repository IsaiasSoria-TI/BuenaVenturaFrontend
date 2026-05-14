import React from 'react';
import { Box, Card, CardContent, Stack } from '@mui/material';

import ConfiguracionMenu from './components/ConfiguracionMenu';

import PerfilSection from './sections/perfil/PerfilSection';
import SeguridadSection from './sections/seguridad/SeguridadSection';
import CuentasContablesSection from './sections/cuentascontables/CuentasContablesSection';
import TiposProveedorSection from './sections/tiposproveedor/TiposProveedorSection';
import CategoriasSection from './sections/categorias/CategoriasSection';
import BancosSection from './sections/bancos/BancosSection';
import ImpuestosSection from './sections/impuestos/ImpuestosSection';

export default function Configuracion() {
    const [seccionActiva, setSeccionActiva] = React.useState('perfil');

    const renderContenido = () => {
        switch (seccionActiva) {
            case 'perfil':
                return <PerfilSection />;

            case 'seguridad':
                return <SeguridadSection />;

            case 'cuentas-contables':
                return <CuentasContablesSection />;

            case 'tipos-proveedor':
                return <TiposProveedorSection />;

            case 'categorias':
                return <CategoriasSection />;

            case 'bancos':
                return <BancosSection />;

            case 'impuestos':
                return <ImpuestosSection />;

            default:
                return <PerfilSection />;
        }
    };

    return (
        <Box>
            <Card
                elevation={0}
                sx={{
                    borderRadius: 3,
                    border: '1px solid #e2e8f0',
                }}
            >
                <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                    <Stack
                        direction={{ xs: 'column', lg: 'row' }}
                        spacing={3}
                        alignItems="stretch"
                    >
                        <Box
                            sx={{
                                width: { xs: '100%', lg: 320 },
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
