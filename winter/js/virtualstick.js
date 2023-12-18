import { Screen } from './screen.js'

// Virtual Sticks for mobile navigation
class VirtualJoystick extends Screen {
  _xAddPos = 0
  _yAddPos = 0
  _xAddRot = 0
  _yAddRot = 0

  _sideJoystickOffset = 150
  _bottomJoystickOffset = -50

  _leftThumbContainer
  _leftFootPrint
  _rightThumbContainer
  _rightEye
  _leftInnerThumbContainer
  _rightInnerThumbContainer
  _leftPuck
  _rightPuck

  constructor() {
    super()

    this._leftThumbContainer = this.makeThumbArea(
      'leftThumb',
      2,
      'purple',
      null
    )
    this._leftFootPrint = this.makeFootPrintPicture()
    this._leftInnerThumbContainer = this.makeThumbArea(
      'leftInnterThumb',
      0,
      'purple',
      null
    )
    this._leftPuck = this.makeThumbArea('leftPuck', 0, 'purple', 'blue')
    this._rightThumbContainer = this.makeThumbArea(
      'rightThumb',
      2,
      'purple',
      null
    )
    this._rightEye = this.makeEyePicture()
    this._rightInnerThumbContainer = this.makeThumbArea(
      'rightInnterThumb',
      0,
      'purple',
      null
    )
    this._rightPuck = this.makeThumbArea('rightPuck', 0, 'purple', 'red')
  }

  initVirtualStick(adt) {
    // left stick ( include left thumb, left inner thumb and left puck )
    this.initLeftStick(adt)

    // right stick ( include right thumb, right inner thumb and right puck )
    this.initRightStick(adt)
  }

  initLeftStick(adt) {
    // left thumb
    this._leftThumbContainer.height = '200px'
    this._leftThumbContainer.width = '200px'
    this._leftThumbContainer.isPointerBlocker = true
    this._leftThumbContainer.horizontalAlignment =
      BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT
    this._leftThumbContainer.verticalAlignment =
      BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM
    this._leftThumbContainer.alpha = 0.4
    this._leftThumbContainer.left = this._sideJoystickOffset
    this._leftThumbContainer.top = this._bottomJoystickOffset

    // left footprint
    this._leftFootPrint.height = '80px'
    this._leftFootPrint.width = '80px'
    //this._leftFootPrint.isPointerBlocker = true;
    this._leftFootPrint.horizontalAlignment =
      BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER
    this._leftFootPrint.verticalAlignment =
      BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER

    // left inner thumb
    this._leftInnerThumbContainer.height = '80px'
    this._leftInnerThumbContainer.width = '80px'
    //this._leftInnerThumbContainer.isPointerBlocker = true;
    this._leftInnerThumbContainer.horizontalAlignment =
      BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER
    this._leftInnerThumbContainer.verticalAlignment =
      BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER

    // left puck
    this._leftPuck.height = '60px'
    this._leftPuck.width = '60px'
    //this._leftPuck.isPointerBlocker = true;
    this._leftPuck.horizontalAlignment =
      BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER
    this._leftPuck.verticalAlignment =
      BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER

    // events
    this._leftThumbContainer.onPointerDownObservable.add((coordinates) => {
      this._leftPuck.isVisible = true
      this._leftPuck.floatLeft =
        coordinates.x -
        this._leftThumbContainer._currentMeasure.width * 0.5 -
        this._sideJoystickOffset
      this._leftPuck.left = this._leftPuck.floatLeft
      this._leftPuck.floatTop =
        adt._canvas.height -
        coordinates.y -
        this._leftThumbContainer._currentMeasure.height * 0.5 +
        this._bottomJoystickOffset
      this._leftPuck.top = this._leftPuck.floatTop * -1
      this._leftPuck.isDown = true
      this._leftThumbContainer.alpha = 0.9
    })

    this._leftThumbContainer.onPointerUpObservable.add((coordinates) => {
      this._xAddPos = 0
      this._yAddPos = 0
      this._leftPuck.isDown = false
      this._leftPuck.isVisible = false
      this._leftThumbContainer.alpha = 0.4
    })

    this._leftThumbContainer.onPointerMoveObservable.add((coordinates) => {
      if (this._leftPuck.isDown) {
        this._xAddPos =
          coordinates.x -
          this._leftThumbContainer._currentMeasure.width * 0.5 -
          this._sideJoystickOffset
        this._yAddPos =
          adt._canvas.height -
          coordinates.y -
          this._leftThumbContainer._currentMeasure.height * 0.5 +
          this._bottomJoystickOffset
        this._leftPuck.floatLeft = this._xAddPos
        this._leftPuck.floatTop = this._yAddPos * -1
        this._leftPuck.left = this._leftPuck.floatLeft
        this._leftPuck.top = this._leftPuck.floatTop
      }
    })

    adt.addControl(this._leftThumbContainer)
    this._leftThumbContainer.addControl(this._leftInnerThumbContainer)
    this._leftThumbContainer.addControl(this._leftFootPrint)
    this._leftThumbContainer.addControl(this._leftPuck)
    this._leftPuck.isVisible = false
  }

