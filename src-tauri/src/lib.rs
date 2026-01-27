use image::{DynamicImage, ImageFormat, ImageReader, RgbaImage};
use image::codecs::jpeg::JpegEncoder;
use image::codecs::png::{CompressionType, FilterType, PngEncoder};
use image::codecs::webp::WebPEncoder;
use image::imageops::FilterType as ResizeFilter;
use image::ExtendedColorType;
use serde::{Deserialize, Serialize};
use std::fs::{self, File};
use std::io::BufWriter;
use std::path::{Path, PathBuf};
use std::process::Command as StdCommand;
use thiserror::Error;

// ============================================================================
// Error Types
// ============================================================================

#[derive(Error, Debug)]
pub enum ConversionError {
    #[error("Failed to read input file: {0}")]
    ReadError(String),
    #[error("Failed to decode image: {0}")]
    DecodeError(String),
    #[error("Failed to encode image: {0}")]
    EncodeError(String),
    #[error("Failed to write output file: {0}")]
    WriteError(String),
    #[error("Unsupported format: {0}")]
    UnsupportedFormat(String),
    #[error("Output file already exists: {0}")]
    FileExists(String),
    #[error("Invalid input path")]
    InvalidPath,
    #[error("SVG rendering failed: {0}")]
    SvgError(String),
    #[error("PDF generation failed: {0}")]
    PdfError(String),
    #[error("FFmpeg error: {0}")]
    FFmpegError(String),
    #[error("FFmpeg not found")]
    FFmpegNotFound,
    #[error("Document conversion failed: {0}")]
    DocumentError(String),
    #[error("LibreOffice not found - required for this conversion")]
    LibreOfficeNotFound,
    #[error("Pandoc not found - required for this conversion")]
    PandocNotFound,
}

// ============================================================================
// Result Types
// ============================================================================

#[derive(Debug, Serialize, Deserialize)]
pub struct ConversionResult {
    pub success: bool,
    pub output_path: Option<String>,
    pub error: Option<String>,
    pub original_size: Option<u64>,
    pub new_size: Option<u64>,
}

impl ConversionResult {
    fn success(output_path: String, original_size: u64, new_size: u64) -> Self {
        Self {
            success: true,
            output_path: Some(output_path),
            error: None,
            original_size: Some(original_size),
            new_size: Some(new_size),
        }
    }

