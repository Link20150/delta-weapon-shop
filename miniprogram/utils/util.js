// 复制文本到剪贴板
function copyText(text) {
  wx.setClipboardData({
    data: text || '',
    success() {
      wx.showToast({ title: '已复制', icon: 'success' })
    }
  })
}

// 枪名归一化：去空格/连字符/点号等，统一小写，用于匹配
function normGunName(name) {
  return String(name || '').toLowerCase().replace(/[\s\-·「」]/g, '')
}

// 分类 → 枪械贴图文件
const CATEGORY_IMG = {
  '突击步枪': 'ar',
  '战斗步枪': 'br',
  '冲锋枪': 'smg',
  '精确射手步枪': 'dmr',
  '轻机枪': 'lmg',
  '霰弹枪': 'shotgun',
  '狙击步枪': 'sniper',
  '手枪': 'pistol'
}

// 根据枪名返回枪械贴图路径（找不到时用突击步枪图兜底）
function gunImg(gunName) {
  const guns = require('../data/guns.js')
  const key = normGunName(gunName)
  const gun = guns.find(g => normGunName(g.name) === key)
  const catKey = gun ? (CATEGORY_IMG[gun.category] || 'ar') : 'ar'
  return '/images/weapons/' + catKey + '.svg'
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
  normGunName,
  gunImg,
  getFavorites,
  isFavorite,
  addFavorite,
  removeFavorite,
  getMyCodes,
  saveMyCode,
  removeMyCode
}
