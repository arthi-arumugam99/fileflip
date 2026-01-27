// Media category types
export type MediaCategory = 'image' | 'document' | 'audio' | 'video';

// All supported output formats
export type SupportedFormat =
  // Image formats
  | 'jpg' | 'png' | 'webp' | 'gif' | 'bmp' | 'tiff' | 'ico' | 'avif'
  // Document formats
  | 'pdf' | 'txt' | 'md' | 'html' | 'rtf' | 'docx' | 'doc' | 'odt' | 'epub'
  // Audio formats
  | 'mp3' | 'wav' | 'flac' | 'ogg' | 'aac' | 'm4a' | 'opus' | 'wma' | 'aiff'
  // Video formats
  | 'mp4' | 'webm' | 'mkv' | 'avi' | 'mov' | 'flv' | 'wmv' | '3gp' | 'mts' | 'ts' | 'ogv';

export interface FileItem {
  id: string;
  name: string;
  path: string;
  size: number;
  type: string;
  extension: string;
  category: MediaCategory;
  status: 'pending' | 'converting' | 'complete' | 'error';
  error?: string;
  progress?: number;
  targetFormat?: SupportedFormat;
  outputPath?: string;
  // Media-specific metadata
  duration?: number; // For audio/video in seconds
  dimensions?: { width: number; height: number }; // For images/video
}

export interface Settings {
  outputDir: string | null;
  quality: number;
  openAfterConvert: boolean;
  preserveMetadata: boolean;
  overwriteExisting: boolean;
  // Audio settings
  audioBitrate: '128' | '192' | '256' | '320';
  // Video settings
  videoCodec: 'h264' | 'h265' | 'vp9';
  videoResolution: 'original' | '720p' | '1080p' | '4k';
}

export interface ConversionOptions {
  format: SupportedFormat;
  quality: number;
  outputDir?: string;
  // Audio/Video specific
  bitrate?: string;
  codec?: string;
  resolution?: string;
}

export interface ConversionResult {
  success: boolean;
  outputPath?: string;
  error?: string;
  originalSize?: number;
  newSize?: number;
}

export interface ToolAvailability {
  ffmpeg: boolean;
  libreoffice: boolean;
  pandoc: boolean;
}

