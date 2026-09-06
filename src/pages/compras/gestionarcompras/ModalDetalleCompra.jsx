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

import { formatArticuloCode, formatCompraCode, formatDateTimePeru } from '../../../utils/formatters';
import {
    DEFAULT_IGV_PERCENTAGE,
    formatCompraCurrency,
    formatNumber,
    formatSoles,
    getCurrencyPrefix,
    getCompraIgv,
    getCompraIgvTributario,
    getCompraImporteImpuestos,
    getCompraSubtotal,
    getCompraSubtotalTributario,
    getCompraTotalFinal,
    getDetalleSubtotal,
    toNumber,
} from './compraCalculations';

function formatPercentage(value) {
    if (value === null || value === undefined || value === '') return '0.00%';
    return `${formatNumber(value)}%`;
}

function formatBoolean(value) {
    return value ? 'Sí' : 'No';
}

function getImpuestoKey(impuesto, index) {
    if (impuesto?.idImpuesto) return impuesto.idImpuesto;

    const tipo = String(impuesto?.tipoImpuesto || 'impuesto')
        .trim()
        .replace(/[.\s]/g, '')
        .toUpperCase();
    const porcentaje = impuesto?.porcentaje ?? '';

    return `${tipo}-${porcentaje || index}`;
}

function getImpuestosReferenciales(impuestos) {
    const vistos = new Set();

    // Evita mostrar impuestos duplicados cuando backend envia relacion de cabecera y detalle.
    return impuestos.filter((impuesto, index) => {
        if (!impuesto || !impuesto.tipoImpuesto) return false;

        const key = getImpuestoKey(impuesto, index);
        if (vistos.has(key)) return false;

        vistos.add(key);
        return true;
    });
}

