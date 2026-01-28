# FileFlip Launch Guide - $12.99 USD

Complete step-by-step guide to launch FileFlip on all platforms and payment processors.

---

## Current Status

### Build Status
- **Windows MSI**: `src-tauri/target/release/bundle/msi/FileFlip_1.0.0_x64_en-US.msi` (14.5 MB)
- **Windows NSIS Installer**: `src-tauri/target/release/bundle/nsis/FileFlip_1.0.0_x64-setup.exe` (10.6 MB)
- **macOS/Linux**: Built via GitHub Actions CI/CD when you push tags

### What's Ready
- Production build with all 70+ format support
- GitHub Actions CI/CD workflow for cross-platform builds
- Landing page in `/landing-page/`
- All conversion tests passing

---

## Step 1: Create GitHub Release (Builds All Platforms)

### 1.1 Push Code to GitHub
```bash
git push origin master
```

### 1.2 Create and Push Version Tag
```bash
# Create tag for release
git tag v1.0.0

# Push tag to trigger CI/CD builds
git push origin v1.0.0
```

### 1.3 Wait for CI/CD to Complete
Go to: `https://github.com/arthi-arumugam99/fileflip/actions`

The workflow builds:
- **Windows**: `.msi` and `.exe` installer (x64)
- **macOS**: `.dmg` (Intel x64 + Apple Silicon arm64)
- **Linux**: `.deb`, `.rpm`, `.AppImage` (x64)

### 1.4 Download Build Artifacts
1. Go to Actions tab on GitHub
2. Click the completed workflow run
3. Download artifacts:
   - `fileflip-x86_64-pc-windows-msvc` (Windows)
   - `fileflip-x86_64-apple-darwin` (macOS Intel)
   - `fileflip-aarch64-apple-darwin` (macOS Apple Silicon)
   - `fileflip-x86_64-unknown-linux-gnu` (Linux)

### 1.5 Create GitHub Release
1. Go to Releases > Draft a new release
2. Select tag `v1.0.0`
3. Title: `FileFlip v1.0.0 - Offline File Converter`
4. Description:
```markdown
## FileFlip v1.0.0

Fast, private offline file converter. Convert 70+ formats without the cloud.

### Features
- 100% Offline - Your files never leave your computer
- 70+ Formats - Images, documents, audio, and video
- Fast Conversions - Native Rust performance
- Cross-Platform - Windows, macOS, and Linux

### Downloads
- **Windows**: Download `.exe` or `.msi` installer
- **macOS**: Download `.dmg` disk image
- **Linux**: Download `.deb`, `.rpm`, or `.AppImage`

### Optional Dependencies
- FFmpeg - For audio/video conversion
- LibreOffice - For DOCX/DOC/ODT conversion
- Pandoc - For EPUB conversion
```
5. Attach all build files
6. Publish release

---

## Step 2: Gumroad Setup ($12.99)

### 2.1 Create Gumroad Account
1. Go to https://gumroad.com
2. Sign up with your email
3. Complete account verification

### 2.2 Create Product
1. Click "New Product"
2. Select "Digital Product"
3. Fill in details:

**Product Name**: FileFlip - Offline File Converter

**Price**: $12.99

**Description**:
```
FileFlip - Fast, Private Offline File Converter

Convert 70+ file formats instantly, 100% offline. Your files never leave your computer.

WHAT YOU GET:
- Full app for Windows, macOS, and Linux
- Free lifetime updates
- No subscription, pay once

SUPPORTED FORMATS:
Images: PNG, JPG, WEBP, SVG, AVIF, BMP, GIF, TIFF, ICO, HEIC, HEIF + more
Documents: PDF, TXT, Markdown, HTML, RTF, DOCX, DOC, ODT, EPUB
Audio: MP3, WAV, FLAC, OGG, AAC, M4A, Opus, WMA, AIFF (requires FFmpeg)
Video: MP4, WebM, MKV, AVI, MOV, FLV, WMV (requires FFmpeg)

KEY FEATURES:
- 100% Offline - Complete privacy, no cloud uploads
- Native Performance - Built with Rust for speed
- Batch Processing - Convert multiple files at once
- Simple UI - Drag & drop interface

REQUIREMENTS:
- Windows 10+ (64-bit)
- macOS 10.13+ (Intel or Apple Silicon)
- Linux (Ubuntu 20.04+, Fedora 35+, or equivalent)

Optional: FFmpeg for audio/video, LibreOffice for Office documents
```

