import { GamePadController } from './gamepad.js'

class World {
  WORLD_FILE = 'babylon/arbres16.babylon'

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

  /**
   * Cameras
   */

  // Start position
  CAMERA1_POSITION = new BABYLON.Vector3(43.229, -18.64, 46.8)
  CAMERA1_ROTATION = new BABYLON.Vector3(-0.077, -8.29, 0)

  // First level
  CAMERA2_POSITION = new BABYLON.Vector3(-17.718, -38.25, 2.723)
  CAMERA2_ROTATION = new BABYLON.Vector3(0.0125, -16.518, 0)

  // From the sky
  CAMERA3_POSITION = new BABYLON.Vector3(-815.09, 123.665, 308.259)
  CAMERA3_ROTATION = new BABYLON.Vector3(0.095, -10.659, 0.0)

  // Rotate camera
  CAMERA4_POSITION = new BABYLON.Vector3(19.045, -6.629, 192.731)
  CAMERA4_ROTATION = new BABYLON.Vector3(-0.048, -9.287, 0.0)

  /**
   * Lights
   */
  LIGHT_UP_INTENSITY = 0.125
  LIGHT_DOWN_INTENSITY = 0.8

  /**
   * Fog
   */
  FOG_INTENSITY = 0.002
  FOG_COLOR = BABYLON.Color3.FromInts(13, 131, 165)

  /**
   * Forest
   */
  FOREST_WIDTH = 750 // meters wide
  NB_TREES = 45 * 45 // number of trees ( 2025 )
  NB_ROCKS = 22 * 22 // number of rocks ( 484 )
  NB_FALLING = 16 * 16 // number of falling trees ( 256 )
  NB_STUMPS = 32 * 32 // number of stumps ( 1024 )
  CLEARING_RAY = 25 // prevent big trees to grow in middle of city

  /**
   * Multi langages
   */
  URL_WEBSITE = {
    en: 'https://virtualworlds.fun/',
    fr: 'https://mondesvirtuels.com/',
  }

  PANEL_1_URL = {
    en: '../islands/',
    fr: '../iles/',
  }

  PANEL_2_URL = {
    en: '../atlantis/',
    fr: '../atlantide/',
  }

  /**
   *  Actions
   */
  ACTIONS = {
    openGoldenBook: 'Open golden book',
    openFloatingIslands: 'Open floating islands',
    openAtlantis: 'Open atlantis',
  }

  ACTIONS_OPEN_BOOK = {
    en : 'open golden book',
    fr : 'ouvrir le livre d\'or',
  }

  ACTIONS_JUMP_ATLANTIS = {
    en : 'jump to atlantis',
    fr : 'découvrir atlantide',
  }

  ACTIONS_JUMP_ISLANDS = {
    en : 'jump to floating islands',
    fr : 'découvrir iles flottantes',
  }

