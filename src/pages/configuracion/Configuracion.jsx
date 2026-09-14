import React from 'react';
import { Box, Card, CardContent } from '@mui/material';
import { useParams } from 'react-router-dom';

import { SECCIONES_CONFIGURACION } from './configuracionSecciones';

import PerfilSection from './sections/perfil/PerfilSection';
import CuentasContablesSection from './sections/cuentascontables/CuentasContablesSection';
import TiposProveedorSection from './sections/tiposproveedor/TiposProveedorSection';
import CategoriasSection from './sections/categorias/CategoriasSection';
import BancosSection from './sections/bancos/BancosSection';
import ImpuestosSection from './sections/impuestos/ImpuestosSection';
import TipoCambioSection from './sections/tipocambio/TipoCambioSection';

export default function Configuracion() {
    const { seccion } = useParams();

    // La navegacion entre secciones vive en el desplegable del sidebar; aqui solo se resuelve el contenido.
    const seccionActiva = SECCIONES_CONFIGURACION.includes(seccion) ? seccion : 'perfil';

    // Mapea cada clave del menu con el componente que debe renderizarse.
    const renderContenido = () => {
        switch (seccionActiva) {
            case 'perfil':
                return <PerfilSection />;

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

            case 'tipo-cambio':
                return <TipoCambioSection />;

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
                    {renderContenido()}
                </CardContent>
            </Card>
        </Box>
    );
}
