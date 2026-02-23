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

module.exports = {
  sanitizeVersion,
  makeOutputName,
};
