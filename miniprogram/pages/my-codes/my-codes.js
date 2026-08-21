const util = require('../../utils/util.js')

Page({
  data: {
    gunName: '',
    configName: '',
    code: '',
    list: []
  },

  onShow() {
    this.setData({ list: util.getMyCodes() })
  },

  onInput(e) {
    this.setData({ [e.currentTarget.dataset.field]: e.detail.value })
  },

  save() {
    const { gunName, configName, code } = this.data
    if (!code.trim()) {
      wx.showToast({ title: '请粘贴改枪码', icon: 'none' })
      return
    }
    util.saveMyCode({
      gunName: gunName.trim() || '未命名',
      configName: configName.trim(),
      code: code.trim()
    })
    this.setData({ list: util.getMyCodes(), gunName: '', configName: '', code: '' })
    wx.showToast({ title: '已保存', icon: 'success' })
  },

  copy(e) {
    util.copyText(e.currentTarget.dataset.code)
  },

  remove(e) {
    wx.showModal({
      title: '删除',
      content: '确定删除这条代码吗？',
      success: res => {
        if (res.confirm) {
          this.setData({ list: util.removeMyCode(e.currentTarget.dataset.id) })
        }
      }
    })
  }
})
