// @ts-ignore
import Pica from 'pica';
import imageCompression from 'browser-image-compression';
import { CropBox } from '../App';

export interface ProcessImageOptions {
    file: File;
    targetWidth: number;
    targetHeight: number;
    format: string; // 'original', 'jpg', 'png', 'webp'
    quality: number; // 0-100
    sharpenAmount: number; // 0-100
    isCropEnabled: boolean;
    targetFileSize?: number; // in MB
    cropBox?: CropBox | null; // Custom crop coordinates
}

export async function processImage(options: ProcessImageOptions): Promise<Blob> {
    const { file, targetWidth, targetHeight, format, quality, sharpenAmount, isCropEnabled, targetFileSize, cropBox } = options;
    const pica = new Pica();

    // 1. Load Image
    const img = await createImageBitmap(file);

    // 2. Setup Canvases
    const targetCanvas = document.createElement('canvas');
    targetCanvas.width = targetWidth;
    targetCanvas.height = targetHeight;

    if (cropBox) {
        // --- CUSTOM CROP ---
        const sx = cropBox.x * img.width;
        const sy = cropBox.y * img.height;
        const sw = cropBox.width * img.width;
        const sh = cropBox.height * img.height;

        const sourceCanvas = document.createElement('canvas');
        sourceCanvas.width = sw;
        sourceCanvas.height = sh;
        sourceCanvas.getContext('2d')?.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);

        await pica.resize(sourceCanvas, targetCanvas, {
            unsharpAmount: sharpenAmount > 0 ? (sharpenAmount * 1.5) : 0,
            unsharpRadius: 0.6,
            unsharpThreshold: 2
        });
    } else if (isCropEnabled) {
        // --- AUTO-CENTER CROP ---
        const sourceAspect = img.width / img.height;
        const targetAspect = targetWidth / targetHeight;

        let sx = 0, sy = 0, sw = img.width, sh = img.height;

        if (sourceAspect > targetAspect) {
            sw = img.height * targetAspect;
            sx = (img.width - sw) / 2;
        } else {
            sh = img.width / targetAspect;
            sy = (img.height - sh) / 2;
        }

        const sourceCanvas = document.createElement('canvas');
        sourceCanvas.width = sw;
        sourceCanvas.height = sh;
        sourceCanvas.getContext('2d')?.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);

        await pica.resize(sourceCanvas, targetCanvas, {
            unsharpAmount: sharpenAmount > 0 ? (sharpenAmount * 1.5) : 0,
            unsharpRadius: 0.6,
            unsharpThreshold: 2
        });
    } else {
        // --- OFF (LETTERBOX / FIT) ---
        const sourceAspect = img.width / img.height;
        const targetAspect = targetWidth / targetHeight;

        let dx = 0, dy = 0, dw = targetWidth, dh = targetHeight;

        if (sourceAspect > targetAspect) {
            dh = targetWidth / sourceAspect;
            dy = (targetHeight - dh) / 2;
        } else {
            dw = targetHeight * sourceAspect;
            dx = (targetWidth - dw) / 2;
        }

        const sourceCanvas = document.createElement('canvas');
        sourceCanvas.width = img.width;
        sourceCanvas.height = img.height;
        sourceCanvas.getContext('2d')?.drawImage(img, 0, 0);

        const scaledCanvas = document.createElement('canvas');
        scaledCanvas.width = dw;
        scaledCanvas.height = dh;

        await pica.resize(sourceCanvas, scaledCanvas, {
            unsharpAmount: sharpenAmount > 0 ? (sharpenAmount * 1.5) : 0,
            unsharpRadius: 0.6,
            unsharpThreshold: 2
        });

        const targetCtx = targetCanvas.getContext('2d');
        if (targetCtx) {
            targetCtx.fillStyle = 'black';
            targetCtx.fillRect(0, 0, targetWidth, targetHeight);
            targetCtx.drawImage(scaledCanvas, dx, dy);
        }
    }

    // 4. Determine Output Format
    let outputMime = file.type;
    if (format !== 'original') {
        outputMime = `image/${format}`;
    }
    if (format === 'jpg') outputMime = 'image/jpeg';


    // 5. Compress / Export
    if (targetFileSize && targetFileSize > 0) {
        // Advanced Compression
        const blob = await pica.toBlob(targetCanvas, outputMime, quality / 100);
        const options = {
            maxSizeMB: targetFileSize,
            maxWidthOrHeight: Math.max(targetWidth, targetHeight),
            useWebWorker: true,
            fileType: outputMime
        };
        try {
            // browser-image-compression requires a File object, so we convert the blob
            const tempFile = new File([blob], file.name, { type: outputMime });
            return await imageCompression(tempFile, options);
        } catch (error) {
            console.warn('Compression failed, falling back to Pica export', error);
            return blob;
        }
    } else {
        // Standard Export
        return await pica.toBlob(targetCanvas, outputMime, quality / 100);
    }
}
