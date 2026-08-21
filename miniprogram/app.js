App({
  onLaunch() {
    if (!wx.cloud) {
      console.error('当前基础库版本过低，无法使用云能力，请升级')
    } else {
      wx.cloud.init({
        env: 'cloud1-d2g7fzcmh7ede1075',
        traceUser: true
      })
    }
  },
  globalData: {
    currentCode: null // 列表页 → 详情页 传递的临时方案
  }
})