    fn error(message: String) -> Self {
        Self {
            success: false,
            output_path: None,
            error: Some(message),
            original_size: None,
            new_size: None,
        }
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct MediaInfo {
    pub name: String,
    pub size: u64,
    pub extension: String,
    pub category: String,
    pub width: Option<u32>,
    pub height: Option<u32>,
    pub duration: Option<f64>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ToolAvailability {
    pub ffmpeg: bool,
    pub libreoffice: bool,
    pub pandoc: bool,
}

// ============================================================================
// Format Helpers
// ============================================================================

fn get_image_format(format: &str) -> Result<ImageFormat, ConversionError> {
    match format.to_lowercase().as_str() {
        "jpg" | "jpeg" => Ok(ImageFormat::Jpeg),
        "png" => Ok(ImageFormat::Png),
        "gif" => Ok(ImageFormat::Gif),
        "bmp" => Ok(ImageFormat::Bmp),
        "webp" => Ok(ImageFormat::WebP),
        "tiff" | "tif" => Ok(ImageFormat::Tiff),
        "ico" => Ok(ImageFormat::Ico),
        "avif" => Ok(ImageFormat::Avif),
        _ => Err(ConversionError::UnsupportedFormat(format.to_string())),
    }
}

fn get_extension(format: &str) -> &str {
    match format.to_lowercase().as_str() {
        "jpg" | "jpeg" => "jpg",
        "png" => "png",
        "gif" => "gif",
        "bmp" => "bmp",
        "webp" => "webp",
        "tiff" | "tif" => "tiff",
        "ico" => "ico",
        "avif" => "avif",
        "pdf" => "pdf",
        // Audio formats
        "mp3" => "mp3",
        "wav" => "wav",
        "flac" => "flac",
        "ogg" => "ogg",
        "aac" => "aac",
        "m4a" => "m4a",
        "opus" => "opus",
        "wma" => "wma",
        "aiff" | "aif" => "aiff",
        "ape" => "ape",
        // Video formats
        "mp4" => "mp4",
        "webm" => "webm",
        "mkv" => "mkv",
        "avi" => "avi",
        "mov" => "mov",
        "flv" => "flv",
        "wmv" => "wmv",
        "3gp" => "3gp",
        "mts" | "m2ts" => "mts",
        "ts" => "ts",
        "vob" => "vob",
        "ogv" => "ogv",
        // Document formats
        "txt" => "txt",
        "md" | "markdown" => "md",
        "html" | "htm" => "html",
        "rtf" => "rtf",
        "docx" => "docx",
        "doc" => "doc",
        "odt" => "odt",
        "epub" => "epub",
        _ => "bin",
    }
}

fn get_media_category(extension: &str) -> &str {
    match extension.to_lowercase().as_str() {
        // Image formats
        "heic" | "heif" | "png" | "jpg" | "jpeg" | "webp" | "bmp" | "tiff" | "tif" | "gif"
        | "svg" | "ico" | "avif" | "raw" | "cr2" | "nef" | "arw" | "dng" | "psd" | "xcf"
        | "jfif" | "ppm" | "pgm" | "pbm" => "image",
        // Document formats
        "pdf" | "txt" | "md" | "markdown" | "html" | "htm" | "rtf" | "docx" | "doc" | "odt"
        | "epub" | "xps" | "tex" | "rst" | "asciidoc" | "adoc" => "document",
        // Audio formats
        "mp3" | "wav" | "flac" | "ogg" | "aac" | "m4a" | "opus" | "wma" | "aiff" | "aif"
        | "ape" | "alac" | "dsd" | "dsf" | "dff" | "wv" | "tta" | "ac3" => "audio",
        // Video formats
        "mp4" | "webm" | "mkv" | "avi" | "mov" | "flv" | "wmv" | "3gp" | "mts" | "m2ts"
        | "ts" | "vob" | "ogv" | "m4v" | "mpg" | "mpeg" | "divx" | "asf" | "rm" | "rmvb" => "video",
        _ => "unknown",
    }
}

fn generate_output_path(
    input_path: &Path,
    output_format: &str,
    output_dir: Option<&str>,
    overwrite: bool,
) -> Result<PathBuf, ConversionError> {
    let stem = input_path
        .file_stem()
        .and_then(|s| s.to_str())
        .ok_or(ConversionError::InvalidPath)?;

    let extension = get_extension(output_format);

    let output_dir = match output_dir {
        Some(dir) if !dir.is_empty() => PathBuf::from(dir),
        _ => input_path
            .parent()
            .map(|p| p.to_path_buf())
            .unwrap_or_else(|| PathBuf::from(".")),
    };

    if !output_dir.exists() {
        fs::create_dir_all(&output_dir)
            .map_err(|e| ConversionError::WriteError(format!("Failed to create output directory: {}", e)))?;
    }

    let mut output_path = output_dir.join(format!("{}.{}", stem, extension));

    if !overwrite && output_path.exists() {
        let mut counter = 1;
        loop {
            output_path = output_dir.join(format!("{}_{}.{}", stem, counter, extension));
            if !output_path.exists() {
                break;
            }
            counter += 1;
            if counter > 1000 {
                return Err(ConversionError::FileExists(
                    "Too many files with same name".to_string(),
                ));
            }
        }
    }

    Ok(output_path)
}

// ============================================================================
// Image Loading & Saving
// ============================================================================

fn load_image(path: &Path) -> Result<DynamicImage, ConversionError> {
    let reader = ImageReader::open(path)
        .map_err(|e| ConversionError::ReadError(e.to_string()))?
        .with_guessed_format()
        .map_err(|e| ConversionError::ReadError(e.to_string()))?;

    reader
        .decode()
        .map_err(|e| ConversionError::DecodeError(e.to_string()))
}

fn load_svg(path: &Path, width: Option<u32>) -> Result<DynamicImage, ConversionError> {
    let svg_data = fs::read(path).map_err(|e| ConversionError::ReadError(e.to_string()))?;

    let options = usvg::Options::default();
    let tree = usvg::Tree::from_data(&svg_data, &options)
        .map_err(|e| ConversionError::SvgError(e.to_string()))?;

    let original_size = tree.size();
    let scale = if let Some(w) = width {
        w as f32 / original_size.width()
    } else {
        1.0
    };

    let scaled_width = (original_size.width() * scale) as u32;
    let scaled_height = (original_size.height() * scale) as u32;

    let mut pixmap = resvg::tiny_skia::Pixmap::new(scaled_width, scaled_height)
        .ok_or_else(|| ConversionError::SvgError("Failed to create pixmap".to_string()))?;

    let transform = resvg::tiny_skia::Transform::from_scale(scale, scale);
    resvg::render(&tree, transform, &mut pixmap.as_mut());

    let rgba_image = RgbaImage::from_raw(scaled_width, scaled_height, pixmap.data().to_vec())
        .ok_or_else(|| ConversionError::SvgError("Failed to create image from SVG".to_string()))?;

    Ok(DynamicImage::ImageRgba8(rgba_image))
}

fn save_image(
    img: &DynamicImage,
    output_path: &Path,
    format: ImageFormat,
    quality: u8,
) -> Result<(), ConversionError> {
    match format {
        ImageFormat::Jpeg => {
            let rgb_img = img.to_rgb8();
            let mut output_file = File::create(output_path)
                .map_err(|e| ConversionError::WriteError(e.to_string()))?;

            let mut encoder = JpegEncoder::new_with_quality(&mut output_file, quality);
            encoder
                .encode(
                    rgb_img.as_raw(),
                    rgb_img.width(),
                    rgb_img.height(),
                    ExtendedColorType::Rgb8,
                )
                .map_err(|e| ConversionError::EncodeError(e.to_string()))?;
        }
        ImageFormat::Png => {
            let compression = match quality {
                90..=100 => CompressionType::Fast,
                70..=89 => CompressionType::Default,
                _ => CompressionType::Best,
            };

            let filter = FilterType::Adaptive;
            let output_file = File::create(output_path)
                .map_err(|e| ConversionError::WriteError(e.to_string()))?;

            let encoder = PngEncoder::new_with_quality(output_file, compression, filter);
            img.write_with_encoder(encoder)
                .map_err(|e| ConversionError::EncodeError(e.to_string()))?;
        }
        ImageFormat::WebP => {
            let output_file = File::create(output_path)
                .map_err(|e| ConversionError::WriteError(e.to_string()))?;

            let encoder = WebPEncoder::new_lossless(output_file);
            img.write_with_encoder(encoder)
                .map_err(|e| ConversionError::EncodeError(e.to_string()))?;
        }
        ImageFormat::Ico => {
            // For ICO, we resize to standard icon sizes
            let resized = img.resize(256, 256, ResizeFilter::Lanczos3);
            resized
                .save_with_format(output_path, format)
                .map_err(|e| ConversionError::EncodeError(e.to_string()))?;
        }
        _ => {
            img.save_with_format(output_path, format)
                .map_err(|e| ConversionError::EncodeError(e.to_string()))?;
        }
    }

    Ok(())
}

// ============================================================================
// PDF Generation
// ============================================================================

fn image_to_pdf(img: &DynamicImage, output_path: &Path) -> Result<(), ConversionError> {
    use printpdf::{ColorBits, ColorSpace, Image, ImageFilter, ImageTransform, ImageXObject, Mm, PdfDocument, Px};

    let (width, height) = (img.width(), img.height());

    // Convert to mm (assuming 96 DPI)
    let width_mm = Mm((width as f32 / 96.0) * 25.4);
    let height_mm = Mm((height as f32 / 96.0) * 25.4);

    let (doc, page1, layer1) = PdfDocument::new("Image", width_mm, height_mm, "Layer 1");
    let current_layer = doc.get_page(page1).get_layer(layer1);

    // Convert image to JPEG bytes for PDF embedding
    let mut jpeg_bytes = Vec::new();
    let mut cursor = std::io::Cursor::new(&mut jpeg_bytes);
    img.to_rgb8()
        .write_to(&mut cursor, ImageFormat::Jpeg)
        .map_err(|e| ConversionError::PdfError(e.to_string()))?;

    let image = Image::from(
        ImageXObject {
            width: Px(width as usize),
            height: Px(height as usize),
            color_space: ColorSpace::Rgb,
            bits_per_component: ColorBits::Bit8,
            interpolate: true,
            image_data: jpeg_bytes,
            image_filter: Some(ImageFilter::DCT),
            clipping_bbox: None,
            smask: None,
        }
    );

    image.add_to_layer(
        current_layer,
        ImageTransform {
            translate_x: Some(Mm(0.0)),
            translate_y: Some(Mm(0.0)),
            scale_x: Some(width_mm.0 / width as f32),
            scale_y: Some(height_mm.0 / height as f32),
            ..Default::default()
        },
    );

    doc.save(&mut BufWriter::new(
        File::create(output_path).map_err(|e| ConversionError::PdfError(e.to_string()))?,
    ))
    .map_err(|e| ConversionError::PdfError(e.to_string()))?;

    Ok(())
}

fn text_to_pdf(text: &str, output_path: &Path, title: &str) -> Result<(), ConversionError> {
    use printpdf::{BuiltinFont, Mm, PdfDocument};

    // A4 size
    let width_mm = Mm(210.0);
    let height_mm = Mm(297.0);

    let (doc, page1, layer1) = PdfDocument::new(title, width_mm, height_mm, "Layer 1");
    let font = doc.add_builtin_font(BuiltinFont::Courier)
        .map_err(|e| ConversionError::PdfError(e.to_string()))?;

    let mut current_page = page1;
    let mut current_layer_idx = layer1;
    let mut y_position = height_mm.0 - 20.0; // Start from top with margin
    let line_height = 4.0;
    let font_size = 10.0;
    let margin_left = 15.0;
    let margin_bottom = 20.0;

    let lines: Vec<&str> = text.lines().collect();

    for line in lines {
        if y_position < margin_bottom {
            // New page
            let (new_page, new_layer) = doc.add_page(width_mm, height_mm, "Layer 1");
            current_page = new_page;
            current_layer_idx = new_layer;
            y_position = height_mm.0 - 20.0;
        }

        let current_layer = doc.get_page(current_page).get_layer(current_layer_idx);

        // Truncate long lines
        let display_line = if line.len() > 90 {
            &line[..90]
        } else {
            line
        };

        current_layer.use_text(display_line, font_size, Mm(margin_left), Mm(y_position), &font);
        y_position -= line_height;
    }

    doc.save(&mut BufWriter::new(
        File::create(output_path).map_err(|e| ConversionError::PdfError(e.to_string()))?,
    ))
    .map_err(|e| ConversionError::PdfError(e.to_string()))?;

    Ok(())
}

// ============================================================================
// Document Conversion
// ============================================================================

fn read_text_file(path: &Path) -> Result<String, ConversionError> {
    let bytes = fs::read(path).map_err(|e| ConversionError::ReadError(e.to_string()))?;

    // Try to detect encoding
    let (cow, _, _) = encoding_rs::UTF_8.decode(&bytes);
    Ok(cow.into_owned())
}

fn markdown_to_html(markdown: &str) -> String {
    use comrak::{markdown_to_html as comrak_md_to_html, Options};
    let mut options = Options::default();
    options.extension.strikethrough = true;
    options.extension.table = true;
    options.extension.autolink = true;
    options.extension.tasklist = true;
    comrak_md_to_html(markdown, &options)
}

fn html_to_text(html: &str) -> String {
    html2text::from_read(html.as_bytes(), 80).unwrap_or_else(|_| html.to_string())
}

pub fn convert_document(
    input_path: &Path,
    output_path: &Path,
    input_ext: &str,
    output_format: &str,
) -> Result<(), ConversionError> {
    let input_lower = input_ext.to_lowercase();
    let output_lower = output_format.to_lowercase();

    match (input_lower.as_str(), output_lower.as_str()) {
        // TXT conversions
        ("txt", "pdf") => {
            let text = read_text_file(input_path)?;
            let title = input_path.file_stem().and_then(|s| s.to_str()).unwrap_or("Document");
            text_to_pdf(&text, output_path, title)
        }
        ("txt", "html") => {
            let text = read_text_file(input_path)?;
            let html = format!(
                "<!DOCTYPE html>\n<html>\n<head>\n<meta charset=\"UTF-8\">\n<title>{}</title>\n</head>\n<body>\n<pre>{}</pre>\n</body>\n</html>",
                input_path.file_stem().and_then(|s| s.to_str()).unwrap_or("Document"),
                html_escape(&text)
            );
            fs::write(output_path, html).map_err(|e| ConversionError::WriteError(e.to_string()))
        }
        ("txt", "md") => {
            let text = read_text_file(input_path)?;
            fs::write(output_path, text).map_err(|e| ConversionError::WriteError(e.to_string()))
        }

        // Markdown conversions
        ("md" | "markdown", "html") => {
            let md = read_text_file(input_path)?;
            let html_body = markdown_to_html(&md);
            let full_html = format!(
                "<!DOCTYPE html>\n<html>\n<head>\n<meta charset=\"UTF-8\">\n<title>{}</title>\n<style>body{{font-family:sans-serif;max-width:800px;margin:0 auto;padding:20px;}}pre{{background:#f4f4f4;padding:10px;overflow-x:auto;}}code{{background:#f4f4f4;padding:2px 4px;}}</style>\n</head>\n<body>\n{}\n</body>\n</html>",
                input_path.file_stem().and_then(|s| s.to_str()).unwrap_or("Document"),
                html_body
            );
            fs::write(output_path, full_html).map_err(|e| ConversionError::WriteError(e.to_string()))
        }
        ("md" | "markdown", "txt") => {
            let md = read_text_file(input_path)?;
            let html = markdown_to_html(&md);
            let text = html_to_text(&html);
            fs::write(output_path, text).map_err(|e| ConversionError::WriteError(e.to_string()))
        }
        ("md" | "markdown", "pdf") => {
            let md = read_text_file(input_path)?;
            let html = markdown_to_html(&md);
            let text = html_to_text(&html);
            let title = input_path.file_stem().and_then(|s| s.to_str()).unwrap_or("Document");
            text_to_pdf(&text, output_path, title)
        }

        // HTML conversions
        ("html" | "htm", "txt") => {
            let html = read_text_file(input_path)?;
            let text = html_to_text(&html);
            fs::write(output_path, text).map_err(|e| ConversionError::WriteError(e.to_string()))
        }
        ("html" | "htm", "md") => {
            let html = read_text_file(input_path)?;
            // Basic HTML to markdown - just extract text with some formatting
            let text = html_to_text(&html);
            fs::write(output_path, text).map_err(|e| ConversionError::WriteError(e.to_string()))
        }
        ("html" | "htm", "pdf") => {
            let html = read_text_file(input_path)?;
            let text = html_to_text(&html);
            let title = input_path.file_stem().and_then(|s| s.to_str()).unwrap_or("Document");
            text_to_pdf(&text, output_path, title)
        }

        // RTF conversions (basic - just extract text)
        ("rtf", "txt") => {
            let rtf_content = read_text_file(input_path)?;
            let text = extract_rtf_text(&rtf_content);
            fs::write(output_path, text).map_err(|e| ConversionError::WriteError(e.to_string()))
        }
        ("rtf", "pdf") => {
            let rtf_content = read_text_file(input_path)?;
            let text = extract_rtf_text(&rtf_content);
            let title = input_path.file_stem().and_then(|s| s.to_str()).unwrap_or("Document");
            text_to_pdf(&text, output_path, title)
        }
        ("rtf", "html") | ("rtf", "md") => {
            let rtf_content = read_text_file(input_path)?;
            let text = extract_rtf_text(&rtf_content);
            if output_lower == "html" {
                let html = format!(
                    "<!DOCTYPE html>\n<html>\n<head>\n<meta charset=\"UTF-8\">\n</head>\n<body>\n<pre>{}</pre>\n</body>\n</html>",
                    html_escape(&text)
                );
                fs::write(output_path, html).map_err(|e| ConversionError::WriteError(e.to_string()))
            } else {
                fs::write(output_path, text).map_err(|e| ConversionError::WriteError(e.to_string()))
            }
        }

        // TXT to RTF
        ("txt", "rtf") => {
            let text = read_text_file(input_path)?;
            let rtf = text_to_rtf(&text);
            fs::write(output_path, rtf).map_err(|e| ConversionError::WriteError(e.to_string()))
        }
        ("md" | "markdown", "rtf") | ("html" | "htm", "rtf") => {
            let content = read_text_file(input_path)?;
            let text = if input_lower == "md" || input_lower == "markdown" {
                let html = markdown_to_html(&content);
                html_to_text(&html)
            } else {
                html_to_text(&content)
            };
            let rtf = text_to_rtf(&text);
            fs::write(output_path, rtf).map_err(|e| ConversionError::WriteError(e.to_string()))
        }

        // For DOCX, DOC, ODT - require LibreOffice
        ("docx" | "doc" | "odt", _) | (_, "docx" | "doc" | "odt") => {
            convert_with_libreoffice(input_path, output_path, output_format)
        }

        // EPUB conversions - require Pandoc
        ("epub", _) | (_, "epub") => {
            convert_with_pandoc(input_path, output_path, output_format)
        }

        _ => Err(ConversionError::UnsupportedFormat(format!(
            "Cannot convert {} to {}",
            input_ext, output_format
        ))),
    }
}

fn html_escape(text: &str) -> String {
    text.replace('&', "&amp;")
        .replace('<', "&lt;")
        .replace('>', "&gt;")
        .replace('"', "&quot;")
}

fn extract_rtf_text(rtf: &str) -> String {
    // Basic RTF text extraction - removes RTF control words
    let mut result = String::new();
    let mut in_group: i32 = 0;
    let mut skip_chars = 0;
    let chars: Vec<char> = rtf.chars().collect();
    let mut i = 0;

    while i < chars.len() {
        if skip_chars > 0 {
            skip_chars -= 1;
            i += 1;
            continue;
        }

        let c = chars[i];
        match c {
            '{' => in_group += 1,
            '}' => in_group = in_group.saturating_sub(1),
            '\\' => {
                // Skip control word
                i += 1;
                if i < chars.len() {
                    let next = chars[i];
                    if next == '\'' {
                        // Hex character - skip 2 more
                        skip_chars = 2;
                    } else if next.is_alphabetic() {
                        // Control word - skip until space or non-alpha
                        while i < chars.len() && (chars[i].is_alphanumeric() || chars[i] == '-') {
                            i += 1;
                        }
                        // Skip trailing space
                        if i < chars.len() && chars[i] == ' ' {
                            i += 1;
                        }
                        continue;
                    } else if next == '\\' || next == '{' || next == '}' {
                        result.push(next);
                    } else if next == '\n' || next == '\r' {
                        // Line break in RTF source
                    }
                }
            }
            '\n' | '\r' => {
                // Ignore literal newlines in RTF
            }
            _ => {
                if in_group <= 1 {
                    result.push(c);
                }
            }
        }
        i += 1;
    }

    result.trim().to_string()
}

fn text_to_rtf(text: &str) -> String {
    let mut rtf = String::from("{\\rtf1\\ansi\\deff0\n");

    for line in text.lines() {
        // Escape special characters
        let escaped: String = line.chars().map(|c| {
            match c {
                '\\' => "\\\\".to_string(),
                '{' => "\\{".to_string(),
                '}' => "\\}".to_string(),
                c if c as u32 > 127 => format!("\\u{}?", c as i32),
                c => c.to_string(),
            }
        }).collect();
        rtf.push_str(&escaped);
        rtf.push_str("\\par\n");
    }

    rtf.push('}');
    rtf
}

// ============================================================================
// External Tool Integration (LibreOffice, Pandoc)
// ============================================================================

fn find_libreoffice() -> Option<PathBuf> {
    let locations = if cfg!(target_os = "windows") {
        vec![
            "C:\\Program Files\\LibreOffice\\program\\soffice.exe",
            "C:\\Program Files (x86)\\LibreOffice\\program\\soffice.exe",
            "soffice.exe",
        ]
    } else if cfg!(target_os = "macos") {
        vec![
            "/Applications/LibreOffice.app/Contents/MacOS/soffice",
            "/usr/local/bin/soffice",
            "soffice",
        ]
    } else {
        vec![
            "/usr/bin/soffice",
            "/usr/bin/libreoffice",
            "/usr/local/bin/soffice",
            "soffice",
            "libreoffice",
        ]
    };

    for loc in locations {
        let path = PathBuf::from(loc);
        if path.exists() || StdCommand::new(loc).arg("--version").output().is_ok() {
            return Some(path);
        }
    }
    None
}

fn find_pandoc() -> Option<PathBuf> {
    let locations = if cfg!(target_os = "windows") {
        vec![
            "C:\\Program Files\\Pandoc\\pandoc.exe",
            "C:\\Users\\pandoc\\pandoc.exe",
            "pandoc.exe",
            "pandoc",
        ]
    } else {
        vec![
            "/usr/bin/pandoc",
            "/usr/local/bin/pandoc",
            "pandoc",
        ]
    };

    for loc in locations {
        if StdCommand::new(loc).arg("--version").output().is_ok() {
            return Some(PathBuf::from(loc));
        }
    }
    None
}

fn convert_with_libreoffice(
    input_path: &Path,
    output_path: &Path,
    output_format: &str,
) -> Result<(), ConversionError> {
    let soffice = find_libreoffice().ok_or(ConversionError::LibreOfficeNotFound)?;

    let output_dir = output_path.parent().unwrap_or(Path::new("."));

    // LibreOffice filter name mapping
    let filter = match output_format.to_lowercase().as_str() {
        "pdf" => "pdf",
        "docx" => "docx",
        "doc" => "doc",
        "odt" => "odt",
        "txt" => "txt",
        "html" | "htm" => "html",
        "rtf" => "rtf",
        _ => return Err(ConversionError::UnsupportedFormat(output_format.to_string())),
    };

    let output = StdCommand::new(&soffice)
        .args([
            "--headless",
            "--convert-to",
            filter,
            "--outdir",
            output_dir.to_str().unwrap_or("."),
            input_path.to_str().unwrap_or(""),
        ])
        .output()
        .map_err(|e| ConversionError::DocumentError(e.to_string()))?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(ConversionError::DocumentError(stderr.to_string()));
    }

    // LibreOffice outputs to a file with the same name but different extension
    let expected_output = output_dir.join(format!(
        "{}.{}",
        input_path.file_stem().and_then(|s| s.to_str()).unwrap_or("output"),
        get_extension(output_format)
    ));

    // Rename if needed
    if expected_output != output_path && expected_output.exists() {
        fs::rename(&expected_output, output_path)
            .map_err(|e| ConversionError::WriteError(e.to_string()))?;
    }

    Ok(())
}

fn convert_with_pandoc(
    input_path: &Path,
    output_path: &Path,
    output_format: &str,
) -> Result<(), ConversionError> {
    let pandoc = find_pandoc().ok_or(ConversionError::PandocNotFound)?;

    let mut cmd = StdCommand::new(&pandoc);
    cmd.arg("-o").arg(output_path);

    // Add format-specific options
    match output_format.to_lowercase().as_str() {
        "pdf" => {
            cmd.arg("--pdf-engine=pdflatex");
        }
        "epub" => {
            cmd.args(["--epub-cover-image=/dev/null"]);
        }
        _ => {}
    }

    cmd.arg(input_path);

    let output = cmd.output()
        .map_err(|e| ConversionError::DocumentError(e.to_string()))?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(ConversionError::DocumentError(stderr.to_string()));
    }

    Ok(())
}

// ============================================================================
// FFmpeg Integration
// ============================================================================

fn find_ffmpeg() -> Option<PathBuf> {
    let locations = if cfg!(target_os = "windows") {
        vec![
            "ffmpeg.exe",
            "ffmpeg",
            "C:\\ffmpeg\\bin\\ffmpeg.exe",
            "C:\\Program Files\\ffmpeg\\bin\\ffmpeg.exe",
            "C:\\Program Files (x86)\\ffmpeg\\bin\\ffmpeg.exe",
        ]
    } else {
        vec![
            "ffmpeg",
            "/usr/bin/ffmpeg",
            "/usr/local/bin/ffmpeg",
            "/opt/homebrew/bin/ffmpeg",
        ]
    };

    for loc in &locations {
        if StdCommand::new(loc).arg("-version").output().is_ok() {
            return Some(PathBuf::from(loc));
        }
    }

    None
}

fn convert_with_ffmpeg(
    input_path: &Path,
    output_path: &Path,
    output_format: &str,
    quality: u8,
    bitrate: Option<&str>,
) -> Result<(), ConversionError> {
    let ffmpeg = find_ffmpeg().ok_or(ConversionError::FFmpegNotFound)?;

    let mut cmd = StdCommand::new(ffmpeg);
    cmd.arg("-i").arg(input_path);
    cmd.arg("-y"); // Overwrite output

    // Apply format-specific settings
    match output_format.to_lowercase().as_str() {
        // Audio formats
        "mp3" => {
            let br = bitrate.unwrap_or("192k");
            cmd.arg("-c:a").arg("libmp3lame").arg("-b:a").arg(br);
        }
        "wav" => {
            cmd.arg("-c:a").arg("pcm_s16le");
        }
        "flac" => {
            cmd.arg("-c:a").arg("flac");
        }
        "ogg" => {
            let br = bitrate.unwrap_or("192k");
            cmd.arg("-c:a").arg("libvorbis").arg("-b:a").arg(br);
        }
        "aac" | "m4a" => {
            let br = bitrate.unwrap_or("192k");
            cmd.arg("-c:a").arg("aac").arg("-b:a").arg(br);
        }
        "opus" => {
            let br = bitrate.unwrap_or("128k");
            cmd.arg("-c:a").arg("libopus").arg("-b:a").arg(br);
        }
        "wma" => {
            let br = bitrate.unwrap_or("192k");
            cmd.arg("-c:a").arg("wmav2").arg("-b:a").arg(br);
        }
        "aiff" | "aif" => {
            cmd.arg("-c:a").arg("pcm_s16be");
        }
        "ape" => {
            // FFmpeg can decode APE but encoding requires external encoder
            // Fall back to FLAC
            cmd.arg("-c:a").arg("flac");
        }
        // Video formats
        "mp4" => {
            let crf = ((100 - quality) as f32 * 0.51) as u8;
            cmd.arg("-c:v").arg("libx264")
               .arg("-crf").arg(crf.to_string())
               .arg("-preset").arg("medium")
               .arg("-c:a").arg("aac")
               .arg("-b:a").arg("192k");
        }
        "webm" => {
            let crf = ((100 - quality) as f32 * 0.63) as u8;
            cmd.arg("-c:v").arg("libvpx-vp9")
               .arg("-crf").arg(crf.to_string())
               .arg("-b:v").arg("0")
               .arg("-c:a").arg("libopus");
        }
        "mkv" => {
            let crf = ((100 - quality) as f32 * 0.51) as u8;
            cmd.arg("-c:v").arg("libx264")
               .arg("-crf").arg(crf.to_string())
               .arg("-c:a").arg("aac");
        }
        "avi" => {
            cmd.arg("-c:v").arg("libxvid")
               .arg("-q:v").arg(((100 - quality) / 4).to_string())
               .arg("-c:a").arg("mp3");
        }
        "mov" => {
            let crf = ((100 - quality) as f32 * 0.51) as u8;
            cmd.arg("-c:v").arg("libx264")
               .arg("-crf").arg(crf.to_string())
               .arg("-c:a").arg("aac")
               .arg("-tag:v").arg("avc1");
        }
        "flv" => {
            cmd.arg("-c:v").arg("flv1")
               .arg("-q:v").arg(((100 - quality) / 10).to_string())
               .arg("-c:a").arg("mp3");
        }
        "wmv" => {
            cmd.arg("-c:v").arg("wmv2")
               .arg("-q:v").arg(((100 - quality) / 10).to_string())
               .arg("-c:a").arg("wmav2");
        }
        "3gp" => {
            cmd.arg("-c:v").arg("h263")
               .arg("-s").arg("352x288")
               .arg("-c:a").arg("aac")
               .arg("-ar").arg("8000")
               .arg("-ac").arg("1");
        }
        "mts" | "m2ts" => {
            cmd.arg("-c:v").arg("libx264")
               .arg("-c:a").arg("ac3");
        }
        "ts" => {
            cmd.arg("-c:v").arg("libx264")
               .arg("-c:a").arg("aac")
               .arg("-f").arg("mpegts");
        }
        "vob" => {
            cmd.arg("-c:v").arg("mpeg2video")
               .arg("-c:a").arg("ac3");
        }
        "ogv" => {
            cmd.arg("-c:v").arg("libtheora")
               .arg("-c:a").arg("libvorbis");
        }
        _ => {}
    }

    cmd.arg(output_path);

    let output = cmd.output().map_err(|e| ConversionError::FFmpegError(e.to_string()))?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(ConversionError::FFmpegError(stderr.to_string()));
    }