// Extension to format mapping with category info
export const SUPPORTED_EXTENSIONS: Record<string, { formats: SupportedFormat[]; category: MediaCategory }> = {
  // Image formats
  heic: { formats: ['jpg', 'png', 'webp', 'avif', 'gif', 'bmp', 'tiff', 'pdf'], category: 'image' },
  heif: { formats: ['jpg', 'png', 'webp', 'avif', 'gif', 'bmp', 'tiff', 'pdf'], category: 'image' },
  png: { formats: ['jpg', 'webp', 'bmp', 'gif', 'tiff', 'ico', 'avif', 'pdf'], category: 'image' },
  jpg: { formats: ['png', 'webp', 'bmp', 'gif', 'tiff', 'ico', 'avif', 'pdf'], category: 'image' },
  jpeg: { formats: ['png', 'webp', 'bmp', 'gif', 'tiff', 'ico', 'avif', 'pdf'], category: 'image' },
  jfif: { formats: ['png', 'webp', 'bmp', 'gif', 'tiff', 'ico', 'avif', 'pdf', 'jpg'], category: 'image' },
  webp: { formats: ['jpg', 'png', 'bmp', 'gif', 'tiff', 'ico', 'avif', 'pdf'], category: 'image' },
  bmp: { formats: ['jpg', 'png', 'webp', 'gif', 'tiff', 'ico', 'avif', 'pdf'], category: 'image' },
  tiff: { formats: ['jpg', 'png', 'webp', 'bmp', 'gif', 'avif', 'pdf'], category: 'image' },
  tif: { formats: ['jpg', 'png', 'webp', 'bmp', 'gif', 'avif', 'pdf'], category: 'image' },
  gif: { formats: ['jpg', 'png', 'webp', 'bmp', 'tiff', 'pdf'], category: 'image' },
  svg: { formats: ['png', 'jpg', 'webp', 'pdf', 'gif', 'bmp', 'tiff', 'avif'], category: 'image' },
  ico: { formats: ['png', 'jpg', 'webp', 'bmp', 'gif'], category: 'image' },
  avif: { formats: ['jpg', 'png', 'webp', 'bmp', 'gif', 'tiff', 'pdf'], category: 'image' },
  ppm: { formats: ['jpg', 'png', 'webp', 'bmp', 'gif', 'tiff'], category: 'image' },
  pgm: { formats: ['jpg', 'png', 'webp', 'bmp', 'gif', 'tiff'], category: 'image' },
  pbm: { formats: ['jpg', 'png', 'webp', 'bmp', 'gif', 'tiff'], category: 'image' },

  // Document formats
  pdf: { formats: ['jpg', 'png', 'txt', 'md', 'html'], category: 'document' },
  txt: { formats: ['pdf', 'md', 'html', 'rtf'], category: 'document' },
  md: { formats: ['pdf', 'txt', 'html', 'rtf'], category: 'document' },
  markdown: { formats: ['pdf', 'txt', 'html', 'rtf'], category: 'document' },
  html: { formats: ['pdf', 'txt', 'md', 'rtf'], category: 'document' },
  htm: { formats: ['pdf', 'txt', 'md', 'rtf'], category: 'document' },
  rtf: { formats: ['pdf', 'txt', 'md', 'html'], category: 'document' },
  // Advanced document formats (require LibreOffice)
  docx: { formats: ['pdf', 'txt', 'html', 'rtf', 'odt', 'doc'], category: 'document' },
  doc: { formats: ['pdf', 'txt', 'html', 'rtf', 'odt', 'docx'], category: 'document' },
  odt: { formats: ['pdf', 'txt', 'html', 'rtf', 'docx', 'doc'], category: 'document' },
  // EPUB (requires Pandoc)
  epub: { formats: ['pdf', 'txt', 'html', 'md'], category: 'document' },

  // Audio formats
  mp3: { formats: ['wav', 'flac', 'ogg', 'aac', 'm4a', 'opus', 'wma', 'aiff'], category: 'audio' },
  wav: { formats: ['mp3', 'flac', 'ogg', 'aac', 'm4a', 'opus', 'wma', 'aiff'], category: 'audio' },
  flac: { formats: ['mp3', 'wav', 'ogg', 'aac', 'm4a', 'opus', 'wma', 'aiff'], category: 'audio' },
  ogg: { formats: ['mp3', 'wav', 'flac', 'aac', 'm4a', 'opus', 'wma', 'aiff'], category: 'audio' },
  aac: { formats: ['mp3', 'wav', 'flac', 'ogg', 'm4a', 'opus', 'wma', 'aiff'], category: 'audio' },
  m4a: { formats: ['mp3', 'wav', 'flac', 'ogg', 'aac', 'opus', 'wma', 'aiff'], category: 'audio' },
  opus: { formats: ['mp3', 'wav', 'flac', 'ogg', 'aac', 'm4a', 'wma', 'aiff'], category: 'audio' },
  wma: { formats: ['mp3', 'wav', 'flac', 'ogg', 'aac', 'm4a', 'opus', 'aiff'], category: 'audio' },
  aiff: { formats: ['mp3', 'wav', 'flac', 'ogg', 'aac', 'm4a', 'opus', 'wma'], category: 'audio' },
  aif: { formats: ['mp3', 'wav', 'flac', 'ogg', 'aac', 'm4a', 'opus', 'wma'], category: 'audio' },
  ape: { formats: ['mp3', 'wav', 'flac', 'ogg', 'aac', 'm4a'], category: 'audio' },
  wv: { formats: ['mp3', 'wav', 'flac', 'ogg', 'aac', 'm4a'], category: 'audio' },
  ac3: { formats: ['mp3', 'wav', 'flac', 'ogg', 'aac', 'm4a'], category: 'audio' },

  // Video formats
  mp4: { formats: ['webm', 'mkv', 'avi', 'mov', 'flv', 'wmv', '3gp', 'mts', 'ts', 'ogv'], category: 'video' },
  webm: { formats: ['mp4', 'mkv', 'avi', 'mov', 'flv', 'wmv', '3gp', 'mts', 'ts', 'ogv'], category: 'video' },
  mkv: { formats: ['mp4', 'webm', 'avi', 'mov', 'flv', 'wmv', '3gp', 'mts', 'ts', 'ogv'], category: 'video' },
  avi: { formats: ['mp4', 'webm', 'mkv', 'mov', 'flv', 'wmv', '3gp', 'mts', 'ts', 'ogv'], category: 'video' },
  mov: { formats: ['mp4', 'webm', 'mkv', 'avi', 'flv', 'wmv', '3gp', 'mts', 'ts', 'ogv'], category: 'video' },
  flv: { formats: ['mp4', 'webm', 'mkv', 'avi', 'mov', 'wmv', '3gp', 'mts', 'ts', 'ogv'], category: 'video' },
  wmv: { formats: ['mp4', 'webm', 'mkv', 'avi', 'mov', 'flv', '3gp', 'mts', 'ts', 'ogv'], category: 'video' },
  '3gp': { formats: ['mp4', 'webm', 'mkv', 'avi', 'mov', 'flv', 'wmv', 'mts', 'ts', 'ogv'], category: 'video' },
  mts: { formats: ['mp4', 'webm', 'mkv', 'avi', 'mov', 'flv', 'wmv', '3gp', 'ts', 'ogv'], category: 'video' },
  m2ts: { formats: ['mp4', 'webm', 'mkv', 'avi', 'mov', 'flv', 'wmv', '3gp', 'ts', 'ogv'], category: 'video' },
  ts: { formats: ['mp4', 'webm', 'mkv', 'avi', 'mov', 'flv', 'wmv', '3gp', 'mts', 'ogv'], category: 'video' },
  vob: { formats: ['mp4', 'webm', 'mkv', 'avi', 'mov', 'flv', 'wmv'], category: 'video' },
  ogv: { formats: ['mp4', 'webm', 'mkv', 'avi', 'mov', 'flv', 'wmv', '3gp', 'mts', 'ts'], category: 'video' },
  m4v: { formats: ['mp4', 'webm', 'mkv', 'avi', 'mov', 'flv', 'wmv'], category: 'video' },
  mpg: { formats: ['mp4', 'webm', 'mkv', 'avi', 'mov', 'flv', 'wmv'], category: 'video' },
  mpeg: { formats: ['mp4', 'webm', 'mkv', 'avi', 'mov', 'flv', 'wmv'], category: 'video' },
  divx: { formats: ['mp4', 'webm', 'mkv', 'avi', 'mov'], category: 'video' },
  asf: { formats: ['mp4', 'webm', 'mkv', 'avi', 'mov', 'wmv'], category: 'video' },
};

