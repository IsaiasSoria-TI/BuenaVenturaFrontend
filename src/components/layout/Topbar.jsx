import { Box, Avatar, IconButton, Typography } from '@mui/material';
import { useLocation } from 'react-router-dom';

/* 🔥 MISMO NAV_SECTIONS QUE TU SIDEBAR */
const NAV_SECTIONS = [
  {
    label: 'Principal',
    items: [{ to: '/dashboard', label: 'Dashboard', icon: 'dashboard' }],
  },
  {
    label: 'Finanzas',
    items: [
      { to: '/dashboard/cobrar', label: 'Cuentas por Cobrar', icon: 'payments' },
      { to: '/dashboard/pagar', label: 'Cuentas por Pagar', icon: 'receipt_long' },
      { to: '/dashboard/costos', label: 'Costos', icon: 'monitoring' },
      { to: '/dashboard/sunat', label: 'SUNAT', icon: 'account_balance' },
    ],
  },
  {
    label: 'Operaciones',
    items: [
      {
        label: 'Inventarios',
        icon: 'inventory_2',
        children: [
          { to: '/dashboard/inventarios/kardex', label: 'Kardex' },
          { to: '/dashboard/inventarios/transferencia', label: 'Transferencia' },
          { to: '/dashboard/inventarios/articulos', label: 'Artículos' },
        ],
      },
      {
        label: 'Compras',
        icon: 'shopping_cart',
        children: [
          { to: '/dashboard/compras/gestionar', label: 'Gestionar Compra' },
          { to: '/dashboard/compras/recepciones', label: 'Recepciones' },
          { to: '/dashboard/compras/proveedor', label: 'Proveedor' },
        ],
      },
    ],
  },
  {
    label: 'Análisis',
    items: [{ to: '/dashboard/reportes', label: 'Reportes', icon: 'bar_chart' }],
  },
  {
    label: 'Sistema',
    items: [
      { to: '/dashboard/integraciones', label: 'Integraciones', icon: 'hub' },
      { to: '/dashboard/configuracion', label: 'Configuración', icon: 'settings' },
    ],
  },
];

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

/* 🔥 FUNCIÓN INTELIGENTE */
function getTitleFromPath(pathname) {
  for (const section of NAV_SECTIONS) {
    for (const item of section.items) {
      // nivel simple
      if (item.to && pathname === item.to) {
        return item.label;
      }

      // nivel con hijos
      if (item.children) {
        for (const child of item.children) {
          if (pathname === child.to) {
            return child.label;
          }
        }
      }
    }
  }

  // fallback
  return 'Panel Principal';
}

export default function Topbar({ isMobile, onMenuClick }) {
  const location = useLocation();

  const title = getTitleFromPath(location.pathname);

  return (
    <Box
      sx={{
        px: { xs: 2, md: 3.5 },
        py: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        borderBottom: '1px solid #e2e8f0',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {isMobile && (
          <IconButton onClick={onMenuClick} sx={{ color: '#475569', mr: 0.5 }}>
            <Icon name="menu" size={22} />
          </IconButton>
        )}

        <Typography
          sx={{
            fontSize: { xs: '1rem', md: '1.15rem' },
            fontWeight: 700,
            color: '#0f172a',
          }}
        >
          {title}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <IconButton sx={{ color: '#475569' }}>
          <Icon name="notifications" size={20} />
        </IconButton>

        <IconButton sx={{ color: '#475569', display: { xs: 'none', sm: 'inline-flex' } }}>
          <Icon name="search" size={20} />
        </IconButton>

        <Avatar
          sx={{
            width: 34,
            height: 34,
            fontSize: '0.78rem',
            fontWeight: 700,
            bgcolor: '#1d4ed8',
            cursor: 'pointer',
          }}
        >
          JR
        </Avatar>
      </Box>
    </Box>
  );
}