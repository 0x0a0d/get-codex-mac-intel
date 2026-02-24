'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { buildSignCommand } = require('../../lib/get-codex-lost-world/sign');

test('buildSignCommand returns ad-hoc codesign command', () => {
  assert.equal(
    buildSignCommand('/tmp/Codex.app'),
    "codesign --force --deep --sign - --timestamp=none '/tmp/Codex.app'"
  );
});

test('buildSignCommand rejects empty path', () => {
  assert.throws(() => buildSignCommand(''), /required/);
  assert.throws(() => buildSignCommand('   '), /required/);
});

test('buildSignCommand safely single-quotes literal special characters', () => {
  const unsafePath = "/tmp/it's $(whoami).app";
  assert.equal(
    buildSignCommand(unsafePath),
    "codesign --force --deep --sign - --timestamp=none '/tmp/it'\\''s $(whoami).app'"
  );
});