function getEstadoChipStyles(estado) {
    if (estado === 'Inactivo') {
        return {
            backgroundColor: '#f1f5f9',
            color: '#64748b',
        };
    }

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
    // Normaliza colecciones para que el modal pueda abrir incluso si la respuesta viene incompleta.
    const detalles = React.useMemo(
        () => (Array.isArray(compra?.detalles) ? compra.detalles : []),
        [compra]
    );

    const impuestos = React.useMemo(
        () => getImpuestosReferenciales(Array.isArray(compra?.impuestos) ? compra.impuestos : []),
        [compra]
    );

    // Totales derivados desde la misma utilidad usada por la tabla de compras.
    const aplicaIgv = Boolean(compra?.aplicaIgv);
    const porcentajeIgv = compra?.porcentajeIgv ?? DEFAULT_IGV_PERCENTAGE;
    const subtotalArticulos = React.useMemo(() => getCompraSubtotal(compra), [compra]);
    const subtotalTributario = React.useMemo(() => getCompraSubtotalTributario(compra), [compra]);
    const importeIgv = React.useMemo(() => getCompraIgv(compra), [compra]);
    const importeIgvTributario = React.useMemo(() => getCompraIgvTributario(compra), [compra]);
    const totalImpuestos = React.useMemo(() => getCompraImporteImpuestos(compra), [compra]);
    const totalGeneral = React.useMemo(() => getCompraTotalFinal(compra), [compra]);

    const impuestosReferencialesLabel = React.useMemo(() => {
        const seleccionados = impuestos
            .map((impuesto) => impuesto.tipoImpuesto)
            .filter(Boolean);

        return seleccionados.length > 0 ? seleccionados.join(', ') : 'Sin ret./det.';
    }, [impuestos]);

    const condicionPago = compra?.condicionPago || compra?.pago || '-';
    const moneda = compra?.codigoMoneda
        ? `${compra.codigoMoneda}${compra.simboloMoneda ? ` (${compra.simboloMoneda})` : ''}`
        : compra?.moneda || '-';
    const monedaLabel = getCurrencyPrefix(compra) || 'moneda';
    const tipoCambio = compra?.tipoCambioAplicado ? formatNumber(compra.tipoCambioAplicado) : '-';
    const estado = compra?.flgActivo === false ? 'Inactivo' : compra?.estado || '-';

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
                            <InfoItem label="Código" value={formatCompraCode(compra?.idCompras)} strong />
                            <InfoItem label="Fecha" value={formatDateTimePeru(compra?.fechaCompras)} />
                            <InfoItem label="RUC proveedor" value={compra?.ruc || '-'} />
                            <InfoItem label="Proveedor" value={compra?.razonSocial || '-'} strong />
                            <InfoItem label="Condición de pago" value={condicionPago} />
                            <InfoItem label="Moneda" value={moneda} />
                            <InfoItem label="Tipo de cambio" value={tipoCambio} />
                            <InfoItem label="Zona de producción" value={compra?.zonaProduccion || '-'} />
                            <InfoItem label="Numero de lote" value={formatNumber(compra?.numeroLote)} />
                            <InfoItem label="Aplica IGV" value={formatBoolean(aplicaIgv)} />
                            <InfoItem label="Porcentaje IGV" value={formatPercentage(porcentajeIgv)} />
                            <InfoItem label={`Importe IGV (${monedaLabel})`} value={formatCompraCurrency(compra, importeIgv)} />
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
                                        <TableCell sx={{ fontWeight: 700 }}>CÓDIGO</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>ARTÍCULO</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>MEDIDA</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }} align="right">
                                            PESO
                                        </TableCell>
                                        <TableCell sx={{ fontWeight: 700 }} align="right">
                                            COSTO KILO ({monedaLabel})
                                        </TableCell>
                                        <TableCell sx={{ fontWeight: 700 }} align="right">
                                            SUBTOTAL ({monedaLabel})
                                        </TableCell>
                                    </TableRow>
                                </TableHead>

                                <TableBody>
                                    {detalles.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} align="center" sx={{ py: 3, color: '#64748b' }}>
                                                No hay artículos registrados para esta compra.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        detalles.map((detalle, index) => (
                                            <TableRow key={detalle.idCompraDetalle || `${detalle.idArticulo}-${index}`} hover>
                                                <TableCell>{formatArticuloCode(detalle.idArticulo)}</TableCell>
                                                <TableCell>{detalle.descripcionArticulo || '-'}</TableCell>
                                                <TableCell>{detalle.medida || '-'}</TableCell>
                                                <TableCell align="right">{formatNumber(detalle.peso)}</TableCell>
                                                <TableCell align="right">{formatCompraCurrency(compra, detalle.costoKilo)}</TableCell>
                                                <TableCell align="right">{formatCompraCurrency(compra, getDetalleSubtotal(detalle))}</TableCell>
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
                                            IMPORTE REF. (S/)
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
                                                    : ((subtotalTributario + importeIgvTributario) * toNumber(impuesto.porcentaje)) / 100;

                                            return (
                                                <TableRow key={impuesto.idCompraImpuesto || `${impuesto.idImpuesto}-${index}`} hover>
                                                    <TableCell>{impuesto.tipoImpuesto || '-'}</TableCell>
                                                    <TableCell align="right">{formatPercentage(impuesto.porcentaje)}</TableCell>
                                                    <TableCell align="right">{formatSoles(importe)}</TableCell>
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
                                Subtotal ({monedaLabel})
                            </Typography>
                            <Typography sx={{ mt: 0.5, fontWeight: 700, color: '#0f172a' }}>
                                {formatCompraCurrency(compra, subtotalArticulos)}
                            </Typography>
                        </Paper>

                        <Paper
                            elevation={0}
                            sx={{ p: 2, border: '1px solid #e2e8f0', borderRadius: 2 }}
                        >
                            <Typography sx={{ fontSize: '0.8rem', color: '#64748b' }}>
                                IGV ({monedaLabel})
                            </Typography>
                            <Typography sx={{ mt: 0.5, fontWeight: 700, color: '#0f172a' }}>
                                {formatCompraCurrency(compra, importeIgv)}
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
                                Total final ({monedaLabel})
                            </Typography>
                            <Typography sx={{ mt: 0.5, fontWeight: 800, color: '#1e40af' }}>
                                {formatCompraCurrency(compra, totalGeneral)}
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
                                Importe referencial (S/)
                            </Typography>
                            <Typography sx={{ mt: 0.5, fontWeight: 700, color: '#0f172a' }}>
                                {formatSoles(totalImpuestos)}
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
        idMoneda: PropTypes.number,
        codigoMoneda: PropTypes.string,
        moneda: PropTypes.string,
        simboloMoneda: PropTypes.string,
        idTipoCambio: PropTypes.number,
        tipoCambioAplicado: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        zonaProduccion: PropTypes.string,
        numeroLote: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        estado: PropTypes.string,
        flgActivo: PropTypes.bool,
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
