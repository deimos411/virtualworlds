import { GamePadController } from './gamepad.js'

class World {
  WORLD_FILE = 'babylon/iles24.babylon'

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
  CAMERA1_POSITION = new BABYLON.Vector3(-26.17, 14.69, -53.13)
  CAMERA1_ROTATION = new BABYLON.Vector3(-0.02, 0.58, 0)

  // Harbor camera
  CAMERA2_POSITION = new BABYLON.Vector3(-15.29, 11.19, -103.58)
  CAMERA2_ROTATION = new BABYLON.Vector3(-0.11, 0.38, 0)

  // Top island camera
  CAMERA3_POSITION = new BABYLON.Vector3(26.19, 33.4, -35.9)
  CAMERA3_ROTATION = new BABYLON.Vector3(-0.06, -6.07, 0)

  // Island of sheeps camera
  CAMERA4_POSITION = new BABYLON.Vector3(73.43, 9.16, 51.44)
  CAMERA4_ROTATION = new BABYLON.Vector3(0.04, -2.55, 0)

  /**
   * Lights
   */
  LIGHT_INTENSITY = 2

  /**
   * Fog
   */
  // FOG_INTENSITY = 0.002
  // FOG_COLOR = BABYLON.Color3.FromInts(13, 131, 165)

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
    en: '../greathall/',
    fr: '../hall/',
  }

  /**
   *  Actions
   */
  ACTIONS = {
    playMusic: 'Play',
    stopMusic: 'Stop',
    followZeppelin2: 'Follow Zeppelin2',
    followZeppelin3: 'Follow Zeppelin3',
    petSheep: 'Pet sheep',
    openGoldenBook: 'Open golden book',
    openCityOfTrees: 'Open city of trees',
    openGreatHall: 'Open great hall',
  }

  ACTIONS_OPEN_BOOK = {
    en : 'open golden book',
    fr : 'ouvrir le livre d\'or',
  }

  ACTIONS_JUMP_TREES = {
    en : 'jump to city of trees',
    fr : 'découvrir cité des arbres',
  }

  ACTIONS_JUMP_HALL = {
    en : 'jump to great hall',
    fr : 'découvrir grand hall',
  }

  ACTIONS_PLAY = {
    en : 'play',
    fr : 'jouer',
  }

  ACTIONS_STOP = {
    en : 'stop',
    fr : 'stop',
  }

  ACTIONS_PET = {
    en : 'pet',
    fr : 'caresser',
  }

  ACTIONS_ZEPPELIN = {
    en : 'get on  zeppelin',
    fr : 'monter sur zeppelin',
  }



  ACTION_MESHES = [
    'musicPanelPlay',
    'musicPanelStop',
    'zeppelin2',
    'zeppelin3',
    'sheep',
    'sheep2',
    'sheep3',
    'sheep4',
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

    // camera
    this._followCamera = null

    // sounds
    this._sheepSound = new BABYLON.Sound(
      'sheep',
      'sound/sheep.wav',
      this._scene
    )
    this._musicSound = null
  }

  async createScene() {
    let isCollision = true
    let isGravity = true
    let isRespawn = false

    this._scene.gravity = new BABYLON.Vector3(0, -0.5, 0)

    // Lights

    // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
    let light = new BABYLON.HemisphericLight(
      'light',
      new BABYLON.Vector3(0, 1, 0),
      this._scene
    )

    // Default intensity is 1.S
    light.intensity = this.LIGHT_INTENSITY

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

    // Sky material
    let skyboxMaterial = new BABYLON.SkyMaterial('skyMaterial', this._scene)
    skyboxMaterial.backFaceCulling = false
    //skyboxMaterial._cachedDefines.FOG = true

    // Sky mesh (box)
    let skybox = BABYLON.Mesh.CreateBox('skyBox', 1000.0, this._scene)
    skybox.material = skyboxMaterial

    // azimut 0.2
    // luminance 1
    // inclinaison 0.2
    // mieCoefficient : 0.005
    // mieDirectionalG : 0.8
    // rayleigh : 1.8

    /*
     * Keys:
     * - 1: Day
     * - 2: Evening
     * - 3: Increase Luminance
     * - 4: Decrease Luminance
     * - 5: Increase Turbidity
     * - 6: Decrease Turbidity
     * - 7: Move horizon to -50
     * - 8: Restore horizon to 0
     * - 9 : Increase inclinaison
     * - 0 : Decrease inclinaison
     */
    const setSkyConfig = (property, from, to) => {
      const keys = [
        { frame: 0, value: from },
        { frame: 100, value: to },
      ]

      let animation = new BABYLON.Animation(
        'animation',
        property,
        100,
        BABYLON.Animation.ANIMATIONTYPE_FLOAT,
        BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
      )
      animation.setKeys(keys)

      this._scene.stopAnimation(skybox)
      this._scene.beginDirectAnimation(skybox, [animation], 0, 100, false, 1)
    }

    const luminance = 1
    const turbidity = 40
    const inclinaison = 0

    // Set to Day
    setSkyConfig('material.inclination', skyboxMaterial.inclination, 0)

    // Load meshes
    let result = await BABYLON.SceneLoader.ImportMeshAsync(
      null,
      '',
      this.WORLD_FILE,
      this._scene
    )

    // sheeps
    let sheeps = this._scene.getMeshesByTags('sheep')
    for (let sheep of sheeps) {
      sheep.isPickable = true
      sheep.actionManager = new BABYLON.ActionManager(this._scene)
      sheep.actionManager.registerAction(
        new BABYLON.ExecuteCodeAction(
          BABYLON.ActionManager.OnPickTrigger,
          () => {
            this.petSheep()
          }
        )
      )
    }

    // helpers ( help to avoid collision stuck on bridge )
    let helpers = this._scene.getMeshesByTags('bridgeHelper')
    for (let helper of helpers) {
      helper.isVisible = false
    }

    // browse all meshes

    for (let i = 0; i < result.meshes.length; i++) {
      let rootMesh = result.meshes[i]

      // zeppelins

      if (rootMesh.name.includes('zeppelin1')) {
        // animations
        this._scene.beginAnimation(rootMesh, 0, 250, true, 0.75)
      }

      if (rootMesh.name.includes('zeppelin2')) {
        rootMesh.isPickable = true

        // animations
        this._scene.beginAnimation(rootMesh, 0, 250, true, 0.125)

        rootMesh.actionManager = new BABYLON.ActionManager(this._scene)
        rootMesh.actionManager.registerAction(
          new BABYLON.ExecuteCodeAction(
            BABYLON.ActionManager.OnPickTrigger,
            () => {
              this.followZeppelin2()
            }
          )
        )
      }

      if (rootMesh.name.includes('zeppelin3')) {
        rootMesh.isPickable = true

        // animations
        this._scene.beginAnimation(rootMesh, 0, 250, true, 0.125)

        rootMesh.actionManager = new BABYLON.ActionManager(this._scene)
        rootMesh.actionManager.registerAction(
          new BABYLON.ExecuteCodeAction(
            BABYLON.ActionManager.OnPickTrigger,
            () => {
              this._followCamera.lockedTarget =
                this._scene.getMeshByName('zeppelin3')
              //followCamera.radius = 10
              this._scene.activeCamera = this._followCamera
            }
          )
        )
      }

      if (rootMesh.name.includes('zeppelin5')) {
        // animations
        this._scene.beginAnimation(rootMesh, 0, 250, true, 2.0)
      }

      if (rootMesh.name.includes('zeppelin6')) {
        // animations
        this._scene.beginAnimation(rootMesh, 0, 250, true, 2.0)
      }

      // music panel play
      if (rootMesh.name.includes('musicPanelPlay')) {
        // this mesh can be clicked
        rootMesh.isPickable = true

        // add action manager to the music play button
        rootMesh.actionManager = new BABYLON.ActionManager(this._scene)
        rootMesh.actionManager.registerAction(
          new BABYLON.ExecuteCodeAction(
            BABYLON.ActionManager.OnPickTrigger,
            () => {
              this.playMusic()
            }
          )
        )
      }

      // music panel stop
      if (rootMesh.name.includes('musicPanelStop')) {
        // this mesh can be clicked
        rootMesh.isPickable = true

        // add action manager to the music play button
        rootMesh.actionManager = new BABYLON.ActionManager(this._scene)
        rootMesh.actionManager.registerAction(
          new BABYLON.ExecuteCodeAction(
            BABYLON.ActionManager.OnPickTrigger,
            () => {
              this.stopMusic()
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
              this.openGreatHall()
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

        if (
          pickResult.hit &&
          this.ACTION_MESHES.includes(pickResult.pickedMesh.id)
        ) {
          if (
            pickResult.pickedMesh.id === 'musicPanelPlay' &&
            this._currentAction != this.ACTIONS.playMusic
          ) {
            isGamePadActionVisible = true
            document.dispatchEvent(
              new CustomEvent('showGamePadAction', { detail: this.ACTIONS_PLAY[this._lang] })
            )
            this._currentAction = this.ACTIONS.playMusic
          }

          if (
            pickResult.pickedMesh.id === 'musicPanelStop' &&
            this._currentAction != this.ACTIONS.stopMusic
          ) {
            isGamePadActionVisible = true
            document.dispatchEvent(
              new CustomEvent('showGamePadAction', { detail: this.ACTIONS_STOP[this._lang] })
            )
            this._currentAction = this.ACTIONS.stopMusic
          }

          if (
            pickResult.pickedMesh.id === 'zeppelin2' &&
            this._currentAction != this.ACTIONS.followZeppelin2
          ) {
            isGamePadActionVisible = true
            document.dispatchEvent(
              new CustomEvent('showGamePadAction', {
                detail: this.ACTIONS_ZEPPELIN[this._lang],
              })
            )
            this._currentAction = this.ACTIONS.followZeppelin2
          }

          if (
            pickResult.pickedMesh.id === 'zeppelin3' &&
            this._currentAction != this.ACTIONS.followZeppelin3
          ) {
            isGamePadActionVisible = true
            document.dispatchEvent(
              new CustomEvent('showGamePadAction', {
                detail: this.ACTIONS_ZEPPELIN[this._lang],
              })
            )
            this._currentAction = this.ACTIONS.followZeppelin3
          }

          if (
            pickResult.pickedMesh.id.includes('sheep') &&
            this._currentAction != this.ACTIONS.petSheep
          ) {
            isGamePadActionVisible = true
            document.dispatchEvent(
              new CustomEvent('showGamePadAction', { detail: this.ACTIONS_PET[this._lang] })
            )
            this._currentAction = this.ACTIONS.petSheep
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
                detail: this.ACTIONS_JUMP_TREES[this._lang],
              })
            )
            this._currentAction = this.ACTIONS.openCityOfTrees
          }
          if (
            pickResult.pickedMesh.id === 'informationPanel2Url' &&
            this._currentAction != this.ACTIONS.openGreatHall
          ) {
            isGamePadActionVisible = true
            document.dispatchEvent(
              new CustomEvent('showGamePadAction', {
                detail: this.ACTIONS_JUMP_HALL[this._lang],
              })
            )
            this._currentAction = this.ACTIONS.openGreatHall
          }
        }
      }

      // virtual sticks
      if (this._isMobile && this._scene.activeCamera.id == 'UniversalCamera') {
        this._virtualJoystick.transform(universalCamera)
      }

      // respawn needed
      if (!isRespawn && universalCamera.position.y < -15) {
        isRespawn = true
      }

      if (isRespawn) {
        universalCamera.applyGravity = false

        // smoothly move to original position of the camera
        universalCamera.position = BABYLON.Vector3.Lerp(
          universalCamera.position,
          new BABYLON.Vector3(
            this.CAMERA1_POSITION.x,
            this.CAMERA1_POSITION.y,
            this.CAMERA1_POSITION.z
          ),
          0.05
        )

        if (
          Math.abs(
            universalCamera.position.x.toFixed(2) -
              this.CAMERA1_POSITION.x.toFixed(2)
          ) < 0.2 &&
          Math.abs(
            universalCamera.position.y.toFixed(2) -
              this.CAMERA1_POSITION.y.toFixed(2)
          ) < 0.2 &&
          Math.abs(
            universalCamera.position.z.toFixed(2) -
              this.CAMERA1_POSITION.z.toFixed(2)
          ) < 0.2
        ) {
          universalCamera.applyGravity = true
          isRespawn = false
        }
      }
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
      case this.ACTIONS.playMusic:
        this.playMusic()
        break
      case this.ACTIONS.stopMusic:
        this.stopMusic()
        break
      case this.ACTIONS.followZeppelin2:
        this.followZeppelin2()
        break
      case this.ACTIONS.followZeppelin2:
        this.followZeppelin2()
        break
      case this.ACTIONS.followZeppelin3:
        this.followZeppelin3()
        break
      case this.ACTIONS.petSheep:
        this.petSheep()
        break
      case this.ACTIONS.openGoldenBook:
        this.openGoldenBook()
        break
      case this.ACTIONS.openGreatHall:
        this.openGreatHall()
        break
      case this.ACTIONS.openCityOfTrees:
        this.openCityOfTrees()
    }
  }

  playMusic() {
    let ready = this.checkAudioContext()

    if (ready) {
      // Music not loaded yet
      if (this._musicSound == null) {
        this._musicSound = new BABYLON.Sound(
          'music',
          'music/01.mp3',
          this._scene,
          () => {
            // Sound has been downloaded & decoded
            this._musicSound.loop = true
            this._musicSound.play()
          }
        )
      } else {
        // stop and play
        this._musicSound.stop()
        this._musicSound.play()
      }
    }
  }

  stopMusic() {
    if (this._musicSound != null) {
      this._musicSound.stop()
    }
  }

  followZeppelin3() {
    this._followCamera.lockedTarget = this._scene.getMeshByName('zeppelin3')
    this._scene.activeCamera = this._followCamera
  }

  followZeppelin2() {
    this._followCamera.lockedTarget = this._scene.getMeshByName('zeppelin2')
    this._scene.activeCamera = this._followCamera
  }

  petSheep() {
    let ready = this.checkAudioContext()

    if (ready) {
      this._sheepSound.stop()
      this._sheepSound.play()
    }
  }

  openGoldenBook() {
    window.open(this.URL_WEBSITE[this._lang])
  }

  openCityOfTrees() {
    window.open(this.PANEL_1_URL[this._lang], '_self')
  }

  openGreatHall() {
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
    if (this._numCamera > 6) this._numCamera = 1

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
    const camera = this._scene.getCameraByName('FollowCamera')

    camera.lockedTarget = this._scene.getMeshByName('zeppelin2')

    this._scene.activeCamera = camera
  }

  goToCamera6() {
    const camera = this._scene.getCameraByName('FollowCamera')

    camera.lockedTarget = this._scene.getMeshByName('zeppelin3')

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
