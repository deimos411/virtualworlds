import { GamePadController } from './gamepad.js'

class World {
  WORLD_FILE = 'babylon/hall13.babylon'

  /**
   * Navigation
   */
  static SPEED = 0.4 // default 2
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

  // Start camera
  CAMERA1_POSITION = new BABYLON.Vector3(-30.26, 3.196, -23.948)
  CAMERA1_ROTATION = new BABYLON.Vector3(-0.022, -5.551, 0)

  // Hamlet's Inn
  CAMERA2_POSITION = new BABYLON.Vector3(10.419, 3.305, 15.994)
  CAMERA2_ROTATION = new BABYLON.Vector3(0.0991, -7.35, 0)

  // Overview
  CAMERA3_POSITION = new BABYLON.Vector3(22.39, 29.185, 5.08)
  CAMERA3_ROTATION = new BABYLON.Vector3(0.737, -7.872, 0)

  // Watch tower
  CAMERA4_POSITION = new BABYLON.Vector3(-33.835, 11.4417, -36.374)
  CAMERA4_ROTATION = new BABYLON.Vector3(0.0079, -6.5559, 0)

  // Serenade under the windows
  CAMERA5_POSITION = new BABYLON.Vector3(-32.9737, 3.1962, -8.27369)
  CAMERA5_ROTATION = new BABYLON.Vector3(-0.6335, -0.6335, 0)

  /**
   * Lights
   */
  LIGHT_UP_INTENSITY = 0.125
  LIGHT_DOWN_INTENSITY = 0.8