    Ok(())
}

fn get_media_duration(path: &Path) -> Option<f64> {
    let ffmpeg = find_ffmpeg()?;

    let output = StdCommand::new(ffmpeg)
        .args([
            "-i",
            path.to_str()?,
            "-f",
            "null",
            "-",
        ])
        .output()
        .ok()?;

    let stderr = String::from_utf8_lossy(&output.stderr);

    // Parse duration from FFmpeg output
    for line in stderr.lines() {
        if line.contains("Duration:") {
            if let Some(duration_str) = line.split("Duration:").nth(1) {
                if let Some(time_str) = duration_str.split(',').next() {
                    let parts: Vec<&str> = time_str.trim().split(':').collect();
                    if parts.len() == 3 {
                        let hours: f64 = parts[0].parse().ok()?;
                        let minutes: f64 = parts[1].parse().ok()?;
                        let seconds: f64 = parts[2].parse().ok()?;
                        return Some(hours * 3600.0 + minutes * 60.0 + seconds);
                    }
                }
            }
        }
    }

    None
}

// ============================================================================
// PDF to Image Conversion
// ============================================================================

fn pdf_to_image(
    input_path: &Path,
    output_path: &Path,
    output_format: &str,
    quality: u8,
    page: Option<usize>,
) -> Result<(), ConversionError> {
    // Try using ImageMagick/GraphicsMagick first (if available)
    if let Some(convert_cmd) = find_imagemagick() {
        let density = match quality {
            90..=100 => "300",
            70..=89 => "200",
            _ => "150",
        };

        let page_spec = page.map(|p| format!("[{}]", p)).unwrap_or_default();
        let input_with_page = format!("{}{}", input_path.to_string_lossy(), page_spec);

        let output = StdCommand::new(&convert_cmd)
            .args([
                "-density",
                density,
                &input_with_page,
                "-quality",
                &quality.to_string(),
                output_path.to_str().unwrap_or(""),
            ])
            .output()
            .map_err(|e| ConversionError::PdfError(e.to_string()))?;

        if output.status.success() {
            return Ok(());
        }
    }

    // Fallback: Try pdftoppm (from poppler-utils)
    if let Some(pdftoppm) = find_pdftoppm() {
        let format_arg = match output_format.to_lowercase().as_str() {
            "png" => "-png",
            "jpg" | "jpeg" => "-jpeg",
            _ => "-png",
        };

        let output_stem = output_path.with_extension("");
        let mut cmd = StdCommand::new(&pdftoppm);
        cmd.arg(format_arg);

        if let Some(p) = page {
            cmd.arg("-f").arg((p + 1).to_string())
               .arg("-l").arg((p + 1).to_string());
        } else {
            cmd.arg("-singlefile");
        }

        cmd.arg("-r").arg(match quality {
            90..=100 => "300",
            70..=89 => "200",
            _ => "150",
        });

        cmd.arg(input_path);
        cmd.arg(&output_stem);

        let result = cmd.output()
            .map_err(|e| ConversionError::PdfError(e.to_string()))?;

        if result.status.success() {
            // Rename output file if needed
            let expected = PathBuf::from(format!("{}.{}", output_stem.to_string_lossy(),
                if output_format == "jpg" || output_format == "jpeg" { "jpg" } else { "png" }));
            if expected.exists() && expected != output_path {
                fs::rename(&expected, output_path)
                    .map_err(|e| ConversionError::WriteError(e.to_string()))?;
            }
            return Ok(());
        }
    }

    // Fallback: Try FFmpeg (can handle some PDFs)
    if let Ok(()) = convert_with_ffmpeg(input_path, output_path, output_format, quality, None) {
        return Ok(());
    }

    Err(ConversionError::PdfError(
        "No PDF renderer available. Install ImageMagick, Poppler, or Ghostscript.".to_string()
    ))
}

