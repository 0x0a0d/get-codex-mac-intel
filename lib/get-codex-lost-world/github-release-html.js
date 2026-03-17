'use strict';

const https = require('node:https');

const DEFAULT_HEADERS = {
  'User-Agent': 'get-codex-lost-world',
  Accept: 'text/html,application/xhtml+xml',
  // Avoid having to handle gzip/brotli in Node core without extra deps.
  'Accept-Encoding': 'identity',
};

function fetchTextOnce(url, { headers = {} } = {}) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { ...DEFAULT_HEADERS, ...headers } }, (res) => {
      const statusCode = res.statusCode || 0;
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        resolve({
          statusCode,
          headers: res.headers || {},
          body: Buffer.concat(chunks).toString('utf8'),
        });
      });
      res.on('error', reject);
    });

    req.on('error', reject);
  });
}

async function fetchTextWithRedirects(url, { headers = {}, maxRedirects = 10 } = {}) {
  let currentUrl = url;

  for (let i = 0; i <= maxRedirects; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    const res = await fetchTextOnce(currentUrl, { headers });

    const status = res.statusCode;
    const location = res.headers && res.headers.location;
    if ([301, 302, 303, 307, 308].includes(status) && location) {
      currentUrl = new URL(location, currentUrl).toString();
      continue;
    }

    if (status < 200 || status >= 300) {
      throw new Error(`Request failed (${status}): ${currentUrl}`);
    }

    return {
      finalUrl: currentUrl,
      statusCode: status,
      body: res.body,
    };
  }

  throw new Error(`Too many redirects: ${url}`);
}

function extractReleaseTagFromUrl(finalUrl) {
  const input = String(finalUrl || '').trim();
  if (!input) {
    throw new Error('finalUrl is required to extract release tag');
  }

  const match = input.match(/\/releases\/tag\/([^/?#]+)/);
  if (!match || !match[1]) {
    throw new Error(`Unable to extract release tag from url: ${finalUrl}`);
  }

  return decodeURIComponent(match[1]);
}

function parseExpandedAssetsHtml(html, { repo } = {}) {
  const body = String(html || '');
  const assets = [];
  const baseUrl = 'https://github.com/';

  const liRegex = /<li[^>]*class="Box-row[^"]*"[^>]*>([\s\S]*?)<\/li>/g;
  let liMatch;
  while ((liMatch = liRegex.exec(body))) {
    const block = liMatch[1];

    const linkMatch = block.match(/<a[^>]*href="([^"]+)"[^>]*class="Truncate"[\s\S]*?<span[^>]*class="Truncate-text text-bold"[^>]*>([^<]+)<\/span>/i);
    if (!linkMatch) {
      continue;
    }

    const href = linkMatch[1];
    const name = String(linkMatch[2] || '').trim();
    if (!name) {
      continue;
    }

    const timeMatch = block.match(/<relative-time[^>]*datetime="([^"]+)"/i);
    const updated_at = timeMatch ? String(timeMatch[1] || '').trim() : '';

    const shaMatch = block.match(/sha256:([0-9a-f]{64})/i);
    const sha256 = shaMatch ? `sha256:${shaMatch[1].toLowerCase()}` : '';

    const sizeMatch = block.match(/>\s*([0-9.]+\s*(?:B|KB|MB|GB|TB))\s*<\/span>\s*<span[^>]*>\s*<relative-time/i);
    const size = sizeMatch ? String(sizeMatch[1] || '').trim() : '';

    const browser_download_url = new URL(href, baseUrl).toString();

    assets.push({
      name,
      browser_download_url,
      updated_at,
      size,
      sha256,
      // For compatibility with GitHub API shape
      url: browser_download_url,
    });
  }

  // If we didn't get any Box-row matches (GitHub markup change), fail loudly.
  if (assets.length === 0) {
    const repoLabel = repo ? ` for ${repo}` : '';
    throw new Error(`No assets parsed from expanded_assets HTML${repoLabel}`);
  }

  return assets;
}

function maxIsoDatetime(values) {
  let best = '';
  let bestTime = 0;

  for (const value of values) {
    const time = Date.parse(value);
    if (!Number.isFinite(time)) {
      continue;
    }
    if (time > bestTime) {
      bestTime = time;
      best = value;
    }
  }

  return best;
}

async function getLatestReleaseFromGithubHtml({ repo } = {}) {
  const normalizedRepo = String(repo || '').trim();
  if (!normalizedRepo) {
    throw new Error('repo is required');
  }

  const latestUrl = `https://github.com/${normalizedRepo}/releases/latest`;
  const latestRes = await fetchTextWithRedirects(latestUrl);
  const tag = extractReleaseTagFromUrl(latestRes.finalUrl);

  const assetsUrl = `https://github.com/${normalizedRepo}/releases/expanded_assets/${encodeURIComponent(tag)}`;
  const assetsRes = await fetchTextWithRedirects(assetsUrl);
  const assets = parseExpandedAssetsHtml(assetsRes.body, { repo: normalizedRepo });

  const published_at = maxIsoDatetime(assets.map((asset) => asset.updated_at));

  return {
    tag_name: tag,
    published_at,
    assets,
  };
}

module.exports = {
  fetchTextWithRedirects,
  extractReleaseTagFromUrl,
  parseExpandedAssetsHtml,
  getLatestReleaseFromGithubHtml,
};
