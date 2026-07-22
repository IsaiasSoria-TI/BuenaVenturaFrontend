import assert from 'node:assert/strict';
import test from 'node:test';

import {
  getCompraFechaBase,
  getFechaTipoCambio,
  isMonedaSoles,
} from './compraFormUtils.js';

test('identifica monedas en soles por codigo o nombre', () => {
  assert.equal(isMonedaSoles({ codigo: 'PEN' }), true);
  assert.equal(isMonedaSoles({ nombre: 'Soles' }), true);
  assert.equal(isMonedaSoles({ codigo: 'USD' }), false);
});

test('normaliza las fechas usadas para buscar tipo de cambio', () => {
  assert.equal(getFechaTipoCambio('2026-07-21T10:15:00'), '2026-07-21');
  assert.equal(getCompraFechaBase({ fechaEmision: '2026-07-20', fechaCompras: '2026-07-21' }), '2026-07-20');
});
