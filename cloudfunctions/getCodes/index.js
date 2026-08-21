// 改枪码列表：支持枪名模糊搜索 + 预算档位筛选（仅烽火地带）
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event) => {
  const { gunName = '', priceLevel = '全部', page = 0, pageSize = 100 } = event
  const where = {}
  where.mode = '烽火地带'

  if (priceLevel && priceLevel !== '全部') {
    where.priceLevel = priceLevel
  }
  if (gunName && gunName.trim()) {
    where.gunName = db.RegExp({
      regexp: gunName.trim(),
      options: 'i'
    })
  }

  const res = await db.collection('codes')
    .where(where)
    .skip(page * pageSize)
    .limit(pageSize)
    .get()

  return { list: res.data }
}
