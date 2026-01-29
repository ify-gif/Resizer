import { useState, useEffect, useRef, useCallback } from 'react';
import { ImageData, AVPreset, CropBox } from '../App';
// @ts-ignore
import Pica from 'pica';
import imageCompression from 'browser-image-compression';
import { CheckCircle, Minimize2, MoveHorizontal, Plus, Trash2, Check, X } from 'lucide-react';
import { useDropzone } from 'react-dropzone';

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
  onFilesAdded: (files: File[]) => void;
  cropMode: boolean;
  cropBox: CropBox | null;
  onApplyCrop: (box: CropBox | null) => void;
  onCancelCrop: () => void;
  onClearCrop: () => void;
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
  onClear,
  onFilesAdded,
  cropMode,
  cropBox,
  onApplyCrop,
  onCancelCrop,
  onClearCrop
}: PreviewPanelProps) {
  const [zoomMode, setZoomMode] = useState<'fit' | 'actual'>('fit');
  const [compareMode, setCompareMode] = useState(true);
  const [showSafeZone, setShowSafeZone] = useState(false);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [resizedPreview, setResizedPreview] = useState<string | null>(null);
  const [resizedSize, setResizedSize] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSaveToast, setShowSaveToast] = useState(false);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Crop overlay state
  const [tempCropBox, setTempCropBox] = useState<CropBox>({ x: 0.1, y: 0.1, width: 0.8, height: 0.8 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragType, setDragType] = useState<'move' | 'nw' | 'ne' | 'sw' | 'se' | 'n' | 's' | 'e' | 'w' | null>(null);
  const [dragStart, setDragStart] = useState<{ x: number; y: number; box: CropBox } | null>(null);
  const [cropImageDims, setCropImageDims] = useState<{ width: number; height: number } | null>(null);
  const cropContainerRef = useRef<HTMLDivElement>(null);
  const cropImageRef = useRef<HTMLImageElement>(null);

  const handleCropImageLoad = () => {
    if (cropImageRef.current) {
      setCropImageDims({
        width: cropImageRef.current.clientWidth,
        height: cropImageRef.current.clientHeight
      });
    }
  };

  // Initialize temp crop box when entering crop mode
  useEffect(() => {
    if (cropMode) {
      if (cropBox) {
        setTempCropBox(cropBox);
      } else {
        // Default to 80% of image centered
        setTempCropBox({ x: 0.1, y: 0.1, width: 0.8, height: 0.8 });
      }
    }
  }, [cropMode, cropBox]);

  const handleCropMouseDown = useCallback((e: React.MouseEvent, type: typeof dragType) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    setDragType(type);
    setDragStart({ x: e.clientX, y: e.clientY, box: { ...tempCropBox } });
  }, [tempCropBox]);

  const handleCropMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !dragStart || !dragType || !cropContainerRef.current || !cropImageRef.current) return;

    const imgRect = cropImageRef.current.getBoundingClientRect();

    const deltaX = (e.clientX - dragStart.x) / imgRect.width;
    const deltaY = (e.clientY - dragStart.y) / imgRect.height;

    let newBox = { ...dragStart.box };

    if (dragType === 'move') {
      newBox.x = Math.max(0, Math.min(1 - newBox.width, dragStart.box.x + deltaX));
      newBox.y = Math.max(0, Math.min(1 - newBox.height, dragStart.box.y + deltaY));
    } else {
      // Handle resize from corners and edges
      if (dragType.includes('w')) {
        const newX = dragStart.box.x + deltaX;
        const newWidth = dragStart.box.width - deltaX;
        if (newX >= 0 && newWidth >= 0.05) {
          newBox.x = newX;
          newBox.width = newWidth;
        }
      }
      if (dragType.includes('e')) {
        const newWidth = dragStart.box.width + deltaX;
        if (newBox.x + newWidth <= 1 && newWidth >= 0.05) {
          newBox.width = newWidth;
        }
      }
      if (dragType.includes('n')) {
        const newY = dragStart.box.y + deltaY;
        const newHeight = dragStart.box.height - deltaY;
        if (newY >= 0 && newHeight >= 0.05) {
          newBox.y = newY;
          newBox.height = newHeight;
        }
      }
      if (dragType.includes('s')) {
        const newHeight = dragStart.box.height + deltaY;
        if (newBox.y + newHeight <= 1 && newHeight >= 0.05) {
          newBox.height = newHeight;
        }
      }
    }

    setTempCropBox(newBox);
  }, [isDragging, dragStart, dragType]);

  const handleCropMouseUp = useCallback(() => {
    setIsDragging(false);
    setDragType(null);
    setDragStart(null);
  }, []);

  const handleApplyCropClick = () => {
    onApplyCrop(tempCropBox);
  };

  const handleCancelCropClick = () => {
    onCancelCrop();
  };

  const currentImage = images.length > 0 ? images[0] : null;
  const pica = new Pica();

  const { getRootProps, getInputProps, open } = useDropzone({
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp', '.heic'] },
    onDrop: onFilesAdded,
    multiple: true,
    noClick: true,
    noKeyboard: true
  });

  const targetWidth = activeTab === 'presets' ? selectedPreset?.width : customWidth;
  const targetHeight = activeTab === 'presets' ? selectedPreset?.height : customHeight;

  useEffect(() => {
    // Clear the toast when image or settings change
    setShowSaveToast(false);
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }

    if (!currentImage || !targetWidth || !targetHeight) {
      setResizedPreview(null);
      return;
    }

    resizeImage();
  }, [currentImage, targetWidth, targetHeight, quality, outputFormat, sharpenAmount, cropBox]);

  const resizeImage = async () => {
    if (!currentImage || !targetWidth || !targetHeight) return;

    setIsProcessing(true);

    try {
      const img = new Image();
      img.src = currentImage.preview;

      await new Promise((resolve) => {
        img.onload = resolve;
      });

      let finalCanvas: HTMLCanvasElement;

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

        finalCanvas = document.createElement('canvas');
        finalCanvas.width = targetWidth;
        finalCanvas.height = targetHeight;
        await pica.resize(sourceCanvas, finalCanvas, {
          quality: 3,
          alpha: true,
          unsharpAmount: sharpenAmount,
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

        finalCanvas = document.createElement('canvas');
        finalCanvas.width = targetWidth;
        finalCanvas.height = targetHeight;
        await pica.resize(sourceCanvas, finalCanvas, {
          quality: 3,
          alpha: true,
          unsharpAmount: sharpenAmount,
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

        // Create a source canvas for pica
        const sourceCanvas = document.createElement('canvas');
        sourceCanvas.width = img.width;
        sourceCanvas.height = img.height;
        sourceCanvas.getContext('2d')?.drawImage(img, 0, 0);

        const scaledCanvas = document.createElement('canvas');
        scaledCanvas.width = dw;
        scaledCanvas.height = dh;
        await pica.resize(sourceCanvas, scaledCanvas, {
          quality: 3,
          alpha: true,
          unsharpAmount: sharpenAmount,
          unsharpRadius: 0.6,
          unsharpThreshold: 2
        });

        finalCanvas = document.createElement('canvas');
        finalCanvas.width = targetWidth;
        finalCanvas.height = targetHeight;
        const ctx = finalCanvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = 'black';
          ctx.fillRect(0, 0, targetWidth, targetHeight);
          ctx.drawImage(scaledCanvas, dx, dy);
        }
      }

      // Handle Export / Compression
      const mimeType = getMimeType();
      const qualityValue = quality / 100;

      finalCanvas.toBlob(
        async (blob) => {
          if (blob) {
            let finalBlob = blob;
            if (targetFileSize > 0 && (mimeType === 'image/jpeg' || mimeType === 'image/jpg')) {
              const maxSizeInBytes = fileSizeUnit === 'MB' ? targetFileSize * 1024 * 1024 : targetFileSize * 1024;
              if (blob.size > maxSizeInBytes) {
                try {
                  const options = { maxSizeMB: maxSizeInBytes / (1024 * 1024), useWebWorker: true, maxIteration: 10 };
                  const file = new File([blob], 'temp.jpg', { type: mimeType });
                  finalBlob = await imageCompression(file, options);
                } catch (e) {
                  console.error('Compression error:', e);
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

    // Show toast notification
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setShowSaveToast(true);
    toastTimeoutRef.current = setTimeout(() => {
      setShowSaveToast(false);
    }, 3000);

    // Trigger Native Notification via IPC
    if ((window as any).ipcRenderer) {
      (window as any).ipcRenderer.invoke('show-notification', {
        title: 'Export Successful',
        body: `Saved ${fileName} to your downloads folder.`
      });
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
    <div {...getRootProps()} className="flex-1 bg-background flex flex-col overflow-hidden">
      <input {...getInputProps()} />
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

          {cropBox && (
            <button
              onClick={onClearCrop}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold uppercase tracking-tighter transition-all-smooth bg-orange-500/20 border-orange-500 text-orange-500 hover:bg-orange-500/30"
            >
              Clear Crop
            </button>
          )}

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
          <span
            className={`flex items-center gap-2 text-xs font-medium text-emerald-500 bg-emerald-500/10 px-3 py-1.5 rounded-lg transition-all duration-300 ${showSaveToast ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 pointer-events-none'}`}
          >
            <CheckCircle className="w-3.5 h-3.5" />
            Saved to Downloads
          </span>
          <button
            onClick={open}
            className="w-9 h-9 border-2 border-dashed border-emerald-600/50 rounded-lg flex items-center justify-center hover:border-emerald-500 hover:bg-emerald-500/10 transition-all"
            title="Import Image"
          >
            <Plus className="w-4 h-4 text-emerald-500 animate-pulse" />
          </button>
          {hasValidDimensions && resizedPreview && (
            <button
              onClick={handleDownload}
              className="px-5 py-2 bg-primary hover:bg-primary/90 text-white text-sm font-semibold rounded-lg shadow-[0_8px_16px_-4px_rgba(59,130,246,0.3)] transition-all active:scale-95"
            >
              Export
            </button>
          )}
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 overflow-auto p-8 relative">
        <div className="h-full flex flex-col">
          <div className="flex-1 bg-card rounded-2xl overflow-hidden flex items-center justify-center border border-border/50 shadow-inner relative group/preview">
            {/* Crop Mode Overlay */}
            {cropMode && currentImage ? (
              <div
                ref={cropContainerRef}
                className="relative w-full h-full flex items-center justify-center bg-black/90"
                onMouseMove={handleCropMouseMove}
                onMouseUp={handleCropMouseUp}
                onMouseLeave={handleCropMouseUp}
              >
                {/* Original image */}
                <img
                  ref={cropImageRef}
                  src={currentImage.preview}
                  alt="Crop Preview"
                  className="max-w-full max-h-full object-contain select-none"
                  draggable={false}
                  onLoad={handleCropImageLoad}
                />

                {/* Crop overlay */}
                {cropImageDims && (
                  <div
                    className="absolute pointer-events-none"
                    style={{
                      left: `calc(50% - ${cropImageDims.width / 2}px)`,
                      top: `calc(50% - ${cropImageDims.height / 2}px)`,
                      width: cropImageDims.width,
                      height: cropImageDims.height,
                    }}
                  >
                    {/* Darkened areas outside crop */}
                    <div className="absolute inset-0 bg-black/60" />

                    {/* Crop selection box (clear area) */}
                    <div
                      className="absolute bg-transparent pointer-events-auto cursor-move border-2 border-white shadow-lg"
                      style={{
                        left: `${tempCropBox.x * 100}%`,
                        top: `${tempCropBox.y * 100}%`,
                        width: `${tempCropBox.width * 100}%`,
                        height: `${tempCropBox.height * 100}%`,
                        boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.6)',
                      }}
                      onMouseDown={(e) => handleCropMouseDown(e, 'move')}
                    >
                      {/* Grid lines */}
                      <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute left-1/3 top-0 bottom-0 w-px bg-white/30" />
                        <div className="absolute left-2/3 top-0 bottom-0 w-px bg-white/30" />
                        <div className="absolute top-1/3 left-0 right-0 h-px bg-white/30" />
                        <div className="absolute top-2/3 left-0 right-0 h-px bg-white/30" />
                      </div>

                      {/* Corner handles */}
                      <div className="absolute -left-2 -top-2 w-4 h-4 bg-white border-2 border-primary cursor-nw-resize" onMouseDown={(e) => handleCropMouseDown(e, 'nw')} />
                      <div className="absolute -right-2 -top-2 w-4 h-4 bg-white border-2 border-primary cursor-ne-resize" onMouseDown={(e) => handleCropMouseDown(e, 'ne')} />
                      <div className="absolute -left-2 -bottom-2 w-4 h-4 bg-white border-2 border-primary cursor-sw-resize" onMouseDown={(e) => handleCropMouseDown(e, 'sw')} />
                      <div className="absolute -right-2 -bottom-2 w-4 h-4 bg-white border-2 border-primary cursor-se-resize" onMouseDown={(e) => handleCropMouseDown(e, 'se')} />

                      {/* Edge handles */}
                      <div className="absolute left-1/2 -translate-x-1/2 -top-2 w-8 h-4 bg-white border-2 border-primary cursor-n-resize" onMouseDown={(e) => handleCropMouseDown(e, 'n')} />
                      <div className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-8 h-4 bg-white border-2 border-primary cursor-s-resize" onMouseDown={(e) => handleCropMouseDown(e, 's')} />
                      <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-8 bg-white border-2 border-primary cursor-w-resize" onMouseDown={(e) => handleCropMouseDown(e, 'w')} />
                      <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-8 bg-white border-2 border-primary cursor-e-resize" onMouseDown={(e) => handleCropMouseDown(e, 'e')} />
                    </div>
                  </div>
                )}

                {/* Crop action buttons */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3">
                  <button
                    onClick={handleCancelCropClick}
                    className="flex items-center gap-2 px-4 py-2 bg-card/90 hover:bg-card text-foreground text-sm font-semibold rounded-lg border border-border shadow-lg transition-all"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                  <button
                    onClick={handleApplyCropClick}
                    className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white text-sm font-semibold rounded-lg shadow-lg transition-all"
                  >
                    <Check className="w-4 h-4" />
                    Apply Crop
                  </button>
                </div>

                {/* Crop dimensions display */}
                <div className="absolute top-6 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/70 backdrop-blur-sm rounded-lg text-white text-xs font-mono">
                  {currentImage && (
                    <>
                      {Math.round(tempCropBox.width * currentImage.width)} × {Math.round(tempCropBox.height * currentImage.height)} px
                    </>
                  )}
                </div>
              </div>
            ) : isProcessing ? (
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-sm font-medium text-muted-foreground">Synthesizing Pixels...</p>
              </div>
            ) : hasValidDimensions && resizedPreview ? (
              <div className={`relative ${zoomMode === 'fit' ? 'w-full h-full' : 'overflow-auto w-full h-full'}`}>
                {compareMode ? (
                  <div className={`relative flex items-center justify-center ${zoomMode === 'fit' ? 'w-full h-full overflow-hidden' : 'min-w-full min-h-full'}`}>
                    {/* Before Image (Left) */}
                    <div className={`${zoomMode === 'fit' ? 'absolute inset-0' : 'relative'} flex items-center justify-center bg-[conic-gradient(#80808066_90deg,#0000_0_180deg,#80808066_0_270deg,#0000_0)] bg-[length:20px_20px]`}>
                      <div className={`${zoomMode === 'fit' ? 'absolute inset-0' : 'absolute inset-0'} bg-background/50 backdrop-blur-[1px]`} />
                      <div className={`relative flex items-center justify-center ${zoomMode === 'fit' ? 'w-full h-full' : ''}`}>
                        <img
                          src={currentImage.preview}
                          alt="Original"
                          className={`${zoomMode === 'fit' ? 'max-w-full max-h-full object-contain' : ''} brightness-75`}
                        />
                      </div>
                    </div>

                    {/* After Image (Right/Top with clip) */}
                    <div
                      className={`${zoomMode === 'fit' ? 'absolute inset-0' : 'absolute inset-0'} flex items-center justify-center bg-[conic-gradient(#80808066_90deg,#0000_0_180deg,#80808066_0_270deg,#0000_0)] bg-[length:20px_20px]`}
                      style={{ clipPath: `inset(0 0 0 ${sliderPosition}%)` }}
                    >
                      <div className={`${zoomMode === 'fit' ? 'absolute inset-0' : 'absolute inset-0'} bg-background/50 backdrop-blur-[1px]`} />
                      <div className={`relative flex items-center justify-center pointer-events-none ${zoomMode === 'fit' ? 'w-full h-full' : ''}`}>
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
                  <div className={`relative flex items-center justify-center bg-[conic-gradient(#80808066_90deg,#0000_0_180deg,#80808066_0_270deg,#0000_0)] bg-[length:20px_20px] ${zoomMode === 'fit' ? 'w-full h-full overflow-hidden' : 'min-w-full min-h-full'}`}>
                    <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px]" />
                    <div className={`relative flex items-center justify-center ${zoomMode === 'fit' ? 'w-full h-full' : ''}`}>
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
            <div className="mt-4 flex gap-2">
              <div className="flex-1 border border-primary/30 px-3 py-2 rounded-lg flex items-center justify-between">
                <span className="text-[9px] font-medium text-muted-foreground uppercase tracking-wide">Ratio</span>
                <span className="text-sm font-semibold font-mono text-primary">{(targetWidth / targetHeight).toFixed(2)}:1</span>
              </div>
              <div className="flex-1 border border-primary/30 px-3 py-2 rounded-lg flex items-center justify-between">
                <span className="text-[9px] font-medium text-muted-foreground uppercase tracking-wide">Size</span>
                <span className="text-sm font-semibold font-mono text-primary">{targetWidth}×{targetHeight}</span>
              </div>
              <div className="flex-1 border border-primary/30 px-3 py-2 rounded-lg flex items-center justify-between">
                <span className="text-[9px] font-medium text-muted-foreground uppercase tracking-wide">Output</span>
                <span className="text-sm font-semibold font-mono text-primary">{formatFileSize(resizedSize)}</span>
              </div>
              <div className="flex-1 border border-primary/30 px-3 py-2 rounded-lg flex items-center justify-between">
                <span className="text-[9px] font-medium text-muted-foreground uppercase tracking-wide">Saved</span>
                <span className="text-sm font-semibold font-mono text-emerald-500">{((1 - resizedSize / currentImage.file.size) * 100).toFixed(0)}%</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
