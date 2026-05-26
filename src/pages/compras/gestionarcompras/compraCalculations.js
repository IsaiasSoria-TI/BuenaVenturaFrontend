export const DEFAULT_IGV_PERCENTAGE = 18;

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

  if (!isMonedaSolesData(compra) && compra?.costoTotal !== null && compra?.costoTotal !== undefined) {
    return Math.max(
      (toNumber(compra.costoTotal) - toNumber(compra?.importeIgv)) / getTipoCambioFactor(compra),
      0
    );
  }

  return toNumber(compra?.totalGeneral ?? compra?.costoTotal) - toNumber(compra?.importeIgv);
}

export function getCompraSubtotalTributario(compra) {
  return getCompraSubtotal(compra) * getTipoCambioFactor(compra);
}

export function getCompraIgv(compra) {
  if (compra?.importeIgv !== null && compra?.importeIgv !== undefined) {
    return toNumber(compra.importeIgv);
  }

  if (!compra?.aplicaIgv) return 0;

  return (getCompraSubtotalTributario(compra) * toNumber(compra?.porcentajeIgv ?? DEFAULT_IGV_PERCENTAGE)) / 100;
}

export function getCompraImporteImpuestos(compra) {
  if (compra?.importeImpuesto !== null && compra?.importeImpuesto !== undefined) {
    return toNumber(compra.importeImpuesto);
  }

  if (Array.isArray(compra?.impuestos) && compra.impuestos.length > 0) {
    const baseImpuestos = getCompraSubtotalTributario(compra) + getCompraIgv(compra);

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

  if (isMonedaSolesData(compra)) {
    return subtotal + igv;
  }

  return subtotal + igv / getTipoCambioFactor(compra);
}

export function calcularCompraPreview(form) {
  const subtotal = Array.isArray(form?.detalles)
    ? form.detalles.reduce((total, detalle) => {
        return total + toNumber(detalle.peso) * toNumber(detalle.costoKilo);
      }, 0)
    : 0;
  const subtotalTributario = subtotal * getTipoCambioFactor(form);

  const porcentajeIgv = toNumber(form?.porcentajeIgv || DEFAULT_IGV_PERCENTAGE);
  const igv = form?.aplicaIgv ? (subtotalTributario * porcentajeIgv) / 100 : 0;
  const totalGeneral = subtotal + igv / getTipoCambioFactor(form);

  return {
    subtotalPreview: subtotal.toFixed(2),
    subtotalTributarioPreview: subtotalTributario.toFixed(2),
    igvPreview: igv.toFixed(2),
    totalGeneralPreview: totalGeneral.toFixed(2),
  };
}
