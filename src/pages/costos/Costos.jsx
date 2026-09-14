import {
    Box,
    Card,
    CardContent,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from '@mui/material';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip as ChartTooltip, XAxis, YAxis } from 'recharts';

import KpiCard from '../../components/placeholder/KpiCard';
import VistaPreviaChip from '../../components/placeholder/VistaPreviaChip';

// Datos de ejemplo; agrupacion de costos por categoria pendiente de definir con el negocio.
const COSTOS_POR_CATEGORIA = [
    { categoria: 'Insumos', total: 12400 },
    { categoria: 'Transporte', total: 6800 },
    { categoria: 'Mano de obra', total: 9200 },
    { categoria: 'Envases', total: 4100 },
    { categoria: 'Otros', total: 1900 },
];

function formatSoles(value) {
    return `S/ ${Number(value).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function Costos() {
    const totalGeneral = COSTOS_POR_CATEGORIA.reduce((suma, c) => suma + c.total, 0);
    const categoriaMayor = [...COSTOS_POR_CATEGORIA].sort((a, b) => b.total - a.total)[0];

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
                <KpiCard label="Costo Total del Mes" value={formatSoles(totalGeneral)} icon="monitoring" color="#1976d2" bg="#e3f0fb" />
                <KpiCard label="Categoría con Mayor Costo" value={categoriaMayor.categoria} icon="bar_chart" color="#ef4444" bg="#fef2f2" />
                <KpiCard label="Costo Promedio por Categoría" value={formatSoles(totalGeneral / COSTOS_POR_CATEGORIA.length)} icon="donut_large" color="#10b981" bg="#ecfdf5" />
            </Box>

            <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e2e8f0', mb: { xs: 2, md: 3 } }}>
                <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a', mb: 2 }}>
                        Costos por Categoría
                    </Typography>

                    <Box sx={{ width: '100%', height: 240 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={COSTOS_POR_CATEGORIA} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                                <CartesianGrid vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="categoria" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748b' }} width={50} />
                                <ChartTooltip formatter={(value) => formatSoles(value)} cursor={{ fill: '#f1f5f9' }} />
                                <Bar dataKey="total" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </Box>
                </CardContent>
            </Card>

            <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e2e8f0' }}>
                <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a', mb: 2 }}>
                        Detalle por Categoría
                    </Typography>

                    <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2.5, overflowX: 'auto' }}>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ backgroundColor: '#f8fafc' }}>
                                    <TableCell sx={{ fontWeight: 700 }}>CATEGORÍA</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>COSTO TOTAL</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>% DEL TOTAL</TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {COSTOS_POR_CATEGORIA.map((c) => (
                                    <TableRow key={c.categoria} hover>
                                        <TableCell>{c.categoria}</TableCell>
                                        <TableCell>{formatSoles(c.total)}</TableCell>
                                        <TableCell>{((c.total / totalGeneral) * 100).toFixed(1)}%</TableCell>
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
