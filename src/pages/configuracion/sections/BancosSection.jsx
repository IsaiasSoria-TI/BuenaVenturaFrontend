import React from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Alert,
    Button,
    Stack,
} from '@mui/material';

export default function BancosSection() {
    return (
        <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e2e8f0' }}>
            <CardContent>
                <Stack
                    direction={{ xs: 'column', md: 'row' }}
                    justifyContent="space-between"
                    alignItems={{ xs: 'stretch', md: 'center' }}
                    spacing={2}
                    sx={{ mb: 2 }}
                >
                    <Box>
                        <Typography sx={{ fontWeight: 700, color: '#0f172a', mb: 0.5 }}>
                            Bancos
                        </Typography>
                        <Typography sx={{ color: '#64748b' }}>
                            Aquí podrás agregar, editar o quitar bancos de la base de datos.
                        </Typography>
                    </Box>

                    <Button
                        variant="contained"
                        sx={{
                            textTransform: 'none',
                            fontWeight: 700,
                            borderRadius: 2,
                            boxShadow: 'none',
                        }}
                    >
                        Nuevo banco
                    </Button>
                </Stack>

                <Alert severity="info">
                    Esta sección quedó preparada para conectar el mantenimiento de bancos.
                </Alert>
            </CardContent>
        </Card>
    );
}