// Extension lists by category
export const IMAGE_EXTENSIONS = [
  'heic', 'heif', 'png', 'jpg', 'jpeg', 'jfif', 'webp', 'bmp', 'tiff', 'tif',
  'gif', 'svg', 'ico', 'avif', 'ppm', 'pgm', 'pbm'
];
export const DOCUMENT_EXTENSIONS = ['pdf', 'txt', 'md', 'markdown', 'html', 'htm', 'rtf', 'docx', 'doc', 'odt', 'epub'];
export const AUDIO_EXTENSIONS = ['mp3', 'wav', 'flac', 'ogg', 'aac', 'm4a', 'opus', 'wma', 'aiff', 'aif', 'ape', 'wv', 'ac3'];
export const VIDEO_EXTENSIONS = ['mp4', 'webm', 'mkv', 'avi', 'mov', 'flv', 'wmv', '3gp', 'mts', 'm2ts', 'ts', 'vob', 'ogv', 'm4v', 'mpg', 'mpeg', 'divx', 'asf'];
export const ALL_EXTENSIONS = [...IMAGE_EXTENSIONS, ...DOCUMENT_EXTENSIONS, ...AUDIO_EXTENSIONS, ...VIDEO_EXTENSIONS];

// Format metadata
export const FORMAT_INFO: Record<SupportedFormat, { name: string; description: string; lossy: boolean; category: MediaCategory }> = {
  // Image formats
  jpg: { name: 'JPEG', description: 'Best for photos, smaller file size', lossy: true, category: 'image' },
  png: { name: 'PNG', description: 'Lossless, supports transparency', lossy: false, category: 'image' },
  webp: { name: 'WebP', description: 'Modern format, best compression', lossy: true, category: 'image' },
  gif: { name: 'GIF', description: 'Supports animation, limited colors', lossy: true, category: 'image' },
  bmp: { name: 'Bitmap', description: 'Uncompressed, large files', lossy: false, category: 'image' },
  tiff: { name: 'TIFF', description: 'High quality, large files', lossy: false, category: 'image' },
  ico: { name: 'ICO', description: 'Icon format for Windows', lossy: false, category: 'image' },
  avif: { name: 'AVIF', description: 'Next-gen format, excellent compression', lossy: true, category: 'image' },

  // Document formats
  pdf: { name: 'PDF', description: 'Document format, printable', lossy: false, category: 'document' },
  txt: { name: 'Plain Text', description: 'Simple text, no formatting', lossy: false, category: 'document' },
  md: { name: 'Markdown', description: 'Lightweight markup language', lossy: false, category: 'document' },
  html: { name: 'HTML', description: 'Web page format', lossy: false, category: 'document' },
  rtf: { name: 'RTF', description: 'Rich text with basic formatting', lossy: false, category: 'document' },
  docx: { name: 'Word (DOCX)', description: 'Microsoft Word format', lossy: false, category: 'document' },
  doc: { name: 'Word (DOC)', description: 'Legacy Word format', lossy: false, category: 'document' },
  odt: { name: 'OpenDocument', description: 'Open standard document format', lossy: false, category: 'document' },
  epub: { name: 'EPUB', description: 'E-book format', lossy: false, category: 'document' },

  // Audio formats
  mp3: { name: 'MP3', description: 'Universal audio format', lossy: true, category: 'audio' },
  wav: { name: 'WAV', description: 'Uncompressed audio, high quality', lossy: false, category: 'audio' },
  flac: { name: 'FLAC', description: 'Lossless compression', lossy: false, category: 'audio' },
  ogg: { name: 'OGG Vorbis', description: 'Open format, good quality', lossy: true, category: 'audio' },
  aac: { name: 'AAC', description: 'Better than MP3 at same bitrate', lossy: true, category: 'audio' },
  m4a: { name: 'M4A', description: 'Apple audio format', lossy: true, category: 'audio' },
  opus: { name: 'Opus', description: 'Modern codec, excellent for speech', lossy: true, category: 'audio' },
  wma: { name: 'WMA', description: 'Windows Media Audio', lossy: true, category: 'audio' },
  aiff: { name: 'AIFF', description: 'Apple lossless audio', lossy: false, category: 'audio' },

  // Video formats
  mp4: { name: 'MP4', description: 'Universal video format', lossy: true, category: 'video' },
  webm: { name: 'WebM', description: 'Web-optimized video', lossy: true, category: 'video' },
  mkv: { name: 'MKV', description: 'Matroska container, flexible', lossy: true, category: 'video' },
  avi: { name: 'AVI', description: 'Legacy format, wide support', lossy: true, category: 'video' },
  mov: { name: 'MOV', description: 'Apple QuickTime format', lossy: true, category: 'video' },
  flv: { name: 'FLV', description: 'Flash Video, legacy web format', lossy: true, category: 'video' },
  wmv: { name: 'WMV', description: 'Windows Media Video', lossy: true, category: 'video' },
  '3gp': { name: '3GP', description: 'Mobile video format', lossy: true, category: 'video' },
  mts: { name: 'MTS/M2TS', description: 'AVCHD video format', lossy: true, category: 'video' },
  ts: { name: 'TS', description: 'MPEG transport stream', lossy: true, category: 'video' },
  ogv: { name: 'OGV', description: 'Ogg Theora video', lossy: true, category: 'video' },
};

