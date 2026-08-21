const guns = require('../../data/guns.js')
const sample = require('../../data/sample-codes.js')
const util = require('../../utils/util.js')

const CATEGORIES = ['全部', '突击步枪', '战斗步枪', '冲锋枪', '精确射手步枪', '轻机枪', '霰弹枪', '狙击步枪', '手枪']

Page({
  data: {
    query: '',
    categories: CATEGORIES,
    activeCategory: '全部',
    sections: [],
    total: 0,
    covered: 0,
    loading: true
  },

  onLoad() {
    this.load()
  },

  onPullDownRefresh() {
    this.load().finally(() => wx.stopPullDownRefresh())
  },

  // 加载全部改枪码 → 统计每把枪的方案数 → 合并到全枪械清单
  async load() {
    let codes = sample
    try {
      const res = await wx.cloud.callFunction({ name: 'getCodes' })
      if (res.result && res.result.list && res.result.list.length) {
        codes = res.result.list.map(item => Object.assign({ id: item._id }, item))
      }
    } catch (e) {
      // 云函数未部署，使用本地示例
    }

    const countMap = {}
    codes.forEach(item => {
      const key = util.normGunName(item.gunName)
      countMap[key] = (countMap[key] || 0) + 1
    })

    const all = guns.map(gun => Object.assign({}, gun, {
      key: util.normGunName(gun.name),
      count: countMap[util.normGunName(gun.name)] || 0
    }))

    this.setData({
      all,
      total: all.length,
      covered: all.filter(gun => gun.count > 0).length,
      loading: false
    })
    this.applyFilter()
  },

  applyFilter() {
    const { all, query, activeCategory } = this.data
    const q = query.trim().toLowerCase()
    const filtered = all.filter(gun => {
      const hitQuery = !q || gun.name.toLowerCase().indexOf(q) > -1
      const hitCategory = activeCategory === '全部' || gun.category === activeCategory
      return hitQuery && hitCategory
    })

    // 按分类分组
    const sections = CATEGORIES
      .filter(cat => cat !== '全部')
      .map(cat => ({
        category: cat,
        guns: filtered.filter(gun => gun.category === cat)
      }))
      .filter(section => section.guns.length)

    this.setData({ sections })
  },

  onQueryInput(e) {
    this.setData({ query: e.detail.value })
    this.applyFilter()
  },

  onCategoryTap(e) {
    this.setData({ activeCategory: e.currentTarget.dataset.value })
    this.applyFilter()
  },

  goGun(e) {
    const gun = e.currentTarget.dataset.gun
    wx.navigateTo({
      url: '/pages/gun/gun?name=' + encodeURIComponent(gun.name) + '&category=' + encodeURIComponent(gun.category)
    })
  }
})
