// 一键初始化：把改枪码导入 codes 集合，并写入当天 daily 推荐
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const codes = require('./data.json')

function today() {
  return new Date(Date.now() + 8 * 3600 * 1000).toISOString().slice(0, 10)
}

async function clear(collectionName) {
  const coll = db.collection(collectionName)
  let removed = 0
  while (removed < 1000) {
    const res = await coll.where({}).limit(20).remove()
    const count = res.stats && res.stats.removed
    if (!count) break
    removed += count
  }
  return removed
}

async function ensureCollection(name) {
  try {
    await db.createCollection(name)
  } catch (e) {
    // 已存在时创建会报错，忽略即可
  }
}

// 按配置名精确挑选每日推荐（避免同名关键字误配）
function pickByConfigName(name) {
  const idx = codes.findIndex(item => item.configName === name)
  return idx >= 0 ? ids[idx] : null
}

let ids = []

exports.main = async () => {
  await ensureCollection('codes')
  await ensureCollection('daily')

  const clearedCodes = await clear('codes')
  const clearedDaily = await clear('daily')

  const codesRes = await db.collection('codes').add({ data: codes })
  ids = codesRes._ids || (codesRes._id ? [codesRes._id] : [])

  // 当天推荐：新手国民码 / 低价开局 / 超低价上手 / 高伤害低预算 / 顶配参考
  const dailySeed = [
    { date: today(), codeId: pickByConfigName('27W 红点国民码'), title: '今日主打：K437 红点国民码（新手首选）', sort: 1 },
    { date: today(), codeId: pickByConfigName('全绿性价比'), title: '低价开局：M4A1 全绿性价比', sort: 2 },
    { date: today(), codeId: pickByConfigName('3W 职业青春版'), title: '超低价上手：KC17 职业青春版', sort: 3 },
    { date: today(), codeId: pickByConfigName('20W 丐版颗秒'), title: '高伤害低预算：AKM 20W 颗秒', sort: 4 },
    { date: today(), codeId: pickByConfigName('90W 全距离满改'), title: '顶配参考：M7 全距离满改', sort: 5 }
  ]
  await db.collection('daily').add({ data: dailySeed })

  return {
    ok: true,
    clearedCodes,
    clearedDaily,
    importedCodes: codes.length,
    daily: dailySeed.length
  }
}
