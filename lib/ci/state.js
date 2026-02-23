'use strict';

function shouldBuild({ incomingLastModified, cachedLastModified, force }) {
  if (force === true) {
    return true;
  }

  if (incomingLastModified === cachedLastModified) {
    return false;
  }

  return true;
}

module.exports = {
  shouldBuild,
};
