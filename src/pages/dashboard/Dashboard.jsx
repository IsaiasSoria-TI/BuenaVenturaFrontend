import * as React from 'react';
import {
  Box,
  Drawer,
  IconButton,
  useMediaQuery,
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Outlet } from 'react-router-dom';

import Sidebar from '../../components/layout/Sidebar';
import MaterialSymbol from '../../components/MaterialSymbol';

const Icon = MaterialSymbol;


// Ancho unico usado por el drawer permanente y el drawer movil.
const SIDEBAR_W = 256;

// Tema local del dashboard: define paleta, fuente y radios para Material UI.
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#1976d2' },
    background: { default: '#f0f4f9', paper: '#ffffff' },
  },
  typography: { fontFamily: '"DM Sans", sans-serif' },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          '&:has(input[readonly])': {
            backgroundColor: '#f1f5f9',
          },
          '&:has(textarea[readonly])': {
            backgroundColor: '#f1f5f9',
          },
          '& input[readonly], & textarea[readonly]': {
            color: '#475569',
            cursor: 'not-allowed',
          },
          '&:has(input[readonly]) fieldset, &:has(textarea[readonly]) fieldset': {
            borderColor: '#cbd5e1',
          },
        },
      },
    },
  },
});

export default function Dashboard() {
  // Controla la apertura del menu lateral en pantallas pequenas.
  const [mobileOpen, setMobileOpen] = React.useState(false);

  // Detecta si la pantalla esta por debajo del breakpoint md del tema.
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <ThemeProvider theme={theme}>
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f0f4f9' }}>
        {/* Sidebar fijo para escritorio. */}
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
            <Sidebar />
          </Drawer>
        )}

        {/* Sidebar temporal para movil; se abre desde el boton hamburguesa del Topbar. */}
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
            <Sidebar onNavigate={() => setMobileOpen(false)} />
          </Drawer>
        )}

        {/* Area principal: contenido de la ruta hija, sin cabecera superior. */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          {/* En movil no hay cabecera que aloje el boton del menu, asi que se muestra flotante. */}
          {isMobile && (
            <IconButton
              onClick={() => setMobileOpen(true)}
              sx={{
                position: 'fixed',
                top: 12,
                left: 12,
                zIndex: 10,
                backgroundColor: '#fff',
                boxShadow: '0 2px 8px rgba(15,23,42,0.15)',
                '&:hover': { backgroundColor: '#f8fafc' },
              }}
            >
              <Icon name="menu" size={22} color="#475569" />
            </IconButton>
          )}

          {/* Outlet renderiza la pagina hija definida en AppRouter. */}
          <Box sx={{ flex: 1, p: { xs: 2, md: 3.5 }, overflowY: 'auto' }}>
            <Outlet />
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
