import { Command } from 'commander';
import { listBwAlgorithms, listColorAlgorithms, listColorComparisons } from '../core/dither-engine.js';
import { listPalettes } from '../core/palette-registry.js';
import pc from 'picocolors';

export function registerInfoCommand(program: Command): void {
    const info = program
        .command('info')
        .description('List available algorithms, palettes, and color comparisons');

    info.command('algorithms')
        .description('List all dither algorithms')
        .option('--bw', 'Show only BW algorithms')
        .option('--color', 'Show only color algorithms')
        .action((opts: any) => {
            if (!opts.color) {
                console.log(pc.bold('\nBW Dither Algorithms:'));
                const bw = listBwAlgorithms();
                for (const a of bw) {
                    console.log(`  ${pc.cyan(a.slug.padEnd(40))} ${a.title}`);
                }
            }
            if (!opts.bw) {
                console.log(pc.bold('\nColor Dither Algorithms:'));
                const color = listColorAlgorithms();
                for (const a of color) {
                    console.log(`  ${pc.cyan(a.slug.padEnd(40))} ${a.title}`);
                }
            }
        });

    info.command('palettes')
        .description('List all built-in color palettes')
        .action(() => {
            console.log(pc.bold('\nBuilt-in Palettes:'));
            for (const p of listPalettes()) {
                const colorCount = p.colors.length;
                console.log(`  ${pc.cyan(p.slug.padEnd(20))} ${p.title.padEnd(20)} (${colorCount} colors)`);
            }
        });

    info.command('color-comparisons')
        .description('List color comparison methods')
        .action(() => {
            console.log(pc.bold('\nColor Comparison Methods:'));
            for (const c of listColorComparisons()) {
                console.log(`  ${pc.cyan(c.slug.padEnd(20))} ${c.title}`);
            }
        });
}
