import PropTypes from 'prop-types';
import { Box, Card, CardContent, Typography } from '@mui/material';
import MaterialSymbol from '../MaterialSymbol';

const Icon = MaterialSymbol;

// Tarjeta resumen reutilizable; mismo patron visual que las KPI que se mostraban en el Dashboard.
export default function KpiCard({ label, value, icon, color, bg }) {
    return (
        <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e2e8f0' }}>
            <CardContent sx={{ p: { xs: 1.75, md: 2.5 } }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.5 }}>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', pr: 0.5 }}>
                        {label}
                    </Typography>

                    <Box
                        sx={{
                            width: 32,
                            height: 32,
                            borderRadius: 2,
                            backgroundColor: bg,
                            display: 'grid',
                            placeItems: 'center',
                            flexShrink: 0,
                        }}
                    >
                        <Icon name={icon} size={16} color={color} />
                    </Box>
                </Box>

                <Typography sx={{ fontSize: { xs: '1.1rem', md: '1.45rem' }, fontWeight: 700, color: '#0f172a', letterSpacing: '-0.02em' }}>
                    {value}
                </Typography>
            </CardContent>
        </Card>
    );
}

KpiCard.propTypes = {
    label: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    icon: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
    bg: PropTypes.string.isRequired,
};
