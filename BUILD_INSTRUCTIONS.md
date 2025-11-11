# Building and Distributing Al-Noor Cables Application

This guide explains how to build and distribute the Al-Noor Cables desktop application for Windows, macOS, and Linux.

## Prerequisites

1. **Node.js 18+** and npm installed
2. **All dependencies** installed (`npm install`)
3. **Build tools** for your target platform:
   - **Windows**: No additional tools needed
   - **macOS**: Xcode Command Line Tools (for signing, optional)
   - **Linux**: Standard build tools

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Build the Application

### Build for Current Platform

```bash
npm run electron:build
```

This will:
1. Build the Electron main process (`dist-electron/`)
2. Build the React app (`dist/`)
3. Create distributable packages in `release/` folder

### Build for Specific Platform

#### Windows (from any OS)

```bash
npm run build
npx electron-builder --win
```

#### macOS (from macOS only)

```bash
npm run build
npx electron-builder --mac
```

#### Linux (from Linux only)

```bash
npm run build
npx electron-builder --linux
```

#### Build for All Platforms (from macOS)

```bash
npm run build
npx electron-builder --win --mac --linux
```

## Step 3: Output Files

After building, you'll find the distributable files in the `release/` folder:

### Windows
- `Al-Noor Cables Setup x.x.x.exe` - NSIS installer
- `Al-Noor Cables Setup x.x.x.exe.blockmap` - Update metadata

### macOS
- `Al-Noor Cables-x.x.x.dmg` - Disk image installer
- `Al-Noor Cables-x.x.x-mac.zip` - ZIP archive

### Linux
- `Al-Noor Cables-x.x.x.AppImage` - AppImage (portable)
- `Al-Noor Cables-x.x.x.deb` - Debian package (Ubuntu/Debian)
- `Al-Noor Cables-x.x.x.rpm` - RPM package (Fedora/RedHat)

## Step 4: Distribution

### Windows Distribution

1. **NSIS Installer** (Recommended)
   - File: `Al-Noor Cables Setup x.x.x.exe`
   - Users can double-click to install
   - Creates Start Menu and Desktop shortcuts
   - Allows custom installation directory

2. **Portable Version** (Optional)
   - Extract the app from `dist/` and `dist-electron/`
   - Package as ZIP for portable use

### macOS Distribution

1. **DMG File** (Recommended)
   - File: `Al-Noor Cables-x.x.x.dmg`
   - Users can mount and drag to Applications
   - Standard macOS installation method

2. **Code Signing** (Optional, for distribution outside App Store)
   ```bash
   # Set in environment or electron-builder.json
   export CSC_LINK=/path/to/certificate.p12
   export CSC_KEY_PASSWORD=your_password
   ```

### Linux Distribution

1. **AppImage** (Recommended - works on all Linux distributions)
   - File: `Al-Noor Cables-x.x.x.AppImage`
   - Make executable: `chmod +x Al-Noor\ Cables-x.x.x.AppImage`
   - Double-click to run (no installation needed)

2. **DEB Package** (For Debian/Ubuntu)
   - File: `Al-Noor Cables-x.x.x.deb`
   - Install: `sudo dpkg -i Al-Noor\ Cables-x.x.x.deb`

3. **RPM Package** (For Fedora/RedHat)
   - File: `Al-Noor Cables-x.x.x.rpm`
   - Install: `sudo rpm -i Al-Noor\ Cables-x.x.x.rpm`

## Customization

### Application Icon

1. Create icons in `build/` folder:
   - `icon.ico` - Windows icon (256x256)
   - `icon.icns` - macOS icon (512x512)
   - `icon.png` - Linux icon (512x512)

2. Update `electron-builder.json` with icon paths

### Application Metadata

Edit `electron-builder.json` to customize:
- App ID
- Product Name
- Copyright
- Publisher Name
- Version (in `package.json`)

## Troubleshooting

### Build Fails

1. **Clear build cache**:
   ```bash
   rm -rf dist dist-electron release node_modules/.cache
   npm install
   ```

2. **Check Node.js version**:
   ```bash
   node --version  # Should be 18+
   ```

3. **Rebuild Electron**:
   ```bash
   npm rebuild
   ```

### Windows Build Issues

- Ensure you're running from Windows or using Wine (not recommended)
- Check Windows Defender isn't blocking the build

### macOS Build Issues

- Ensure you're building on macOS
- For code signing, you need a valid Apple Developer certificate

### Linux Build Issues

- Install required packages:
  ```bash
  # Ubuntu/Debian
  sudo apt-get install -y libnss3-dev libatk-bridge2.0-dev libdrm2 libxkbcommon-dev libxcomposite-dev libxdamage-dev libxrandr-dev libgbm-dev libxss1 libasound2-dev
  ```

## Advanced: Automated Builds

### GitHub Actions (CI/CD)

Create `.github/workflows/build.yml`:

```yaml
name: Build
on: [push, pull_request]
jobs:
  build:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [windows-latest, macos-latest, ubuntu-latest]
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - run: npx electron-builder
      - uses: actions/upload-artifact@v3
        with:
          name: ${{ matrix.os }}-build
          path: release/
```

## Version Management

Update version in `package.json`:

```json
{
  "version": "1.0.0"
}
```

The build will automatically use this version number.

## Distribution Checklist

- [ ] Update version number in `package.json`
- [ ] Add application icons (optional but recommended)
- [ ] Test the build on target platform
- [ ] Create release notes
- [ ] Upload to distribution platform (GitHub Releases, website, etc.)
- [ ] Test installation on clean system
- [ ] Verify all features work after installation

## Quick Reference

```bash
# Development
npm run dev

# Build for production
npm run build

# Build and package
npm run electron:build

# Build for specific platform
npx electron-builder --win
npx electron-builder --mac
npx electron-builder --linux

# Clean build
rm -rf dist dist-electron release
npm run electron:build
```

## Support

For issues or questions:
1. Check the `README.md` for general information
2. Review Electron Builder documentation: https://www.electron.build/
3. Check Electron documentation: https://www.electronjs.org/

