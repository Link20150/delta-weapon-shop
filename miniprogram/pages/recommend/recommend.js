const sample = require('../../data/sample-codes.js')
const util = require('../../utils/util.js')

Page({
  data: {
    daily: []
  },

  onLoad() {
    this.loadDaily()
  },

  onPullDownRefresh() {
    this.loadDaily().finally(() => wx.stopPullDownRefresh())
  },

  // 优先走云函数 getDaily，未部署时降级为示例数据；首页只展示 4-6 套
  async loadDaily() {
    const decorate = item => Object.assign({}, item, {
      title: item.title || item.gunName + ' · ' + item.configName
    })
    const fallback = sample.slice(0, 6).map(decorate)
    try {
      const res = await wx.cloud.callFunction({ name: 'getDaily' })
      const result = res.result || {}
      const list = (result.list || []).map(item => decorate(Object.assign({ id: item._id }, item)))
      this.setData({
        daily: (list.length ? list : fallback).slice(0, 6)
      })
    } catch (e) {
      this.setData({ daily: fallback })
    }
  },

  goArsenal() {
    wx.switchTab({ url: '/pages/arsenal/arsenal' })
  },

  goDetail(e) {
    getApp().globalData.currentCode = e.currentTarget.dataset.item
    wx.navigateTo({ url: '/pages/detail/detail' })
  },

  copyCode(e) {
    util.copyText(e.currentTarget.dataset.code)
  }
})
