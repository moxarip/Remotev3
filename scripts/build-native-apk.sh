#!/usr/bin/env bash
set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ANDROID_DIR="$ROOT_DIR/android"
APP_DIR="$ANDROID_DIR/app/src/main"
BUILD_DIR="$ANDROID_DIR/build"
DEBUG_DIR="$ROOT_DIR/debug"
DIST_DIR="$ROOT_DIR/dist"
ANDROID_JAR="/usr/lib/android-sdk/platforms/android-23/android.jar"

echo "=========================================================="
echo "    Clouvea Remote - Full Clean Native Android Build      "
echo "=========================================================="

# 1. Clean previous build directory and debug directory completely
echo "[1/10] Performing clean wipe of build and debug directories..."
rm -rf "$BUILD_DIR"
rm -rf "$DEBUG_DIR"
mkdir -p "$BUILD_DIR/gen" "$BUILD_DIR/classes" "$DEBUG_DIR" "$APP_DIR/assets/www"

# 2. Sync production web assets into Android package assets
echo "[2/10] Packaging entire web application bundle into Android assets/www/..."
if [ -d "$DIST_DIR" ]; then
    rm -rf "$APP_DIR/assets/www"/*
    cp -r "$DIST_DIR"/* "$APP_DIR/assets/www/"
    echo "       Bundled $(find "$APP_DIR/assets/www" -type f | wc -l) web assets into APK."
else
    echo "       Error: dist/ directory not found! Run vite build first."
    exit 1
fi

# 3. Generate Android R.java resources using aapt
echo "[3/10] Compiling Android resource table and generating R.java..."
aapt package -f -m \
    -J "$BUILD_DIR/gen" \
    -M "$APP_DIR/AndroidManifest.xml" \
    -S "$APP_DIR/res" \
    -I "$ANDROID_JAR"

# 4. Compile Java sources into bytecode using javac
echo "[4/10] Compiling Java source files with javac (Target 1.8)..."
find "$APP_DIR/java" "$BUILD_DIR/gen" -name "*.java" > "$BUILD_DIR/sources.txt"
javac -encoding UTF-8 \
    -source 8 -target 8 \
    -bootclasspath "$ANDROID_JAR" \
    -cp "$ANDROID_JAR" \
    -d "$BUILD_DIR/classes" \
    @"$BUILD_DIR/sources.txt"
echo "       Compiled $(find "$BUILD_DIR/classes" -name "*.class" | wc -l) Java class files."

# 5. Convert class files to Dalvik executable bytecode (classes.dex)
echo "[5/10] Translating Java bytecode to Dalvik Executable (classes.dex)..."
dx --dex --output="$BUILD_DIR/classes.dex" "$BUILD_DIR/classes"

# 6. Package resources and assets into unsigned APK package
echo "[6/10] Packaging compiled binary resources and assets with aapt..."
aapt package -f \
    -M "$APP_DIR/AndroidManifest.xml" \
    -S "$APP_DIR/res" \
    -A "$APP_DIR/assets" \
    -I "$ANDROID_JAR" \
    -F "$BUILD_DIR/app.unsigned.apk"

# 7. Inject classes.dex into APK package
echo "[7/10] Injecting classes.dex into APK..."
cd "$BUILD_DIR"
aapt add "app.unsigned.apk" "classes.dex"
cd "$ROOT_DIR"

# 8. 4-byte page align using zipalign
echo "[8/10] Aligning package data on 4-byte boundaries (zipalign)..."
zipalign -p -f 4 "$BUILD_DIR/app.unsigned.apk" "$BUILD_DIR/app.aligned.apk"

# 9. Create dedicated RSA-2048 signing keystore
echo "[9/10] Initializing Cryptographic Keystore (RSA 2048-bit)..."
KEYSTORE="$BUILD_DIR/clouvea-release.keystore"
keytool -genkeypair -v \
    -keystore "$KEYSTORE" \
    -alias clouvea \
    -keyalg RSA \
    -keysize 2048 \
    -validity 10000 \
    -storepass clouvea123 \
    -keypass clouvea123 \
    -dname "CN=Clouvea Remote, OU=Android Mobile, O=Clouvea Systems, L=Global, ST=Universal, C=US"

# 10. Cryptographically sign APK with apksigner (v1, v2, and v3 schemes)
echo "[10/10] Signing APK with apksigner (JAR + Full APK Signing Schemes v1/v2/v3)..."
apksigner sign \
    --ks "$KEYSTORE" \
    --ks-pass pass:clouvea123 \
    --ks-key-alias clouvea \
    --key-pass pass:clouvea123 \
    --out "$DEBUG_DIR/v1.apk" \
    "$BUILD_DIR/app.aligned.apk"

# Verification & Metadata Generation
echo "----------------------------------------------------------"
echo "Verifying APK integrity and signature validity..."
apksigner verify -v "$DEBUG_DIR/v1.apk"

APK_SIZE=$(du -h "$DEBUG_DIR/v1.apk" | cut -f1)
APK_BYTES=$(wc -c < "$DEBUG_DIR/v1.apk")
SHA256_HASH=$(sha256sum "$DEBUG_DIR/v1.apk" | cut -d' ' -f1)

cat << EOF > "$DEBUG_DIR/README.txt"
==========================================================
    CLOUVEA REMOTE - OFFICIAL COMPILED ANDROID PACKAGE
==========================================================
Package Name:     com.clouvea.remote
Version Name:     1.0.0
Version Code:     1
File:             v1.apk
Binary Size:      $APK_SIZE ($APK_BYTES bytes)
SHA-256 Checksum: $SHA256_HASH
Min SDK:          Android 5.0 Lollipop (API 21)
Target SDK:       Android 13 / 14 (API 33 / 34)
Signature:        APK Signature Scheme v1, v2, and v3 Verified

Core Features Included:
1. Controller Phone Mode (Full fleet control, storage, tasks)
2. Managed Node Daemon (Background persistent service, SAF authorization)
3. Direct GPS Location Tracker & Radar (Live map, Haversine distance, speed, altitude)
4. P2P Dual Mesh & WebSocket Relay Signaling
5. Smart Differential Backup (SHA-256 deduplication and ZIP packaging)
6. Hardware Telemetry (Battery API, Storage stats, Vibrate, Audio Alarm Siren)
7. Storage Access Framework (SAF tree URI scopes)
8. Offline Standalone Web & Native Runtime embedded in assets/www/

Installation:
- Direct installation via Android Package Installer
- Or via command: adb install debug/v1.apk
==========================================================
EOF

cat << EOF > "$DEBUG_DIR/manifest-summary.json"
{
  "packageName": "com.clouvea.remote",
  "versionName": "1.0.0",
  "versionCode": 1,
  "fileName": "v1.apk",
  "size": "$APK_SIZE",
  "sizeBytes": $APK_BYTES,
  "sha256": "$SHA256_HASH",
  "targetSdkVersion": 33,
  "minSdkVersion": 21,
  "builtAt": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "signatures": ["v1", "v2", "v3"],
  "status": "VERIFIED_VALID"
}
EOF

echo "=========================================================="
echo " SUCCESS: Android APK Rebuilt Completely from Scratch!   "
echo " Location:  $DEBUG_DIR/v1.apk                             "
echo " Size:      $APK_SIZE ($APK_BYTES bytes)                  "
echo " SHA-256:   $SHA256_HASH                                  "
echo "=========================================================="
