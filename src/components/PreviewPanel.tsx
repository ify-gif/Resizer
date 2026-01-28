import { useState, useEffect, useRef } from 'react';
import { ImageData, AVPreset } from '../App';
// @ts-ignore
import Pica from 'pica';
import imageCompression from 'browser-image-compression';
import { CheckCircle, Download, Minimize2, MoveHorizontal, Trash2 } from 'lucide-react';

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
  sharpenAmount: number;
  isCropEnabled: boolean;
  onClear: () => void;
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
  fileSizeUnit,
  sharpenAmount,
  isCropEnabled,
  onClear
}: PreviewPanelProps) {
  const [zoomMode, setZoomMode] = useState<'fit' | 'actual'>('fit');
  const [compareMode, setCompareMode] = useState(true);
  const [showSafeZone, setShowSafeZone] = useState(false);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [resizedPreview, setResizedPreview] = useState<string | null>(null);
  const [resizedSize, setResizedSize] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastExportPath, setLastExportPath] = useState<string | null>(null);
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
  }, [currentImage, targetWidth, targetHeight, quality, outputFormat, sharpenAmount]);

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
      const sourceCtx = sourceCanvas.getContext('2d');

      if (isCropEnabled) {
        // Auto-Center Crop Logic
        const sourceAspect = img.width / img.height;
        const targetAspect = targetWidth / targetHeight;

        let sx = 0, sy = 0, sw = img.width, sh = img.height;

        if (sourceAspect > targetAspect) {
          // Source is wider than target - Crop sides
          sw = img.height * targetAspect;
          sx = (img.width - sw) / 2;
        } else {
          // Source is taller than target - Crop top/bottom
          sh = img.width / targetAspect;
          sy = (img.height - sh) / 2;
        }

        sourceCanvas.width = sw;
        sourceCanvas.height = sh;
        sourceCtx?.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
      } else {
        // Standard Fit (Letterbox if needed)
        sourceCanvas.width = img.width;
        sourceCanvas.height = img.height;
        sourceCtx?.drawImage(img, 0, 0);
      }

      const destCanvas = document.createElement('canvas');
      destCanvas.width = targetWidth;
      destCanvas.height = targetHeight;

      await pica.resize(sourceCanvas, destCanvas, {
        quality: 3,
        alpha: true,
        unsharpAmount: sharpenAmount,
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

    const fileName = `${originalName}${suffix}.${extension}`;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Desktop Integration: Show in Folder logic (simulated for browser, real for desktop)
    setLastExportPath(fileName);

    // Trigger Native Notification via IPC
    if ((window as any).ipcRenderer) {
      (window as any).ipcRenderer.invoke('show-notification', {
        title: 'Export Successful',
        body: `Saved ${fileName} to your downloads folder.`
      });
    }
  };

  const openFolder = () => {
    if ((window as any).ipcRenderer) {
      (window as any).ipcRenderer.invoke('open-folder', '');
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  if (!currentImage) {
    return <div className="flex-1 bg-background" />;
  }

  const hasValidDimensions = targetWidth && targetHeight;

  const renderSafeZoneOverlay = () => {
    if (!showSafeZone || !selectedPreset?.safeZoneId) return null;

    const overlays: { [key: string]: React.ReactNode } = {
      crestron: (
        <>
          <div className="absolute left-0 top-0 bottom-0 w-[15%] bg-black/40 border-r border-white/10 flex items-center justify-center">
            <span className="rotate-[-90deg] text-[8px] font-bold text-white/40 uppercase tracking-widest whitespace-nowrap">Nav Column</span>
          </div>
          <div className="absolute top-0 left-0 right-0 h-[10%] bg-black/40 border-b border-white/10 flex items-center justify-center">
            <span className="text-[8px] font-bold text-white/40 uppercase tracking-widest">Global Status / Clock</span>
          </div>
        </>
      ),
      extron: (
        <>
          <div className="absolute left-0 top-0 bottom-0 w-[10%] bg-black/40 border-r border-white/10" />
          <div className="absolute right-0 top-0 bottom-0 w-[10%] bg-black/40 border-l border-white/10" />
          <div className="absolute bottom-0 left-0 right-0 h-[15%] bg-black/40 border-t border-white/10 flex items-center justify-center">
            <span className="text-[8px] font-bold text-white/40 uppercase tracking-widest">Extron Control Bar</span>
          </div>
        </>
      ),
      cisco: (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[60%] h-20 bg-black/60 backdrop-blur-md rounded-2xl border border-white/10 flex items-center justify-center shadow-2xl">
          <span className="text-[10px] font-bold text-white/20 uppercase tracking-[0.3em]">Cisco Room Navigator UI Hub</span>
        </div>
      ),
      zoom: (
        <>
          <div className="absolute left-4 top-4 w-48 h-12 bg-black/40 rounded-lg flex items-center px-4">
            <div className="w-2 h-2 rounded-full bg-red-500 mr-3" />
            <span className="text-[8px] font-bold text-white/40 uppercase tracking-widest">Zoom Status</span>
          </div>
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-4">
            {[1, 2, 3, 4].map(i => <div key={i} className="w-12 h-12 rounded-full bg-black/40 border border-white/10" />)}
          </div>
        </>
      ),
      teams: (
        <div className="absolute inset-0 border-[24px] border-black/30 flex items-end justify-center pb-12">
          <div className="w-1/2 h-16 bg-primary/20 backdrop-blur-md rounded-xl border border-primary/30 flex items-center justify-center">
            <span className="text-[8px] font-bold text-white/60 uppercase tracking-widest">Teams Meeting Controls</span>
          </div>
        </div>
      )
    };

    return (
      <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden">
        {overlays[selectedPreset.safeZoneId]}
        <div className="absolute inset-0 border border-primary/50 opacity-50 ripple-effect" />
      </div>
    );
  };

  return (
    <div className="flex-1 bg-background flex flex-col overflow-hidden">
      <canvas ref={canvasRef} className="hidden" />

      {/* Toolbar */}
      <div className="glass border-b border-border/50 px-6 py-4 flex items-center justify-between flex-shrink-0 z-50">
        <div className="flex items-center gap-3">
          <div className="flex bg-secondary/50 rounded-lg p-1">
            <button
              onClick={onClear}
              className="px-3 py-1.5 rounded-md text-xs font-medium text-muted-foreground hover:bg-card hover:text-red-500 transition-all-smooth flex items-center gap-2"
              title="Clear Workbench"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
            <div className="w-px h-6 bg-border/20 my-auto mx-1" />
            <button
              onClick={() => setZoomMode('fit')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all-smooth ${zoomMode === 'fit' ? 'bg-primary text-white shadow-lg' : 'hover:bg-card text-muted-foreground'}`}
            >
              Fit
            </button>
            <button
              onClick={() => setZoomMode('actual')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all-smooth ${zoomMode === 'actual' ? 'bg-primary text-white shadow-lg' : 'hover:bg-card text-muted-foreground'}`}
            >
              100%
            </button>
          </div>

          <button
            onClick={() => setCompareMode(!compareMode)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all-smooth ${compareMode ? 'bg-card border-primary/30 text-primary' : 'bg-transparent border-border text-muted-foreground hover:bg-card'}`}
          >
            <MoveHorizontal className="w-3.5 h-3.5" />
            {compareMode ? 'Split View' : 'Single View'}
          </button>

          {selectedPreset?.safeZoneId && (
            <button
              onClick={() => setShowSafeZone(!showSafeZone)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold uppercase tracking-tighter transition-all-smooth ${showSafeZone ? 'bg-orange-500/20 border-orange-500 text-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.2)]' : 'bg-transparent border-border text-muted-foreground hover:bg-card'}`}
            >
              <Minimize2 className="w-3.5 h-3.5" />
              UI Safe-Zone
            </button>
          )}
        </div>

        <div className="flex items-center gap-4">
          {lastExportPath && (
            <button
              onClick={openFolder}
              className="flex items-center gap-2 text-xs font-medium text-primary hover:underline"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              Saved to Downloads
            </button>
          )}
          {hasValidDimensions && resizedPreview && (
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-5 py-2 bg-primary hover:bg-primary/90 text-white text-sm font-semibold rounded-lg shadow-[0_8px_16px_-4px_rgba(59,130,246,0.3)] transition-all active:scale-95"
            >
              <Download className="w-4 h-4" />
              Export Pro Assets
            </button>
          )}
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 overflow-auto p-8 relative">
        <div className="h-full flex flex-col">
          <div className="flex-1 bg-card rounded-2xl overflow-hidden flex items-center justify-center border border-border/50 shadow-inner relative group/preview">
            {isProcessing ? (
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-sm font-medium text-muted-foreground">Synthesizing Pixels...</p>
              </div>
            ) : hasValidDimensions && resizedPreview ? (
              <div className={`relative ${zoomMode === 'fit' ? 'w-full h-full' : 'w-auto h-auto'}`}>
                {compareMode ? (
                  <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                    {/* Before Image (Left) */}
                    <div className="absolute inset-0 flex items-center justify-center bg-[conic-gradient(#80808066_90deg,#0000_0_180deg,#80808066_0_270deg,#0000_0)] bg-[length:20px_20px]">
                      <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px]" />
                      <div className="relative w-full h-full flex items-center justify-center">
                        <img
                          src={currentImage.preview}
                          alt="Original"
                          className={`${zoomMode === 'fit' ? 'max-w-full max-h-full object-contain' : ''} brightness-75`}
                        />
                      </div>
                    </div>

                    {/* After Image (Right/Top with clip) */}
                    <div
                      className="absolute inset-0 flex items-center justify-center bg-[conic-gradient(#80808066_90deg,#0000_0_180deg,#80808066_0_270deg,#0000_0)] bg-[length:20px_20px]"
                      style={{ clipPath: `inset(0 0 0 ${sliderPosition}%)` }}
                    >
                      <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px]" />
                      <div className="relative w-full h-full flex items-center justify-center pointer-events-none">
                        <img
                          src={resizedPreview}
                          alt="Resized"
                          className={zoomMode === 'fit' ? 'max-w-full max-h-full object-contain' : ''}
                        />
                      </div>
                      {renderSafeZoneOverlay()}
                    </div>

                    {/* Slider Control */}
                    <div
                      className="absolute top-0 bottom-0 w-1 bg-primary cursor-ew-resize z-50 shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                      style={{ left: `${sliderPosition}%` }}
                    >
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-xl border-4 border-card">
                        <MoveHorizontal className="w-4 h-4 text-white" />
                      </div>
                    </div>

                    {/* Transparent Range Input Overlay */}
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={sliderPosition}
                      onChange={(e) => setSliderPosition(parseInt(e.target.value))}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-[60]"
                    />

                    {/* Labels */}
                    <div className="absolute top-6 left-6 px-3 py-1.5 bg-black/40 backdrop-blur-md rounded-lg text-[10px] font-bold uppercase tracking-widest text-white/60 pointer-events-none border border-white/10">
                      Original
                    </div>
                    <div className="absolute top-6 right-6 px-3 py-1.5 bg-primary/40 backdrop-blur-md rounded-lg text-[10px] font-bold uppercase tracking-widest text-white pointer-events-none border border-primary/20">
                      Optimized
                    </div>
                  </div>
                ) : (
                  <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-[conic-gradient(#80808066_90deg,#0000_0_180deg,#80808066_0_270deg,#0000_0)] bg-[length:20px_20px]">
                    <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px]" />
                    <div className="relative w-full h-full flex items-center justify-center">
                      <img
                        src={resizedPreview}
                        alt="Preview"
                        className={zoomMode === 'fit' ? 'max-w-full max-h-full object-contain' : ''}
                      />
                    </div>
                    {renderSafeZoneOverlay()}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center max-w-xs p-6">
                <Minimize2 className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
                <p className="text-sm font-medium">Select a preset or enter dimensions to see the bench preview.</p>
              </div>
            )}
          </div>

          {/* Stats Bar */}
          {hasValidDimensions && resizedPreview && (
            <div className="mt-8 grid grid-cols-4 gap-4">
              <div className="bg-card/50 border border-border/50 p-4 rounded-xl">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Target Ratio</p>
                <p className="text-lg font-semibold font-mono text-primary">{(targetWidth / targetHeight).toFixed(2)}:1</p>
              </div>
              <div className="bg-card/50 border border-border/50 p-4 rounded-xl">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Resolution</p>
                <p className="text-lg font-semibold font-mono text-primary">{targetWidth} × {targetHeight}</p>
              </div>
              <div className="bg-card/50 border border-border/50 p-4 rounded-xl">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Estimated Size</p>
                <p className="text-lg font-semibold font-mono text-primary">{formatFileSize(resizedSize)}</p>
              </div>
              <div className="bg-card/50 border border-border/50 p-4 rounded-xl">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Compression</p>
                <p className="text-lg font-semibold font-mono text-primary">{((1 - resizedSize / currentImage.file.size) * 100).toFixed(0)}% Saved</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
