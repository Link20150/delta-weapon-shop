const util = require('../../utils/util.js')

Page({
  data: {
    code: null,
    fav: false
  },

  onLoad() {
    const code = getApp().globalData.currentCode
    if (code) {
      code.img = util.gunImg(code.gunName)
    }
    this.setData({
      code,
      fav: code ? util.isFavorite(code.id) : false
    })
  },

  copy() {
    if (this.data.code) {
      util.copyText(this.data.code.code)
    }
  },

  toggleFav() {
    const code = this.data.code
    if (!code) return
    if (this.data.fav) {
      util.removeFavorite(code.id)
    } else {
      util.addFavorite(code.id)
    }
    this.setData({ fav: !this.data.fav })
  }
})
