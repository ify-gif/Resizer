import { AV_PRESETS, AVPreset } from '../App';

interface AVPresetsTabProps {
  selectedPreset: AVPreset | null;
  onPresetSelect: (preset: AVPreset) => void;
  quality: number;
  setQuality: (quality: number) => void;
}

export default function AVPresetsTab({
  selectedPreset,
  onPresetSelect,
  quality,
  setQuality
}: AVPresetsTabProps) {
  return (
    <div className="p-4 space-y-4">
      {/* Presets Grid */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2">
          Select Preset
        </h3>
        <div className="space-y-2">
          {AV_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => onPresetSelect(preset)}
              className={`
                w-full text-left p-4 border transition-all
                ${selectedPreset?.id === preset.id
                  ? 'bg-accent border-primary'
                  : 'bg-muted border-border hover:border-primary/50 hover:bg-accent'
                }
              `}
            >
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-semibold truncate">
                      {preset.name}
                    </h4>
                    {selectedPreset?.id === preset.id && (
                      <span className="text-xs font-medium text-primary flex-shrink-0">SELECTED</span>
                    )}
                  </div>
                  <p className="text-xs text-primary font-mono mt-1">
                    {preset.width} × {preset.height}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {preset.useCase}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`
                      text-xs px-2 py-0.5 font-medium border
                      ${preset.format === 'png'
                        ? 'bg-secondary border-border'
                        : 'bg-secondary border-border'
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
        <div className="pt-4 border-t border-border">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">
                Quality
              </label>
              <span className="text-sm font-mono text-primary">
                {quality}%
              </span>
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
        </div>
      )}
    </div>
  );
}
