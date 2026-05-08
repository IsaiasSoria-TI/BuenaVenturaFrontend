import { Box, Card, CardContent, Typography } from '@mui/material';

export default function Kardex() {
  return (
    <Box>
      <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e2e8f0' }}>
        <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
          <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a', mb: 1 }}>
            Kardex
          </Typography>
          <Typography sx={{ fontSize: '0.85rem', color: '#64748b' }}>
            Modulo de inventario preparado para Kardex.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
