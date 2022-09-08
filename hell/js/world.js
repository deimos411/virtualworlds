import { GamePadController } from './gamepad.js'

class World {
  WORLD_FILE = 'babylon/enfer9.babylon'

  /**
   * Navigation
   */
  static SPEED = 0.7 // default 2
  static FLY_MODE = 1
  static WALK_MODE = 2

  // refer to camera ellipsoid area
  AVATAR_SIZE = {
    x: 1,
    y: 1.5,
    z: 1.2,
  }

  GRAVITY_FORCE = -0.55 // default -0.98
  ANGULAR_SENSIBILTY = 5000 // default 2000
  TOUCH_ANGULAR_SENSIBILITY = 4000 // default 20000
  TOUCH_MOVE_SENSIBILITY = 250 // default 250

  /**
   * Cameras
   */

  // Start camera Paradise
  CAMERA1_POSITION = new BABYLON.Vector3(30.88, 547.97, 2.5)
  CAMERA1_ROTATION = new BABYLON.Vector3(-0.05, 4.65, 0)

  // Hell
  CAMERA2_POSITION = new BABYLON.Vector3(-11.21, -20.0, -88.43)
  CAMERA2_ROTATION = new BABYLON.Vector3(-0.04, 6.18, 0)

  // Vision of Paradise
  CAMERA3_POSITION = new BABYLON.Vector3(30.88, 547.97, 2.5)
  CAMERA3_ROTATION = new BABYLON.Vector3(-0.05, 4.65, 0)

