import { GamePadController } from './gamepad.js'

class World {
  WORLD_FILE = 'babylon/halloween25.babylon'

  /**
   * Navigation
   */
  static SPEED = 0.4 // default 2
  static FLY_MODE = 1
  static WALK_MODE = 2

  // refer to camera ellipsoid area
  AVATAR_SIZE = {
    x: 1,
    y: 1,
    z: 1,
  }

  GRAVITY_FORCE = -0.05 // default -0.98
  ANGULAR_SENSIBILTY = 5000 // default 2000
  TOUCH_ANGULAR_SENSIBILITY = 4000 // default 20000
  TOUCH_MOVE_SENSIBILITY = 250 // default 250

  // helpers
  HELPER_VISIBILITY = false

  /**
   * Cameras
   */

  // Start position
  CAMERA1_POSITION = new BABYLON.Vector3(-75.22, -16.06, -67.056)
  CAMERA1_ROTATION = new BABYLON.Vector3(-0.103, -36.984, 0.0)

  // Inside Manor

  CAMERA2_POSITION = new BABYLON.Vector3(20.72, 10.437, 13.765)
  CAMERA2_ROTATION = new BABYLON.Vector3(-0.009, -25.845, 0.0)

  // Corridor
  CAMERA3_POSITION = new BABYLON.Vector3(20.669, 13.583, 28.728)
  CAMERA3_ROTATION = new BABYLON.Vector3(0.125, -26.188, 0.0)

  // Attic
  CAMERA4_POSITION = new BABYLON.Vector3(18.331, 16.695, 25.991)
  CAMERA4_ROTATION = new BABYLON.Vector3(0.141, -27.738, 0.0)

