import { useState, useEffect, useCallback, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { open } from '@tauri-apps/plugin-dialog';
import { Header } from './components/Header';
import { DropZone } from './components/DropZone';
import { FileList } from './components/FileList';
import { ConversionPanel } from './components/ConversionPanel';
import { SettingsPanel } from './components/SettingsPanel';
import { EmptyState } from './components/EmptyState';
import { ToastContainer, useToasts } from './components/Toast';
import { useFiles } from './hooks/useFiles';
import { Settings, SupportedFormat, getCategory, ToolAvailability, MediaCategory } from './types';
import './index.css';

const DEFAULT_SETTINGS: Settings = {
  outputDir: null,
  quality: 90,
  openAfterConvert: true,
  preserveMetadata: true,
  overwriteExisting: false,
  audioBitrate: '192',
  videoCodec: 'h264',
  videoResolution: 'original',
};

function App() {
  const {
    files,
    addFiles,
    removeFile,
    clearFiles,
    setFileFormat,
    updateFileStatus,
    updateFileProgress,
    hasFiles,
    pendingCount,
    convertingCount,
    completedCount,
    errorCount,
    audioCount,
    videoCount,
  } = useFiles();

  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [showSettings, setShowSettings] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [globalFormat, setGlobalFormat] = useState<SupportedFormat | null>(null);
  const [toolsAvailable, setToolsAvailable] = useState<ToolAvailability | null>(null);
  const cancelRequestedRef = useRef(false);
  const { toasts, dismissToast, showSuccess, showError, showWarning } = useToasts();

  // Determine the active category based on files
  const activeCategory: MediaCategory | undefined = (() => {
    if (files.length === 0) return undefined;
    const categories = files.map((f) => f.category);
    const uniqueCategories = [...new Set(categories)];
    if (uniqueCategories.length === 1) return uniqueCategories[0];
    // Mixed categories - return image as default
    return 'image';
  })();

  // Check tools availability on mount
  useEffect(() => {
    invoke<ToolAvailability>('check_tools_available').then(setToolsAvailable).catch(() => {
      setToolsAvailable({ ffmpeg: false, libreoffice: false, pandoc: false });
    });
  }, []);

  // Load settings from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('fileflip-settings');
    if (saved) {
      try {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(saved) });
      } catch {
        // Ignore parse errors
      }
    }
  }, []);

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('fileflip-settings', JSON.stringify(settings));
  }, [settings]);

  // Warn about missing tools based on file types
  useEffect(() => {
    if (!toolsAvailable) return;

    if (!toolsAvailable.ffmpeg && (audioCount > 0 || videoCount > 0)) {
      showWarning(
        'FFmpeg Not Found',
        'Audio/video conversion requires FFmpeg. Please install it.'
      );
    }

    // Check for document files that need LibreOffice
    const hasOfficeFiles = files.some((f) =>
      ['docx', 'doc', 'odt'].includes(f.extension.toLowerCase())
    );
    if (!toolsAvailable.libreoffice && hasOfficeFiles) {
      showWarning(
        'LibreOffice Not Found',
        'DOCX/DOC/ODT conversion requires LibreOffice. Please install it.'
      );
    }
  }, [audioCount, videoCount, files, toolsAvailable]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Enter to convert
      if (e.ctrlKey && e.key === 'Enter' && pendingCount > 0 && !isConverting) {
        handleConvert();
      }
      // Escape to cancel or close settings
      if (e.key === 'Escape') {
        if (showSettings) {
          setShowSettings(false);
        } else if (isConverting) {
          cancelRequestedRef.current = true;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pendingCount, isConverting, showSettings]);

  const handleSelectOutputDir = async () => {
    try {
      const selected = await open({
        directory: true,
        multiple: false,
        title: 'Select Output Directory',
      });
      if (selected && typeof selected === 'string') {
        setSettings((prev) => ({ ...prev, outputDir: selected }));
      }
    } catch (error) {
      console.error('Failed to select directory:', error);
    }
  };

  const revealInExplorer = async (path: string) => {
    try {
      await invoke('reveal_in_explorer', { path });
    } catch (error) {
      console.error('Failed to reveal in explorer:', error);
    }
  };

  const handleConvert = useCallback(async () => {
    if (pendingCount === 0) return;

    setIsConverting(true);
    cancelRequestedRef.current = false;

    const pendingFiles = files.filter((f) => f.status === 'pending' && f.targetFormat);
    let successCount = 0;
    let failCount = 0;
    let lastOutputPath: string | null = null;

    for (const file of pendingFiles) {
      if (cancelRequestedRef.current) {
        break;
      }

      updateFileStatus(file.id, 'converting');
      updateFileProgress(file.id, 10);

      try {
        // Simulate some progress
        await new Promise(resolve => setTimeout(resolve, 100));
        updateFileProgress(file.id, 30);

        // Determine bitrate based on file category
        const category = getCategory(file.extension);
        const bitrate = category === 'audio' || category === 'video'
          ? `${settings.audioBitrate}k`
          : undefined;

        // Call the Rust backend for conversion
        const result = await invoke<{ success: boolean; output_path?: string; error?: string }>('cmd_convert_file', {
          inputPath: file.path,
          outputFormat: file.targetFormat,
          quality: settings.quality,
          outputDir: settings.outputDir,
          preserveMetadata: settings.preserveMetadata,
          overwriteExisting: settings.overwriteExisting,
          bitrate,
        });

        updateFileProgress(file.id, 90);

        if (result.success) {
          updateFileStatus(file.id, 'complete', {
            outputPath: result.output_path,
            progress: 100,
          });
          successCount++;
          if (result.output_path) {
            lastOutputPath = result.output_path;
          }
        } else {
          updateFileStatus(file.id, 'error', {
            error: result.error || 'Unknown error',
          });
          failCount++;
        }
      } catch (error) {
        updateFileStatus(file.id, 'error', {
          error: error instanceof Error ? error.message : 'Conversion failed',
        });
        failCount++;
      }
    }

    setIsConverting(false);

    // Show completion toast
    if (cancelRequestedRef.current) {
      showError('Conversion Cancelled', `Stopped after ${successCount} files`);
    } else if (failCount === 0 && successCount > 0) {
      showSuccess(
        'Conversion Complete!',
        `Successfully converted ${successCount} file${successCount !== 1 ? 's' : ''}`,
        lastOutputPath && settings.openAfterConvert
          ? {
              label: 'Show in folder',
              onClick: () => revealInExplorer(lastOutputPath!),
            }
          : undefined
      );

      // Auto-reveal if setting is enabled
      if (settings.openAfterConvert && lastOutputPath) {
        revealInExplorer(lastOutputPath);
      }
    } else if (failCount > 0 && successCount > 0) {
      showError(
        'Partial Success',
        `${successCount} converted, ${failCount} failed`
      );
    } else if (failCount > 0) {
      showError(
        'Conversion Failed',
        `${failCount} file${failCount !== 1 ? 's' : ''} failed to convert`
      );
    }
  }, [files, pendingCount, settings, updateFileStatus, updateFileProgress, showSuccess, showError]);

  const handleCancel = useCallback(() => {
    cancelRequestedRef.current = true;
  }, []);

  const handleGlobalFormatChange = useCallback((format: SupportedFormat) => {
    setGlobalFormat(format);
    // Update all pending files to this format (where compatible)
    files.forEach((file) => {
      if (file.status === 'pending') {
        setFileFormat(file.id, format);
      }
    });
  }, [files, setFileFormat]);

  return (
    <div className="min-h-screen bg-cream p-4 md:p-6">
      <div className="max-w-2xl mx-auto flex flex-col gap-4">
        {/* Header */}
        <Header onSettingsClick={() => setShowSettings(true)} />

        {/* Drop Zone */}
        <DropZone onFilesAdded={addFiles} disabled={isConverting} />

        {/* File List */}
        {hasFiles ? (
          <>
            <FileList
              files={files}
              onRemove={removeFile}
              onClear={clearFiles}
              globalFormat={globalFormat}
              onFormatChange={setFileFormat}
            />

            {/* Conversion Panel */}
            <ConversionPanel
              pendingCount={pendingCount}
              convertingCount={convertingCount}
              completedCount={completedCount}
              errorCount={errorCount}
              quality={settings.quality}
              onQualityChange={(quality) => setSettings((prev) => ({ ...prev, quality }))}
              onConvert={handleConvert}
              onCancel={handleCancel}
              isConverting={isConverting}
              globalFormat={globalFormat}
              onGlobalFormatChange={handleGlobalFormatChange}
              activeCategory={activeCategory}
              toolsAvailable={toolsAvailable || undefined}
            />
          </>
        ) : (
          <EmptyState />
        )}

        {/* Footer */}
        <footer className="text-center py-4 border-t-2 border-navy/10">
          <div className="flex items-center justify-center gap-4 mb-2">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setShowSettings(true);
              }}
              className="text-xs font-mono text-text-muted hover:text-navy"
            >
              Settings
            </a>
            <span className="text-text-muted">|</span>
            <span className="text-xs font-mono text-text-muted">
              v1.0.0
            </span>
            {toolsAvailable && (
              <>
                <span className="text-text-muted">|</span>
                <span className={`text-xs font-mono ${toolsAvailable.ffmpeg ? 'text-green' : 'text-coral'}`}>
                  FFmpeg: {toolsAvailable.ffmpeg ? 'OK' : 'X'}
                </span>
                <span className={`text-xs font-mono ${toolsAvailable.libreoffice ? 'text-green' : 'text-text-muted'}`}>
                  Office: {toolsAvailable.libreoffice ? 'OK' : 'X'}
                </span>
              </>
            )}
          </div>
          <p className="text-[10px] font-mono text-text-muted">
            Your files never leave your computer
          </p>
        </footer>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <SettingsPanel
          settings={settings}
          onSettingsChange={setSettings}
          onClose={() => setShowSettings(false)}
          onSelectOutputDir={handleSelectOutputDir}
        />
      )}

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

export default App;
