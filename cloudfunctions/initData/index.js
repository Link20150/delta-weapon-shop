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

// 按配置名关键字挑选每日推荐，找不到时退回兜底下标
function pickByConfig(ids, keyword, fallbackIndex) {
  const idx = codes.findIndex(item => item.configName.indexOf(keyword) > -1)
  return ids[idx >= 0 ? idx : fallbackIndex]
}

exports.main = async () => {
  await ensureCollection('codes')
  await ensureCollection('daily')

  const clearedCodes = await clear('codes')
  const clearedDaily = await clear('daily')

  const codesRes = await db.collection('codes').add({ data: codes })
  const ids = codesRes._ids || (codesRes._id ? [codesRes._id] : [])

  // 当天推荐：新手国民码 / 低价开局 / 顶配参考
  const dailySeed = [
    { date: today(), codeId: pickByConfig(ids, '国民', 0), title: '今日主打：K437 国民改枪码（新手首选）', sort: 1 },
    { date: today(), codeId: pickByConfig(ids, '全绿', 0), title: '低价开局：M4A1 全绿性价比', sort: 2 },
    { date: today(), codeId: pickByConfig(ids, '90W', 7), title: '顶配参考：M7 全距离满改', sort: 3 }
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
