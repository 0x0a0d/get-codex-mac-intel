'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { shouldBuild } = require('../../lib/ci/state');

test('shouldBuild returns true when force=true', () => {
  assert.equal(
    shouldBuild({
      incomingLastModified: 'Mon, 01 Jan 2026 00:00:00 GMT',
      cachedLastModified: 'Mon, 01 Jan 2026 00:00:00 GMT',
      force: true,
    }),
    true
  );
});

test('shouldBuild returns false when force=false and values are equal', () => {
  assert.equal(
    shouldBuild({
      incomingLastModified: 'Mon, 01 Jan 2026 00:00:00 GMT',
      cachedLastModified: 'Mon, 01 Jan 2026 00:00:00 GMT',
      force: false,
    }),
    false
  );
});

test('shouldBuild returns true when force=false and values differ', () => {
  assert.equal(
    shouldBuild({
      incomingLastModified: 'Mon, 01 Jan 2026 00:00:00 GMT',
      cachedLastModified: 'Tue, 02 Jan 2026 00:00:00 GMT',
      force: false,
    }),
    true
  );
});

test('shouldBuild returns true when metadata is missing', () => {
  assert.equal(
    shouldBuild({
      incomingLastModified: '',
      cachedLastModified: 'Tue, 02 Jan 2026 00:00:00 GMT',
      force: false,
    }),
    true
  );

  assert.equal(
    shouldBuild({
      incomingLastModified: 'Mon, 01 Jan 2026 00:00:00 GMT',
      cachedLastModified: undefined,
      force: false,
    }),
    true
  );
});
