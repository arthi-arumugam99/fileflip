use std::fs;
use std::path::PathBuf;

// Test helper to create unique temp directory for each test
fn setup_test_dir(test_name: &str) -> PathBuf {
    let test_dir = std::env::temp_dir()
        .join("fileflip_tests")
        .join(test_name)
        .join(format!("{}", std::process::id()));
    let _ = fs::remove_dir_all(&test_dir);
    fs::create_dir_all(&test_dir).expect("Failed to create test directory");
    test_dir
}

#[test]
fn test_txt_to_html() {
    let test_dir = setup_test_dir("txt_to_html");
    let input = test_dir.join("test.txt");
    let output = test_dir.join("test.html");

    fs::write(&input, "Hello World!\nThis is a test.").unwrap();

    // Call conversion
    let result = fileflip_lib::convert_document(&input, &output, "txt", "html");

    assert!(result.is_ok(), "TXT to HTML conversion failed: {:?}", result);
    assert!(output.exists(), "Output file not created");

    let content = fs::read_to_string(&output).unwrap();
    assert!(content.contains("Hello World"), "Content not converted properly");
}

#[test]
fn test_txt_to_md() {
    let test_dir = setup_test_dir("txt_to_md");
    let input = test_dir.join("test.txt");
    let output = test_dir.join("test.md");

    fs::write(&input, "Hello World!\nThis is a test.").unwrap();

    let result = fileflip_lib::convert_document(&input, &output, "txt", "md");

    assert!(result.is_ok(), "TXT to MD conversion failed: {:?}", result);
    assert!(output.exists(), "Output file not created");
}

#[test]
fn test_md_to_html() {
    let test_dir = setup_test_dir("md_to_html");
    let input = test_dir.join("test.md");
    let output = test_dir.join("test.html");

    fs::write(&input, "# Hello\n\nThis is **bold** text.").unwrap();

    let result = fileflip_lib::convert_document(&input, &output, "md", "html");

    assert!(result.is_ok(), "MD to HTML conversion failed: {:?}", result);
    assert!(output.exists(), "Output file not created");

    let content = fs::read_to_string(&output).unwrap();
    assert!(content.contains("<strong>bold</strong>") || content.contains("<b>bold</b>"),
            "Markdown not converted to HTML properly");
}

#[test]
fn test_html_to_txt() {
    let test_dir = setup_test_dir("html_to_txt");
    let input = test_dir.join("test.html");
    let output = test_dir.join("test.txt");

    fs::write(&input, "<html><body><h1>Hello</h1><p>World</p></body></html>").unwrap();

    let result = fileflip_lib::convert_document(&input, &output, "html", "txt");

    assert!(result.is_ok(), "HTML to TXT conversion failed: {:?}", result);
    assert!(output.exists(), "Output file not created");

    let content = fs::read_to_string(&output).unwrap();
    assert!(content.contains("Hello") && content.contains("World"),
            "HTML not converted to text properly");
}

#[test]
fn test_txt_to_rtf() {
    let test_dir = setup_test_dir("txt_to_rtf");
    let input = test_dir.join("test.txt");
    let output = test_dir.join("test.rtf");

    fs::write(&input, "Hello World!\nLine 2").unwrap();

    let result = fileflip_lib::convert_document(&input, &output, "txt", "rtf");

    assert!(result.is_ok(), "TXT to RTF conversion failed: {:?}", result);
    assert!(output.exists(), "Output file not created");

    let content = fs::read_to_string(&output).unwrap();
    assert!(content.starts_with("{\\rtf"), "Not valid RTF format");
}

#[test]
fn test_rtf_to_txt() {
    let test_dir = setup_test_dir("rtf_to_txt");
    let input = test_dir.join("test.rtf");
    let output = test_dir.join("test.txt");

    // Simple RTF with just text
    fs::write(&input, r"{\rtf1 Hello World!}").unwrap();

    let result = fileflip_lib::convert_document(&input, &output, "rtf", "txt");

    assert!(result.is_ok(), "RTF to TXT conversion failed: {:?}", result);
    assert!(output.exists(), "Output file not created");

    let content = fs::read_to_string(&output).unwrap();
    assert!(content.contains("Hello") || content.contains("World"), "RTF not extracted properly: {}", content);
}
