'use strict';

import React from 'react'
import PropTypes from 'prop-types'
import ReactNative, {
  requireNativeComponent,
  NativeModules,
  UIManager,
  PanResponder,
  PixelRatio,
  Platform,
  processColor
} from 'react-native'
import { requestPermissions } from './handlePermissions';

const RNSketchCanvas = requireNativeComponent('RNSketchCanvas', SketchCanvas, {
  nativeOnly: {
    nativeID: true,
    onChange: true
  }
});
const SketchCanvasManager = NativeModules.RNSketchCanvasManager || {};

// Command mapping for React Native 0.74+
const Commands = {
  addPoint: 'addPoint',
  newPath: 'newPath', 
  clear: 'clear',
  addPath: 'addPath',
  deletePath: 'deletePath',
  save: 'save',
  endPath: 'endPath'
};

class SketchCanvas extends React.Component {
  static propTypes = {
    style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
    strokeColor: PropTypes.string,
    strokeWidth: PropTypes.number,
    onPathsChange: PropTypes.func,
    onStrokeStart: PropTypes.func,
    onStrokeChanged: PropTypes.func,
    onStrokeEnd: PropTypes.func,
    onSketchSaved: PropTypes.func,
    user: PropTypes.string,
    scale: PropTypes.number,
    rotation: PropTypes.number,
    requiredTouches: PropTypes.number,


    touchEnabled: PropTypes.bool,

    text: PropTypes.arrayOf(PropTypes.shape({
      text: PropTypes.string,
      font: PropTypes.string,
      fontSize: PropTypes.number,
      fontColor: PropTypes.string,
      overlay: PropTypes.oneOf(['TextOnSketch', 'SketchOnText']),
      anchor: PropTypes.shape({ x: PropTypes.number, y: PropTypes.number }),
      position: PropTypes.shape({ x: PropTypes.number, y: PropTypes.number }),
      coordinate: PropTypes.oneOf(['Absolute', 'Ratio']),
      alignment: PropTypes.oneOf(['Left', 'Center', 'Right']),
      lineHeightMultiple: PropTypes.number,
    })),
    localSourceImage: PropTypes.shape({ filename: PropTypes.string, directory: PropTypes.string, mode: PropTypes.oneOf(['AspectFill', 'AspectFit', 'ScaleToFill']) }),

    permissionDialogTitle: PropTypes.string,
    permissionDialogMessage: PropTypes.string,
  };

  static defaultProps = {
    style: null,
    strokeColor: '#000000',
    strokeWidth: 3,
    onPathsChange: () => { },
    onStrokeStart: () => { },
    onStrokeChanged: () => { },
    onStrokeEnd: () => { },
    onSketchSaved: () => { },
    user: null,
    scale: 1,
    rotation: 0,
    requiredTouches: null,

    touchEnabled: true,

    text: null,
    localSourceImage: null,

    permissionDialogTitle: '',
    permissionDialogMessage: '',
  };

  state = {
    text: null
  }

  constructor(props) {
    super(props)
    this._pathsToProcess = []
    this._paths = []
    this._path = null
    this._handle = null
    this._screenScale = Platform.OS === 'ios' ? 1 : PixelRatio.get()
    this._offset = { x: 0, y: 0 }
    this._size = { width: 0, height: 0 }
    this._initialized = false

    this.state.text = this._processText(props.text ? props.text.map(t => Object.assign({}, t)) : null)
    
    // Initialize PanResponder in constructor instead of componentWillMount
    this.initializePanResponder()
  }

