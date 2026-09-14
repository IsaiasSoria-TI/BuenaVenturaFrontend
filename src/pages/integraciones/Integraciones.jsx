import * as React from 'react';
import { Box, Card, CardContent, Chip, Stack, Switch, Typography } from '@mui/material';

import MaterialSymbol from '../../components/MaterialSymbol';
import VistaPreviaChip from '../../components/placeholder/VistaPreviaChip';

const Icon = MaterialSymbol;

// Integraciones propuestas; el switch solo cambia el estado visual, no conecta nada real todavia.
const INTEGRACIONES_EJEMPLO = [
    {
        id: 'sunat',
        titulo: 'SUNAT',
        descripcion: 'Consulta de RUC y validación de comprobantes electrónicos.',
        icon: 'account_balance',
        color: '#1976d2',
        bg: '#eff6ff',
        conectadoInicial: false,
    },
    {
        id: 'pagos',
        titulo: 'Pasarela de Pagos',
        descripcion: 'Registro automático de pagos a proveedores desde el banco.',
        icon: 'payments',
        color: '#10b981',
        bg: '#ecfdf5',
        conectadoInicial: false,
    },
    {
        id: 'correo',
        titulo: 'Notificaciones por Correo',
        descripcion: 'Alertas de cuentas por vencer y stock bajo por email.',
        icon: 'notifications',
        color: '#f59e0b',
        bg: '#fef9ec',
        conectadoInicial: true,
    },
];

export default function Integraciones() {
    const [estados, setEstados] = React.useState(() =>
        Object.fromEntries(INTEGRACIONES_EJEMPLO.map((i) => [i.id, i.conectadoInicial]))
    );

    const handleToggle = (id) => {
        setEstados((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    return (
        <Box>
            <VistaPreviaChip />

            <Stack spacing={2}>
                {INTEGRACIONES_EJEMPLO.map((integracion) => {
                    const conectado = estados[integracion.id];

                    return (
                        <Card key={integracion.id} elevation={0} sx={{ borderRadius: 3, border: '1px solid #e2e8f0' }}>
                            <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
                                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: { sm: 'center' } }}>
                                    <Box
                                        sx={{
                                            width: 44,
                                            height: 44,
                                            borderRadius: 2.5,
                                            backgroundColor: integracion.bg,
                                            display: 'grid',
                                            placeItems: 'center',
                                            flexShrink: 0,
                                        }}
                                    >
                                        <Icon name={integracion.icon} size={22} color={integracion.color} />
                                    </Box>

                                    <Box sx={{ flex: 1 }}>
                                        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 0.5 }}>
                                            <Typography sx={{ fontWeight: 700, fontSize: '0.92rem', color: '#0f172a' }}>
                                                {integracion.titulo}
                                            </Typography>
                                            <Chip
                                                label={conectado ? 'Conectado' : 'No conectado'}
                                                size="small"
                                                sx={
                                                    conectado
                                                        ? { backgroundColor: '#dcfce7', color: '#16a34a', fontWeight: 700 }
                                                        : { backgroundColor: '#f1f5f9', color: '#64748b', fontWeight: 700 }
                                                }
                                            />
                                        </Stack>
                                        <Typography sx={{ fontSize: '0.8rem', color: '#64748b' }}>
                                            {integracion.descripcion}
                                        </Typography>
                                    </Box>

                                    <Switch checked={conectado} onChange={() => handleToggle(integracion.id)} />
                                </Stack>
                            </CardContent>
                        </Card>
                    );
                })}
            </Stack>
        </Box>
    );
}
