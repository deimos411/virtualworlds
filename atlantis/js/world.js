import { GamePadController } from './gamepad.js'

class World {
  WORLD_FILE = 'babylon/atlantide6.babylon'

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

  // Start camera
  CAMERA1_POSITION = new BABYLON.Vector3(118.02, -38.46, 10.28)
  CAMERA1_ROTATION = new BABYLON.Vector3(-0.12, -1.5, 0)

  // View of Atlantide
  CAMERA2_POSITION = new BABYLON.Vector3(47.92, 2.43, -164.43)
  CAMERA2_ROTATION = new BABYLON.Vector3(0.013, -12.56, 0)

  // Alley of atalantes
  CAMERA3_POSITION = new BABYLON.Vector3(50.608, -38.46, 208.12)
  CAMERA3_ROTATION = new BABYLON.Vector3(-0.166, -2.816, 0)

  // Bottom platform
  CAMERA4_POSITION = new BABYLON.Vector3(5.087, 6.679, 22.052)
  CAMERA4_ROTATION = new BABYLON.Vector3(-0.055, -2.159, 0)

  // Top platform
  CAMERA5_POSITION = new BABYLON.Vector3(4.75, 21.17, 17.86)
  CAMERA5_ROTATION = new BABYLON.Vector3(-0.07, -10.03, 0)

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
    en: '../trees/',
    fr: '../arbres/',
  }

  PANEL_2_URL = {
    en: '../halloween/',
    fr: '../halloween/',
  }

  /**
   *  Actions
   */
  ACTIONS = {
    followWhale: 'Follow whale',
    followMantaRay: 'Follow manta ray',
    openGoldenBook: 'Open golden book',
    openHalloween: 'Open halloween',
    openCityOfTrees: 'Open city of trees',
  }

  ACTIONS_OPEN_BOOK = {
    en : 'open golden book',
    fr : 'ouvrir le livre d\'or',
  }

  ACTIONS_JUMP_HALLOWEEN = {
    en : 'jump to halloween',
    fr : 'aller dans le monde halloween',
  }

  ACTIONS_JUMP_TREES = {
    en : 'jump to city of trees',
    fr : 'aller dans le monde cité des arbres',
  }

  ACTIONS_FOLLOW_WHALE = {
    en : 'follow whale',
    fr : 'suivre la baleine',
  }

  ACTIONS_FOLLOW_MANTA = {
    en : 'follow manta ray',
    fr : 'suivre la raie manta',
  }

  ACTION_MESHES = [
    'whale',
    'mantaRay',
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
    this._whaleSound = new BABYLON.Sound(
      'whale',
      'sound/whale.wav',
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

    // Follow camera to follow mata ray or whale
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
    var skybox = BABYLON.Mesh.CreateBox('skyBox', 1000.0, this._scene)

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
    shader.setFloat('offset', 10)
    shader.setColor3('topColor', BABYLON.Color3.FromInts(0, 119, 255))
    shader.setColor3('bottomColor', BABYLON.Color3.FromInts(0, 0, 0))

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

    // turn all meshes to be non clikable and elligible to collision check
    result.meshes.forEach((mesh) => {
      mesh.isPickable = false
      //finally, say which mesh will be collisionable
      mesh.checkCollisions = true
    })

    // Materials

    const material_bubble = new BABYLON.StandardMaterial(
      'bubblemat',
      this._scene
    )
    material_bubble.diffuseTexture = new BABYLON.Texture('07.jpg', this._scene)
    material_bubble.diffuseTexture.hasAlpha = true
    material_bubble.emissiveColor = new BABYLON.Color3(0.5, 0.5, 0.5)
    material_bubble.alpha = 0.2

    const material_crystals = new BABYLON.StandardMaterial(
      'crystalmat',
      this._scene
    )
    material_crystals.diffuseTexture = new BABYLON.Texture(
      '06.jpg',
      this._scene
    )
    material_crystals.diffuseTexture.hasAlpha = true
    material_crystals.emissiveColor = new BABYLON.Color3(0.5, 0.5, 0.5)
    material_crystals.alpha = 0.7

    const material_windows = new BABYLON.StandardMaterial(
      'windowmat',
      this._scene
    )
    material_windows.diffuseTexture = new BABYLON.Texture('05.jpg', this._scene)
    material_windows.diffuseTexture.hasAlpha = true
    material_windows.emissiveColor = new BABYLON.Color3(0.5, 0.5, 0.5)
    material_windows.alpha = 0.7

    // browse all meshes

    for (let i = 0; i < result.meshes.length; i++) {
      let rootMesh = result.meshes[i]

      // bubbles
      if (rootMesh.name.includes('bubble')) {
        rootMesh.material = material_bubble

        // animations
        this._scene.beginAnimation(rootMesh, 0, 250, true, 0.25)
      }

      // crystals
      if (rootMesh.name.includes('crystals')) {
        rootMesh.material = material_crystals
      }

      // windows
      if (rootMesh.name.includes('windows')) {
        // animations
        rootMesh.material = material_windows
      }
      if (rootMesh.name.includes('fishes')) {
        // animations
        this._scene.beginAnimation(rootMesh, 0, 250, true, 0.25)
      }

      if (rootMesh.name.includes('whale')) {
        // this mesh can be clicked
        rootMesh.isPickable = true

        // animations
        this._scene.beginAnimation(rootMesh, 0, 250, true, 0.125)

        rootMesh.actionManager = new BABYLON.ActionManager(this._scene)
        rootMesh.actionManager.registerAction(
          new BABYLON.ExecuteCodeAction(
            BABYLON.ActionManager.OnPickTrigger,
            () => {
              this.followWhale()
            }
          )
        )
      }

      if (rootMesh.name.includes('mantaRay')) {
        // this mesh can be clicked
        rootMesh.isPickable = true

        // animations
        this._scene.beginAnimation(rootMesh, 0, 250, true, 0.125)

        rootMesh.actionManager = new BABYLON.ActionManager(this._scene)
        rootMesh.actionManager.registerAction(
          new BABYLON.ExecuteCodeAction(
            BABYLON.ActionManager.OnPickTrigger,
            () => {
              this.followMantaRay()
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
              this.openCityOfTrees()
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
            pickResult.pickedMesh.id === 'whale' &&
            this._currentAction != this.ACTIONS.followWhale
          ) {
            isGamePadActionVisible = true
            document.dispatchEvent(
              new CustomEvent('showGamePadAction', { detail:  this.ACTIONS_FOLLOW_WHALE[this._lang] })
            )
            this._currentAction = this.ACTIONS.followWhale
          }

          if (
            pickResult.pickedMesh.id === 'mantaRay' &&
            this._currentAction != this.ACTIONS.followMantaRay
          ) {
            isGamePadActionVisible = true
            document.dispatchEvent(
              new CustomEvent('showGamePadAction', {
                detail:  this.ACTIONS_FOLLOW_MANTA[this._lang],
              })
            )
            this._currentAction = this.ACTIONS.followMantaRay
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
            this._currentAction != this.ACTIONS.openCityOfTrees
          ) {
            isGamePadActionVisible = true
            document.dispatchEvent(
              new CustomEvent('showGamePadAction', {
                detail:  this.ACTIONS_JUMP_TREES[this._lang],
              })
            )
            this._currentAction = this.ACTIONS.openCityOfTrees
          }

          if (
            pickResult.pickedMesh.id === 'informationPanel2Url' &&
            this._currentAction != this.ACTIONS.openHalloween
          ) {
            isGamePadActionVisible = true
            document.dispatchEvent(
              new CustomEvent('showGamePadAction', {
                detail:  this.ACTIONS_JUMP_HALLOWEEN[this._lang],
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
      case this.ACTIONS.followWhale:
        this.followWhale()
        break
      case this.ACTIONS.followMantaRay:
        this.followMantaRay()
        break
      case this.ACTIONS.openCityOfTrees:
        this.openCityOfTrees()
        break
      case this.ACTIONS.openHalloween:
        this.openHalloween()
        break
      case this.ACTIONS.openGoldenBook:
        this.openGoldenBook()
        break
    }
  }

  // Function to generate random number
  randomNumber(min, max) {
    return Math.ceil(Math.random() * (max - min) + min)
  }

  followWhale() {
    let ready = this.checkAudioContext()

    if (ready) {
      this._whaleSound.stop()
      this._whaleSound.play()
    }

    this._followCamera.lockedTarget = this._scene.getMeshByName('whale')
    this._scene.activeCamera = this._followCamera
  }

  followMantaRay() {
    this._followCamera.lockedTarget = this._scene.getMeshByName('mantaRay')
    this._scene.activeCamera = this._followCamera
  }

  openGoldenBook() {
    window.open(this.URL_WEBSITE[this._lang])
  }

  openCityOfTrees() {
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
    if (this._numCamera > 7) this._numCamera = 1

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
      case 5:
        this.goToCamera5()
        break
      case 6:
        this.goToCamera6()
        break
      case 7:
        this.goToCamera7()
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
    const camera = this._scene.getCameraByName('UniversalCamera')

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

  goToCamera5() {
    const camera = this._scene.getCameraByName('UniversalCamera')

    camera.position = new BABYLON.Vector3(
      this.CAMERA5_POSITION.x,
      this.CAMERA5_POSITION.y,
      this.CAMERA5_POSITION.z
    )
    camera.rotation = new BABYLON.Vector3(
      this.CAMERA5_ROTATION.x,
      this.CAMERA5_ROTATION.y,
      this.CAMERA5_ROTATION.z
    )

    this._scene.activeCamera = camera
  }

  goToCamera6() {
    const camera = this._scene.getCameraByName('FollowCamera')

    camera.lockedTarget = this._scene.getMeshByName('whale')

    this._scene.activeCamera = camera
  }

  goToCamera7() {
    const camera = this._scene.getCameraByName('FollowCamera')

    camera.lockedTarget = this._scene.getMeshByName('mantaRay')

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
