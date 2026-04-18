import { Command } from 'commander';
import { listPresets, getPreset, getPresetCustomColors } from '../core/preset-registry.js';
import pc from 'picocolors';

export function registerPresetCommand(program: Command): void {
    const preset = program
        .command('preset')
        .description('Manage and inspect presets');

    preset
        .command('list')
        .description('List all built-in presets')
        .action(() => {
            console.log(pc.bold('\nBuilt-in Presets:'));
            for (const p of listPresets()) {
                const mode = p.mode === 'bw' ? pc.gray('BW') : pc.magenta('Color');
                console.log(`  ${pc.cyan(p.name.padEnd(20))} ${mode}  ${p.description}`);
            }
            console.log(`\nUsage: ${pc.green('dither apply photo.jpg --preset gameboy -o out.png')}`);
        });

    preset
        .command('inspect <name>')
        .description('Show details of a preset')
        .action((name: string) => {
            const p = getPreset(name);
            if (!p) {
                console.error(`Unknown preset: ${name}`);
                process.exit(1);
            }
            console.log(pc.bold(`\nPreset: ${p.name}`));
            console.log(`  Description: ${p.description}`);
            console.log(`  Mode: ${p.mode}`);
            console.log(`  Algorithm: ${p.algorithm}`);
            if (p.palette) console.log(`  Palette: ${p.palette}`);
            if (p.colors) console.log(`  Colors: ${p.colors}`);
            if (p.colorComparison) console.log(`  Color Comparison: ${p.colorComparison}`);
            if (p.threshold) console.log(`  Threshold: ${p.threshold}`);
            if (p.filters) {
                console.log(`  Filters:`);
                if (p.filters.brightness) console.log(`    Brightness: ${p.filters.brightness}%`);
                if (p.filters.contrast) console.log(`    Contrast: ${p.filters.contrast}%`);
                if (p.filters.saturation !== undefined) console.log(`    Saturation: ${p.filters.saturation}%`);
                if (p.filters.pixelate) console.log(`    Pixelate: ${p.filters.pixelate}x`);
            }
            const custom = getPresetCustomColors(p);
            if (custom) {
                console.log(`  Custom Colors: ${custom.join(', ')}`);
            }
        });
}