fn find_imagemagick() -> Option<PathBuf> {
    let names = if cfg!(target_os = "windows") {
        vec!["magick.exe", "convert.exe", "magick", "convert"]
    } else {
        vec!["magick", "convert", "gm"]
    };

    for name in names {
        if StdCommand::new(name).arg("-version").output().is_ok() {
            return Some(PathBuf::from(name));
        }
    }
    None
}

fn find_pdftoppm() -> Option<PathBuf> {
    let names = if cfg!(target_os = "windows") {
        vec!["pdftoppm.exe", "pdftoppm"]
    } else {
        vec!["pdftoppm", "/usr/bin/pdftoppm", "/usr/local/bin/pdftoppm"]
    };

    for name in names {
        if StdCommand::new(name).arg("-v").output().is_ok() {
            return Some(PathBuf::from(name));
        }
    }
    None
}

// ============================================================================
// Tauri Commands
// ============================================================================

/// Public conversion function for testing and external use
pub fn convert_file(
    input_path: String,
    output_format: String,
    quality: u8,
    output_dir: Option<String>,
    preserve_metadata: bool,
    overwrite_existing: bool,
    bitrate: Option<String>,
) -> ConversionResult {
    let input_path = Path::new(&input_path);

    if !input_path.exists() {
        return ConversionResult::error(format!("Input file not found: {:?}", input_path));
    }

    let original_size = match fs::metadata(input_path) {
        Ok(meta) => meta.len(),
        Err(e) => return ConversionResult::error(format!("Failed to read file metadata: {}", e)),
    };

    let input_ext = input_path
        .extension()
        .and_then(|e| e.to_str())
        .unwrap_or("")
        .to_lowercase();

    let category = get_media_category(&input_ext);
    let output_category = get_media_category(&output_format);

    // Generate output path
    let output_path = match generate_output_path(
        input_path,
        &output_format,
        output_dir.as_deref(),
        overwrite_existing,
    ) {
        Ok(p) => p,
        Err(e) => return ConversionResult::error(e.to_string()),
    };

    // Route to appropriate converter based on category
    let result = match (category, output_category) {
        // Image to image
        ("image", "image") => {
            let img = if input_ext == "svg" {
                match load_svg(input_path, None) {
                    Ok(i) => i,
                    Err(e) => return ConversionResult::error(e.to_string()),
                }
            } else {
                match load_image(input_path) {
                    Ok(i) => i,
                    Err(e) => return ConversionResult::error(e.to_string()),
                }
            };

            let target_format = match get_image_format(&output_format) {
                Ok(f) => f,
                Err(e) => return ConversionResult::error(e.to_string()),
            };

            save_image(&img, &output_path, target_format, quality.clamp(1, 100))
        }

        // Image to PDF
        ("image", "document") if output_format.to_lowercase() == "pdf" => {
            let img = if input_ext == "svg" {
                match load_svg(input_path, None) {
                    Ok(i) => i,
                    Err(e) => return ConversionResult::error(e.to_string()),
                }
            } else {
                match load_image(input_path) {
                    Ok(i) => i,
                    Err(e) => return ConversionResult::error(e.to_string()),
                }
            };

            image_to_pdf(&img, &output_path)
        }

        // PDF to image
        ("document", "image") if input_ext == "pdf" => {
            pdf_to_image(input_path, &output_path, &output_format, quality, None)
        }

        // Document to document
        ("document", "document") => {
            convert_document(input_path, &output_path, &input_ext, &output_format)
        }

        // Document to other text-based format
        ("document", _) | (_, "document") => {
            convert_document(input_path, &output_path, &input_ext, &output_format)
        }

        // Audio/Video conversions via FFmpeg
        ("audio", "audio") | ("video", "video") | ("video", "audio") => {
            convert_with_ffmpeg(
                input_path,
                &output_path,
                &output_format,
                quality,
                bitrate.as_deref(),
            )
        }

        _ => Err(ConversionError::UnsupportedFormat(format!(
            "Cannot convert {} to {}",
            input_ext, output_format
        ))),
    };

    if let Err(e) = result {
        return ConversionResult::error(e.to_string());
    }

    let new_size = match fs::metadata(&output_path) {
        Ok(meta) => meta.len(),
        Err(_) => 0,
    };

    let _ = preserve_metadata; // Placeholder for future metadata preservation

    ConversionResult::success(
        output_path.to_string_lossy().to_string(),
        original_size,
        new_size,
    )
}

