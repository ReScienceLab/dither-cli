# dither-cli

Node-based image and video dithering from the terminal — powered by dithermark's algorithms.

This repository packages a standalone CLI published as `@resciencelab/dither-cli`, with all CLI source under [`cli/`](./cli).

## Install

```bash
npm i -g @resciencelab/dither-cli
```

## Quick start

```bash
# One-shot with a preset
dither apply photo.jpg -o out.png --preset gameboy

# Custom algorithm + palette + filters
dither apply photo.jpg -o out.png   --mode color   --algorithm ordered--bayer-16   --colors 2   --custom-colors "#0047ab,#ffffff"   --color-comparison cie-lab

# Batch processing
dither batch "shots/*.jpg" -o dithered/ --preset newsprint --concurrency 4

# Video (requires ffmpeg)
dither video in.mp4 -o out.mp4 --preset comic-book --fps 24
```

## Showcase

Source frame:

![Source rotating station](./cli/examples/showcase/source-rotating-station.png)

20 example looks generated from the same frame:

![20 result contact sheet](./cli/examples/showcase/contact-sheet.png)

## What's in this repo

- `cli/` — npm package source, commands, presets, vendored dithermark worker/shared modules
- `.github/workflows/publish-cli.yml` — tag-driven npm publish workflow for `cli-v*`
- `.archive/2026-04-18/dither-cli-launch.md` — launch/archive notes

## CLI features

- Large frontend-aligned algorithm surface, including ordered, diffusion, threshold, arithmetic, random, and simplex variants
- Palette-based color dithering with multiple color comparison modes
- Core image controls exposed in CLI and JSON config: brightness, contrast, saturation, hue rotation, pixelate, blur, sharpen, custom BW replacement colors
- Image, batch, and video pipelines

For the full CLI documentation, presets, and the 20-example recipe table, see [cli/README.md](./cli/README.md).

## License

MIT
