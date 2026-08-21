// 数据同步脚本：把新改枪码合并进 data.json，并同步生成 sample-codes.js（本地降级数据）
// 运行：node scripts/sync-data.js
const fs = require('fs')
const path = require('path')

const DATA_PATH = path.join(__dirname, '..', 'cloudfunctions', 'initData', 'data.json')
const SAMPLE_PATH = path.join(__dirname, '..', 'miniprogram', 'data', 'sample-codes.js')

// 本次新增：热门/缴获常见枪的低价方案 + 少量已有枪的高端补充
const NEW_ENTRIES = [
  // ---------- 冲锋枪 ----------
  { gunName: 'MP5', configName: '17W 大弹鼓腰射', mode: '烽火地带', priceLevel: '低', tags: ['腰射', '大弹匣'], code: 'MP5冲锋枪-烽火地带-6HLKSCC0FFIB7A6U8GMU3', reason: '50 发大弹鼓 + 满腰射，冲锋枪近战首选。' },
  { gunName: 'MP5', configName: '性价比均衡', mode: '烽火地带', priceLevel: '低', tags: ['性价比', '均衡'], code: 'MP5冲锋枪-烽火地带-6FBOCJ80AO21USGQ8AC2S', reason: 'AI 最常掉的冲锋枪之一，便宜均衡，捡到就能改。' },
  { gunName: 'MP5', configName: '修脚速攻', mode: '烽火地带', priceLevel: '低', tags: ['修脚', '近战'], code: 'MP5冲锋枪-烽火地带-6KK2T44072KGV1HBMVUTA', reason: '社区热门修脚方案，近战泼水清甲。' },
  { gunName: '勇士', configName: '性价比修脚', mode: '烽火地带', priceLevel: '低', tags: ['修脚', '性价比'], code: '勇士冲锋枪-烽火地带-6FBCN2K0AO21USGQ8AC2S', reason: '勇士满改不到 20W，修脚以小博大经典枪。' },
  { gunName: '勇士', configName: '腰射猛攻', mode: '烽火地带', priceLevel: '中', tags: ['腰射', '猛攻'], code: '勇士冲锋枪-烽火地带-6HUF9PC07Q7T5FV6P3HOV', reason: '高腰射配置，房区近战压制。' },
  { gunName: 'UZI', configName: '平民人机枪', mode: '烽火地带', priceLevel: '低', tags: ['性价比', '卡战备'], code: 'UZI冲锋枪-烽火地带-6IDNBV80FCDV4UPACJK76', reason: 'AI 人手一把，低战备卡局神器。' },
  { gunName: 'UZI', configName: '6W 跑刀款', mode: '烽火地带', priceLevel: '低', tags: ['跑刀', '超低价'], code: 'UZI冲锋枪-烽火地带-6ERL8M802JEKFSVPUH1ID', reason: '六万左右超低价，跑刀清人机够用。' },
  { gunName: '野牛', configName: '平民人机枪', mode: '烽火地带', priceLevel: '低', tags: ['性价比', '卡战备'], code: '野牛冲锋枪-烽火地带-6IDNJTC0FCDV4UPACJK76', reason: '野牛也是人机常客，便宜稳定。' },
  { gunName: 'Vector', configName: '腰射近战', mode: '烽火地带', priceLevel: '中', tags: ['腰射', '近战'], code: 'Vector冲锋枪-烽火地带-6F4UME8049H3TLFDHMKHO', reason: '高射速爆发，近身 TTK 极短。' },
  { gunName: 'Vector', configName: '修脚师傅', mode: '烽火地带', priceLevel: '中', tags: ['修脚', '近战'], code: 'Vector冲锋枪-烽火地带-6EU7F24092SAL51E9I4V4', reason: '社区修脚经典方案，贴脸泼水。' },
  { gunName: 'QCQ171', configName: '性价比稳定', mode: '烽火地带', priceLevel: '中', tags: ['性价比', '稳定'], code: 'QCQ171冲锋枪-烽火地带-6F1OU9K00ES0HEAQBTB8O', reason: '九毫米全能冲锋枪，稳定为主好上手。' },
  { gunName: 'QCQ171', configName: 'S9 数值怪', mode: '烽火地带', priceLevel: '高', tags: ['高射速', '版本热门'], code: 'QCQ171冲锋枪-烽火地带-6KKP80K0AE34MKRH77QH2', reason: '版本强势数值怪，隐藏高手枪。' },

  // ---------- 突击步枪 ----------
  { gunName: 'M16A4', configName: '30W 中配架枪', mode: '烽火地带', priceLevel: '中', tags: ['架枪', '性价比'], code: 'M16A4突击步枪-烽火地带-6GRAJQS0AV5BVPK0VDMCD', reason: '三连发架枪稳，中距离抽人。' },
  { gunName: 'M16A4', configName: '性价比三连', mode: '烽火地带', priceLevel: '中', tags: ['性价比', '稳定'], code: 'M16A4突击步枪-烽火地带-6FKTF8S08SMDJNDBRING6', reason: 'AR 碳纤维枪管组合，性价比之选。' },
  { gunName: 'AKS-74U', configName: '6W 穷鬼流', mode: '烽火地带', priceLevel: '低', tags: ['超低价', '新手友好'], code: 'AKS-74U突击步枪-烽火地带-6IF9CIC08C3ND23MR2PJT', reason: '六万搞定，新手枪满改也不贵。' },
  { gunName: 'AKS-74U', configName: '穷鬼高机动', mode: '烽火地带', priceLevel: '低', tags: ['性价比', '机动'], code: 'AKS-74U突击步枪-烽火地带-6G68E780223NGCLVVEN6F', reason: '高机动穷鬼流，便宜好改。' },

  // ---------- 战斗步枪 ----------
  { gunName: 'M7', configName: '60W 消音款', mode: '烽火地带', priceLevel: '高', tags: ['消音', '稳定'], code: 'M7战斗步枪-烽火地带-6H57F9S07ODLT6ETQT3GS', reason: '主播自用消音款，中距离稳定输出。' },

  // ---------- 霰弹枪 ----------
  { gunName: 'S12K', configName: '14W 龙息撞火', mode: '烽火地带', priceLevel: '低', tags: ['龙息', '近战'], code: 'S12K霰弹枪-烽火地带-6G1SNE80FFE99JTURSM3N', reason: '撞火全自动喷子，室内近战神器。' },
  { gunName: 'S12K', configName: '满改稳定', mode: '烽火地带', priceLevel: '高', tags: ['满改', '稳定'], code: 'S12K霰弹枪-烽火地带-6F2Q4BS05J350JT52M6KS', reason: '满改 S12K，贴脸高容错。' },
  { gunName: 'M1014', configName: '龙息半自动', mode: '烽火地带', priceLevel: '低', tags: ['龙息', '近战'], code: 'M1014霰弹枪-烽火地带-6G1SOB00FFE99JTURSM3N', reason: '半自动喷子配龙息弹，一喷一片。' },
  { gunName: 'M870', configName: '独头弹当狙', mode: '烽火地带', priceLevel: '低', tags: ['独头弹', '娱乐'], code: 'M870霰弹枪-烽火地带-6I9PQ5G0DHJI9D4R1B6S9', reason: '泵动喷上独头弹，当狙打很欢乐。' },
  { gunName: '725双管', configName: '龙息双管', mode: '烽火地带', priceLevel: '低', tags: ['龙息', '近战'], code: '725双管霰弹枪-烽火地带-6G1T6T40FFE99JTURSM3N', reason: '双管一枪两发，龙息贴脸爆发。' },

  // ---------- 轻机枪 ----------
  { gunName: 'M249', configName: '16W 性价比', mode: '烽火地带', priceLevel: '低', tags: ['性价比', '压制'], code: 'M249轻机枪-烽火地带-6GNSCAO0AF4S5M89JL73J', reason: '十万出头弹链压制，火力猛。' },
  { gunName: 'M249', configName: '高稳满改', mode: '烽火地带', priceLevel: '高', tags: ['满改', '稳定'], code: 'M249轻机枪-烽火地带-6FPL95O08SMDJNDBRING6', reason: '高射速满改，架点火力压制。' },
  { gunName: 'M250', configName: '满改输出', mode: '烽火地带', priceLevel: '高', tags: ['满改', '压制'], code: 'M250通用机枪-烽火地带-6FOB3JC09SED7S8MV8LJ8', reason: '6.8 全威力弹链，压制力强。' },
  { gunName: 'M250', configName: '低配压制', mode: '烽火地带', priceLevel: '中', tags: ['性价比', '压制'], code: 'M250通用机枪-烽火地带-6FOB61409SED7S8MV8LJ8', reason: '低配 M250，便宜压制。' },

  // ---------- 精确射手步枪 ----------
  { gunName: 'Mini-14', configName: '33W 半改', mode: '烽火地带', priceLevel: '中', tags: ['半改', '性价比'], code: 'Mini-14射手步枪-烽火地带-6I9000G0CDPA9S5AJN1SN', reason: '小口径半自动射手步枪，后座小。' },
  { gunName: 'VSS', configName: '27W 消音', mode: '烽火地带', priceLevel: '中', tags: ['消音', '射手'], code: 'VSS射手步枪-烽火地带-6I8VU7S0CDPA9S5AJN1SN', reason: '自带消音，亚音速弹隐蔽输出。' },
  { gunName: 'PSG-1', configName: '40W 高精', mode: '烽火地带', priceLevel: '高', tags: ['高精度', '架点'], code: 'PSG-1射手步枪-烽火地带-6HCM8UK0285EKE7L5LPSH', reason: '主播自用高精度射手步枪，远点架枪。' },

  // ---------- 狙击步枪 ----------
  { gunName: 'SV-98', configName: '17W 性价比', mode: '烽火地带', priceLevel: '低', tags: ['性价比', '消音'], code: 'SV-98狙击步枪-烽火地带-6KJG6RO0AO21USGQ8AC2S', reason: '栓动狙性价比首选，配消音六倍镜。' },
  { gunName: 'R93', configName: '29W 架点', mode: '烽火地带', priceLevel: '中', tags: ['架点', '狙击'], code: 'R93狙击步枪-烽火地带-6KJG5MO0AO21USGQ8AC2S', reason: '直拉栓手感好，中远距离架点。' },
  { gunName: 'AWM', configName: '60W 顶配', mode: '烽火地带', priceLevel: '高', tags: ['满改', '狙击'], code: 'AWM狙击步枪-烽火地带-6GCOMIO03HDN3EE1QTI4I', reason: '栓动天花板，一枪一个小朋友。' },
  { gunName: 'M700', configName: '60W 高精度', mode: '烽火地带', priceLevel: '高', tags: ['高精度', '架点'], code: 'M700狙击步枪-烽火地带-6FG5OGC051CKRTT084FIR', reason: '高据枪稳定性，适合长时间埋伏。' },

  // ---------- 手枪 ----------
  { gunName: 'G18', configName: '9W 速切近战', mode: '烽火地带', priceLevel: '低', tags: ['速切', '近战'], code: 'G18-烽火地带-6G941RG08OPOB8QKQ72I8', reason: '全自动手枪，九万快切瞬秒。' },
  { gunName: 'G18', configName: '跑刀双修', mode: '烽火地带', priceLevel: '低', tags: ['跑刀', '修脚'], code: 'G18-烽火地带-6KAAP3C0FCDV4UPACJK76', reason: '卡战备跑刀，兼修脚。' },
  { gunName: '93R', configName: '三连防身', mode: '烽火地带', priceLevel: '低', tags: ['防身', '跑刀'], code: '93R-烽火地带-6KAAR8G0FCDV4UPACJK76', reason: '三连发手枪，跑刀防身够用。' },
  { gunName: '沙漠之鹰', configName: '大威力防身', mode: '烽火地带', priceLevel: '中', tags: ['防身', '高伤害'], code: '沙漠之鹰-烽火地带-6KAATQS0FCDV4UPACJK76', reason: '沙鹰一发入魂，防身打架都行。' },
  { gunName: 'M1911', configName: '12W 跑刀必备', mode: '烽火地带', priceLevel: '低', tags: ['跑刀', '性价比'], code: 'M1911-烽火地带-6IT12MG066MHHVC5Q80C6', reason: '经典.45 手枪，跑刀必备。' },

  // ---------- 已有枪的高端补充 ----------
  { gunName: 'AS Val', configName: '50W 满配', mode: '烽火地带', priceLevel: '高', tags: ['消音', '近战'], code: 'AS Val突击步枪-烽火地带-6GCI31407ODLT6ETQT3GS', reason: '巨浪高配，亚音速弹近距离碎甲。' },
  { gunName: '腾龙', configName: '50W 顶配', mode: '烽火地带', priceLevel: '高', tags: ['顶配', '输出'], code: '腾龙突击步枪-烽火地带-6GVGL640BUSDVQP3857JE', reason: '国产新贵，高速导气输出拉满。' },
  { gunName: 'ASh-12', configName: '50W 全距离', mode: '烽火地带', priceLevel: '高', tags: ['高伤害', '近战'], code: 'ASh-12战斗步枪-烽火地带-6GH3908064HLT38PTSGJ8', reason: '12.7 大口径，近身玻璃大炮。' },

  // ---------- 第二批：再补常见枪 ----------
  { gunName: 'SKS', configName: '27W 任务性价比', mode: '烽火地带', priceLevel: '中', tags: ['性价比', '任务'], code: 'SKS射手步枪-烽火地带-6K3VMFC02JEKFSVPUH1ID', reason: '裸枪便宜，随便加配件就强，任务首选。' },
  { gunName: 'SKS', configName: '40W 高改', mode: '烽火地带', priceLevel: '高', tags: ['高改', '稳定'], code: 'SKS射手步枪-烽火地带-6I8VT3G0CDPA9S5AJN1SN', reason: '高改 SKS，中远距离稳定输出。' },
  { gunName: 'G17', configName: '17W 均衡', mode: '烽火地带', priceLevel: '低', tags: ['均衡', '防身'], code: 'G17-烽火地带-6GDORHK02QIKBV894R7VJ', reason: '经典格洛克，改完均衡好用。' },
  { gunName: 'M82', configName: '54W 巴雷特', mode: '烽火地带', priceLevel: '高', tags: ['高伤害', '狙击'], code: 'M82狙击步枪-烽火地带-6JQDU6004H4GQ81AC9BHK', reason: '.50 巴雷特，超远距离一枪秒。' },
  { gunName: 'M82', configName: 'S9 最优满改', mode: '烽火地带', priceLevel: '满改', tags: ['满改', '狙击'], code: 'M82狙击步枪-烽火地带-6JPH8KG0AO21USGQ8AC2S', reason: '7 级弹头胸一枪，栓狙完全体。' },
  { gunName: 'QJB-201', configName: '60W 满腰射', mode: '烽火地带', priceLevel: '满改', tags: ['满改', '腰射'], code: 'QJB201轻机枪-烽火地带-6I58410080ELE0AQVMCG8', reason: '二〇式机枪满改，腰射压制。' },
  { gunName: 'QJB-201', configName: '44W 超稳准满改', mode: '烽火地带', priceLevel: '高', tags: ['稳定', '性价比'], code: 'QJB201轻机枪-烽火地带-6JM9KF403738D9RRHMANH', reason: '被低估的国产机枪，稳到离谱。' },
  { gunName: 'FS12', configName: '16W 龙息青春版', mode: '烽火地带', priceLevel: '低', tags: ['龙息', '修脚'], code: 'FS-12霰弹枪-烽火地带-6JJS7SG0795T68O5KKDOU', reason: '十六万以小博大，两枪送走六套。' },
  { gunName: 'FS12', configName: '龙息近战', mode: '烽火地带', priceLevel: '低', tags: ['龙息', '近战'], code: 'FS-12霰弹枪-烽火地带-6JJ8R0G092SAL51E9I4V4', reason: '龙息 FS-12，室内一喷一片。' },
  { gunName: 'SR9', configName: '9W 入门', mode: '烽火地带', priceLevel: '低', tags: ['超低价', '新手'], code: 'SR9射手步枪-烽火地带-6I8VQM00CDPA9S5AJN1SN', reason: '九万入门射手步枪，便宜好改。' }
]

