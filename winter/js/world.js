import { GamePadController } from './gamepad.js'

class World {
  WORLD_FILE = 'babylon/hiver8.babylon'

  /**
   * Navigation
   */
  static SPEED = 0.7 // default 2
  static FLY_MODE = 1
  static WALK_MODE = 2

  // refer to camera ellipsoid area
  AVATAR_SIZE = {
    x: 1,
    y: 1.8,
    z: 1,
  }

  GRAVITY_FORCE = -0.55 // default -0.98
  ANGULAR_SENSIBILTY = 5000 // default 2000
  TOUCH_ANGULAR_SENSIBILITY = 4000 // default 20000
  TOUCH_MOVE_SENSIBILITY = 250 // default 250

  // helpers
  HELPER_VISIBILITY = false

  /**
   * Cameras
   */

  // Start camera
  CAMERA1_POSITION = new BABYLON.Vector3(-10.739, 3.118, -7.701)
  CAMERA1_ROTATION = new BABYLON.Vector3(0.016, 0.598, 0.0)

  // Back of the village
  CAMERA2_POSITION = new BABYLON.Vector3(40.543, 3.119, 33.001)
  CAMERA2_ROTATION = new BABYLON.Vector3(-0.015, -1.237, 0.0)

  // Rotate camera
  CAMERA3_POSITION = new BABYLON.Vector3(73.43, 9.16, 51.44)
  CAMERA3_ROTATION = new BABYLON.Vector3(0.04, -2.55, 0)

  /**
   * Lights
   */
  LIGHT_INTENSITY = 2

  /**
   * Multi langages
   */
  URL_WEBSITE = {
    en: 'https://virtualworlds.fun/',
    fr: 'https://mondesvirtuels.com/',
  }

  PANEL_1_URL = {
    en: '../atlantis/',
    fr: '../atlantide/',
  }

  PANEL_2_URL = {
    en: '../halloween/',
    fr: '../halloween/',
  }

  /**
   *  Actions
   */
  ACTIONS = {
    openGoldenBook: 'Open golden book',
    openHalloween: 'Open halloween',
    openAtlantis: 'Open atlantis',
  }

  ACTIONS_OPEN_BOOK = {
    en: 'open golden book',
    fr: "ouvrir le livre d'or",
  }

  ACTIONS_JUMP_HALLOWEEN = {
    en: 'jump to halloween',
    fr: 'découvrir halloween',
  }

  ACTIONS_JUMP_ATLANTIS = {
    en: 'jump to atlantis',
    fr: 'découvrir atlantide',
  }

  ACTION_MESHES = ['goldenBook', 'informationPanel1Url', 'informationPanel2Url']

  // Gifts links
  TAB_GIFTS = {
    0: 'https://www.supercoloring.com/coloring-pages/nature-seasons/winter', // Coloring
    1: 'https://www.google.com/maps/@68.5090814,27.4817772,2a,90y,347.89h,129.85t/data=!3m7!1e1!3m5!1sNzZLM1mGhUgAAAQZLDcQIg!2e0!3e2!7i10000!8i5000', // Street view Northern Lights in Finland
    2: 'https://www.tasteofhome.com/collection/christmas-recipes-for-kids/', // Cookies receipts christmas
    3: 'https://youtu.be/-idp8hup9-A', // Songs with lyrics
  }

  constructor(engine, canvas, virtualJoystick, gui) {
    this._engine = engine
    this._scene = new BABYLON.Scene(this._engine)
    this._virtualJoystick = virtualJoystick
    this._canvas = canvas
    this._gui = gui
    this._lang = document.documentElement.lang

    this._numCamera = 1 // camera number to use at launch of the world
    this._typeNavigation = World.WALK_MODE // navigation mode by default at launch
    this._isUserGesture = false
    this._isMobile = gui.isMobile()
    this._currentAction = null
    this._gamepadStatus = GamePadController.GAMEPAD_DISCONNECTED

    // lights
    this._lightDown
    this._lightUp

    // camera
    this._followCamera = null
  }

