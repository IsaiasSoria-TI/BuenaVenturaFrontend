import assert from 'node:assert/strict';
import test from 'node:test';

import { getApiErrorMessage } from './getApiErrorMessage.js';

test('prioriza el mensaje estructurado del backend', () => {
  const error = { response: { data: { message: 'Credenciales invalidas' } } };
  assert.equal(getApiErrorMessage(error, 'Error'), 'Credenciales invalidas');
});

test('acepta respuestas de texto y usa fallback para otros formatos', () => {
  assert.equal(getApiErrorMessage({ response: { data: 'Sin conexion' } }, 'Error'), 'Sin conexion');
  assert.equal(getApiErrorMessage({ response: { data: {} } }, 'Error'), 'Error');
});
