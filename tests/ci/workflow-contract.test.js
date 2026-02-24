'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const workflowPath = path.join(__dirname, '../../.github/workflows/get-codex-lost-world-release.yml');

function readWorkflow() {
  return fs.readFileSync(workflowPath, 'utf8');
}

test('workflow includes 3-hour schedule cron', () => {
  const content = readWorkflow();

  assert.match(content, /schedule:\s*[\s\S]*cron:\s*['"]0 \*\/3 \* \* \*['"]/);
});

test('workflow includes workflow_dispatch force input', () => {
  const content = readWorkflow();

  assert.match(content, /workflow_dispatch:/);
  assert.match(content, /inputs:\s*[\s\S]*force:/);
});

test('workflow references ci-cache branch', () => {
  const content = readWorkflow();

  assert.match(content, /ci-cache/);
});

test('workflow uses Codex.dmg source URL', () => {
  const content = readWorkflow();

  assert.match(content, /https:\/\/persistent\.oaistatic\.com\/codex-app-prod\/Codex\.dmg/);
});

test('workflow defines CodexIntelMac artifact naming pattern', () => {
  const content = readWorkflow();

  assert.match(content, /CodexIntelMac_/);
});

test('workflow release notes include signing guidance', () => {
  const content = readWorkflow();

  assert.match(content, /ad-hoc signing/i);
  assert.match(content, /Developer ID/i);
  assert.match(content, /notarization/i);
});

test('workflow uses macOS runner and contents: write permission', () => {
  const content = readWorkflow();

  assert.match(content, /runs-on:\s*macos-/i);
  assert.match(content, /runs-on:\s*windows-latest/i);
  assert.match(content, /permissions:\s*[\s\S]*contents:\s*write/);
});

test('workflow defines top-level concurrency guard', () => {
  const content = readWorkflow();

  assert.match(content, /concurrency:\s*[\s\S]*group:\s*get-codex-lost-world-release-\$\{\{\s*github\.repository\s*\}\}/);
  assert.match(content, /concurrency:\s*[\s\S]*cancel-in-progress:\s*false/);
});

test('workflow has separate check-update job for Last-Modified decision', () => {
  const content = readWorkflow();

  assert.match(content, /check-update:/);
  assert.match(content, /name:\s*Fetch remote Last-Modified header/);
  assert.match(content, /node\s+scripts\/ci\/check-update\.js/);
  assert.match(content, /steps\.decision\.outputs\.should_build/);
  assert.match(content, /steps\.decision\.outputs\.reason/);
});

test('workflow defines parallel build jobs that depend on check-update', () => {
  const content = readWorkflow();

  assert.match(content, /build-mac-intel:/);
  assert.match(content, /build-windows:/);
  assert.match(content, /build-mac-intel:[\s\S]*needs:\s*[\s\S]*-\s*check-update/);
  assert.match(content, /build-windows:[\s\S]*needs:\s*[\s\S]*-\s*check-update/);
  assert.match(content, /if:\s*\$\{\{\s*needs\.check-update\.outputs\.should_build\s*==\s*'true'\s*\}\}/);
});

test('workflow builds intel dmg artifact in dedicated mac job', () => {
  const content = readWorkflow();

  assert.match(content, /name:\s*Build Intel DMG/);
  assert.match(content, /scripts\/build-intel-dmg\.js/);
  assert.match(content, /Upload mac artifact to release/);
});

test('workflow defines windows matrix for x64 and arm64 portable zip', () => {
  const content = readWorkflow();

  assert.match(content, /build-windows:/);
  assert.match(content, /matrix:\s*[\s\S]*arch:\s*\[x64, arm64\]/);
  assert.match(content, /scripts\/build-windows-zip\.js/);
  assert.match(content, /CodexWindows_\$\{\{ matrix\.arch \}\}_\$\{env:SAFE_VERSION\}\.zip/);
});

test('workflow builds and uploads NSIS installer artifacts for windows matrix', () => {
  const content = readWorkflow();

  assert.match(content, /installerName\s*=\s*"CodexInstaller_\$\{\{ matrix\.arch \}\}_\$\{env:SAFE_VERSION\}\.exe"/);
  assert.match(content, /--installer-output/);
  assert.match(content, /gh release upload "\$TAG" "\$INSTALLER_PATH#\$INSTALLER_NAME" --clobber/);
});

test('workflow separates windows npm install with setup-node cache based on generated package.json', () => {
  const content = readWorkflow();

  assert.match(content, /name:\s*Prepare windows build package\.json/);
  assert.match(content, /uses:\s*actions\/setup-node@v4/);
  assert.match(content, /cache:\s*'npm'/);
  assert.match(content, /cache-dependency-path:\s*\.ci\/windows-build-\$\{\{ matrix\.arch \}\}\/package\.json/);
  assert.match(content, /name:\s*Install windows build dependencies/);
  assert.match(content, /npm install --prefix "\$env:BUILD_DIR" --no-audit --no-fund/);
  assert.match(content, /--project-dir "\$buildDir"/);
});

test('workflow uploads and downloads payload metadata artifact between check and windows jobs', () => {
  const content = readWorkflow();

  assert.match(content, /scripts\/ci\/extract-codex-payload\.js/);
  assert.match(content, /uses:\s*actions\/upload-artifact@v4/);
  assert.match(content, /name:\s*codex-payload-metadata/);
  assert.match(content, /uses:\s*actions\/download-artifact@v4/);
});

test('workflow updates ci-cache state after all build jobs complete', () => {
  const content = readWorkflow();

  assert.match(content, /update-cache-state:/);
  assert.match(content, /update-cache-state:[\s\S]*needs:[\s\S]*-\s*check-update[\s\S]*-\s*build-mac-intel[\s\S]*-\s*build-windows/);
  assert.match(content, /cache-state\.json/);
  assert.match(content, /lastModified/);
  assert.match(content, /version/);
  assert.match(content, /releaseTag/);
  assert.match(content, /processedAt/);
});

test('workflow has explicit clean skip path when should_build is false', () => {
  const content = readWorkflow();

  assert.match(content, /if:\s*\$\{\{\s*steps\.decision\.outputs\.should_build\s*!=\s*'true'\s*\}\}/);
});
