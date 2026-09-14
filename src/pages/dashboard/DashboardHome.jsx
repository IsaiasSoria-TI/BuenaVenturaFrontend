import * as React from 'react';
import {
  Box,
  ButtonBase,
  Card,
  CardContent,
  Divider,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
  XAxis,
  YAxis,
} from 'recharts';
import MaterialSymbol from '../../components/MaterialSymbol';
import { articuloService } from '../../services/articuloService';
import { compraService } from '../../services/compraService';
import { cuentaPagarService } from '../../services/cuentaPagarService';
import { historialMovimientoService } from '../../services/historialMovimientoService';

const Icon = MaterialSymbol;
const MAX_MOVIMIENTOS = 6;
const MAX_ARTICULOS_STOCK = 5;
const MESES_COMPRAS = 6;
const MESES_CORTOS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

// Mismos colores por estado que usa la pantalla de Cuentas por Pagar, para que el dashboard sea consistente.
const ESTADO_PAGAR_ORDEN = ['Pendiente', 'Completa parcial', 'Completa'];
const ESTADO_PAGAR_COLOR = {
  Pendiente: '#d97706',
  'Completa parcial': '#2563eb',
  Completa: '#16a34a',
};
const COLOR_ESTADO_DESCONOCIDO = '#64748b';