  async createScene() {
    let isCollision = true
    let isGravity = true

    this._scene.ambientColor = BABYLON.Color3.FromInts(0, 0, 0)

    // cold blue morning
    this._scene.clearColor = BABYLON.Color3.FromInts(0, 13, 0)

    this._scene.gravity = new BABYLON.Vector3(0, this.GRAVITY_FORCE, 0)

    // Lights

    // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
    //let light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), this._scene)
    this._lightDown = new BABYLON.HemisphericLight(
      'light',
      new BABYLON.Vector3(0.3, 1, 0.3),
      this._scene
    )
    this._lightUp = new BABYLON.HemisphericLight(
      'light',
      new BABYLON.Vector3(0, -1, 0),
      this._scene
    )

    // Default intensity is 1.S
    this._lightDown.intensity = this.LIGHT_INTENSITY
    this._lightUp.intensity = this.LIGHT_INTENSITY / 3

    // Universal camera to enabled gamepad controller and camera for collisions
    let universalCamera = new BABYLON.UniversalCamera(
      'UniversalCamera',
      new BABYLON.Vector3(
        this.CAMERA1_POSITION.x,
        this.CAMERA1_POSITION.y,
        this.CAMERA1_POSITION.z
      ),
      this._scene
    )
    universalCamera.rotation = new BABYLON.Vector3(
      this.CAMERA1_ROTATION.x,
      this.CAMERA1_ROTATION.y,
      this.CAMERA1_ROTATION.z
    )

    let arcRotateCamera = new BABYLON.ArcRotateCamera(
      'ArcRotateCamera',
      this.CAMERA3_POSITION.x,
      this.CAMERA3_POSITION.y,
      this.CAMERA3_POSITION.z,
      new BABYLON.Vector3(0, 0, 0),
      this._scene
    )

    // Speed of camera ( 2 by default )
    universalCamera.speed = World.SPEED
    // Angular sensibility ( 2000 by default )
    universalCamera.angularSensibility = this.ANGULAR_SENSIBILTY

    // camera touch parameters
    universalCamera.inputs.attached.touch.touchAngularSensibility =
      this.TOUCH_ANGULAR_SENSIBILITY // 20000 by default
    universalCamera.inputs.attached.touch.touchMoveSensibility =
      this.TOUCH_MOVE_SENSIBILITY // 250 by default

    // Load meshes
    let result = await BABYLON.SceneLoader.ImportMeshAsync(
      null,
      '',
      this.WORLD_FILE,
      this._scene
    )

    /**
     * Golden books
     **/
    let books = this._scene.getMeshesByTags('goldenBook')
    for (let book of books) {
      // add action manager to the music play button
      book.actionManager = new BABYLON.ActionManager(this._scene)
      book.actionManager.registerAction(
        new BABYLON.ExecuteCodeAction(
          BABYLON.ActionManager.OnPickTrigger,
          () => {
            this.openGoldenBook()
          }
        )
      )
    }

    /**
     * Gifts
     **/
    const gifts = this._scene.getMeshesByTags('gift')
    let numGift = 0

    for (let gift of gifts) {
      gift.isPickable = true
      // add action manager to the gift
      gift.actionManager = new BABYLON.ActionManager(this._scene)
      gift.numGift = numGift
      gift.actionManager.registerAction(
        new BABYLON.ExecuteCodeAction(
          BABYLON.ActionManager.OnPickTrigger,
          (gift) => {
            this.openGift(gift.source.numGift)
          }
        )
      )
      numGift++
    }

    // smokes animations ( position + scale + visibility )
    let smokes = this._scene.getMeshesByTags('smoke')
    const frameRate = 24
    for (let smoke of smokes) {
      const randomTime = this.randomNumber(16, 32)

      // position y animation
      const ySlide = new BABYLON.Animation(
        'ySlide',
        'position.y',
        frameRate,
        BABYLON.Animation.ANIMATIONTYPE_FLOAT,
        BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
      )

      const keyFramesP = []

      keyFramesP.push({
        frame: 0,
        value: smoke.position.y,
      })

      keyFramesP.push({
        frame: (randomTime - 2) * frameRate,
        value: smoke.position.y + 8,
      })

      keyFramesP.push({
        frame: randomTime * frameRate,
        value: smoke.position.y,
      })

      ySlide.setKeys(keyFramesP)

      // scaling animation
      const xScaling = new BABYLON.Animation(
        'xScaling',
        'scaling.x',
        frameRate,
        BABYLON.Animation.ANIMATIONTYPE_FLOAT,
        BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
      )

      const yScaling = new BABYLON.Animation(
        'yScaling',
        'scaling.y',
        frameRate,
        BABYLON.Animation.ANIMATIONTYPE_FLOAT,
        BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
      )

      const zScaling = new BABYLON.Animation(
        'zScaling',
        'scaling.z',
        frameRate,
        BABYLON.Animation.ANIMATIONTYPE_FLOAT,
        BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
      )

      const keyFramesS = []

      keyFramesS.push({
        frame: 0,
        value: 1,
      })

      keyFramesS.push({
        frame: (randomTime - 2) * frameRate,
        value: 3,
      })

      keyFramesS.push({
        frame: randomTime * frameRate,
        value: 1,
      })

      xScaling.setKeys(keyFramesS)
      yScaling.setKeys(keyFramesS)
      zScaling.setKeys(keyFramesS)

      // visibility animation
      const allVisibility = new BABYLON.Animation(
        'xVisibility',
        'visibility',
        frameRate,
        BABYLON.Animation.ANIMATIONTYPE_FLOAT,
        BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
      )

      const keyFramesV = []

      keyFramesV.push({
        frame: 0,
        value: 0.7,
      })

      keyFramesV.push({
        frame: (randomTime - 2) * frameRate,
        value: 0,
      })

      keyFramesV.push({
        frame: randomTime * frameRate,
        value: 0,
      })

      allVisibility.setKeys(keyFramesV)

      this._scene.beginDirectAnimation(
        smoke,
        [ySlide, xScaling, yScaling, zScaling, allVisibility],
        0,
        randomTime * frameRate,
        true
      )
    }

    // correct alpha transparency of sky
    let sky = this._scene.getMeshesByTags('sky')
    sky[0].material.alpha = 0.6

    // browse all meshes

    for (let i = 0; i < result.meshes.length; i++) {
      let rootMesh = result.meshes[i]

      // information panel
      if (rootMesh.name.includes('informationPanel1Url')) {
        // this mesh can be clicked
        rootMesh.isPickable = true

        // add action manager
        rootMesh.actionManager = new BABYLON.ActionManager(this._scene)
        rootMesh.actionManager.registerAction(
          new BABYLON.ExecuteCodeAction(
            BABYLON.ActionManager.OnPickTrigger,
            () => {
              this.openHalloween()
            }
          )
        )
      }

      // information panel
      if (rootMesh.name.includes('informationPanel2Url')) {
        // this mesh can be clicked
        rootMesh.isPickable = true

        // add action manager
        rootMesh.actionManager = new BABYLON.ActionManager(this._scene)
        rootMesh.actionManager.registerAction(
          new BABYLON.ExecuteCodeAction(
            BABYLON.ActionManager.OnPickTrigger,
            () => {
              this.openAtlantis()
            }
          )
        )
      }
    }

    //Set gravity for the scene (G force like, on Y-axis)
    this._scene.gravity = new BABYLON.Vector3(0, this.GRAVITY_FORCE, 0)

    // Enable Collisions
    this._scene.collisionsEnabled = true

    //Then apply collisions and gravity to the active universal camera
    universalCamera.checkCollisions = isCollision
    universalCamera.applyGravity = isGravity

    //Set the ellipsoid around the universal camera (e.g. your player's size)
    universalCamera.ellipsoid = new BABYLON.Vector3(
      this.AVATAR_SIZE.x,
      this.AVATAR_SIZE.y,
      this.AVATAR_SIZE.z
    )

    // Virtual Sticks for mobile navigation

    let adt = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI('UI')

    this._virtualJoystick.initVirtualStick(adt)
    this._virtualJoystick.resize(this._canvas)

    // hide virtual sticks if not mobile device
    this._virtualJoystick.setVisible(this._gui.isMobile())

    // resize for mobile
    this._gui.resize(this._canvas)

    // fps
    this._scene.onBeforeRenderObservable.add(() => {
      this._gui.showFps(this._engine.getFps().toFixed())
    })

    let ray = undefined
    let pickResult = undefined
    let isGamePadActionVisible = false

    this._scene.registerBeforeRender(() => {
      // only if gamepad is used
      if (this._gamepadStatus === GamePadController.GAMEPAD_CONNECTED) {
        ray = this._scene.activeCamera.getForwardRay()

        pickResult = this._scene.pickWithRay(ray)

        // no hit and message is visible, then hide game pad message
        if (!pickResult.hit && isGamePadActionVisible) {
          document.dispatchEvent(new Event('hideGamePadAction'))
          this._currentAction = null
          isGamePadActionVisible = false
        }

        // meshe is hit but it's not a actionnable mesh and a message is currently show
        // then hide game pad message
        if (
          pickResult.hit &&
          !this.ACTION_MESHES.includes(pickResult.pickedMesh.id) &&
          isGamePadActionVisible
        ) {
          document.dispatchEvent(new Event('hideGamePadAction'))
          this._currentAction = null
          isGamePadActionVisible = false
        }

        // mesh is hit and it's a actionnable mesh
        if (
          pickResult.hit &&
          this.ACTION_MESHES.includes(pickResult.pickedMesh.id)
        ) {
          if (
            pickResult.pickedMesh.id === 'goldenBook' &&
            this._currentAction != this.ACTIONS.openGoldenBook
          ) {
            isGamePadActionVisible = true
            document.dispatchEvent(
              new CustomEvent('showGamePadAction', {
                detail: this.ACTIONS_OPEN_BOOK[this._lang],
              })
            )
            this._currentAction = this.ACTIONS.openGoldenBook
          }

          if (
            pickResult.pickedMesh.id === 'informationPanel1Url' &&
            this._currentAction != this.ACTIONS.openHalloween
          ) {
            isGamePadActionVisible = true
            document.dispatchEvent(
              new CustomEvent('showGamePadAction', {
                detail: this.ACTIONS_JUMP_HALLOWEEN[this._lang],
              })
            )
            this._currentAction = this.ACTIONS.openHalloween
          }

          if (
            pickResult.pickedMesh.id === 'informationPanel2Url' &&
            this._currentAction != this.ACTIONS.openAtlantis
          ) {
            isGamePadActionVisible = true
            document.dispatchEvent(
              new CustomEvent('showGamePadAction', {
                detail: this.ACTIONS_JUMP_ATLANTIS[this._lang],
              })
            )
            this._currentAction = this.ACTIONS.openAtlantis
          }
        }
      }

      // virtual sticks
      if (this._isMobile && this._scene.activeCamera.id == 'UniversalCamera') {
        this._virtualJoystick.transform(universalCamera)
      }

      // arc rotate camera
      if (this._numCamera == 3) {
        this._scene.activeCamera.alpha += 0.001
      }
    })

    this._scene.activeCamera = universalCamera

    // alternative navigation inputs ( WASD for qwerty keyboard and ZQSD for azerty keyboard )
    this._scene.activeCamera.keysUp.push(90)
    this._scene.activeCamera.keysDown.push(83)
    this._scene.activeCamera.keysLeft.push(81)
    this._scene.activeCamera.keysRight.push(68)

    universalCamera.attachControl(this._canvas, true)

    return this._scene
  }

