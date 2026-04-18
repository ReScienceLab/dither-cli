import pc from 'picocolors';

const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
const isTTY = process.stderr.isTTY;

export class Spinner {
    private interval: ReturnType<typeof setInterval> | null = null;
    private frameIndex = 0;
    private text: string;

    constructor(text: string) {
        this.text = text;
    }

    start(): this {
        if (!isTTY) {
            process.stderr.write(`${this.text}\n`);
            return this;
        }
        this.interval = setInterval(() => {
            const frame = pc.cyan(frames[this.frameIndex % frames.length]);
            process.stderr.write(`\r${frame} ${this.text}`);
            this.frameIndex++;
        }, 80);
        return this;
    }

    update(text: string): void {
        this.text = text;
    }

    succeed(text?: string): void {
        this.stop();
        const msg = text ?? this.text;
        process.stderr.write(`\r${pc.green('✓')} ${msg}\n`);
    }

    fail(text?: string): void {
        this.stop();
        const msg = text ?? this.text;
        process.stderr.write(`\r${pc.red('✗')} ${msg}\n`);
    }

    private stop(): void {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
        if (isTTY) {
            process.stderr.write('\r\x1b[K');
        }
    }
}

export class ProgressBar {
    private label: string;
    private total: number;
    private current = 0;
    private startTime: number;
    private width: number;

    constructor(label: string, total: number, width = 30) {
        this.label = label;
        this.total = total;
        this.width = width;
        this.startTime = Date.now();
    }

    tick(n = 1): void {
        this.current = Math.min(this.current + n, this.total);
        this.render();
    }

    private render(): void {
        if (!isTTY) return;
        const pct = this.current / this.total;
        const filled = Math.round(pct * this.width);
        const empty = this.width - filled;
        const bar = pc.green('█'.repeat(filled)) + pc.gray('░'.repeat(empty));
        const elapsed = (Date.now() - this.startTime) / 1000;
        const eta = pct > 0 ? ((elapsed / pct) * (1 - pct)).toFixed(0) : '?';
        process.stderr.write(
            `\r${this.label} ${bar} ${(pct * 100).toFixed(0)}% | ${this.current}/${this.total} | ETA ${eta}s`
        );
    }

    done(): void {
        if (isTTY) {
            process.stderr.write('\n');
        }
    }
}