function formatSoles(value) {
  const numero = Number(value) || 0;
  return `S/ ${numero.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Genera las llaves "YYYY-MM" de los ultimos N meses, terminando en el mes actual.
function generarUltimosMeses(cantidad) {
  const meses = [];
  const hoy = new Date();

  for (let i = cantidad - 1; i >= 0; i -= 1) {
    const fecha = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
    const anio = fecha.getFullYear();
    const mes = fecha.getMonth();
    meses.push({
      clave: `${anio}-${String(mes + 1).padStart(2, '0')}`,
      etiqueta: MESES_CORTOS[mes],
    });
  }

  return meses;
}

// Accesos directos a los modulos mas usados desde la pantalla principal.
const QUICK_MODULES = [
  { id: 'kardex', label: 'Kardex', icon: 'inventory', color: '#10b981', bg: '#ecfdf5', to: '/dashboard/inventarios/kardex/consulta-stock' },
  { id: 'transferencia', label: 'Transferencia', icon: 'sync_alt', color: '#0891b2', bg: '#ecfeff', to: '/dashboard/inventarios/transferencia' },
  { id: 'articulos', label: 'Articulos', icon: 'inventory_2', color: '#0f766e', bg: '#f0fdfa', to: '/dashboard/inventarios/articulos' },
  { id: 'gestionar-compras', label: 'Gestionar Compra', icon: 'shopping_cart', color: '#f59e0b', bg: '#fef9ec', to: '/dashboard/compras/gestionar' },
  { id: 'recepciones', label: 'Recepciones', icon: 'move_to_inbox', color: '#7c3aed', bg: '#f5f3ff', to: '/dashboard/compras/recepciones' },
  { id: 'proveedor', label: 'Proveedor', icon: 'local_shipping', color: '#1976d2', bg: '#eff6ff', to: '/dashboard/compras/proveedor' },
  { id: 'pagar', label: 'Ctas. Pagar', icon: 'receipt_long', color: '#ef4444', bg: '#fef2f2', to: '/dashboard/pagar' },
  { id: 'configuracion', label: 'Config.', icon: 'settings', color: '#475569', bg: '#f8fafc', to: '/dashboard/configuracion' },
];

// Card con encabezado consistente para las secciones de la segunda fila.
function DashboardPanelCard({ title, actionLabel, onAction, children }) {
  return (
    <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ p: { xs: 2, md: 2.5 }, display: 'flex', flexDirection: 'column', flex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
          <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>
            {title}
          </Typography>

          {actionLabel && (
            <ButtonBase
              onClick={onAction}
              sx={{
                fontSize: '0.72rem',
                fontWeight: 700,
                color: '#1976d2',
                borderRadius: 1,
                px: 0.5,
              }}
            >
              {actionLabel}
            </ButtonBase>
          )}
        </Box>

        <Box sx={{ flex: 1, minHeight: 0 }}>{children}</Box>
      </CardContent>
    </Card>
  );
}

function EstadoVacio({ mensaje }) {
  return (
    <Typography sx={{ fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.6 }}>
      {mensaje}
    </Typography>
  );
}

function EstadoError({ mensaje }) {
  return (
    <Typography sx={{ fontSize: '0.82rem', color: '#ef4444', lineHeight: 1.6 }}>
      {mensaje}
    </Typography>
  );
}

// Una fila del listado de movimientos recientes del kardex.
function MovimientoItem({ movimiento }) {
  const esIngreso = movimiento.tipoMovimiento === 'INGRESO';
  const cantidad = Math.abs(Number(movimiento.movimientoCantidad) || 0);
  const detalle = movimiento.documento || movimiento.detalle || movimiento.proveedorMotivo || '-';

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, py: 1 }}>
      <Box
        sx={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          backgroundColor: esIngreso ? '#ecfdf5' : '#fef2f2',
          display: 'grid',
          placeItems: 'center',
          flexShrink: 0,
        }}
      >
        <Icon name={esIngreso ? 'arrow_upward' : 'arrow_downward'} size={16} color={esIngreso ? '#10b981' : '#ef4444'} />
      </Box>

      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography noWrap sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#0f172a' }}>
          {movimiento.descripcionArticulo || 'Artículo'}
        </Typography>
        <Typography noWrap sx={{ fontSize: '0.7rem', color: '#94a3b8' }}>
          {detalle}
        </Typography>
      </Box>

      <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: esIngreso ? '#10b981' : '#ef4444', flexShrink: 0 }}>
        {esIngreso ? '+' : '-'}{cantidad}
      </Typography>
    </Box>
  );
}

// Una fila del listado de stock actual: punto verde si hay stock, rojo si esta en 0.
function NivelStockItem({ articulo }) {
  const stock = Number(articulo.stock) || 0;
  const conStock = stock > 0;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.75 }}>
      <Box
        sx={{
          width: 9,
          height: 9,
          borderRadius: '50%',
          backgroundColor: conStock ? '#22c55e' : '#ef4444',
          flexShrink: 0,
        }}
      />

      <Typography noWrap sx={{ flex: 1, fontSize: '0.78rem', fontWeight: 600, color: '#0f172a' }}>
        {articulo.descripcion}
      </Typography>

      <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#0f172a', flexShrink: 0 }}>
        {stock} {articulo.medida || ''}
      </Typography>
    </Box>
  );
}

export default function DashboardHome() {
  const navigate = useNavigate();

  const [movimientos, setMovimientos] = React.useState([]);
  const [loadingMovimientos, setLoadingMovimientos] = React.useState(true);
  const [errorMovimientos, setErrorMovimientos] = React.useState('');

  const [articulosStock, setArticulosStock] = React.useState([]);
  const [loadingStock, setLoadingStock] = React.useState(true);
  const [errorStock, setErrorStock] = React.useState('');

  const [resumenPagar, setResumenPagar] = React.useState([]);
  const [loadingPagar, setLoadingPagar] = React.useState(true);
  const [errorPagar, setErrorPagar] = React.useState('');

  const [comprasPorMes, setComprasPorMes] = React.useState([]);
  const [loadingCompras, setLoadingCompras] = React.useState(true);
  const [errorCompras, setErrorCompras] = React.useState('');

  React.useEffect(() => {
    let activo = true;

    compraService
      .listar()
      .then((data) => {
        if (!activo) return;

        const meses = generarUltimosMeses(MESES_COMPRAS);
        const totalesPorClave = new Map(meses.map((mes) => [mes.clave, 0]));

        (Array.isArray(data) ? data : [])
          .filter((compra) => compra.flgActivo !== false && compra.fechaCompras)
          .forEach((compra) => {
            const clave = String(compra.fechaCompras).slice(0, 7);
            if (totalesPorClave.has(clave)) {
              totalesPorClave.set(clave, totalesPorClave.get(clave) + (Number(compra.totalGeneral) || 0));
            }
          });

        setComprasPorMes(meses.map((mes) => ({ mes: mes.etiqueta, total: totalesPorClave.get(mes.clave) })));
      })
      .catch(() => {
        if (activo) setErrorCompras('No se pudo cargar el resumen de compras.');
      })
      .finally(() => {
        if (activo) setLoadingCompras(false);
      });

    cuentaPagarService
      .listar()
      .then((data) => {
        if (!activo) return;

        const grupos = new Map();

        (Array.isArray(data) ? data : []).forEach((cuenta) => {
          const estado = cuenta.estado || 'Pendiente';
          const grupo = grupos.get(estado) || { estado, monto: 0, cantidad: 0 };
          grupo.monto += Number(cuenta.importeCompra) || 0;
          grupo.cantidad += 1;
          grupos.set(estado, grupo);
        });

        const resumen = [...grupos.values()].sort((a, b) => {
          const posicionA = ESTADO_PAGAR_ORDEN.indexOf(a.estado);
          const posicionB = ESTADO_PAGAR_ORDEN.indexOf(b.estado);
          return (posicionA === -1 ? 99 : posicionA) - (posicionB === -1 ? 99 : posicionB);
        });

        setResumenPagar(resumen);
      })
      .catch(() => {
        if (activo) setErrorPagar('No se pudo cargar el resumen de cuentas por pagar.');
      })
      .finally(() => {
        if (activo) setLoadingPagar(false);
      });

    historialMovimientoService
      .buscar()
      .then((data) => {
        if (activo) setMovimientos((Array.isArray(data) ? data : []).slice(0, MAX_MOVIMIENTOS));
      })
      .catch(() => {
        if (activo) setErrorMovimientos('No se pudo cargar la actividad reciente.');
      })
      .finally(() => {
        if (activo) setLoadingMovimientos(false);
      });

    articuloService
      .listar()
      .then((data) => {
        if (!activo) return;

        const activos = (Array.isArray(data) ? data : [])
          .filter((articulo) => articulo.estado === 'Activo')
          .sort((a, b) => (Number(b.stock) || 0) - (Number(a.stock) || 0));

        setArticulosStock(activos.slice(0, MAX_ARTICULOS_STOCK));
      })
      .catch(() => {
        if (activo) setErrorStock('No se pudo cargar el stock de artículos.');
      })
      .finally(() => {
        if (activo) setLoadingStock(false);
      });

    return () => {
      activo = false;
    };
  }, []);

  const hayCompras = comprasPorMes.some((mes) => mes.total > 0);

  return (
    <>
      {/* Primera fila: cuentas por pagar por estado y evolucion de compras mensuales. */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: { xs: 2, md: 2.5 },
          mb: { xs: 2, md: 3 },
        }}
      >
        <DashboardPanelCard
          title="Cuentas por Pagar"
          actionLabel="Ver cuentas"
          onAction={() => navigate('/dashboard/pagar')}
        >
          {errorPagar ? (
            <EstadoError mensaje={errorPagar} />
          ) : loadingPagar ? (
            <Skeleton variant="rounded" height={180} />
          ) : resumenPagar.length === 0 ? (
            <EstadoVacio mensaje="Aún no hay cuentas por pagar registradas." />
          ) : (
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
              }}
            >
              <Box sx={{ width: 200, height: 200, flexShrink: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={resumenPagar}
                      dataKey="monto"
                      nameKey="estado"
                      innerRadius={62}
                      outerRadius={92}
                      paddingAngle={2}
                    >
                      {resumenPagar.map((grupo) => (
                        <Cell
                          key={grupo.estado}
                          fill={ESTADO_PAGAR_COLOR[grupo.estado] || COLOR_ESTADO_DESCONOCIDO}
                        />
                      ))}
                    </Pie>
                    <ChartTooltip formatter={(value) => formatSoles(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </Box>

              <Box sx={{ width: { xs: '100%', sm: 'auto' }, minWidth: { sm: 210 } }}>
                <Stack spacing={1}>
                  {resumenPagar.map((grupo) => (
                    <Box key={grupo.estado} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box
                        sx={{
                          width: 9,
                          height: 9,
                          borderRadius: '50%',
                          backgroundColor: ESTADO_PAGAR_COLOR[grupo.estado] || COLOR_ESTADO_DESCONOCIDO,
                          flexShrink: 0,
                        }}
                      />
                      <Typography sx={{ flex: 1, fontSize: '0.8rem', color: '#334155' }}>
                        {grupo.estado} ({grupo.cantidad})
                      </Typography>
                      <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a' }}>
                        {formatSoles(grupo.monto)}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Box>
            </Box>
          )}
        </DashboardPanelCard>

        <DashboardPanelCard
          title="Compras Mensuales"
          actionLabel="Ver historial"
          onAction={() => navigate('/dashboard/compras/historial')}
        >
          {errorCompras ? (
            <EstadoError mensaje={errorCompras} />
          ) : loadingCompras ? (
            <Skeleton variant="rounded" height={180} />
          ) : !hayCompras ? (
            <EstadoVacio mensaje="Aún no hay compras registradas en los últimos meses." />
          ) : (
            <Box sx={{ width: '100%', height: 180 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comprasPorMes} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="mes" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748b' }} width={40} />
                  <ChartTooltip formatter={(value) => formatSoles(value)} cursor={{ fill: '#f1f5f9' }} />
                  <Bar dataKey="total" fill="#1976d2" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          )}
        </DashboardPanelCard>
      </Box>

      {/* Segunda fila: actividad reciente del kardex y niveles de stock actuales. */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 340px' },
          gap: { xs: 2, md: 2.5 },
          mb: { xs: 2, md: 3 },
        }}
      >
        <DashboardPanelCard
          title="Actividad Reciente"
          actionLabel="Ver historial"
          onAction={() => navigate('/dashboard/inventarios/kardex/historial-movimientos')}
        >
          {errorMovimientos ? (
            <EstadoError mensaje={errorMovimientos} />
          ) : loadingMovimientos ? (
            <Stack spacing={1.25}>
              {[0, 1, 2].map((key) => (
                <Skeleton key={key} variant="rounded" height={40} />
              ))}
            </Stack>
          ) : movimientos.length === 0 ? (
            <EstadoVacio mensaje="Aún no hay movimientos registrados en el kardex." />
          ) : (
            <Stack divider={<Divider />}>
              {movimientos.map((movimiento) => (
                <MovimientoItem key={movimiento.idMovimiento} movimiento={movimiento} />
              ))}
            </Stack>
          )}
        </DashboardPanelCard>

        <DashboardPanelCard
          title="Niveles de Inventario"
          actionLabel="Ver artículos"
          onAction={() => navigate('/dashboard/inventarios/articulos')}
        >
          {errorStock ? (
            <EstadoError mensaje={errorStock} />
          ) : loadingStock ? (
            <Stack spacing={1.5}>
              {[0, 1, 2].map((key) => (
                <Skeleton key={key} variant="rounded" height={24} />
              ))}
            </Stack>
          ) : articulosStock.length === 0 ? (
            <EstadoVacio mensaje="Aún no hay artículos con stock registrado." />
          ) : (
            <Box>
              {articulosStock.map((articulo) => (
                <NivelStockItem key={articulo.idArticulo} articulo={articulo} />
              ))}
            </Box>
          )}
        </DashboardPanelCard>
      </Box>

      {/* Tercera seccion: botones de acceso rapido a rutas frecuentes. */}
      <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e2e8f0' }}>
        <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
          <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a', mb: 2 }}>
            Acceso Rápido
          </Typography>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'repeat(3, 1fr)',
                sm: 'repeat(5, 1fr)',
                md: 'repeat(auto-fit, minmax(130px, 1fr))',
              },
              gap: { xs: 1, md: 1.5 },
            }}
          >
            {QUICK_MODULES.map((m) => (
              <ButtonBase
                key={m.id}
                onClick={() => navigate(m.to)}
                sx={{
                  p: { xs: 1.25, md: 1.75 },
                  borderRadius: 2.5,
                  backgroundColor: '#f8fafc',
                  border: '1.5px solid #e2e8f0',
                  transition: 'all .15s',
                  '&:hover': {
                    backgroundColor: m.bg,
                    borderColor: `${m.color}60`,
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 12px rgba(15,23,42,0.08)',
                  },
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  gap: 0.75,
                  width: '100%',
                }}
              >
                <Box
                  sx={{
                    width: 30,
                    height: 30,
                    borderRadius: 1.5,
                    backgroundColor: m.bg,
                    border: `1px solid ${m.color}30`,
                    display: 'grid',
                    placeItems: 'center',
                  }}
                >
                  <Icon name={m.icon} size={15} color={m.color} />
                </Box>

                <Typography
                  sx={{
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    color: '#334155',
                    lineHeight: 1.3,
                  }}
                >
                  {m.label}
                </Typography>
              </ButtonBase>
            ))}
          </Box>
        </CardContent>
      </Card>
    </>
  );
}
