// 条件推荐：按预算档位过滤（仅烽火地带），按偏好标签命中数打分，取 Top N
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event) => {
  const { priceLevel = '', tags = [], limit = 5 } = event
  const where = {}
  where.mode = '烽火地带'

  if (priceLevel) {
    where.priceLevel = priceLevel
  }

  const res = await db.collection('codes')
    .where(where)
    .limit(100)
    .get()

  const list = res.data
    .map(item => {
      const score = (item.tags || []).filter(tag => tags.indexOf(tag) > -1).length
      return Object.assign({ score }, item)
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)

  return { list }
}
