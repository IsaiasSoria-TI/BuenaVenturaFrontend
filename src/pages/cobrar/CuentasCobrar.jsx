import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tooltip,
    Typography,
} from '@mui/material';

import MaterialSymbol from '../../components/MaterialSymbol';
import KpiCard from '../../components/placeholder/KpiCard';
import VistaPreviaChip from '../../components/placeholder/VistaPreviaChip';

const Icon = MaterialSymbol;

// Datos de ejemplo; este modulo aun no tiene backend de ventas/facturacion.
const CUENTAS_EJEMPLO = [
    { id: 1, cliente: 'Agroindustrias del Norte SAC', ruc: '20481234567', documento: 'FAC-0231', moneda: 'PEN', importe: 4820.0, vencimiento: '2026-09-05', estado: 'Vencida' },
    { id: 2, cliente: 'Distribuidora San Martín EIRL', ruc: '20558741236', documento: 'FAC-0245', moneda: 'PEN', importe: 2150.5, vencimiento: '2026-09-20', estado: 'Por vencer' },
    { id: 3, cliente: 'Exportadora Buenaventura', ruc: '20601122334', documento: 'FAC-0250', moneda: 'USD', importe: 980.0, vencimiento: '2026-09-28', estado: 'Por vencer' },
    { id: 4, cliente: 'Comercial Vitivinícola SAC', ruc: '20445566778', documento: 'FAC-0198', moneda: 'PEN', importe: 6300.0, vencimiento: '2026-08-15', estado: 'Vencida' },
    { id: 5, cliente: 'Inversiones Pacasmayo SRL', ruc: '20399887766', documento: 'FAC-0260', moneda: 'PEN', importe: 1500.0, vencimiento: '2026-10-05', estado: 'Por vencer' },
    { id: 6, cliente: 'Fundo La Esperanza', ruc: '20512233445', documento: 'FAC-0175', moneda: 'PEN', importe: 3200.0, vencimiento: '2026-07-30', estado: 'Cobrada' },
];

function formatMonto(moneda, valor) {
    const simbolo = moneda === 'USD' ? '$' : 'S/';
    return `${simbolo} ${valor.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function getEstadoChipStyles(estado) {
    if (estado === 'Cobrada') return { backgroundColor: '#dcfce7', color: '#16a34a' };
    if (estado === 'Por vencer') return { backgroundColor: '#fef3c7', color: '#d97706' };
    return { backgroundColor: '#fee2e2', color: '#dc2626' };
}

export default function CuentasCobrar() {
    const totalPorCobrar = CUENTAS_EJEMPLO
        .filter((c) => c.estado !== 'Cobrada')
        .reduce((suma, c) => suma + (c.moneda === 'USD' ? c.importe * 3.8 : c.importe), 0);
    const totalVencidas = CUENTAS_EJEMPLO.filter((c) => c.estado === 'Vencida').length;
    const totalPorVencer = CUENTAS_EJEMPLO.filter((c) => c.estado === 'Por vencer').length;

    return (
        <Box>
            <VistaPreviaChip />

            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
                    gap: { xs: 1.5, md: 2.5 },
                    mb: { xs: 2, md: 3 },
                }}
            >
                <KpiCard label="Total por Cobrar" value={`S/ ${totalPorCobrar.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} icon="payments" color="#1976d2" bg="#e3f0fb" />
                <KpiCard label="Facturas Vencidas" value={String(totalVencidas)} icon="receipt_long" color="#ef4444" bg="#fef2f2" />
                <KpiCard label="Por Vencer (30 días)" value={String(totalPorVencer)} icon="trending_up" color="#d97706" bg="#fef9ec" />
            </Box>

            <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e2e8f0' }}>
                <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                    <Stack
                        direction={{ xs: 'column', md: 'row' }}
                        spacing={2}
                        sx={{ mb: 2.5, alignItems: { xs: 'stretch', md: 'center' }, justifyContent: 'space-between' }}
                    >
                        <Box>
                            <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
                                Cuentas por Cobrar
                            </Typography>
                            <Typography sx={{ fontSize: '0.86rem', color: '#64748b', mt: 0.5 }}>
                                Facturas emitidas a clientes pendientes de cobro.
                            </Typography>
                        </Box>

                        <Tooltip title="Disponible cuando se conecte el módulo de ventas">
                            <span>
                                <Button
                                    variant="contained"
                                    disabled
                                    startIcon={<Icon name="add" size={18} color="#fff" />}
                                    sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '8px', boxShadow: 'none' }}
                                >
                                    Nueva cuenta por cobrar
                                </Button>
                            </span>
                        </Tooltip>
                    </Stack>

                    <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2.5, overflowX: 'auto' }}>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ backgroundColor: '#f8fafc' }}>
                                    <TableCell sx={{ fontWeight: 700 }}>CLIENTE</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>RUC</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>DOCUMENTO</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>IMPORTE</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>VENCIMIENTO</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>ESTADO</TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {CUENTAS_EJEMPLO.map((cuenta) => (
                                    <TableRow key={cuenta.id} hover>
                                        <TableCell>{cuenta.cliente}</TableCell>
                                        <TableCell>{cuenta.ruc}</TableCell>
                                        <TableCell>{cuenta.documento}</TableCell>
                                        <TableCell>{formatMonto(cuenta.moneda, cuenta.importe)}</TableCell>
                                        <TableCell>{cuenta.vencimiento}</TableCell>
                                        <TableCell>
                                            <Chip label={cuenta.estado} size="small" sx={{ fontWeight: 700, ...getEstadoChipStyles(cuenta.estado) }} />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>
        </Box>
    );
}
