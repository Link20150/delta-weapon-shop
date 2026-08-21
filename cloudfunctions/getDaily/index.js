// 每日推荐 + 今日密码：按当天日期读取 daily 集合，关联 codes 集合
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

// 云函数默认 UTC 时区，这里换算成北京时间
function today() {
  return new Date(Date.now() + 8 * 3600 * 1000).toISOString().slice(0, 10)
}

exports.main = async () => {
  const day = today()
  const dailyRes = await db.collection('daily')
    .where({ date: day })
    .orderBy('sort', 'asc')
    .limit(5)
    .get()

  const records = dailyRes.data
  let password = ''
  for (const record of records) {
    if (record.password) {
      password = record.password
      break
    }
  }

  let list = records.filter(record => record.codeId)
  if (list.length) {
    const ids = list.map(record => record.codeId)
    const codesRes = await db.collection('codes')
      .where({ _id: _.in(ids) })
      .get()
    const codeMap = {}
    codesRes.data.forEach(code => {
      codeMap[code._id] = code
    })
    list = list.map(record => {
      const code = codeMap[record.codeId] || {}
      return Object.assign(
        { title: record.title || code.gunName + ' · ' + code.configName },
        code
      )
    })
  }

  return { list, password }
}
