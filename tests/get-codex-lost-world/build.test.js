'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { sanitizeVersion, makeOutputName, makeOutputNameForTarget } = require('../../lib/get-codex-lost-world/build');

test('sanitizeVersion converts spaces to dashes', () => {
  assert.equal(sanitizeVersion('1.2.3 beta'), '1.2.3-beta');
});

test('makeOutputName returns CodexIntelMac_<version>.dmg', () => {
  assert.equal(makeOutputName('1.2.3'), 'CodexIntelMac_1.2.3.dmg');
});

test('sanitizeVersion replaces disallowed characters with dashes', () => {
  assert.equal(sanitizeVersion('1/2:3'), '1-2-3');
});

