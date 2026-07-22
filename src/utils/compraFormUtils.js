export const isMonedaSoles = (moneda) => {
  const codigo = String(moneda?.codigo || '').trim().toUpperCase();
  const nombre = String(moneda?.nombre || '').trim().toUpperCase();
  return codigo === 'PEN' || codigo === 'SOL' || nombre === 'SOLES' || nombre === 'SOL';
};

export const getFechaTipoCambio = (fechaCompra) => (
  fechaCompra ? String(fechaCompra).slice(0, 10) : ''
);

export const getCompraFechaBase = (compraForm) => (
  compraForm.fechaEmision || compraForm.fechaCompras
);
