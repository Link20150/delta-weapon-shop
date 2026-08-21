const sample = require('../../data/sample-codes.js')
const util = require('../../utils/util.js')

Page({
  data: {
    gunName: '',
    category: '',
    img: '',
    list: [],
    loading: true
  },

  onLoad(options) {
    this.setData({
      gunName: options.name || '',
      category: options.category || '',
      img: util.gunImg(options.name || '')
    })
    wx.setNavigationBarTitle({ title: options.name || '枪械方案' })
    this.load()
  },

  // 优先走云函数 getCodes，未部署时降级为本地示例数据
  async load() {
    const { gunName } = this.data
    const want = util.normGunName(gunName)
    let codes = sample.filter(item => util.normGunName(item.gunName) === want)
    try {
      const res = await wx.cloud.callFunction({
        name: 'getCodes',
        data: { gunName }
      })
      const cloudList = (res.result && res.result.list) || []
      if (cloudList.length) {
        codes = cloudList
          .filter(item => util.normGunName(item.gunName) === want)
          .map(item => Object.assign({ id: item._id }, item))
      }
    } catch (e) {
      // 云函数未部署，使用本地示例
    }
    const decorated = codes.map(item => Object.assign({}, item, { img: util.gunImg(item.gunName) }))
    this.setData({ list: decorated, loading: false })
  },

  goDetail(e) {
    getApp().globalData.currentCode = e.currentTarget.dataset.item
    wx.navigateTo({ url: '/pages/detail/detail' })
  },

  copyCode(e) {
    util.copyText(e.currentTarget.dataset.code)
  },

  goRecommend() {
    wx.switchTab({ url: '/pages/recommend/recommend' })
  }
})
