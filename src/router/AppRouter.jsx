import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { clearSession, getToken } from '../services/sessionService';
import AppLoadingSkeleton from '../components/loading/AppLoadingSkeleton';

const Login = lazy(() => import('../pages/auth/Login'));
const Proveedor = lazy(() => import('../pages/compras/proveedor/Proveedor'));
const GestionarCompras = lazy(() => import('../pages/compras/gestionarcompras/GestionarCompras'));
const Recepciones = lazy(() => import('../pages/compras/recepciones/Recepciones'));
const HistorialCompras = lazy(() => import('../pages/compras/historial/HistorialCompras'));
const Configuracion = lazy(() => import('../pages/configuracion/Configuracion'));

const Dashboard = lazy(() => import('../pages/dashboard/Dashboard'));
const DashboardHome = lazy(() => import('../pages/dashboard/DashboardHome'));

const Articulo = lazy(() => import('../pages/inventario/articulo/Articulo'));
const TipoEnvase = lazy(() => import('../pages/inventario/tipoenvase/TipoEnvase'));
const ConsultaStock = lazy(() => import('../pages/inventario/kardex/consulta-stock/ConsultaStock'));
const HistorialMovimientos = lazy(() => import('../pages/inventario/kardex/historial-movimientos/HistorialMovimientos'));
const Transferencia = lazy(() => import('../pages/inventario/transferencia/Transferencia'));
const CuentasPagar = lazy(() => import('../pages/cuentaspagar/CuentasPagar'));

const hasValidToken = () => {
  const token = getToken();

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
      <Suspense fallback={<AppLoadingSkeleton />}>
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
            <Route path="compras/historial" element={<HistorialCompras />} />

            {/* Modulo de inventarios. */}
            <Route
              path="inventarios/kardex"
              element={<Navigate to="/dashboard/inventarios/kardex/consulta-stock" replace />}
            />
            <Route path="inventarios/kardex/consulta-stock" element={<ConsultaStock />} />
            <Route path="inventarios/kardex/historial-movimientos" element={<HistorialMovimientos />} />
            <Route path="inventarios/transferencia" element={<Transferencia />} />
            <Route path="inventarios/articulos" element={<Articulo />} />
            <Route path="inventarios/tipos-envase" element={<TipoEnvase />} />

            {/* Modulos financieros y de configuracion. */}
            <Route path="pagar" element={<CuentasPagar />} />
            <Route path="configuracion" element={<Configuracion />} />
          </Route>

          {/* Redirecciones por defecto para entradas no reconocidas. */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default AppRouter;
