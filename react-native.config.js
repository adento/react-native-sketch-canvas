module.exports = {
  dependencies: {
    '@terrylinla/react-native-sketch-canvas': {
      platforms: {
        android: {
          sourceDir: '../android',
          packageImportPath: 'import com.terrylinla.rnsketchcanvas.SketchCanvasPackage;',
        },
        ios: {
          podspecPath: '../RNSketchCanvas.podspec',
        },
      },
    },
  },
};
