// GUI for mobile navigation
import { Screen } from './screen.js'

class Gui extends Screen {
  // help types
  static HELP_COMPUTER = 0
  static HELP_MOBILE = 1
  static HELP_GAMEPAD = 2

  /**
   * Multi langages
   */
  LOADING_MESSAGE = {
    en: 'Loading...',
    fr: 'Chargement en cours...',
  }
  WALK_MESSAGE = {
    en: 'Walk (M)',
    fr: 'Marcher (M)',
  }
  FLY_MESSAGE = {
    en: 'Fly (F)',
    fr: 'Voler (F)',
  }
  EXIT_FULL_SCREEN_MESSAGE = {
    en: 'Exit full screen (Echap)',
    fr: 'Quitter plein écran (Echap)',
  }
  FULL_SCREEN_MESSAGE = {
    en: 'Full screen (X)',
    fr: 'Plein écran (X)',
  }
  GAMEPAD_CONNECTED = {
    en: 'GamePad connected',
    fr: 'GamePad connecté',
  }
  GAMEPAD_DISCONNECTED = {
    en: 'GamePad disconnected',
    fr: 'GamePad déconnecté',
  }

  _isVisible = false

  // selectors
  $loader = document.getElementById('loader')
  $divFps = document.getElementById('fps')
  $loaderMessage = document.querySelector('#loader span')
  $btnFullScreen = document.getElementById('btnFullScreen')
  $btnCamera = document.getElementById('btnCamera')
  $btnNavigation = document.getElementById('btnNavigation')
  $btnHelp = document.getElementById('btnHelp')
  $gamePad = document.getElementById('gamepad')
  $gamePadText = document.querySelector('#gamepad span')
  $screenTarget = document.getElementById('screenTarget')
  $gamePadStatus = document.getElementById('gamepadStatus')
  $gamePadStatusText = document.querySelector('#gamepadStatus span')
  $screenTarget = document.getElementById('screenTarget')
  $helpComputer = document.getElementById('helpComputer')
  $helpGamePad = document.getElementById('helpGamePad')
  $helpMobile = document.getElementById('helpMobile')
  $btnHelpClose = document.querySelectorAll('.btnHelpClose')
  $imgHelpMobile = document.getElementById('imgHelpMobile')

  constructor() {
    super()
    this._lang = document.documentElement.lang
  }

  init() {
    // exit full screen listeners
    document.addEventListener('fullscreenchange', () => {
      this.exitHandler()
    })
    document.addEventListener('webkitfullscreenchange', () => {
      this.exitHandler()
    })
    document.addEventListener('mozfullscreenchange', () => {
      this.exitHandler()
    })
    document.addEventListener('MSFullscreenChange', () => {
      this.exitHandler()
    })

    this.$divFps.addEventListener('pointerdown', () => {
      document.dispatchEvent(new Event('showDebug'))
    })

    // button full screen listener
    this.$btnFullScreen.addEventListener('pointerdown', () => {
      this.toggleScreenMode()
    })

    // button camera full
    this.$btnCamera.addEventListener('pointerdown', () => {
      document.dispatchEvent(new Event('changeCamera'))
    })

    // button change navigation mode ( WALK => FLY => WALK ...)
    this.$btnNavigation.addEventListener('pointerdown', () => {
      document.dispatchEvent(new Event('toggleNavigation'))
    })

    // button help
    this.$btnHelp.addEventListener('pointerdown', () => {
      if (this._isMobile) {
        document.dispatchEvent(
          new CustomEvent('toggleHelp', { detail: { type: Gui.HELP_MOBILE } })
        )
      } else {
        document.dispatchEvent(
          new CustomEvent('toggleHelp', { detail: { type: Gui.HELP_COMPUTER } })
        )
      }
    })

    // button let'go
    this.$btnHelpClose.forEach((elem) => {
      elem.addEventListener('pointerdown', () => {
        if (this._isMobile) {
          document.dispatchEvent(
            new CustomEvent('toggleHelp', { detail: { type: Gui.HELP_MOBILE } })
          )
        } else {
          document.dispatchEvent(
            new CustomEvent('toggleHelp', {
              detail: { type: Gui.HELP_COMPUTER },
            })
          )
        }
      })
    })
  }

  showGamePadConnected() {
    this.$gamePadStatus.classList.toggle('hidden')
    this.$gamePadStatusText.innerHTML = this.GAMEPAD_CONNECTED[this._lang]
  }

  hideGamePadConnected() {
    this.$screenTarget.classList.toggle('hidden')
    this.$screenTarget.style.display = 'block'
    this.$gamePadStatus.style.display = 'none'
    this.$gamePadStatusText.innerHTML = ''
  }

  showGamePadDisconnected() {
    this.$gamePadStatus.style.display = 'block'
    this.$gamePadStatusText.innerHTML = this.GAMEPAD_DISCONNECTED[this._lang]
  }

  hideGamePadDisconnected() {
    this.$screenTarget.style.display = 'none'
    this.$gamePadStatus.style.display = 'none'
    this.$gamePadStatusText.innerHTML = ''
  }

  showGamePadAction(str) {
    this.$gamePad.classList.remove('hidden')
    this.$gamePad.style.display = 'block'
    this.$gamePadText.innerHTML = str
  }

  hideGamePadAction() {
    this.$gamePad.classList.add('hidden')
    this.$gamePad.style.display = 'none'
    this.$gamePadText.innerHTML = ''
  }

