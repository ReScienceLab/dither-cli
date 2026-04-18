# @resciencelab/dither-cli

Agent-native image and video dithering from the terminal — powered by [dithermark](https://github.com/allen-garvey/dithermark)'s algorithms.

Sub-second per image. No browser, no Playwright, no WebGL. Pure Node.

## Install

```bash
npm i -g @resciencelab/dither-cli
```

## Quick start

```bash
# One-shot with preset
dither apply photo.jpg -o out.png --preset gameboy

# Custom algorithm + palette + filters
dither apply photo.jpg -o out.png \
  --mode color \
  --algorithm atkinson \
  --palette ocean \
  --colors 8 \
  --color-comparison oklab \
  --brightness 110 \
  --contrast 120

# Black & white dithering
dither apply photo.jpg -o out.png --mode bw --algorithm floyd-steinberg

# Batch a folder in parallel
dither batch "shots/*.jpg" -o dithered/ --preset newsprint --concurrency 4

# Video (requires ffmpeg)
dither video in.mp4 -o out.mp4 --preset comic-book --fps 24
```

## Showcase: 20 looks from one frame

Source image: `2001太空漫游-旋转空间站.png`

### Source

![Source rotating station](./examples/showcase/source-rotating-station.png)

### 20-result contact sheet

![20 result contact sheet](./examples/showcase/contact-sheet.png)

### Example recipes

| # | Output | Recipe |
|---|---|---|
| 01 | ![01](./examples/showcase/01-gameboy.png) | `--preset gameboy` |
| 02 | ![02](./examples/showcase/02-mac-classic.png) | `--preset mac-classic` |
| 03 | ![03](./examples/showcase/03-c64.png) | `--preset c64` |
| 04 | ![04](./examples/showcase/04-newsprint.png) | `--preset newsprint` |
| 05 | ![05](./examples/showcase/05-risograph.png) | `--preset risograph` |
| 06 | ![06](./examples/showcase/06-neon.png) | `--preset neon` |
| 07 | ![07](./examples/showcase/07-bluewhite-bayer16.png) | `--mode color --algorithm ordered--bayer-16 --colors 2 --custom-colors "#0047ab,#ffffff" --color-comparison cie-lab` |
| 08 | ![08](./examples/showcase/08-sepia-hl.png) | `--mode color --algorithm ordered--bayer-8--hl --palette sepia --colors 6 --color-comparison hue-lightness --contrast 118` |
| 09 | ![09](./examples/showcase/09-ocean-stark.png) | `--mode color --algorithm ordered--blueNoise-16--stark --palette ocean --colors 8 --color-comparison oklab --saturation 110` |
| 10 | ![10](./examples/showcase/10-wildberry-stucki.png) | `--mode color --algorithm stucki --palette wildberry --colors 12 --color-comparison cie-lab --contrast 112 --brightness 104` |
| 11 | ![11](./examples/showcase/11-mondrian-xor.png) | `--mode color --algorithm xor--medium --palette mondrianchromatic --colors 8 --color-comparison rgb` |
| 12 | ![12](./examples/showcase/12-galaxy-simplex.png) | `--mode color --algorithm simplex --palette galaxy --colors 10 --color-comparison oklab-taxi --hue-rotation 18` |
| 13 | ![13](./examples/showcase/13-thermal-outline-look.png) | `--mode bw --algorithm ordered--hatchHorizontal-4 --black-color "#111111" --white-color "#f5f1e8" --contrast 130` |
| 14 | ![14](./examples/showcase/14-adaptive-blueprint.png) | `--mode bw --algorithm adaptive-threshold --black-color "#0b1d51" --white-color "#ffffff" --blur-before 0.5 --sharpen-after 1.1` |
| 15 | ![15](./examples/showcase/15-bw-bayer8-warm.png) | `--mode bw --algorithm ordered--bayer-8 --black-color "#332211" --white-color "#fff4d6" --brightness 108 --contrast 122` |
| 16 | ![16](./examples/showcase/16-atkinson-paper.png) | `--mode bw --algorithm atkinson --black-color "#1a1a1a" --white-color "#fdfbf5" --sharpen-before 1.2` |
| 17 | ![17](./examples/showcase/17-zx-spectrum-hue.png) | `--mode color --algorithm ordered--bayer-2 --custom-colors "#000000,#0000d7,#d70000,#d700d7,#00d700,#00d7d7,#d7d700,#d7d7d7" --colors 8 --color-comparison hue --saturation 125` |
| 18 | ![18](./examples/showcase/18-cielab-fs-duotone.png) | `--mode color --algorithm floyd-steinberg --custom-colors "#1b1f3b,#f7f3e9,#d7263d,#1b998b" --colors 4 --color-comparison cie-lab --contrast 120` |
| 19 | ![19](./examples/showcase/19-blur-hl-dot.png) | `--mode color --algorithm ordered--dot-8--hl --palette lilac --colors 6 --color-comparison weighted-hsl --blur-before 0.8 --blur-after 0.3` |
| 20 | ![20](./examples/showcase/20-sharp-burkes-metal.png) | `--mode color --algorithm burkes --custom-colors "#0d1b2a,#415a77,#e0e1dd,#c1121f,#ffd166" --colors 5 --color-comparison cie-xyz --sharpen-before 1.8 --contrast 125` |

## Presets

10 curated presets covering classic dither aesthetics:

| Preset | Mode | Description |
|--------|------|-------------|
| `gameboy` | color | Classic Game Boy green palette, Bayer 4x4 |
| `mac-classic` | bw | Macintosh classic 1-bit, Atkinson dithering |
| `c64` | color | Commodore 64 palette, Floyd-Steinberg |
| `gameboy-pocket` | color | Game Boy Pocket grayscale, Bayer 8x8 |
| `comic-book` | color | Halftone dots with limited palette |
| `newsprint` | bw | Black & white halftone newspaper |
| `zx-spectrum` | color | ZX Spectrum 8-color palette, Bayer 2x2 |
| `risograph` | color | Risograph 3-color spot print look |
| `thermal-print` | bw | Thermal receipt printer, horizontal hatch |
| `neon` | color | Vibrant neon palette, Floyd-Steinberg |

```bash
dither preset list              # list all presets
dither preset inspect gameboy   # show preset details
```

## Algorithms

30+ dither algorithms across BW and color modes:

- **Error diffusion**: Floyd-Steinberg, Atkinson, Stucki, Burkes, Sierra 1/2/3, Reduced Atkinson
- **Ordered**: Bayer 2x2/4x4/8x8/16x16, Halftone, Dot patterns
- **Other**: Threshold, Random, Closest Color

```bash
dither info algorithms          # list all algorithms
dither info algorithms --bw     # BW only
dither info algorithms --color  # color only
```

## Palettes

31 built-in color palettes:

```bash
dither info palettes            # list all palettes
dither palette preview sepia    # ASCII preview
dither palette export sepia --format json  # export as JSON
```

## Color comparison

4 color comparison methods for finding closest palette matches:

| Method | Description |
|--------|-------------|
| `rgb` | Euclidean RGB distance (default) |
| `luma` | Weighted luma-aware distance |
| `lightness` | HSL lightness comparison |
| `oklab` | Perceptual OKLab distance (best quality) |

## Filters

Apply pre-dither image adjustments:

```bash
dither apply photo.jpg -o out.png --preset gameboy \
  --brightness 110 \
  --contrast 120 \
  --saturation 80 \
  --pixelate 2
```

## Config files

Save your recipe as JSON and reuse it:

```json
{
  "name": "my-recipe",
  "mode": "color",
  "algorithm": "atkinson",
  "palette": "ocean",
  "colors": 8,
  "colorComparison": "oklab",
  "filters": {
    "brightness": 110,
    "contrast": 120,
    "saturation": 100,
    "pixelate": 1
  }
}
```

```bash
dither apply photo.jpg -o out.png --config my-recipe.json
```

## Video

Requires `ffmpeg` on PATH. Decomposes video into frames, dithers each in parallel, recomposes.

```bash
dither video in.mp4 -o out.mp4 --preset mac-classic --fps 24 --concurrency 4
```

## License

MIT
