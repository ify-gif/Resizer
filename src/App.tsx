import { useState } from 'react';
import UploadZone from './components/UploadZone';
import LeftPanel from './components/LeftPanel';
import PreviewPanel from './components/PreviewPanel';
import UpscaleWarningModal from './components/UpscaleWarningModal';

export interface AVPreset {
  id: string;
  name: string;
  width: number;
  height: number;
  useCase: string;
  format: 'jpeg' | 'png';
}

export interface ImageData {
  file: File;
  preview: string;
  width: number;
  height: number;
}

export const AV_PRESETS: AVPreset[] = [
  {
    id: '1080p',
    name: '1080p Display',
    width: 1920,
    height: 1080,
    useCase: 'Standard HD displays and monitors',
    format: 'jpeg'
  },
  {
    id: '4k',
    name: '4K Display',
    width: 3840,
    height: 2160,
    useCase: 'Ultra HD displays and projectors',
    format: 'jpeg'
  },
  {
    id: 'signage-landscape',
    name: 'Digital Signage Landscape',
    width: 1920,
    height: 1080,
    useCase: 'Horizontal digital signage displays',
    format: 'jpeg'
  },
  {
    id: 'signage-portrait',
    name: 'Digital Signage Portrait',
    width: 1080,
    height: 1920,
    useCase: 'Vertical digital signage displays',
    format: 'jpeg'
  },
  {
    id: 'powerpoint',
    name: 'PowerPoint Optimized',
    width: 1280,
    height: 720,
    useCase: 'Presentations and slide decks',
    format: 'jpeg'
  },
  {
    id: 'control-panel',
    name: 'Control Panel UI',
    width: 1024,
    height: 768,
    useCase: 'Touch panel interfaces and control systems',
    format: 'png'
  },
  {
    id: 'documentation',
    name: 'Documentation/Web',
    width: 800,
    height: 600,
    useCase: 'Web pages and documentation',
    format: 'jpeg'
  }
];

function App() {
  const [images, setImages] = useState<ImageData[]>([]);
  const [selectedPreset, setSelectedPreset] = useState<AVPreset | null>(null);
  const [activeTab, setActiveTab] = useState<'presets' | 'custom' | 'batch'>('presets');
  const [quality, setQuality] = useState<number>(85);
  const [showUpscaleWarning, setShowUpscaleWarning] = useState(false);
  const [upscaleInfo, setUpscaleInfo] = useState<{ original: string; target: string } | null>(null);

  const [customWidth, setCustomWidth] = useState<number>(0);
  const [customHeight, setCustomHeight] = useState<number>(0);
  const [aspectRatioLocked, setAspectRatioLocked] = useState<boolean>(true);
  const [outputFormat, setOutputFormat] = useState<string>('original');
  const [targetFileSize, setTargetFileSize] = useState<number>(0);
  const [fileSizeUnit, setFileSizeUnit] = useState<'KB' | 'MB'>('KB');

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
    console.log('Crop functionality to be implemented');
  };

  const handleConvert = (format: string) => {
    setOutputFormat(format);
  };

  const handleCompress = () => {
    console.log('Compress functionality applied via quality slider');
  };

  const handlePresetSelect = (preset: AVPreset) => {
    setSelectedPreset(preset);

    if (images.length > 0) {
      const originalImage = images[0];
      const isUpscaling = preset.width > originalImage.width || preset.height > originalImage.height;

      if (isUpscaling) {
        setUpscaleInfo({
          original: `${originalImage.width}×${originalImage.height}`,
          target: `${preset.width}×${preset.height}`
        });
        setShowUpscaleWarning(true);
      }
    }
  };

  return (
    <div className="dark h-screen bg-background text-foreground flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-card border-b border-border px-6 py-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <img src="/image.png" alt="Logo" className="w-8 h-8" />
          <div>
            <h1 className="text-xl font-bold">AV Image Resizer</h1>
            <p className="text-sm text-muted-foreground">Professional image optimization for AV technicians</p>
          </div>
        </div>
      </header>

      {/* Upload Zone */}
      <UploadZone onFilesAdded={handleFilesAdded} hasImages={images.length > 0} />

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Settings */}
        <LeftPanel
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          selectedPreset={selectedPreset}
          onPresetSelect={handlePresetSelect}
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
        />

        {/* Right Panel - Preview */}
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
        />
      </div>

      {/* Upscale Warning Modal */}
      {showUpscaleWarning && upscaleInfo && (
        <UpscaleWarningModal
          originalDimensions={upscaleInfo.original}
          targetDimensions={upscaleInfo.target}
          onClose={() => setShowUpscaleWarning(false)}
          onContinue={() => setShowUpscaleWarning(false)}
        />
      )}
    </div>
  );
}

export default App;
