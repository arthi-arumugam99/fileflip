import type { Settings } from '../types';

interface SettingsPanelProps {
  settings: Settings;
  onSettingsChange: (settings: Settings) => void;
  onClose: () => void;
  onSelectOutputDir: () => void;
}

export function SettingsPanel({ settings, onSettingsChange, onClose, onSelectOutputDir }: SettingsPanelProps) {
  return (
    <div className="fixed inset-0 bg-navy/50 flex items-center justify-center z-50 p-4">
      <div className="card-brutal w-full max-w-md bg-cream">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b-3 border-navy">
          <h2 className="text-xl font-bold text-navy">SETTINGS</h2>
          <button
            onClick={onClose}
            className="p-2 brutal-border-2 bg-white hover:bg-coral hover:text-white transition-colors"
          >
            <svg
              width="16"
              height="16"
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

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Output Directory */}
          <div>
            <label className="block text-sm font-bold text-navy mb-2">
              OUTPUT DIRECTORY
            </label>
            <div className="flex gap-2">
              <div className="flex-1 input-brutal bg-white truncate text-sm">
                {settings.outputDir || 'Same as source file'}
              </div>
              <button
                onClick={onSelectOutputDir}
                className="btn-brutal btn-secondary py-2 px-3 text-xs"
              >
                BROWSE
              </button>
            </div>
            <p className="text-xs text-text-muted mt-1 font-mono">
              Leave empty to save next to original files
            </p>
          </div>

          {/* Quality Slider */}
          <div>
            <label className="block text-sm font-bold text-navy mb-2">
              QUALITY: {settings.quality}%
            </label>
            <input
              type="range"
              min="10"
              max="100"
              step="5"
              value={settings.quality}
              onChange={(e) => onSettingsChange({ ...settings, quality: parseInt(e.target.value) })}
              className="w-full h-6 bg-cream-dark brutal-border-2 appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #4ECDC4 0%, #4ECDC4 ${settings.quality}%, #F5F4E8 ${settings.quality}%, #F5F4E8 100%)`
              }}
            />
            <div className="flex justify-between text-xs font-mono text-text-muted mt-1">
              <span>Smaller</span>
              <span>Better</span>
            </div>
          </div>

          {/* Audio Bitrate */}
          <div>
            <label className="block text-sm font-bold text-navy mb-2">
              AUDIO BITRATE
            </label>
            <select
              value={settings.audioBitrate}
              onChange={(e) => onSettingsChange({ ...settings, audioBitrate: e.target.value as Settings['audioBitrate'] })}
              className="select-brutal w-full"
            >
              <option value="128">128 kbps (Small)</option>
              <option value="192">192 kbps (Standard)</option>
              <option value="256">256 kbps (High)</option>
              <option value="320">320 kbps (Best)</option>
            </select>
            <p className="text-xs text-text-muted mt-1 font-mono">
              For MP3, AAC, and other lossy formats
            </p>
          </div>

          {/* Video Codec */}
          <div>
            <label className="block text-sm font-bold text-navy mb-2">
              VIDEO CODEC
            </label>
            <select
              value={settings.videoCodec}
              onChange={(e) => onSettingsChange({ ...settings, videoCodec: e.target.value as Settings['videoCodec'] })}
              className="select-brutal w-full"
            >
              <option value="h264">H.264 (Compatible)</option>
              <option value="h265">H.265/HEVC (Smaller)</option>
              <option value="vp9">VP9 (WebM)</option>
            </select>
          </div>

          {/* Video Resolution */}
          <div>
            <label className="block text-sm font-bold text-navy mb-2">
              VIDEO RESOLUTION
            </label>
            <select
              value={settings.videoResolution}
              onChange={(e) => onSettingsChange({ ...settings, videoResolution: e.target.value as Settings['videoResolution'] })}
              className="select-brutal w-full"
            >
              <option value="original">Original</option>
              <option value="720p">720p (HD)</option>
              <option value="1080p">1080p (Full HD)</option>
              <option value="4k">4K (Ultra HD)</option>
            </select>
          </div>

          {/* Checkboxes */}
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className={`w-6 h-6 brutal-border-2 brutal-shadow-sm flex items-center justify-center transition-colors ${settings.openAfterConvert ? 'bg-cyan' : 'bg-white'}`}>
                {settings.openAfterConvert && (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>
              <input
                type="checkbox"
                checked={settings.openAfterConvert}
                onChange={(e) => onSettingsChange({ ...settings, openAfterConvert: e.target.checked })}
                className="sr-only"
              />
              <span className="text-sm font-medium text-navy">Open folder after conversion</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer group">
              <div className={`w-6 h-6 brutal-border-2 brutal-shadow-sm flex items-center justify-center transition-colors ${settings.preserveMetadata ? 'bg-cyan' : 'bg-white'}`}>
                {settings.preserveMetadata && (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>
              <input
                type="checkbox"
                checked={settings.preserveMetadata}
                onChange={(e) => onSettingsChange({ ...settings, preserveMetadata: e.target.checked })}
                className="sr-only"
              />
              <span className="text-sm font-medium text-navy">Preserve image metadata (EXIF)</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer group">
              <div className={`w-6 h-6 brutal-border-2 brutal-shadow-sm flex items-center justify-center transition-colors ${settings.overwriteExisting ? 'bg-coral' : 'bg-white'}`}>
                {settings.overwriteExisting && (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>
              <input
                type="checkbox"
                checked={settings.overwriteExisting}
                onChange={(e) => onSettingsChange({ ...settings, overwriteExisting: e.target.checked })}
                className="sr-only"
              />
              <span className="text-sm font-medium text-navy">Overwrite existing files</span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t-3 border-navy bg-cream-dark">
          <button
            onClick={onClose}
            className="btn-brutal btn-primary w-full"
          >
            SAVE SETTINGS
          </button>
        </div>
      </div>
    </div>
  );
}
