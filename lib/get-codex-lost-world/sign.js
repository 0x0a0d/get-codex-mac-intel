'use strict';

function buildSignCommand(targetPath) {
  const normalized = typeof targetPath === 'string' ? targetPath.trim() : '';
  if (!normalized) {
    throw new Error('sign path is required');
  }

  const shellQuotedPath = `'${normalized.replace(/'/g, `'\\''`)}'`;
  return `codesign --force --deep --sign - --timestamp=none ${shellQuotedPath}`;
}

module.exports = {
  buildSignCommand,
};
