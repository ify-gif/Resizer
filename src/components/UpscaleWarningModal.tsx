interface UpscaleWarningModalProps {
  originalDimensions: string;
  targetDimensions: string;
  onClose: () => void;
  onContinue: () => void;
}

export default function UpscaleWarningModal({
  originalDimensions,
  targetDimensions,
  onClose,
  onContinue
}: UpscaleWarningModalProps) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold">Quality Warning</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-muted transition-colors"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-foreground">
            You're upscaling this image. This will result in quality loss and blurriness.
          </p>

          <div className="bg-muted p-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Original size:</span>
              <span className="text-sm font-mono text-primary">{originalDimensions}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Target size:</span>
              <span className="text-sm font-mono text-destructive">{targetDimensions}</span>
            </div>
          </div>

          <div className="bg-destructive/10 border border-destructive/30 p-4">
            <p className="text-sm text-destructive">
              For best quality, use images that are equal to or larger than your target dimensions.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 p-6 border-t border-border">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 bg-muted hover:bg-accent font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onContinue}
            className="flex-1 px-4 py-2.5 bg-destructive hover:bg-destructive/90 text-destructive-foreground font-medium transition-colors"
          >
            Continue Anyway
          </button>
        </div>
      </div>
    </div>
  );
}
