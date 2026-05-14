export const DEFAULT_IGV_PERCENTAGE = 18;

export function toNumber(value) {
  if (value === null || value === undefined || value === '') return 0;

  const number = Number(value);
  return Number.isNaN(number) ? 0 : number;
}

export function formatNumber(value) {
  return toNumber(value).toFixed(2);
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

export function getCompraSubtotal(compra) {
  if (Array.isArray(compra?.detalles) && compra.detalles.length > 0) {
    return compra.detalles.reduce((total, detalle) => total + getDetalleSubtotal(detalle), 0);
  }

  if (compra?.subtotal !== null && compra?.subtotal !== undefined) {
    return toNumber(compra.subtotal);
  }

  return toNumber(compra?.totalGeneral ?? compra?.costoTotal) - toNumber(compra?.importeIgv);
}

export function getCompraIgv(compra) {
  if (compra?.importeIgv !== null && compra?.importeIgv !== undefined) {
    return toNumber(compra.importeIgv);
  }

  if (!compra?.aplicaIgv) return 0;

  return (getCompraSubtotal(compra) * toNumber(compra?.porcentajeIgv ?? DEFAULT_IGV_PERCENTAGE)) / 100;
}

export function getCompraImporteImpuestos(compra) {
  if (compra?.importeImpuesto !== null && compra?.importeImpuesto !== undefined) {
    return toNumber(compra.importeImpuesto);
  }

  if (Array.isArray(compra?.impuestos) && compra.impuestos.length > 0) {
    const baseImpuestos = getCompraSubtotal(compra) + getCompraIgv(compra);

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
  return getCompraSubtotal(compra) + getCompraIgv(compra);
}

export function calcularCompraPreview(form) {
  const subtotal = Array.isArray(form?.detalles)
    ? form.detalles.reduce((total, detalle) => {
        return total + toNumber(detalle.peso) * toNumber(detalle.costoKilo);
      }, 0)
    : 0;

  const porcentajeIgv = toNumber(form?.porcentajeIgv || DEFAULT_IGV_PERCENTAGE);
  const igv = form?.aplicaIgv ? (subtotal * porcentajeIgv) / 100 : 0;

  return {
    subtotalPreview: subtotal.toFixed(2),
    igvPreview: igv.toFixed(2),
    totalGeneralPreview: (subtotal + igv).toFixed(2),
  };
}
