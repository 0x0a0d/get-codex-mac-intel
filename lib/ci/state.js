'use strict';

function shouldBuild({ incomingLastModified, cachedLastModified, incomingNpmVersion, cachedNpmVersion, force }) {
  if (force === true) {
    return true;
  }

  if (incomingLastModified !== cachedLastModified) {
    return true;
  }

  if (incomingNpmVersion && incomingNpmVersion !== cachedNpmVersion) {
    return true;
  }

  return false;
}

module.exports = {
  shouldBuild,
};
