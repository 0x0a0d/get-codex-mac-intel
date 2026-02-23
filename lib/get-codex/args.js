'use strict';

function parseArgs(argv = []) {
  const modeFlags = [];
  let signPath;
  let workdir;
  let help = false;

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === '--help' || arg === '-h') {
      help = true;
      continue;
    }

    if (arg === '--cache' || arg === '-c') {
      modeFlags.push('cache');
      continue;
    }

    if (arg === '--build' || arg === '-b') {
      modeFlags.push('build');
      continue;
    }

    if (arg === '--sign' || arg === '-s') {
      modeFlags.push('sign');
      const candidate = argv[i + 1];
      if (typeof candidate !== 'string' || candidate.trim() === '' || candidate.startsWith('-')) {
        throw new Error('--sign requires a path');
      }
      signPath = candidate;
      i += 1;
      continue;
    }

    if (arg === '--workdir' || arg === '-w') {
      const candidate = argv[i + 1];
      if (typeof candidate !== 'string' || candidate.trim() === '' || candidate.startsWith('-')) {
        throw new Error('--workdir requires a path');
      }
      workdir = candidate;
      i += 1;
      continue;
    }

    if (arg.startsWith('-')) {
      throw new Error(`Unknown option: ${arg}`);
    }
  }

  const uniqueModes = [...new Set(modeFlags)];
  if (uniqueModes.length > 1) {
    throw new Error('mode flag conflict');
  }

  if (help) {
    return { mode: 'help' };
  }

  const mode = uniqueModes[0] || 'build';
  if (mode === 'sign') {
    if (typeof workdir === 'string') {
      return { mode, signPath, workdir };
    }
    return { mode, signPath };
  }

  if (typeof workdir === 'string') {
    return { mode, workdir };
  }

  return { mode };
}

module.exports = {
  parseArgs,
};
