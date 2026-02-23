#!/usr/bin/env node
'use strict';

const { runMain, usage } = require('../lib/get-codex/main');

runMain().catch((error) => {
  const message = error && error.message ? error.message : String(error);
  process.stderr.write(`${message}\n\n${usage()}\n`);
  process.exit(1);
});