  /**
   * Actions receive from gamepad
   */
  action() {
    switch (this._currentAction) {
      case this.ACTIONS.openAtlantis:
        this.openAtlantis()
        break
      case this.ACTIONS.openHalloween:
        this.openHalloween()
        break
      case this.ACTIONS.openGoldenBook:
        this.openGoldenBook()
        break
    }
  }

  /**
   * Open a book
   */
  openGift(numGift) {
    window.open(this.TAB_GIFTS[numGift])
  }

  // Function to generate random number
  randomNumber(min, max) {
    return Math.ceil(Math.random() * (max - min) + min)
  }

  openGoldenBook() {
    window.open(this.URL_WEBSITE[this._lang])
  }

  openAtlantis() {
    window.open(this.PANEL_1_URL[this._lang], '_self')
  }

  openHalloween() {
    window.open(this.PANEL_2_URL[this._lang], '_self')
  }

  // show scene explorer + inspector
  showDebug() {
    this._scene.debugLayer.show()
  }

  userMakeGesture() {
    this._isUserGesture = true
  }

  /*
   * Set the navigation mode
   * @param: navigation ( WALK_MODE or FLY MODE)
   */
  setNavigationMode(navigationMode) {
    // only fly or walk
    if (navigationMode != World.FLY_MODE && navigationMode != World.WALK_MODE) {
      return
    }

    // set navigation mode
    this._typeNavigation = navigationMode

    if (World.WALK_MODE === navigationMode) {
      this.walk()
      this._gui.showWalkMode()
    }

    if (World.FLY_MODE === navigationMode) {
      this.fly()
      this._gui.showFlyMode()
    }
  }

