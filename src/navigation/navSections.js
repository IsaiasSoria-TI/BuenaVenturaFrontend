// Estructura central de navegacion usada por Sidebar y Topbar.
// Mantenerla en un solo lugar evita que los titulos y el menu lateral se desalineen.
export const NAV_SECTIONS = [
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
        key: 'inventarios',
        label: 'Inventarios',
        icon: 'inventory_2',
        children: [
          {
            key: 'kardex',
            label: 'Kardex',
            icon: 'inventory',
            children: [
              {
                to: '/dashboard/inventarios/kardex/consulta-stock',
                label: 'Consulta de Stock',
              },
              {
                to: '/dashboard/inventarios/kardex/historial-movimientos',
                label: 'Historial Movimientos',
              },
            ],
          },
          { to: '/dashboard/inventarios/transferencia', label: 'Transferencia' },
          { to: '/dashboard/inventarios/articulos', label: 'Articulos' },
          { to: '/dashboard/inventarios/tipos-envase', label: 'Tipos de Envase' },
        ],
      },
      {
        key: 'compras',
        label: 'Compras',
        icon: 'shopping_cart',
        children: [
          { to: '/dashboard/compras/gestionar', label: 'Nueva Compra' },
          { to: '/dashboard/compras/recepciones', label: 'Recepciones' },
          { to: '/dashboard/compras/proveedor', label: 'Proveedor' },
          { to: '/dashboard/compras/historial', label: 'Historial de Compras' },
        ],
      },
    ],
  },
  {
    label: 'Analisis',
    items: [{ to: '/dashboard/reportes', label: 'Reportes', icon: 'bar_chart' }],
  },
  {
    label: 'Sistema',
    items: [
      { to: '/dashboard/integraciones', label: 'Integraciones', icon: 'hub' },
      { to: '/dashboard/configuracion', label: 'Configuracion', icon: 'settings' },
    ],
  },
];

export function itemMatchesPath(item, pathname) {
  if (item.to && pathname === item.to) {
    return true;
  }

  return Boolean(item.children?.some((child) => itemMatchesPath(child, pathname)));
}

export function getTitleFromPath(pathname) {
  const findTitle = (items) => {
    for (const item of items) {
      if (item.to && pathname === item.to) {
        return item.label;
      }

      if (item.children) {
        const childTitle = findTitle(item.children);
        if (childTitle) {
          return childTitle;
        }
      }
    }

    return '';
  };

  for (const section of NAV_SECTIONS) {
    const title = findTitle(section.items);
    if (title) {
      return title;
    }
  }

  return 'Panel Principal';
}
