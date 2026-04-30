const PERU_TIME_ZONE = 'America/Lima';
const PERU_OFFSET = '-05:00';

function hasExplicitTimeZone(value) {
  return value.includes('T') && /(?:Z|[+-]\d{2}:?\d{2})$/i.test(value);
}

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
