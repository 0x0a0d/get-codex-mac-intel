'use strict';

function sanitizeVersion(version) {
  return String(version || '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^0-9A-Za-z._-]/g, '-');
}

function makeOutputName(version) {
  return `CodexIntelMac_${sanitizeVersion(version)}.dmg`;
}

function makeOutputNameForTarget({ version, format }) {
  const safeVersion = sanitizeVersion(version);
  const normalizedFormat = String(format || '').trim().toLowerCase();

  return `CodexIntelMac_${safeVersion}.${normalizedFormat || 'dmg'}`;
}

module.exports = {
  sanitizeVersion,
  makeOutputName,
  makeOutputNameForTarget,
};
