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
  ['BASE', 'Shape and color'],
  ['DETAILS', 'Laces and fit'],
  ['PERSONALIZE', 'Text and artwork'],
  ['REVIEW', 'Your design'],
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
    } else store.notify('This design is no longer saved in this browser.')
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
      notify('The 3D preview is unavailable. Retry 3D to export a PNG, or export your design as JSON.')
      return
    }
    download(url, fileName('png'))
    notify('PNG preview exported.')
  }
  function add() {
    if (useShop.getState().putBag(config, thumbnail(), editId)) setAdded(true)
  }
  async function share() {
    const summary = configSummary(config)
    try {
      await navigator.clipboard.writeText(summary)
      notify('Design summary copied.')
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
      notify('Design imported.')
    } catch (error) {
      notify(
        error instanceof Error && !(error instanceof DOMException)
          ? error.message
          : 'Could not import this design.',
      )
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
          <nav aria-label="Design steps">
            {steps.map(([key, title], i) => (
              <button key={key} aria-current={step === i ? 'step' : undefined} onClick={() => go(i)}>
                <span>{i < step ? <Check size={13} /> : '0' + (i + 1)}</span>
                <div>
                  <b>{key}</b>
                  <small>{title}</small>
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
          <Suspense fallback={<div className="viewer-loading">Loading the 3D studio…</div>}>
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
            {comparing ? 'Original colorway · release to return' : 'Hold to compare'}
          </button>
          <div className="stage-bottom">
            <div className="stage-hint">
              <Move3d size={15} /> Drag to rotate · pinch or scroll to zoom
            </div>
            <div className="view-buttons" aria-label="Camera views">
              {(['side', 'top', 'heel', 'sole'] as const).map((v) => (
                <button key={v} aria-pressed={v === view} onClick={() => changeView(v)}>
                  {v.toUpperCase()}
                </button>
              ))}
              <button aria-label="Reset view" title="Reset view" onClick={() => changeView('default')}>
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
                  The concept box includes a printed scent card and one surprise lace charm from five
                  regular designs and two hidden editions.
                </p>
                <div className="review-tools">
                  <button onClick={() => exportJson(config)}>
                    <FileJson size={16} /> Export JSON
                  </button>
                  <button onClick={share}>
                    <Share2 size={16} /> Share summary
                  </button>
                </div>
                {added && (
                  <Link className="text-link" to="/bag">
                    View bag <ArrowRight size={15} />
                  </Link>
                )}
              </>
            )}
          </div>
          <div className="panel-action">
            {step > 0 && (
              <button className="back-step" aria-label="Previous step" onClick={() => go(step - 1)}>
                <ArrowLeft size={18} />
              </button>
            )}
            {step < 3 ? (
              <button className="action" onClick={() => go(step + 1)}>
                Next / {steps[step + 1][0]} <ArrowRight size={16} />
              </button>
            ) : (
              <button className="action" onClick={add}>
                {editId ? 'Update design in bag' : 'Add to demo bag'} <ShoppingBag size={16} />
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
            <RotateCcw /> Reset
          </button>
          <button onClick={() => fileInput.current?.click()}>
            <FolderOpen /> Import JSON
          </button>
          <input
            type="file"
            aria-label="Import design file"
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
            <Bookmark /> Save design
          </button>
          <button onClick={png}>
            <Download /> Export PNG
          </button>
        </div>
      </div>
      <p className="studio-notice">{notice}</p>
      {reset && (
        <Dialog title="Reset this design?" onClose={() => setReset(false)}>
          <p>
            Reset the studio to the original ORIGIN colorway. You can still load saved designs from My
            Designs.
          </p>
          <div className="dialog-actions">
            <button className="action action-outline" onClick={() => setReset(false)}>
              Keep editing
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
                notify('Studio reset to ORIGIN.')
              }}
            >
              Reset design
            </button>
          </div>
        </Dialog>
      )}
      {shareText && (
        <Dialog title="Share design summary" onClose={() => setShareText('')}>
          <textarea
            aria-label="Design summary to copy"
            readOnly
            value={shareText}
            onFocus={(e) => e.target.select()}
          />
        </Dialog>
      )}
    </div>
  )
}
