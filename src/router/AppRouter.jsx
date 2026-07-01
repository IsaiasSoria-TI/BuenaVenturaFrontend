import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

import Login from '../pages/auth/Login';
import Proveedor from '../pages/compras/proveedor/Proveedor';
import GestionarCompras from '../pages/compras/gestionarcompras/GestionarCompras';
import Recepciones from '../pages/compras/recepciones/Recepciones';
import Configuracion from '../pages/configuracion/Configuracion';

import Dashboard from '../pages/dashboard/Dashboard';
import DashboardHome from '../pages/dashboard/DashboardHome';

import Articulo from '../pages/inventario/articulo/Articulo';
import ConsultaStock from '../pages/inventario/kardex/consulta-stock/ConsultaStock';
import HistorialMovimientos from '../pages/inventario/kardex/historial-movimientos/HistorialMovimientos';
import Transferencia from '../pages/inventario/transferencia/Transferencia';
import CuentasPagar from '../pages/cuentaspagar/CuentasPagar';

const clearSession = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('username');
  localStorage.removeItem('user');
};

const hasValidToken = () => {
  const token = localStorage.getItem('token');

  if (!token) {
    return false;
  }

  try {
    const decoded = jwtDecode(token);
    const expiresAt = decoded.exp ? decoded.exp * 1000 : 0;

    if (!expiresAt || expiresAt <= Date.now()) {
      clearSession();
      return false;
    }

    return true;
  } catch {
    clearSession();
    return false;
  }
};

// Protege las rutas internas del sistema.
// Si no existe un token valido en localStorage, redirige al login.
const PrivateRoute = ({ children }) => {
  return hasValidToken() ? children : <Navigate to="/login" replace />;
};

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta publica: pantalla de inicio de sesion. */}
        <Route path="/login" element={<Login />} />

        {/* Ruta privada principal: carga el layout del dashboard y sus paginas hijas. */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        >
          {/* Pagina inicial que se muestra al entrar a /dashboard. */}
          <Route index element={<DashboardHome />} />

          {/* Modulo de compras. */}
          <Route path="compras/proveedor" element={<Proveedor />} />
          <Route path="compras/gestionar" element={<GestionarCompras />} />
          <Route path="compras/recepciones" element={<Recepciones />} />

          {/* Modulo de inventarios. */}
          <Route
            path="inventarios/kardex"
            element={<Navigate to="/dashboard/inventarios/kardex/consulta-stock" replace />}
          />
          <Route path="inventarios/kardex/consulta-stock" element={<ConsultaStock />} />
          <Route path="inventarios/kardex/historial-movimientos" element={<HistorialMovimientos />} />
          <Route path="inventarios/transferencia" element={<Transferencia />} />
          <Route path="inventarios/articulos" element={<Articulo />} />

          {/* Modulos financieros y de configuracion. */}
          <Route path="pagar" element={<CuentasPagar />} />
          <Route path="configuracion" element={<Configuracion />} />
        </Route>

        {/* Redirecciones por defecto para entradas no reconocidas. */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
