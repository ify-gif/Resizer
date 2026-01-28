import { useDropzone } from 'react-dropzone';

interface UploadZoneProps {
  onFilesAdded: (files: File[]) => void;
  hasImages: boolean;
}

export default function UploadZone({ onFilesAdded, hasImages }: UploadZoneProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp']
    },
    onDrop: onFilesAdded,
    multiple: true
  });

  return (
    <div className="px-6 pt-4 pb-2 flex-shrink-0">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed p-6 text-center cursor-pointer
          transition-all duration-200
          ${isDragActive
            ? 'border-primary bg-accent'
            : hasImages
              ? 'border-border bg-card/50 hover:border-primary/50'
              : 'border-border bg-card hover:border-primary'
          }
        `}
      >
        <input {...getInputProps()} />
        <div className="flex items-center justify-center gap-3">
          {isDragActive ? (
            <p className="text-primary font-medium">Drop images here...</p>
          ) : hasImages ? (
            <p className="text-muted-foreground">
              <span className="text-primary font-medium">Click to add more images</span> or drag and drop
            </p>
          ) : (
            <p className="text-muted-foreground">
              <span className="text-primary font-medium">Click to upload</span> or drag and drop images here
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
