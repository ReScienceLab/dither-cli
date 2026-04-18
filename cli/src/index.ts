import { Command } from 'commander';
import { registerApplyCommand } from './commands/apply.js';
import { registerBatchCommand } from './commands/batch.js';
import { registerVideoCommand } from './commands/video.js';
import { registerInfoCommand } from './commands/info.js';
import { registerPresetCommand } from './commands/preset.js';
import { registerPaletteCommand } from './commands/palette.js';

const program = new Command();

program
    .name('dither')
    .description('Agent-native image dithering CLI — powered by dithermark')
    .version('0.1.0');

registerApplyCommand(program);
registerBatchCommand(program);
registerVideoCommand(program);
registerInfoCommand(program);
registerPresetCommand(program);
registerPaletteCommand(program);

program.parse();
