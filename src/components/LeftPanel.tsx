import { AVPreset } from '../App';
import AVPresetsTab from './AVPresetsTab';
import CustomTab from './CustomTab';
import BatchTab from './BatchTab';
import { ImageData } from '../App';
import { LayoutGrid, Settings2, FolderSync } from 'lucide-react';

interface LeftPanelProps {
  activeTab: 'presets' | 'custom' | 'batch';
  setActiveTab: (tab: 'presets' | 'custom' | 'batch') => void;
  selectedPreset: AVPreset | null;
  onPresetSelect: (preset: AVPreset) => void;
  userPresets: AVPreset[];
  onDeleteUserPreset: (id: string) => void;
  onSaveUserPreset: (name: string, width: number, height: number, format: 'jpg' | 'png') => void;
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
  sharpenAmount: number;
  setSharpenAmount: (amount: number) => void;
  isCropEnabled: boolean;
  hasCropBox: boolean;
  onClearCrop: () => void;
  onEnableAutoCrop: () => void;
  isEditingCrop: boolean;
  images: ImageData[];
  onProcessBatch: () => void;
  isProcessing: boolean;
  batchProgress: number;
  batchTarget: number;
  configSummary: string;
}

export default function LeftPanel({
  activeTab,
  setActiveTab,
  selectedPreset,
  onPresetSelect,
  userPresets,
  onDeleteUserPreset,
  onSaveUserPreset,
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
  setFileSizeUnit,
  sharpenAmount,
  setSharpenAmount,
  isCropEnabled,
  hasCropBox,
  onClearCrop,
  onEnableAutoCrop,
  isEditingCrop,
  images,
  onProcessBatch,
  isProcessing,
  batchProgress,
  batchTarget,
  configSummary
}: LeftPanelProps) {
  return (
    <div className="w-[380px] glass border-r border-border/50 flex flex-col overflow-hidden z-20">
      {/* Tabs */}
      <div className="flex p-2 gap-1 bg-secondary/30 flex-shrink-0">
        <button
          onClick={() => setActiveTab('presets')}
          className={`
            flex-1 px-3 py-2.5 rounded-lg font-semibold text-xs transition-all-smooth
            flex items-center justify-center gap-2
            ${activeTab === 'presets'
              ? 'bg-primary text-white shadow-lg shadow-primary/20'
              : 'text-muted-foreground hover:text-foreground hover:bg-card'
            }
          `}
        >
          <LayoutGrid className="w-3.5 h-3.5" />
          AV Presets
        </button>
        <button
          onClick={() => setActiveTab('custom')}
          className={`
            flex-1 px-3 py-2.5 rounded-lg font-semibold text-xs transition-all-smooth
            flex items-center justify-center gap-2
            ${activeTab === 'custom'
              ? 'bg-primary text-white shadow-lg shadow-primary/20'
              : 'text-muted-foreground hover:text-foreground hover:bg-card'
            }
          `}
        >
          <Settings2 className="w-3.5 h-3.5" />
          Custom
        </button>
        <button
          onClick={() => setActiveTab('batch')}
          className={`
            flex-1 px-3 py-2.5 rounded-lg font-semibold text-xs transition-all-smooth
            flex items-center justify-center gap-2
            ${activeTab === 'batch'
              ? 'bg-primary text-white shadow-lg shadow-primary/20'
              : 'text-muted-foreground hover:text-foreground hover:bg-card'
            }
          `}
        >
          <FolderSync className="w-3.5 h-3.5" />
          Batch
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {activeTab === 'presets' && (
          <AVPresetsTab
            selectedPreset={selectedPreset}
            onPresetSelect={onPresetSelect}
            userPresets={userPresets}
            onDeleteUserPreset={onDeleteUserPreset}
            quality={quality}
            setQuality={setQuality}
            sharpenAmount={sharpenAmount}
            setSharpenAmount={setSharpenAmount}
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
            onSaveUserPreset={onSaveUserPreset}
            onCrop={onCrop}
            onConvert={onConvert}
            onCompress={onCompress}
            outputFormat={outputFormat}
            setOutputFormat={setOutputFormat}
            targetFileSize={targetFileSize}
            setTargetFileSize={setTargetFileSize}
            fileSizeUnit={fileSizeUnit}
            setFileSizeUnit={setFileSizeUnit}
            sharpenAmount={sharpenAmount}
            setSharpenAmount={setSharpenAmount}
            isCropEnabled={isCropEnabled}
            hasCropBox={hasCropBox}
            onClearCrop={onClearCrop}
            onEnableAutoCrop={onEnableAutoCrop}
            isEditingCrop={isEditingCrop}
          />
        )}
        {activeTab === 'batch' && (
          <BatchTab
            images={images}
            onProcessBatch={onProcessBatch}
            isProcessing={isProcessing}
            progress={batchProgress}
            targetCount={batchTarget}
            configSummary={configSummary}
          />
        )}
      </div>
    </div>
  );
}
