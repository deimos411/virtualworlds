class Screen {
  _width
  _height
  _isMobile
  _isFullScreen
  _isLandscape
  _isXbox

  constructor() {
    this.checkIsMobile()
    this.checkIsFullScreen()
    this.checkIsXBox()
  }

  isMobile() {
    return this._isMobile
  }

  isFullScreen() {
    return this._isFullScreen
  }

  isLandscape() {
    return this._isLandscape
  }

  isXbox() {
    return this._isXbox
  }

  checkIsMobile() {
    this._isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      )
  }

  checkIsFullScreen() {
    this._isFullScreen = !(
      !document.fullscreenElement &&
      !document.webkitIsFullScreen &&
      !document.mozFullScreen &&
      !document.msFullscreenElement
    )
  }

  checkIsXBox() {
    // navigator.userAgentData works only on Edge, Chrome
    if (navigator.userAgentData != undefined) {
      navigator.userAgentData.getHighEntropyValues(['model']).then((data) => {
        this._isXbox = data.model === 'Xbox'
      })
    } else {
      return false
    }
  }

  resize(canvas) {
    this._width = canvas.width
    this._height = canvas.height

    this.checkIsMobile()
    this.checkIsFullScreen()

    if (canvas.height >= canvas.width) {
      this._isLandscape = false
    } else {
      this._isLandscape = true
    }
  }
}

export { Screen }
