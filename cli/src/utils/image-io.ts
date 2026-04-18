import sharp from 'sharp';

export async function loadImage(path: string): Promise<{
    pixels: Uint8ClampedArray;
    width: number;
    height: number;
}> {
    const image = sharp(path).ensureAlpha();
    const { width, height } = await image.metadata();
    if (!width || !height) throw new Error(`Cannot read image dimensions: ${path}`);
    const raw = await image.raw().toBuffer();
    return {
        pixels: new Uint8ClampedArray(raw.buffer, raw.byteOffset, raw.length),
        width,
        height,
    };
}

export async function saveImage(
    pixels: Uint8ClampedArray,
    width: number,
    height: number,
    outputPath: string
): Promise<void> {
    const ext = outputPath.split('.').pop()?.toLowerCase() ?? 'png';
    let img = sharp(Buffer.from(pixels.buffer, pixels.byteOffset, pixels.byteLength), {
        raw: { width, height, channels: 4 },
    });

    switch (ext) {
        case 'jpg':
        case 'jpeg':
            img = img.jpeg({ quality: 95 });
            break;
        case 'webp':
            img = img.webp({ lossless: true });
            break;
        default:
            img = img.png();
            break;
    }

    await img.toFile(outputPath);
}
