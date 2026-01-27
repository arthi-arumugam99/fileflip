import { useState, useCallback, DragEvent } from 'react';
import { open } from '@tauri-apps/plugin-dialog';
import { IMAGE_EXTENSIONS, DOCUMENT_EXTENSIONS, AUDIO_EXTENSIONS, VIDEO_EXTENSIONS, ALL_EXTENSIONS } from '../types';

interface DropZoneProps {
  onFilesAdded: (paths: string[]) => void;
  disabled?: boolean;
}

export function DropZone({ onFilesAdded, disabled }: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    async (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (disabled) return;

      const files = Array.from(e.dataTransfer.files);
      const paths = files.map((f) => (f as any).path || f.name).filter(Boolean);

      if (paths.length > 0) {
        onFilesAdded(paths);
      }
    },
    [onFilesAdded, disabled]
  );

  const handleClick = useCallback(async () => {
    if (disabled) return;

    try {
      const selected = await open({
        multiple: true,
        filters: [
          {
            name: 'All Supported Files',
            extensions: ALL_EXTENSIONS,
          },
          {
            name: 'Images',
            extensions: IMAGE_EXTENSIONS,
          },
          {
            name: 'Documents',
            extensions: DOCUMENT_EXTENSIONS,
          },
          {
            name: 'Audio',
            extensions: AUDIO_EXTENSIONS,
          },
          {
            name: 'Video',
            extensions: VIDEO_EXTENSIONS,
          },
        ],
      });

      if (selected) {
        const paths = Array.isArray(selected) ? selected : [selected];
        onFilesAdded(paths);
      }
    } catch (error) {
      console.error('Failed to open file dialog:', error);
    }
  }, [onFilesAdded, disabled]);

  return (
    <div
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        relative overflow-hidden
        p-8 min-h-[200px]
        flex flex-col items-center justify-center gap-4
        cursor-pointer select-none
        transition-all duration-150
        ${isDragging
          ? 'bg-yellow brutal-border brutal-shadow-lg scale-[1.02]'
          : 'bg-cream-dark brutal-border brutal-shadow hover:bg-yellow/20'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 pattern-dots opacity-5 pointer-events-none" />

      {/* Icon */}
      <div className={`
        w-20 h-20
        flex items-center justify-center
        brutal-border brutal-shadow-sm
        transition-all duration-150
        ${isDragging ? 'bg-navy text-yellow' : 'bg-white'}
      `}>
        {isDragging ? (
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="animate-bounce-brutal"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
        ) : (
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
            <path d="M12 12v9" />
            <path d="m16 16-4-4-4 4" />
          </svg>
        )}
      </div>

      {/* Text */}
      <div className="text-center z-10">
        <p className="text-xl font-bold text-navy mb-1">
          {isDragging ? 'DROP IT LIKE IT\'S HOT' : 'DROP FILES HERE'}
        </p>
        <p className="text-sm font-mono text-text-muted">
          or click to browse your files
        </p>
      </div>

      {/* Supported formats tags - organized by category */}
      <div className="flex flex-wrap justify-center gap-2 mt-2 max-w-md">
        {/* Images */}
        <span className="tag-brutal bg-purple text-white text-[10px]">PNG</span>
        <span className="tag-brutal bg-purple text-white text-[10px]">JPG</span>
        <span className="tag-brutal bg-purple text-white text-[10px]">WEBP</span>
        <span className="tag-brutal bg-purple text-white text-[10px]">SVG</span>
        <span className="tag-brutal bg-purple text-white text-[10px]">AVIF</span>
        {/* Documents */}
        <span className="tag-brutal bg-coral text-white text-[10px]">PDF</span>
        {/* Audio */}
        <span className="tag-brutal bg-cyan text-navy text-[10px]">MP3</span>
        <span className="tag-brutal bg-cyan text-navy text-[10px]">WAV</span>
        <span className="tag-brutal bg-cyan text-navy text-[10px]">FLAC</span>
        {/* Video */}
        <span className="tag-brutal bg-orange text-navy text-[10px]">MP4</span>
        <span className="tag-brutal bg-orange text-navy text-[10px]">WEBM</span>
        <span className="tag-brutal bg-orange text-navy text-[10px]">MKV</span>
      </div>

      {/* Corner decorations */}
      <div className="absolute top-3 left-3 w-4 h-4 border-t-3 border-l-3 border-navy" />
      <div className="absolute top-3 right-3 w-4 h-4 border-t-3 border-r-3 border-navy" />
      <div className="absolute bottom-3 left-3 w-4 h-4 border-b-3 border-l-3 border-navy" />
      <div className="absolute bottom-3 right-3 w-4 h-4 border-b-3 border-r-3 border-navy" />
    </div>
  );
}
