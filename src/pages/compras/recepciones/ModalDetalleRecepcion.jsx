import * as React from 'react';
import PropTypes from 'prop-types';

import {
    Box,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from '@mui/material';

import {
    formatCompraCode,
    formatDateTimePeru,
    formatRecepcionCode,
} from '../../../utils/formatters';

function toNumber(value) {
    if (value === null || value === undefined || value === '') return 0;

    const number = Number(value);
    return Number.isNaN(number) ? 0 : number;
}

function formatNumber(value) {
    return toNumber(value).toFixed(2);
}

function formatOptionalNumber(value) {
    if (value === null || value === undefined || value === '') return '-';
    return formatNumber(value);
}

function getEstadoChipStyles(estado) {
    if (estado === 'Completo' || estado === 'Completa') {
        return {
            backgroundColor: '#dcfce7',
            color: '#16a34a',
        };
    }

    if (estado === 'Completa parcial') {
        return {
            backgroundColor: '#dbeafe',
            color: '#2563eb',
        };
    }

    if (estado === 'Pendiente') {
        return {
            backgroundColor: '#fef3c7',
            color: '#d97706',
        };
    }

    return {
        backgroundColor: '#fee2e2',
        color: '#dc2626',
    };
}

function InfoItem({ label, value, strong = false, children = null }) {
    return (
        <Box>
            <Typography sx={{ fontSize: '0.8rem', color: '#64748b' }}>{label}</Typography>
            {children || (
                <Typography sx={{ fontWeight: strong ? 700 : 500, color: '#0f172a' }}>
                    {value || '-'}
                </Typography>
            )}
        </Box>
    );
}

InfoItem.propTypes = {
    label: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    strong: PropTypes.bool,
    children: PropTypes.node,
};

export default function ModalDetalleRecepcion({ open, onClose, recepcion = null }) {
    const detalles = React.useMemo(
        () => (Array.isArray(recepcion?.detalles) ? recepcion.detalles : []),
        [recepcion]
    );

    const estadoRecepcion = recepcion?.estado || '-';
    const estadoCompra = recepcion?.estadoCompra || '-';

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
            <DialogTitle sx={{ fontWeight: 700 }}>Detalle de recepción</DialogTitle>

            <DialogContent dividers sx={{ pt: 2.5 }}>
                <Stack spacing={2.5}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 2,
                            borderRadius: 2,
                            backgroundColor: '#f8fafc',
                            border: '1px solid #e2e8f0',
                        }}
                    >
                        <Typography sx={{ fontWeight: 700, color: '#0f172a', mb: 1.5 }}>
                            Información general
                        </Typography>

                        <Box
                            sx={{
                                display: 'grid',
                                gridTemplateColumns: {
                                    xs: '1fr',
                                    sm: '1fr 1fr',
                                    md: '1fr 1fr 1fr 1fr',
                                },
                                gap: 1.5,
                            }}
                        >
                            <InfoItem
                                label="Código recepción"
                                value={formatRecepcionCode(recepcion?.idRecepciones)}
                                strong
                            />
                            <InfoItem label="Fecha recepción" value={formatDateTimePeru(recepcion?.fechaRecepcion)} />
                            <InfoItem
                                label="Código compra"
                                value={formatCompraCode(recepcion?.idCompras)}
                                strong
                            />
                            <InfoItem label="Guia de remision" value={recepcion?.guiaRemision || '-'} />
                            <InfoItem label="Cantidad jabas" value={formatNumber(recepcion?.cantidadJabas)} />
                            <InfoItem label="RUC proveedor" value={recepcion?.ruc || '-'} />
                            <InfoItem label="Proveedor" value={recepcion?.razonSocial || '-'} strong />
                            <InfoItem label="Estado recepción">
                                <Chip
                                    label={estadoRecepcion}
                                    size="small"
                                    sx={{
                                        mt: 0.5,
                                        fontWeight: 700,
                                        ...getEstadoChipStyles(estadoRecepcion),
                                    }}
                                />
                            </InfoItem>
                            <InfoItem label="Estado compra">
                                <Chip
                                    label={estadoCompra}
                                    size="small"
                                    sx={{
                                        mt: 0.5,
                                        fontWeight: 700,
                                        ...getEstadoChipStyles(estadoCompra),
                                    }}
                                />
                            </InfoItem>
                        </Box>
                    </Paper>

                    <Box>
                        <Typography sx={{ fontWeight: 700, color: '#0f172a', mb: 1 }}>
                            Artículos recibidos
                        </Typography>

                        <TableContainer
                            component={Paper}
                            elevation={0}
                            sx={{
                                border: '1px solid #e2e8f0',
                                borderRadius: 2,
                                overflowX: 'auto',
                            }}
                        >
                            <Table sx={{ minWidth: 900 }}>
                                <TableHead>
                                    <TableRow sx={{ backgroundColor: '#f8fafc' }}>
                                        <TableCell sx={{ fontWeight: 700 }}>ARTÍCULO</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>MEDIDA</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }} align="right">
                                            PESO COMPRADO
                                        </TableCell>
                                        <TableCell sx={{ fontWeight: 700 }} align="right">
                                            PESO RECIBIDO
                                        </TableCell>
                                        <TableCell sx={{ fontWeight: 700 }} align="right">
                                            COSTO KILO
                                        </TableCell>
                                        <TableCell sx={{ fontWeight: 700 }} align="right">
                                            IMPORTE COMPRA
                                        </TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>ESTADO DETALLE</TableCell>
                                    </TableRow>
                                </TableHead>

                                <TableBody>
                                    {detalles.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} align="center" sx={{ py: 3, color: '#64748b' }}>
                                                No hay detalles registrados para esta recepción.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        detalles.map((detalle, index) => {
                                            const estadoDetalle = detalle.estado || '-';
                                            const key =
                                                detalle.idRecepcionDetalle ||
                                                detalle.idCompraDetalle ||
                                                `${detalle.idArticulo}-${index}`;

                                            return (
                                                <TableRow key={key} hover>
                                                    <TableCell>{detalle.articulo || '-'}</TableCell>
                                                    <TableCell>{detalle.medida || '-'}</TableCell>
                                                    <TableCell align="right">{formatNumber(detalle.pesoComprado)}</TableCell>
                                                    <TableCell align="right">{formatNumber(detalle.recibido)}</TableCell>
                                                    <TableCell align="right">{formatOptionalNumber(detalle.costoKilo)}</TableCell>
                                                    <TableCell align="right">
                                                        {formatOptionalNumber(detalle.costoTotal ?? detalle.subtotal)}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={estadoDetalle}
                                                            size="small"
                                                            sx={{
                                                                fontWeight: 700,
                                                                ...getEstadoChipStyles(estadoDetalle),
                                                            }}
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>
                </Stack>
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button onClick={onClose} sx={{ textTransform: 'none', fontWeight: 700 }}>
                    Cerrar
                </Button>
            </DialogActions>
        </Dialog>
    );
}

ModalDetalleRecepcion.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    recepcion: PropTypes.shape({
        idRecepciones: PropTypes.number,
        fechaRecepcion: PropTypes.string,
        guiaRemision: PropTypes.string,
        cantidadJabas: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        idCompras: PropTypes.number,
        ruc: PropTypes.string,
        razonSocial: PropTypes.string,
        estado: PropTypes.string,
        estadoCompra: PropTypes.string,
        detalles: PropTypes.arrayOf(PropTypes.object),
    }),
};
