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
        <nav className="crumbs" aria-label="Breadcrumb">
          <Link to="/collection">COLLECTION</Link>
          <ChevronRight size={12} /> COURT 01
        </nav>
        <section className="product-layout">
          <div className="product-stage">
            <span className="product-stage-label">
              <Box size={14} /> 3D PRODUCT VIEW
            </span>
            <Suspense
              fallback={
                <img
                  className="product-poster"
                  src={productImage(color)}
                  alt={variant.name + ' in ' + variant.tone}
                />
              }
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
            <p>{variant.description}</p>
            <div className="product-swatches" aria-label="Product colorways">
              {variants.map((v) => (
                <button key={v.id} aria-pressed={v.id === color} onClick={() => select(v.id)}>
                  <i style={{ background: v.chips[0] }} />
                  {v.name}
                </button>
              ))}
            </div>
            <Options label="Size / EU (demo)" items={sizes} value={size} select={setSize} />
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
            <small>Student collaboration proposal. Sizes are for preview only.</small>
            <button className="text-link" onClick={() => setMacro(true)}>
              View lacing and stitching up close <ArrowRight size={14} />
            </button>
          </div>
        </section>
        {macro && (
          <Dialog title="Craft study" onClose={() => setMacro(false)}>
            <img
              src="/images/detail.webp"
              alt="Close-up of blue suede eyelets, woven laces and stitching on ivory leather"
            />
            <p>
              The electric blue eyestay meets the pale upper. Look closely to see the direction of the
              stitching and the weave of the laces.
            </p>
          </Dialog>
        )}
        <div className="product-story">
          {[
            [
              'DETAILS',
              'Details you can customize',
              'This low-top has eight editable parts. Add lettering or graphics to the sides and turn the shoe to find the concept marks on the tongue, insole, heel and outsole.',
            ],
            [
              'DESIGN STORY',
              'From the court to the street',
              hook +
                ' The quick turns of tennis and the pace of a daily walk shaped the clean profile of Court 01.',
            ],
            [
              'GIFT EXPERIENCE',
              'Inside the shoebox',
              'The concept box pairs a printed scent card with one lace charm. The charm is a surprise, drawn from five regular designs and two hidden editions.',
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
