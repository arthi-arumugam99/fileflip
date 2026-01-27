use std::fs;
use std::path::PathBuf;

fn main() {
    let test_dir = std::env::temp_dir().join("fileflip_conversion_tests");
    let _ = fs::remove_dir_all(&test_dir);
    fs::create_dir_all(&test_dir).expect("Failed to create test directory");

    println!("=== FileFlip Conversion Tests ===\n");
    println!("Test directory: {}\n", test_dir.display());

    let mut passed = 0;
    let mut failed = 0;

    // Test Document Conversions
    println!("--- Document Conversions ---");

    // Create test files
    let txt_file = test_dir.join("test.txt");
    fs::write(&txt_file, "Hello World!\n\nThis is a test document.\n\nLine 3 here.").unwrap();

    let md_file = test_dir.join("test.md");
    fs::write(&md_file, "# Heading\n\nThis is **bold** and *italic*.\n\n- List item 1\n- List item 2").unwrap();

    let html_file = test_dir.join("test.html");
    fs::write(&html_file, "<!DOCTYPE html><html><body><h1>Title</h1><p>Paragraph text</p></body></html>").unwrap();

    let rtf_file = test_dir.join("test.rtf");
    fs::write(&rtf_file, r"{\rtf1\ansi Hello RTF World!\par Second line\par}").unwrap();

    // Test TXT conversions
    test_conversion(&txt_file, "pdf", &test_dir, &mut passed, &mut failed);
    test_conversion(&txt_file, "html", &test_dir, &mut passed, &mut failed);
    test_conversion(&txt_file, "md", &test_dir, &mut passed, &mut failed);
    test_conversion(&txt_file, "rtf", &test_dir, &mut passed, &mut failed);

    // Test MD conversions
    test_conversion(&md_file, "pdf", &test_dir, &mut passed, &mut failed);
    test_conversion(&md_file, "html", &test_dir, &mut passed, &mut failed);
    test_conversion(&md_file, "txt", &test_dir, &mut passed, &mut failed);
    test_conversion(&md_file, "rtf", &test_dir, &mut passed, &mut failed);

    // Test HTML conversions
    test_conversion(&html_file, "pdf", &test_dir, &mut passed, &mut failed);
    test_conversion(&html_file, "txt", &test_dir, &mut passed, &mut failed);
    test_conversion(&html_file, "md", &test_dir, &mut passed, &mut failed);
    test_conversion(&html_file, "rtf", &test_dir, &mut passed, &mut failed);

    // Test RTF conversions
    test_conversion(&rtf_file, "pdf", &test_dir, &mut passed, &mut failed);
    test_conversion(&rtf_file, "txt", &test_dir, &mut passed, &mut failed);
    test_conversion(&rtf_file, "html", &test_dir, &mut passed, &mut failed);
    test_conversion(&rtf_file, "md", &test_dir, &mut passed, &mut failed);

    println!("\n--- Image Conversions ---");

    // Create a simple test PNG (1x1 red pixel)
    let png_file = test_dir.join("test.png");
    create_test_png(&png_file);

    if png_file.exists() {
        test_conversion(&png_file, "jpg", &test_dir, &mut passed, &mut failed);
        test_conversion(&png_file, "webp", &test_dir, &mut passed, &mut failed);
        test_conversion(&png_file, "bmp", &test_dir, &mut passed, &mut failed);
        test_conversion(&png_file, "gif", &test_dir, &mut passed, &mut failed);
        test_conversion(&png_file, "tiff", &test_dir, &mut passed, &mut failed);
        test_conversion(&png_file, "ico", &test_dir, &mut passed, &mut failed);
        test_conversion(&png_file, "avif", &test_dir, &mut passed, &mut failed);
        test_conversion(&png_file, "pdf", &test_dir, &mut passed, &mut failed);
    }

    // Test JPG conversions (using the converted JPG from above)
    let jpg_file = test_dir.join("test.jpg");
    if jpg_file.exists() {
        test_conversion(&jpg_file, "png", &test_dir, &mut passed, &mut failed);
        test_conversion(&jpg_file, "webp", &test_dir, &mut passed, &mut failed);
        test_conversion(&jpg_file, "bmp", &test_dir, &mut passed, &mut failed);
    }

    // Test WEBP conversions
    let webp_file = test_dir.join("test.webp");
    if webp_file.exists() {
        test_conversion(&webp_file, "png", &test_dir, &mut passed, &mut failed);
        test_conversion(&webp_file, "jpg", &test_dir, &mut passed, &mut failed);
    }

    // Check if FFmpeg is available for audio/video tests
    println!("\n--- Audio/Video Conversions (requires FFmpeg) ---");

    let ffmpeg_available = std::process::Command::new("ffmpeg")
        .arg("-version")
        .output()
        .is_ok();

    if ffmpeg_available {
        // Create a simple test WAV file (silence)
        let wav_file = test_dir.join("test.wav");
        create_test_wav(&wav_file);

        if wav_file.exists() {
            test_conversion(&wav_file, "mp3", &test_dir, &mut passed, &mut failed);
            test_conversion(&wav_file, "flac", &test_dir, &mut passed, &mut failed);
            test_conversion(&wav_file, "ogg", &test_dir, &mut passed, &mut failed);
            test_conversion(&wav_file, "aac", &test_dir, &mut passed, &mut failed);
        }
    } else {
        println!("  [SKIP] FFmpeg not found - skipping audio/video tests");
    }

    println!("\n=================================");
    println!("RESULTS: {} passed, {} failed", passed, failed);
    println!("=================================");

    if failed > 0 {
        std::process::exit(1);
    }
}