  /**
   * Show/Hide help modals
   * @type : type of help
   */
  toggleHelp(type) {
    switch (type) {
      case Gui.HELP_COMPUTER:
        this.$helpComputer.classList.toggle('hidden')
        break
      case Gui.HELP_MOBILE:
        this.$helpMobile.classList.toggle('hidden')
        break
      case Gui.HELP_GAMEPAD:
        this.$helpGamePad.classList.toggle('hidden')
        break
    }
  }

  isHelpVisible() {
    return !this.$helpGamePad.hasClass('hidden')
  }

  showFps(value) {
    this.$divFps.innerHTML = value + ' fps'
  }

  showLoadingScreen() {
    this.$loaderMessage.innerHTML = this.LOADING_MESSAGE[this._lang]
  }

  showFlyMode() {
    this.$btnNavigation.setAttribute('src', 'images/fly.png')
    this.$btnNavigation.setAttribute('title', this.WALK_MESSAGE[this._lang])
  }

  showWalkMode() {
    this.$btnNavigation.setAttribute('src', 'images/walk.png')
    this.$btnNavigation.setAttribute('title', this.FLY_MESSAGE[this._lang])
  }

  hideLoadingScreen() {
    this.$loader.classList.add('fade-out')
    setTimeout(() => {
      this.$loader.style.display = 'none'
      this.show()
    }, '300')
  }

  exitHandler() {
    if (
      !document.fullscreenElement &&
      !document.webkitIsFullScreen &&
      !document.mozFullScreen &&
      !document.msFullscreenElement
    ) {
      this.exitFullScreen()
    }
  }

  /*
   * Toggle screen mode normal <> fullscreen
   */
  toggleScreenMode() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      this.goFullScreen()
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
        this.exitFullScreen()
      }
    }
  }

  /*
   * Show / Hide gui buttons
   * */
  toggleButtons() {
    if (this.isVisible()) {
      this.hide()
    } else {
      this.show()
    }
  }

  /**
   * Switch to full Screen mode
   */
  goFullScreen() {
    btnFullScreen.setAttribute('src', 'images/collapse.png')
    btnFullScreen.setAttribute(
      'title',
      this.EXIT_FULL_SCREEN_MESSAGE[this._lang]
    )
  }

  /**
   * After exit full screen mode
   **/
  exitFullScreen() {
    btnFullScreen.setAttribute('src', 'images/expand.png')
    btnFullScreen.setAttribute('title', this.FULL_SCREEN_MESSAGE[this._lang])
  }

  show() {
    const buttons = document.getElementById('gui')
    buttons.style.display = 'block'
    this._isVisible = true
  }

  hide() {
    const buttons = document.getElementById('gui')
    buttons.style.display = 'none'
    this._isVisible = false
  }

  isVisible() {
    return this._isVisible
  }

  resize(canvas) {
    super.resize(canvas)

    // screen mode
    const PORTRAIT = 1
    const LANDSCAPE = 2
    let screenMode

    if (this.isLandscape()) {
      screenMode = LANDSCAPE
    } else {
      screenMode = PORTRAIT
    }

    // only resize on mobile
    if (this.isMobile()) {
      // on portrait mode without fullscreen
      if (!document.fullscreenElement && screenMode == PORTRAIT) {
        // fps
        this.$divFps.style.width = '120px'
        this.$divFps.style.top = '15px'
        this.$divFps.style.left = '10px'
        this.$divFps.style.fontSize = '32px'

        // navigation
        this.$btnNavigation.style.width = '96px'
        this.$btnNavigation.style.height = '96px'
        this.$btnNavigation.style.top = '55px'

        // camera
        this.$btnCamera.style.width = '96px'
        this.$btnCamera.style.height = '96px'
        this.$btnCamera.style.top = '175px'

        // fullscreen
        this.$btnFullScreen.style.width = '96px'
        this.$btnFullScreen.style.height = '96px'
        this.$btnFullScreen.style.top = '295px'

        // help
        this.$btnHelp.style.width = '96px'
        this.$btnHelp.style.height = '96px'
        this.$btnHelp.style.top = '415px'

        this.$imgHelpMobile.style.width = '773px'
        this.$btnHelpClose.forEach((elem) => {
          elem.style.width = '297px'
        })
      } else {
        // otherwise

        // fps
        this.$divFps.style.width = '60px'
        this.$divFps.style.top = '15px'
        this.$divFps.style.left = '10px'
        this.$divFps.style.fontSize = '16px'

        // navigation
        this.$btnNavigation.style.width = '32px'
        this.$btnNavigation.style.height = '32px'
        this.$btnNavigation.style.top = '15px'

        // camera
        this.$btnCamera.style.width = '32px'
        this.$btnCamera.style.height = '32px'
        this.$btnCamera.style.top = '60px'

        // fullscreen
        this.$btnFullScreen.style.width = '32px'
        this.$btnFullScreen.style.height = '32px'
        this.$btnFullScreen.style.top = '105px'

        // help
        this.$btnHelp.style.width = '32px'
        this.$btnHelp.style.height = '32px'
        this.$btnHelp.style.top = '150px'

        this.$imgHelpMobile.style.width = '256px'
        this.$btnHelpClose.forEach((elem) => {
          elem.style.width = '99px'
        })
      }
    }
  }
}

export { Gui }
