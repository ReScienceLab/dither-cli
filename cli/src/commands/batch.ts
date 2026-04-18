import { Command } from 'commander';
import { processImage } from '../core/pipeline.js';
import { ProgressBar } from '../utils/spinner.js';
import fg from 'fast-glob';
import path from 'path';
import { mkdirSync } from 'fs';
import os from 'os';

export function registerBatchCommand(program: Command): void {
    program
        .command('batch <pattern>')
        .description('Batch dither images matching a glob pattern')
        .requiredOption('-o, --output <dir>', 'Output directory')
        .option('--preset <name>', 'Use a built-in preset')
        .option('--mode <mode>', 'Dither mode: bw or color', 'bw')
        .option('--algorithm <slug>', 'Dither algorithm slug')
        .option('--palette <slug>', 'Color palette slug')
        .option('--colors <n>', 'Number of colors', parseInt)
        .option('--color-comparison <slug>', 'Color comparison method')
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
        .option('--concurrency <n>', 'Parallel workers', parseInt)
        .option('--format <ext>', 'Output format (png, jpg, webp)', 'png')
        .action(async (pattern: string, opts: any) => {
            const files = await fg(pattern);
            if (files.length === 0) {
                console.error('No files matched the pattern.');
                process.exit(1);
            }

            mkdirSync(opts.output, { recursive: true });

            const concurrency = opts.concurrency ?? Math.min(os.cpus().length, 4);
            const progress = new ProgressBar('Dithering', files.length);
            const customColors = opts.customColors
                ? opts.customColors.split(',').map((c: string) => c.trim())
                : undefined;

            let failed = 0;
            const queue = [...files];

            async function worker() {
                while (queue.length > 0) {
                    const file = queue.shift()!;
                    const base = path.basename(file, path.extname(file));
                    const output = path.join(opts.output, `${base}.${opts.format}`);
                    try {
                        await processImage({
                            input: file,
                            output,
                            preset: opts.preset,
                            mode: opts.mode,
                            algorithm: opts.algorithm,
                            palette: opts.palette,
                            colors: opts.colors,
                            colorComparison: opts.colorComparison,
                            threshold: opts.threshold,
                            brightness: opts.brightness,
                            contrast: opts.contrast,
                            saturation: opts.saturation,
                            hueRotation: opts.hueRotation,
                            pixelate: opts.pixelate,
                            blurBefore: opts.blurBefore,
                            blurAfter: opts.blurAfter,
                            sharpenBefore: opts.sharpenBefore,
                            sharpenAfter: opts.sharpenAfter,
                            blackColor: opts.blackColor,
                            whiteColor: opts.whiteColor,
                            customColors,
                        });
                    } catch {
                        failed++;
                    }
                    progress.tick();
                }
            }

            const workers = Array.from({ length: concurrency }, () => worker());
            await Promise.all(workers);
            progress.done();

            console.log(
                `Done: ${files.length - failed}/${files.length} images processed.`
            );
            if (failed > 0) process.exit(1);
        });
}
