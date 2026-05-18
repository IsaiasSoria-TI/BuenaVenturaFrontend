import React from 'react';
import PropTypes from 'prop-types';
import { Box, Avatar, IconButton, Typography } from '@mui/material';
import { useLocation } from 'react-router-dom';

// Mapa de navegacion usado para convertir la ruta actual en un titulo visible.
// Debe mantenerse alineado con las rutas e items definidos en Sidebar.jsx.
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

// Renderiza iconos de Google Material Symbols sin depender de un componente externo.
function Icon({ name, size, color }) {
  return (
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
        fontVariationSettings: '"FILL" 0, "wght" 500, "GRAD" 0, "opsz" 24',
      }}
    >
      {name}
    </span>
  );
}

Icon.propTypes = {
  name: PropTypes.string.isRequired,
  size: PropTypes.number,
  color: PropTypes.string,
};

Icon.defaultProps = {
  size: 22,
  color: 'inherit',
};

// Busca el label asociado a la URL actual para mostrarlo como titulo del topbar.
function getTitleFromPath(pathname) {
  for (const section of NAV_SECTIONS) {
    for (const item of section.items) {
      if (item.to && pathname === item.to) {
        return item.label;
      }

      if (item.children) {
        for (const child of item.children) {
          if (pathname === child.to) {
            return child.label;
          }
        }
      }
    }
  }

  return 'Panel Principal';
}

// Lee el usuario desde localStorage de forma segura.
function getUserFromStorage() {
  try {
    return JSON.parse(localStorage.getItem('user') || '{}');
  } catch {
    return {};
  }
}

// Genera iniciales para el avatar cuando el usuario no tiene foto.
function getInitials(username) {
  return (
    username
      .trim()
      .split(' ')
      .filter(Boolean)
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'US'
  );
}

export default function Topbar({ isMobile, onMenuClick }) {
  const location = useLocation();
  // Titulo dinamico calculado desde la ruta activa.
  const title = getTitleFromPath(location.pathname);

  const user = getUserFromStorage();
  const username = user.nombreCompleto || user.usuario || 'Usuario';
  const fotoPerfil = user.fotoPerfil || '';
  const initials = getInitials(username);

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
        {/* En movil muestra el boton que abre el sidebar temporal. */}
        {isMobile ? (
          <IconButton onClick={onMenuClick} sx={{ color: '#475569', mr: 0.5 }}>
            <Icon name="menu" size={22} />
          </IconButton>
        ) : null}

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

      {/* Acciones del usuario: notificaciones y avatar. */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <IconButton sx={{ color: '#475569' }}>
          <Icon name="notifications" size={20} />
        </IconButton>

        <Avatar
          src={fotoPerfil}
          sx={{
            width: 34,
            height: 34,
            fontSize: '0.78rem',
            fontWeight: 700,
            bgcolor: '#1d4ed8',
            cursor: 'pointer',
          }}
        >
          {!fotoPerfil ? initials : null}
        </Avatar>
      </Box>
    </Box>
  );
}

Topbar.propTypes = {
  isMobile: PropTypes.bool.isRequired,
  onMenuClick: PropTypes.func.isRequired,
};
