#!/usr/bin/env bash
set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ANDROID_DIR="$ROOT_DIR/android"
APP_DIR="$ANDROID_DIR/app/src/main"
BUILD_DIR="$ANDROID_DIR/build"
DEBUG_DIR="$ROOT_DIR/debug"
DIST_DIR="$ROOT_DIR/dist"
ANDROID_JAR="/usr/lib/android-sdk/platforms/android-23/android.jar"

echo "=== Building Native Android APK for Clouvea Remote ==="

# 1. Ensure build and debug directories exist
mkdir -p "$BUILD_DIR/gen" "$BUILD_DIR/classes" "$DEBUG_DIR" "$APP_DIR/assets/www"

# 2. Sync web distribution bundle into Android assets
if [ -d "$DIST_DIR" ]; then
    echo "Syncing production web assets into Android package assets..."
    rm -rf "$APP_DIR/assets/www/*"
    cp -r "$DIST_DIR"/* "$APP_DIR/assets/www/"
else
    echo "Warning: dist/ directory not found. Please run 'npm run build' first."
fi

# 3. Generate R.java using aapt
echo "Generating Android R.java resources..."
aapt package -f -m \
    -J "$BUILD_DIR/gen" \
    -M "$APP_DIR/AndroidManifest.xml" \
    -S "$APP_DIR/res" \
    -I "$ANDROID_JAR"

# 4. Compile Java sources into bytecode using javac
echo "Compiling Java sources..."
find "$APP_DIR/java" "$BUILD_DIR/gen" -name "*.java" > "$BUILD_DIR/sources.txt"
javac -encoding UTF-8 \
    -source 8 -target 8 \
    -bootclasspath "$ANDROID_JAR" \
    -cp "$ANDROID_JAR" \
    -d "$BUILD_DIR/classes" \
    @"$BUILD_DIR/sources.txt"

# 5. Convert class files to Dalvik bytecode (classes.dex)
echo "Generating Dalvik Executable (classes.dex)..."
dx --dex --output="$BUILD_DIR/classes.dex" "$BUILD_DIR/classes"

# 6. Package resources and assets into unsigned APK
echo "Packaging compiled resources and assets..."
aapt package -f \
    -M "$APP_DIR/AndroidManifest.xml" \
    -S "$APP_DIR/res" \
    -A "$APP_DIR/assets" \
    -I "$ANDROID_JAR" \
    -F "$BUILD_DIR/app.unsigned.apk"

# 7. Add classes.dex into APK package
echo "Injecting classes.dex into APK..."
cd "$BUILD_DIR"
aapt add "app.unsigned.apk" "classes.dex"
cd "$ROOT_DIR"

# 8. 4-byte page align using zipalign
echo "Aligning APK with zipalign (4-byte alignment)..."
zipalign -p -f 4 "$BUILD_DIR/app.unsigned.apk" "$BUILD_DIR/app.aligned.apk"

# 9. Create debug keystore if not exists
KEYSTORE="$BUILD_DIR/debug.keystore"
if [ ! -f "$KEYSTORE" ]; then
    echo "Generating RSA debug keystore for Clouvea..."
    keytool -genkeypair -v \
        -keystore "$KEYSTORE" \
        -alias clouvea \
        -keyalg RSA \
        -keysize 2048 \
        -validity 10000 \
        -storepass clouvea123 \
        -keypass clouvea123 \
        -dname "CN=Clouvea Remote, OU=Android, O=Clouvea, L=Remote, ST=State, C=US"
fi

# 10. Cryptographically sign APK with apksigner (v1 & v2 signatures)
echo "Signing APK with apksigner (v1 + v2 schemes)..."
apksigner sign \
    --ks "$KEYSTORE" \
    --ks-pass pass:clouvea123 \
    --ks-key-alias clouvea \
    --key-pass pass:clouvea123 \
    --out "$DEBUG_DIR/v1.apk" \
    "$BUILD_DIR/app.aligned.apk"

# 11. Verify APK signature
echo "Verifying APK integrity..."
apksigner verify -v "$DEBUG_DIR/v1.apk"

APK_SIZE=$(du -h "$DEBUG_DIR/v1.apk" | cut -f1)
APK_BYTES=$(wc -c < "$DEBUG_DIR/v1.apk")

cat << EOF > "$DEBUG_DIR/README.txt"
Clouvea Remote - Verified Android Package (v1.apk)
Package: com.clouvea.remote
Version: 1.0.0 (VersionCode: 1)
Size: $APK_SIZE ($APK_BYTES bytes)
Architecture: Universal (All Android ARM64, ARMv7, x86_64 devices)
SDK: Min Android 5.0 (API 21) - Target Android 13/14 (API 33/34)
Signatures: APK Signature Scheme v1 (JAR) & v2 (APK) Verified
Features:
- Full Controller & Node Management Engine
- Remote Phone-to-Phone GPS Location Tracker & Radar
- Real Storage Access Framework (SAF)
- Background Daemon Service
- Audio & Physical Vibration Alarm
- Offline Standalone Web & Native Runtime
EOF

echo "=== Successfully Generated Verified Android APK: $DEBUG_DIR/v1.apk ($APK_SIZE) ==="
