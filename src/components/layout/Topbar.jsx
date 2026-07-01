import PropTypes from 'prop-types';
import { Box, Avatar, IconButton, Typography } from '@mui/material';
import { useLocation } from 'react-router-dom';
import { getTitleFromPath } from '../../navigation/navSections';

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