#[tauri::command]
fn get_file_info(path: String) -> Result<MediaInfo, String> {
    let path = Path::new(&path);

    if !path.exists() {
        return Err("File not found".to_string());
    }

    let metadata = fs::metadata(path).map_err(|e| e.to_string())?;

    let extension = path
        .extension()
        .and_then(|e| e.to_str())
        .unwrap_or("")
        .to_lowercase();

    let name = path
        .file_name()
        .and_then(|n| n.to_str())
        .unwrap_or("unknown")
        .to_string();

    let category = get_media_category(&extension).to_string();

    // Get dimensions for images
    let (width, height) = if category == "image" && extension != "svg" {
        if let Ok(reader) = ImageReader::open(path) {
            if let Ok(reader) = reader.with_guessed_format() {
                reader.into_dimensions().ok().unwrap_or((0, 0))
            } else {
                (0, 0)
            }
        } else {
            (0, 0)
        }
    } else {
        (0, 0)
    };

    // Get duration for audio/video
    let duration = if category == "audio" || category == "video" {
        get_media_duration(path)
    } else {
        None
    };

    Ok(MediaInfo {
        name,
        size: metadata.len(),
        extension,
        category,
        width: if width > 0 { Some(width) } else { None },
        height: if height > 0 { Some(height) } else { None },
        duration,
    })
}

