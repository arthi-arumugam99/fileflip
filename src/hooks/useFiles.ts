import { useState, useCallback } from 'react';
import {
  FileItem,
  SupportedFormat,
  getFileExtension,
  isSupported,
  getDefaultFormat,
  getCategory,
  getAvailableFormats
} from '../types';

export function useFiles() {
  const [files, setFiles] = useState<FileItem[]>([]);

  const addFiles = useCallback((paths: string[]) => {
    const newFiles: FileItem[] = paths
      .map((path) => {
        const name = path.replace(/\\/g, "/").split("/").pop() || path;
        const extension = getFileExtension(name);
        const defaultFormat = getDefaultFormat(extension);
        const category = getCategory(extension);

        return {
          id: crypto.randomUUID(),
          name,
          path,
          size: 0,
          type: extension,
          extension,
          category: category || 'image',
          status: 'pending' as const,
          targetFormat: defaultFormat || undefined,
        };
      })
      .filter((file) => isSupported(file.extension));

    setFiles((prev) => {
      const existingPaths = new Set(prev.map((f) => f.path));
      const uniqueNew = newFiles.filter((f) => !existingPaths.has(f.path));
      return [...prev, ...uniqueNew];
    });

    return newFiles.length;
  }, []);

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const clearFiles = useCallback(() => {
    setFiles([]);
  }, []);

  const updateFileStatus = useCallback(
    (id: string, status: FileItem['status'], updates?: Partial<FileItem>) => {
      setFiles((prev) =>
        prev.map((f) => (f.id === id ? { ...f, status, ...updates } : f))
      );
    },
    []
  );

  const updateFileProgress = useCallback((id: string, progress: number) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, progress } : f))
    );
  }, []);

  const setFileFormat = useCallback((id: string, format: SupportedFormat) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, targetFormat: format } : f))
    );
  }, []);

  const setAllFormats = useCallback((format: SupportedFormat) => {
    setFiles((prev) =>
      prev.map((f) => {
        // Only update if this format is available for this file type
        const availableFormats = getAvailableFormats(f.extension);
        if (availableFormats.includes(format)) {
          return { ...f, targetFormat: format };
        }
        return f;
      })
    );
  }, []);

  const resetCompletedFiles = useCallback(() => {
    setFiles((prev) =>
      prev.map((f) =>
        f.status === 'complete' || f.status === 'error'
          ? { ...f, status: 'pending', progress: undefined, error: undefined }
          : f
      )
    );
  }, []);

  const clearCompletedFiles = useCallback(() => {
    setFiles((prev) => prev.filter((f) => f.status !== 'complete'));
  }, []);

  const getFilesForConversion = useCallback(() => {
    return files.filter((f) => f.status === 'pending' && f.targetFormat);
  }, [files]);

  // Get files by category
  const getFilesByCategory = useCallback((category: FileItem['category']) => {
    return files.filter((f) => f.category === category);
  }, [files]);

  return {
    files,
    addFiles,
    removeFile,
    clearFiles,
    updateFileStatus,
    updateFileProgress,
    setFileFormat,
    setAllFormats,
    resetCompletedFiles,
    clearCompletedFiles,
    getFilesForConversion,
    getFilesByCategory,
    hasFiles: files.length > 0,
    pendingCount: files.filter((f) => f.status === 'pending').length,
    convertingCount: files.filter((f) => f.status === 'converting').length,
    completedCount: files.filter((f) => f.status === 'complete').length,
    errorCount: files.filter((f) => f.status === 'error').length,
    // Category counts
    imageCount: files.filter((f) => f.category === 'image').length,
    documentCount: files.filter((f) => f.category === 'document').length,
    audioCount: files.filter((f) => f.category === 'audio').length,
    videoCount: files.filter((f) => f.category === 'video').length,
  };
}
