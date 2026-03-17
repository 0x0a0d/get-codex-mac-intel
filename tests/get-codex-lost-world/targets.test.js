'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { normalizeTarget } = require('../../lib/get-codex-lost-world/targets');

test('normalizeTarget defaults to mac x64 dmg', () => {
  assert.deepEqual(normalizeTarget({}), {
    platform: 'mac',
    arch: 'x64',
    format: 'dmg',
  });
});

test('normalizeTarget rejects unsupported combinations', () => {
  assert.throws(() => normalizeTarget({ platform: 'mac', arch: 'x64', format: 'zip' }), /Unsupported format/);
});