#[tauri::command]
fn get_supported_formats(from_format: String) -> Vec<String> {
    let from = from_format.to_lowercase();
    let category = get_media_category(&from);

    match category {
        "image" => {
            let mut formats = vec!["jpg", "png", "webp", "gif", "bmp", "tiff", "ico", "avif", "pdf"];
            // Remove self
            formats.retain(|&f| f != from);
            formats.iter().map(|s| s.to_string()).collect()
        }
        "document" => {
            let mut formats = vec!["pdf", "txt", "md", "html", "rtf"];
            // Add advanced formats if tools available
            if find_libreoffice().is_some() {
                formats.extend(["docx", "doc", "odt"].iter());
            }
            if find_pandoc().is_some() {
                formats.push("epub");
            }
            formats.retain(|&f| f != from);
            formats.iter().map(|s| s.to_string()).collect()
        }
        "audio" => {
            vec!["mp3", "wav", "flac", "ogg", "aac", "m4a", "opus", "wma", "aiff"]
                .iter()
                .filter(|&&f| f != from)
                .map(|s| s.to_string())
                .collect()
        }
        "video" => {
            vec!["mp4", "webm", "mkv", "avi", "mov", "flv", "wmv", "3gp", "mts", "ts", "ogv"]
                .iter()
                .filter(|&&f| f != from)
                .map(|s| s.to_string())
                .collect()
        }
        _ => vec![],
    }
}

