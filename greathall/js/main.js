import { VirtualJoystick } from './virtualstick.js'
import { GamePadController } from './gamepad.js'
import { Gui } from './gui.js'
import { World } from './world.js'

// canvas
var canvas = document.getElementById('renderCanvas')

var engine = null
var scene = null
var world = null
var sceneToRender = null

// creation of the default engine
var createDefaultEngine = () => {
  const antialiasing = true
  const adaptToDeviceRatio = false

  return new BABYLON.Engine(
    canvas,
    antialiasing,
    {
      preserveDrawingBuffer: true,
      stencil: true,
      disableWebGL2Support: false,
    },
    adaptToDeviceRatio
  )
}

let initFunction = async () => {
  var asyncEngineCreation = async () => {
    try {
      return createDefaultEngine()
    } catch (e) {
      console.log(
        'the available createEngine function failed. Creating the default engine instead'
      )
      return createDefaultEngine()
    }
  }

  engine = await asyncEngineCreation()

  if (!engine) throw 'engine should not be null.'

  world = new World(engine, canvas, virtualJoystick, gui)
  scene = await world.createScene()
  world.resize()

  //when everything is done loading, hide loader screen
  scene.executeWhenReady(() => {
    gui.hideLoadingScreen()
  })
}

initFunction().then(() => {
  sceneToRender = scene
  engine.runRenderLoop(function () {
    if (sceneToRender && sceneToRender.activeCamera) {
      sceneToRender.render()
    }
  })
})

// gamepad
var gamePadController = new GamePadController()
gamePadController.init()

// virtual joystick
var virtualJoystick = new VirtualJoystick()

// graphic user interface
var gui = new Gui()
gui.init()

// loading screen
gui.showLoadingScreen() //show the loading screen

// events listeners
window.addEventListener('resize', () => {
  engine.resize()
  virtualJoystick.resize(canvas)
  gui.resize(canvas)
  world.resize()
})

document.addEventListener(
  'changeCamera',
  () => {
    world.changeCamera()
  },
  false
)

document.addEventListener(
  'toggleNavigation',
  () => {
    world.toggleNavigationMode()
  },
  false
)

document.addEventListener(
  'toggleFullScreen',
  () => {
    gui.toggleScreenMode()
  },
  false
)

document.addEventListener(
  'increaseSpeed',
  () => {
    world.increaseSpeed()
  },
  false
)

document.addEventListener(
  'decreaseSpeed',
  () => {
    world.decreaseSpeed()
  },
  false
)

document.addEventListener(
  'showDebug',
  () => {
    world.showDebug()
  },
  false
)

// gamepad action events
document.addEventListener(
  'gamePadConnect',
  (event) => {
    gui.showGamePadConnected()
    world.userMakeGesture() // to enable sound
    world.setGamePadStatus(GamePadController.GAMEPAD_CONNECTED)
    setTimeout(() => {
      gui.hideGamePadConnected()
    }, 2000)
  },
  false
)

document.addEventListener(
  'gamePadDisconnect',
  (event) => {
    gui.showGamePadDisconnected()
    world.setGamePadStatus(World.GAMEPAD_DISCONNECTED)
    setTimeout(() => {
      gui.hideGamePadDisconnected()
    }, 1500)
  },
  false
)

document.addEventListener(
  'showGamePadAction',
  (event) => {
    gui.showGamePadAction(event.detail)
  },
  false
)

document.addEventListener(
  'hideGamePadAction',
  (event) => {
    gui.hideGamePadAction(event.detail)
  },
  false
)

document.addEventListener(
  'action',
  (event) => {
    world.action()
  },
  false
)

document.addEventListener(
  'toggleHelp',
  (event) => {
    gui.toggleHelp(event.detail.type)
  },
  false
)

// pointer is down, user make a gesture
canvas.addEventListener('pointerdown', () => {
  world.userMakeGesture()
})

// key up listener
canvas.addEventListener(
  'keyup',
  (event) => {
    if (event.defaultPrevented) {
      return // shouldn't do anything if the key event was already consumed.
    }
    switch (event.code) {
      // Unpress "Shift" to decrease speed
      case 'ShiftLeft':
        world.decreaseSpeed()
        break
    }
    // cancel default action to prevent twice behaviour
    event.preventDefault()
  },
  true
)

// key down listener
canvas.addEventListener(
  'keydown',
  (event) => {
    if (event.defaultPrevented) {
      return // shouldn't do anything if the key event was already consumed.
    }

    switch (event.code) {
      // Press "C" to change camera
      case 'KeyC':
        world.changeCamera()
        break

      // Press "L" open scene explorer + inspector
      case 'KeyL':
        world.showDebug()
        break

      // Press "F" to fly
      case 'KeyF':
        world.setNavigationMode(World.FLY_MODE)
        break

      // Press "G" to hide/show gui buttons
      case 'KeyG':
        gui.toggleButtons()
        break

      // Press "H" to hide/show gui buttons
      case 'KeyH':
        gui.toggleHelp(Gui.HELP_COMPUTER)
        break

      // Press "N" to get camera position
      case 'KeyN':
        world.showCameraInfo()
        break

      // Press "M" to walk
      case 'Semicolon':
        world.setNavigationMode(World.WALK_MODE)
        break

      // Press "X" to go fullscreen
      case 'KeyX':
        gui.toggleScreenMode()
        break

      // Press "Shift" to increase speed
      case 'ShiftLeft':
        if (!event.repeat) {
          world.increaseSpeed()
        }
        break

      default:
        return
    }

    // cancel default action to prevent twice behaviour
    event.preventDefault()
  },
  true
)
