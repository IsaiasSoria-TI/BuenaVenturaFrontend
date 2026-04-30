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
    Divider,
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

function formatDateTime(value) {
    if (!value) return '-';

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return String(value).replace('T', ' ').slice(0, 16);
    }

    return date.toLocaleString();
}

function toNumber(value) {
    if (value === null || value === undefined || value === '') return 0;

    const number = Number(value);
    return Number.isNaN(number) ? 0 : number;
}

function formatNumber(value) {
    return toNumber(value).toFixed(2);
}

function formatPercentage(value) {
    if (value === null || value === undefined || value === '') return '0.00%';
    return `${formatNumber(value)}%`;
}

function formatBoolean(value) {
    return value ? 'Sí' : 'No';
}

function getEstadoChipStyles(estado) {
    if (estado === 'Completo') {
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

function getDetalleSubtotal(detalle) {
    if (detalle.costoTotal !== null && detalle.costoTotal !== undefined) {
        return toNumber(detalle.costoTotal);
    }

    return toNumber(detalle.peso) * toNumber(detalle.costoKilo);
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

export default function ModalDetalleCompra({ open, onClose, compra = null }) {
    const detalles = React.useMemo(
        () => (Array.isArray(compra?.detalles) ? compra.detalles : []),
        [compra]
    );

    const impuestos = React.useMemo(
        () => (Array.isArray(compra?.impuestos) ? compra.impuestos : []),
        [compra]
    );

    const subtotalArticulos = React.useMemo(() => {
        if (detalles.length > 0) {
            return detalles.reduce((total, detalle) => total + getDetalleSubtotal(detalle), 0);
        }

        if (compra?.subtotal !== null && compra?.subtotal !== undefined) {
            return toNumber(compra.subtotal);
        }

        return toNumber(compra?.totalGeneral ?? compra?.costoTotal)
            - toNumber(compra?.importeIgv);
    }, [compra, detalles]);

    const aplicaIgv = Boolean(compra?.aplicaIgv);
    const porcentajeIgv = compra?.porcentajeIgv ?? 18;
    const importeIgv = React.useMemo(() => {
        if (compra?.importeIgv !== null && compra?.importeIgv !== undefined) {
            return toNumber(compra.importeIgv);
        }

        if (!aplicaIgv) return 0;

        return (subtotalArticulos * toNumber(porcentajeIgv)) / 100;
    }, [aplicaIgv, compra, porcentajeIgv, subtotalArticulos]);

    const totalImpuestos = React.useMemo(() => {
        if (compra?.importeImpuesto !== null && compra?.importeImpuesto !== undefined) {
            return toNumber(compra.importeImpuesto);
        }

        if (impuestos.length > 0) {
            const baseImpuestos = subtotalArticulos + importeIgv;

            return impuestos.reduce((total, impuesto) => {
                if (impuesto.importe !== null && impuesto.importe !== undefined) {
                    return total + toNumber(impuesto.importe);
                }

                return total + (baseImpuestos * toNumber(impuesto.porcentaje)) / 100;
            }, 0);
        }

        return toNumber(compra?.totalImpuestos);
    }, [compra, importeIgv, impuestos, subtotalArticulos]);

    const totalGeneral = React.useMemo(() => {
        return subtotalArticulos + importeIgv;
    }, [importeIgv, subtotalArticulos]);

    const impuestosReferencialesLabel = React.useMemo(() => {
        const seleccionados = impuestos
            .map((impuesto) => impuesto.tipoImpuesto)
            .filter(Boolean);

        return seleccionados.length > 0 ? seleccionados.join(', ') : 'Sin ret./det.';
    }, [impuestos]);

    const condicionPago = compra?.condicionPago || compra?.pago || '-';
    const estado = compra?.estado || '-';

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
            <DialogTitle sx={{ fontWeight: 700 }}>Detalle de compra</DialogTitle>

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
                            <InfoItem label="Código" value={compra?.idCompras ? `#${compra.idCompras}` : '-'} strong />
                            <InfoItem label="Fecha" value={formatDateTime(compra?.fechaCompras)} />
                            <InfoItem label="RUC proveedor" value={compra?.ruc || '-'} />
                            <InfoItem label="Proveedor" value={compra?.razonSocial || '-'} strong />
                            <InfoItem label="Condición de pago" value={condicionPago} />
                            <InfoItem label="Zona de producción" value={compra?.zonaProduccion || '-'} />
                            <InfoItem label="Hectáreas" value={formatNumber(compra?.hectareas)} />
                            <InfoItem label="Aplica IGV" value={formatBoolean(aplicaIgv)} />
                            <InfoItem label="Porcentaje IGV" value={formatPercentage(porcentajeIgv)} />
                            <InfoItem label="Importe IGV" value={formatNumber(importeIgv)} />
                            <InfoItem label="Estado">
                                <Chip
                                    label={estado}
                                    size="small"
                                    sx={{
                                        mt: 0.5,
                                        fontWeight: 700,
                                        ...getEstadoChipStyles(estado),
                                    }}
                                />
                            </InfoItem>
                        </Box>
                    </Paper>

                    <Box>
                        <Typography sx={{ fontWeight: 700, color: '#0f172a', mb: 1 }}>
                            Artículos comprados
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
                            <Table sx={{ minWidth: 760 }}>
                                <TableHead>
                                    <TableRow sx={{ backgroundColor: '#f8fafc' }}>
                                        <TableCell sx={{ fontWeight: 700 }}>ARTÍCULO</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>MEDIDA</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }} align="right">
                                            PESO
                                        </TableCell>
                                        <TableCell sx={{ fontWeight: 700 }} align="right">
                                            COSTO KILO
                                        </TableCell>
                                        <TableCell sx={{ fontWeight: 700 }} align="right">
                                            SUBTOTAL
                                        </TableCell>
                                    </TableRow>
                                </TableHead>

                                <TableBody>
                                    {detalles.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} align="center" sx={{ py: 3, color: '#64748b' }}>
                                                No hay artículos registrados para esta compra.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        detalles.map((detalle, index) => (
                                            <TableRow key={detalle.idCompraDetalle || `${detalle.idArticulo}-${index}`} hover>
                                                <TableCell>{detalle.descripcionArticulo || '-'}</TableCell>
                                                <TableCell>{detalle.medida || '-'}</TableCell>
                                                <TableCell align="right">{formatNumber(detalle.peso)}</TableCell>
                                                <TableCell align="right">{formatNumber(detalle.costoKilo)}</TableCell>
                                                <TableCell align="right">{formatNumber(getDetalleSubtotal(detalle))}</TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>

                    <Box>
                        <Typography sx={{ fontWeight: 700, color: '#0f172a', mb: 1 }}>
                            Retención / detracción referencial
                        </Typography>
                        <Typography sx={{ fontSize: '0.85rem', color: '#64748b', mb: 1 }}>
                            Importe informativo; no suma ni resta al total final.
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
                            <Table sx={{ minWidth: 620 }}>
                                <TableHead>
                                    <TableRow sx={{ backgroundColor: '#f8fafc' }}>
                                        <TableCell sx={{ fontWeight: 700 }}>RET./DET. REF.</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }} align="right">
                                            PORCENTAJE
                                        </TableCell>
                                        <TableCell sx={{ fontWeight: 700 }} align="right">
                                            IMPORTE REF.
                                        </TableCell>
                                    </TableRow>
                                </TableHead>

                                <TableBody>
                                    {impuestos.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={3} align="center" sx={{ py: 3, color: '#64748b' }}>
                                                No hay retenciones o detracciones registradas para esta compra.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        impuestos.map((impuesto, index) => {
                                            const importe =
                                                impuesto.importe !== null && impuesto.importe !== undefined
                                                    ? toNumber(impuesto.importe)
                                                    : ((subtotalArticulos + importeIgv) * toNumber(impuesto.porcentaje)) / 100;

                                            return (
                                                <TableRow key={impuesto.idCompraImpuesto || `${impuesto.idImpuesto}-${index}`} hover>
                                                    <TableCell>{impuesto.tipoImpuesto || '-'}</TableCell>
                                                    <TableCell align="right">{formatPercentage(impuesto.porcentaje)}</TableCell>
                                                    <TableCell align="right">{formatNumber(importe)}</TableCell>
                                                </TableRow>
                                            );
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>

                    <Divider />

                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' },
                            gap: 2,
                        }}
                    >
                        <Paper
                            elevation={0}
                            sx={{ p: 2, border: '1px solid #e2e8f0', borderRadius: 2 }}
                        >
                            <Typography sx={{ fontSize: '0.8rem', color: '#64748b' }}>
                                Subtotal
                            </Typography>
                            <Typography sx={{ mt: 0.5, fontWeight: 700, color: '#0f172a' }}>
                                {formatNumber(subtotalArticulos)}
                            </Typography>
                        </Paper>

                        <Paper
                            elevation={0}
                            sx={{ p: 2, border: '1px solid #e2e8f0', borderRadius: 2 }}
                        >
                            <Typography sx={{ fontSize: '0.8rem', color: '#64748b' }}>
                                IGV
                            </Typography>
                            <Typography sx={{ mt: 0.5, fontWeight: 700, color: '#0f172a' }}>
                                {formatNumber(importeIgv)}
                            </Typography>
                        </Paper>

                        <Paper
                            elevation={0}
                            sx={{
                                p: 2,
                                border: '1px solid #bfdbfe',
                                borderRadius: 2,
                                backgroundColor: '#eff6ff',
                            }}
                        >
                            <Typography sx={{ fontSize: '0.8rem', color: '#1d4ed8' }}>
                                Total final
                            </Typography>
                            <Typography sx={{ mt: 0.5, fontWeight: 800, color: '#1e40af' }}>
                                {formatNumber(totalGeneral)}
                            </Typography>
                        </Paper>

                        <Paper
                            elevation={0}
                            sx={{ p: 2, border: '1px solid #e2e8f0', borderRadius: 2 }}
                        >
                            <Typography sx={{ fontSize: '0.8rem', color: '#64748b' }}>
                                Retención / detracción referencial
                            </Typography>
                            <Typography sx={{ mt: 0.5, fontWeight: 700, color: '#0f172a' }}>
                                {impuestosReferencialesLabel}
                            </Typography>
                        </Paper>

                        <Paper
                            elevation={0}
                            sx={{ p: 2, border: '1px solid #e2e8f0', borderRadius: 2 }}
                        >
                            <Typography sx={{ fontSize: '0.8rem', color: '#64748b' }}>
                                Importe referencial
                            </Typography>
                            <Typography sx={{ fontSize: '0.72rem', color: '#64748b' }}>
                                No suma ni resta al total final
                            </Typography>
                            <Typography sx={{ mt: 0.5, fontWeight: 700, color: '#0f172a' }}>
                                {formatNumber(totalImpuestos)}
                            </Typography>
                        </Paper>
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

ModalDetalleCompra.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    compra: PropTypes.shape({
        idCompras: PropTypes.number,
        fechaCompras: PropTypes.string,
        ruc: PropTypes.string,
        razonSocial: PropTypes.string,
        condicionPago: PropTypes.string,
        pago: PropTypes.string,
        zonaProduccion: PropTypes.string,
        hectareas: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        estado: PropTypes.string,
        subtotal: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        costoTotal: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        importeImpuesto: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        totalImpuestos: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        aplicaIgv: PropTypes.bool,
        porcentajeIgv: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        importeIgv: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        totalGeneral: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        detalles: PropTypes.arrayOf(PropTypes.object),
        impuestos: PropTypes.arrayOf(PropTypes.object),
    }),
};
