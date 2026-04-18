export interface Preset {
    name: string;
    description: string;
    mode: 'bw' | 'color';
    algorithm: string;
    palette?: string;
    colors?: number;
    colorComparison?: string;
    threshold?: number;
    blackHex?: string;
    whiteHex?: string;
    filters?: {
        brightness?: number;
        contrast?: number;
        saturation?: number;
        pixelate?: number;
    };
}

const presets: Preset[] = [
    {
        name: 'gameboy',
        description: 'Classic Game Boy green palette, Bayer 4x4',
        mode: 'color',
        algorithm: 'ordered--bayer-4',
        palette: 'custom',
        colors: 4,
        colorComparison: 'luma',
        filters: { saturation: 0, contrast: 110, pixelate: 3 },
    },
    {
        name: 'mac-classic',
        description: 'Macintosh classic 1-bit, Atkinson dithering',
        mode: 'bw',
        algorithm: 'atkinson',
        threshold: 127,
        filters: { contrast: 120 },
    },
    {
        name: 'c64',
        description: 'Commodore 64 palette, Floyd-Steinberg',
        mode: 'color',
        algorithm: 'floyd-steinberg',
        palette: 'custom',
        colors: 16,
        colorComparison: 'rgb',
    },
    {
        name: 'gameboy-pocket',
        description: 'Game Boy Pocket grayscale, Bayer 8x8',
        mode: 'color',
        algorithm: 'ordered--bayer-8',
        palette: 'monochrome',
        colors: 4,
        colorComparison: 'lightness',
        filters: { saturation: 0 },
    },
    {
        name: 'comic-book',
        description: 'Halftone dots with limited palette',
        mode: 'color',
        algorithm: 'ordered--halftone-8',
        palette: 'primaries',
        colors: 6,
        colorComparison: 'rgb',
        filters: { contrast: 130 },
    },
    {
        name: 'newsprint',
        description: 'Black & white halftone newspaper',
        mode: 'bw',
        algorithm: 'ordered--halftone-8',
        threshold: 127,
        filters: { contrast: 140 },
    },
    {
        name: 'zx-spectrum',
        description: 'ZX Spectrum 8-color palette, Bayer 2x2',
        mode: 'color',
        algorithm: 'ordered--bayer-2',
        palette: 'custom',
        colors: 8,
        colorComparison: 'rgb',
    },
    {
        name: 'risograph',
        description: 'Risograph 3-color spot print look',
        mode: 'color',
        algorithm: 'ordered--dot-8',
        palette: 'custom',
        colors: 3,
        colorComparison: 'oklab',
        filters: { contrast: 115 },
    },
    {
        name: 'thermal-print',
        description: 'Thermal receipt printer, horizontal hatch BW',
        mode: 'bw',
        algorithm: 'ordered--hatchHorizontal-4',
        threshold: 140,
        filters: { contrast: 130 },
    },
    {
        name: 'neon',
        description: 'Vibrant neon palette, Floyd-Steinberg',
        mode: 'color',
        algorithm: 'floyd-steinberg',
        palette: 'neon',
        colors: 8,
        colorComparison: 'oklab',
    },
];

const GAMEBOY_GREEN = ['#0f380f', '#306230', '#8bac0f', '#9bbc0f'];
const C64_PALETTE = [
    '#000000', '#ffffff', '#880000', '#aaffee',
    '#cc44cc', '#00cc55', '#0000aa', '#eeee77',
    '#dd8855', '#664400', '#ff7777', '#333333',
    '#777777', '#aaff66', '#0088ff', '#bbbbbb',
];
const ZX_PALETTE = [
    '#000000', '#0000d7', '#d70000', '#d700d7',
    '#00d700', '#00d7d7', '#d7d700', '#d7d7d7',
];
const RISO_PALETTE = ['#000000', '#e45050', '#006bb6'];

export function getPreset(name: string): Preset | undefined {
    return presets.find(p => p.name === name);
}

export function listPresets(): Preset[] {
    return presets;
}

export function getPresetCustomColors(preset: Preset): string[] | undefined {
    switch (preset.name) {
        case 'gameboy': return GAMEBOY_GREEN;
        case 'c64': return C64_PALETTE;
        case 'zx-spectrum': return ZX_PALETTE;
        case 'risograph': return RISO_PALETTE;
        default: return undefined;
    }
}