  initRightStick(adt) {
    // right thumb
    this._rightThumbContainer.height = '200px'
    this._rightThumbContainer.width = '200px'
    this._rightThumbContainer.isPointerBlocker = true
    this._rightThumbContainer.horizontalAlignment =
      BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT
    this._rightThumbContainer.verticalAlignment =
      BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM
    this._rightThumbContainer.alpha = 0.4
    this._rightThumbContainer.left = -this._sideJoystickOffset
    this._rightThumbContainer.top = this._bottomJoystickOffset

    // left footprint
    this._rightEye.height = '60px'
    this._rightEye.width = '80px'
    //this._leftFootPrint.isPointerBlocker = true;
    this._rightEye.horizontalAlignment =
      BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER
    this._rightEye.verticalAlignment =
      BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER

    // right inner thumb
    this._rightInnerThumbContainer.height = '80px'
    this._rightInnerThumbContainer.width = '80px'
    //this._rightInnerThumbContainer.isPointerBlocker = true;
    this._rightInnerThumbContainer.horizontalAlignment =
      BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER
    this._rightInnerThumbContainer.verticalAlignment =
      BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER

    // right puck
    this._rightPuck.height = '60px'
    this._rightPuck.width = '60px'
    //this._rightPuck.isPointerBlocker = true;
    this._rightPuck.horizontalAlignment =
      BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER
    this._rightPuck.verticalAlignment =
      BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER

    // events
    this._rightThumbContainer.onPointerDownObservable.add((coordinates) => {
      this._rightPuck.isVisible = true
      this._rightPuck.floatLeft =
        adt._canvas.width -
        coordinates.x -
        this._rightThumbContainer._currentMeasure.width * 0.5 -
        this._sideJoystickOffset
      this._rightPuck.left = this._rightPuck.floatLeft * -1
      this._rightPuck.floatTop =
        adt._canvas.height -
        coordinates.y -
        this._rightThumbContainer._currentMeasure.height * 0.5 +
        this._bottomJoystickOffset
      this._rightPuck.top = this._rightPuck.floatTop * -1
      this._rightPuck.isDown = true
      this._rightThumbContainer.alpha = 0.9
    })

    this._rightThumbContainer.onPointerUpObservable.add((coordinates) => {
      this._xAddRot = 0
      this._yAddRot = 0
      this._rightPuck.isDown = false
      this._rightPuck.isVisible = false
      this._rightThumbContainer.alpha = 0.4
    })

    this._rightThumbContainer.onPointerMoveObservable.add((coordinates) => {
      if (this._rightPuck.isDown) {
        this._xAddRot =
          adt._canvas.width -
          coordinates.x -
          this._rightThumbContainer._currentMeasure.width * 0.5 -
          this._sideJoystickOffset
        this._yAddRot =
          adt._canvas.height -
          coordinates.y -
          this._rightThumbContainer._currentMeasure.height * 0.5 +
          this._bottomJoystickOffset
        this._rightPuck.floatLeft = this._xAddRot * -1
        this._rightPuck.floatTop = this._yAddRot * -1
        this._rightPuck.left = this._rightPuck.floatLeft
        this._rightPuck.top = this._rightPuck.floatTop
      }
    })

    //leftThumbContainer.left = 50;
    adt.addControl(this._rightThumbContainer)
    this._rightThumbContainer.addControl(this._rightEye)
    this._rightThumbContainer.addControl(this._rightInnerThumbContainer)
    this._rightThumbContainer.addControl(this._rightPuck)
    this._rightPuck.isVisible = false
  }

