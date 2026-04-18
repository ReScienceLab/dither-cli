import { Command } from 'commander';
import { resolveConfig, type PipelineConfig, processImage } from '../core/pipeline.js';
import { Spinner, ProgressBar } from '../utils/spinner.js';
import { ffmpegAvailable, extractFrames, assembleVideo, getVideoFps } from '../utils/ffmpeg.js';
import path from 'path';
import { mkdirSync, readdirSync, rmSync } from 'fs';
import { tmpdir } from 'os';

export function registerVideoCommand(program: Command): void {
    program
        .command('video <input>')
        .description('Dither a video file (requires ffmpeg)')
        .requiredOption('-o, --output <path>', 'Output video path')
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
        .option('--fps <n>', 'Output FPS (default: source fps)', parseInt)
        .option('--concurrency <n>', 'Parallel frame workers', parseInt)
        .action(async (input: string, opts: any) => {
            if (!ffmpegAvailable()) {
                console.error('ffmpeg is required for video processing. Install: brew install ffmpeg');
                process.exit(1);
            }

            const workDir = path.join(tmpdir(), `dither-cli-${Date.now()}`);
            const framesDir = path.join(workDir, 'frames');
            const ditheredDir = path.join(workDir, 'dithered');
            mkdirSync(framesDir, { recursive: true });
            mkdirSync(ditheredDir, { recursive: true });

            const sourceFps = getVideoFps(input);
            const fps = opts.fps ?? sourceFps;

            const spinner = new Spinner('Extracting frames').start();
            await extractFrames(input, framesDir, fps);
            spinner.succeed('Frames extracted');

            const frames = readdirSync(framesDir).filter(f => f.endsWith('.png')).sort();
            const customColors = opts.customColors
                ? opts.customColors.split(',').map((c: string) => c.trim())
                : undefined;

            const pipelineConfig: PipelineConfig = {
                input: '',
                output: '',
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
            };
            resolveConfig(pipelineConfig);

            const progress = new ProgressBar('Dithering frames', frames.length);
            const concurrency = opts.concurrency ?? 4;
            const queue = [...frames];

            async function worker() {
                while (queue.length > 0) {
                    const frame = queue.shift()!;
                    const inputPath = path.join(framesDir, frame);
                    const outputPath = path.join(
                        ditheredDir,
                        frame.replace('frame_', 'dithered_')
                    );
                    await processImage({
                        ...pipelineConfig,
                        input: inputPath,
                        output: outputPath,
                    });
                    progress.tick();
                }
            }

            const workers = Array.from({ length: concurrency }, () => worker());
            await Promise.all(workers);
            progress.done();

            const assembleSpinner = new Spinner('Assembling video').start();
            await assembleVideo(ditheredDir, opts.output, fps);
            assembleSpinner.succeed(`Saved to ${opts.output}`);

            rmSync(workDir, { recursive: true, force: true });
        });
}
