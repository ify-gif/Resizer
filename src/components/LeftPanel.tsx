import { AVPreset } from '../App';
import AVPresetsTab from './AVPresetsTab';
import CustomTab from './CustomTab';

interface LeftPanelProps {
  activeTab: 'presets' | 'custom' | 'batch';
  setActiveTab: (tab: 'presets' | 'custom' | 'batch') => void;
  selectedPreset: AVPreset | null;
  onPresetSelect: (preset: AVPreset) => void;
  quality: number;
  setQuality: (quality: number) => void;
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
  outputFormat: string;
  setOutputFormat: (format: string) => void;
  targetFileSize: number;
  setTargetFileSize: (size: number) => void;
  fileSizeUnit: 'KB' | 'MB';
  setFileSizeUnit: (unit: 'KB' | 'MB') => void;
}

export default function LeftPanel({
  activeTab,
  setActiveTab,
  selectedPreset,
  onPresetSelect,
  quality,
  setQuality,
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
  outputFormat,
  setOutputFormat,
  targetFileSize,
  setTargetFileSize,
  fileSizeUnit,
  setFileSizeUnit
}: LeftPanelProps) {
  return (
    <div className="w-96 bg-card border-r border-border flex flex-col overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-border bg-muted flex-shrink-0">
        <button
          onClick={() => setActiveTab('presets')}
          className={`
            flex-1 px-4 py-3 font-medium text-sm transition-colors
            flex items-center justify-center gap-2
            ${activeTab === 'presets'
              ? 'bg-card text-foreground border-b-2 border-primary'
              : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
            }
          `}
        >
          AV Presets
        </button>
        <button
          onClick={() => setActiveTab('custom')}
          className={`
            flex-1 px-4 py-3 font-medium text-sm transition-colors
            flex items-center justify-center gap-2
            ${activeTab === 'custom'
              ? 'bg-card text-foreground border-b-2 border-primary'
              : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
            }
          `}
        >
          Custom
        </button>
        <button
          onClick={() => setActiveTab('batch')}
          className={`
            flex-1 px-4 py-3 font-medium text-sm transition-colors
            flex items-center justify-center gap-2
            ${activeTab === 'batch'
              ? 'bg-card text-foreground border-b-2 border-primary'
              : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
            }
          `}
        >
          Batch
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'presets' && (
          <AVPresetsTab
            selectedPreset={selectedPreset}
            onPresetSelect={onPresetSelect}
            quality={quality}
            setQuality={setQuality}
          />
        )}
        {activeTab === 'custom' && (
          <CustomTab
            originalWidth={originalWidth}
            originalHeight={originalHeight}
            customWidth={customWidth}
            customHeight={customHeight}
            setCustomWidth={setCustomWidth}
            setCustomHeight={setCustomHeight}
            aspectRatioLocked={aspectRatioLocked}
            setAspectRatioLocked={setAspectRatioLocked}
            onCrop={onCrop}
            onConvert={onConvert}
            onCompress={onCompress}
            quality={quality}
            setQuality={setQuality}
            outputFormat={outputFormat}
            setOutputFormat={setOutputFormat}
            targetFileSize={targetFileSize}
            setTargetFileSize={setTargetFileSize}
            fileSizeUnit={fileSizeUnit}
            setFileSizeUnit={setFileSizeUnit}
          />
        )}
        {activeTab === 'batch' && (
          <div className="p-6 text-center text-muted-foreground">
            Batch processing options coming soon
          </div>
        )}
      </div>
    </div>
  );
}
