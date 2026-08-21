// 一键初始化：把示例改枪码导入 codes 集合，并写入当天 daily 推荐
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

exports.main = async () => {
  await ensureCollection('codes')
  await ensureCollection('daily')

  const clearedCodes = await clear('codes')
  const clearedDaily = await clear('daily')

  const codesRes = await db.collection('codes').add({ data: codes })

  // 当天推荐：取 3 条示例（M4A1 全绿 / CAR-15 任务 / M14 满改）+ 今日密码示例
  const ids = codesRes._ids || (codesRes._id ? [codesRes._id] : [])
  const dailySeed = [
    { date: today(), codeId: ids[0], title: '今日主打：新手第一把 M4A1', sort: 1, password: 'DF2026DEMO' },
    { date: today(), codeId: ids[1], title: '低战备任务款', sort: 2 },
    { date: today(), codeId: ids[7], title: '机密/绝密满改架点款', sort: 3 }
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