  transform(universalCamera) {
    let translateTransform = null
    if (this.isFullScreen() || this.isLandscape()) {
      translateTransform = BABYLON.Vector3.TransformCoordinates(
        new BABYLON.Vector3(this._xAddPos / 750, 0, this._yAddPos / 750),
        BABYLON.Matrix.RotationY(universalCamera.rotation.y)
      )
    } else {
      translateTransform = BABYLON.Vector3.TransformCoordinates(
        new BABYLON.Vector3(this._xAddPos / 1500, 0, this._yAddPos / 1500),
        BABYLON.Matrix.RotationY(universalCamera.rotation.y)
      )
    }

    universalCamera.cameraDirection.addInPlace(translateTransform)

    // on fullscreen mode, need to increase camera rotation speed
    if (this.isFullScreen() || this.isLandscape()) {
      universalCamera.cameraRotation.y += (this._xAddRot / 15000) * -1
      universalCamera.cameraRotation.x += (this._yAddRot / 15000) * -1
    } else {
      universalCamera.cameraRotation.y += (this._xAddRot / 30000) * -1
      universalCamera.cameraRotation.x += (this._yAddRot / 30000) * -1
    }
  }

  setVisible(val) {
    this._leftThumbContainer.isVisible = val
    this._rightThumbContainer.isVisible = val
  }

  makeThumbArea(name, thickness, color, background) {
    let rect = new BABYLON.GUI.Ellipse()
    rect.name = name
    rect.thickness = thickness
    rect.color = color
    rect.background = background
    rect.paddingLeft = '0px'
    rect.paddingRight = '0px'
    rect.paddingTop = '0px'
    rect.paddingBottom = '0px'

    return rect
  }

  makeFootPrintPicture() {
    var image = new BABYLON.GUI.Image(
      'footprint',
      './images/mobile_footprint.png'
    )
    return image
  }

  makeEyePicture() {
    var image = new BABYLON.GUI.Image('footprint', './images/mobile_eye.png')
    return image
  }

  resize(canvas) {
    super.resize(canvas)

    // screen mode
    const PORTRAIT = 1
    const LANDSCAPE = 2
    const OFFSET_LIMIT = 50
    let screenMode = PORTRAIT

    let newSize

    // landscape mode
    if (this.isLandscape()) {
      screenMode = LANDSCAPE
      newSize = canvas.height / 5
      if (newSize > 150) {
        newSize = 150
      }
    } else {
      // portrait mode
      screenMode = PORTRAIT
      newSize = canvas.width / 5
      if (newSize > 200) {
        newSize = 200
      }
    }

    // offset
    let offset = newSize / 2.5
    if (offset < OFFSET_LIMIT) {
      this._sideJoystickOffset = OFFSET_LIMIT
    } else {
      this._sideJoystickOffset = offset
    }

    this._leftThumbContainer.width = newSize + 'px'
    this._leftThumbContainer.height = newSize + 'px'

    this._leftThumbContainer.left = this._sideJoystickOffset + 'px'

    this._leftInnerThumbContainer.width = newSize / 2.5 + 'px'
    this._leftInnerThumbContainer.height = newSize / 2.5 + 'px'

    this._leftFootPrint.width = newSize / 1.4 + 'px'
    this._leftFootPrint.height = newSize / 1.4 + 'px'

    this._leftPuck.width = newSize / 3.33 + 'px'
    this._leftPuck.height = newSize / 3.33 + 'px'

    this._rightThumbContainer.width = newSize + 'px'
    this._rightThumbContainer.height = newSize + 'px'

    this._rightThumbContainer.left = -this._sideJoystickOffset + 'px'

    this._rightInnerThumbContainer.width = newSize / 2.5 + 'px'
    this._rightInnerThumbContainer.height = newSize / 2.5 + 'px'

    this._rightEye.width = newSize / 1.4 + 'px'
    this._rightEye.height = newSize / 1.8 + 'px'

    this._rightPuck.width = newSize / 3.33 + 'px'
    this._rightPuck.height = newSize / 3.33 + 'px'
  }
}

export { VirtualJoystick }
