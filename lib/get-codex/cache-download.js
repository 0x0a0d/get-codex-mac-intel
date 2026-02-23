'use strict';

function resolveCacheDownload(location) {
  const normalized = typeof location === 'string' ? location.trim() : '';

  if (!normalized) {
    return {
      shouldDownload: false,
      location: '',
    };
  }

  return {
    shouldDownload: true,
    location: normalized,
  };
}

module.exports = {
  resolveCacheDownload,
};
