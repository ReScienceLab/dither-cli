import { execFileSync, execFile } from 'child_process';

export function ffmpegAvailable(): boolean {
    try {
        execFileSync('ffmpeg', ['-version'], { stdio: 'ignore' });
        return true;
    } catch {
        return false;
    }
}

export function extractFrames(
    inputPath: string,
    outputDir: string,
    fps: number
): Promise<void> {
    return new Promise((resolve, reject) => {
        execFile(
            'ffmpeg',
            ['-i', inputPath, '-vf', `fps=${fps}`, `${outputDir}/frame_%06d.png`],
            { maxBuffer: 10 * 1024 * 1024 },
            (err) => (err ? reject(err) : resolve())
        );
    });
}

export function assembleVideo(
    framesDir: string,
    outputPath: string,
    fps: number
): Promise<void> {
    return new Promise((resolve, reject) => {
        execFile(
            'ffmpeg',
            [
                '-y',
                '-framerate', String(fps),
                '-i', `${framesDir}/dithered_%06d.png`,
                '-c:v', 'libx264',
                '-pix_fmt', 'yuv420p',
                outputPath,
            ],
            { maxBuffer: 10 * 1024 * 1024 },
            (err) => (err ? reject(err) : resolve())
        );
    });
}

export function getVideoFps(inputPath: string): number {
    try {
        const out = execFileSync('ffprobe', [
            '-v', 'error',
            '-select_streams', 'v:0',
            '-show_entries', 'stream=r_frame_rate',
            '-of', 'default=noprint_wrappers=1:nokey=1',
            inputPath,
        ]).toString().trim();
        const [num, den] = out.split('/').map(Number);
        return den ? Math.round(num / den) : 24;
    } catch {
        return 24;
    }
}