**Cover Image**: Create 1280x720 image with FileFlip branding

### 2.3 Upload Files
Upload all installers:
- `FileFlip_1.0.0_x64-setup.exe` (Windows)
- `FileFlip_1.0.0_x64_en-US.msi` (Windows MSI)
- `FileFlip_1.0.0_x64.dmg` (macOS Intel)
- `FileFlip_1.0.0_aarch64.dmg` (macOS Apple Silicon)
- `FileFlip_1.0.0_amd64.deb` (Linux Debian/Ubuntu)
- `FileFlip_1.0.0.x86_64.rpm` (Linux Fedora/RHEL)
- `FileFlip_1.0.0_amd64.AppImage` (Linux Universal)

### 2.4 Product Settings
- **Refund policy**: 30-day money-back guarantee
- **Sales tax**: Enable Gumroad to collect
- **Variants**: Optional - create separate download options per OS

### 2.5 Publish
1. Preview product page
2. Click "Publish"
3. Copy your Gumroad link: `https://arthi-arumugam99.gumroad.com/l/fileflip`

---

## Step 3: Paddle Setup ($12.99)

### 3.1 Create Paddle Account
1. Go to https://www.paddle.com
2. Sign up for Paddle Billing
3. Complete business verification (may take 1-3 days)

### 3.2 Create Product in Paddle
1. Go to Catalog > Products
2. Click "Add product"
3. Fill in:

**Name**: FileFlip
**Description**: Fast, private offline file converter
**Type**: One-time purchase
**Price**: $12.99 USD

### 3.3 Set Up Checkout
1. Create a Checkout Link
2. Configure success redirect to your thank-you page
3. Set up webhook for license delivery (optional)

### 3.4 Integrate Paddle Button
Add to your landing page:
```html
<script src="https://cdn.paddle.com/paddle/v2/paddle.js"></script>
<script>
  Paddle.Initialize({
    token: 'YOUR_CLIENT_TOKEN'
  });
</script>

<button onclick="Paddle.Checkout.open({
  items: [{ priceId: 'YOUR_PRICE_ID', quantity: 1 }]
})">
  Buy Now - $12.99
</button>
```

---

## Step 4: Landing Page Deployment

### 4.1 Files Ready
Your landing page is in `/landing-page/`:
- `index.html` - Main page
- `styles.css` - Styling
- `script.js` - Interactivity
- `robots.txt` - SEO
- `sitemap.xml` - SEO

### 4.2 Deploy to Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd landing-page
vercel

# Production deploy
vercel --prod
```

### 4.3 Deploy to Netlify (Alternative)
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
cd landing-page
netlify deploy --prod
```

### 4.4 Deploy to GitHub Pages (Free)
1. Create repo `yourusername.github.io` or `fileflip-landing`
2. Push landing-page contents to repo
3. Enable GitHub Pages in repo settings
4. Access at `https://yourusername.github.io/fileflip-landing`

### 4.5 Custom Domain Setup
1. Buy domain (e.g., `fileflip.app` or `getfileflip.com`)
2. Configure DNS:
   - For Vercel: Add CNAME to `cname.vercel-dns.com`
   - For Netlify: Add CNAME to your Netlify subdomain
3. Add domain in hosting dashboard
4. Enable SSL (automatic on Vercel/Netlify)

---

## Step 5: Update Landing Page with Purchase Links

### 5.1 Edit index.html
Find the buy buttons and update:

```html
<!-- Gumroad button -->
<a href="https://arthi-arumugam99.gumroad.com/l/fileflip"
   class="btn-primary">
  Buy Now - $12.99
</a>

<!-- Or Paddle button -->
<button onclick="Paddle.Checkout.open({
  items: [{ priceId: 'pri_xxxxx', quantity: 1 }]
})" class="btn-primary">
  Buy Now - $12.99
</button>
```

### 5.2 Add Payment Provider Script
For Paddle, add before closing `</body>`:
```html
<script src="https://cdn.paddle.com/paddle/v2/paddle.js"></script>
<script>
  Paddle.Initialize({ token: 'YOUR_CLIENT_TOKEN' });
</script>
```

For Gumroad, add:
```html
<script src="https://gumroad.com/js/gumroad.js"></script>
```

---

## Step 6: App Store Submissions (Optional)

