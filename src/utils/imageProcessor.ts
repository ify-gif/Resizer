// @ts-ignore
import Pica from 'pica';
import imageCompression from 'browser-image-compression';

export interface ProcessImageOptions {
    file: File;
    targetWidth: number;
    targetHeight: number;
    format: string; // 'original', 'jpg', 'png', 'webp'
    quality: number; // 0-100
    sharpenAmount: number; // 0-100
    isCropEnabled: boolean;
    targetFileSize?: number; // in MB
}

export async function processImage(options: ProcessImageOptions): Promise<Blob> {
    const { file, targetWidth, targetHeight, format, quality, sharpenAmount, isCropEnabled, targetFileSize } = options;
    const pica = new Pica();

    // 1. Load Image
    const img = await createImageBitmap(file);

    // 2. Calculate Dimensions & Crop
    // Logic mirrored from PreviewPanel.tsx
    const sourceCanvas = document.createElement('canvas');
    const sourceCtx = sourceCanvas.getContext('2d');

    if (!sourceCtx) throw new Error('Canvas context not available');

    if (isCropEnabled) {
        // Auto-Center Crop
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

        sourceCanvas.width = sw;
        sourceCanvas.height = sh;
        sourceCtx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
    } else {
        // Fit logic
        sourceCanvas.width = img.width;
        sourceCanvas.height = img.height;
        sourceCtx.drawImage(img, 0, 0);
    }

    // 3. Resize with Pica (Lanczos3)
    const targetCanvas = document.createElement('canvas');
    targetCanvas.width = targetWidth;
    targetCanvas.height = targetHeight;

    // Apply Pica resize with unsharp mask
    await pica.resize(sourceCanvas, targetCanvas, {
        unsharpAmount: sharpenAmount > 0 ? (sharpenAmount * 1.5) : 0,
        unsharpRadius: 0.6,
        unsharpThreshold: 2
    });

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
