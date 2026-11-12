import { useState, type ChangeEvent } from 'react'
import { ImagePlus, Trash2 } from 'lucide-react'
import {
  cleanSideText,
  materialIds,
  materialLabels,
  partIds,
  partLabels,
  sizes,
  variantParts,
  type PartId,
  type ShoeConfig,
} from '../domain/config'
import { styleName } from '../domain/styles'
import { ColorField, Field, Options, StylePicker } from './Fields'
import { importArtwork } from '../lib/files'

type Props = { config: ShoeConfig; update: (patch: Partial<ShoeConfig>) => void }
export function BasePanel({
  config,
  update,
  selected,
  select,
  missing,
}: { selected: PartId | null; select: (p: PartId) => void; missing: PartId[] } & Props) {
  function modify(part: PartId, patch: Partial<ShoeConfig['parts'][PartId]>) {
    update({ parts: { ...config.parts, [part]: { ...config.parts[part], ...patch } } })
  }
  return (
    <>
      <StylePicker
        value={config.colorway}
        select={(id) => update({ colorway: id, parts: variantParts(id) })}
      />
      <Options
        label="Silhouette"
        items={['classic-low', 'bold-low'] as const}
        value={config.silhouette}
        select={(silhouette) => update({ silhouette })}
      />
      <Field
        label="Shoe part"
        hint="Select a part on the shoe or below to change its color and material."
      >
        <div className="part-grid">
          {partIds.map((p) => (
            <button
              key={p}
              disabled={missing.includes(p)}
              aria-pressed={p === selected}
              onClick={() => select(p)}
            >
              <i style={{ background: config.parts[p].color }} />
              {partLabels[p]}
            </button>
          ))}
        </div>
      </Field>
      {selected && !missing.includes(selected) && (
        <>
          <ColorField
            label={partLabels[selected] + ' color'}
            color={config.parts[selected].color}
            change={(color) => modify(selected, { color })}
          />
          <Options
            label={partLabels[selected] + ' material (preview)'}
            items={materialIds}
            names={materialLabels}
            value={config.parts[selected].material}
            select={(material) => modify(selected, { material })}
          />
        </>
      )}
    </>
  )
}
export function DetailsPanel({ config, update, showTongue }: { showTongue: () => void } & Props) {
  return (
    <>
      <Options
        label="Lace style"
        items={['flat', 'rope', 'contrast'] as const}
        value={config.laceType}
        select={(laceType) => update({ laceType })}
      />
      <ColorField
        label="Lace color"
        color={config.parts.laces.color}
        change={(color) =>
          update({ parts: { ...config.parts, laces: { ...config.parts.laces, color } } })
        }
      />
      <Options
        label="Inside tongue lettering"
        items={['none', 'script-a', 'script-b'] as const}
        names={{ none: 'NO SCRIPT' }}
        value={config.tongueScript}
        select={(tongueScript) => {
          update({ tongueScript })
          showTongue()
        }}
      />
      <p className="panel-note">
        Choose an original script style for the inside of the tongue. The outer tongue carries the idc. ×
        QINWEN concept mark.
      </p>
      <Options
        label="Size / EU (demo)"
        items={sizes}
        value={config.size}
        select={(size) => update({ size })}
      />
    </>
  )
}
export function PersonalPanel({ config, update, notify }: { notify: (v: string) => void } & Props) {
  const [busy, setBusy] = useState(false)
  async function upload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setBusy(true)
    try {
      update({ artwork: await importArtwork(file) })
      notify('Artwork added. Adjust its position and size below.')
    } catch (error) {
      notify(
        error instanceof Error && !(error instanceof DOMException)
          ? error.message
          : 'Could not read the artwork file.',
      )
    } finally {
      setBusy(false)
    }
  }
  return (
    <>
      <Field label="Side lettering">
        <div className="text-input">
          <input
            aria-label="Side lettering"
            placeholder="Your lettering"
            value={config.sideText}
            onChange={(e) => update({ sideText: cleanSideText(e.target.value) })}
          />
          <small>{Array.from(config.sideText).length}/14</small>
        </div>
      </Field>
      <Options
        label="Typeface"
        items={['grotesk', 'condensed', 'script'] as const}
        value={config.textFont}
        select={(textFont) => update({ textFont })}
      />
      <ColorField
        label="Lettering color"
        color={config.textColor}
        change={(textColor) => update({ textColor })}
      />
      <Options
        label="Graphic"
        items={['none', 'stripe', 'wave', 'star', 'motion'] as const}
        value={config.graphic}
        select={(graphic) => update({ graphic })}
      />
      {config.graphic !== 'none' && (
        <ColorField
          label="Graphic color"
          color={config.graphicColor}
          change={(graphicColor) => update({ graphicColor })}
        />
      )}
      <Options
        label="Placement"
        items={['outer', 'inner', 'both'] as const}
        value={config.placement}
        select={(placement) => update({ placement })}
      />
      <label className="switch-label">
        <b>Advanced customization</b>
        <input
          type="checkbox"
          checked={config.advanced}
          onChange={(e) => update({ advanced: e.target.checked })}
        />
        <i />
      </label>
      {config.advanced && (
        <div className="advanced-panel">
          <p className="panel-note">
            Premium finishes are a concept service. Pricing is to be confirmed.
          </p>
          <Options
            label="Finish (preview)"
            items={['print', 'embroidery'] as const}
            value={config.craft}
            select={(craft) => update({ craft })}
          />
          <Field
            label="Uploaded artwork"
            hint="Choose a PNG, JPG or WebP file up to 5 MB. A resized copy is saved with your design."
          >
            <label className="upload-label">
              <ImagePlus size={17} />
              {busy ? 'Processing…' : 'Upload artwork'}
              <input
                type="file"
                aria-label="Upload artwork"
                accept="image/png,image/jpeg,image/webp"
                onChange={upload}
                disabled={busy}
              />
            </label>
            {config.artwork && (
              <div className="uploaded">
                <img src={config.artwork.dataUrl} alt="Uploaded artwork preview" />
                <small>{config.artwork.name}</small>
                <button aria-label="Remove artwork" onClick={() => update({ artwork: null })}>
                  <Trash2 size={15} />
                </button>
              </div>
            )}
          </Field>
          {config.artwork &&
            (['x', 'y', 'scale'] as const).map((k) => (
              <label className="slider" key={k} htmlFor={'artwork-' + k}>
                {{ x: 'Horizontal position', y: 'Vertical position', scale: 'Artwork scale' }[k]}
                <output htmlFor={'artwork-' + k}>{config.artworkTransform[k].toFixed(2)}</output>
                <input
                  id={'artwork-' + k}
                  aria-label={
                    { x: 'Horizontal position', y: 'Vertical position', scale: 'Artwork scale' }[k]
                  }
                  type="range"
                  min={k === 'scale' ? 0.35 : -1}
                  max={k === 'scale' ? 2 : 1}
                  step={0.05}
                  value={config.artworkTransform[k]}
                  onChange={(e) =>
                    update({
                      artworkTransform: { ...config.artworkTransform, [k]: Number(e.target.value) },
                    })
                  }
                />
              </label>
            ))}
        </div>
      )}
    </>
  )
}
export function ConfigTable({ config: c, full = true }: { config: ShoeConfig; full?: boolean }) {
  const rows = [
    ['Silhouette', c.silhouette.replace('-', ' ').toUpperCase()],
    ['Edition / size', styleName(c.colorway) + ' / EU ' + c.size],
    ['Laces', c.laceType.toUpperCase() + ' · ' + c.parts.laces.color],
    ['Side lettering', c.sideText || 'None'],
    ['Graphic / position', c.graphic.toUpperCase() + ' / ' + c.placement.toUpperCase()],
    ['Tongue lettering', c.tongueScript.toUpperCase()],
    ['Finish', c.advanced ? 'Premium / ' + c.craft.toUpperCase() : 'Standard customization'],
    ['Uploaded artwork', c.advanced && c.artwork ? c.artwork.name : 'None'],
  ]
  return (
    <>
      <dl className="config-table">
        {rows.map(([k, v]) => (
          <div key={k}>
            <dt>{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>
      {full && (
        <details className="part-summary">
          <summary>View colors and materials for all eight parts</summary>
          <dl className="config-table">
            {partIds.map((p) => (
              <div key={p}>
                <dt>{partLabels[p]}</dt>
                <dd>
                  <i style={{ background: c.parts[p].color }} />
                  {c.parts[p].color} · {materialLabels[c.parts[p].material]}
                </dd>
              </div>
            ))}
          </dl>
        </details>
      )}
    </>
  )
}