const guns = require(path.join(__dirname, '..', 'miniprogram', 'data', 'guns.js'))
const norm = name => String(name || '').toLowerCase().replace(/[\s\-·「」]/g, '')

function validate(entries) {
  const codes = new Set()
  const names = new Set()
  const errors = []
  entries.forEach((item, i) => {
    if (!item.code || item.code.indexOf('烽火地带-') < 0) {
      errors.push(`第 ${i + 1} 条码格式异常：${item.gunName} ${item.configName}`)
    }
    if (codes.has(item.code)) {
      errors.push(`改枪码重复：${item.code}`)
    }
    codes.add(item.code)
    if (!guns.some(g => norm(g.name) === norm(item.gunName))) {
      errors.push(`枪名不在枪械清单：${item.gunName}`)
    }
    if (names.has(item.gunName + '|' + item.configName)) {
      errors.push(`配置名重复：${item.gunName} ${item.configName}`)
    }
    names.add(item.gunName + '|' + item.configName)
  })
  if (errors.length) {
    console.error(errors.join('\n'))
    process.exit(1)
  }
}

const existing = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'))
const byCode = new Map(existing.map(item => [item.code, item]))
let added = 0
NEW_ENTRIES.forEach(item => {
  if (!byCode.has(item.code)) {
    byCode.set(item.code, item)
    added++
  }
})
const merged = Array.from(byCode.values())

validate(merged)

fs.writeFileSync(DATA_PATH, JSON.stringify(merged, null, 2) + '\n', 'utf8')

const sample = merged.map((item, i) => Object.assign({ id: 's' + (i + 1) }, item))
const sampleContent =
  '// 本地降级数据：云数据库不可用时的兜底数据。\n' +
  '// 与 cloudfunctions/initData/data.json 同步，由 scripts/sync-data.js 生成。\n' +
  '// 本工具仅收录「烽火地带」模式的改枪方案。\n' +
  'module.exports = ' + JSON.stringify(sample, null, 2) + '\n'
fs.writeFileSync(SAMPLE_PATH, sampleContent, 'utf8')

console.log(`合并完成：原 ${existing.length} 条 + 新增 ${added} 条 = ${merged.length} 条；sample-codes.js 已同步。`)
