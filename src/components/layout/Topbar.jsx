import { Box, Avatar, IconButton, Typography } from '@mui/material';

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

export default function Topbar({ isMobile, onMenuClick, title = 'Panel Principal' }) {
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