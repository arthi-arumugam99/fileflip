# FileFlip

Fast, private offline file converter. Convert images, documents, audio, and video without the cloud.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey)
![Version](https://img.shields.io/badge/version-1.0.0-green)

## Features

- **100% Offline** - Your files never leave your computer
- **Fast Conversions** - Native performance with Rust backend
- **70+ Formats** - Images, documents, audio, and video
- **Batch Processing** - Convert multiple files at once
- **Cross-Platform** - Windows, macOS, and Linux

## Supported Formats

### Images
PNG, JPG, JPEG, WebP, BMP, GIF, TIFF, ICO, AVIF, SVG, HEIC, HEIF, PPM, PGM, PBM

### Documents
PDF, TXT, Markdown, HTML, RTF, DOCX*, DOC*, ODT*, EPUB*

### Audio (requires FFmpeg)
MP3, WAV, FLAC, OGG, AAC, M4A, Opus, WMA, AIFF, APE, AC3

### Video (requires FFmpeg)
MP4, WebM, MKV, AVI, MOV, FLV, WMV, 3GP, MTS, TS, VOB, OGV, MPG

*Requires LibreOffice or Pandoc installed

## Installation

### Download
Download the latest release for your platform from the [Releases](../../releases) page:
- **Windows**: `.msi` or `.exe` installer
- **macOS**: `.dmg` disk image
- **Linux**: `.deb`, `.rpm`, or `.AppImage`

### Optional Dependencies
For full functionality, install these tools:
- **FFmpeg** - For audio/video conversion
- **LibreOffice** - For DOCX/DOC/ODT conversion
- **Pandoc** - For EPUB conversion

## Development

### Prerequisites
- Node.js 20+
- Rust toolchain
- Platform-specific dependencies (see [Tauri prerequisites](https://tauri.app/v1/guides/getting-started/prerequisites))

### Setup
```bash
# Install dependencies
npm install

# Run in development mode
npm run tauri dev

# Build for production
npm run tauri build
```

### Testing
```bash
# Run Rust tests
cd src-tauri && cargo test

# Run conversion tests
cd src-tauri && cargo run --bin test_conversions
```

## Building

### Local Build
```bash
npm run tauri build
```

### CI/CD
This project uses GitHub Actions for automated cross-platform builds. Push to `main` or create a tag starting with `v` (e.g., `v1.0.0`) to trigger builds.

## License

MIT License - see [LICENSE](LICENSE) for details.

## Privacy

FileFlip processes all files locally on your machine. No data is ever sent to external servers. No telemetry, no tracking, no cloud.
