import sharp from 'sharp';
import { ditherPixels, hexArrayToColors, createPixel, type DitherOptions } from './dither-engine.js';
import { saveImage } from '../utils/image-io.js';
import { getPreset, getPresetCustomColors } from './preset-registry.js';
import { getPaletteColors } from './palette-registry.js';

export interface PipelineConfig {
    input: string;
    output: string;
    preset?: string;
    mode?: 'bw' | 'color';
    algorithm?: string;
    palette?: string;
    colors?: number;
    colorComparison?: string;
    threshold?: number;
    brightness?: number;
    contrast?: number;
    saturation?: number;
    hueRotation?: number;
    pixelate?: number;
    blurBefore?: number;
    blurAfter?: number;
    sharpenBefore?: number;
    sharpenAfter?: number;
    customColors?: string[];
    blackColor?: string;
    whiteColor?: string;
}

function parseHexColor(hex: string | undefined, fallback: string): Uint8ClampedArray {
    const clean = (hex ?? fallback).replace('#', '');
    return createPixel(
        parseInt(clean.substring(0, 2), 16),
        parseInt(clean.substring(2, 4), 16),
        parseInt(clean.substring(4, 6), 16)
    );
}

function clampPercentage(value: number | undefined, fallback: number): number {
    if (typeof value !== 'number' || Number.isNaN(value)) {
        return fallback;
    }
    return value;
}

async function loadAndPreprocessImage(config: PipelineConfig): Promise<{
    pixels: Uint8ClampedArray;
    width: number;
    height: number;
}> {
    let image = sharp(config.input).ensureAlpha();

    const brightness = clampPercentage(config.brightness, 100);
    const saturation = clampPercentage(config.saturation, 100);
    const hueRotation = clampPercentage(config.hueRotation, 0);
    if (brightness !== 100 || saturation !== 100 || hueRotation !== 0) {
        image = image.modulate({
            brightness: brightness / 100,
            saturation: saturation / 100,
            hue: ((hueRotation % 360) + 360) % 360,
        });
    }

    const contrast = clampPercentage(config.contrast, 100);
    if (contrast !== 100) {
        image = image.linear(contrast / 100, -(128 * (contrast / 100)) + 128);
    }

    if (typeof config.blurBefore === 'number' && config.blurBefore > 0) {
        image = image.blur(config.blurBefore);
    }

    if (typeof config.sharpenBefore === 'number' && config.sharpenBefore > 0) {
        image = image.sharpen(config.sharpenBefore);
    }

    const metadata = await image.metadata();
    if (!metadata.width || !metadata.height) {
        throw new Error(`Cannot read image dimensions: ${config.input}`);
    }

    const raw = await image.raw().toBuffer();
    return {
        pixels: new Uint8ClampedArray(raw.buffer, raw.byteOffset, raw.length),
        width: metadata.width,
        height: metadata.height,
    };
}

async function postProcessAndSaveImage(
    pixels: Uint8ClampedArray,
    width: number,
    height: number,
    output: string,
    config: PipelineConfig
): Promise<void> {
    let image = sharp(Buffer.from(pixels.buffer, pixels.byteOffset, pixels.byteLength), {
        raw: { width, height, channels: 4 },
    });

    if (typeof config.blurAfter === 'number' && config.blurAfter > 0) {
        image = image.blur(config.blurAfter);
    }

    if (typeof config.sharpenAfter === 'number' && config.sharpenAfter > 0) {
        image = image.sharpen(config.sharpenAfter);
    }

    const raw = await image.raw().toBuffer();
    await saveImage(
        new Uint8ClampedArray(raw.buffer, raw.byteOffset, raw.length),
        width,
        height,
        output
    );
}

export function resolveConfig(config: PipelineConfig): DitherOptions {
    let mode: 'bw' | 'color' = config.mode ?? 'bw';
    let algorithm = config.algorithm ?? 'threshold';
    let threshold = config.threshold ?? 127;
    let colorComparison = config.colorComparison ?? 'rgb';
    let colors: ReturnType<typeof hexArrayToColors> | undefined;
    let blackColor = config.blackColor;
    let whiteColor = config.whiteColor;

    if (config.preset) {
        const preset = getPreset(config.preset);
        if (!preset) throw new Error(`Unknown preset: ${config.preset}`);

        mode = config.mode ?? preset.mode;
        algorithm = config.algorithm ?? preset.algorithm;
        threshold = config.threshold ?? preset.threshold ?? 127;
        colorComparison = config.colorComparison ?? preset.colorComparison ?? 'rgb';

        if (mode === 'color') {
            const customColors = getPresetCustomColors(preset);
            const numColors = config.colors ?? preset.colors ?? 8;

            if (config.customColors && config.customColors.length > 0) {
                colors = hexArrayToColors(config.customColors.slice(0, numColors));
            } else if (customColors) {
                colors = hexArrayToColors(customColors.slice(0, numColors));
            } else if (config.palette ?? preset.palette) {
                const palSlug = config.palette ?? preset.palette!;
                if (palSlug !== 'custom') {
                    const hexes = getPaletteColors(palSlug, numColors);
                    colors = hexArrayToColors(hexes);
                }
            }
        }
    } else if (mode === 'color') {
        const numColors = config.colors ?? 8;
        if (config.customColors && config.customColors.length > 0) {
            colors = hexArrayToColors(config.customColors.slice(0, numColors));
        } else if (config.palette) {
            const hexes = getPaletteColors(config.palette, numColors);
            colors = hexArrayToColors(hexes);
        }
    }

    return {
        mode,
        algorithmSlug: algorithm,
        threshold,
        colorComparisonSlug: colorComparison,
        colors,
        blackPixel: parseHexColor(blackColor, '#000000'),
        whitePixel: parseHexColor(whiteColor, '#ffffff'),
    };
}

export async function processImage(config: PipelineConfig): Promise<void> {
    const { pixels, width, height } = await loadAndPreprocessImage(config);
    const opts = resolveConfig(config);
    const result = ditherPixels(pixels, width, height, opts);
    await postProcessAndSaveImage(result.pixels, result.width, result.height, config.output, config);
}