  toggleNavigationMode() {
    if (World.WALK_MODE === this._typeNavigation) {
      this.setNavigationMode(World.FLY_MODE)
      return
    }

    if (World.FLY_MODE === this._typeNavigation) {
      this.setNavigationMode(World.WALK_MODE)
      return
    }
  }

  fly() {
    const camera = this._scene.getCameraByName('UniversalCamera')

    this._isGravity = false
    this._isCollision = true
    camera.applyGravity = this._isGravity
    camera.checkCollisions = this._isCollision
  }

  walk() {
    const camera = this._scene.getCameraByName('UniversalCamera')

    this._isGravity = true
    this._isCollision = true
    camera.applyGravity = this._isGravity
    camera.checkCollisions = this._isCollision
  }

  /**
   * increase speed
   */
  increaseSpeed() {
    this._scene.getCameraByName('UniversalCamera').speed = World.SPEED * 2
  }

  /**
   * decrease speed
   */
  decreaseSpeed() {
    this._scene.getCameraByName('UniversalCamera').speed = World.SPEED
  }

  /*
   * Change camera
   **/
  changeCamera() {
    this._numCamera++
    if (this._numCamera > 3) this._numCamera = 1

    switch (this._numCamera) {
      case 1:
        this.goToCamera1()
        break
      case 2:
        this.goToCamera2()
        break
      case 3:
        this.goToCamera3()
        break
    }
  }

