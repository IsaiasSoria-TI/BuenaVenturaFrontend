import * as React from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  Collapse,
  Typography,
  Avatar,
  IconButton,
  Divider,
} from '@mui/material';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';

const SIDEBAR_W = 256;

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
  <Box
    component="span"
    className="material-symbols-rounded"
    sx={{
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
  </Box>
);

function SidebarLinkItem({ item, onNavigate, nested = false }) {
  return (
    <ListItem
      disablePadding
      sx={{
        px: nested ? 1 : 1.5,
        mb: 0.25,
      }}
    >
      <NavLink
        to={item.to}
        end={item.to === '/dashboard'}
        style={{ textDecoration: 'none', width: '100%' }}
      >
        {({ isActive }) => (
          <ListItemButton
            onClick={onNavigate}
            sx={{
              minHeight: nested ? 38 : 42,
              borderRadius: 2,
              px: 1.5,
              py: nested ? 0.7 : 1,
              pl: nested ? 5.5 : 1.5,
              backgroundColor: isActive ? 'rgba(25,118,210,0.18)' : 'transparent',
              '&:hover': {
                backgroundColor: isActive
                  ? 'rgba(25,118,210,0.24)'
                  : 'rgba(255,255,255,0.06)',
              },
              transition: 'background-color 0.15s ease',
            }}
          >
            {!nested && (
              <ListItemIcon sx={{ minWidth: 34 }}>
                <Icon
                  name={item.icon}
                  size={19}
                  color={isActive ? '#93c5fd' : '#e2e8f0'}
                />
              </ListItemIcon>
            )}

            <Typography
              sx={{
                fontSize: nested ? '0.8rem' : '0.84rem',
                fontWeight: isActive ? 700 : 600,
                color: '#ffffff',
                whiteSpace: 'nowrap',
              }}
            >
              {item.label}
            </Typography>
          </ListItemButton>
        )}
      </NavLink>
    </ListItem>
  );
}

function SidebarCollapseItem({ item, open, onToggle, onNavigate, pathname }) {
  const hasActiveChild = item.children?.some((child) => pathname === child.to);

  return (
    <>
      <ListItem disablePadding sx={{ px: 1.5, mb: 0.25 }}>
        <ListItemButton
          onClick={onToggle}
          sx={{
            minHeight: 42,
            borderRadius: 2,
            px: 1.5,
            py: 1,
            backgroundColor: hasActiveChild ? 'rgba(25,118,210,0.14)' : 'transparent',
            '&:hover': {
              backgroundColor: hasActiveChild
                ? 'rgba(25,118,210,0.20)'
                : 'rgba(255,255,255,0.06)',
            },
            transition: 'background-color 0.15s ease',
          }}
        >
          <ListItemIcon sx={{ minWidth: 34 }}>
            <Icon
              name={item.icon}
              size={19}
              color={hasActiveChild ? '#93c5fd' : '#e2e8f0'}
            />
          </ListItemIcon>

          <Typography
            sx={{
              flex: 1,
              fontSize: '0.84rem',
              fontWeight: hasActiveChild ? 700 : 600,
              color: '#ffffff',
              whiteSpace: 'nowrap',
            }}
          >
            {item.label}
          </Typography>

          <Icon
            name={open ? 'expand_less' : 'expand_more'}
            size={18}
            color={hasActiveChild ? '#93c5fd' : '#cbd5e1'}
          />
        </ListItemButton>
      </ListItem>

      <Collapse in={open} timeout="auto" unmountOnExit>
        <List dense disablePadding sx={{ pb: 0.25 }}>
          {item.children.map((child) => (
            <SidebarLinkItem
              key={child.to}
              item={child}
              nested
              onNavigate={onNavigate}
            />
          ))}
        </List>
      </Collapse>
    </>
  );
}

export default function Sidebar({ onNavigate }) {
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;

  const username =
    localStorage.getItem('username') ||
    localStorage.getItem('usuario') ||
    'Usuario';

  const initials = username
    .trim()
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const [openMenus, setOpenMenus] = React.useState({
    inventarios: pathname.startsWith('/dashboard/inventarios'),
    compras: pathname.startsWith('/dashboard/compras'),
  });

  React.useEffect(() => {
    setOpenMenus((prev) => ({
      ...prev,
      inventarios: pathname.startsWith('/dashboard/inventarios') || prev.inventarios,
      compras: pathname.startsWith('/dashboard/compras') || prev.compras,
    }));
  }, [pathname]);

  const handleToggle = (key) => {
    setOpenMenus((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <Box
      sx={{
        width: SIDEBAR_W,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#0f172a',
      }}
    >
      <Box sx={{ px: 3, py: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: 2,
            background: 'linear-gradient(135deg,#1976d2,#42a5f5)',
            display: 'grid',
            placeItems: 'center',
          }}
        >
          <Icon name="bolt" size={20} color="#fff" />
        </Box>

        <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff' }}>
          SOCIOSOFT ERP
        </Typography>
      </Box>

      <Divider sx={{ borderColor: '#1e293b' }} />

      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          py: 1.5,
          '&::-webkit-scrollbar': { width: 4 },
          '&::-webkit-scrollbar-track': { background: 'transparent' },
          '&::-webkit-scrollbar-thumb': { background: '#1e293b', borderRadius: 4 },
        }}
      >
        {NAV_SECTIONS.map((section) => (
          <Box key={section.label} sx={{ mb: 0.5 }}>
            <Typography
              sx={{
                px: 3,
                pt: 2,
                pb: 0.5,
                fontSize: '0.65rem',
                fontWeight: 700,
                color: '#94a3b8',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}
            >
              {section.label}
            </Typography>

            <List dense disablePadding>
              {section.items.map((item) => {
                if (item.children) {
                  const key = item.label.toLowerCase();
                  return (
                    <SidebarCollapseItem
                      key={item.label}
                      item={item}
                      open={openMenus[key]}
                      onToggle={() => handleToggle(key)}
                      onNavigate={onNavigate}
                      pathname={pathname}
                    />
                  );
                }

                return (
                  <SidebarLinkItem
                    key={item.to}
                    item={item}
                    onNavigate={onNavigate}
                  />
                );
              })}
            </List>
          </Box>
        ))}
      </Box>

      <Divider sx={{ borderColor: '#1e293b' }} />

      <Box sx={{ px: 2, py: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Avatar
          sx={{
            width: 34,
            height: 34,
            fontSize: '0.8rem',
            fontWeight: 700,
            bgcolor: '#1d4ed8',
          }}
        >
          {initials || 'US'}
        </Avatar>

        <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff' }}>
          {username}
        </Typography>

        <IconButton
          size="small"
          onClick={handleLogout}
          sx={{
            ml: 'auto',
            color: '#94a3b8',
            '&:hover': {
              color: '#ef4444',
              backgroundColor: 'rgba(239,68,68,0.08)',
            },
          }}
        >
          <Icon name="logout" size={17} />
        </IconButton>
      </Box>
    </Box>
  );
}