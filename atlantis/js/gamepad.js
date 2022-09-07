import { Gui } from './gui.js'

class GamePadController {
  static GAMEPAD_CONNECTED = 1
  static GAMEPAD_DISCONNECTED = 0

  constructor() {
    this._gamepadManager = new BABYLON.GamepadManager()
  }

  init() {
    this._gamepadManager.onGamepadConnectedObservable.add((gamepad, state) => {
      // Handle gamepad types
      // XBOX controller first
      if (gamepad instanceof BABYLON.Xbox360Pad) {
        this.onGamePadConnected()

        //Xbox button down/up events
        gamepad.onButtonDownObservable.add((button, state) => {
          switch (BABYLON.Xbox360Button[button]) {
            case 'A':
              this.onButtonAPressed()
              break
            case 'Y':
              this.onButtonYPressed()
              break
            case 'X':
              this.onButtonXPressed()
              break
            case 'B':
              this.onButtonBPressed()
              break
            case 'RB':
              this.onRBPressed()
              break
            case 'LB':
              this.onLBPressed()
              break
          }
        })

        gamepad.onButtonUpObservable.add((button, state) => {
          switch (BABYLON.Xbox360Button[button]) {
            case 'A':
              this.onARelased()
              break
          }
        })
      }
    })

    this._gamepadManager.onGamepadDisconnectedObservable.add(
      (gamepad, state) => {
        this.onGamePadDisconnected()
      }
    )
  }

  onGamePadConnected() {
    document.dispatchEvent(new Event('gamePadConnect'))
  }

  onGamePadDisconnected() {
    document.dispatchEvent(new Event('gamePadDisconnect'))
  }

  onButtonYPressed() {
    document.dispatchEvent(new Event('changeCamera'))
  }

  onButtonXPressed() {
    document.dispatchEvent(new Event('action'))
  }

  onButtonBPressed() {
    document.dispatchEvent(
      new CustomEvent('toggleHelp', { detail: { type: Gui.HELP_GAMEPAD } })
    )
  }

  onRBPressed() {
    document.dispatchEvent(new Event('toggleNavigation'))
  }

  onButtonAPressed() {
    document.dispatchEvent(new Event('increaseSpeed'))
  }

  onARelased() {
    document.dispatchEvent(new Event('decreaseSpeed'))
  }

  onLBPressed() {
    document.dispatchEvent(new Event('toggleFullScreen'))
  }
}

export { GamePadController }
