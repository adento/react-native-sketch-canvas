# React Native 0.74.5 Migration Guide

This React Native Sketch Canvas module has been updated to support React Native 0.74.5. Here are the key changes made:

## Main Changes

### 1. Package Configuration
- Updated `package.json` to include `peerDependencies` for React Native >= 0.60.0
- Added React Native 0.74.5 as a devDependency
- Added Node.js 18+ requirement

### 2. Android Updates
- Updated `android/build.gradle`:
  - Minimum SDK version: 23 (was 16)
  - Target SDK version: 34 (was 27)  
  - Compile SDK version: 34 (was 27)
  - Added Java 11 compatibility (was Java 8)
  - Updated dependencies and build configuration
  - Added new React Native Gradle plugin support

- Updated `SketchCanvasPackage.java`:
  - Removed deprecated `createJSModules()` method

- Updated `SketchCanvasModule.java`:
  - Replaced deprecated `UIBlock` and `NativeViewHierarchyManager` 
  - Added `UiThreadUtil` for thread-safe operations
  - Updated to use modern `UIManagerHelper` APIs

- Updated `SketchCanvasManager.java`:
  - Replaced `HashMap` with `MapBuilder` for commands map

### 3. iOS Updates
- Updated `RNSketchCanvas.podspec`:
  - Minimum iOS version: 13.4 (was 8.0)
  - Added support for new React Native architecture
  - Updated dependency structure for React Native 0.74+

### 4. JavaScript Updates
- Removed deprecated `ViewPropTypes` import
- Updated PropTypes to use compatible alternatives
- **Replaced deprecated lifecycle methods:**
  - `UNSAFE_componentWillReceiveProps` → `componentDidUpdate`
  - `UNSAFE_componentWillMount` → moved PanResponder initialization to constructor
- **Updated UIManager API usage:**
  - Replaced deprecated `UIManager.getViewManagerConfig()` with modern command dispatching
  - Added proper error handling and ref management
  - Updated native module interactions for React Native 0.74+
- **Enhanced Android permissions handling:**
  - Added support for Android 13+ media permissions
  - Improved permission request logic for different API levels
  - Added proper error handling for permission requests
- **Added modern React patterns:**
  - Error boundaries with `componentDidCatch`
  - Improved state management
  - Better ref handling

### 5. Configuration Files
- Added `react-native.config.js` for proper autolinking support
- Added `react-native.config.json` for new architecture support
- Updated example project with modern React Native 0.74.5 configuration
- Added Podfile for iOS example project

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

- **React Native**: >= 0.60.0, tested up to 0.74.5
- **iOS**: >= 13.4
- **Android**: >= API 23 (Android 6.0)
- **Node.js**: >= 18

## Breaking Changes

### Minimum Requirements
- React Native 0.60.0 or higher
- iOS 13.4 or higher  
- Android API 23 or higher
- Node.js 18 or higher

### PropTypes
- `ViewPropTypes.style` has been replaced with `PropTypes.oneOfType([PropTypes.object, PropTypes.array])`

### Lifecycle Methods  
- `UNSAFE_componentWillReceiveProps` has been replaced with `componentDidUpdate`
- `UNSAFE_componentWillMount` has been removed, PanResponder initialization moved to constructor

### Native API Changes
- `UIManager.getViewManagerConfig()` has been replaced with modern command dispatching
- Updated native module interaction patterns for React Native 0.74+

### Native Code Changes
- Android: Deprecated APIs have been replaced with modern equivalents
- iOS: Updated to use React Native 0.74+ compatible dependencies

## Migration Steps

1. Update your React Native version to 0.74.5 or compatible
2. Update this package to the latest version (0.8.1+)
3. Update Node.js to version 18 or higher
4. For iOS: Run `pod install`
5. For Android: Clean and rebuild your project
6. Update your Android project's `compileSdkVersion` to 34 and `minSdkVersion` to 23

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

## New Architecture Support

This version includes basic support for React Native's new architecture (Fabric/TurboModules). To enable:

1. Set `newArchEnabled=true` in your `android/gradle.properties`
2. Follow React Native's official new architecture migration guide

## Troubleshooting

If you encounter issues:

1. Clear Metro cache: `npx react-native start --reset-cache`
2. Clean Android: `cd android && ./gradlew clean`
3. Clean iOS: `cd ios && xcodebuild clean`
4. Reinstall dependencies: `rm -rf node_modules && npm install`
5. For iOS: `cd ios && rm -rf Pods && pod install`

### Common Issues

**Android Build Errors:**
- Ensure your `compileSdkVersion` is 34 or higher
- Update Android Gradle Plugin to 8.0+
- Use Java 11 or higher

**iOS Build Errors:**
- Ensure iOS deployment target is 13.4 or higher
- Run `pod install` after updating
- Clear Xcode derived data if needed

**Metro/JavaScript Errors:**
- Update to latest Metro bundler
- Clear Metro cache
- Ensure React Native version compatibility
