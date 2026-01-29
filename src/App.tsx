import { useState, useEffect } from 'react';
import UploadZone from './components/UploadZone';
import LeftPanel from './components/LeftPanel';
import PreviewPanel from './components/PreviewPanel';

// @ts-ignore
import JSZip from 'jszip';
import { processImage } from './utils/imageProcessor';

export interface AVPreset {
  id: string;
  name: string;
  width: number;
  height: number;
  useCase: string;
  format: 'jpg' | 'png';
  safeZoneId?: string;
}

export interface ImageData {
  file: File;
  preview: string;
  width: number;
  height: number;
}

export interface CropBox {
  x: number;      // Left position (% of image width, 0-1)
  y: number;      // Top position (% of image height, 0-1)
  width: number;  // Width (% of image width, 0-1)
  height: number; // Height (% of image height, 0-1)
}

export const AV_PRESETS: AVPreset[] = [
  {
    id: 'crestron-1070',
    name: 'Crestron TSW-1070',
    width: 1280,
    height: 800,
    useCase: 'Standard Crestron 10" touch panel wallpaper',
    format: 'jpg',
    safeZoneId: 'crestron'
  },
  {
    id: 'extron-1025',
    name: 'Extron TLP Pro 1025',
    width: 1024,
    height: 600,
    useCase: 'TouchLink Pro 10" wall/tabletop panels',
    format: 'jpg',
    safeZoneId: 'extron'
  },
  {
    id: 'cisco-room',
    name: 'Cisco Room Navigator',
    width: 1920,
    height: 1200,
    useCase: 'Modern Cisco Webex room controllers',
    format: 'jpg',
    safeZoneId: 'cisco'
  },
  {
    id: 'zoom-pad',
    name: 'Zoom Room Controller',
    width: 2048,
    height: 1536,
    useCase: 'iPad-based Zoom Room control interfaces',
    format: 'jpg',
    safeZoneId: 'zoom'
  },
  {
    id: 'teams-panel',
    name: 'MS Teams Panel',
    width: 1280,
    height: 800,
    useCase: 'Microsoft Teams scheduling and control panels',
    format: 'jpg',
    safeZoneId: 'teams'
  },
  {
    id: 'signage-4k',
    name: 'Signage 4K (Landscape)',
    width: 3840,
    height: 2160,
    useCase: 'Ultra HD digital signage and message boards',
    format: 'jpg'
  }
];

