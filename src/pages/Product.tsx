import { lazy, Suspense, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowRight, Box, ChevronRight, ShoppingBag } from 'lucide-react'
import { useShop } from '../domain/store'
import { createConfig, readColor, sizes, type Colorway, type ShoeConfig } from '../domain/config'
import { hook, productImage, variants } from '../data/content'
import { Action, Dialog, Eyebrow, Gifts } from '../ui/Common'
import { Options } from '../studio/Fields'
import type { ViewerApi, View } from '../three/Viewer'
const Viewer = lazy(() => import('../three/Viewer'))
export default function Product() {
  const [query, setQuery] = useSearchParams(),
    color = readColor(query.get('color')) ?? 'origin'
  const [size, setSize] = useState<ShoeConfig['size']>('40'),
    [view, setView] = useState<View>('default'),
    [revision, setRevision] = useState(0),
    [macro, setMacro] = useState(false),
    viewer = useRef<ViewerApi>(null)
  const config = { ...createConfig(color), size },
    variant = variants.find((v) => v.id === color)!
  function select(v: Colorway) {
    setQuery({ color: v }, { replace: true })
  }
  return (
    <>
      <div className="wrap product-page">
        <nav className="crumbs" aria-label="当前位置">
          <Link to="/collection">COLLECTION</Link>
          <ChevronRight size={12} /> COURT 01
        </nav>
        <section className="product-layout">
          <div className="product-stage">
            <span className="product-stage-label">
              <Box size={14} /> 3D PRODUCT VIEW
            </span>
            <Suspense
              fallback={<img className="product-poster" src={productImage(color)} alt={variant.title} />}
            >
              <Viewer ref={viewer} config={config} view={view} revision={revision} />
            </Suspense>
            <div className="view-buttons">
              {(
                [
                  ['default', '3/4'],
                  ['side', 'OUTER'],
                  ['inner', 'INNER'],
                  ['sole', 'SOLE'],
                  ['tongue', 'TONGUE'],
                ] as const
              ).map(([v, label]) => (
                <button
                  key={v}
                  aria-pressed={view === v}
                  onClick={() => {
                    setView(v)
                    setRevision((x) => x + 1)
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="product-info">
            <Eyebrow>THE QUEEN’S CRAFT</Eyebrow>
            <h1 className="display">
              IDC
              <br />
              COURT 01<span className="blue">.</span>
            </h1>
            <div className="product-info-line">
              <b>{variant.name}</b>
              <span>{variant.tone}</span>
            </div>
            <p>{variant.zh}</p>
            <div className="product-swatches" aria-label="产品配色">
              {variants.map((v) => (
                <button key={v.id} aria-pressed={v.id === color} onClick={() => select(v.id)}>
                  <i style={{ background: v.chips[0] }} />
                  {v.name}
                </button>
              ))}
            </div>
            <Options label="演示尺码 / EU" items={sizes} value={size} select={setSize} />
            <Link className="action" to={'/customize?color=' + color + '&size=' + size}>
              CUSTOMIZE YOUR PAIR <ArrowRight size={16} />
            </Link>
            <button
              className="action action-outline"
              onClick={() =>
                useShop.getState().putBag(config, viewer.current?.capture('thumbnail') ?? null)
              }
            >
              <span>ADD TO DEMO BAG</span>
              <ShoppingBag size={16} />
            </button>
            <small>学生商赛拟议联名 · 尺码为演示选项</small>
            <button className="text-link" onClick={() => setMacro(true)}>
              放大鞋带与针脚细节 <ArrowRight size={14} />
            </button>
          </div>
        </section>
        {macro && (
          <Dialog title="Craft study" onClose={() => setMacro(false)}>
            <img src="/images/detail.webp" alt="概念材质特写，蓝色麂皮鞋眼、鞋带纤维与奶白色皮革针脚" />
            <p>电蓝鞋眼饰片与浅色面料相接。放大可见鞋面针脚和鞋带纤维的方向。</p>
          </Dialog>
        )}
        <div className="product-story">
          {[
            [
              'DETAILS',
              '细节由你定义',
              '低帮轮廓承托八个独立部件。鞋侧可放入你的文字或纹样，鞋舌、鞋垫、后跟与鞋底各自保留概念字标。',
            ],
            [
              'DESIGN STORY',
              '把球场带到街头',
              hook + ' 球场的转向与日常的步伐，共同决定了 COURT 01 干净的轮廓。',
            ],
            [
              'GIFT EXPERIENCE',
              '打开鞋盒的瞬间',
              '鞋盒内附一枚随机鞋带挂件和概念印签香卡。常规与隐藏款的揭晓留到开盒时。',
            ],
          ].map(([k, t, p]) => (
            <div key={k}>
              <Eyebrow>{k}</Eyebrow>
              <h2>{t}</h2>
              <p>{p}</p>
            </div>
          ))}
        </div>
      </div>
      <Gifts />
      <div className="wrap product-story-link">
        <Action to="/story" secondary>
          MEET idc.
        </Action>
      </div>
    </>
  )
}