  /*
   * Helper to copy paste camera position/rotation
   */
  showCameraInfo() {
    const camera = this._scene.getCameraByName('UniversalCamera')
    console.log(
      'camera position : const CAMERAX_POSITION = new BABYLON.Vector3(' +
        camera.position.x.toFixed(3) +
        ',' +
        camera.position.y.toFixed(3) +
        ',' +
        camera.position.z.toFixed(3) +
        ')'
    )
    console.log(
      'camera rotation : const CAMERAX_ROTATION = new BABYLON.Vector3(' +
        camera.rotation.x.toFixed(3) +
        ',' +
        camera.rotation.y.toFixed(3) +
        ',' +
        camera.rotation.z.toFixed(3) +
        ')'
    )
  }

  goToCamera1() {
    const camera = this._scene.getCameraByName('UniversalCamera')

    camera.position = new BABYLON.Vector3(
      this.CAMERA1_POSITION.x,
      this.CAMERA1_POSITION.y,
      this.CAMERA1_POSITION.z
    )
    camera.rotation = new BABYLON.Vector3(
      this.CAMERA1_ROTATION.x,
      this.CAMERA1_ROTATION.y,
      this.CAMERA1_ROTATION.z
    )

    this._scene.activeCamera = camera
  }

  goToCamera2() {
    const camera = this._scene.getCameraByName('UniversalCamera')

    camera.position = new BABYLON.Vector3(
      this.CAMERA2_POSITION.x,
      this.CAMERA2_POSITION.y,
      this.CAMERA2_POSITION.z
    )
    camera.rotation = new BABYLON.Vector3(
      this.CAMERA2_ROTATION.x,
      this.CAMERA2_ROTATION.y,
      this.CAMERA2_ROTATION.z
    )

    this._scene.activeCamera = camera
  }

  goToCamera3() {
    const camera = this._scene.getCameraByName('ArcRotateCamera')

    camera.position = new BABYLON.Vector3(
      this.CAMERA3_POSITION.x,
      this.CAMERA3_POSITION.y,
      this.CAMERA3_POSITION.z
    )
    camera.rotation = new BABYLON.Vector3(
      this.CAMERA3_ROTATION.x,
      this.CAMERA3_ROTATION.y,
      this.CAMERA3_ROTATION.z
    )

    this._scene.activeCamera = camera
  }

  setGamePadStatus(status) {
    this._gamepadStatus = status
  }

  /**
   * Resume audio context if a gesture have been made by user
   * https://github.com/BabylonJS/Babylon.js/issues/4354
   * */
  checkAudioContext() {
    let ready = false
    if (BABYLON.Engine.audioEngine.audioContext.state == 'running') {
      ready = true
    }

    // resume only if a gesture have been made
    if (
      BABYLON.Engine.audioEngine.audioContext.state != 'running' &&
      this._isUserGesture
    ) {
      BABYLON.Engine.audioEngine.audioContext.resume()
      ready = true
    }

    return ready
  }

  isMobile() {
    return this._isMobile
  }

  resize() {
    let camera = this._scene.getCameraByName('UniversalCamera')

    // change angular sensibility on mobile in portrait mode on not full screen
    // otherwise sensibility is too high
    if (
      this._gui.isMobile() &&
      !this._gui.isLandscape() &&
      !this._gui.isFullScreen()
    ) {
      camera.inputs.attached.touch.touchAngularSensibility =
        this.TOUCH_ANGULAR_SENSIBILITY * 3 // 20000 by default
    } else {
      camera.inputs.attached.touch.touchAngularSensibility =
        this.TOUCH_ANGULAR_SENSIBILITY // 20000 by default
    }
    // increase speed on full screen mode
    if (this._gui.isMobile() && this._gui.isFullScreen()) {
      camera.speed = World.SPEED * 2
    } else {
      camera.speed = World.SPEED
    }
  }
}

export { World }
