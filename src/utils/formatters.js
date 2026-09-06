const PERU_TIME_ZONE = 'America/Lima';
const PERU_OFFSET = '-05:00';

// Detecta si el texto ya trae zona horaria para no agregar el offset de Peru dos veces.
function hasExplicitTimeZone(value) {
  return value.includes('T') && /(?:Z|[+-]\d{2}:?\d{2})$/i.test(value);
}

// Convierte fechas del backend a Date usando la zona horaria de Peru cuando viene sin offset.
function toPeruDate(value) {
  if (!value) return null;
  if (value instanceof Date) return value;

  if (typeof value === 'string' && !hasExplicitTimeZone(value)) {
    const normalizedValue = value.includes('T')
      ? `${value}${PERU_OFFSET}`
      : `${value}T00:00:00${PERU_OFFSET}`;

    return new Date(normalizedValue);
  }

  return new Date(value);
}

// Formato para mostrar fecha y hora en tablas y modales.
export function formatDateTimePeru(value) {
  const date = toPeruDate(value);
  if (!date || Number.isNaN(date.getTime())) {
    return String(value || '').replace('T', ' ').slice(0, 16) || '-';
  }

  return date.toLocaleString('es-PE', {
    timeZone: PERU_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

// Formato corto de solo fecha, usado cuando la hora no aporta informacion.
export function formatDatePeru(value) {
  const date = toPeruDate(value);
  if (!date || Number.isNaN(date.getTime())) {
    return String(value || '').replace('T', ' ').slice(0, 10) || '-';
  }

  return date.toLocaleDateString('es-PE', {
    timeZone: PERU_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

// Combina una fecha de negocio con la hora actual de Peru para textos de recepcion.
export function formatDateWithCurrentTimePeru(value) {
  const date = toPeruDate(value);
  const dateText =
    !date || Number.isNaN(date.getTime())
      ? String(value || '').replace('T', ' ').slice(0, 10) || '-'
      : date.toLocaleDateString('es-PE', {
          timeZone: PERU_TIME_ZONE,
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        });

  const timeText = new Date().toLocaleTimeString('es-PE', {
    timeZone: PERU_TIME_ZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  return `${dateText}, ${timeText}`;
}

// Convierte una fecha al formato que espera un input HTML type="datetime-local".
export function formatDateTimeInputPeru(value) {
  const date = toPeruDate(value);
  if (!date || Number.isNaN(date.getTime())) return '';

  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: PERU_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    hourCycle: 'h23',
  }).formatToParts(date);

  const getPart = (type) => parts.find((part) => part.type === type)?.value || '00';

  return `${getPart('year')}-${getPart('month')}-${getPart('day')}T${getPart('hour')}:${getPart('minute')}`;
}

// Codigos visibles: separan el id tecnico de la forma en que el usuario identifica documentos.
export function formatCompraCode(id) {
  if (id === null || id === undefined || id === '') return '-';
  return `COMP-${String(id).padStart(4, '0')}`;
}

export function formatRecepcionCode(id) {
  if (id === null || id === undefined || id === '') return '-';
  return `REC-${String(id).padStart(4, '0')}`;
}

export function formatCuentaPagarCode(id) {
  if (id === null || id === undefined || id === '') return '-';
  return `CXP-${String(id).padStart(4, '0')}`;
}

// Mismo formato usado en Consulta de Stock: se repite en Compras, Recepciones y Cuentas por Pagar
// para poder ubicar el articulo en el inventario desde cualquier pantalla.
export function formatArticuloCode(id) {
  if (id === null || id === undefined || id === '') return '-';
  return `ART-${String(id).padStart(4, '0')}`;
}
