'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { parseForce, run } = require('../../scripts/ci/check-update');

test('parseForce parses true-like and false-like values', () => {
  assert.equal(parseForce('true'), true);
  assert.equal(parseForce('1'), true);
  assert.equal(parseForce('yes'), true);

  assert.equal(parseForce('false'), false);
  assert.equal(parseForce('0'), false);
  assert.equal(parseForce('no'), false);
  assert.equal(parseForce('unexpected'), false);
});

test('run returns unchanged reason when not forced and unchanged', () => {
  const result = run({
    LAST_MODIFIED: 'abc',
    CACHED_LAST_MODIFIED: 'abc',
    FORCE: 'false',
  });

  assert.equal(result.shouldBuild, false);
  assert.equal(result.reason, 'unchanged');
});

test('run returns changed reason when metadata is missing', () => {
  const result = run({
    LAST_MODIFIED: '',
    CACHED_LAST_MODIFIED: 'abc',
    FORCE: 'false',
  });

  assert.equal(result.shouldBuild, true);
  assert.equal(result.reason, 'changed');
});

test('CLI writes should_build and reason to GITHUB_OUTPUT', () => {
  const outputFile = path.join(os.tmpdir(), `check-update-${process.pid}-${Date.now()}.out`);
  const scriptPath = path.resolve(__dirname, '../../scripts/ci/check-update.js');

  try {
    const execution = spawnSync(process.execPath, [scriptPath], {
      env: {
        ...process.env,
        LAST_MODIFIED: 'new-value',
        CACHED_LAST_MODIFIED: 'old-value',
        FORCE: '0',
        GITHUB_OUTPUT: outputFile,
      },
      encoding: 'utf8',
    });

    assert.equal(execution.status, 0);

    const content = fs.readFileSync(outputFile, 'utf8');
    assert.match(content, /should_build=true/);
    assert.match(content, /reason=changed/);
  } finally {
    fs.rmSync(outputFile, { force: true });
  }
});
