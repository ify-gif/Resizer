import { useState, useEffect, useRef } from 'react';
import { ImageData, AVPreset } from '../App';
// @ts-ignore
import Pica from 'pica';
import imageCompression from 'browser-image-compression';

interface PreviewPanelProps {
  images: ImageData[];
  selectedPreset: AVPreset | null;
  quality: number;
  customWidth: number;
  customHeight: number;
  activeTab: 'presets' | 'custom' | 'batch';
  outputFormat: string;
  targetFileSize: number;
  fileSizeUnit: 'KB' | 'MB';
}

export default function PreviewPanel({
  images,
  selectedPreset,
  quality,
  customWidth,
  customHeight,
  activeTab,
  outputFormat,
  targetFileSize,
  fileSizeUnit
}: PreviewPanelProps) {
  const [zoomMode, setZoomMode] = useState<'fit' | 'actual'>('fit');
  const [resizedPreview, setResizedPreview] = useState<string | null>(null);
  const [resizedSize, setResizedSize] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const currentImage = images.length > 0 ? images[0] : null;
  const pica = new Pica();

  const targetWidth = activeTab === 'presets' ? selectedPreset?.width : customWidth;
  const targetHeight = activeTab === 'presets' ? selectedPreset?.height : customHeight;

  useEffect(() => {
    if (!currentImage || !targetWidth || !targetHeight) {
      setResizedPreview(null);
      return;
    }

    resizeImage();
  }, [currentImage, targetWidth, targetHeight, quality, outputFormat]);

  const resizeImage = async () => {
    if (!currentImage || !targetWidth || !targetHeight) return;

    setIsProcessing(true);

    try {
      const img = new Image();
      img.src = currentImage.preview;

      await new Promise((resolve) => {
        img.onload = resolve;
      });

      const sourceCanvas = document.createElement('canvas');
      sourceCanvas.width = img.width;
      sourceCanvas.height = img.height;
      const sourceCtx = sourceCanvas.getContext('2d');
      sourceCtx?.drawImage(img, 0, 0);

      const destCanvas = document.createElement('canvas');
      destCanvas.width = targetWidth;
      destCanvas.height = targetHeight;

      await pica.resize(sourceCanvas, destCanvas, {
        quality: 3,
        alpha: true,
        unsharpAmount: 80,
        unsharpRadius: 0.6,
        unsharpThreshold: 2
      });

      const mimeType = getMimeType();
      const qualityValue = quality / 100;

      destCanvas.toBlob(
        async (blob) => {
          if (blob) {
            let finalBlob = blob;

            if (targetFileSize > 0 && (mimeType === 'image/jpeg' || mimeType === 'image/jpg')) {
              const maxSizeInBytes =
                fileSizeUnit === 'MB' ? targetFileSize * 1024 * 1024 : targetFileSize * 1024;

              if (blob.size > maxSizeInBytes) {
                try {
                  const options = {
                    maxSizeMB: maxSizeInBytes / (1024 * 1024),
                    useWebWorker: true,
                    maxIteration: 10
                  };

                  const file = new File([blob], 'temp.jpg', { type: mimeType });
                  const compressedBlob = await imageCompression(file, options);
                  finalBlob = compressedBlob;
                } catch (error) {
                  console.error('Compression error:', error);
                }
              }
            }

            const url = URL.createObjectURL(finalBlob);
            setResizedPreview(url);
            setResizedSize(finalBlob.size);
            setIsProcessing(false);
          }
        },
        mimeType,
        qualityValue
      );
    } catch (error) {
      console.error('Resize error:', error);
      setIsProcessing(false);
    }
  };

  const getMimeType = (): string => {
    if (outputFormat === 'original') {
      return currentImage?.file.type || 'image/jpeg';
    }

    const formatMap: { [key: string]: string } = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      webp: 'image/webp'
    };

    return formatMap[outputFormat.toLowerCase()] || 'image/jpeg';
  };

  const getFileExtension = (): string => {
    if (outputFormat === 'original') {
      const originalType = currentImage?.file.type || 'image/jpeg';
      return originalType.split('/')[1] || 'jpg';
    }
    return outputFormat.toLowerCase();
  };

  const handleDownload = () => {
    if (!resizedPreview || !currentImage) return;

    const link = document.createElement('a');
    link.href = resizedPreview;

    const originalName = currentImage.file.name.split('.')[0];
    const extension = getFileExtension();
    const suffix = activeTab === 'presets' && selectedPreset
      ? `_${selectedPreset.id}`
      : `_${targetWidth}x${targetHeight}`;

    link.download = `${originalName}${suffix}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  if (!currentImage) {
    return (
      <div className="flex-1 bg-background flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <p className="text-lg font-medium">No images uploaded</p>
          <p className="text-sm mt-2">Upload images to see preview</p>
        </div>
      </div>
    );
  }

  const hasValidDimensions = targetWidth && targetHeight;

  return (
    <div className="flex-1 bg-background flex flex-col overflow-hidden">
      <canvas ref={canvasRef} className="hidden" />

      {/* Toolbar */}
      <div className="bg-card border-b border-border px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoomMode(zoomMode === 'fit' ? 'actual' : 'fit')}
            className="px-3 py-1.5 bg-muted hover:bg-accent text-sm font-medium transition-colors"
          >
            {zoomMode === 'fit' ? '100% Size' : 'Fit to View'}
          </button>
        </div>
        {hasValidDimensions && resizedPreview && (
          <button
            onClick={handleDownload}
            className="px-4 py-1.5 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium transition-colors"
          >
            Export Image
          </button>
        )}
      </div>

      {/* Preview Area */}
      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-2 gap-6 h-full">
          {/* Before */}
          <div className="flex flex-col">
            <div className="mb-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Original
              </h3>
            </div>
            <div className="flex-1 bg-card overflow-hidden flex items-center justify-center border border-border">
              <img
                src={currentImage.preview}
                alt="Original"
                className={`
                  ${zoomMode === 'fit' ? 'max-w-full max-h-full object-contain' : 'w-auto h-auto'}
                `}
              />
            </div>
            <div className="mt-3 space-y-1">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">Dimensions:</span>{' '}
                <span className="font-mono text-primary">
                  {currentImage.width} × {currentImage.height}
                </span>
              </p>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">File size:</span>{' '}
                <span className="font-mono text-primary">
                  {formatFileSize(currentImage.file.size)}
                </span>
              </p>
            </div>
          </div>

          {/* After */}
          <div className="flex flex-col">
            <div className="mb-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                {hasValidDimensions ? 'Preview' : 'Select preset or enter dimensions'}
              </h3>
            </div>
            <div className="flex-1 bg-card overflow-hidden flex items-center justify-center border border-border">
              {isProcessing ? (
                <div className="text-center text-muted-foreground">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-3"></div>
                  <p className="text-sm">Processing...</p>
                </div>
              ) : hasValidDimensions && resizedPreview ? (
                <img
                  src={resizedPreview}
                  alt="Preview"
                  className={`
                    ${zoomMode === 'fit' ? 'max-w-full max-h-full object-contain' : 'w-auto h-auto'}
                  `}
                />
              ) : (
                <div className="text-center text-muted-foreground">
                  <p className="text-sm">Select a preset or enter dimensions</p>
                </div>
              )}
            </div>
            {hasValidDimensions && resizedPreview && (
              <div className="mt-3 space-y-1">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Dimensions:</span>{' '}
                  <span className="font-mono text-primary">
                    {targetWidth} × {targetHeight}
                  </span>
                </p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">File size:</span>{' '}
                  <span className="font-mono text-primary">
                    {formatFileSize(resizedSize)}
                  </span>
                </p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Format:</span>{' '}
                  <span className="font-mono text-primary">
                    {getFileExtension().toUpperCase()}
                  </span>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
