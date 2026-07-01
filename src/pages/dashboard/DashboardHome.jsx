import * as React from 'react';
import {
  Box,
  ButtonBase,
  Card,
  CardContent,
  Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Icon = ({ name, size = 22, color = 'inherit' }) => (
  <span
    className="material-symbols-rounded"
    style={{
      fontSize: size,
      color,
      lineHeight: 1,
      userSelect: 'none',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    {name}
  </span>
);

// Tarjetas resumen del dashboard. Por ahora usan guiones porque no consumen API.
const KPI_CARDS = [
  { label: 'Ingresos del Mes', value: '—', icon: 'trending_up', color: '#1976d2', bg: '#e3f0fb' },
  { label: 'Por Cobrar', value: '—', icon: 'payments', color: '#f59e0b', bg: '#fef9ec' },
  { label: 'Por Pagar', value: '—', icon: 'receipt_long', color: '#ef4444', bg: '#fef2f2' },
  { label: 'Margen Neto', value: '—', icon: 'donut_large', color: '#10b981', bg: '#ecfdf5' },
];

// Accesos directos a los modulos mas usados desde la pantalla principal.
const QUICK_MODULES = [
  { id: 'kardex', label: 'Kardex', icon: 'inventory', color: '#10b981', bg: '#ecfdf5', to: '/dashboard/inventarios/kardex/consulta-stock' },
  { id: 'transferencia', label: 'Transferencia', icon: 'sync_alt', color: '#0891b2', bg: '#ecfeff', to: '/dashboard/inventarios/transferencia' },
  { id: 'articulos', label: 'Articulos', icon: 'inventory_2', color: '#0f766e', bg: '#f0fdfa', to: '/dashboard/inventarios/articulos' },
  { id: 'gestionar-compras', label: 'Gestionar Compra', icon: 'shopping_cart', color: '#f59e0b', bg: '#fef9ec', to: '/dashboard/compras/gestionar' },
  { id: 'recepciones', label: 'Recepciones', icon: 'move_to_inbox', color: '#7c3aed', bg: '#f5f3ff', to: '/dashboard/compras/recepciones' },
  { id: 'proveedor', label: 'Proveedor', icon: 'local_shipping', color: '#1976d2', bg: '#eff6ff', to: '/dashboard/compras/proveedor' },
  { id: 'pagar', label: 'Ctas. Pagar', icon: 'receipt_long', color: '#ef4444', bg: '#fef2f2', to: '/dashboard/pagar' },
  { id: 'configuracion', label: 'Config.', icon: 'settings', color: '#475569', bg: '#f8fafc', to: '/dashboard/configuracion' },
];

// Card reutilizable para secciones aun no conectadas con datos reales.
function EmptyStateCard({ title, description }) {
  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        border: '1px solid #e2e8f0',
        height: '100%',
      }}
    >
      <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
        <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a', mb: 1 }}>
          {title}
        </Typography>
        <Typography sx={{ fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.6 }}>
          {description}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default function DashboardHome() {
  const navigate = useNavigate();

  return (
    <>
      {/* Primera fila: indicadores principales del negocio. */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
          gap: { xs: 1.5, md: 2.5 },
          mb: { xs: 2, md: 3 },
        }}
      >
        {KPI_CARDS.map((k) => (
          <Card
            key={k.label}
            elevation={0}
            sx={{
              borderRadius: 3,
              border: '1px solid #e2e8f0',
              transition: 'box-shadow .2s',
              '&:hover': { boxShadow: '0 8px 24px rgba(15,23,42,0.10)' },
            }}
          >
            <CardContent sx={{ p: { xs: 1.75, md: 2.5 } }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  mb: 1.5,
                }}
              >
                <Typography
                  sx={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: '#64748b',
                    pr: 0.5,
                  }}
                >
                  {k.label}
                </Typography>

                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: 2,
                    backgroundColor: k.bg,
                    display: 'grid',
                    placeItems: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Icon name={k.icon} size={16} color={k.color} />
                </Box>
              </Box>

              <Typography
                sx={{
                  fontSize: { xs: '1.1rem', md: '1.45rem' },
                  fontWeight: 700,
                  color: '#0f172a',
                  letterSpacing: '-0.02em',
                }}
              >
                {k.value}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Segunda fila: paneles informativos pendientes de integracion. */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 340px' },
          gap: { xs: 2, md: 2.5 },
          mb: { xs: 2, md: 3 },
        }}
      >
        <EmptyStateCard
          title="Actividad Reciente"
          description="Aquí se mostrarán los últimos movimientos cuando este módulo esté conectado con las demás secciones del sistema."
        />

        <EmptyStateCard
          title="Niveles de Inventario"
          description="Los indicadores y resúmenes de inventario aparecerán aquí una vez que el módulo esté integrado."
        />
      </Box>

      {/* Tercera seccion: botones de acceso rapido a rutas frecuentes. */}
      <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e2e8f0' }}>
        <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
          <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a', mb: 2 }}>
            Acceso Rápido
          </Typography>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'repeat(3, 1fr)',
                sm: 'repeat(5, 1fr)',
                md: 'repeat(auto-fit, minmax(130px, 1fr))',
              },
              gap: { xs: 1, md: 1.5 },
            }}
          >
            {QUICK_MODULES.map((m) => (
              <ButtonBase
                key={m.id}
                onClick={() => navigate(m.to)}
                sx={{
                  p: { xs: 1.25, md: 1.75 },
                  borderRadius: 2.5,
                  backgroundColor: '#f8fafc',
                  border: '1.5px solid #e2e8f0',
                  transition: 'all .15s',
                  '&:hover': {
                    backgroundColor: m.bg,
                    borderColor: `${m.color}60`,
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 12px rgba(15,23,42,0.08)',
                  },
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  gap: 0.75,
                  width: '100%',
                }}
              >
                <Box
                  sx={{
                    width: 30,
                    height: 30,
                    borderRadius: 1.5,
                    backgroundColor: m.bg,
                    border: `1px solid ${m.color}30`,
                    display: 'grid',
                    placeItems: 'center',
                  }}
                >
                  <Icon name={m.icon} size={15} color={m.color} />
                </Box>

                <Typography
                  sx={{
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    color: '#334155',
                    lineHeight: 1.3,
                  }}
                >
                  {m.label}
                </Typography>
              </ButtonBase>
            ))}
          </Box>
        </CardContent>
      </Card>
    </>
  );
}
