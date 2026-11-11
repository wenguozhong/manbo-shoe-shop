import { Action, Eyebrow, Gifts } from '../ui/Common'
import { hook, notice, slogan } from '../data/content'

export function Story() {
  return (
    <>
      <section className="wrap page-space story-top">
        <Eyebrow>THE STORY / idc.</Eyebrow>
        <h1 className="display page-title">
          Sport is the start.
          <br />
          <em>Style is yours.</em>
        </h1>
        <p className="intro-cn">我们以低帮板鞋为画布，把球场上的行动力带入日常穿搭。</p>
        <img className="article-hero" src="/images/hero.webp" alt="球场上的匿名网球运动员" />
      </section>
      <div className="wrap story-detail">
        <Eyebrow>THE QUEEN’S CRAFT</Eyebrow>
        <div>
          <h2>{hook}</h2>
          <p>
            idc. 是高中商赛中的概念品牌，面向 16–35 岁热爱运动与街头穿搭的人。我们从三个设计问题开始。
          </p>
          <h3>运动离开球场后，还留下什么？</h3>
          <p>
            判断方向、寻找节奏、一次次重新开始。这些经验也发生在每天的穿衣选择里。idc.
            希望让穿着者参与设计，用自己选择的颜色和细节表达态度。
          </p>
          <h3>为什么是低帮板鞋？</h3>
          <p>
            平整的侧片足以容纳一行字，低帮轮廓又能和日常衣物自然衔接。我们从侧面草图开始搭建鞋体，再把鞋舌、鞋带和鞋底分别做成可以操作的部件。
          </p>
          <h3>为什么提出郑钦文联名概念？</h3>
          <p>
            我们以网球竞技中持续突破的精神为灵感，把郑钦文列为拟议合作对象。页面上的联名字标、鞋舌字样、收藏挂件和配色均为学生提案中的原创概念视觉。
          </p>
          <blockquote>{slogan}</blockquote>
          <Action to="/customize">DESIGN YOUR PAIR</Action>
        </div>
      </div>
      <Gifts />
    </>
  )
}
export function Notice() {
  return (
    <section className="wrap page-space legal">
      <Eyebrow>CONCEPT NOTICE</Eyebrow>
      <h1 className="display page-title">
        About this <em>concept.</em>
      </h1>
      <h2>品牌与联名</h2>
      <p>
        {notice} IDC COURT
        01、三款配色、挂件与香卡均为创意展示。人物场景使用原创概念图像。鞋舌的字体选项是为本项目绘制的概念字样。
      </p>
      <h2>作品与数据</h2>
      <p>
        工作室在你的浏览器中处理配置和图案。保存的方案、缩略图和演示购物袋使用本地存储；清除站点数据会移除这些记录。可下载
        JSON 文件备份，也可导出预览 PNG。
      </p>
      <h2>演示购物袋</h2>
      <p>
        尺码是搭配演示选项。价格、库存和生产规格有待确定。本站仅展示概念购物流程，所有设计均可在购买环节之前自由体验。
      </p>
      <h2 id="contact">联系与用途</h2>
      <p>本项目用于学生商赛评审。素材使用或合作咨询请通过向你展示本项目的参赛团队联系。</p>
      <p lang="en">
        Student business competition concept. Proposed collaboration only. Not an official product or
        endorsement.
      </p>
    </section>
  )
}
