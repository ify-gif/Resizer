import { useDropzone } from 'react-dropzone';
import { UploadCloud, ImagePlus, Plus } from 'lucide-react';

interface UploadZoneProps {
  onFilesAdded: (files: File[]) => void;
  hasImages: boolean;
}

export default function UploadZone({ onFilesAdded, hasImages }: UploadZoneProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp', '.heic']
    },
    onDrop: onFilesAdded,
    multiple: true
  });

  if (hasImages) {
    return (
      <div
        {...getRootProps()}
        className={`
          glass border-2 border-dashed p-4 rounded-xl text-center cursor-pointer
          transition-all duration-300 group
          ${isDragActive ? 'border-primary bg-primary/5 scale-[0.99]' : 'border-border/40 hover:border-primary/40 hover:bg-primary/5'}
        `}
      >
        <input {...getInputProps()} />
        <div className="flex items-center justify-center gap-3">
          <div className={`p-1.5 rounded-lg transition-colors ${isDragActive ? 'bg-primary text-white' : 'bg-secondary text-primary'}`}>
            <Plus className="w-4 h-4" />
          </div>
          <p className="text-xs font-bold tracking-tight">
            {isDragActive ? 'Release to Append Assets' : 'Drop additional images or click to browse'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={`
        relative w-full max-w-2xl aspect-[16/10] flex flex-col items-center justify-center
        border-2 border-dashed rounded-[2.5rem] transition-all duration-700 cursor-pointer
        ${isDragActive
          ? 'border-primary bg-primary/5 scale-[0.98] shadow-[0_0_60px_rgba(59,130,246,0.1)]'
          : 'border-border/40 bg-card/30 hover:border-primary/30 hover:bg-card/50 shadow-2xl shadow-black/20'
        }
      `}
    >
      <input {...getInputProps()} />

      <div className={`
        w-28 h-28 rounded-[2rem] flex items-center justify-center mb-8 transition-all duration-700
        ${isDragActive ? 'bg-primary text-white scale-110 rotate-3 shadow-2xl shadow-primary/30' : 'bg-card text-muted-foreground border border-border/50'}
      `}>
        {isDragActive ? <ImagePlus className="w-12 h-12" /> : <UploadCloud className="w-12 h-12" />}
      </div>

      <div className="text-center px-12">
        <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed font-medium">
          {isDragActive ? 'Ready for precision ingest...' : 'Drop your high-precision assets here to begin optimization.'}
          <br />
          Supports Ultra-HD JPG, PNG, WebP and HEIC.
        </p>
      </div>

      {/* Modern UI accents */}
      <div className="absolute top-12 left-12 w-6 h-6 border-t-2 border-l-2 border-primary/20 rounded-tl-xl" />
      <div className="absolute bottom-12 right-12 w-6 h-6 border-b-2 border-r-2 border-primary/20 rounded-br-xl" />
    </div>
  );
}
