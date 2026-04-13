import * as React from 'react';
import {
  Box,
  Drawer,
  Card,
  CardContent,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { createTheme, ThemeProvider, useTheme } from '@mui/material/styles';

import Sidebar from '../../components/layout/Sidebar';
import Topbar from '../../components/layout/Topbar';

const SIDEBAR_W = 256;

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#1976d2' },
    background: { default: '#f0f4f9', paper: '#ffffff' },
  },
  typography: { fontFamily: '"DM Sans", sans-serif' },
  shape: { borderRadius: 12 },
});

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

const KPI_CARDS = [
  { label: 'Ingresos del Mes', value: '—', icon: 'trending_up', color: '#1976d2', bg: '#e3f0fb' },
  { label: 'Por Cobrar', value: '—', icon: 'payments', color: '#f59e0b', bg: '#fef9ec' },
  { label: 'Por Pagar', value: '—', icon: 'receipt_long', color: '#ef4444', bg: '#fef2f2' },
  { label: 'Margen Neto', value: '—', icon: 'donut_large', color: '#10b981', bg: '#ecfdf5' },
];

const QUICK_MODULES = [
  { id: 'cobrar', label: 'Ctas. Cobrar', icon: 'payments', color: '#1976d2', bg: '#eff6ff' },
  { id: 'pagar', label: 'Ctas. Pagar', icon: 'receipt_long', color: '#ef4444', bg: '#fef2f2' },
  { id: 'inventarios', label: 'Inventarios', icon: 'inventory_2', color: '#10b981', bg: '#ecfdf5' },
  { id: 'compras', label: 'Compras', icon: 'shopping_cart', color: '#f59e0b', bg: '#fef9ec' },
  { id: 'reportes', label: 'Reportes', icon: 'bar_chart', color: '#7c3aed', bg: '#f5f3ff' },
  { id: 'costos', label: 'Costos', icon: 'monitoring', color: '#0891b2', bg: '#ecfeff' },
  { id: 'sunat', label: 'SUNAT', icon: 'account_balance', color: '#dc2626', bg: '#fef2f2' },
  { id: 'integraciones', label: 'Integrac.', icon: 'hub', color: '#7c3aed', bg: '#f5f3ff' },
  { id: 'configuracion', label: 'Config.', icon: 'settings', color: '#475569', bg: '#f8fafc' },
];

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

function SectionPlaceholder({ title }) {
  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        border: '1px solid #e2e8f0',
      }}
    >
      <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
        <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', mb: 1 }}>
          {title}
        </Typography>
        <Typography sx={{ color: '#64748b', fontSize: '0.9rem' }}>
          Aquí irá el contenido de este módulo cuando lo conectes.
        </Typography>
      </CardContent>
    </Card>
  );
}

function DashboardHome({ setActive }) {
  return (
    <>
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
              <Box
                key={m.id}
                onClick={() => setActive(m.id)}
                sx={{
                  p: { xs: 1.25, md: 1.75 },
                  borderRadius: 2.5,
                  cursor: 'pointer',
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
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>
    </>
  );
}

function renderContent(active, setActive) {
  switch (active) {
    case 'cobrar':
      return <SectionPlaceholder title="Cuentas por Cobrar" />;
    case 'pagar':
      return <SectionPlaceholder title="Cuentas por Pagar" />;
    case 'costos':
      return <SectionPlaceholder title="Costos" />;
    case 'sunat':
      return <SectionPlaceholder title="SUNAT" />;
    case 'inventarios':
      return <SectionPlaceholder title="Inventarios" />;
    case 'compras':
      return <SectionPlaceholder title="Compras" />;
    case 'reportes':
      return <SectionPlaceholder title="Reportes" />;
    case 'integraciones':
      return <SectionPlaceholder title="Integraciones" />;
    case 'configuracion':
      return <SectionPlaceholder title="Configuración" />;
    case 'dashboard':
    default:
      return <DashboardHome setActive={setActive} />;
  }
}

function getTitle(active) {
  switch (active) {
    case 'cobrar':
      return 'Cuentas por Cobrar';
    case 'pagar':
      return 'Cuentas por Pagar';
    case 'costos':
      return 'Costos';
    case 'sunat':
      return 'SUNAT';
    case 'inventarios':
      return 'Inventarios';
    case 'compras':
      return 'Compras';
    case 'reportes':
      return 'Reportes';
    case 'integraciones':
      return 'Integraciones';
    case 'configuracion':
      return 'Configuración';
    case 'dashboard':
    default:
      return 'Panel Principal';
  }
}

export default function Dashboard() {
  const [active, setActive] = React.useState('dashboard');
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));

  return (
    <ThemeProvider theme={theme}>
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        rel="stylesheet"
      />

      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f0f4f9' }}>
        {!isMobile && (
          <Drawer
            variant="permanent"
            sx={{
              width: SIDEBAR_W,
              flexShrink: 0,
              '& .MuiDrawer-paper': {
                width: SIDEBAR_W,
                boxSizing: 'border-box',
                border: 'none',
                boxShadow: '4px 0 24px rgba(15,23,42,0.12)',
              },
            }}
          >
            <Sidebar active={active} setActive={setActive} />
          </Drawer>
        )}

        {isMobile && (
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={() => setMobileOpen(false)}
            ModalProps={{ keepMounted: true }}
            sx={{
              '& .MuiDrawer-paper': {
                width: SIDEBAR_W,
                boxSizing: 'border-box',
                border: 'none',
              },
            }}
          >
            <Sidebar
              active={active}
              setActive={setActive}
              onNavigate={() => setMobileOpen(false)}
            />
          </Drawer>
        )}

        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <Topbar
            isMobile={isMobile}
            onMenuClick={() => setMobileOpen(true)}
            title={getTitle(active)}
          />

          <Box sx={{ flex: 1, p: { xs: 2, md: 3.5 }, overflowY: 'auto' }}>
            {renderContent(active, setActive)}
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}