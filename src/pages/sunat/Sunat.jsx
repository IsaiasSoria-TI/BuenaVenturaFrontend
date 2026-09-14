import * as React from 'react';
import {
    Alert,
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
    TextField,
    Typography,
} from '@mui/material';

import MaterialSymbol from '../../components/MaterialSymbol';
import VistaPreviaChip from '../../components/placeholder/VistaPreviaChip';

const Icon = MaterialSymbol;

// Un unico RUC de ejemplo para simular una respuesta exitosa de la API de SUNAT.
const RUC_EJEMPLO = '20481234567';
const RESULTADO_EJEMPLO = {
    ruc: RUC_EJEMPLO,
    razonSocial: 'Agroindustrias del Norte SAC',
    estado: 'Activo',
    condicion: 'Habido',
    direccion: 'Av. Los Viñedos 450, Ica, Ica',
};

const HISTORIAL_EJEMPLO = [
    { id: 1, ruc: '20481234567', razonSocial: 'Agroindustrias del Norte SAC', fecha: '2026-09-12 10:32', resultado: 'Encontrado' },
    { id: 2, ruc: '20558741236', razonSocial: 'Distribuidora San Martín EIRL', fecha: '2026-09-11 16:05', resultado: 'Encontrado' },
    { id: 3, ruc: '20999999999', razonSocial: '-', fecha: '2026-09-10 09:14', resultado: 'No encontrado' },
];

export default function Sunat() {
    const [ruc, setRuc] = React.useState('');
    const [resultado, setResultado] = React.useState(null);
    const [errorBusqueda, setErrorBusqueda] = React.useState('');

    const handleBuscar = () => {
        setErrorBusqueda('');
        setResultado(null);

        if (!/^\d{11}$/.test(ruc.trim())) {
            setErrorBusqueda('Ingrese un RUC válido de 11 dígitos.');
            return;
        }

        if (ruc.trim() === RUC_EJEMPLO) {
            setResultado(RESULTADO_EJEMPLO);
        } else {
            setErrorBusqueda('RUC no encontrado (prueba con 20481234567 en esta vista previa).');
        }
    };

    return (
        <Box>
            <VistaPreviaChip />

            <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e2e8f0', mb: { xs: 2, md: 3 } }}>
                <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                    <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
                        Consulta de RUC
                    </Typography>
                    <Typography sx={{ fontSize: '0.86rem', color: '#64748b', mt: 0.5, mb: 2.5 }}>
                        Verifica los datos de un contribuyente antes de registrarlo como proveedor.
                    </Typography>

                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mb: resultado || errorBusqueda ? 2.5 : 0 }}>
                        <TextField
                            fullWidth
                            placeholder="Ingrese RUC (11 dígitos)"
                            value={ruc}
                            onChange={(e) => setRuc(e.target.value.replace(/\D/g, '').slice(0, 11))}
                            slotProps={{ htmlInput: { maxLength: 11 } }}
                        />
                        <Button
                            variant="contained"
                            onClick={handleBuscar}
                            startIcon={<Icon name="search" size={18} color="#fff" />}
                            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '8px', boxShadow: 'none', whiteSpace: 'nowrap' }}
                        >
                            Consultar
                        </Button>
                    </Stack>

                    {errorBusqueda ? <Alert severity="warning">{errorBusqueda}</Alert> : null}

                    {resultado ? (
                        <Box sx={{ border: '1px solid #e2e8f0', borderRadius: 2.5, p: 2.5, backgroundColor: '#f8fafc' }}>
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ alignItems: { sm: 'center' }, justifyContent: 'space-between', mb: 1.5 }}>
                                <Typography sx={{ fontWeight: 700, color: '#0f172a' }}>{resultado.razonSocial}</Typography>
                                <Chip label={resultado.estado} size="small" sx={{ backgroundColor: '#dcfce7', color: '#16a34a', fontWeight: 700, alignSelf: { xs: 'flex-start', sm: 'center' } }} />
                            </Stack>

                            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
                                <Box>
                                    <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>RUC</Typography>
                                    <Typography sx={{ fontSize: '0.88rem', fontWeight: 600, color: '#0f172a' }}>{resultado.ruc}</Typography>
                                </Box>
                                <Box>
                                    <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>Condición</Typography>
                                    <Typography sx={{ fontSize: '0.88rem', fontWeight: 600, color: '#0f172a' }}>{resultado.condicion}</Typography>
                                </Box>
                                <Box sx={{ gridColumn: { sm: '1 / -1' } }}>
                                    <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>Dirección fiscal</Typography>
                                    <Typography sx={{ fontSize: '0.88rem', fontWeight: 600, color: '#0f172a' }}>{resultado.direccion}</Typography>
                                </Box>
                            </Box>
                        </Box>
                    ) : null}
                </CardContent>
            </Card>

            <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e2e8f0' }}>
                <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a', mb: 2 }}>
                        Historial de Consultas
                    </Typography>

                    <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2.5, overflowX: 'auto' }}>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ backgroundColor: '#f8fafc' }}>
                                    <TableCell sx={{ fontWeight: 700 }}>RUC</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>RAZÓN SOCIAL</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>FECHA</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>RESULTADO</TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {HISTORIAL_EJEMPLO.map((item) => (
                                    <TableRow key={item.id} hover>
                                        <TableCell>{item.ruc}</TableCell>
                                        <TableCell>{item.razonSocial}</TableCell>
                                        <TableCell>{item.fecha}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={item.resultado}
                                                size="small"
                                                sx={{
                                                    fontWeight: 700,
                                                    ...(item.resultado === 'Encontrado'
                                                        ? { backgroundColor: '#dcfce7', color: '#16a34a' }
                                                        : { backgroundColor: '#fee2e2', color: '#dc2626' }),
                                                }}
                                            />
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
