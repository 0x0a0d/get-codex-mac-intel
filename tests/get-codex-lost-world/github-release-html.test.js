'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const {
  extractReleaseTagFromUrl,
  parseExpandedAssetsHtml,
} = require('../../lib/get-codex-lost-world/github-release-html');

const { pickLatestAssetForTarget } = require('../../lib/get-codex-lost-world/release');

test('extractReleaseTagFromUrl extracts tag from redirected releases URL', () => {
  assert.equal(
    extractReleaseTagFromUrl('https://github.com/0x0a0d/get-codex-lost-world/releases/tag/26.311.21342'),
    '26.311.21342'
  );
});

test('parseExpandedAssetsHtml extracts DMG assets + pickLatestAssetForTarget chooses newest by datetime', () => {
  const html = String.raw`
<div data-view-component="true" class="Box Box--condensed tmp-mt-3">
  <ul data-view-component="true">
    <li data-view-component="true" class="Box-row d-flex flex-column flex-md-row">
      <div style="overflow: hidden;" data-view-component="true" class="d-flex flex-justify-start flex-items-center col-12 col-lg-6">
        <a href="/0x0a0d/get-codex-lost-world/releases/download/26.311.21342/CodexMacIntel_v26.311.21342_npm_v0.114.0.dmg" rel="nofollow" data-turbo="false" data-view-component="true" class="Truncate">
          <span data-view-component="true" class="Truncate-text text-bold">CodexMacIntel_v26.311.21342_npm_v0.114.0.dmg</span>
        </a>
      </div>
      <div data-view-component="true" class="d-flex flex-auto flex-justify-end flex-items-center col-md-6">
        <span data-view-component="true" class="Truncate-text">sha256:4fcc4747d5fc8447b779903035fad1c883a18ef807a090aba6c4dd69a75e4803</span>
        <span data-view-component="true" class="color-fg-muted">246 MB</span>
        <span data-view-component="true" class="color-fg-muted"><relative-time datetime="2026-03-13T00:09:25Z">2026-03-13T00:09:25Z</relative-time></span>
      </div>
    </li>

    <li data-view-component="true" class="Box-row d-flex flex-column flex-md-row">
      <div style="overflow: hidden;" data-view-component="true" class="d-flex flex-justify-start flex-items-center col-12 col-lg-6">
        <a href="/0x0a0d/get-codex-lost-world/releases/download/26.311.21342/CodexMacIntel_v26.311.21342_npm_v0.115.0.dmg" rel="nofollow" data-turbo="false" data-view-component="true" class="Truncate">
          <span data-view-component="true" class="Truncate-text text-bold">CodexMacIntel_v26.311.21342_npm_v0.115.0.dmg</span>
        </a>
      </div>
      <div data-view-component="true" class="d-flex flex-auto flex-justify-end flex-items-center col-md-6">
        <span data-view-component="true" class="Truncate-text">sha256:7c7eb6662101900e620a5033b0ed910146bba04225b1222697c7ccec46186865</span>
        <span data-view-component="true" class="color-fg-muted">249 MB</span>
        <span data-view-component="true" class="color-fg-muted"><relative-time datetime="2026-03-16T21:12:29Z">2026-03-16T21:12:29Z</relative-time></span>
      </div>
    </li>
  </ul>
</div>
`;

  const assets = parseExpandedAssetsHtml(html, { repo: '0x0a0d/get-codex-lost-world' });

  const dmgAssets = assets.filter((asset) => asset.name.endsWith('.dmg'));
  assert.equal(dmgAssets.length, 2);

  assert.deepEqual(dmgAssets[0], {
    name: 'CodexMacIntel_v26.311.21342_npm_v0.114.0.dmg',
    browser_download_url: 'https://github.com/0x0a0d/get-codex-lost-world/releases/download/26.311.21342/CodexMacIntel_v26.311.21342_npm_v0.114.0.dmg',
    updated_at: '2026-03-13T00:09:25Z',
    size: '246 MB',
    sha256: 'sha256:4fcc4747d5fc8447b779903035fad1c883a18ef807a090aba6c4dd69a75e4803',
    url: 'https://github.com/0x0a0d/get-codex-lost-world/releases/download/26.311.21342/CodexMacIntel_v26.311.21342_npm_v0.114.0.dmg',
  });

  assert.equal(
    pickLatestAssetForTarget({ assets }, { platform: 'mac', arch: 'x64', format: 'dmg' }).name,
    'CodexMacIntel_v26.311.21342_npm_v0.115.0.dmg'
  );
});
