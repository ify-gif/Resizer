import { Play, Package, CheckCircle2, Loader2 } from 'lucide-react';
import { ImageData } from '../App';

interface BatchTabProps {
    images: ImageData[];
    onProcessBatch: () => void;
    isProcessing: boolean;
    progress: number;
    targetCount: number;
    configSummary: string;
}

export default function BatchTab({
    images,
    onProcessBatch,
    isProcessing,
    progress,
    targetCount,
    configSummary
}: BatchTabProps) {

    if (images.length === 0) {
        return (
            <div className="p-8 text-center animate-in fade-in zoom-in duration-300">
                <div className="w-16 h-16 bg-secondary/30 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-dashed border-border">
                    <Package className="w-8 h-8 text-muted-foreground/30" />
                </div>
                <h4 className="font-bold text-sm mb-1 text-muted-foreground">Queue Empty</h4>
                <p className="text-[10px] text-muted-foreground/60 max-w-[200px] mx-auto leading-relaxed">
                    Upload multiple images to the workbench to unlock batch processing.
                </p>
            </div>
        );
    }

    return (
        <div className="p-5 space-y-6 animate-in slide-in-from-right-4 duration-500">

            {/* Header / Status */}
            <div className="space-y-2">
                <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] px-1 flex items-center gap-2">
                    Batch Queue
                    <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-[9px]">{images.length}</span>
                </h3>

                {/* Config Summary Card */}
                <div className="bg-card/50 border border-border/50 rounded-lg p-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Package className="w-4 h-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                        <div className="text-[10px] font-bold text-foreground">Active Configuration</div>
                        <div className="text-[9px] font-mono text-muted-foreground truncate" title={configSummary}>
                            {configSummary}
                        </div>
                    </div>
                </div>
            </div>

            {/* File List (Scrollable) */}
            <div className="border border-border/50 rounded-xl bg-card overflow-hidden flex flex-col max-h-[300px]">
                <div className="overflow-y-auto p-1 space-y-1 custom-scrollbar">
                    {images.map((img, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-2 hover:bg-secondary/50 rounded-lg transition-colors group">
                            <div className="w-8 h-8 rounded bg-black/20 flex-shrink-0 overflow-hidden relative border border-border/20">
                                <img src={img.preview} className="w-full h-full object-cover" alt="" />
                                {progress > idx && (
                                    <div className="absolute inset-0 bg-primary/80 flex items-center justify-center animate-in fade-in">
                                        <CheckCircle2 className="w-4 h-4 text-white" />
                                    </div>
                                )}
                                {isProcessing && progress === idx && (
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                        <Loader2 className="w-4 h-4 text-primary animate-spin" />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-[10px] font-medium truncate text-foreground/80">{img.file.name}</div>
                                <div className="text-[9px] text-muted-foreground font-mono">{img.width} × {img.height}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Action Area */}
            <div className="pt-2">
                {isProcessing ? (
                    <div className="bg-secondary/30 border border-border/50 rounded-xl p-4 space-y-3">
                        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
                            <span>Processing...</span>
                            <span>{Math.round((progress / images.length) * 100)}%</span>
                        </div>
                        <div className="h-1.5 bg-black/20 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-primary transition-all duration-300 ease-out"
                                style={{ width: `${(progress / targetCount) * 100}%` }}
                            />
                        </div>
                        <p className="text-[9px] text-center text-muted-foreground animate-pulse">
                            Generating optimized assets...
                        </p>
                    </div>
                ) : (
                    <button
                        onClick={onProcessBatch}
                        className="w-full py-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 group"
                    >
                        <span>Start Batch Process</span>
                        <Play className="w-4 h-4 fill-current group-hover:translate-x-0.5 transition-transform" />
                    </button>
                )}
            </div>
        </div>
    );
}
