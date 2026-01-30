# Mac App Store Submission Guide (AWS EC2 Mac)

Complete step-by-step guide to build and submit FileFlip to the Mac App Store.

---

## Part 1: Set Up AWS EC2 Mac Instance

### Step 1.1: Allocate a Dedicated Host (Required for Mac)

1. Go to AWS Console: https://console.aws.amazon.com
2. Search for "EC2" and click it
3. In the left sidebar, click **"Dedicated Hosts"**
4. Click **"Allocate Dedicated Host"**
5. Configure:
   - **Name**: `mac-build-host`
   - **Instance family**: `mac2` (or `mac1` if not available)
   - **Instance type**: `mac2.metal`
   - **Availability Zone**: Pick any (e.g., `us-east-1a`)
   - **Quantity**: `1`
6. Click **"Allocate"**
7. ⏳ Wait for status to become "Available" (can take 5-10 minutes)

### Step 1.2: Launch Mac Instance

1. Go to **EC2 Dashboard** → **"Launch Instance"**
2. Configure:
   - **Name**: `fileflip-mac-builder`
   - **AMI**: Search "macOS" → Select **macOS Sonoma** or **Ventura**
   - **Instance type**: `mac2.metal`
   - **Key pair**: Create new → Download the `.pem` file (SAVE THIS!)
   - **Network settings**: Allow SSH (port 22)
   - **Advanced details** → **Tenancy**: `Dedicated Host` → Select your host
3. Click **"Launch Instance"**
4. ⏳ Wait 10-15 minutes for instance to start

### Step 1.3: Connect to Your Mac

**Get the IP:**
1. Go to EC2 → Instances
2. Click your instance
3. Copy the **Public IPv4 address**

**Connect via SSH:**
```bash
# On your Windows machine (use PowerShell or Git Bash)
ssh -i "your-key.pem" ec2-user@YOUR_IP_ADDRESS
```

**Or use PuTTY on Windows:**
1. Convert .pem to .ppk using PuTTYgen
2. Connect using PuTTY with the IP and .ppk file

---

## Part 2: Set Up Development Environment (Run on Mac)

Once connected via SSH, run these commands:

```bash
# Update system
sudo softwareupdate --install --all

# Install Homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
eval "$(/opt/homebrew/bin/brew shellenv)"

# Install Xcode Command Line Tools
xcode-select --install

# Install Node.js
brew install node@20
echo 'export PATH="/opt/homebrew/opt/node@20/bin:$PATH"' >> ~/.zprofile
source ~/.zprofile

# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
source "$HOME/.cargo/env"

# Add Apple Silicon and Intel targets
rustup target add aarch64-apple-darwin
rustup target add x86_64-apple-darwin

# Install Tauri CLI
cargo install tauri-cli

# Verify installations
node --version
cargo --version
cargo tauri --version
```

---

## Part 3: Clone and Build FileFlip

```bash
# Clone your repo
git clone https://github.com/arthi-arumugam99/fileflip.git
cd fileflip

# Install dependencies
npm install

# Build for macOS (Universal Binary - works on Intel + Apple Silicon)
cargo tauri build --target universal-apple-darwin

# Check the output
ls -la src-tauri/target/universal-apple-darwin/release/bundle/macos/
```

You should see `FileFlip.app` in the output.

---

## Part 4: Set Up Apple Certificates

### Step 4.1: Create App ID in Apple Developer Portal

1. Go to: https://developer.apple.com/account/resources/identifiers/list
2. Click **"+"** to add new Identifier
3. Select **"App IDs"** → Continue
4. Select **"App"** → Continue
5. Configure:
   - **Description**: `FileFlip`
   - **Bundle ID**: `com.fileflip.app` (Explicit)
6. Scroll down, enable any capabilities you need (probably none for a file converter)
7. Click **"Continue"** → **"Register"**

### Step 4.2: Create Certificates

1. Go to: https://developer.apple.com/account/resources/certificates/list
2. Click **"+"** to create new certificate
3. Select **"Apple Distribution"** → Continue
4. You need a CSR file. On your EC2 Mac, run:

```bash
# Generate CSR (Certificate Signing Request)
openssl req -new -newkey rsa:2048 -nodes \
  -keyout distribution.key \
  -out distribution.csr \
  -subj "/emailAddress=junomobileapplications@gmail.com/CN=FileFlip Distribution/C=US"
```

5. Upload `distribution.csr` to Apple Developer portal
6. Download the certificate (`distribution.cer`)
7. Transfer it to your EC2 Mac (use `scp` or copy-paste content)

```bash
# Convert to usable format and import
# First, download the cert to your Mac, then:
security import distribution.cer -k ~/Library/Keychains/login.keychain-db

# Create .p12 from key and cert
openssl x509 -in distribution.cer -inform DER -out distribution.crt -outform PEM
openssl pkcs12 -export -out distribution.p12 -inkey distribution.key -in distribution.crt
```

### Step 4.3: Create Provisioning Profile

1. Go to: https://developer.apple.com/account/resources/profiles/list
2. Click **"+"** to create new profile
3. Select **"Mac App Store Connect"** → Continue
4. Select your App ID (`com.fileflip.app`) → Continue
5. Select your Distribution certificate → Continue
6. Name it: `FileFlip Mac App Store`
7. Download the profile (`FileFlip_Mac_App_Store.provisionprofile`)
8. Transfer to EC2 Mac and install:

```bash
# Copy profile to correct location
mkdir -p ~/Library/MobileDevice/Provisioning\ Profiles
cp FileFlip_Mac_App_Store.provisionprofile ~/Library/MobileDevice/Provisioning\ Profiles/
```

---

## Part 5: Sign the App

