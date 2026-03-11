'use strict';

const fs = require('node:fs');
const { shouldBuild } = require('../../lib/ci/state');

function parseForce(value) {
  const normalized = String(value || '').trim().toLowerCase();

  if (normalized === 'true' || normalized === '1' || normalized === 'yes') {
    return true;
  }

  if (normalized === 'false' || normalized === '0' || normalized === 'no') {
    return false;
  }

  return false;
}

function getReason({ force, build }) {
  if (force) {
    return 'force';
  }

  return build ? 'changed' : 'unchanged';
}

function appendGithubOutput(filePath, outputs) {
  if (!filePath) {
    return;
  }

  const lines = [
    `should_build=${outputs.shouldBuild}`,
    `reason=${outputs.reason}`,
  ].join('\n') + '\n';

  try {
    fs.appendFileSync(filePath, lines, 'utf8');
  } catch (error) {
    process.stdout.write(`Warning: could not write GITHUB_OUTPUT (${error.message})\n`);
  }
}

function run(env = process.env) {
  const incomingLastModified = env.LAST_MODIFIED;
  const cachedLastModified = env.CACHED_LAST_MODIFIED;
  const incomingNpmVersion = env.NPM_CODEX_VERSION;
  const cachedNpmVersion = env.CACHED_NPM_CODEX_VERSION;
  const force = parseForce(env.FORCE);

  const build = shouldBuild({
    incomingLastModified,
    cachedLastModified,
    incomingNpmVersion,
    cachedNpmVersion,
    force,
  });

  const reason = getReason({ force, build });

  process.stdout.write(
    `CI check: should_build=${build} (reason=${reason}, incoming=${incomingLastModified || ''}, cached=${cachedLastModified || ''}, npm_incoming=${incomingNpmVersion || ''}, npm_cached=${cachedNpmVersion || ''}, force=${force})\n`
  );

  appendGithubOutput(env.GITHUB_OUTPUT, {
    shouldBuild: build,
    reason,
  });

  return {
    shouldBuild: build,
    reason,
    force,
  };
}

if (require.main === module) {
  run(process.env);
  process.exitCode = 0;
}

module.exports = {
  run,
  parseForce,
  getReason,
};
