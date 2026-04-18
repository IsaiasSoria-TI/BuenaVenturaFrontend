import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Login from '../pages/auth/Login';
import Proveedor from '../pages/compras/proveedor/Proveedor';
import GestionarCompras from '../pages/compras/gestionarcompras/GestionarCompras';
import Recepciones from '../pages/compras/recepciones/Recepciones';

import Dashboard from '../pages/dashboard/Dashboard';
import DashboardHome from '../pages/dashboard/DashboardHome';

import Articulo from '../pages/inventario/articulo/Articulo';
import CuentasPagar from '../pages/cuentaspagar/CuentasPagar';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
};

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        >
          <Route index element={<DashboardHome />} />
          <Route path="compras/proveedor" element={<Proveedor />} />
          <Route path="compras/gestionar" element={<GestionarCompras />} />
          <Route path="compras/recepciones" element={<Recepciones />} />
          <Route path="inventarios/articulos" element={<Articulo />} />
          <Route path="pagar" element={<CuentasPagar />} />
        </Route>

        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;