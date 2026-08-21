const sample = require('../../data/sample-codes.js')
const util = require('../../utils/util.js')

Page({
  data: {
    query: '',
    priceLevel: '全部',
    priceLevels: ['全部', '低', '中', '高', '满改'],
    all: [],
    list: []
  },

  onLoad() {
    this.load()
  },

  // 优先走云函数 getCodes，未部署时降级为示例数据
  async load() {
    let codes = sample
    try {
      const res = await wx.cloud.callFunction({
        name: 'getCodes',
        data: { gunName: this.data.query, priceLevel: this.data.priceLevel }
      })
      if (res.result && res.result.list && res.result.list.length) {
        // 云数据库返回 _id，统一映射为 id 供收藏等本地逻辑使用
        codes = res.result.list.map(item => Object.assign({ id: item._id }, item))
      }
    } catch (e) {
      // 云函数未部署，使用本地示例
    }
    this.setData({ all: codes })
    this.applyFilter()
  },

  applyFilter() {
    const { query, priceLevel, all } = this.data
    const q = query.trim().toLowerCase()
    const list = all.filter(item => {
      const hitQuery = !q || (item.gunName || '').toLowerCase().indexOf(q) > -1
      const hitPrice = priceLevel === '全部' || item.priceLevel === priceLevel
      return hitQuery && hitPrice
    })
    this.setData({ list })
  },

  onQueryInput(e) {
    this.setData({ query: e.detail.value })
    this.applyFilter()
  },

  onPriceTap(e) {
    this.setData({ priceLevel: e.currentTarget.dataset.value })
    this.applyFilter()
  },

  goDetail(e) {
    getApp().globalData.currentCode = this.data.list[e.currentTarget.dataset.index]
    wx.navigateTo({ url: '/pages/detail/detail' })
  },

  copyCode(e) {
    util.copyText(e.currentTarget.dataset.code)
  }
})
