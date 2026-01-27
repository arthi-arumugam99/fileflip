import { FileItem as FileItemType, formatFileSize, getAvailableFormats, SupportedFormat, formatDuration } from '../types';

interface FileItemProps {
  file: FileItemType;
  onRemove: (id: string) => void;
  selectedFormat: SupportedFormat | null;
  onFormatChange: (id: string, format: SupportedFormat) => void;
}

// Icons as SVG path data
const ICONS = {
  image: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
  document: 'M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z',
  audio: 'M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3',
  video: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z',
  vector: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01',
};

const FILE_TYPE_COLORS: Record<string, { bg: string; icon: string }> = {
  // Image formats
  heic: { bg: 'bg-purple', icon: ICONS.image },
  heif: { bg: 'bg-purple', icon: ICONS.image },
  png: { bg: 'bg-cyan', icon: ICONS.image },
  jpg: { bg: 'bg-orange', icon: ICONS.image },
  jpeg: { bg: 'bg-orange', icon: ICONS.image },
  webp: { bg: 'bg-green', icon: ICONS.image },
  gif: { bg: 'bg-yellow', icon: ICONS.video },
  bmp: { bg: 'bg-navy-light', icon: ICONS.image },
  tiff: { bg: 'bg-navy-light', icon: ICONS.image },
  tif: { bg: 'bg-navy-light', icon: ICONS.image },
  svg: { bg: 'bg-coral', icon: ICONS.vector },
  ico: { bg: 'bg-purple-dark', icon: ICONS.image },
  avif: { bg: 'bg-green-dark', icon: ICONS.image },
  // Document formats
  pdf: { bg: 'bg-coral', icon: ICONS.document },
  // Audio formats
  mp3: { bg: 'bg-cyan', icon: ICONS.audio },
  wav: { bg: 'bg-cyan-dark', icon: ICONS.audio },
  flac: { bg: 'bg-cyan', icon: ICONS.audio },
  ogg: { bg: 'bg-cyan-dark', icon: ICONS.audio },
  aac: { bg: 'bg-cyan', icon: ICONS.audio },
  m4a: { bg: 'bg-cyan-dark', icon: ICONS.audio },
  // Video formats
  mp4: { bg: 'bg-orange', icon: ICONS.video },
  webm: { bg: 'bg-orange-dark', icon: ICONS.video },
  mkv: { bg: 'bg-orange', icon: ICONS.video },
  avi: { bg: 'bg-orange-dark', icon: ICONS.video },
  mov: { bg: 'bg-orange', icon: ICONS.video },
};

const STATUS_CONFIG: Record<FileItemType['status'], { bg: string; text: string; label: string }> = {
  pending: { bg: 'bg-cream-dark', text: 'text-navy', label: 'READY' },
  converting: { bg: 'bg-cyan', text: 'text-navy', label: 'CONVERTING' },
  complete: { bg: 'bg-green', text: 'text-navy', label: 'DONE' },
  error: { bg: 'bg-coral', text: 'text-white', label: 'FAILED' },
};

const CATEGORY_LABELS: Record<string, string> = {
  image: 'IMAGE',
  document: 'DOC',
  audio: 'AUDIO',
  video: 'VIDEO',
};

export function FileItem({ file, onRemove, selectedFormat, onFormatChange }: FileItemProps) {
  const typeConfig = FILE_TYPE_COLORS[file.extension] || { bg: 'bg-navy', icon: ICONS.document };
  const statusConfig = STATUS_CONFIG[file.status];
  const availableFormats = getAvailableFormats(file.extension);

  // Auto-select first format if none selected
  const currentFormat = file.targetFormat || selectedFormat || availableFormats[0];

  return (
    <div className="card-brutal p-3 group hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#1A1A2E] transition-all duration-100">
      <div className="flex items-center gap-3">
        {/* File Type Icon */}
        <div className={`w-12 h-12 ${typeConfig.bg} brutal-border-2 brutal-shadow-sm flex items-center justify-center flex-shrink-0`}>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d={typeConfig.icon} />
          </svg>
        </div>

        {/* File Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-navy truncate" title={file.name}>
            {file.name}
          </p>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="tag-brutal text-[10px] bg-cream-dark">
              {file.extension.toUpperCase()}
            </span>
            <span className={`tag-brutal text-[10px] ${
              file.category === 'audio' ? 'bg-cyan text-navy' :
              file.category === 'video' ? 'bg-orange text-navy' :
              file.category === 'document' ? 'bg-coral text-white' :
              'bg-purple text-white'
            }`}>
              {CATEGORY_LABELS[file.category] || 'FILE'}
            </span>
            {file.size > 0 && (
              <span className="text-xs font-mono text-text-muted">
                {formatFileSize(file.size)}
              </span>
            )}
            {file.duration && (
              <span className="text-xs font-mono text-text-muted">
                {formatDuration(file.duration)}
              </span>
            )}
          </div>
        </div>

        {/* Format Selector - only show for pending files */}
        {file.status === 'pending' && availableFormats.length > 0 && (
          <div className="flex items-center gap-2">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-text-muted"
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
            <select
              value={currentFormat}
              onChange={(e) => onFormatChange(file.id, e.target.value as SupportedFormat)}
              className="select-brutal text-xs py-1 px-2 min-w-[70px]"
            >
              {availableFormats.map((format) => (
                <option key={format} value={format}>
                  {format.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Status Badge */}
        <span className={`tag-brutal text-[10px] ${statusConfig.bg} ${statusConfig.text} ${file.status === 'converting' ? 'animate-pulse-brutal' : ''}`}>
          {statusConfig.label}
        </span>

        {/* Remove Button */}
        <button
          onClick={() => onRemove(file.id)}
          className="p-2 brutal-border-2 bg-white hover:bg-coral hover:text-white transition-colors opacity-0 group-hover:opacity-100"
          title="Remove file"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Error Message */}
      {file.error && (
        <div className="mt-2 p-2 bg-coral/10 brutal-border-2 border-coral">
          <p className="text-xs text-coral font-mono">{file.error}</p>
        </div>
      )}

      {/* Progress bar for converting state */}
      {file.status === 'converting' && file.progress !== undefined && (
        <div className="mt-3">
          <div className="progress-brutal">
            <div
              className="progress-brutal-fill"
              style={{ width: `${file.progress}%` }}
            />
          </div>
          <p className="text-xs font-mono text-text-muted mt-1 text-right">
            {file.progress}%
          </p>
        </div>
      )}
    </div>
  );
}
