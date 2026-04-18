# dither-cli Launch

**Date**: 2026-04-18
**Package**: @resciencelab/dither-cli@0.1.0
**Binary**: `dither`

## Summary

Node-based CLI harness for dithermark's image dithering algorithms. Pure Node pipeline using sharp for image I/O and a self-contained TypeScript port of dithermark's JS worker engine. No browser, no WebGL, no Playwright.

## Architecture

- `cli/src/core/dither-engine.ts` — Self-contained dithering engine (BW + color, ordered + error diffusion + random)
- `cli/src/core/pipeline.ts` — Compose filters -> dither -> palette pipeline
- `cli/src/core/palette-registry.ts` — 31 built-in color palettes
- `cli/src/core/preset-registry.ts` — 10 curated presets (gameboy, mac-classic, c64, etc.)
- `cli/src/commands/` — apply, batch, video, info, preset, palette commands
- `cli/src/utils/` — sharp image I/O, ffmpeg spawn wrapper, spinner/progress bar

## Key numbers

- 30+ dither algorithms (10 BW + 20+ color)
- 31 color palettes
- 10 presets
- 4 color comparison methods (rgb, luma, lightness, oklab)
- ~30 MB install (vs ~300 MB if we'd used Playwright)

## Commands

```
dither apply <input> [-o output] [--preset name] [--algorithm slug] [--palette slug]
dither batch <glob> -o <dir> [--preset name] [--concurrency n]
dither video <input> -o <output> [--preset name] [--fps n]
dither info algorithms|palettes|color-comparisons
dither preset list|inspect <name>
dither palette list|preview <slug>|export <slug>
```

## Release workflow

GitHub Actions `.github/workflows/publish-cli.yml` triggers on `cli-v*` tags:
1. Build cli/
2. Verify `dither --version`
3. Publish to npm with provenance
4. Create GitHub Release