  // Vision of Hell
  CAMERA4_POSITION = new BABYLON.Vector3(-11.21, -20.0, -88.43)
  CAMERA4_ROTATION = new BABYLON.Vector3(-0.04, 6.18, 0)

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
    en: '../savanna/',
    fr: '../safari/',
  }

  PANEL_2_URL = {
    en: '../halloween/',
    fr: '../halloween/',
  }

  /**
   *  Actions
   */
  ACTIONS = {    
    askSaintPeter: 'Ask Saint Peter',
    askImp: 'Ask imp',
    tormentRoom: 'Torment room',
    openPortal: 'Open portal',
    goToHell: 'Go to hell',
    goToParadise: 'Go to paradise',
    openGoldenBook: 'Open golden book',
    openHalloween: 'Open halloween',
    openSavanna: 'Open savanna',
  }

  ACTIONS_OPEN_BOOK = {
    en : 'open golden book',
    fr : 'ouvrir le livre d\'or',
  }

  ACTIONS_JUMP_HALLOWEEN = {
    en : 'jump to halloween',
    fr : 'découvrir halloween',
  }

  ACTIONS_JUMP_SAVANNA = {
    en : 'jump to savanna',
    fr : 'découvrir safari',
  }

  ACTIONS_GOTO_HELL = {
    en : 'go to hell',
    fr : 'aller en enfer',
  }

  ACTIONS_GOTO_PARADISE = {
    en : 'go to paradise',
    fr : 'aller au paradis',
  }

  ACTIONS_OPEN_PORTAL = {
    en : 'open portal',
    fr : 'ouvrir le portail',
  }

  ACTIONS_TORMENT_ROOM = {
    en : 'listen',
    fr : 'écouter',
  }

  ACTIONS_ASK_PETER = {
    en : 'ask',
    fr : 'demander',
  }

  ACTIONS_IMP = {
    en : 'ask',
    fr : 'demander',
  }

  ACTION_MESHES = [
    'saintPeter',
    'imp1',
    'imp2',
    'imp3',
    'imp4',
    'imp5',
    'imp6',
    'tormentRoom1',
    'tormentRoom2',
    'tormentRoom3',
    'portalLeft',
    'portalRight',
    'toHellPannel',
    'toParadisePannel',
    'goldenBook',
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

    // lights
    this._light

    // camera
    this._followCamera = null

    // sounds
    this._impSound = new BABYLON.Sound('beer', 'sound/imp.wav', this._scene)
    this._scream1Sound = new BABYLON.Sound(
      'scream1',
      'sound/scream1.wav',
      this._scene
    )
    this._scream2Sound = new BABYLON.Sound(
      'scream1',
      'sound/scream2.wav',
      this._scene
    )
    this._scream3Sound = new BABYLON.Sound(
      'scream1',
      'sound/scream3.wav',
      this._scene
    )
    this._saintPeterSound = new BABYLON.Sound(
      'saintPeter',
      'sound/stpeter.wav',
      this._scene
    )
    this._portalSound = new BABYLON.Sound(
      'portal',
      'sound/portal.wav',
      this._scene
    )
    this._teleportSound = new BABYLON.Sound(
      'teleport',
      'sound/teleport.wav',
      this._scene
    )
  }

  async createScene() {
    let isCollision = true
    let isGravity = true

    this._scene.gravity = new BABYLON.Vector3(0, -0.5, 0)

    // Lights

    // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
    //let light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), this._scene)
    this._light = new BABYLON.HemisphericLight(
      'light',
      new BABYLON.Vector3(0, 1, 0),
      this._scene
    )

    // Default intensity is 1.S
    this._light.intensity = this.LIGHT_INTENSITY

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

    // Follow camera to follow zeppelin
    this._followCamera = new BABYLON.FollowCamera(
      'FollowCamera',
      new BABYLON.Vector3(
        this.CAMERA1_POSITION.x,
        this.CAMERA1_POSITION.y,
        this.CAMERA1_POSITION.z
      ),
      this._scene,
      null
    )
    this._followCamera.attachControl(this._canvas, true)

    // Speed of camera ( 2 by default )
    universalCamera.speed = World.SPEED
    // Angular sensibility ( 2000 by default )
    universalCamera.angularSensibility = this.ANGULAR_SENSIBILTY

    // camera touch parameters
    universalCamera.inputs.attached.touch.touchAngularSensibility =
      this.TOUCH_ANGULAR_SENSIBILITY // 20000 by default
    universalCamera.inputs.attached.touch.touchMoveSensibility =
      this.TOUCH_MOVE_SENSIBILITY // 250 by default

    // sky background
    // The box creation
    var skybox = BABYLON.Mesh.CreateBox('skyBox', 1500.0, this._scene)

    // The sky creation ( gradient shader from @Temechon https://www.html5gamedevs.com/topic/8160-gradient-shader )
    BABYLON.Effect.ShadersStore.gradientVertexShader =
      'precision mediump float;attribute vec3 position;attribute vec3 normal;attribute vec2 uv;uniform mat4 worldViewProjection;varying vec4 vPosition;varying vec3 vNormal;void main(){vec4 p = vec4(position,1.);vPosition = p;vNormal = normal;gl_Position = worldViewProjection * p;}'

    BABYLON.Effect.ShadersStore.gradientPixelShader =
      'precision mediump float;uniform mat4 worldView;varying vec4 vPosition;varying vec3 vNormal;uniform float offset;uniform vec3 topColor;uniform vec3 bottomColor;void main(void){float h = normalize(vPosition+offset).y;gl_FragColor = vec4(mix(bottomColor,topColor,max(pow(max(h,0.0),0.6),0.0)),1.0);}'

    var shader = new BABYLON.ShaderMaterial(
      'gradient',
      this._scene,
      'gradient',
      {}
    )
    shader.setFloat('offset', -320)
    shader.setColor3('topColor', BABYLON.Color3.FromInts(0, 119, 255))
    shader.setColor3('bottomColor', BABYLON.Color3.FromInts(180, 0, 0))

    shader.backFaceCulling = false

    // box + sky = skybox !
    skybox.material = shader

    // Load meshes
    let result = await BABYLON.SceneLoader.ImportMeshAsync(
      null,
      '',
      this.WORLD_FILE,
      this._scene
    )

    // Materials

    let material_water = new BABYLON.StandardMaterial('watermat', this._scene)
    material_water.diffuseTexture = new BABYLON.Texture(
      'water.jpg',
      this._scene
    )
    material_water.diffuseTexture.hasAlpha = true
    //material_water.emissiveColor = new BABYLON.Color3(0.5,0.5,0.5)
    material_water.alpha = 0.6

    let material_lava = new BABYLON.StandardMaterial('watermat', this._scene)
    material_lava.diffuseTexture = new BABYLON.Texture('lava.jpg', this._scene)
    material_lava.diffuseTexture.hasAlpha = true
    //material_lava.emissiveColor = new BABYLON.Color3(0.5,0.5,0.5)
    material_lava.alpha = 0.6

    // imps
    let imps = this._scene.getMeshesByTags('imp')
    for (let imp of imps) {
      imp.isPickable = true
      imp.actionManager = new BABYLON.ActionManager(this._scene)
      imp.actionManager.registerAction(
        new BABYLON.ExecuteCodeAction(
          BABYLON.ActionManager.OnPickTrigger,
          () => {
            this.playImpSound()
          }
        )
      )
    }

    // door
    let doors = this._scene.getMeshesByTags('door')
    for (let door of doors) {
      door.isPickable = true
      door.actionManager = new BABYLON.ActionManager(this._scene)
      door.actionManager.registerAction(
        new BABYLON.ExecuteCodeAction(
          BABYLON.ActionManager.OnPickTrigger,
          () => {
            this.playScream()
          }
        )
      )
    }

    // browse all meshes

    for (let i = 0; i < result.meshes.length; i++) {
      let rootMesh = result.meshes[i]

      // water
      if (rootMesh.name.includes('water')) {
        rootMesh.material = material_water
      }

      // lava
      if (rootMesh.name.includes('lava')) {
        rootMesh.material = material_lava

        this._scene.beginAnimation(
          this._scene.getMeshByName('lava'),
          0,
          250,
          true,
          0.125
        )
      }

      if (rootMesh.name.includes('saintPeter')) {
        // this mesh can be clicked
        rootMesh.isPickable = true

        rootMesh.actionManager = new BABYLON.ActionManager(this._scene)
        rootMesh.actionManager.registerAction(
          new BABYLON.ExecuteCodeAction(
            BABYLON.ActionManager.OnPickTrigger,
            () => {
              this.playSainPeterSound()
            }
          )
        )
      }

      if (rootMesh.name.includes('portalLeft')) {
        // this mesh can be clicked
        rootMesh.isPickable = true

        rootMesh.actionManager = new BABYLON.ActionManager(this._scene)
        rootMesh.actionManager.registerAction(
          new BABYLON.ExecuteCodeAction(
            BABYLON.ActionManager.OnPickTrigger,
            () => {
              this.animatePortal()
              this.playPortalSound()
            }
          )
        )
      }

      if (rootMesh.name.includes('portalRight')) {
        // this mesh can be clicked
        rootMesh.isPickable = true

        rootMesh.actionManager = new BABYLON.ActionManager(this._scene)
        rootMesh.actionManager.registerAction(
          new BABYLON.ExecuteCodeAction(
            BABYLON.ActionManager.OnPickTrigger,
            () => {
              this.animatePortal()
              this.playPortalSound()
            }
          )
        )
      }

      if (rootMesh.name.includes('toHellPannel')) {
        // this mesh can be clicked
        rootMesh.isPickable = true

        rootMesh.actionManager = new BABYLON.ActionManager(this._scene)
        rootMesh.actionManager.registerAction(
          new BABYLON.ExecuteCodeAction(
            BABYLON.ActionManager.OnPickTrigger,
            () => {
              this.playTeleportSound()
              this.goToCamera2()
            }
          )
        )
      }

      if (rootMesh.name.includes('toParadisePannel')) {
        // this mesh can be clicked
        rootMesh.isPickable = true

        rootMesh.actionManager = new BABYLON.ActionManager(this._scene)
        rootMesh.actionManager.registerAction(
          new BABYLON.ExecuteCodeAction(
            BABYLON.ActionManager.OnPickTrigger,
            () => {
              this.playTeleportSound()
              this.goToCamera1()
            }
          )
        )
      }

      // golden book
      if (rootMesh.name.includes('goldenBook')) {
        // this mesh can be clicked
        rootMesh.isPickable = true

        // add action manager
        rootMesh.actionManager = new BABYLON.ActionManager(this._scene)
        rootMesh.actionManager.registerAction(
          new BABYLON.ExecuteCodeAction(
            BABYLON.ActionManager.OnPickTrigger,
            () => {
              this.openGoldenBook()
            }
          )
        )
      }

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
              this.openSavanna()
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
              this.openHalloween()
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
            pickResult.pickedMesh.id === 'saintPeter' &&
            this._currentAction != this.ACTIONS.askSaintPeter
          ) {
            isGamePadActionVisible = true
            document.dispatchEvent(
              new CustomEvent('showGamePadAction', {
                detail: this.ACTIONS_ASK_PETER[this._lang],
              })
            )
            this._currentAction = this.ACTIONS.askSaintPeter
          }

          if (
            pickResult.pickedMesh.id.includes('imp') &&
            this._currentAction != this.ACTIONS.askImp
          ) {
            isGamePadActionVisible = true
            document.dispatchEvent(
              new CustomEvent('showGamePadAction', { detail: this.ACTIONS_IMP[this._lang] })
            )
            this._currentAction = this.ACTIONS.askImp
          }

          if (
            pickResult.pickedMesh.id.includes('tormentRoom') &&
            this._currentAction != this.ACTIONS.tormentRoom
          ) {
            isGamePadActionVisible = true
            document.dispatchEvent(
              new CustomEvent('showGamePadAction', { detail: this.ACTIONS_TORMENT_ROOM[this._lang] })
            )
            this._currentAction = this.ACTIONS.tormentRoom
          }

          if (
            pickResult.pickedMesh.id.includes('portal') &&
            this._currentAction != this.ACTIONS.openPortal
          ) {
            isGamePadActionVisible = true
            document.dispatchEvent(
              new CustomEvent('showGamePadAction', { detail: this.ACTIONS_OPEN_PORTAL[this._lang] })
            )
            this._currentAction = this.ACTIONS.openPortal
          }

          if (
            pickResult.pickedMesh.id === 'toHellPannel' &&
            this._currentAction != this.ACTIONS.goToHell
          ) {
            isGamePadActionVisible = true
            document.dispatchEvent(
              new CustomEvent('showGamePadAction', { detail: this.ACTIONS_GOTO_HELL[this._lang] })
            )
            this._currentAction = this.ACTIONS.goToHell
          }

          if (
            pickResult.pickedMesh.id === 'toParadisePannel' &&
            this._currentAction != this.ACTIONS.goToParadise
          ) {
            isGamePadActionVisible = true
            document.dispatchEvent(
              new CustomEvent('showGamePadAction', { detail: this.ACTIONS_GOTO_PARADISE[this._lang]})
            )
            this._currentAction = this.ACTIONS.goToParadise
          }

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
            this._currentAction != this.ACTIONS.openSavanna
          ) {
            isGamePadActionVisible = true
            document.dispatchEvent(
              new CustomEvent('showGamePadAction', {
                detail: this.ACTIONS_JUMP_SAVANNA[this._lang],
              })
            )
            this._currentAction = this.ACTIONS.openSavanna
          }

          if (
            pickResult.pickedMesh.id === 'informationPanel2Url' &&
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
        }
      }

      // virtual sticks
      if (this._isMobile && this._scene.activeCamera.id == 'UniversalCamera') {
        this._virtualJoystick.transform(universalCamera)
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
      case this.ACTIONS.goToHell:
        this.playTeleportSound()
        this.goToCamera2()
        break
      case this.ACTIONS.goToParadise:
        this.playTeleportSound()
        this.goToCamera1()
        break
      case this.ACTIONS.openPortal:
        this.animatePortal()
        this.playPortalSound()
        break
      case this.ACTIONS.askSaintPeter:
        this.playSainPeterSound()
        break
      case this.ACTIONS.askImp:
        this.playImpSound()
        break
      case this.ACTIONS.tormentRoom:
        this.playScream()
        break
      case this.ACTIONS.openGoldenBook:
        this.openGoldenBook()
        break
      case this.ACTIONS.openSavanna:
        this.openSavanna()
        break
      case this.ACTIONS.openHalloween:
        this.openHalloween()
        break
    }
  }

  animatePortal() {
    // animations
    this._scene.beginAnimation(
      this._scene.getMeshByName('portalLeft'),
      0,
      250,
      false,
      2
    )
    this._scene.beginAnimation(
      this._scene.getMeshByName('portalRight'),
      0,
      250,
      false,
      2
    )
  }

  playTeleportSound() {
    let ready = this.checkAudioContext()

    if (ready) {
      this._teleportSound.stop()
      this._teleportSound.play()
    }
  }

  playSainPeterSound() {
    let ready = this.checkAudioContext()

    if (ready) {
      this._saintPeterSound.stop()
      this._saintPeterSound.play()
    }
  }

  playImpSound() {
    let ready = this.checkAudioContext()

    if (ready) {
      this._impSound.stop()
      this._impSound.play()
    }
  }

  playPortalSound() {
    let ready = this.checkAudioContext()

    if (ready) {
      this._portalSound.stop()
      this._portalSound.play()
    }
  }
  playScream() {
    let ready = this.checkAudioContext()

    if (ready) {
      // play randomly one of three torment sound
      let rand = this.randomNumber(0, 3)
      switch (rand) {
        case 1:
          this._scream1Sound.stop()
          this._scream1Sound.play()
          break
        case 2:
          this._scream2Sound.stop()
          this._scream2Sound.play()
          break
        case 3:
          this._scream3Sound.stop()
          this._scream3Sound.play()
          break
      }
    }
  }

  // Function to generate random number
  randomNumber(min, max) {
    return Math.ceil(Math.random() * (max - min) + min)
  }

  openGoldenBook() {
    window.open(this.URL_WEBSITE[this._lang])
  }

  openSavanna() {
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
    camera.fov = 0.8
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
    camera.fov = 0.8

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
    camera.fov = 2.1

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
    const camera = this._scene.getCameraByName('UniversalCamera')
    camera.fov = 2.1

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
