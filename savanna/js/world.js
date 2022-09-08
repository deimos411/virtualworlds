import { GamePadController } from './gamepad.js'

class World {
  WORLD_FILE = 'babylon/safari8.babylon'

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

  // Start position
  CAMERA1_POSITION = new BABYLON.Vector3(-5.318, 3.93, -10.211)
  CAMERA1_ROTATION = new BABYLON.Vector3(-0.006, -5.767, 0.0)

  // Water spot
  CAMERA2_POSITION = new BABYLON.Vector3(42.93, 6.817, -320.607)
  CAMERA2_ROTATION = new BABYLON.Vector3(0.064, -0.497, 0.0)

  // Feast
  CAMERA3_POSITION = new BABYLON.Vector3(-311.764, 3.93, -34.598)
  CAMERA3_ROTATION = new BABYLON.Vector3(-0.005, -5.334, 0.0)

  // Point of view
  CAMERA4_POSITION = new BABYLON.Vector3(256.827, 29.783, -138.633)
  CAMERA4_ROTATION = new BABYLON.Vector3(0.02, -7.802, 0.0)

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
    en: '../greathall/',
    fr: '../hall/',
  }

  PANEL_2_URL = {
    en: '../hell/',
    fr: '../enfer/',
  }

  /**
   *  Actions
   */
  ACTIONS = {
    openGoldenBook: 'Open golden book',
    openHellAndParadise: 'Open hell & paradise',
    openGreatHall: 'Open great hall',
  }

  ACTIONS_OPEN_BOOK = {
    en : 'open golden book',
    fr : 'ouvrir le livre d\'or',
  }

  ACTIONS_JUMP_HELL = {
    en : 'jump to hell and paradise',
    fr : 'découvrir enfer et paradis',
  }

  ACTIONS_JUMP_HALL = {
    en : 'jump to great hall',
    fr : 'découvrir grand hall',
  }

  ACTION_MESHES = ['goldenBook', 'informationPanel1Url', 'informationPanel2Url']

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

    this._instrumentSound = new BABYLON.Sound(
      'instrumentSound',
      'sound/instrument.wav',
      this._scene,
      null,
      {
        loop: true,
        autoplay: false,
        spatialSound: true,
        maxDistance: 35,
        distanceModel: 'exponential',
      }
    )

    this._birdSound = new BABYLON.Sound(
      'birdSound',
      'sound/bird.wav',
      this._scene,
      null,
      { volume: 0.1 }
    ) //, null, { loop: false, autoplay: false, spatialSound: true, maxDistance: 500 ,  distanceModel: "exponential" });

    this._waterSound = new BABYLON.Sound(
      'waterSound',
      'sound/water.wav',
      this._scene,
      null,
      {
        loop: true,
        autoplay: false,
        spatialSound: true,
        maxDistance: 100,
        distanceModel: 'exponential',
        playbackRate: 0.5,
      }
    )

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

    // spatial sounds
    this._instrumentSound.setPosition(new BABYLON.Vector3(10.18, 3.931, 26.548))
    this._waterSound.setPosition(new BABYLON.Vector3(-19.729, 4.62, -246.148))
    //birdSound.setPosition(new BABYLON.Vector3(10.180,3.931,26.548));

    // Sky material
    var skyboxMaterial = new BABYLON.SkyMaterial('skyMaterial', this._scene)
    skyboxMaterial.backFaceCulling = false
    //skyboxMaterial._cachedDefines.FOG = true

    // Sky mesh (box)
    var skybox = BABYLON.Mesh.CreateBox('skyBox', 1000.0, this._scene)
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
    var setSkyConfig = (property, from, to) => {
      var keys = [
        { frame: 0, value: from },
        { frame: 100, value: to },
      ]

      var animation = new BABYLON.Animation(
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

    let luminance = 1
    let turbidity = 40
    let inclinaison = 0

    // Set to Day
    setSkyConfig('material.inclination', skyboxMaterial.inclination, 0)

    // Load meshes
    let result = await BABYLON.SceneLoader.ImportMeshAsync(
      null,
      '',
      this.WORLD_FILE,
      this._scene
    )
    // Materials

    let material_water = new BABYLON.StandardMaterial('watermat', this._scene)
    material_water.diffuseTexture = new BABYLON.Texture('05.jpg', this._scene)
    material_water.diffuseTexture.hasAlpha = true
    //material_water.emissiveColor = new BABYLON.Color3(0.5,0.5,0.5);
    material_water.alpha = 0.6

    let material_glass = new BABYLON.StandardMaterial('glassmat', this._scene)
    material_glass.diffuseTexture = new BABYLON.Texture('14.jpg', this._scene)
    material_glass.diffuseTexture.hasAlpha = true
    //material_lava.emissiveColor = new BABYLON.Color3(0.5,0.5,0.5);
    material_glass.alpha = 0.6

    // ostrich
    let ostrichs = this._scene.getMeshesByTags('ostrich')
    for (let ostrich of ostrichs) {
      ostrich.isPickable = true
      ostrich.actionManager = new BABYLON.ActionManager(this._scene)
      ostrich.actionManager.registerAction(
        new BABYLON.ExecuteCodeAction(
          BABYLON.ActionManager.OnPickTrigger,
          () => {
            window.open(
              'https://web.archive.org/web/19990507052959/http://www.montparnasse.net/afrique/pagespeces/autruch.htm'
            )
          }
        )
      )
    }

    // wildebeest
    let wildebeests = this._scene.getMeshesByTags('wildebeest')
    for (let wildebeest of wildebeests) {
      wildebeest.isPickable = true
      wildebeest.actionManager = new BABYLON.ActionManager(this._scene)
      wildebeest.actionManager.registerAction(
        new BABYLON.ExecuteCodeAction(
          BABYLON.ActionManager.OnPickTrigger,
          () => {
            window.open(
              'https://web.archive.org/web/20010214062012/http://www.montparnasse.net/afrique/pagespeces/gnou.htm'
            )
          }
        )
      )
    }

    // cheetah
    let cheetahs = this._scene.getMeshesByTags('cheetah')
    for (let cheetah of cheetahs) {
      cheetah.isPickable = true
      cheetah.actionManager = new BABYLON.ActionManager(this._scene)
      cheetah.actionManager.registerAction(
        new BABYLON.ExecuteCodeAction(
          BABYLON.ActionManager.OnPickTrigger,
          () => {
            window.open(
              'https://web.archive.org/web/20010211130931/http://www.montparnasse.net/afrique/pagespeces/guepard.htm'
            )
          }
        )
      )
    }

    // giraffe
    let giraffes = this._scene.getMeshesByTags('giraffe')
    for (let giraffe of giraffes) {
      giraffe.isPickable = true
      giraffe.actionManager = new BABYLON.ActionManager(this._scene)
      giraffe.actionManager.registerAction(
        new BABYLON.ExecuteCodeAction(
          BABYLON.ActionManager.OnPickTrigger,
          () => {
            window.open(
              'https://web.archive.org/web/20010211124042/http://www.montparnasse.net/afrique/pagespeces/girafe.htm'
            )
          }
        )
      )
    }

    // rhinoceros
    let rhinoceroses = this._scene.getMeshesByTags('rhinoceros')
    for (let rhinoceros of rhinoceroses) {
      rhinoceros.isPickable = true
      rhinoceros.actionManager = new BABYLON.ActionManager(this._scene)
      rhinoceros.actionManager.registerAction(
        new BABYLON.ExecuteCodeAction(
          BABYLON.ActionManager.OnPickTrigger,
          () => {
            window.open(
              'https://web.archive.org/web/20010214072700/http://www.montparnasse.net/afrique/pagespeces/rhino.htm'
            )
          }
        )
      )
    }

    // elephant
    let elephants = this._scene.getMeshesByTags('elephant')
    for (let elephant of elephants) {
      elephant.isPickable = true
      elephant.actionManager = new BABYLON.ActionManager(this._scene)
      elephant.actionManager.registerAction(
        new BABYLON.ExecuteCodeAction(
          BABYLON.ActionManager.OnPickTrigger,
          () => {
            window.open(
              'https://web.archive.org/web/20010211122938/http://www.montparnasse.net/afrique/pagespeces/elephant.htm'
            )
          }
        )
      )
    }

    // crocodile
    let crocodiles = this._scene.getMeshesByTags('crocodile')
    for (let crocodile of crocodiles) {
      crocodile.isPickable = true
      crocodile.actionManager = new BABYLON.ActionManager(this._scene)
      crocodile.actionManager.registerAction(
        new BABYLON.ExecuteCodeAction(
          BABYLON.ActionManager.OnPickTrigger,
          () => {
            window.open(
              'https://web.archive.org/web/20010214061402/http://www.montparnasse.net/afrique/pagespeces/croco.htm'
            )
          }
        )
      )
    }

    // hippopotamus
    let hippopotamuses = this._scene.getMeshesByTags('hippopotamus')
    for (let hippopotamus of hippopotamuses) {
      hippopotamus.isPickable = true
      hippopotamus.actionManager = new BABYLON.ActionManager(this._scene)
      hippopotamus.actionManager.registerAction(
        new BABYLON.ExecuteCodeAction(
          BABYLON.ActionManager.OnPickTrigger,
          () => {
            window.open(
              'https://web.archive.org/web/20010214065057/http://www.montparnasse.net/afrique/pagespeces/hippo.htm'
            )
          }
        )
      )
    }

    // lion
    let lions = this._scene.getMeshesByTags('lion')
    for (let lion of lions) {
      lion.isPickable = true
      lion.actionManager = new BABYLON.ActionManager(this._scene)
      lion.actionManager.registerAction(
        new BABYLON.ExecuteCodeAction(
          BABYLON.ActionManager.OnPickTrigger,
          () => {
            window.open(
              'https://web.archive.org/web/20010214071550/http://www.montparnasse.net/afrique/pagespeces/lion.htm'
            )
          }
        )
      )
    }

    // hyena
    let hyenas = this._scene.getMeshesByTags('hyena')
    for (let hyena of hyenas) {
      hyena.isPickable = true
      hyena.actionManager = new BABYLON.ActionManager(this._scene)
      hyena.actionManager.registerAction(
        new BABYLON.ExecuteCodeAction(
          BABYLON.ActionManager.OnPickTrigger,
          () => {
            window.open(
              'https://web.archive.org/web/20010214070502/http://www.montparnasse.net/afrique/pagespeces/hyene.htm'
            )
          }
        )
      )
    }

    // vulture
    let vultures = this._scene.getMeshesByTags('vulture')
    for (let vulture of vultures) {
      vulture.isPickable = true
      vulture.actionManager = new BABYLON.ActionManager(this._scene)
      vulture.actionManager.registerAction(
        new BABYLON.ExecuteCodeAction(
          BABYLON.ActionManager.OnPickTrigger,
          () => {}
        )
      )
    }

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
    // browse all meshes

    for (let i = 0; i < result.meshes.length; i++) {
      let rootMesh = result.meshes[i]

      // water
      if (rootMesh.name.includes('water')) {
        rootMesh.material = material_water
      }

      // glass
      if (rootMesh.name.includes('glass')) {
        rootMesh.material = material_glass
      }

      // vulture fly animation
      if (rootMesh.name.includes('vulture')) {
        this._scene.beginAnimation(rootMesh, 0, 250, true, 0.25)
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
              this.openHellAndParadise()
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
            pickResult.pickedMesh.id === 'goldenBook' &&
            this._currentAction != this.ACTIONS.openGoldenBook
          ) {
            isGamePadActionVisible = true
            document.dispatchEvent(
              new CustomEvent('showGamePadAction', {
                detail:  this.ACTIONS_OPEN_BOOK[this._lang],
              })
            )
            this._currentAction = this.ACTIONS.openGoldenBook
          }

          if (
            pickResult.pickedMesh.id === 'informationPanel1Url' &&
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
      case this.ACTIONS.openGreatHall:
        this.openGreatHall()
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

    if (this._delta > 200 && !this._isSoundsPlayed) {
      let ready = this.checkAudioContext()

      if (ready) {
        this._instrumentSound.stop()
        this._instrumentSound.play()

        this._waterSound.stop()
        this._waterSound.play()

        //birdSound.stop();
        //birdSound.play();

        this._isSoundsPlayed = true
      }
      this._delta = 0
    }

    this._alpha++

    // bird
    if (this._alpha > 150) {
      let r = this.randomNumber(1, 5)

      if (r === 3) {
        let ready = this.checkAudioContext()

        if (ready) {
          this._birdSound.stop()
          this._birdSound.play()
        }
      }
      this._alpha = 0
    }
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

  openGoldenBook() {
    window.open(this.URL_WEBSITE[this._lang])
  }

  openGreatHall() {
    window.open(this.PANEL_1_URL[this._lang], '_self')
  }

  openHellAndParadise() {
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
