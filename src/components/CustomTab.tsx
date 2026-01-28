import { useState, useEffect } from 'react';

interface CustomTabProps {
  originalWidth: number;
  originalHeight: number;
  customWidth: number;
  customHeight: number;
  setCustomWidth: (width: number) => void;
  setCustomHeight: (height: number) => void;
  aspectRatioLocked: boolean;
  setAspectRatioLocked: (locked: boolean) => void;
  onCrop: () => void;
  onConvert: (format: string) => void;
  onCompress: () => void;
  quality: number;
  setQuality: (quality: number) => void;
  outputFormat: string;
  setOutputFormat: (format: string) => void;
  targetFileSize: number;
  setTargetFileSize: (size: number) => void;
  fileSizeUnit: 'KB' | 'MB';
  setFileSizeUnit: (unit: 'KB' | 'MB') => void;
}

export default function CustomTab({
  originalWidth,
  originalHeight,
  customWidth,
  customHeight,
  setCustomWidth,
  setCustomHeight,
  aspectRatioLocked,
  setAspectRatioLocked,
  onCrop,
  onConvert,
  onCompress,
  quality,
  setQuality,
  outputFormat,
  setOutputFormat,
  targetFileSize,
  setTargetFileSize,
  fileSizeUnit,
  setFileSizeUnit
}: CustomTabProps) {
  const [aspectRatio, setAspectRatio] = useState(originalWidth / originalHeight);
  const [dimensionUnit, setDimensionUnit] = useState<'px' | '%'>('px');

  useEffect(() => {
    if (originalWidth && originalHeight) {
      setAspectRatio(originalWidth / originalHeight);
    }
  }, [originalWidth, originalHeight]);

  const handleWidthChange = (value: number) => {
    setCustomWidth(value);
    if (aspectRatioLocked && aspectRatio) {
      setCustomHeight(Math.round(value / aspectRatio));
    }
  };

  const handleHeightChange = (value: number) => {
    setCustomHeight(value);
    if (aspectRatioLocked && aspectRatio) {
      setCustomWidth(Math.round(value * aspectRatio));
    }
  };

  return (
    <div className="p-4 space-y-6">
      {/* Operations */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2">
          Operations
        </h3>

        {/* Crop Dropdown */}
        <div className="relative group">
          <button
            onClick={onCrop}
            className="w-full flex items-center gap-3 px-4 py-3 bg-muted hover:bg-accent border border-border transition-all text-left"
          >
            <span className="font-medium">Crop</span>
          </button>
          <div className="hidden group-hover:block absolute top-full left-0 w-full mt-1 bg-card border border-border shadow-xl z-10 overflow-hidden">
            <button className="w-full px-4 py-2 text-left text-sm hover:bg-muted transition-colors">
              Crop Image
            </button>
            <button className="w-full px-4 py-2 text-left text-sm hover:bg-muted transition-colors">
              Crop PNG
            </button>
            <button className="w-full px-4 py-2 text-left text-sm hover:bg-muted transition-colors">
              Crop WebP
            </button>
            <button className="w-full px-4 py-2 text-left text-sm hover:bg-muted transition-colors">
              Crop JPG
            </button>
          </div>
        </div>

        {/* Compress Dropdown */}
        <div className="relative group">
          <button
            onClick={onCompress}
            className="w-full flex items-center gap-3 px-4 py-3 bg-muted hover:bg-accent border border-border transition-all text-left"
          >
            <span className="font-medium">Compress</span>
          </button>
          <div className="hidden group-hover:block absolute top-full left-0 w-full mt-1 bg-card border border-border shadow-xl z-10 overflow-hidden">
            <button className="w-full px-4 py-2 text-left text-sm hover:bg-muted transition-colors">
              Image Compressor
            </button>
            <button className="w-full px-4 py-2 text-left text-sm hover:bg-muted transition-colors">
              Compress JPEG
            </button>
            <button className="w-full px-4 py-2 text-left text-sm hover:bg-muted transition-colors">
              PNG Compressor
            </button>
            <button className="w-full px-4 py-2 text-left text-sm hover:bg-muted transition-colors">
              GIF Compressor
            </button>
          </div>
        </div>

        {/* Convert Dropdown */}
        <div className="relative group">
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-muted hover:bg-accent border border-border transition-all text-left">
            <span className="font-medium">Convert</span>
          </button>
          <div className="hidden group-hover:block absolute top-full left-0 w-full mt-1 bg-card border border-border shadow-xl z-10 overflow-hidden max-h-64 overflow-y-auto">
            <button
              onClick={() => onConvert('jpg')}
              className="w-full px-4 py-2 text-left text-sm hover:bg-muted transition-colors"
            >
              HEIC to JPG
            </button>
            <button
              onClick={() => onConvert('png')}
              className="w-full px-4 py-2 text-left text-sm hover:bg-muted transition-colors"
            >
              WebP to PNG
            </button>
            <button
              onClick={() => onConvert('jpg')}
              className="w-full px-4 py-2 text-left text-sm hover:bg-muted transition-colors"
            >
              WebP to JPG
            </button>
            <button
              onClick={() => onConvert('jpg')}
              className="w-full px-4 py-2 text-left text-sm hover:bg-muted transition-colors"
            >
              PNG to JPG
            </button>
            <button
              onClick={() => onConvert('svg')}
              className="w-full px-4 py-2 text-left text-sm hover:bg-muted transition-colors"
            >
              PNG to SVG
            </button>
          </div>
        </div>
      </div>

      {/* Custom Dimensions */}
      <div className="space-y-3 pt-4 border-t border-border">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Dimensions
          </h3>
          <button
            onClick={() => setAspectRatioLocked(!aspectRatioLocked)}
            className={`px-3 py-1 text-xs font-medium transition-colors ${
              aspectRatioLocked
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-foreground hover:bg-accent'
            }`}
            title={aspectRatioLocked ? 'Unlock aspect ratio' : 'Lock aspect ratio'}
          >
            {aspectRatioLocked ? 'LOCKED' : 'UNLOCKED'}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-muted-foreground mb-2">Width</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={customWidth || ''}
                onChange={(e) => handleWidthChange(parseInt(e.target.value) || 0)}
                placeholder="Enter Width"
                className="flex-1 bg-input border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <select
                value={dimensionUnit}
                onChange={(e) => setDimensionUnit(e.target.value as 'px' | '%')}
                className="bg-input border border-border px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="px">px</option>
                <option value="%">%</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs text-muted-foreground mb-2">Height</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={customHeight || ''}
                onChange={(e) => handleHeightChange(parseInt(e.target.value) || 0)}
                placeholder="Enter Height"
                className="flex-1 bg-input border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <select
                value={dimensionUnit}
                onChange={(e) => setDimensionUnit(e.target.value as 'px' | '%')}
                className="bg-input border border-border px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="px">px</option>
                <option value="%">%</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Quality Slider */}
      <div className="space-y-3 pt-4 border-t border-border">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Quality</label>
          <span className="text-sm font-mono text-primary">{quality}%</span>
        </div>
        <input
          type="range"
          min="1"
          max="100"
          value={quality}
          onChange={(e) => setQuality(parseInt(e.target.value))}
          className="w-full h-2 bg-muted appearance-none cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-4
            [&::-webkit-slider-thumb]:h-4
            [&::-webkit-slider-thumb]:bg-primary
            [&::-webkit-slider-thumb]:cursor-pointer
            [&::-webkit-slider-thumb]:hover:bg-primary/90
            [&::-webkit-slider-thumb]:transition-colors
            [&::-moz-range-thumb]:w-4
            [&::-moz-range-thumb]:h-4
            [&::-moz-range-thumb]:bg-primary
            [&::-moz-range-thumb]:border-0
            [&::-moz-range-thumb]:cursor-pointer
            [&::-moz-range-thumb]:hover:bg-primary/90
            [&::-moz-range-thumb]:transition-colors"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Lower size</span>
          <span>Higher quality</span>
        </div>
      </div>

      {/* Export Settings */}
      <div className="space-y-3 pt-4 border-t border-border">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Export Settings
        </h3>

        {/* Target File Size */}
        <div>
          <label className="block text-sm mb-2">
            Target File Size <span className="text-muted-foreground">(optional)</span>
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              value={targetFileSize || ''}
              onChange={(e) => setTargetFileSize(parseInt(e.target.value) || 0)}
              placeholder="Max file size"
              className="flex-1 bg-input border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <select
              value={fileSizeUnit}
              onChange={(e) => setFileSizeUnit(e.target.value as 'KB' | 'MB')}
              className="bg-input border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="KB">KB</option>
              <option value="MB">MB</option>
            </select>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Set a max output file size. Only works for JPG files
          </p>
        </div>

        {/* Save Image As */}
        <div>
          <label className="block text-sm mb-2">Save Image As</label>
          <select
            value={outputFormat}
            onChange={(e) => setOutputFormat(e.target.value)}
            className="w-full bg-input border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="original">Original</option>
            <option value="jpg">JPG</option>
            <option value="png">PNG</option>
            <option value="webp">WEBP</option>
          </select>
        </div>
      </div>
    </div>
  );
}
