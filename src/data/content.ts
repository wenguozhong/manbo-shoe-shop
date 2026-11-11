import type { Colorway } from '../domain/config'

export const series = 'THE QUEEN’S CRAFT'
export const slogan =
  'Sport is the start. Style is yours. No permission needed — just be unapologetically yourself.'
export const hook = 'Meet the Queen’s craft — built for play, made to collect.'
export const notice = '学生商赛概念项目。与郑钦文的联名尚属提案，不代表官方授权或销售。'
export const variants: {
  id: Colorway
  name: string
  tone: string
  title: string
  zh: string
  chips: string[]
  filter: string
}[] = [
  {
    id: 'origin',
    name: 'ORIGIN',
    tone: 'Bone / Chalk',
    title: '骨白与粉笔灰',
    zh: '保留帆布般的底色，让鞋侧的第一笔属于你。',
    chips: ['#eae7db', '#cac5b7', '#292b2a'],
    filter: 'LIGHT',
  },
  {
    id: 'volt',
    name: 'VOLT',
    tone: 'Electric / Cobalt',
    title: '电蓝与钴蓝',
    zh: '用一整片电蓝记录击球瞬间，浅色侧片划出转向的轨迹。',
    chips: ['#1533e8', '#162776', '#eef0ec'],
    filter: 'BLUE',
  },
  {
    id: 'shadow',
    name: 'SHADOW',
    tone: 'Graphite / Ash',
    title: '石墨与灰烬',
    zh: '深灰鞋身衔接浅灰杯底，留一小块蓝色给街角的侧光。',
    chips: ['#282b30', '#c8c9c6', '#41519e'],
    filter: 'DARK',
  },
]
export const productImage = (color: Colorway) => '/images/court-01-' + color + '.webp'
export const articles = [
  {
    id: 'beyond-the-lines',
    category: 'CULTURE',
    title: 'Beyond the lines.',
    kicker: '界线之外',
    image: '/images/journal-court.webp',
    alt: '场地上纵横相交的网球场线',
    paras: [
      '球场边线有两种读法。比赛时，它给每一球判定落点。散场后，白线穿过水泥地，和人行道边缘、斑马线以及街角台阶连成另一张地图。我们从这两种尺度之间寻找 COURT 01 的起点。',
      '把竞技感放进日常穿搭，并不需要复制比赛服。鞋身外侧的弧线取自挥拍后的回转，鞋底的横向分层则像脚下稍纵即逝的场线。它们在走路时才形成完整的节奏。',
      '这份学生品牌提案把球场看作一个起点。下一步走向哪条街，留给每个穿鞋的人自己决定。',
    ],
  },
  {
    id: 'making-court-01',
    category: 'PROCESS',
    title: 'The making of Court 01.',
    kicker: '从轮廓到针脚',
    image: '/images/detail.webp',
    alt: '概念低帮板鞋的材质和针脚局部',
    paras: [
      '第一张草图只画侧面。我们用一条连续的线连接鞋头、鞋舌和后跟，再用一条更平的线收住鞋底。线条之间留出的面积，决定了脚背的体量，也决定鞋侧能留下多少表达空间。',
      '进入三维工作室后，同一双鞋被拆成八个可编辑部件。将鞋头换成麂皮效果，侧面的光立即变软。给中底换一种颜色，原本显轻的轮廓也会显得更厚。',
      '最后才轮到文字。把图案缩到足够小，从半步之外看它是否仍然清晰。能经得起这一步的细节，才进入我们的概念鞋款。',
    ],
  },
  {
    id: 'your-pair-your-story',
    category: 'STYLE',
    title: 'Your pair, your story.',
    kicker: '留下自己的记号',
    image: '/images/journal-style.webp',
    alt: '城市日常穿搭与低帮鞋',
    paras: [
      '从衣柜里选一件经常穿的外套，记下它最不显眼的一种颜色。让这种颜色出现在鞋带上，再让中底延续裤脚的明度。一双原本独立的鞋，就有了进入日常穿搭的理由。',
      '鞋侧的文字也可以很小。一个地名、一组数字，或是只有朋友认识的缩写，都足够成为设计的中心。试着把文字从外侧移到内侧，观察图案如何从宣言变成私人的记号。',
      '完成后保存两个版本，把并排的效果图放在一起。有时最终被选中的，是那双只改动了一个细节的鞋。',
    ],
  },
]
export type Article = (typeof articles)[number]
export const giftNames = ['RALLY', 'MOTION', 'CROWN', 'SPARK', 'STAR', 'HIDDEN 01', 'HIDDEN 02']
export const productNotes = [
  {
    label: 'IDENTITY',
    title: '把鞋侧留给自己。',
    body: '一块连续的侧片，容纳文字、纹样与颜色。内外侧可以分别决定你想展示的方向。',
  },
  {
    label: 'CRAFT',
    title: '让光落在不同材质上。',
    body: '皮革、织物、麂皮与合成材质各有光泽。高级模式可以对照平面印花和带线迹的刺绣。',
  },
  {
    label: 'DETAILS',
    title: '翻过来，还有一面。',
    body: '概念组合字标位于鞋舌与鞋底；后跟及鞋垫保留 idc. 字标，鞋舌内侧可选概念字样。',
  },
]
