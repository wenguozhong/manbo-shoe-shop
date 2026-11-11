import { lazy, Suspense, useCallback, useLayoutEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  ArrowRight,
  ArrowLeft,
  ArrowUpRight,
  Bookmark,
  Box,
  Check,
  ChevronRight,
  Download,
  FileJson,
  FolderOpen,
  Move3d,
  RotateCcw,
  Share2,
  ShoppingBag,
} from 'lucide-react'
import {
  createConfig,
  configSummary,
  readColor,
  sizes,
  type PartId,
  type ShoeConfig,
} from '../domain/config'
import { useShop } from '../domain/store'
import { Dialog, Eyebrow } from '../ui/Common'
import { notice } from '../data/content'
import { download, exportJson, fileName, importJson } from '../lib/files'
import { BasePanel, DetailsPanel, PersonalPanel, ConfigTable } from './Panels'
import type { ViewerApi, View } from '../three/Viewer'

const Viewer = lazy(() => import('../three/Viewer'))
const steps = [
  ['BASE', '基础选择'],
  ['DETAILS', '鞋带与细节'],
  ['PERSONALIZE', '自由表达'],
  ['REVIEW', '方案总览'],
]
export default function Studio() {
  const config = useShop((s) => s.config),
    configure = useShop((s) => s.configure),
    notify = useShop((s) => s.notify)
  const [query] = useSearchParams(),
    navigate = useNavigate(),
    editId = query.get('edit') ?? undefined
  const [step, setStep] = useState(0),
    [selected, setSelected] = useState<PartId | null>('upper'),
    [view, setView] = useState<View>('default'),
    [revision, reframe] = useState(0)
  const [missing, setMissing] = useState<PartId[]>([]),
    [reset, setReset] = useState(false),
    [shareText, setShareText] = useState(''),
    [added, setAdded] = useState(false),
    [comparing, setComparing] = useState(false)
  const currentEntry = useRef<string | null>(null),
    viewer = useRef<ViewerApi>(null),
    fileInput = useRef<HTMLInputElement>(null),
    panel = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    const queryKey = query.toString()
    if (currentEntry.current === queryKey) return
    currentEntry.current = queryKey
    const store = useShop.getState(),
      color = query.get('color'),
      design = query.get('design'),
      edit = query.get('edit')
    if (!color && !edit && !design) return
    const next = edit
      ? store.bag.find((x) => x.id === edit)?.config
      : design
        ? store.designs.find((x) => x.id === design)?.config
        : createConfig(readColor(color))
    if (next) {
      const size = sizes.find((s) => s === query.get('size'))
      store.configure({ ...structuredClone(next), size: !edit && !design && size ? size : next.size })
      setStep(0)
      setSelected('upper')
      setView('default')
      setAdded(false)
    } else store.notify('这份方案在当前浏览器中不存在。')
    if (!edit || !next) navigate('/customize', { replace: true })
  }, [query, navigate])
  function update(patch: Partial<ShoeConfig>) {
    configure({ ...useShop.getState().config, ...patch })
    setAdded(false)
    if (patch.placement) changeView(patch.placement === 'inner' ? 'inner' : 'side')
  }
  function changeView(v: View) {
    setView(v)
    reframe((n) => n + 1)
  }
  function go(n: number) {
    setStep(n)
    panel.current?.scrollTo({ top: 0 })
    if (n === 2) changeView('side')
    if (n === 3) {
      setSelected(null)
      changeView('default')
    }
  }
  function choose(p: PartId | null) {
    setSelected(p)
    if (p) setStep(0)
  }
  const onMissing = useCallback((parts: PartId[]) => setMissing(parts), [])
  const thumbnail = () => viewer.current?.capture('thumbnail') ?? null
  function save() {
    useShop.getState().saveDesign(config, thumbnail())
  }
  function png() {
    const url = viewer.current?.capture('png')
    if (!url) {
      notify('3D 画面尚不可导出。请尝试重试 3D，或导出 JSON。')
      return
    }
    download(url, fileName('png'))
    notify('3D 效果图已导出。')
  }
  function add() {
    if (useShop.getState().putBag(config, thumbnail(), editId)) setAdded(true)
  }
  async function share() {
    const summary = configSummary(config)
    try {
      await navigator.clipboard.writeText(summary)
      notify('配置摘要已复制。')
    } catch {
      setShareText(summary)
    }
  }
  async function load(file?: File) {
    if (!file) return
    try {
      const result = await importJson(file)
      configure(result)
      setAdded(false)
      go(3)
      notify('已导入配置。')
    } catch (error) {
      notify(error instanceof Error ? error.message : '导入失败。')
    }
  }
  return (
    <div className="studio">
      <div className="studio-top">
        <div>
          <Eyebrow>DESIGN STUDIO</Eyebrow>
          <h1>
            Sneaker <em>Studio.</em>
          </h1>
        </div>
        <Link to="/product/court-01" className="text-link">
          IDC COURT 01 <ArrowUpRight size={16} />
        </Link>
      </div>
      <div className="studio-frame">
        <aside className="step-rail">
          <p className="overline">DESIGN YOUR PAIR</p>
          <nav aria-label="定制步骤">
            {steps.map(([key, cn], i) => (
              <button key={key} aria-current={step === i ? 'step' : undefined} onClick={() => go(i)}>
                <span>{i < step ? <Check size={13} /> : '0' + (i + 1)}</span>
                <div>
                  <b>{key}</b>
                  <small>{cn}</small>
                </div>
                <ChevronRight size={14} />
              </button>
            ))}
          </nav>
          <div className="rail-bottom">
            <Box size={17} />
            <span>
              IDC COURT 01
              <br />
              LOCAL EDITION
            </span>
          </div>
        </aside>
        <div className="stage">
          <div className="stage-top">
            <span className="live-dot" /> 3D PREVIEW <span>{config.colorway.toUpperCase()}</span>
          </div>
          <Suspense fallback={<div className="viewer-loading">正在载入 3D 工作室…</div>}>
            <Viewer
              ref={viewer}
              config={comparing ? createConfig(config.colorway) : config}
              selected={comparing ? null : selected}
              onSelect={choose}
              onMissing={onMissing}
              view={view}
              revision={revision}
            />
          </Suspense>
          <button
            className="compare-hold"
            aria-pressed={comparing}
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId)
              setComparing(true)
            }}
            onPointerUp={() => setComparing(false)}
            onPointerCancel={() => setComparing(false)}
            onKeyDown={(e) => {
              if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault()
                setComparing(true)
              }
            }}
            onKeyUp={() => setComparing(false)}
            onBlur={() => setComparing(false)}
          >
            {comparing ? '原版配色 · 松开返回' : '按住对比原版'}
          </button>
          <div className="stage-bottom">
            <div className="stage-hint">
              <Move3d size={15} /> 拖动旋转 · 双指或滚轮缩放
            </div>
            <div className="view-buttons" aria-label="相机视角">
              {(['side', 'top', 'heel', 'sole'] as const).map((v) => (
                <button key={v} aria-pressed={v === view} onClick={() => changeView(v)}>
                  {v.toUpperCase()}
                </button>
              ))}
              <button
                aria-label="RESET VIEW 重置视角"
                title="重置视角"
                onClick={() => changeView('default')}
              >
                <RotateCcw size={15} />
              </button>
            </div>
          </div>
        </div>
        <section className="panel-shell">
          <div className="panel-scroll" ref={panel}>
            <p className="overline">STEP 0{step + 1} / 04</p>
            <h2>{steps[step][1]}</h2>
            {step === 0 && (
              <BasePanel
                config={config}
                update={update}
                selected={selected}
                select={setSelected}
                missing={missing}
              />
            )}
            {step === 1 && (
              <DetailsPanel config={config} update={update} showTongue={() => changeView('inside')} />
            )}
            {step === 2 && <PersonalPanel config={config} update={update} notify={notify} />}
            {step === 3 && (
              <>
                <ConfigTable config={config} />
                <p className="panel-note">
                  概念鞋盒附一枚随机收藏挂件（5 款常规＋2 款隐藏）与印签香卡。
                </p>
                <div className="review-tools">
                  <button onClick={() => exportJson(config)}>
                    <FileJson size={16} /> 导出 JSON
                  </button>
                  <button onClick={share}>
                    <Share2 size={16} /> 分享摘要
                  </button>
                </div>
                {added && (
                  <Link className="text-link" to="/bag">
                    查看购物袋 <ArrowRight size={15} />
                  </Link>
                )}
              </>
            )}
          </div>
          <div className="panel-action">
            {step > 0 && (
              <button className="back-step" aria-label="上一步" onClick={() => go(step - 1)}>
                <ArrowLeft size={18} />
              </button>
            )}
            {step < 3 ? (
              <button className="action" onClick={() => go(step + 1)}>
                下一步 · {steps[step + 1][0]} <ArrowRight size={16} />
              </button>
            ) : (
              <button className="action" onClick={add}>
                {editId ? '更新购物袋方案' : '加入演示购物袋'} <ShoppingBag size={16} />
              </button>
            )}
          </div>
        </section>
      </div>
      <div className="studio-bar">
        <small>
          CUSTOM EDITION <span>/</span> LOCAL DEMO
        </small>
        <div>
          <button onClick={() => setReset(true)}>
            <RotateCcw /> 重置
          </button>
          <button onClick={() => fileInput.current?.click()}>
            <FolderOpen /> 导入 JSON
          </button>
          <input
            type="file"
            aria-label="导入配置文件"
            accept=".json,application/json"
            ref={fileInput}
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0]
              e.target.value = ''
              void load(file)
            }}
          />
          <button onClick={save}>
            <Bookmark /> 保存方案
          </button>
          <button onClick={png}>
            <Download /> 导出 PNG
          </button>
        </div>
      </div>
      <p className="studio-notice">{notice}</p>
      {reset && (
        <Dialog title="重新开始设计？" onClose={() => setReset(false)}>
          <p>当前工作台会恢复为 ORIGIN 基础配色。已收藏的作品可从 My Designs 载入。</p>
          <div className="dialog-actions">
            <button className="action action-outline" onClick={() => setReset(false)}>
              继续编辑
            </button>
            <button
              className="action"
              onClick={() => {
                configure(createConfig())
                setSelected('upper')
                go(0)
                changeView('default')
                setReset(false)
                setAdded(false)
                navigate('/customize', { replace: true })
                notify('工作台已重置。')
              }}
            >
              确认重置
            </button>
          </div>
        </Dialog>
      )}
      {shareText && (
        <Dialog title="分享配置摘要" onClose={() => setShareText('')}>
          <textarea
            aria-label="可复制的配置摘要"
            readOnly
            value={shareText}
            onFocus={(e) => e.target.select()}
          />
        </Dialog>
      )}
    </div>
  )
}
