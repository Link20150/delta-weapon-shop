const sample = require('../../data/sample-codes.js')
const util = require('../../utils/util.js')

Page({
  data: {
    daily: [],
    password: ''
  },

  onLoad() {
    this.loadDaily()
  },

  onPullDownRefresh() {
    this.loadDaily().finally(() => wx.stopPullDownRefresh())
  },

  // 优先走云函数 getDaily，未部署时降级为示例数据；首页只展示 4-6 套
  async loadDaily() {
    const fallback = sample.slice(0, 6).map(item => Object.assign({ title: item.gunName + ' · ' + item.configName }, item))
    try {
      const res = await wx.cloud.callFunction({ name: 'getDaily' })
      const result = res.result || {}
      const list = (result.list || []).map(item => Object.assign({ id: item._id }, item))
      this.setData({
        daily: (list.length ? list : fallback).slice(0, 6),
        password: result.password || ''
      })
    } catch (e) {
      this.setData({ daily: fallback, password: '' })
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
