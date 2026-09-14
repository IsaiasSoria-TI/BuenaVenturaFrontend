import { Box, Button, Card, CardContent, Tooltip, Typography } from '@mui/material';

import MaterialSymbol from '../../components/MaterialSymbol';
import VistaPreviaChip from '../../components/placeholder/VistaPreviaChip';

const Icon = MaterialSymbol;

// Catalogo de reportes propuesto; pendiente de definir el formato de exportacion (PDF/Excel).
const REPORTES_EJEMPLO = [
    {
        id: 'compras',
        titulo: 'Compras por Periodo',
        descripcion: 'Detalle de compras registradas en un rango de fechas, por proveedor y moneda.',
        icon: 'shopping_cart',
        color: '#f59e0b',
        bg: '#fef9ec',
    },
    {
        id: 'kardex',
        titulo: 'Movimientos de Kardex',
        descripcion: 'Ingresos y salidas de inventario por artículo, con saldo inicial y final.',
        icon: 'inventory',
        color: '#10b981',
        bg: '#ecfdf5',
    },
    {
        id: 'pagar',
        titulo: 'Cuentas por Pagar',
        descripcion: 'Estado de las cuentas por pagar: pendientes, parciales y canceladas.',
        icon: 'receipt_long',
        color: '#ef4444',
        bg: '#fef2f2',
    },
    {
        id: 'inventario',
        titulo: 'Inventario Valorizado',
        descripcion: 'Stock actual de artículos junto con su valor estimado.',
        icon: 'inventory_2',
        color: '#0f766e',
        bg: '#f0fdfa',
    },
    {
        id: 'proveedores',
        titulo: 'Compras por Proveedor',
        descripcion: 'Ranking de proveedores según el monto total comprado.',
        icon: 'local_shipping',
        color: '#1976d2',
        bg: '#eff6ff',
    },
];

export default function Reportes() {
    return (
        <Box>
            <VistaPreviaChip />

            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
                    gap: { xs: 1.5, md: 2.5 },
                }}
            >
                {REPORTES_EJEMPLO.map((reporte) => (
                    <Card key={reporte.id} elevation={0} sx={{ borderRadius: 3, border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
                        <CardContent sx={{ p: { xs: 2, md: 2.5 }, display: 'flex', flexDirection: 'column', flex: 1 }}>
                            <Box
                                sx={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 2,
                                    backgroundColor: reporte.bg,
                                    display: 'grid',
                                    placeItems: 'center',
                                    mb: 1.5,
                                }}
                            >
                                <Icon name={reporte.icon} size={20} color={reporte.color} />
                            </Box>

                            <Typography sx={{ fontWeight: 700, fontSize: '0.92rem', color: '#0f172a', mb: 0.75 }}>
                                {reporte.titulo}
                            </Typography>

                            <Typography sx={{ fontSize: '0.8rem', color: '#64748b', lineHeight: 1.6, flex: 1, minHeight: 0, mb: 2 }}>
                                {reporte.descripcion}
                            </Typography>

                            <Tooltip title="Disponible cuando se defina el formato de exportación">
                                <span>
                                    <Button
                                        fullWidth
                                        disabled
                                        variant="outlined"
                                        startIcon={<Icon name="bar_chart" size={16} color="#94a3b8" />}
                                        sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '8px' }}
                                    >
                                        Generar
                                    </Button>
                                </span>
                            </Tooltip>
                        </CardContent>
                    </Card>
                ))}
            </Box>
        </Box>
    );
}
