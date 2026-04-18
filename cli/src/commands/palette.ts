import { Command } from 'commander';
import { listPalettes, getPalette } from '../core/palette-registry.js';
import pc from 'picocolors';

export function registerPaletteCommand(program: Command): void {
    const palette = program
        .command('palette')
        .description('Manage and inspect color palettes');

    palette
        .command('list')
        .description('List all built-in palettes')
        .action(() => {
            console.log(pc.bold('\nBuilt-in Color Palettes:'));
            for (const p of listPalettes()) {
                console.log(`  ${pc.cyan(p.slug.padEnd(20))} ${p.title.padEnd(20)} (${p.colors.length} colors)`);
            }
        });

    palette
        .command('preview <slug>')
        .description('Preview a palette with color swatches')
        .action((slug: string) => {
            const p = getPalette(slug);
            if (!p) {
                console.error(`Unknown palette: ${slug}`);
                process.exit(1);
            }
            console.log(pc.bold(`\n${p.title} (${p.colors.length} colors):`));
            for (let i = 0; i < p.colors.length; i++) {
                const hex = p.colors[i];
                const idx = String(i + 1).padStart(2, ' ');
                console.log(`  ${idx}. ${hex}  ██`);
            }
        });

    palette
        .command('export <slug>')
        .description('Export palette colors')
        .option('-o, --output <path>', 'Output file path')
        .option('--format <fmt>', 'Format: hex, csv, json', 'hex')
        .action(async (slug: string, opts: any) => {
            const p = getPalette(slug);
            if (!p) {
                console.error(`Unknown palette: ${slug}`);
                process.exit(1);
            }

            let content: string;
            switch (opts.format) {
                case 'csv':
                    content = p.colors.join(',');
                    break;
                case 'json':
                    content = JSON.stringify({ name: p.title, colors: p.colors }, null, 2);
                    break;
                default:
                    content = p.colors.join('\n');
            }

            if (opts.output) {
                const { writeFileSync } = await import('fs');
                writeFileSync(opts.output, content + '\n');
                console.log(`Exported to ${opts.output}`);
            } else {
                console.log(content);
            }
        });
}