fn test_conversion(input: &PathBuf, target_format: &str, output_dir: &PathBuf, passed: &mut i32, failed: &mut i32) {
    let input_ext = input.extension().and_then(|e| e.to_str()).unwrap_or("");
    let test_name = format!("{} -> {}", input_ext.to_uppercase(), target_format.to_uppercase());

    // Call the actual conversion function
    let result = fileflip_lib::convert_file(
        input.to_string_lossy().to_string(),
        target_format.to_string(),
        90,
        Some(output_dir.to_string_lossy().to_string()),
        false,
        true,
        None,
    );

    if result.success {
        if let Some(output_path) = &result.output_path {
            let output = PathBuf::from(output_path);
            if output.exists() && fs::metadata(&output).map(|m| m.len() > 0).unwrap_or(false) {
                println!("  [PASS] {} (output: {} bytes)", test_name, fs::metadata(&output).unwrap().len());
                *passed += 1;
            } else {
                println!("  [FAIL] {} - Output file empty or missing", test_name);
                *failed += 1;
            }
        } else {
            println!("  [FAIL] {} - No output path returned", test_name);
            *failed += 1;
        }
    } else {
        println!("  [FAIL] {} - {}", test_name, result.error.unwrap_or_else(|| "Unknown error".to_string()));
        *failed += 1;
    }
}

fn create_test_png(path: &PathBuf) {
    use image::{ImageBuffer, Rgb};

    // Create a 100x100 test image with a gradient
    let mut img = ImageBuffer::new(100, 100);
    for (x, y, pixel) in img.enumerate_pixels_mut() {
        let r = (x as f32 / 100.0 * 255.0) as u8;
        let g = (y as f32 / 100.0 * 255.0) as u8;
        let b = 128u8;
        *pixel = Rgb([r, g, b]);
    }

    img.save(path).expect("Failed to save test PNG");
}

fn create_test_wav(path: &PathBuf) {
    use std::io::Write;

    // Create a minimal WAV file (1 second of silence at 8000 Hz, mono, 8-bit)
    let sample_rate: u32 = 8000;
    let num_channels: u16 = 1;
    let bits_per_sample: u16 = 8;
    let num_samples: u32 = sample_rate; // 1 second
    let data_size: u32 = num_samples * (bits_per_sample as u32 / 8) * num_channels as u32;
    let file_size: u32 = 36 + data_size;

    let mut wav_data = Vec::new();

    // RIFF header
    wav_data.extend_from_slice(b"RIFF");
    wav_data.extend_from_slice(&file_size.to_le_bytes());
    wav_data.extend_from_slice(b"WAVE");

    // fmt chunk
    wav_data.extend_from_slice(b"fmt ");
    wav_data.extend_from_slice(&16u32.to_le_bytes()); // chunk size
    wav_data.extend_from_slice(&1u16.to_le_bytes()); // audio format (PCM)
    wav_data.extend_from_slice(&num_channels.to_le_bytes());
    wav_data.extend_from_slice(&sample_rate.to_le_bytes());
    let byte_rate = sample_rate * num_channels as u32 * bits_per_sample as u32 / 8;
    wav_data.extend_from_slice(&byte_rate.to_le_bytes());
    let block_align = num_channels * bits_per_sample / 8;
    wav_data.extend_from_slice(&block_align.to_le_bytes());
    wav_data.extend_from_slice(&bits_per_sample.to_le_bytes());

    // data chunk
    wav_data.extend_from_slice(b"data");
    wav_data.extend_from_slice(&data_size.to_le_bytes());

    // Audio data (silence = 128 for 8-bit unsigned PCM)
    for _ in 0..num_samples {
        wav_data.push(128);
    }

    let mut file = fs::File::create(path).expect("Failed to create test WAV");
    file.write_all(&wav_data).expect("Failed to write test WAV");
}