function App() {
  const [images, setImages] = useState<ImageData[]>([]);
  const [selectedPreset, setSelectedPreset] = useState<AVPreset | null>(null);
  const [activeTab, setActiveTab] = useState<'presets' | 'custom' | 'batch'>('presets');
  const [quality, setQuality] = useState<number>(85);
  const [isProcessingBatch, setIsProcessingBatch] = useState(false);
  const [batchProgress, setBatchProgress] = useState(0);

  const [customWidth, setCustomWidth] = useState<number>(0);
  const [customHeight, setCustomHeight] = useState<number>(0);
  const [aspectRatioLocked, setAspectRatioLocked] = useState<boolean>(true);
  const [outputFormat, setOutputFormat] = useState<string>('original');
  const [targetFileSize, setTargetFileSize] = useState<number>(0);
  const [fileSizeUnit, setFileSizeUnit] = useState<'KB' | 'MB'>('KB');
  const [sharpenAmount, setSharpenAmount] = useState<number>(0);
  const [isCropEnabled, setIsCropEnabled] = useState<boolean>(false);
  const [cropMode, setCropMode] = useState<boolean>(false);
  const [cropBox, setCropBox] = useState<CropBox | null>(null);
  const [userPresets, setUserPresets] = useState<AVPreset[]>(() => {
    const saved = localStorage.getItem('ify_user_presets');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('ify_user_presets', JSON.stringify(userPresets));
  }, [userPresets]);

  const handleFilesAdded = (files: File[]) => {
    const newImages: ImageData[] = [];

    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.onload = () => {
            newImages.push({
              file,
              preview: e.target?.result as string,
              width: img.width,
              height: img.height
            });

            if (newImages.length === files.length) {
              setImages(prev => [...prev, ...newImages]);
              if (!customWidth && !customHeight) {
                setCustomWidth(img.width);
                setCustomHeight(img.height);
              }
            }
          };
          img.src = e.target?.result as string;
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const handleCrop = () => {
    if (images.length > 0) {
      setIsCropEnabled(false);
      setCropBox(null);
      setCropMode(true);
    }
  };

  const handleApplyCrop = (box: CropBox | null) => {
    setCropBox(box);
    setCropMode(false);
  };

  const handleCancelCrop = () => {
    setCropMode(false);
  };

  const handleClearCrop = () => {
    setCropBox(null);
    setIsCropEnabled(false);
    setCropMode(false);
  };

  const handleEnableAutoCrop = () => {
    setIsCropEnabled(true);
    setCropMode(false);
    setCropBox(null);
  };

  const handleClear = () => {
    setImages([]);
    setCustomWidth(0);
    setCustomHeight(0);
    setCropBox(null);
    setCropMode(false);
    setIsCropEnabled(false);
  };

  const handleConvert = (format: string) => {
    if (format === 'cycle') {
      const formats = ['original', 'jpg', 'png', 'webp'];
      const currentIndex = formats.indexOf(outputFormat);
      const nextIndex = (currentIndex + 1) % formats.length;
      setOutputFormat(formats[nextIndex]);
    } else {
      setOutputFormat(format);
    }
  };

  const handleCompress = () => {
    // Quick Optimize: Quality 75%, 1MB Target
    setQuality(75);
    setTargetFileSize(1);
    setFileSizeUnit('MB');
    setSharpenAmount(25); // Subtle sharpening for AV panels
  };

  const handlePresetSelect = (preset: AVPreset) => {
    setSelectedPreset(preset);
  };

  const saveUserPreset = (name: string, width: number, height: number, format: 'jpg' | 'png') => {
    const newPreset: AVPreset = {
      id: `user-${Date.now()}`,
      name,
      width,
      height,
      useCase: 'User-Defined Configuration',
      format
    };
    setUserPresets(prev => [...prev, newPreset]);
  };

  const deleteUserPreset = (id: string) => {
    setUserPresets(prev => prev.filter(p => p.id !== id));
    if (selectedPreset?.id === id) {
      setSelectedPreset(null);
    }
  };

  const handleBatchProcess = async () => {
    if (images.length === 0 || isProcessingBatch) return;

    setIsProcessingBatch(true);
    setBatchProgress(0);

    try {
      const zip = new JSZip();

      // Determine target config
      let targetW = customWidth;
      let targetH = customHeight;
      let targetFmt = outputFormat;

      if (selectedPreset) {
        targetW = selectedPreset.width;
        targetH = selectedPreset.height;
        targetFmt = selectedPreset.format; // Standardize to preset format
      }

      // Fallback if no dims set
      if (!targetW || !targetH) {
        // Default to first image dims if nothing selected
        targetW = images[0].width;
        targetH = images[0].height;
      }

      await Promise.all(images.map(async (img) => {
        try {
          const blob = await processImage({
            file: img.file,
            targetWidth: targetW,
            targetHeight: targetH,
            format: targetFmt,
            quality: quality,
            sharpenAmount: sharpenAmount,
            isCropEnabled: isCropEnabled,
            targetFileSize: fileSizeUnit === 'MB' ? targetFileSize : targetFileSize / 1024,
            cropBox: cropBox
          });

          // Filename logic
          const ext = targetFmt === 'original' ? img.file.name.split('.').pop() : (targetFmt === 'jpg' ? 'jpg' : targetFmt);
          const name = img.file.name.substring(0, img.file.name.lastIndexOf('.')) || img.file.name;
          zip.file(`${name}_optimized.${ext}`, blob);

          setBatchProgress(prev => prev + 1);
        } catch (error) {
          console.error(`Failed to process ${img.file.name}`, error);
        }
      }));

      // Generate Zip
      const content = await zip.generateAsync({ type: 'blob' });

      // Download Trigger
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = `AV_Batch_Export_${Date.now()}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (error) {
      console.error('Batch failed', error);
    } finally {
      setIsProcessingBatch(false);
    }
  };

  return (
    <div className="dark h-screen bg-background text-foreground flex flex-col overflow-hidden font-sans">
      {/* Precision Header */}
      <header className="glass border-b border-border/50 px-8 py-4 flex-shrink-0 z-50 flex items-center justify-between app-region-drag select-none h-[72px]">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20 shadow-lg shadow-primary/5">
            <img src="/logo.png" alt="Logo" className="w-6 h-6 object-contain" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-foreground leading-none">AV Image Resizer</h1>
            <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mt-1 opacity-80">Pro Optimization Suite</p>
          </div>
        </div>

        <div className="flex items-center gap-6 mr-[140px] app-region-no-drag">
          <div className="flex items-center gap-3 bg-card/40 px-4 py-2 rounded-xl border border-border/50 shadow-inner">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Active Assets</span>
            <div className="w-px h-3 bg-border/50" />
            <span className="text-sm font-mono font-bold text-primary">{images.length}</span>
          </div>
        </div>
      </header>

      {/* Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Settings Engine */}
        <LeftPanel
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          selectedPreset={selectedPreset}
          onPresetSelect={handlePresetSelect}
          userPresets={userPresets}
          onDeleteUserPreset={deleteUserPreset}
          onSaveUserPreset={saveUserPreset}
          quality={quality}
          setQuality={setQuality}
          originalWidth={images.length > 0 ? images[0].width : 0}
          originalHeight={images.length > 0 ? images[0].height : 0}
          customWidth={customWidth}
          customHeight={customHeight}
          setCustomWidth={setCustomWidth}
          setCustomHeight={setCustomHeight}
          aspectRatioLocked={aspectRatioLocked}
          setAspectRatioLocked={setAspectRatioLocked}
          onCrop={handleCrop}
          onConvert={handleConvert}
          onCompress={handleCompress}
          outputFormat={outputFormat}
          setOutputFormat={setOutputFormat}
          targetFileSize={targetFileSize}
          setTargetFileSize={setTargetFileSize}
          fileSizeUnit={fileSizeUnit}
          setFileSizeUnit={setFileSizeUnit}
          sharpenAmount={sharpenAmount}
          setSharpenAmount={setSharpenAmount}
          isCropEnabled={isCropEnabled}
          hasCropBox={cropBox !== null}
          onClearCrop={handleClearCrop}
          onEnableAutoCrop={handleEnableAutoCrop}
          isEditingCrop={cropMode}
          images={images}
          onProcessBatch={handleBatchProcess}
          isProcessing={isProcessingBatch}
          batchProgress={batchProgress}
          batchTarget={images.length}
          configSummary={selectedPreset ? `${selectedPreset.name} (${selectedPreset.width}x${selectedPreset.height})` : `Custom (${customWidth}x${customHeight})`}
        />

        {/* Visualization & Mastery Panel */}
        <div className="flex-1 flex flex-col relative">
          <PreviewPanel
            images={images}
            selectedPreset={selectedPreset}
            quality={quality}
            customWidth={customWidth}
            customHeight={customHeight}
            activeTab={activeTab}
            outputFormat={outputFormat}
            targetFileSize={targetFileSize}
            fileSizeUnit={fileSizeUnit}
            sharpenAmount={sharpenAmount}
            isCropEnabled={isCropEnabled}
            onClear={handleClear}
            onFilesAdded={handleFilesAdded}
            cropMode={cropMode}
            cropBox={cropBox}
            onApplyCrop={handleApplyCrop}
            onCancelCrop={handleCancelCrop}
            onClearCrop={handleClearCrop}
          />

          {images.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center p-12">
              <UploadZone onFilesAdded={handleFilesAdded} hasImages={false} />
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

export default App;
