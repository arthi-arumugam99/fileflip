import { SupportedFormat, FORMAT_INFO, MediaCategory, getFormatsByCategory, ToolAvailability, requiresExternalTool } from '../types';

interface ConversionPanelProps {
  pendingCount: number;
  convertingCount: number;
  completedCount: number;
  errorCount: number;
  quality: number;
  onQualityChange: (quality: number) => void;
  onConvert: () => void;
  onCancel: () => void;
  isConverting: boolean;
  globalFormat: SupportedFormat | null;
  onGlobalFormatChange: (format: SupportedFormat) => void;
  activeCategory?: MediaCategory;
  toolsAvailable?: ToolAvailability;
}

// Get formats filtered by tool availability
function getAvailableFormatsForCategory(
  category: MediaCategory | undefined,
  tools?: ToolAvailability
): SupportedFormat[] {
  if (!category) {
    // Default to common image formats
    return ['jpg', 'png', 'webp', 'gif', 'pdf'];
  }

  const allFormats = getFormatsByCategory(category);

  // Filter out formats that require unavailable tools
  return allFormats.filter((format) => {
    const requiredTool = requiresExternalTool(format);
    if (!requiredTool) return true;
    if (!tools) return true; // Assume available if not specified

    switch (requiredTool) {
      case 'ffmpeg':
        return tools.ffmpeg;
      case 'libreoffice':
        return tools.libreoffice;
      case 'pandoc':
        return tools.pandoc;
      default:
        return true;
    }
  });
}

export function ConversionPanel({
  pendingCount,
  convertingCount,
  completedCount,
  errorCount,
  quality,
  onQualityChange,
  onConvert,
  onCancel,
  isConverting,
  globalFormat,
  onGlobalFormatChange,
  activeCategory,
  toolsAvailable,
}: ConversionPanelProps) {
  const totalProcessed = completedCount + errorCount;
  const totalToProcess = pendingCount + convertingCount + totalProcessed;
  const availableFormats = getAvailableFormatsForCategory(activeCategory, toolsAvailable);

  return (
    <div className="card-brutal p-4 bg-cream-dark">
      {/* Conversion Progress */}
      {isConverting && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-navy">CONVERTING...</span>
            <span className="text-sm font-mono text-text-muted">
              {totalProcessed} / {totalToProcess}
            </span>
          </div>
          <div className="progress-brutal">
            <div
              className="progress-brutal-fill"
              style={{ width: `${(totalProcessed / totalToProcess) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Quick Settings */}
      {!isConverting && (
        <div className="grid grid-cols-2 gap-4 mb-4">
          {/* Global Format Selector */}
          <div>
            <label className="block text-xs font-bold text-navy mb-2 uppercase">
              Convert All To
            </label>
            <div className="flex flex-wrap gap-1">
              {availableFormats.slice(0, 8).map((format) => (
                <button
                  key={format}
                  onClick={() => onGlobalFormatChange(format)}
                  className={`tag-brutal text-[10px] transition-all ${
                    globalFormat === format
                      ? 'bg-cyan text-navy'
                      : 'bg-white text-navy hover:bg-cyan/20'
                  }`}
                >
                  {format.toUpperCase()}
                </button>
              ))}
              {availableFormats.length > 8 && (
                <span className="tag-brutal text-[10px] bg-gray-100 text-text-muted">
                  +{availableFormats.length - 8}
                </span>
              )}
            </div>
            {globalFormat && (
              <p className="text-[10px] font-mono text-text-muted mt-1">
                {FORMAT_INFO[globalFormat]?.description}
              </p>
            )}
          </div>

          {/* Quality Quick Adjust */}
          <div>
            <label className="block text-xs font-bold text-navy mb-2 uppercase">
              Quality: {quality}%
            </label>
            <div className="flex gap-1">
              {[50, 75, 90, 100].map((q) => (
                <button
                  key={q}
                  onClick={() => onQualityChange(q)}
                  className={`tag-brutal text-[10px] transition-all ${
                    quality === q
                      ? 'bg-yellow text-navy'
                      : 'bg-white text-navy hover:bg-yellow/20'
                  }`}
                >
                  {q}%
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      {(completedCount > 0 || errorCount > 0) && (
        <div className="flex gap-2 mb-4">
          {completedCount > 0 && (
            <div className="flex-1 p-2 bg-green/20 brutal-border-2 border-green text-center">
              <p className="text-2xl font-bold text-navy">{completedCount}</p>
              <p className="text-[10px] font-mono text-navy uppercase">Completed</p>
            </div>
          )}
          {errorCount > 0 && (
            <div className="flex-1 p-2 bg-coral/20 brutal-border-2 border-coral text-center">
              <p className="text-2xl font-bold text-coral">{errorCount}</p>
              <p className="text-[10px] font-mono text-coral uppercase">Failed</p>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        {isConverting ? (
          <button
            onClick={onCancel}
            className="btn-brutal btn-danger flex-1"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="6" y="6" width="12" height="12" />
            </svg>
            CANCEL
          </button>
        ) : (
          <button
            onClick={onConvert}
            disabled={pendingCount === 0}
            className="btn-brutal btn-primary flex-1"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
            CONVERT {pendingCount > 0 ? `(${pendingCount})` : ''}
          </button>
        )}
      </div>

      {/* Keyboard Shortcut Hint */}
      {!isConverting && pendingCount > 0 && (
        <p className="text-[10px] font-mono text-text-muted text-center mt-2">
          Press <span className="tag-brutal bg-navy text-white px-1 py-0.5 text-[8px]">CTRL</span> + <span className="tag-brutal bg-navy text-white px-1 py-0.5 text-[8px]">ENTER</span> to convert
        </p>
      )}
    </div>
  );
}
