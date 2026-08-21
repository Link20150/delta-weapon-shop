// 复制文本到剪贴板
function copyText(text) {
  wx.setClipboardData({
    data: text || '',
    success() {
      wx.showToast({ title: '已复制', icon: 'success' })
    }
  })
}

// ---------- 收藏（本地缓存） ----------
const FAV_KEY = 'df_favorites'

function getFavorites() {
  return wx.getStorageSync(FAV_KEY) || []
}

function isFavorite(codeId) {
  return getFavorites().indexOf(codeId) > -1
}

function addFavorite(codeId) {
  const list = getFavorites()
  if (list.indexOf(codeId) === -1) {
    list.unshift(codeId)
    wx.setStorageSync(FAV_KEY, list)
  }
}

function removeFavorite(codeId) {
  const list = getFavorites().filter(id => id !== codeId)
  wx.setStorageSync(FAV_KEY, list)
}

// ---------- 我的代码（本地缓存） ----------
const MY_CODES_KEY = 'df_my_codes'

function getMyCodes() {
  return wx.getStorageSync(MY_CODES_KEY) || []
}

function saveMyCode(item) {
  const list = getMyCodes()
  list.unshift(Object.assign({ id: Date.now().toString() }, item))
  wx.setStorageSync(MY_CODES_KEY, list)
  return list
}

function removeMyCode(id) {
  const list = getMyCodes().filter(item => item.id !== id)
  wx.setStorageSync(MY_CODES_KEY, list)
  return list
}

module.exports = {
  copyText,
  getFavorites,
  isFavorite,
  addFavorite,
  removeFavorite,
  getMyCodes,
  saveMyCode,
  removeMyCode
}
