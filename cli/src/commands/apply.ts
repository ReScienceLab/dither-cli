import { Command } from 'commander';
import { processImage } from '../core/pipeline.js';
import { Spinner } from '../utils/spinner.js';
import path from 'path';

export function registerApplyCommand(program: Command): void {
    program
        .command('apply <input>')
        .description('Dither a single image')
        .option('-o, --output <path>', 'Output file path')
        .option('--preset <name>', 'Use a built-in preset')
        .option('--mode <mode>', 'Dither mode: bw or color', 'bw')
        .option('--algorithm <slug>', 'Dither algorithm slug')
        .option('--palette <slug>', 'Color palette slug')
        .option('--colors <n>', 'Number of colors', parseInt)
        .option('--color-comparison <slug>', 'Color comparison method (rgb, weighted-hsl, hue-lightness, lightness, hue, luma, oklab, oklab-taxi, cie-xyz, cie-lab, cie-lab-taxi)')
        .option('--threshold <n>', 'BW threshold (0-255)', parseInt)
        .option('--brightness <n>', 'Brightness percentage', parseInt)
        .option('--contrast <n>', 'Contrast percentage', parseInt)
        .option('--saturation <n>', 'Saturation percentage', parseInt)
        .option('--hue-rotation <n>', 'Hue rotation in degrees', parseFloat)
        .option('--pixelate <n>', 'Pixelation factor', parseInt)
        .option('--blur-before <n>', 'Blur radius before dithering', parseFloat)
        .option('--blur-after <n>', 'Blur radius after dithering', parseFloat)
        .option('--sharpen-before <n>', 'Sharpen amount before dithering', parseFloat)
        .option('--sharpen-after <n>', 'Sharpen amount after dithering', parseFloat)
        .option('--black-color <hex>', 'BW black replacement color')
        .option('--white-color <hex>', 'BW white replacement color')
        .option('--custom-colors <hexes>', 'Comma-separated hex colors')
        .option('--config <path>', 'JSON config file')
        .action(async (input: string, opts: any) => {
            let config: any = {};
            if (opts.config) {
                const { readFileSync } = await import('fs');
                config = JSON.parse(readFileSync(opts.config, 'utf-8'));
            }

            const ext = path.extname(input) || '.png';
            const base = path.basename(input, ext);
            const output = opts.output ?? `${base}-dithered${ext}`;

            const customColors = opts.customColors
                ? opts.customColors.split(',').map((c: string) => c.trim())
                : config.customColors;

            const spinner = new Spinner(`Dithering ${path.basename(input)}`).start();

            try {
                await processImage({
                    input,
                    output,
                    preset: opts.preset ?? config.name,
                    mode: opts.mode !== 'bw' ? opts.mode : (config.mode ?? opts.mode),
                    algorithm: opts.algorithm ?? config.algorithm,
                    palette: opts.palette ?? config.palette,
                    colors: opts.colors ?? config.colors,
                    colorComparison: opts.colorComparison ?? config.colorComparison,
                    threshold: opts.threshold ?? config.threshold,
                    brightness: opts.brightness ?? config.filters?.brightness ?? config.brightness,
                    contrast: opts.contrast ?? config.filters?.contrast ?? config.contrast,
                    saturation: opts.saturation ?? config.filters?.saturation ?? config.saturation,
                    hueRotation: opts.hueRotation ?? config.filters?.hueRotation ?? config.hueRotation,
                    pixelate: opts.pixelate ?? config.filters?.pixelate ?? config.pixelate,
                    blurBefore: opts.blurBefore ?? config.filters?.blurBefore ?? config.blurBefore,
                    blurAfter: opts.blurAfter ?? config.filters?.blurAfter ?? config.blurAfter,
                    sharpenBefore: opts.sharpenBefore ?? config.filters?.sharpenBefore ?? config.sharpenBefore,
                    sharpenAfter: opts.sharpenAfter ?? config.filters?.sharpenAfter ?? config.sharpenAfter,
                    blackColor: opts.blackColor ?? config.blackColor,
                    whiteColor: opts.whiteColor ?? config.whiteColor,
                    customColors,
                });
                spinner.succeed(`Saved to ${output}`);
            } catch (e: any) {
                spinner.fail(e.message);
                process.exit(1);
            }
        });
}
