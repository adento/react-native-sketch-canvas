# React Native 0.72 Migration Guide

This React Native Sketch Canvas module has been updated to support React Native 0.72. Here are the key changes made:

## Main Changes

### 1. Package Configuration
- Updated `package.json` to include `peerDependencies` for React Native >= 0.60.0
- Added React Native 0.72.0 as a devDependency

### 2. Android Updates
- Updated `android/build.gradle`:
  - Minimum SDK version: 21 (was 16)
  - Target SDK version: 33 (was 27)  
  - Compile SDK version: 33 (was 27)
  - Added Java 8 compatibility
  - Changed from `provided` to `implementation` for React Native dependency

- Updated `SketchCanvasPackage.java`:
  - Removed deprecated `createJSModules()` method

### 3. iOS Updates
- Updated `RNSketchCanvas.podspec`:
  - Minimum iOS version: 11.0 (was 8.0)
  - Added support for new React Native architecture
  - Updated dependency structure

### 4. JavaScript Updates
- Removed deprecated `ViewPropTypes` import
- Updated PropTypes to use compatible alternatives
- All React Native imports are now compatible with 0.72

### 5. Configuration Files
- Added `react-native.config.js` for proper autolinking support
- Updated example project with modern React Native 0.72 configuration

## Installation

For React Native >= 0.60.0 (with autolinking):

```bash
npm install @terrylinla/react-native-sketch-canvas
# or
yarn add @terrylinla/react-native-sketch-canvas
```

For iOS, run:
```bash
cd ios && pod install
```

## Compatibility

- **React Native**: >= 0.60.0
- **iOS**: >= 11.0
- **Android**: >= API 21 (Android 5.0)

## Breaking Changes

### Minimum Requirements
- React Native 0.60.0 or higher
- iOS 11.0 or higher  
- Android API 21 or higher

### PropTypes
- `ViewPropTypes.style` has been replaced with `PropTypes.oneOfType([PropTypes.object, PropTypes.array])`

## Migration Steps

1. Update your React Native version to 0.72 or higher
2. Update this package to the latest version
3. Run `pod install` for iOS
4. Clean and rebuild your project

## Example Usage

The API remains the same:

```javascript
import SketchCanvas from '@terrylinla/react-native-sketch-canvas';

// Your existing code should work without changes
<SketchCanvas
  style={{flex: 1}}
  strokeColor={'#000000'}
  strokeWidth={3}
  onStrokeStart={() => {}}
  onStrokeChanged={() => {}}
  onStrokeEnd={() => {}}
/>
```

## Troubleshooting

If you encounter issues:

1. Clear Metro cache: `npx react-native start --reset-cache`
2. Clean Android: `cd android && ./gradlew clean`
3. Clean iOS: `cd ios && xcodebuild clean`
4. Reinstall dependencies: `rm -rf node_modules && npm install`