#[tauri::command]
fn is_conversion_supported(from_format: String, to_format: String) -> bool {
    let from = from_format.to_lowercase();
    let to = to_format.to_lowercase();
    let from_category = get_media_category(&from);
    let to_category = get_media_category(&to);

    match (from_category, to_category) {
        ("image", "image") => true,
        ("image", "document") if to == "pdf" => true,
        ("document", "image") if from == "pdf" => true,
        ("document", "document") => {
            // Check if we need external tools
            let needs_libreoffice = matches!(from.as_str(), "docx" | "doc" | "odt")
                || matches!(to.as_str(), "docx" | "doc" | "odt");
            let needs_pandoc = from == "epub" || to == "epub";

            if needs_libreoffice && find_libreoffice().is_none() {
                return false;
            }
            if needs_pandoc && find_pandoc().is_none() {
                return false;
            }
            true
        }
        ("audio", "audio") => find_ffmpeg().is_some(),
        ("video", "video") => find_ffmpeg().is_some(),
        ("video", "audio") => find_ffmpeg().is_some(),
        _ => false,
    }
}

#[tauri::command]
fn check_ffmpeg_available() -> bool {
    find_ffmpeg().is_some()
}

#[tauri::command]
fn check_tools_available() -> ToolAvailability {
    ToolAvailability {
        ffmpeg: find_ffmpeg().is_some(),
        libreoffice: find_libreoffice().is_some(),
        pandoc: find_pandoc().is_some(),
    }
}

