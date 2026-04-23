import React from 'react';
import { Box, Card, CardContent, Typography, Alert } from '@mui/material';

export default function SeguridadSection() {
  return (
    <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e2e8f0' }}>
      <CardContent>
        <Typography sx={{ fontWeight: 700, color: '#0f172a', mb: 1 }}>
          Seguridad
        </Typography>

        <Typography sx={{ color: '#64748b', mb: 2 }}>
          Aquí podrás gestionar cambio de contraseña y opciones de acceso.
        </Typography>

        <Alert severity="info">
          Esta sección quedó preparada para la siguiente fase.
        </Alert>
      </CardContent>
    </Card>
  );
}