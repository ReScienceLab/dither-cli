import { createPixel as createVendorPixel } from '../vendor/dithermark/js/shared/pixel.js';
import ColorDitherModes from '../vendor/dithermark/js/shared/color-dither-modes.js';
import {
    getBwAlgorithms,
    getColorAlgorithms,
} from '../vendor/dithermark/js/shared/models/dither-algorithms.js';
import {
    getBwDitherAlgorithms,
    getColorDitherAlgorithms,
} from '../vendor/dithermark/js/worker/models/dither-algorithms.js';

type DitherMode = 'bw' | 'color';
type BwAlgorithm = (
    pixels: Uint8ClampedArray,
    width: number,
    height: number,
    threshold: number,
    blackPixel: Uint8Array,
    whitePixel: Uint8Array
) => Uint8ClampedArray | void;
type ColorAlgorithm = (
    pixels: Uint8ClampedArray,
    width: number,
    height: number,
    colorDitherModeId: number,
    colors: Uint8Array[]
) => Uint8ClampedArray | void;

const bwModels = getBwAlgorithms();
const colorModels = getColorAlgorithms();
const bwImplementations = getBwDitherAlgorithms();
const colorImplementations = getColorDitherAlgorithms();

const UNSUPPORTED_COLOR_ALGORITHMS = new Set(['--y2']);

const BW_ALGORITHMS = bwModels.map((model, index) => ({
    slug: model.slug,
    title: model.title,
    algorithm: bwImplementations[index]?.algorithm as BwAlgorithm,
}));

const COLOR_ALGORITHMS = colorModels.map((model, index) => ({
    slug: model.slug,
    title: model.title,
    algorithm: colorImplementations[index]?.algorithm as ColorAlgorithm,
})).filter((item) => !Array.from(UNSUPPORTED_COLOR_ALGORITHMS).some((suffix) => item.slug.endsWith(suffix)));

const COLOR_MODE_SLUG_TO_ID: Record<string, number> = {
    rgb: ColorDitherModes.get('RGB').id,
    hsl: ColorDitherModes.get('HSL_WEIGHTED').id,
    'weighted-hsl': ColorDitherModes.get('HSL_WEIGHTED').id,
    'hue-lightness': ColorDitherModes.get('HUE_LIGHTNESS').id,
    lightness: ColorDitherModes.get('LIGHTNESS').id,
    hue: ColorDitherModes.get('HUE').id,
    luma: ColorDitherModes.get('LUMA').id,
    oklab: ColorDitherModes.get('OKLAB').id,
    'oklab-taxi': ColorDitherModes.get('OKLAB_TAXI').id,
    'cie-xyz': ColorDitherModes.get('CIE_XYZ').id,
    'cie-lab': ColorDitherModes.get('CIE_LAB').id,
    'cie-lab-taxi': ColorDitherModes.get('CIE_LAB_TAXI').id,
};

function defaultColorModeId(): number {
    return ColorDitherModes.get('RGB').id;
}

function getColorModeId(slug?: string): number {
    if (!slug) {
        return defaultColorModeId();
    }
    return COLOR_MODE_SLUG_TO_ID[slug] ?? defaultColorModeId();
}

export interface DitherOptions {
    mode: DitherMode;
    algorithmSlug: string;
    threshold?: number;
    blackPixel?: Uint8ClampedArray;
    whitePixel?: Uint8ClampedArray;
    colors?: Uint8ClampedArray[];
    colorComparisonSlug?: string;
}

export function ditherPixels(
    inputPixels: Uint8ClampedArray,
    width: number,
    height: number,
    options: DitherOptions
): { pixels: Uint8ClampedArray; width: number; height: number } {
    const pixels = new Uint8ClampedArray(inputPixels);

    if (options.mode === 'bw') {
        const entry = BW_ALGORITHMS.find((item) => item.slug === options.algorithmSlug);
        if (!entry?.algorithm) {
            throw new Error(`Unknown BW algorithm: ${options.algorithmSlug}`);
        }
        const black = options.blackPixel ?? createPixel(0, 0, 0);
        const white = options.whitePixel ?? createPixel(255, 255, 255);
        entry.algorithm(pixels, width, height, options.threshold ?? 127, black, white);
        return { pixels, width, height };
    }

    const entry = COLOR_ALGORITHMS.find((item) => item.slug === options.algorithmSlug);
    if (!entry?.algorithm) {
        throw new Error(`Unknown color algorithm: ${options.algorithmSlug}`);
    }
    if (!options.colors?.length) {
        throw new Error('Color dithering requires a palette');
    }

    entry.algorithm(
        pixels,
        width,
        height,
        getColorModeId(options.colorComparisonSlug),
        options.colors as unknown as Uint8Array[]
    );

    return { pixels, width, height };
}

export function hexArrayToColors(hexes: string[]): Uint8ClampedArray[] {
    return hexes.map((hex) => {
        const clean = hex.replace('#', '');
        return createPixel(
            parseInt(clean.substring(0, 2), 16),
            parseInt(clean.substring(2, 4), 16),
            parseInt(clean.substring(4, 6), 16)
        );
    });
}

export function listBwAlgorithms(): { slug: string; title: string }[] {
    return BW_ALGORITHMS.map(({ slug, title }) => ({ slug, title }));
}

export function listColorAlgorithms(): { slug: string; title: string }[] {
    return COLOR_ALGORITHMS.map(({ slug, title }) => ({ slug, title }));
}

export function listColorComparisons(): { slug: string; title: string }[] {
    return [
        { slug: 'rgb', title: 'RGB' },
        { slug: 'weighted-hsl', title: 'Weighted HSL' },
        { slug: 'hue-lightness', title: 'Hue & Lightness' },
        { slug: 'lightness', title: 'Lightness' },
        { slug: 'hue', title: 'Hue' },
        { slug: 'luma', title: 'Luma' },
        { slug: 'oklab', title: 'Oklab' },
        { slug: 'oklab-taxi', title: 'Oklab (taxi)' },
        { slug: 'cie-xyz', title: 'CIE XYZ' },
        { slug: 'cie-lab', title: 'CIE Lab' },
        { slug: 'cie-lab-taxi', title: 'CIE Lab (taxi)' },
    ];
}

export function createPixel(r: number, g: number, b: number, a = 255): Uint8ClampedArray {
    return createVendorPixel(r, g, b, a) as Uint8ClampedArray;
}