#[tauri::command]
fn reveal_in_explorer(path: String) -> Result<(), String> {
    let path = Path::new(&path);

    if !path.exists() {
        return Err("Path not found".to_string());
    }

    #[cfg(target_os = "windows")]
    {
        StdCommand::new("explorer")
            .args(["/select,", &path.to_string_lossy()])
            .spawn()
            .map_err(|e| e.to_string())?;
    }

    #[cfg(target_os = "macos")]
    {
        StdCommand::new("open")
            .args(["-R", &path.to_string_lossy()])
            .spawn()
            .map_err(|e| e.to_string())?;
    }

    #[cfg(target_os = "linux")]
    {
        let managers = ["xdg-open", "nautilus", "dolphin", "thunar"];
        let parent = path.parent().unwrap_or(path);

        for manager in managers {
            if StdCommand::new(manager).arg(parent).spawn().is_ok() {
                break;
            }
        }
    }

    Ok(())
}

// ============================================================================
// Tauri Command Wrappers
// ============================================================================

#[tauri::command]
fn cmd_convert_file(
    input_path: String,
    output_format: String,
    quality: u8,
    output_dir: Option<String>,
    preserve_metadata: bool,
    overwrite_existing: bool,
    bitrate: Option<String>,
) -> ConversionResult {
    convert_file(input_path, output_format, quality, output_dir, preserve_metadata, overwrite_existing, bitrate)
}

// ============================================================================
// App Entry Point
// ============================================================================

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            cmd_convert_file,
            get_file_info,
            get_supported_formats,
            is_conversion_supported,
            check_ffmpeg_available,
            check_tools_available,
            reveal_in_explorer
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
