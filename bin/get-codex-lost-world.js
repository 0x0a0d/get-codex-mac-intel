#!/usr/bin/env node
'use strict';

const { runMain, usage } = require('../lib/get-codex-lost-world/main');

function printTargetShortcuts() {
  const message = [
    '',
    'Target shortcuts:',
    '  --mac-silicon      Build/download for Apple Silicon Mac (default source: original Codex.dmg on macOS arm64 host)',
    '  --mac-intel        Build/download for Intel Mac (.dmg)',
    '',
    'Example:',
    '  npx get-codex-lost-world -w ~/Downloads',
  ].join('\n');

  process.stdout.write(`${message}\n`);
}

function remapShortcutArgs(argv = []) {
  const targetShortcuts = {
    '--mac-silicon': ['--platform', 'mac', '--format', 'dmg'],
    '--mac-intel': ['--platform', 'mac', '--arch', 'x64', '--format', 'dmg'],
  };

  const selectedShortcuts = argv.filter((arg) => Object.prototype.hasOwnProperty.call(targetShortcuts, arg));
  if (selectedShortcuts.length > 1) {
    throw new Error(`Target shortcut conflict: ${selectedShortcuts.join(', ')}`);
  }

  const selected = selectedShortcuts[0];
  const withoutShortcuts = argv.filter((arg) => !Object.prototype.hasOwnProperty.call(targetShortcuts, arg));

  if (!selected) {
    return withoutShortcuts;
  }

  return [...withoutShortcuts, ...targetShortcuts[selected]];
}

async function main() {
  const argv = process.argv.slice(2);
  if (argv.includes('--target-help')) {
    process.stdout.write(`${usage()}\n`);
    printTargetShortcuts();
    return;
  }

  const remapped = remapShortcutArgs(argv);
  await runMain(remapped);
}

main().catch((error) => {
  const message = error && error.message ? error.message : String(error);
  process.stderr.write(`${message}\n\n${usage()}\n`);
  process.stderr.write('Use --target-help to see target shortcuts.\n');
  process.exit(1);
});