  // Point of view
  CAMERA5_POSITION = new BABYLON.Vector3(256.827, 29.783, -138.633)
  CAMERA5_ROTATION = new BABYLON.Vector3(0.02, -7.802, 0.0)

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
    en: '../hell/',
    fr: '../enfer/',
  }

  PANEL_2_URL = {
    en: '../atlantis/',
    fr: '../atlantide/',
  }

  /**
   *  Actions
   */
  ACTIONS = {
    touchOrgan: 'Play the organ',
    openGoldenBook: 'Open golden book',
    openHellAndParadise: 'Open hell & paradise',
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

  ACTIONS_JUMP_HELL = {
    en : 'jump to hell and paradise',
    fr : 'découvrir enfer et paradis',
  }

  ACTIONS_PLAY_ORGAN = {
    en : 'play organ',
    fr : 'jouer de l\'orgue',
  }

  ACTION_MESHES = [
    'organ',
    'goldenBook',
    'informationPanelUrl',
    'informationPanelUrl2',
  ]

  // Library links
  TAB_BOOKS = {
    0: 'https://g.co/doodle/kukatz', // Doodle halloween 2016
    1: 'http://www.supercoloring.com/coloring-pages/holidays/halloween', // Coloring
    2: 'https://www.bettycrocker.com/recipes/dishes/cookie-recipes/halloween-cookies', // Cookies receipts halloween
    3: 'https://www.storynory.com/the-witch-who-was-frightened-of-halloween/', // The Witch Who Was Frightened by Halloween
    4: 'https://www.youtube.com/watch?v=5ebDZiRAs68', // Halloween origin
  }

  // Organ Music
  TAB_MUSIC = {
    0: 'beetle',
    1: 'macabre',
    2: 'hallow',
    3: 'addams',
    4: 'exorcist',
    5: 'tales',
    6: 'sorciere',
    7: 'munsters',
    8: 'xmas',
    9: 'polter',
    10: 'spooks',
    11: 'ghost',
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

    // music
    this._musicSound
    this._musicNumber = 1

    // Spatial sounds
    this._doorOpenSound = new BABYLON.Sound(
      'doorOpenSound',
      'sound/door_open.mp3',
      this._scene,
      null,
      {
        loop: false,
        autoplay: false,
        spatialSound: true,
        maxDistance: 35,
        distanceModel: 'exponential',
      }
    )
    this._doorSqueakSound = new BABYLON.Sound(
      'doorSqueakSound',
      'sound/door_squeak.mp3',
      this._scene,
      null,
      {
        loop: false,
        autoplay: false,
        spatialSound: true,
        maxDistance: 35,
        distanceModel: 'exponential',
      }
    )

    this._wolfSound = new BABYLON.Sound(
      'wolfSound',
      'sound/wolf.wav',
      this._scene,
      null,
      { volume: 0.1 }
    ) //, null, { loop: false, autoplay: false, spatialSound: true, maxDistance: 500 ,  distanceModel: "exponential" });

    this._isSoundsPlayed = false
    this._delta = 0
    this._alpha = 0
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

    if (!this._gui.isXbox()) {
      this.createMist()
    }

    // spatial sounds
    this._doorOpenSound.setPosition(new BABYLON.Vector3(16.741, 13.583, 28.629))
    this._doorSqueakSound.setPosition(
      new BABYLON.Vector3(16.741, 13.583, 28.629)
    )

    // Load meshes
    let result = await BABYLON.SceneLoader.ImportMeshAsync(
      null,
      '',
      this.WORLD_FILE,
      this._scene
    )

    // helpers ( help to avoid collision stuck on bridge )
    // group them under an empty mesh parent
    let helpersParent = new BABYLON.Mesh('dummy', this._scene)
    let helpers = this._scene.getMeshesByTags('helper')

    for (let helper of helpers) {
      helper.isVisible = this.HELPER_VISIBILITY
      helper.parent = helpersParent
    }

    helpersParent.name = 'helpersParent'

    // Materials

    let material_beam = new BABYLON.StandardMaterial('beammat', this._scene)
    material_beam.diffuseTexture = new BABYLON.Texture('beam.png', this._scene)
    material_beam.diffuseTexture.hasAlpha = true
    material_beam.alpha = 0.6

    // beams
    let beams = this._scene.getMeshesByTags('beam')
    for (let beam of beams) {
      beam.checkCollisions = false
      // change material only on origin mesh, not on instances
      if (beam.instances != null) {
        beam.material = material_beam
      }
    }

    /**
     * Library shelfs
     **/
    const shelfs = this._scene.getMeshesByTags('shelf')
    let numBook = 0

    for (let shelf of shelfs) {
      shelf.isPickable = true
      // add action manager to the shelf
      shelf.actionManager = new BABYLON.ActionManager(this._scene)
      shelf.numBook = numBook
      shelf.actionManager.registerAction(
        new BABYLON.ExecuteCodeAction(
          BABYLON.ActionManager.OnPickTrigger,
          (shelf) => {
            this.openBook(shelf.source.numBook)
          }
        )
      )
      numBook++
    }

    // browse all meshes

    for (let i = 0; i < result.meshes.length; i++) {
      let rootMesh = result.meshes[i]

      // music panel play
      if (rootMesh.name.includes('organ')) {
        // this mesh can be clicked
        rootMesh.isPickable = true

        // add action manager to the music play button
        rootMesh.actionManager = new BABYLON.ActionManager(this._scene)
        rootMesh.actionManager.registerAction(
          new BABYLON.ExecuteCodeAction(
            BABYLON.ActionManager.OnPickTrigger,
            () => {
              this.touchOrgan()
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
      if (rootMesh.name.includes('informationPanelUrl')) {
        // this mesh can be clicked
        rootMesh.isPickable = true

        // add action manager
        rootMesh.actionManager = new BABYLON.ActionManager(this._scene)
        rootMesh.actionManager.registerAction(
          new BABYLON.ExecuteCodeAction(
            BABYLON.ActionManager.OnPickTrigger,
            () => {
              this.openHellAndParadise()
            }
          )
        )
      }

      // information panel
      if (rootMesh.name.includes('informationPanelUrl2')) {
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
      this.playAmbientSounds()

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
            pickResult.pickedMesh.id === 'organ' &&
            this._currentAction != this.ACTIONS.touchOrgan
          ) {
            isGamePadActionVisible = true
            document.dispatchEvent(
              new CustomEvent('showGamePadAction', { detail: this.ACTIONS_PLAY_ORGAN[this._lang] })
            )
            this._currentAction = this.ACTIONS.touchOrgan
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
            pickResult.pickedMesh.id === 'informationPanelUrl' &&
            this._currentAction != this.ACTIONS.openHellAndParadise
          ) {
            isGamePadActionVisible = true
            document.dispatchEvent(
              new CustomEvent('showGamePadAction', {
                detail: this.ACTIONS_JUMP_HELL[this._lang],
              })
            )
            this._currentAction = this.ACTIONS.openHellAndParadise
          }

          if (
            pickResult.pickedMesh.id === 'informationPanelUrl2' &&
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
      case this.ACTIONS.touchOrgan:
        this.touchOrgan()
        break
      case this.ACTIONS.openAtlantis:
        this.openAtlantis()
        break
      case this.ACTIONS.openHellAndParadise:
        this.openHellAndParadise()
        break
      case this.ACTIONS.openGoldenBook:
        this.openGoldenBook()
        break
    }
  }

  playAmbientSounds() {
    this._delta++

    if (this._delta > 1000) {
      let r = this.randomNumber(1, 5)

      // door open
      if (r === 2) {
        let ready = this.checkAudioContext()

        if (ready) {
          this._doorOpenSound.stop()
          this._doorOpenSound.play()

          this._isSoundsPlayed = true
        }
      }

      if (r === 3) {
        let ready = this.checkAudioContext()

        if (ready) {
          this._doorSqueakSound.stop()
          this._doorSqueakSound.play()

          this._isSoundsPlayed = true
        }
      }

      this._delta = 0
    }

    this._alpha++

    // wolf
    if (this._alpha > 2500) {
      let r = this.randomNumber(1, 5)

      if (r === 3) {
        let ready = this.checkAudioContext()

        if (ready) {
          this._wolfSound.stop()
          this._wolfSound.play()
        }
      }
      this._alpha = 0
    }
  }

  touchOrgan() {
    let ready = this.checkAudioContext()

    if (ready) {
      if (this._musicNumber > 11) {
        this._musicNumber = 0
      }

      this.playMusic(this.TAB_MUSIC[this._musicNumber])
      this._musicNumber++
    }
  }

  /**
   * Play a music
   * */
  playMusic(musicTitle) {
    if (this._musicSound != null) {
      this._musicSound.stop()
    }
    this._musicSound = new BABYLON.Sound(
      'music',
      'music/' + musicTitle + '.mp3',
      this._scene,
      () => {
        // Sound has been downloaded & decoded
        this._musicSound.loop = false
        this._musicSound.play()
      }
    )
  }

  createMist() {
    // mist generator
    const fountain = BABYLON.Mesh.CreateBox('foutain', 0.01, this._scene)
    fountain.position = new BABYLON.Vector3(-43.024, -19.752, -17.533)

    // Create a particle system
    let particleSystem
    let useGPUVersion = false

    const fogTexture = new BABYLON.Texture('smoke_15.png', this._scene)

    if (particleSystem) {
      particleSystem.dispose()
    }

    if (useGPUVersion && BABYLON.GPUParticleSystem.IsSupported) {
      if (this._gui.isXbox()) {
        particleSystem = new BABYLON.GPUParticleSystem(
          'particles',
          { capacity: 500 },
          this._scene
        )
        particleSystem.activeParticleCount = 250
      } else {
        particleSystem = new BABYLON.GPUParticleSystem(
          'particles',
          { capacity: 5000 },
          this._scene
        )
        particleSystem.activeParticleCount = 1500
      }

      particleSystem.manualEmitCount = particleSystem.activeParticleCount
      particleSystem.minEmitBox = new BABYLON.Vector3(-50, 2, -50) // Starting all from
      particleSystem.maxEmitBox = new BABYLON.Vector3(50, 2, 50) // To..
    } else {
      particleSystem = new BABYLON.ParticleSystem('particles', 250, this._scene)
      particleSystem.manualEmitCount = particleSystem.getCapacity()
      particleSystem.minEmitBox = new BABYLON.Vector3(-12, 2, -12) // Starting all from
      particleSystem.maxEmitBox = new BABYLON.Vector3(12, 2, 12) // To...
    }

    particleSystem.particleTexture = fogTexture.clone()
    particleSystem.emitter = fountain

    particleSystem.color1 = new BABYLON.Color4(0.8, 0.8, 0.8, 0.1)
    particleSystem.color2 = new BABYLON.Color4(0.95, 0.95, 0.95, 0.15)
    particleSystem.colorDead = new BABYLON.Color4(0.9, 0.9, 0.9, 0.1)
    particleSystem.minSize = 3.5
    particleSystem.maxSize = 5.0
    particleSystem.minLifeTime = Number.MAX_SAFE_INTEGER
    particleSystem.emitRate = 50000
    particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_STANDARD
    particleSystem.gravity = new BABYLON.Vector3(0, 0, 0)
    particleSystem.direction1 = new BABYLON.Vector3(0, 0, 0)
    particleSystem.direction2 = new BABYLON.Vector3(0, 0, 0)
    particleSystem.minAngularSpeed = -2
    particleSystem.maxAngularSpeed = 2
    particleSystem.minEmitPower = 0.5
    particleSystem.maxEmitPower = 1
    particleSystem.updateSpeed = 0.005

    particleSystem.start()
  }

  /**
   * Open a book
   */
  openBook(numBook) {
    window.open(this.TAB_BOOKS[numBook])
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

  openHellAndParadise() {
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