  initializePanResponder() {
    this.panResponder = PanResponder.create({
      // Ask to be the responder:
      onStartShouldSetPanResponder: (evt, gestureState) => this.props.touchEnabled && gestureState.numberActiveTouches === this.props.requiredTouches,
      onStartShouldSetPanResponderCapture: (evt, gestureState) => this.props.touchEnabled && gestureState.numberActiveTouches === this.props.requiredTouches,
      onMoveShouldSetPanResponder: (evt, gestureState) => this.props.touchEnabled && gestureState.numberActiveTouches === this.props.requiredTouches,
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => this.props.touchEnabled && gestureState.numberActiveTouches === this.props.requiredTouches,

      onPanResponderGrant: (evt, gestureState) => {
        if (!this.props.touchEnabled) return;
        if (this.props.requiredTouches && gestureState.numberActiveTouches !== this.props.requiredTouches) return;
        
        const e = evt.nativeEvent
        this._offset = { x: e.pageX - e.locationX, y: e.pageY - e.locationY }
        this._path = {
          id: parseInt(Math.random() * 100000000), color: this.props.strokeColor,
          width: this.props.strokeWidth, data: []
        }

        const x = parseFloat((gestureState.x0 - this._offset.x).toFixed(2)),
              y = parseFloat((gestureState.y0 - this._offset.y).toFixed(2))

        this.dispatchCommand('newPath', [
          this._path.id,
          processColor(this._path.color),
          this._path.width * this._screenScale
        ])
        this.dispatchCommand('addPoint', [
          parseFloat((x).toFixed(2) * this._screenScale),
          parseFloat((y).toFixed(2) * this._screenScale)
        ])
        this._path.data.push(`${x},${y}`)
        this.props.onStrokeStart(x, y)
      },
      onPanResponderMove: (evt, gestureState) => {
        if (!this.props.touchEnabled) return;
        if (this.props.requiredTouches && gestureState.numberActiveTouches !== this.props.requiredTouches) return;

        if (this._path) {

          const clockwiseRotationModifier = -1;
          const rotationAsRadians = this.props.rotation * (Math.PI / 180) * clockwiseRotationModifier;

          const rotated_dx = Math.cos(rotationAsRadians) * gestureState.dx - Math.sin(rotationAsRadians) * gestureState.dy;
          const rotated_dy = Math.sin(rotationAsRadians) * gestureState.dx + Math.cos(rotationAsRadians) * gestureState.dy;

          const x = parseFloat((gestureState.x0 + rotated_dx / this.props.scale - this._offset.x).toFixed(2));
          const y = parseFloat((gestureState.y0 + rotated_dy / this.props.scale - this._offset.y).toFixed(2));

          this.dispatchCommand('addPoint', [
            parseFloat(x * this._screenScale),
            parseFloat(y * this._screenScale)
          ])
          this._path.data.push(`${x},${y}`)
          this.props.onStrokeChanged(x, y)
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (!this.props.touchEnabled) return;
        if (this.props.requiredTouches && gestureState.numberActiveTouches !== this.props.requiredTouches) return;

        if (this._path) {
          this.props.onStrokeEnd({ path: this._path, size: this._size, drawer: this.props.user })
          this._paths.push({ path: this._path, size: this._size, drawer: this.props.user })
        }
        this.dispatchCommand('endPath', [])
      },
      onPanResponderTerminate: (evt, gestureState) => {
        // Another component has become the responder, so this gesture should be cancelled
        if (!this.props.touchEnabled) return;
        if (this._path) {
          this.props.onStrokeEnd({ path: this._path, size: this._size, drawer: this.props.user });
          this._paths.push({ path: this._path, size: this._size, drawer: this.props.user });
        }
        this.dispatchCommand('endPath', []);
      },

      onShouldBlockNativeResponder: (evt, gestureState) => {
        return true;
      },
    });
  }

  componentDidUpdate(prevProps) {
    if (prevProps.text !== this.props.text) {
      this.setState({
        text: this._processText(this.props.text ? this.props.text.map(t => Object.assign({}, t)) : null)
      })
    }
  }

  componentDidCatch(error, errorInfo) {
    console.warn('SketchCanvas Error:', error, errorInfo);
  }

  // Modern command dispatching method
  dispatchCommand(command, args = []) {
    if (this._canvasRef) {
      const commandName = Commands[command] || command;
      UIManager.dispatchViewManagerCommand(
        ReactNative.findNodeHandle(this._canvasRef),
        commandName,
        args
      )
    }
  }

  _processText(text) {
    text && text.forEach(t => t.fontColor = processColor(t.fontColor))
    return text
  }

  clear() {
    this._paths = []
    this._path = null
    this.dispatchCommand('clear', [])
  }

  undo() {
    let lastId = -1;
    this._paths.forEach(d => lastId = d.drawer === this.props.user ? d.path.id : lastId)
    if (lastId >= 0) this.deletePath(lastId)
    return lastId
  }

  addPath(data) {
    if (this._initialized) {
      if (this._paths.filter(p => p.path.id === data.path.id).length === 0) this._paths.push(data)
      const pathData = data.path.data.map(p => {
        const coor = p.split(',').map(pp => parseFloat(pp).toFixed(2))
        return `${coor[0] * this._screenScale * this._size.width / data.size.width},${coor[1] * this._screenScale * this._size.height / data.size.height}`;
      })
      this.dispatchCommand('addPath', [
        data.path.id, processColor(data.path.color), data.path.width * this._screenScale, pathData
      ])
    } else {
      this._pathsToProcess.filter(p => p.path.id === data.path.id).length === 0 && this._pathsToProcess.push(data)
    }
  }

  deletePath(id) {
    this._paths = this._paths.filter(p => p.path.id !== id)
    this.dispatchCommand('deletePath', [id])
  }

  save(imageType, transparent, folder, filename, includeImage, includeText, cropToImageSize) {
    this.dispatchCommand('save', [imageType, folder, filename, transparent, includeImage, includeText, cropToImageSize])
  }

  getPaths() {
    return this._paths
  }

  getBase64(imageType, transparent, includeImage, includeText, cropToImageSize, callback) {
    try {
      const nodeHandle = ReactNative.findNodeHandle(this._canvasRef);
      if (!nodeHandle) {
        callback && callback('Canvas not available', null);
        return;
      }
      
      if (Platform.OS === 'ios') {
        SketchCanvasManager.transferToBase64(nodeHandle, imageType, transparent, includeImage, includeText, cropToImageSize, callback)
      } else {
        NativeModules.SketchCanvasModule.transferToBase64(nodeHandle, imageType, transparent, includeImage, includeText, cropToImageSize, callback)
      }
    } catch (error) {
      console.warn('getBase64 error:', error);
      callback && callback(error.message, null);
    }
  }

  async componentDidMount() {
    const isStoragePermissionAuthorized = await requestPermissions(
      this.props.permissionDialogTitle,
      this.props.permissionDialogMessage,
    );
  }

  render() {
    return (
      <RNSketchCanvas
        ref={ref => {
          this._canvasRef = ref
          this._handle = ReactNative.findNodeHandle(ref)
        }}
        style={this.props.style}
        onLayout={e => {
          this._size = { width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height }
          this._initialized = true
          this._pathsToProcess.length > 0 && this._pathsToProcess.forEach(p => this.addPath(p))
        }}
        {...this.panResponder.panHandlers}
        onChange={(e) => {
          if (e.nativeEvent.hasOwnProperty('pathsUpdate')) {
            this.props.onPathsChange(e.nativeEvent.pathsUpdate)
          } else if (e.nativeEvent.hasOwnProperty('success') && e.nativeEvent.hasOwnProperty('path')) {
            this.props.onSketchSaved(e.nativeEvent.success, e.nativeEvent.path)
          } else if (e.nativeEvent.hasOwnProperty('success')) {
            this.props.onSketchSaved(e.nativeEvent.success)
          }
        }}
        localSourceImage={this.props.localSourceImage}
        permissionDialogTitle={this.props.permissionDialogTitle}
        permissionDialogMessage={this.props.permissionDialogMessage}
        text={this.state.text}
      />
    );
  }
}

// Get constants from native modules using modern API
const getConstants = () => {
  if (Platform.OS === 'ios') {
    return SketchCanvasManager.getConstants ? SketchCanvasManager.getConstants() : {}
  }
  return {}
}

const constants = getConstants()

SketchCanvas.MAIN_BUNDLE = Platform.OS === 'ios' ? (constants.MainBundlePath || '') : '';
SketchCanvas.DOCUMENT = Platform.OS === 'ios' ? (constants.NSDocumentDirectory || '') : '';
SketchCanvas.LIBRARY = Platform.OS === 'ios' ? (constants.NSLibraryDirectory || '') : '';
SketchCanvas.CACHES = Platform.OS === 'ios' ? (constants.NSCachesDirectory || '') : '';

module.exports = SketchCanvas;
