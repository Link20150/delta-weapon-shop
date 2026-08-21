const sample = require('../../data/sample-codes.js')
const util = require('../../utils/util.js')

Page({
  data: {
    favCount: 0,
    myCodeCount: 0,
    favorites: []
  },

  onShow() {
    // TODO: 云数据库接入后，收藏从云函数按 id 拉取完整方案
    const ids = util.getFavorites()
    const favorites = sample.filter(item => ids.indexOf(item.id) > -1)
    this.setData({
      favCount: ids.length,
      myCodeCount: util.getMyCodes().length,
      favorites
    })
  },

  goMyCodes() {
    wx.navigateTo({ url: '/pages/my-codes/my-codes' })
  },

  goDetail(e) {
    getApp().globalData.currentCode = this.data.favorites[e.currentTarget.dataset.index]
    wx.navigateTo({ url: '/pages/detail/detail' })
  }
})
