# macOS Build Setup for Mac App Store

Since you don't have a Mac, this guide explains how to build and submit FileFlip to the Mac App Store using GitHub Actions.

## Prerequisites

1. **Apple Developer Program** ($99/year)
   - Sign up at: https://developer.apple.com/programs/

2. **App Store Connect Setup**
   - Create your app listing at: https://appstoreconnect.apple.com
   - Set bundle ID to match your `tauri.conf.json` (e.g., `com.fileflip.app`)

## Required GitHub Secrets

Go to your repo → Settings → Secrets and variables → Actions → New repository secret

### For Code Signing (Required for App Store):

| Secret Name | Description | How to Get |
|-------------|-------------|------------|
| `APPLE_CERTIFICATE` | Base64-encoded .p12 certificate | Export from Keychain Access on any Mac (or ask someone with a Mac) |
| `APPLE_CERTIFICATE_PASSWORD` | Password for the .p12 file | Set when exporting |
| `KEYCHAIN_PASSWORD` | Any secure password | Create your own |
| `APPLE_SIGNING_IDENTITY` | Certificate name | e.g., `Apple Distribution: Your Name (TEAMID)` |
| `APPLE_TEAM_ID` | Your 10-character Team ID | Found in Apple Developer account |

### For Notarization (Required for distribution):

| Secret Name | Description | How to Get |
|-------------|-------------|------------|
| `APPLE_ID` | Your Apple ID email | Your developer account email |
| `APPLE_PASSWORD` | App-specific password | Generate at appleid.apple.com → Security |

### For App Store Upload (Optional - automates upload):

| Secret Name | Description | How to Get |
|-------------|-------------|------------|
| `APPLE_API_KEY` | Base64-encoded API key (.p8) | App Store Connect → Users → Keys |
| `APPLE_API_KEY_ID` | Key ID | Shown when creating API key |
| `APPLE_API_ISSUER` | Issuer ID | Shown in API Keys section |

## How to Trigger a Build

### Option 1: Manual trigger (for testing)
1. Go to Actions tab in your GitHub repo
2. Select "Build macOS App"
3. Click "Run workflow"
4. Download the artifacts when complete

### Option 2: Tag-based release (for production)
```bash
git tag v1.0.0
git push origin v1.0.0
```
This will build and (if secrets are set) upload to App Store Connect.

## Without Apple Developer Account

If you don't have an Apple Developer account yet:
1. The workflow will still build an unsigned .app
2. You can download it from GitHub Actions artifacts
3. Users can run it but will see security warnings
4. You CANNOT submit to Mac App Store without signing

## Getting Certificates Without a Mac

Options:
1. **Rent a Mac**: Services like MacStadium or MacinCloud
2. **Ask a friend**: Anyone with a Mac can export certificates for you
3. **Use a VM**: macOS VMs (check licensing)
4. **GitHub Codespaces**: Some setups support macOS

## Tauri Configuration for Mac App Store

Make sure your `src-tauri/tauri.conf.json` has:

```json
{
  "bundle": {
    "identifier": "com.fileflip.app",
    "category": "public.app-category.utilities",
    "macOS": {
      "entitlements": "./Entitlements.plist",
      "signingIdentity": "-",
      "providerShortName": "YOUR_TEAM_ID"
    }
  }
}
```

## Need Help?

- Tauri macOS guide: https://tauri.app/v1/guides/distribution/macos
- Apple code signing: https://developer.apple.com/support/code-signing/