```bash
cd ~/fileflip

# Find your signing identity
security find-identity -v -p codesigning

# It will show something like:
# 1) ABC123... "Apple Distribution: Your Name (TEAMID)"
# Copy that identity name

# Sign the app (replace with your identity)
codesign --deep --force --verify --verbose \
  --sign "Apple Distribution: Your Name (TEAMID)" \
  --options runtime \
  --entitlements src-tauri/Entitlements.plist \
  src-tauri/target/universal-apple-darwin/release/bundle/macos/FileFlip.app

# Verify signature
codesign --verify --deep --strict --verbose=2 \
  src-tauri/target/universal-apple-darwin/release/bundle/macos/FileFlip.app
```

### Create Entitlements file (if not exists):

```bash
cat > src-tauri/Entitlements.plist << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>com.apple.security.app-sandbox</key>
    <true/>
    <key>com.apple.security.files.user-selected.read-write</key>
    <true/>
    <key>com.apple.security.files.downloads.read-write</key>
    <true/>
</dict>
</plist>
EOF
```

---

## Part 6: Create .pkg Installer

```bash
# Create the .pkg for App Store
productbuild \
  --component src-tauri/target/universal-apple-darwin/release/bundle/macos/FileFlip.app /Applications \
  --sign "3rd Party Mac Developer Installer: Your Name (TEAMID)" \
  FileFlip.pkg

# Verify the package
pkgutil --check-signature FileFlip.pkg
```

---

## Part 7: Upload to App Store Connect

### Option A: Using Transporter (GUI)

```bash
# Install Transporter via App Store (need GUI access)
# Use VNC to connect to Mac GUI

# Enable VNC
sudo /System/Library/CoreServices/RemoteManagement/ARDAgent.app/Contents/Resources/kickstart \
  -activate -configure -access -on \
  -restart -agent -privs -all

# Set VNC password
sudo /System/Library/CoreServices/RemoteManagement/ARDAgent.app/Contents/Resources/kickstart \
  -configure -clientopts -setvnclegacy -vnclegacy yes \
  -setvncpw -vncpw YOUR_VNC_PASSWORD
```

Then connect with VNC viewer to your EC2 IP, open App Store, download Transporter, drag your .pkg into it.

### Option B: Using Command Line (Recommended)

1. Create App Store Connect API Key:
   - Go to: https://appstoreconnect.apple.com/access/api
   - Click "+" to generate new key
   - Download the `.p8` file
   - Note the **Key ID** and **Issuer ID**

2. Upload:
```bash
# Set your API credentials
export API_KEY_ID="YOUR_KEY_ID"
export API_ISSUER_ID="YOUR_ISSUER_ID"

# Copy your .p8 key to the Mac and then:
mkdir -p ~/.appstoreconnect/private_keys
cp AuthKey_YOURKEYID.p8 ~/.appstoreconnect/private_keys/

# Upload the package
xcrun altool --upload-app \
  --type macos \
  --file FileFlip.pkg \
  --apiKey $API_KEY_ID \
  --apiIssuer $API_ISSUER_ID

# Or use newer notarytool + App Store submission
xcrun notarytool submit FileFlip.pkg \
  --key ~/.appstoreconnect/private_keys/AuthKey_$API_KEY_ID.p8 \
  --key-id $API_KEY_ID \
  --issuer $API_ISSUER_ID \
  --wait
```

---

## Part 8: Complete App Store Listing

1. Go to: https://appstoreconnect.apple.com
2. Click "My Apps" → Your app (or create it with "+")
3. Fill in:
   - **App Name**: FileFlip
   - **Primary Language**: English
   - **Bundle ID**: Select `com.fileflip.app`
   - **SKU**: `fileflip-001`
4. Add:
   - Screenshots (1280x800 or 1440x900)
   - App description
   - Keywords
   - Support URL: `https://fileflip.space/contact.html`
   - Privacy Policy URL: `https://fileflip.space/privacy.html`
   - Category: Utilities
   - Price: $12.99
5. Submit for Review!

---

## Part 9: Clean Up AWS (IMPORTANT - Saves Money!)

Mac instances cost ~$1.20/hour. After you're done:

```bash
# From your local machine, terminate the instance
# Go to EC2 → Instances → Select instance → Instance State → Terminate

# Release the Dedicated Host (otherwise it keeps charging!)
# Go to EC2 → Dedicated Hosts → Select host → Actions → Release
```

⚠️ **Dedicated Hosts have a minimum 24-hour charge**, so you'll pay for at least 24 hours (~$26) regardless.

---

## Quick Reference: All Commands in Order

```bash
# 1. On EC2 Mac - Install everything
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
eval "$(/opt/homebrew/bin/brew shellenv)"
brew install node@20
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
source "$HOME/.cargo/env"
rustup target add aarch64-apple-darwin x86_64-apple-darwin
cargo install tauri-cli

# 2. Clone and build
git clone https://github.com/arthi-arumugam99/fileflip.git
cd fileflip
npm install
cargo tauri build --target universal-apple-darwin

# 3. Sign (after setting up certificates)
codesign --deep --force --sign "Apple Distribution: YOUR_NAME (TEAMID)" \
  src-tauri/target/universal-apple-darwin/release/bundle/macos/FileFlip.app

# 4. Package
productbuild --component src-tauri/target/universal-apple-darwin/release/bundle/macos/FileFlip.app \
  /Applications --sign "3rd Party Mac Developer Installer: YOUR_NAME (TEAMID)" FileFlip.pkg

# 5. Upload
xcrun altool --upload-app --type macos --file FileFlip.pkg --apiKey KEY_ID --apiIssuer ISSUER_ID
```

---

## Need Help?

- Apple Developer Forums: https://developer.apple.com/forums/
- Tauri Discord: https://discord.gg/tauri
- Email: junomobileapplications@gmail.com
