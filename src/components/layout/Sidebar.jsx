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
import logoErp from '../../assets/Logoerp.png';
import { NAV_SECTIONS, itemMatchesPath } from '../../navigation/navSections';
import { clearSession, getUser } from '../../services/sessionService';
import MaterialSymbol from '../MaterialSymbol';

// Ancho del sidebar para mantener consistente el layout con Dashboard.jsx.
const SIDEBAR_W = 256;

const Icon = MaterialSymbol;

// Item simple de navegacion.
function SidebarLinkItem({ item, onNavigate, depth = 0 }) {
  const nested = depth > 0;

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
              pl: nested ? 3.5 + depth * 1.25 : 1.5,
              backgroundColor: isActive ? 'rgba(25,118,210,0.18)' : 'transparent',
              '&:hover': {
                backgroundColor: isActive
                  ? 'rgba(25,118,210,0.24)'
                  : 'rgba(255,255,255,0.06)',
              },
              transition: 'background-color 0.15s ease',
            }}
          >
            {!nested && item.icon ? (
              <ListItemIcon sx={{ minWidth: 34 }}>
                <Icon
                  name={item.icon}
                  size={19}
                  color={isActive ? '#93c5fd' : '#e2e8f0'}
                />
              </ListItemIcon>
            ) : null}

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

// Item padre con submenu desplegable. Soporta cualquier profundidad de hijos.
function SidebarCollapseItem({ item, openMenus, onToggle, onNavigate, pathname, depth = 0 }) {
  const key = item.key || item.label.toLowerCase();
  const nested = depth > 0;
  const hasActiveChild = itemMatchesPath(item, pathname);

  return (
    <>
      <ListItem disablePadding sx={{ px: nested ? 1 : 1.5, mb: 0.25 }}>
        <ListItemButton
          onClick={() => onToggle(key)}
          sx={{
            minHeight: nested ? 38 : 42,
            borderRadius: 2,
            px: 1.5,
            py: nested ? 0.7 : 1,
            pl: nested ? 3.5 + depth * 1.25 : 1.5,
            backgroundColor: hasActiveChild ? 'rgba(25,118,210,0.14)' : 'transparent',
            '&:hover': {
              backgroundColor: hasActiveChild
                ? 'rgba(25,118,210,0.20)'
                : 'rgba(255,255,255,0.06)',
            },
            transition: 'background-color 0.15s ease',
          }}
        >
          {!nested && item.icon ? (
            <ListItemIcon sx={{ minWidth: 34 }}>
              <Icon
                name={item.icon}
                size={19}
                color={hasActiveChild ? '#93c5fd' : '#e2e8f0'}
              />
            </ListItemIcon>
          ) : null}

          <Typography
            sx={{
              flex: 1,
              fontSize: nested ? '0.8rem' : '0.84rem',
              fontWeight: hasActiveChild ? 700 : 600,
              color: '#ffffff',
              whiteSpace: 'nowrap',
            }}
          >
            {item.label}
          </Typography>

          <Icon
            name={openMenus[key] ? 'expand_less' : 'expand_more'}
            size={18}
            color={hasActiveChild ? '#93c5fd' : '#cbd5e1'}
          />
        </ListItemButton>
      </ListItem>

      <Collapse in={openMenus[key]} timeout="auto" unmountOnExit>
        <List dense disablePadding sx={{ pb: 0.25 }}>
          {item.children.map((child) => (
            <SidebarNavItem
              key={child.key || child.to || child.label}
              item={child}
              openMenus={openMenus}
              onToggle={onToggle}
              onNavigate={onNavigate}
              pathname={pathname}
              depth={depth + 1}
            />
          ))}
        </List>
      </Collapse>
    </>
  );
}

function SidebarNavItem({ item, openMenus, onToggle, onNavigate, pathname, depth = 0 }) {
  if (item.children) {
    return (
      <SidebarCollapseItem
        item={item}
        openMenus={openMenus}
        onToggle={onToggle}
        onNavigate={onNavigate}
        pathname={pathname}
        depth={depth}
      />
    );
  }

  return <SidebarLinkItem item={item} depth={depth} onNavigate={onNavigate} />;
}

export default function Sidebar({ onNavigate }) {
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;

  // Datos del usuario autenticado guardados al iniciar sesion.
  const user = getUser();

  const username = user.usuario || user.nombreCompleto || 'Usuario';

  // Iniciales para el avatar cuando no hay foto de perfil.
  const initials = username
    .trim()
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  // Mantiene abiertos los grupos que corresponden a la ruta actual.
  const [openMenus, setOpenMenus] = React.useState({
    inventarios: pathname.startsWith('/dashboard/inventarios'),
    kardex: pathname.startsWith('/dashboard/inventarios/kardex'),
    compras: pathname.startsWith('/dashboard/compras'),
  });

  // Si el usuario navega por URL directa, abre automaticamente el grupo correcto.
  React.useEffect(() => {
    setOpenMenus((prev) => ({
      ...prev,
      inventarios: pathname.startsWith('/dashboard/inventarios') || prev.inventarios,
      kardex: pathname.startsWith('/dashboard/inventarios/kardex') || prev.kardex,
      compras: pathname.startsWith('/dashboard/compras') || prev.compras,
    }));
  }, [pathname]);

  // Abre o cierra manualmente un grupo del menu.
  const handleToggle = (key) => {
    setOpenMenus((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Cierra la sesion limpiando los datos locales y volviendo al login.
  const handleLogout = () => {
    clearSession();
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
      {/* Cabecera con logo y nombre del ERP. */}
      <Box sx={{ px: 3, py: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box
          component="img"
          src={logoErp}
          alt="Logo ERP"
          sx={{
            width: 44,
            height: 44,
            objectFit: 'contain',
          }}
        />

        <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff' }}>
          SOCIOSOFT ERP
        </Typography>
      </Box>

      <Divider sx={{ borderColor: '#1e293b' }} />

      {/* Lista de secciones y opciones principales del sistema. */}
      <Box sx={{ flex: 1, overflowY: 'auto', py: 1.5 }}>
        {NAV_SECTIONS.map((section) => (
          <Box key={section.label} sx={{ mb: 0.5 }}>
            <Typography sx={{ px: 3, pt: 2, pb: 0.5, fontSize: '0.65rem', color: '#94a3b8' }}>
              {section.label}
            </Typography>

            <List dense disablePadding>
              {section.items.map((item) => (
                <SidebarNavItem
                  key={item.key || item.to || item.label}
                  item={item}
                  openMenus={openMenus}
                  onToggle={handleToggle}
                  onNavigate={onNavigate}
                  pathname={pathname}
                />
              ))}
            </List>
          </Box>
        ))}
      </Box>

      <Divider sx={{ borderColor: '#1e293b' }} />

      {/* Bloque inferior con usuario actual y boton de cierre de sesion. */}
      <Box sx={{ px: 3, py: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Avatar sx={{ width: 34, height: 34, bgcolor: '#1d4ed8' }}>
          {initials || 'US'}
        </Avatar>

        <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff' }}>
          {username}
        </Typography>

        <IconButton onClick={handleLogout} sx={{ ml: 'auto', color: '#94a3b8' }}>
          <Icon name="logout" size={17} />
        </IconButton>
      </Box>
    </Box>
  );
}
