'use strict';

function summarizeRelease(release) {
  return {
    version: release?.tag_name || release?.name || '',
    datetime: release?.published_at || release?.created_at || '',
    notes: release?.body || '',
  };
}

function pickLatestDmgAsset(release) {
  const assets = Array.isArray(release?.assets) ? release.assets : [];
  const dmgAssets = assets.filter((asset) => typeof asset?.name === 'string' && asset.name.toLowerCase().endsWith('.dmg'));

  if (dmgAssets.length === 0) {
    throw new Error('No .dmg asset found in release assets');
  }

  const preferred = dmgAssets.find((asset) => /^CodexIntelMac_.*\.dmg$/.test(asset.name));
  const selected = preferred || dmgAssets[0];

  if (typeof selected?.browser_download_url !== 'string' || selected.browser_download_url.trim() === '') {
    throw new Error('Selected .dmg asset is missing browser_download_url');
  }

  return selected;
}

module.exports = {
  summarizeRelease,
  pickLatestDmgAsset,
};
