# codex-intel-build

This repository automatically generates a `Codex Mac Intel` build from the upstream `Codex.dmg`, and also provides a CLI to view the latest cached build, download files, and re-sign locally when needed.

## CI/CD overview (runs every 3 hours)

Main workflow location:
- `/codex-intel-build/.github/workflows/codex-intel-release.yml`

CI/CD flow:
1. Triggered by schedule `0 */3 * * *` (every 3 hours) or manually via `workflow_dispatch`.
2. Reads cache state from branch `ci-cache` (`.ci/cache-state.json`).
3. Fetches `Last-Modified` from upstream `https://persistent.oaistatic.com/codex-app-prod/Codex.dmg`.
4. Compares with cache to decide whether to build or skip.
5. If build is needed, converts Intel DMG and creates/updates GitHub Release.
6. Writes the new state back to `ci-cache` to dedupe the next cycle.

## Cache mechanism with `ci-cache` branch + `force`

- CI stores metadata of the latest build in a dedicated `ci-cache` branch.
- Important fields include: `lastModified`, `version`, `releaseTag`, `processedAt`.
- Default behavior:
  - If `Last-Modified` is unchanged from cache, build/release is skipped.
  - If changed, a new build is triggered.
- For manual runs (`workflow_dispatch`), there is a `force` input:
  - `force=true` => rebuild even if `Last-Modified` is unchanged.
  - `force=false` => keep cache-based dedupe behavior.

## Important signing warning

CI currently uses **ad-hoc signing** only (`codesign --sign -`) so the binary remains runnable for packaging and internal testing.

**Ad-hoc signing does NOT replace Developer ID signing and Apple notarization for release/distribution.**

If you distribute outside internal environments, you must sign with Developer ID and notarize according to Apple requirements.

## Local re-signing (example commands)

### Local ad-hoc re-sign (quick, for run/test only)

```bash
codesign --force --deep --sign - /path/to/Codex.app
codesign --verify --deep --strict /path/to/Codex.app
```

### Re-sign for distribution (Developer ID + notarization)

```bash
codesign --force --deep --sign "Developer ID Application: Your Name (TEAMID)" --options runtime --timestamp /path/to/Codex.app
xcrun notarytool submit /path/to/CodexIntelMac.dmg --keychain-profile "notary-profile" --wait
xcrun stapler staple /path/to/CodexIntelMac.dmg
```

## CLI usage

CLI entrypoint:
- `npx get-codex-mac-intel`

### 1) Default build mode (default `--build`)

```bash
npx get-codex-mac-intel
```

Equivalent to:

```bash
npx get-codex-mac-intel --build
```

Build mode behavior:
- Default output/download folder is current working directory (`cwd`).
- Use `-w, --workdir <path>` to set one folder for both:
  - downloading source `Codex.dmg`
  - writing Intel output DMG
- Output filename is versioned: `CodexIntelMac_<version>.dmg`.
- Build version is read from source `Codex.dmg` -> `Codex.app/Contents/Info.plist` (`CFBundleShortVersionString`; fallback `CFBundleVersion`).

Example:

```bash
npx get-codex-mac-intel --build --workdir /Users/toor/Downloads
```

### 2) Cache mode

```bash
npx get-codex-mac-intel --cache
```

### 3) Sign mode

```bash
npx get-codex-mac-intel --sign <path>
```

Example:

```bash
npx get-codex-mac-intel --sign /Applications/Codex.app
```

## Build runtime temp/log behavior

- Builder uses `os.tmpdir()` for temporary workspace.
- Temporary build directory is removed after completion (including failure handling cleanup).
- Build no longer writes `log.txt`; logs are emitted to stdout/stderr.

## `--cache` semantics

When running `npx get-codex-mac-intel --cache`, the CLI behaves in this order:

1. Displays **latest release** info: version, datetime, release notes.
2. Prompts for `Download location`.
3. If the user **enters a location** (non-empty), the CLI treats it as **download confirmation** and starts downloading the latest asset to that location.
4. If the user **leaves location empty**, the CLI **does not download**.
5. After download completes, CLI asks whether to sign (`Sign downloaded file? (y/N)`).
   - Reply `y/yes`: sign the downloaded file.
   - Any other reply: skip signing.
