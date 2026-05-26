export const DEFAULT_IGV_PERCENTAGE = 18;

// Normaliza entradas de formularios y respuestas del backend antes de operar con montos.
export function toNumber(value) {
  if (value === null || value === undefined || value === '') return 0;

  const number = Number(value);
  return Number.isNaN(number) ? 0 : number;
}

export function formatNumber(value) {
  return toNumber(value).toFixed(2);
}

function normalizeText(value) {
  return String(value || '').trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
}

export function isMonedaSolesData(moneda) {
  const codigo = normalizeText(moneda?.codigo || moneda?.codigoMoneda);
  const nombre = normalizeText(moneda?.nombre || moneda?.moneda);
  return codigo === 'PEN' || codigo === 'SOL' || nombre === 'SOLES' || nombre === 'SOL';
}

// Devuelve el prefijo monetario que se mostrara en tablas, modales y resumenes.
export function getCurrencyPrefix(moneda) {
  const codigo = normalizeText(moneda?.codigo || moneda?.codigoMoneda);
  const nombre = normalizeText(moneda?.nombre || moneda?.moneda);
  const simbolo = String(moneda?.simbolo || moneda?.simboloMoneda || '').trim();

  if (codigo === 'PEN' || codigo === 'SOL' || nombre === 'SOLES' || nombre === 'SOL') {
    return 'S/';
  }

  if (codigo === 'USD' || nombre.includes('DOLAR')) {
    return 'USD';
  }

  return codigo || simbolo || moneda?.nombre || moneda?.moneda || '';
}

export function formatCurrency(value, moneda) {
  const prefix = getCurrencyPrefix(moneda);
  const amount = formatNumber(value);
  return prefix ? `${prefix} ${amount}` : amount;
}

export function formatSoles(value) {
  return formatCurrency(value, { codigo: 'PEN' });
}

export function formatCompraCurrency(compra, value) {
  return formatCurrency(value, compra);
}

export function isIgvImpuesto(impuesto) {
  const tipo = String(impuesto?.tipoImpuesto || '').replace(/[.\s]/g, '').toUpperCase();
  return tipo === 'IGV';
}

// Prioriza PEN para que las nuevas compras arranquen con moneda local.
export function getDefaultMonedaId(monedas) {
  const monedaPen = monedas.find(
    (moneda) => String(moneda?.codigo || '').trim().toUpperCase() === 'PEN'
  );

  return monedaPen?.idMoneda || monedas[0]?.idMoneda || '';
}

export function getDetalleSubtotal(detalle) {
  if (detalle?.costoTotal !== null && detalle?.costoTotal !== undefined) {
    return toNumber(detalle.costoTotal);
  }

  return toNumber(detalle?.peso) * toNumber(detalle?.costoKilo);
}

// Para PEN se usa factor 1; para moneda extranjera mantiene la relacion con soles.
export function getTipoCambioFactor(compra) {
  const tipoCambio = toNumber(compra?.tipoCambioAplicado);
  return tipoCambio > 0 ? tipoCambio : 1;
}

export function getCompraSubtotal(compra) {
  if (Array.isArray(compra?.detalles) && compra.detalles.length > 0) {
    return compra.detalles.reduce((total, detalle) => total + getDetalleSubtotal(detalle), 0);
  }

  if (compra?.subtotal !== null && compra?.subtotal !== undefined) {
    return toNumber(compra.subtotal);
  }

  if (compra?.costoTotal !== null && compra?.costoTotal !== undefined) {
    return Math.max(toNumber(compra.costoTotal) - getCompraIgv(compra), 0);
  }

  return Math.max(toNumber(compra?.totalGeneral) - getCompraIgv(compra), 0);
}

// Base tributaria expresada en soles, usada para IGV y otros impuestos referenciales.
export function getCompraSubtotalTributario(compra) {
  return getCompraSubtotal(compra) * getTipoCambioFactor(compra);
}

export function getCompraIgv(compra) {
  if (!compra?.aplicaIgv) return 0;

  if (Array.isArray(compra?.detalles) && compra.detalles.length > 0) {
    return (getCompraSubtotal(compra) * toNumber(compra?.porcentajeIgv ?? DEFAULT_IGV_PERCENTAGE)) / 100;
  }

  if (compra?.subtotal !== null && compra?.subtotal !== undefined) {
    return (getCompraSubtotal(compra) * toNumber(compra?.porcentajeIgv ?? DEFAULT_IGV_PERCENTAGE)) / 100;
  }

  if (compra?.importeIgv !== null && compra?.importeIgv !== undefined) {
    return toNumber(compra.importeIgv);
  }

  return 0;
}

export function getCompraIgvTributario(compra) {
  return getCompraIgv(compra) * getTipoCambioFactor(compra);
}

// Retorna impuestos distintos al IGV, porque el IGV se administra en campos propios.
export function getCompraImporteImpuestos(compra) {
  if (compra?.importeImpuesto !== null && compra?.importeImpuesto !== undefined) {
    return toNumber(compra.importeImpuesto);
  }

  if (Array.isArray(compra?.impuestos) && compra.impuestos.length > 0) {
    const baseImpuestos = getCompraSubtotalTributario(compra) + getCompraIgvTributario(compra);

    return compra.impuestos.reduce((total, impuesto) => {
      if (isIgvImpuesto(impuesto)) return total;

      if (impuesto.importe !== null && impuesto.importe !== undefined) {
        return total + toNumber(impuesto.importe);
      }

      return total + (baseImpuestos * toNumber(impuesto.porcentaje)) / 100;
    }, 0);
  }

  return toNumber(compra?.totalImpuestos);
}

export function getCompraTotalFinal(compra) {
  const subtotal = getCompraSubtotal(compra);
  const igv = getCompraIgv(compra);

  return subtotal + igv;
}

// Calcula los totales en vivo del modal antes de enviar la compra al backend.
export function calcularCompraPreview(form) {
  const subtotal = Array.isArray(form?.detalles)
    ? form.detalles.reduce((total, detalle) => {
        return total + toNumber(detalle.peso) * toNumber(detalle.costoKilo);
      }, 0)
    : 0;
  const subtotalTributario = subtotal * getTipoCambioFactor(form);

  const porcentajeIgv = toNumber(form?.porcentajeIgv ?? DEFAULT_IGV_PERCENTAGE);
  const igv = form?.aplicaIgv ? (subtotal * porcentajeIgv) / 100 : 0;
  const igvTributario = igv * getTipoCambioFactor(form);
  const totalGeneral = subtotal + igv;

  return {
    subtotalPreview: subtotal.toFixed(2),
    subtotalTributarioPreview: subtotalTributario.toFixed(2),
    igvPreview: igv.toFixed(2),
    igvTributarioPreview: igvTributario.toFixed(2),
    totalGeneralPreview: totalGeneral.toFixed(2),
  };
}