  /**
   *  Thunders
   */
  THUNDER_TYPE = {
    NEAR: 1,
    FAR: 2,
    NORMAL: 3,
  }

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
    en: '../islands/',
    fr: '../iles/',
  }

  PANEL_2_URL = {
    en: '../savanna/',
    fr: '../safari/',
  }

  /**
   *  Actions
   */
  ACTIONS = {
    playMusic: 'Play',
    stopMusic: 'Stop',
    drinkBeer: 'Drink beer',
    openGoldenBook: 'Open golden book',
    openSavanna: 'Open hell & paradise',
    openFloatingIslands: 'Open floating islands',
  }

  ACTIONS_OPEN_BOOK = {
    en : 'open golden book',
    fr : 'ouvrir le livre d\'or',
  }

  ACTIONS_JUMP_SAVANNA = {
    en : 'jump to savanna',
    fr : 'découvrir safari',
  }

  ACTIONS_JUMP_ISLANDS = {
    en : 'jump to floating islands',
    fr : 'découvrir iles flottantes',
  }

  ACTIONS_PLAY = {
    en : 'play',
    fr : 'jouer',
  }

  ACTIONS_STOP = {
    en : 'stop',
    fr : 'stop',
  }

  ACTIONS_DRINK = {
    en : 'drink',
    fr : 'boire',
  }

  ACTION_MESHES = [
    'musicPanelPlay',
    'musicPanelStop',
    'beer1',
    'beer2',
    'beer3',
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
    this._lightDown
    this._lightUp

    // camera
    this._followCamera = null

    // sounds
    this._beerSound = new BABYLON.Sound('beer', 'sound/beer.wav', this._scene)
    this._musicSound = null

    this._nearThunderSound = new BABYLON.Sound(
      'nearThunder',
      'sound/thunder.wav',
      this._scene,
      null,
      {
        playbackRate: 1,
        volume: 1.2,
      }
    )

    this._normalThunderSound = new BABYLON.Sound(
      'normalThunder',
      'sound/thunder.wav',
      this._scene,
      null,
      {
        playbackRate: 0.8,
        volume: 1,
      }
    )

    this._farThunderSound = new BABYLON.Sound(
      'farThunder',
      'sound/thunder.wav',
      this._scene,
      null,
      {
        playbackRate: 0.5,
        volume: 0.5,
      }
    )

    this._isThunder = false
    this._isLightning = false
    this._thunderType
    this._meshEmitter
    this._lightningDelta = 0
    this._delta = 0
  }

  async createScene() {
    let isCollision = true
    let isGravity = true

    this._scene.gravity = new BABYLON.Vector3(0, -0.5, 0)

    // Lights

    // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
    //let light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), this._scene)
    this._lightDown = new BABYLON.HemisphericLight(
      'lightDown',
      new BABYLON.Vector3(0, 1, 0),
      this._scene
    )
    this._lightUp = new BABYLON.HemisphericLight(
      'lightUp',
      new BABYLON.Vector3(0, -1, 0),
      this._scene
    )

    // Default intensity is 1.S
    this._lightUp.intensity = this.LIGHT_UP_INTENSITY
    this._lightDown.intensity = this.LIGHT_DOWN_INTENSITY

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

    // Load meshes
    let result = await BABYLON.SceneLoader.ImportMeshAsync(
      null,
      '',
      this.WORLD_FILE,
      this._scene
    )

    // sheeps
    let beers = this._scene.getMeshesByTags('beer')
    for (let beer of beers) {
      beer.isPickable = true
      beer.actionManager = new BABYLON.ActionManager(this._scene)
      beer.actionManager.registerAction(
        new BABYLON.ExecuteCodeAction(
          BABYLON.ActionManager.OnPickTrigger,
          () => {
            this.drinkBeer()
          }
        )
      )
    }

    // browse all meshes

    for (let i = 0; i < result.meshes.length; i++) {
      let rootMesh = result.meshes[i]

      // Plane emitter
      if (rootMesh.name.includes('plane')) {
        // turn rain emmitter to be invisible
        rootMesh.isVisible = false
        // animations

        let nbParticles = 15000

        if (this._gui.isMobile()) {
          nbParticles = 2000
        }
        if (this._gui.isXbox()) {
          nbParticles = 1000
        }

        var particleSystem = new BABYLON.ParticleSystem(
          'particles',
          nbParticles,
          this._scene
        )
        particleSystem.particleTexture = new BABYLON.Texture(
          'flare.png',
          this._scene
        )

        particleSystem.minSize = 0.08
        particleSystem.maxSize = 0.3

        // Where the particles come from
        var meshEmitter = new BABYLON.MeshParticleEmitter(rootMesh)
        particleSystem.particleEmitterType = meshEmitter

        particleSystem.emitter = rootMesh

        // Life time of each particle (random between...
        particleSystem.minLifeTime = 10.0
        particleSystem.maxLifeTime = 20.0

        // Emission rate
        if (rootMesh.name.includes('plane1')) {
          particleSystem.emitRate = 1000 * 2
        }
        if (rootMesh.name.includes('plane2')) {
          particleSystem.emitRate = 125 * 2
        }
        if (rootMesh.name.includes('plane3')) {
          particleSystem.emitRate = 250 * 2
        }

        // Blend mode : BLENDMODE_ONEONE, or BLENDMODE_STANDARD
        particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE

        // Set the gravity of all particles
        particleSystem.gravity = new BABYLON.Vector3(0, 0, 0)

        // Color

        particleSystem.color1 = new BABYLON.Color4(0.3, 0.3, 1, 1.0)
        //particleSystem.color1 = new BABYLON.Color4(.9, .9, .95, 1.0);
        particleSystem.color2 = new BABYLON.Color4(0.7, 0.7, 0.7, 1)

        // Speed
        particleSystem.minEmitPower = 1
        particleSystem.maxEmitPower = 4
        particleSystem.updateSpeed = 1 / 20

        // Start the particle system
        particleSystem.start()
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
              this.openSavanna()
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

        // mesh is hit and it's a actionnable mesh
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
            pickResult.pickedMesh.id.includes('beer') &&
            this._currentAction != this.ACTIONS.drinkBeer
          ) {
            isGamePadActionVisible = true
            document.dispatchEvent(
              new CustomEvent('showGamePadAction', { detail: this.ACTIONS_DRINK[this._lang] })
            )
            this._currentAction = this.ACTIONS.drinkBeer
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
        }
      }

      // virtual sticks
      if (this._isMobile && this._scene.activeCamera.id == 'UniversalCamera') {
        this._virtualJoystick.transform(universalCamera)
      }

      // play storm
      this.playStorm()
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
      case this.ACTIONS.playMusic:
        this.playMusic()
        break
      case this.ACTIONS.stopMusic:
        this.stopMusic()
        break
      case this.ACTIONS.drinkBeer:
        this.drinkBeer()
        break
      case this.ACTIONS.openGoldenBook:
        this.openGoldenBook()
        break
      case this.ACTIONS.openFloatingIslands:
        this.openFloatingIslands()
        break
      case this.ACTIONS.openSavanna:
        this.openSavanna()
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

  // Function to generate random number
  randomNumber(min, max) {
    return Math.ceil(Math.random() * (max - min) + min)
  }

  playStorm() {
    // thunder?
    let rand = 0
    let thunderType

    this._delta++
    if (this._delta > 200) {
      rand = this.randomNumber(0, 10)
      this._delta = 0
      if (rand === 5) {
        rand = this.randomNumber(0, 10)

        if (rand < 3) {
          this._thunderType = this.THUNDER_TYPE.NEAR
        } else if (rand > 8) {
          this._thunderType = this.THUNDER_TYPE.FAR
        } else {
          this._thunderType = this.THUNDER_TYPE.NORMAL
        }

        this._isLightning = true
      }
    }

    // Ligthning
    if (this._isLightning) {
      this._lightningDelta++

      if (this._thunderType === this.THUNDER_TYPE.NEAR) {
        this._lightDown.intensity = 2
        this._lightUp.intensity = 1
      }

      if (this._thunderType === this.THUNDER_TYPE.NORMAL) {
        this._lightDown.intensity = 1.5
        this._lightUp.intensity = 0.5
      }

      if (this._thunderType === this.THUNDER_TYPE.FAR) {
        this._lightDown.intensity = 1
        this._lightUp.intensity = 0.25
      }

      if (this._lightningDelta > 50) {
        this._lightningDelta = 0
        this._lightUp.intensity = this.LIGHT_UP_INTENSITY
        this._lightDown.intensity = this.LIGHT_DOWN_INTENSITY
        this._isLightning = false

        this._isThunder = true
      }
    }

    // Thunder
    if (this._isThunder) {
      let ready = this.checkAudioContext()

      if (this._thunderType === this.THUNDER_TYPE.NEAR && ready) {
        this._nearThunderSound.play()
      }
      if (this._thunderType === this.THUNDER_TYPE.NORMAL && ready) {
        this._normalThunderSound.play()
      }
      if (this._thunderType === this.THUNDER_TYPE.FAR && ready) {
        this._farThunderSound.play()
      }

      this._isThunder = false
    }
  }

  drinkBeer() {
    let ready = this.checkAudioContext()

    if (ready) {
      this._beerSound.stop()
      this._beerSound.play()
    }
  }

  openGoldenBook() {
    window.open(this.URL_WEBSITE[this._lang])
  }

  openFloatingIslands() {
    window.open(this.PANEL_1_URL[this._lang], '_self')
  }

  openSavanna() {
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
    if (this._numCamera > 5) this._numCamera = 1

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