// Utility functions
export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || '';
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export function formatDuration(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function isSupported(extension: string): boolean {
  return extension.toLowerCase() in SUPPORTED_EXTENSIONS;
}

export function getCategory(extension: string): MediaCategory | null {
  const ext = extension.toLowerCase();
  return SUPPORTED_EXTENSIONS[ext]?.category || null;
}

export function getAvailableFormats(extension: string): SupportedFormat[] {
  const ext = extension.toLowerCase();
  return SUPPORTED_EXTENSIONS[ext]?.formats || [];
}

export function getDefaultFormat(extension: string): SupportedFormat | null {
  const formats = getAvailableFormats(extension);
  return formats[0] || null;
}

// Get formats by category for UI display
export function getFormatsByCategory(category: MediaCategory): SupportedFormat[] {
  switch (category) {
    case 'image':
      return ['jpg', 'png', 'webp', 'gif', 'bmp', 'tiff', 'ico', 'avif'];
    case 'document':
      return ['pdf', 'txt', 'md', 'html', 'rtf', 'docx', 'doc', 'odt', 'epub'];
    case 'audio':
      return ['mp3', 'wav', 'flac', 'ogg', 'aac', 'm4a', 'opus', 'wma', 'aiff'];
    case 'video':
      return ['mp4', 'webm', 'mkv', 'avi', 'mov', 'flv', 'wmv', '3gp', 'mts', 'ts', 'ogv'];
    default:
      return [];
  }
}

// Check if format requires external tool
export function requiresExternalTool(format: SupportedFormat | string): 'ffmpeg' | 'libreoffice' | 'pandoc' | null {
  const f = format.toLowerCase();

  // Audio/Video require FFmpeg
  if (['mp3', 'wav', 'flac', 'ogg', 'aac', 'm4a', 'opus', 'wma', 'aiff',
       'mp4', 'webm', 'mkv', 'avi', 'mov', 'flv', 'wmv', '3gp', 'mts', 'ts', 'ogv'].includes(f)) {
    return 'ffmpeg';
  }

  // Office formats require LibreOffice
  if (['docx', 'doc', 'odt'].includes(f)) {
    return 'libreoffice';
  }

  // EPUB requires Pandoc
  if (f === 'epub') {
    return 'pandoc';
  }

  return null;
}

export function estimateOutputSize(inputSize: number, inputFormat: string, outputFormat: SupportedFormat): number {
  // Rough estimation multipliers
  const compressionRatios: Record<SupportedFormat, number> = {
    // Images
    jpg: 0.3,
    png: 0.8,
    webp: 0.25,
    gif: 0.5,
    bmp: 3.0,
    tiff: 1.2,
    ico: 0.1,
    avif: 0.2,
    // Documents
    pdf: 0.9,
    txt: 0.1,
    md: 0.1,
    html: 0.15,
    rtf: 0.3,
    docx: 0.2,
    doc: 0.3,
    odt: 0.2,
    epub: 0.3,
    // Audio
    mp3: 0.08,
    wav: 1.0,
    flac: 0.6,
    ogg: 0.07,
    aac: 0.06,
    m4a: 0.06,
    opus: 0.05,
    wma: 0.08,
    aiff: 1.0,
    // Video
    mp4: 0.1,
    webm: 0.12,
    mkv: 0.15,
    avi: 0.5,
    mov: 0.2,
    flv: 0.15,
    wmv: 0.2,
    '3gp': 0.05,
    mts: 0.3,
    ts: 0.3,
    ogv: 0.15,
  };

  const inputRatios: Record<string, number> = {
    // Images
    heic: 0.5,
    heif: 0.5,
    png: 1.0,
    jpg: 0.4,
    jpeg: 0.4,
    jfif: 0.4,
    webp: 0.35,
    bmp: 3.0,
    tiff: 1.5,
    tif: 1.5,
    gif: 0.6,
    svg: 0.1,
    ico: 0.1,
    avif: 0.25,
    ppm: 3.0,
    pgm: 1.5,
    pbm: 0.5,
    // Documents
    pdf: 1.0,
    txt: 1.0,
    md: 1.0,
    markdown: 1.0,
    html: 1.0,
    htm: 1.0,
    rtf: 1.2,
    docx: 0.3,
    doc: 0.5,
    odt: 0.3,
    epub: 0.4,
    // Audio
    mp3: 0.1,
    wav: 1.0,
    flac: 0.6,
    ogg: 0.08,
    aac: 0.07,
    m4a: 0.07,
    opus: 0.05,
    wma: 0.1,
    aiff: 1.0,
    aif: 1.0,
    ape: 0.5,
    wv: 0.5,
    ac3: 0.15,
    // Video
    mp4: 0.15,
    webm: 0.12,
    mkv: 0.15,
    avi: 0.5,
    mov: 0.2,
    flv: 0.15,
    wmv: 0.2,
    '3gp': 0.05,
    mts: 0.3,
    m2ts: 0.3,
    ts: 0.3,
    vob: 0.4,
    ogv: 0.15,
    m4v: 0.15,
    mpg: 0.2,
    mpeg: 0.2,
    divx: 0.15,
    asf: 0.2,
  };

  const inputRatio = inputRatios[inputFormat.toLowerCase()] || 1.0;
  const outputRatio = compressionRatios[outputFormat];

  // Estimate based on ratios
  const estimatedSize = (inputSize / inputRatio) * outputRatio;
  return Math.round(estimatedSize);
}
