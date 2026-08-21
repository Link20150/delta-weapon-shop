const sample = require('../../data/sample-codes.js')

Page({
  data: {
    difficulties: ['普通', '机密', '绝密'],
    priceLevels: ['低', '中', '高', '满改'],
    tags: ['性价比', '压枪', '架点', '高射速', '新手友好'],
    tagOptions: [],
    mode: '烽火地带', // 本工具仅支持烽火地带，固定不展示
    difficulty: '',
    priceLevel: '',
    selectedTags: [],
    result: [],
    submitted: false
  },

  onLoad() {
    this.refreshTagOptions()
  },

  onDifficulty(e) {
    this.setData({ difficulty: e.currentTarget.dataset.value })
  },

  onPrice(e) {
    this.setData({ priceLevel: e.currentTarget.dataset.value })
  },

  onTag(e) {
    const tag = e.currentTarget.dataset.value
    const selected = this.data.selectedTags
    const index = selected.indexOf(tag)
    if (index > -1) {
      selected.splice(index, 1)
    } else {
      selected.push(tag)
    }
    this.setData({ selectedTags: selected.slice() })
    this.refreshTagOptions()
  },

  // WXML 表达式不支持函数调用，预先计算每个标签的选中状态
  refreshTagOptions() {
    this.setData({
      tagOptions: this.data.tags.map(tag => ({
        name: tag,
        active: this.data.selectedTags.indexOf(tag) > -1
      }))
    })
  },

  async submit() {
    const { mode, priceLevel, selectedTags } = this.data
    if (!mode || !priceLevel) {
      wx.showToast({ title: '请选择模式和预算', icon: 'none' })
      return
    }
    try {
      const res = await wx.cloud.callFunction({
        name: 'recommend',
        data: { mode, priceLevel, tags: selectedTags }
      })
      const list = (res.result && res.result.list) || []
      this.setData({
        result: list.map(item => Object.assign({ id: item._id }, item)),
        submitted: true
      })
    } catch (e) {
      // 云函数未部署，降级为本地简单过滤
      this.setData({ result: this.localFilter(), submitted: true })
    }
  },

  localFilter() {
    const { priceLevel, selectedTags } = this.data
    return sample
      .filter(item => item.priceLevel === priceLevel)
      .map(item => {
        const hit = (item.tags || []).filter(t => selectedTags.indexOf(t) > -1).length
        return Object.assign({ score: hit }, item)
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
  },

  goDetail(e) {
    getApp().globalData.currentCode = this.data.result[e.currentTarget.dataset.index]
    wx.navigateTo({ url: '/pages/detail/detail' })
  }
})
