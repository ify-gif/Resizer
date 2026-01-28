import { AV_PRESETS, AVPreset } from '../App';
import { Check, Info, Trash2, User, Zap } from 'lucide-react';

interface AVPresetsTabProps {
  selectedPreset: AVPreset | null;
  onPresetSelect: (preset: AVPreset) => void;
  userPresets: AVPreset[];
  onDeleteUserPreset: (id: string) => void;
  quality: number;
  setQuality: (quality: number) => void;
  sharpenAmount: number;
  setSharpenAmount: (amount: number) => void;
}

export default function AVPresetsTab({
  selectedPreset,
  onPresetSelect,
  userPresets,
  onDeleteUserPreset,
  quality,
  setQuality,
  sharpenAmount,
  setSharpenAmount
}: AVPresetsTabProps) {
  return (
    <div className="p-5 space-y-6">
      {/* User Presets (My Bench) */}
      {userPresets.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] px-1 flex items-center gap-2">
            <User className="w-3 h-3" />
            My Bench
          </h3>
          <div className="space-y-2.5">
            {userPresets.map((preset) => (
              <div key={preset.id} className="relative group">
                <button
                  onClick={() => onPresetSelect(preset)}
                  className={`
                    w-full text-left p-4 rounded-xl border transition-all-smooth relative
                    ${selectedPreset?.id === preset.id
                      ? 'bg-primary/10 border-primary ring-1 ring-primary/50 shadow-lg shadow-primary/5'
                      : 'bg-card border-border/50 hover:border-primary/40 hover:bg-secondary/50'
                    }
                  `}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className={`font-bold text-sm tracking-tight transition-colors ${selectedPreset?.id === preset.id ? 'text-primary' : 'text-foreground'}`}>
                          {preset.name}
                        </h4>
                        {selectedPreset?.id === preset.id && (
                          <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/30">
                            <Check className="w-3 h-3 text-white" strokeWidth={3} />
                          </div>
                        )}
                      </div>
                      <p className="text-[11px] font-mono font-medium text-primary/80 mt-1 uppercase tracking-wider">
                        {preset.width} × {preset.height} px
                      </p>
                    </div>
                  </div>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteUserPreset(preset.id);
                  }}
                  className="absolute bottom-4 right-4 p-1.5 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-md transition-all"
                  title="Delete Preset"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Presets Grid */}
      <div className="space-y-3">
        <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] px-1">
          Optimization Standard
        </h3>
        <div className="space-y-2.5">
          {AV_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => onPresetSelect(preset)}
              className={`
                w-full text-left p-4 rounded-xl border transition-all-smooth relative group
                ${selectedPreset?.id === preset.id
                  ? 'bg-primary/10 border-primary ring-1 ring-primary/50 shadow-lg shadow-primary/5'
                  : 'bg-card border-border/50 hover:border-primary/40 hover:bg-secondary/50'
                }
              `}
            >
              <div className="flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className={`font-bold text-sm tracking-tight transition-colors ${selectedPreset?.id === preset.id ? 'text-primary' : 'text-foreground'}`}>
                      {preset.name}
                    </h4>
                    {selectedPreset?.id === preset.id && (
                      <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/30">
                        <Check className="w-3 h-3 text-white" strokeWidth={3} />
                      </div>
                    )}
                  </div>
                  <p className="text-[11px] font-mono font-medium text-primary/80 mt-1 uppercase tracking-wider">
                    {preset.width} × {preset.height} px
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed line-clamp-2">
                    {preset.useCase}
                  </p>
                  <div className="flex items-center gap-2 mt-3">
                    <span className={`
                      text-[9px] px-2 py-0.5 font-bold rounded-md border tracking-widest
                      ${preset.format === 'png'
                        ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-500'
                        : 'bg-orange-500/10 border-orange-500/20 text-orange-500'
                      }
                    `}>
                      {preset.format.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Quality Slider */}
      {selectedPreset && (
        <div className="pt-6 border-t border-border/50">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                Compression Density
                <Info className="w-3 h-3 opacity-40" />
              </label>
              <span className="text-sm font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                {quality}%
              </span>
            </div>
            <div className="relative pt-1">
              <input
                type="range"
                min="1"
                max="100"
                value={quality}
                onChange={(e) => setQuality(parseInt(e.target.value))}
                className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>
            <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">
              <span>Max Performance</span>
              <span>Ultra Fidelity</span>
            </div>
          </div>

          {/* Precision Detail (Sharpening) */}
          <div className="space-y-4 pt-6 border-t border-border/50">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
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
            <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">
              <span>Original Softness</span>
              <span>Ultra Definition</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
