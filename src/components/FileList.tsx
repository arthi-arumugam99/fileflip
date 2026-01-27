import { FileItem as FileItemType, SupportedFormat } from '../types';
import { FileItem } from './FileItem';

interface FileListProps {
  files: FileItemType[];
  onRemove: (id: string) => void;
  onClear: () => void;
  globalFormat: SupportedFormat | null;
  onFormatChange: (id: string, format: SupportedFormat) => void;
}

export function FileList({ files, onRemove, onClear, globalFormat, onFormatChange }: FileListProps) {
  if (files.length === 0) {
    return null;
  }

  const completedCount = files.filter(f => f.status === 'complete').length;
  const errorCount = files.filter(f => f.status === 'error').length;

  return (
    <div className="flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-navy">
            FILES
          </h2>
          <span className="tag-brutal bg-navy text-white text-[10px]">
            {files.length}
          </span>
          {completedCount > 0 && (
            <span className="tag-brutal bg-green text-navy text-[10px]">
              {completedCount} DONE
            </span>
          )}
          {errorCount > 0 && (
            <span className="tag-brutal bg-coral text-white text-[10px]">
              {errorCount} FAILED
            </span>
          )}
        </div>
        <button
          onClick={onClear}
          className="btn-brutal btn-ghost text-xs py-1.5 px-3"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
          CLEAR ALL
        </button>
      </div>

      {/* File List */}
      <div className="flex flex-col gap-2 max-h-80 overflow-y-auto pr-1">
        {files.map((file) => (
          <FileItem
            key={file.id}
            file={file}
            onRemove={onRemove}
            selectedFormat={globalFormat}
            onFormatChange={onFormatChange}
          />
        ))}
      </div>
    </div>
  );
}
