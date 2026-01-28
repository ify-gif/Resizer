import { useState, useEffect } from 'react';
import { Lock, Unlock, Zap, Scissors, Minimize2, Repeat, BookmarkPlus, ChevronDown, ChevronUp } from 'lucide-react';

interface CustomTabProps {
  originalWidth: number;
  originalHeight: number;
  customWidth: number;
  customHeight: number;
  setCustomWidth: (width: number) => void;
  setCustomHeight: (height: number) => void;
  aspectRatioLocked: boolean;
  setAspectRatioLocked: (locked: boolean) => void;
  onSaveUserPreset: (name: string, width: number, height: number, format: 'jpg' | 'png') => void;
  onCrop: () => void;
  onConvert: (format: string) => void;
  onCompress: () => void;
  outputFormat: string;
  setOutputFormat: (format: string) => void;
  targetFileSize: number;
  setTargetFileSize: (size: number) => void;
  fileSizeUnit: 'KB' | 'MB';
  setFileSizeUnit: (unit: 'KB' | 'MB') => void;
  sharpenAmount: number;
  setSharpenAmount: (amount: number) => void;
  isCropEnabled: boolean;
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
  onSaveUserPreset,
  onCrop,
  onConvert,
  onCompress,
  outputFormat,
  setOutputFormat,
  targetFileSize,
  setTargetFileSize,
  fileSizeUnit,
  setFileSizeUnit,
  sharpenAmount,
  setSharpenAmount,
  isCropEnabled
}: CustomTabProps) {
  const [aspectRatio, setAspectRatio] = useState(originalWidth / originalHeight);
  const [presetName, setPresetName] = useState('');

  // Custom Option States
  const [showCropOptions, setShowCropOptions] = useState(false);
  const [showSlimOptions, setShowSlimOptions] = useState(false);
  const [showMorphOptions, setShowMorphOptions] = useState(false);

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

  const handleSave = () => {
    if (!presetName.trim()) return;
    const format = (outputFormat === 'png' ? 'png' : 'jpg') as 'jpg' | 'png';
    onSaveUserPreset(presetName, customWidth, customHeight, format);
    setPresetName('');
  };

  return (
    <div className="p-5 space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">

      {/* Optimization Tools Rebirth (Quick Actions + Custom Options) */}
      <div className="space-y-3">
        <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] px-1">
          Optimization Tools
        </h3>
        <div className="grid grid-cols-1 gap-3">

          {/* CROP CARD */}
          <div className="bg-card border border-border/50 rounded-xl overflow-hidden shadow-sm transition-all hover:border-primary/30">
            <div className="flex items-center p-1">
              <button
                onClick={onCrop}
                className={`flex-1 flex items-center justify-center gap-3 py-3 px-2 rounded-lg transition-colors ${isCropEnabled ? 'bg-primary/10 text-primary' : 'hover:bg-secondary/50 text-muted-foreground'}`}
              >
                <Scissors className="w-4 h-4" />
                <div className="text-left">
                  <div className="text-[10px] font-bold uppercase tracking-tight">Crop</div>
                  <div className="text-[9px] opacity-70 font-mono">{isCropEnabled ? 'AUTO-CENTER ACTIVE' : 'OFF'}</div>
                </div>
              </button>
              <div className="w-px h-8 bg-border/50 mx-1" />
              <button
                onClick={() => setShowCropOptions(!showCropOptions)}
                className={`p-3 rounded-lg hover:bg-secondary/50 transition-colors ${showCropOptions ? 'text-primary' : 'text-muted-foreground'}`}
                title="Custom Options"
              >
                {showCropOptions ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>
            {showCropOptions && (
              <div className="bg-secondary/20 p-3 border-t border-border/50 space-y-2 animate-in slide-in-from-top-2">
                <div className="flex items-center justify-between text-[10px] font-medium text-muted-foreground">
                  <span>Logic</span>
                  <span className="text-primary font-bold">Center-Weighted</span>
                </div>
                <p className="text-[9px] text-muted-foreground/70 leading-relaxed">
                  Automatically calculates the best center cut to fill target dimensions without stretching.
                </p>
              </div>
            )}
          </div>

          {/* SLIM CARD */}
          <div className="bg-card border border-border/50 rounded-xl overflow-hidden shadow-sm transition-all hover:border-primary/30">
            <div className="flex items-center p-1">
              <button
                onClick={onCompress}
                className="flex-1 flex items-center justify-center gap-3 py-3 px-2 rounded-lg hover:bg-secondary/50 text-muted-foreground hover:text-primary transition-colors"
              >
                <Minimize2 className="w-4 h-4" />
                <div className="text-left">
                  <div className="text-[10px] font-bold uppercase tracking-tight">Slim</div>
                  <div className="text-[9px] opacity-70 font-mono">1-CLICK OPTIMIZE</div>
                </div>
              </button>
              <div className="w-px h-8 bg-border/50 mx-1" />
              <button
                onClick={() => setShowSlimOptions(!showSlimOptions)}
                className={`p-3 rounded-lg hover:bg-secondary/50 transition-colors ${showSlimOptions ? 'text-primary' : 'text-muted-foreground'}`}
                title="Custom Options"
              >
                {showSlimOptions ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>
            {showSlimOptions && (
              <div className="bg-secondary/20 p-3 border-t border-border/50 animate-in slide-in-from-top-2">
                {/* Target File Size Controls */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                      Payload Ceiling
                      <Zap className="w-3 h-3 text-orange-500" />
                    </label>
                    <div className="flex bg-secondary/50 rounded-lg p-0.5 border border-border/50">
                      {['KB', 'MB'].map((unit) => (
                        <button
                          key={unit}
                          onClick={() => setFileSizeUnit(unit as 'KB' | 'MB')}
                          className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${fileSizeUnit === unit ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground'}`}
                        >
                          {unit}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="relative group">
                    <input
                      type="number"
                      value={targetFileSize || ''}
                      onChange={(e) => setTargetFileSize(parseFloat(e.target.value) || 0)}
                      className="w-full bg-card border border-border/50 rounded-xl px-4 py-3 text-xs font-mono focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all group-hover:border-border"
                      placeholder="UNLIMITED"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                      <span className="text-[10px] font-bold text-muted-foreground/30 uppercase">{fileSizeUnit} MAX</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* MORPH CARD */}
          <div className="bg-card border border-border/50 rounded-xl overflow-hidden shadow-sm transition-all hover:border-primary/30">
            <div className="flex items-center p-1">
              <button
                onClick={() => onConvert('cycle')}
                className="flex-1 flex items-center justify-center gap-3 py-3 px-2 rounded-lg hover:bg-secondary/50 text-muted-foreground hover:text-primary transition-colors"
              >
                <Repeat className="w-4 h-4" />
                <div className="text-left">
                  <div className="text-[10px] font-bold uppercase tracking-tight">Morph</div>
                  <div className="text-[9px] opacity-70 font-mono">CYCLE FORMATS</div>
                </div>
              </button>
              <div className="w-px h-8 bg-border/50 mx-1" />
              <button
                onClick={() => setShowMorphOptions(!showMorphOptions)}
                className={`p-3 rounded-lg hover:bg-secondary/50 transition-colors ${showMorphOptions ? 'text-primary' : 'text-muted-foreground'}`}
                title="Custom Options"
              >
                {showMorphOptions ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>
            {showMorphOptions && (
              <div className="bg-secondary/20 p-3 border-t border-border/50 animate-in slide-in-from-top-2">
                <div className="grid grid-cols-4 gap-2">
                  {['original', 'jpg', 'png', 'webp'].map((format) => (
                    <button
                      key={format}
                      onClick={() => setOutputFormat(format)}
                      className={`
                        py-2 rounded-lg border text-[9px] font-bold uppercase tracking-widest transition-all-smooth
                        ${outputFormat === format
                          ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20'
                          : 'bg-card border-border/50 text-muted-foreground hover:border-primary/40 hover:text-foreground'
                        }
                      `}
                    >
                      {format}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Dimensions section */}
      <div className="space-y-4 pt-4 border-t border-border/50">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
            Geometry Control
          </h3>
          <button
            onClick={() => setAspectRatioLocked(!aspectRatioLocked)}
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[9px] font-bold transition-all ${aspectRatioLocked ? 'bg-primary/20 text-primary border border-primary/20' : 'bg-muted text-muted-foreground border border-border'}`}
          >
            {aspectRatioLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
            {aspectRatioLocked ? 'LOCKED' : 'FREE'}
          </button>
        </div>

        <div className="flex items-baseline justify-between gap-3 relative">
          <div className="flex-1 space-y-2">
            <label className="text-[10px] font-bold text-muted-foreground/60 uppercase ml-1">Width</label>
            <div className="relative group">
              <input
                type="number"
                value={customWidth || ''}
                onChange={(e) => handleWidthChange(parseInt(e.target.value) || 0)}
                className="w-full bg-card border border-border/50 rounded-xl px-4 py-3 text-sm font-mono focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all group-hover:border-border"
                placeholder="PX"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted-foreground/30">PX</span>
            </div>
          </div>

          <button
            onClick={() => {
              const w = customWidth;
              setCustomWidth(customHeight);
              setCustomHeight(w);
            }}
            className="mt-6 p-2 bg-secondary/30 hover:bg-primary/20 hover:text-primary rounded-lg border border-border/50 text-muted-foreground transition-all"
            title="Swap Dimensions"
          >
            <Repeat className="w-3.5 h-3.5 rotate-90" />
          </button>

          <div className="flex-1 space-y-2 text-right">
            <label className="text-[10px] font-bold text-muted-foreground/60 uppercase mr-1">Height</label>
            <div className="relative group">
              <input
                type="number"
                value={customHeight || ''}
                onChange={(e) => handleHeightChange(parseInt(e.target.value) || 0)}
                className="w-full bg-card border border-border/50 rounded-xl px-4 py-3 text-sm font-mono text-right focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all group-hover:border-border"
                placeholder="PX"
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted-foreground/30">PX</span>
            </div>
          </div>
        </div>
      </div>

      {/* Save to Bench section */}
      <div className="space-y-4 pt-4 border-t border-border/50">
        <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] px-1 flex items-center gap-2">
          <BookmarkPlus className="w-3 h-3" />
          Archive Configuration
        </h3>

        <div className="space-y-3">
          <div className="relative group">
            <input
              type="text"
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              className="w-full bg-card border border-border/50 rounded-xl px-4 py-3 text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all group-hover:border-border"
              placeholder="Benchmark Name (e.g. Wall A)"
            />
          </div>

          <button
            onClick={handleSave}
            disabled={!presetName.trim()}
            className={`
              w-full py-3 rounded-xl border text-[10px] font-bold uppercase tracking-widest transition-all px-4
              ${presetName.trim()
                ? 'bg-primary/20 border-primary/40 text-primary hover:bg-primary/30 cursor-pointer'
                : 'bg-muted/50 border-border/50 text-muted-foreground cursor-not-allowed'
              }
            `}
          >
            Add to My Bench
          </button>
        </div>
      </div>

      {/* Precision Detail (Sharpening) */}
      <div className="space-y-4 pt-4 border-t border-border/50">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
            Precision Detail
            <Zap className="w-3 h-3 text-primary" />
          </label>
          <span className="text-sm font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">
            {sharpenAmount}%
          </span>
        </div>
        <div className="relative pt-1">
          <input
            type="range"
            min="0"
            max="100"
            value={sharpenAmount}
            onChange={(e) => setSharpenAmount(parseInt(e.target.value))}
            className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
          />
        </div>
        <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-tighter text-center">
          <span className="flex-1">Mathematical Recovery (Safe)</span>
        </div>
      </div>
    </div>
  );
}