### 6.1 Microsoft Store
1. Create Microsoft Partner Center account
2. Reserve app name "FileFlip"
3. Package as MSIX (Tauri supports this)
4. Submit for review

Add to `tauri.conf.json`:
```json
"bundle": {
  "targets": ["msi", "nsis", "appx"]
}
```

### 6.2 Mac App Store
1. Create Apple Developer account ($99/year)
2. Add signing identity to `tauri.conf.json`:
```json
"macOS": {
  "signingIdentity": "Developer ID Application: Your Name (XXXXXXXXXX)",
  "entitlements": "./entitlements.plist"
}
```
3. Submit via Transporter app

### 6.3 Linux Package Managers
- **Snap Store**: Package as snap and submit
- **Flathub**: Create flatpak manifest
- **AUR** (Arch): Create PKGBUILD

---

## Step 7: Marketing Checklist

### Launch Announcement Posts
- [ ] Product Hunt launch
- [ ] Hacker News Show HN
- [ ] Reddit (r/software, r/windows, r/linux, r/macapps)
- [ ] Twitter/X announcement
- [ ] Dev.to article
- [ ] LinkedIn post

### SEO Essentials
- [ ] Submit sitemap to Google Search Console
- [ ] Submit to Bing Webmaster Tools
- [ ] Add to software directories (AlternativeTo, Slant, etc.)

### Analytics Setup
- [ ] Google Analytics on landing page
- [ ] Gumroad/Paddle analytics dashboard

---

## Quick Launch Checklist

### Pre-Launch
- [x] Code committed and tests passing
- [x] Production build working
- [x] CI/CD workflow configured
- [x] Landing page created
- [ ] GitHub release created with all installers
- [ ] Gumroad product page live
- [ ] Paddle product configured (alternative)
- [ ] Landing page deployed with buy links
- [ ] Custom domain configured

### Launch Day
- [ ] Push v1.0.0 tag
- [ ] Wait for CI/CD to build all platforms
- [ ] Upload builds to Gumroad
- [ ] Publish Gumroad product
- [ ] Update landing page with live buy link
- [ ] Submit to Product Hunt
- [ ] Post on social media

---

## Pricing Strategy

**$12.99 USD** is positioned as:
- Lower than Adobe tools ($20+/month)
- Competitive with similar converters ($10-20)
- One-time payment (no subscription)
- Includes all platforms

### Optional: Pricing Tiers
- **Personal**: $12.99 (single user)
- **Team**: $39.99 (up to 5 users)
- **Enterprise**: Contact for pricing

---

## Support Setup

### Documentation
- README.md covers basic usage
- Add FAQ page to landing page
- Consider Notion/GitBook for full docs

### Support Channels
- GitHub Issues for bugs
- Email support (create support@fileflip.app)
- Discord/Slack community (optional)

---

## Files Summary

| File | Location | Status |
|------|----------|--------|
| Windows Installer (.exe) | `src-tauri/target/release/bundle/nsis/` | Ready |
| Windows MSI | `src-tauri/target/release/bundle/msi/` | Ready |
| macOS DMG (Intel) | Built via GitHub Actions | Pending CI |
| macOS DMG (Apple Silicon) | Built via GitHub Actions | Pending CI |
| Linux DEB | Built via GitHub Actions | Pending CI |
| Linux RPM | Built via GitHub Actions | Pending CI |
| Linux AppImage | Built via GitHub Actions | Pending CI |
| Landing Page | `/landing-page/` | Ready |
| CI/CD Workflow | `.github/workflows/build.yml` | Ready |

---

## Next Steps (In Order)

1. **Push to GitHub**: `git push origin master`
2. **Create tag**: `git tag v1.0.0 && git push origin v1.0.0`
3. **Wait for builds**: ~15-20 minutes on GitHub Actions
4. **Set up Gumroad**: Create product, upload files
5. **Deploy landing page**: Vercel/Netlify/GitHub Pages
6. **Update buy links**: Point to Gumroad product
7. **Launch**: Publish on Gumroad, post on Product Hunt

---

## Commands Reference

```bash
# Build locally (Windows)
npm run tauri build

# Run tests
cd src-tauri && cargo test

# Create release tag
git tag v1.0.0
git push origin v1.0.0

# Deploy landing page to Vercel
cd landing-page && vercel --prod

# Check build status
gh run list --workflow=build.yml
```

---

Good luck with your launch!