  ACTION_MESHES = [
    'goldenBook2',
    'informationPanel1Url',
    'informationPanel2Url',
  ]

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
  }

  async createScene() {
    let isCollision = true
    let isGravity = true

    //var scene = new BABYLON.Scene(this._engine)

    this._scene.ambientColor = BABYLON.Color3.FromInts(10, 30, 10)

    // cold blue morning
    this._scene.clearColor = BABYLON.Color3.FromInts(13, 131, 165)

    this._scene.gravity = new BABYLON.Vector3(0, -0.5, 0)

    // Fog
    this._scene.fogMode = BABYLON.Scene.FOGMODE_EXP
    this._scene.fogDensity = this.FOG_INTENSITY
    this._scene.fogColor = this.FOG_COLOR

    // Sounds
    let woodPeckerSound = new BABYLON.Sound(
      'woodpecker',
      'sound/woodpecker.mp3',
      this._scene,
      null,
      {
        volume: 0.5,
      }
    )

    // Lights

    // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
    let light_down = new BABYLON.HemisphericLight(
      'lightDown',
      new BABYLON.Vector3(0, 1, 0),
      this._scene
    )
    let light_up = new BABYLON.HemisphericLight(
      'lightUp',
      new BABYLON.Vector3(0, -1, 0),
      this._scene
    )
    let light = new BABYLON.PointLight(
      'pointLight',
      new BABYLON.Vector3(90, -10, 1),
      this._scene
    )

    light.intensity = 5000
    light.diffuse = new BABYLON.Color3(1, 1, 0.5)

    // Firefly
    let firefly = BABYLON.MeshBuilder.CreateSphere('sphere', { diameter: 0.5 })

    firefly.position = new BABYLON.Vector3(90, -10, 1)

    // Default intensity is 1. Let's dim the light a small amount
    light_up.intensity = this.LIGHT_UP_INTENSITY
    light_down.intensity = this.LIGHT_DOWN_INTENSITY

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
      this.CAMERA4_POSITION.x,
      this.CAMERA4_POSITION.y,
      this.CAMERA4_POSITION.z,
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

    /**
     * Trees
     */
    BABYLON.SceneLoader.ImportMesh(
      'tree',
      '',
      'babylon/tree.babylon',
      this._scene,
      (newMeshes) => {
        let tree = newMeshes[0]

        let treeArray = []

        for (let x = 0; x < this.NB_TREES; x++) {
          const scale = new BABYLON.Vector3(1, 1, 1)
          const rot = new BABYLON.Quaternion.RotationYawPitchRoll(
            randomNumber(0, 314) / 10,
            0,
            0
          )
          const trans = new BABYLON.Vector3(
            -this.FOREST_WIDTH / 4 + randomNumber(1, this.FOREST_WIDTH / 2),
            -1.1,
            -this.FOREST_WIDTH / 4 + randomNumber(1, this.FOREST_WIDTH / 2)
          )

          let matrix = BABYLON.Matrix.Compose(scale, rot, trans)

          // no big trees inside the forest clearing
          let distance = BABYLON.Vector3.Distance(
            trans,
            new BABYLON.Vector3(0, -1.1, 0)
          )

          if (distance > this.CLEARING_RAY) {
            treeArray.push(matrix)
          }
        }

        tree.thinInstanceAdd(treeArray)
      }
    )

    /**
     * Falling trees
     */
    BABYLON.SceneLoader.ImportMesh(
      'dead',
      '',
      'babylon/dead.babylon',
      this._scene,
      (newMeshes) => {
        let falling = newMeshes[0]

        let fallingArray = []

        for (let x = 0; x < this.NB_FALLING; x++) {
          const scale = new BABYLON.Vector3(1, 1, 1)

          const rot = new BABYLON.Quaternion.RotationYawPitchRoll(
            (Math.PI / 3) * randomNumber(1, 10),
            0,
            0
          )
          const trans = new BABYLON.Vector3(
            -this.FOREST_WIDTH + randomNumber(1, this.FOREST_WIDTH * 2),
            -100,
            -this.FOREST_WIDTH + randomNumber(1, this.FOREST_WIDTH * 2)
          )

          let matrix = BABYLON.Matrix.Compose(scale, rot, trans)

          fallingArray.push(matrix)
        }

        falling.thinInstanceAdd(fallingArray)
      }
    )

    /**
     * Rocks
     */
    BABYLON.SceneLoader.ImportMesh(
      'rock',
      '',
      'babylon/rock.babylon',
      this._scene,
      (newMeshes) => {
        let rock = newMeshes[0]

        let rockArray = []
        let size = 1

        for (let x = 0; x < this.NB_ROCKS; x++) {
          const trans = new BABYLON.Vector3(
            -this.FOREST_WIDTH + randomNumber(1, this.FOREST_WIDTH * 2),
            -65,
            -this.FOREST_WIDTH + randomNumber(1, this.FOREST_WIDTH * 2)
          )
          let distance = BABYLON.Vector3.Distance(
            trans,
            new BABYLON.Vector3(0, -1.1, 0)
          )

          // no big rock near city
          if (distance < this.CLEARING_RAY * 6) {
            size = randomNumber(1, 2) / 5
          } else {
            size = randomNumber(1, 10) / 5
          }

          const scale = new BABYLON.Vector3(size, size, size)
          const rot = new BABYLON.Quaternion.RotationYawPitchRoll(
            (Math.PI / 3) * randomNumber(1, 10),
            0,
            0
          )

          let matrix = BABYLON.Matrix.Compose(scale, rot, trans)

          rockArray.push(matrix)
        }

        rock.thinInstanceAdd(rockArray)
      }
    )

    /**
     * Stumps
     */
    BABYLON.SceneLoader.ImportMesh(
      'stump',
      '',
      'babylon/stump.babylon',
      this._scene,
      (newMeshes) => {
        let stump = newMeshes[0]

        let stumpArray = []

        for (let x = 0; x < this.NB_STUMPS; x++) {
          const trans = new BABYLON.Vector3(
            -this.FOREST_WIDTH / 4 + randomNumber(1, this.FOREST_WIDTH / 2),
            -1.1,
            -this.FOREST_WIDTH / 4 + randomNumber(1, this.FOREST_WIDTH / 2)
          )
          const scale = new BABYLON.Vector3(1, 1, 1)
          const rot = new BABYLON.Quaternion.RotationYawPitchRoll(
            (Math.PI / 3) * randomNumber(1, 10),
            0,
            0
          )

          let matrix = BABYLON.Matrix.Compose(scale, rot, trans)

          stumpArray.push(matrix)
        }

        stump.thinInstanceAdd(stumpArray)
      }
    )

    /**
     * Moon
     */
    BABYLON.SceneLoader.ImportMesh(
      'moon',
      '',
      'babylon/moon.babylon',
      this._scene,
      (newMeshes) => {
        let moon = newMeshes[0]
        let moonArray = []

        let material_moon = new BABYLON.StandardMaterial('moonmat', this._scene)
        material_moon.emissiveColor = new BABYLON.Color3(1, 1, 1)
        material_moon.specularColor = new BABYLON.Color3(0, 0, 0)
        material_moon.diffuseColor = new BABYLON.Color3(0, 0, 0)
        material_moon.alpha = 1
        moon.material = material_moon

        const scale = new BABYLON.Vector3(5, 5, 5)
        const rot = new BABYLON.Quaternion.RotationYawPitchRoll(
          randomNumber(0, 314) / 10,
          0,
          0
        )
        const trans = new BABYLON.Vector3(-12, 10, 0)

        let matrix = BABYLON.Matrix.Compose(scale, rot, trans)

        moonArray.push(matrix)
        moon.thinInstanceAdd(moonArray)
      }
    )

    // Load meshes
    let result = await BABYLON.SceneLoader.ImportMeshAsync(
      null,
      '',
      this.WORLD_FILE,
      this._scene
    )

    // helpers ( help to avoid collision stuck on bridge )
    let helpers = this._scene.getMeshesByTags('helper')
    for (let helper of helpers) {
      helper.isVisible = false
    }

    // golden book
    let goldenBooks = this._scene.getMeshesByTags('goldenBook')
    for (let goldenBook of goldenBooks) {
      // this mesh can be clicked
      goldenBook.isPickable = true

      // add action manager to the music play button
      goldenBook.actionManager = new BABYLON.ActionManager(this._scene)
      goldenBook.actionManager.registerAction(
        new BABYLON.ExecuteCodeAction(
          BABYLON.ActionManager.OnPickTrigger,
          () => {
            this.openGoldenBook()
          }
        )
      )
    }

    // browse all meshes

    for (let i = 0; i < result.meshes.length; i++) {
      let rootMesh = result.meshes[i]
      rootMesh.isPickable = false

      // repositionning
      //rootMesh.scaling.scaleInPlace(1)

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
              this.openFloatingIslands()
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

    let delta = 0
    let alpha = 0
    let intensity = 10000
    let diameter = 0.3
    let fireflyx = 90
    let fireflyy = -10
    let fireflyz = 1
    const speedFirefly = 2
    let acceleration = 1

    let material_firefly = new BABYLON.StandardMaterial(
      'crystalmat',
      this._scene
    )
    material_firefly.emissiveColor = new BABYLON.Color3(1, 1, 0.5)
    material_firefly.alpha = 1
    firefly.material = material_firefly

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
            pickResult.pickedMesh.id === 'goldenBook2' &&
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
            this._currentAction != this.ACTIONS.openFloatingIslands
          ) {
            isGamePadActionVisible = true
            document.dispatchEvent(
              new CustomEvent('showGamePadAction', {
                detail: this.ACTIONS_JUMP_ISLANDS[this._lang],
              })
            )
            this._currentAction = this.ACTIONS.openFloatingIslands
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
      if (this._numCamera == 4) {
        this._scene.activeCamera.alpha += 0.001
      }

      delta++
      alpha++

      // woodpecker
      if (alpha > 200) {
        let r = randomNumber(1, 20)

        if (r === 5) {
          let ready = this.checkAudioContext()

          if (ready) {
            woodPeckerSound.stop()
            woodPeckerSound.play()
          }
        }
        alpha = 0
      }

      intensity = Math.abs(Math.sin(delta / 4) * 10000)
      diameter = Math.abs(Math.sin(delta / 4) * 10 + 0.3)

      if (randomNumber(1, 100) > 99) {
        acceleration = Math.abs(Math.sin(delta))

        if (acceleration < 0.5) {
          acceleration = 0.5
        }
      }

      firefly.diameter = diameter

      fireflyx = Math.sin(delta / (100 * speedFirefly)) * 100 + 90
      fireflyy = Math.sin(delta / (10 * speedFirefly)) - 10
      fireflyz = Math.cos(delta / (100 * speedFirefly)) * 100 - 1

      firefly.position.x = fireflyx
      firefly.position.y = fireflyy
      firefly.position.z = fireflyz

      light.position.x = fireflyx
      light.position.y = fireflyy
      light.position.z = fireflyz
    })

    // Function to generate random number
    function randomNumber(min, max) {
      return Math.ceil(Math.random() * (max - min) + min)
    }

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
      case this.ACTIONS.openGoldenBook:
        this.openGoldenBook()
        break
      case this.ACTIONS.openFloatingIslands:
        this.openFloatingIslands()
        break
      case this.ACTIONS.openAtlantis:
        this.openAtlantis()
    }
  }

  openGoldenBook() {
    window.open(this.URL_WEBSITE[this._lang])
  }

  openFloatingIslands() {
    window.open(this.PANEL_1_URL[this._lang], '_self')
  }

  openAtlantis() {
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
    if (this._numCamera > 4) this._numCamera = 1

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
      case 4:
        this.goToCamera4()
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
    const camera = this._scene.getCameraByName('UniversalCamera')

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

  goToCamera4() {
    const camera = this._scene.getCameraByName('ArcRotateCamera')

    camera.position = new BABYLON.Vector3(
      this.CAMERA4_POSITION.x,
      this.CAMERA4_POSITION.y,
      this.CAMERA4_POSITION.z
    )
    camera.rotation = new BABYLON.Vector3(
      this.CAMERA4_ROTATION.x,
      this.CAMERA4_ROTATION.y,
      this.CAMERA4_ROTATION.z
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
