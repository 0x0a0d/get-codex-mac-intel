'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { resolveCacheDownload } = require('../../lib/get-codex/cache-download');

test('resolveCacheDownload returns shouldDownload=false for empty input', () => {
  assert.deepEqual(resolveCacheDownload(''), { shouldDownload: false, location: '' });
  assert.deepEqual(resolveCacheDownload('   '), { shouldDownload: false, location: '' });
  assert.deepEqual(resolveCacheDownload(null), { shouldDownload: false, location: '' });
});

test('resolveCacheDownload returns trimmed location and shouldDownload=true', () => {
  assert.deepEqual(resolveCacheDownload('  /tmp/cache  '), {
    shouldDownload: true,
    location: '/tmp/cache',
  });
});
