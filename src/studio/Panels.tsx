import { useState, type ChangeEvent } from 'react'
import { Check, ImagePlus, Trash2 } from 'lucide-react'
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
import { variants } from '../data/content'
import { ColorField, Field, Options } from './Fields'
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
      <Options
        label="基础轮廓"
        items={['classic-low', 'bold-low'] as const}
        value={config.silhouette}
        select={(silhouette) => update({ silhouette })}
      />
      <Field label="基础配色">
        <div className="variant-picks">
          {variants.map((v) => (
            <button
              aria-pressed={config.colorway === v.id}
              key={v.id}
              onClick={() => update({ colorway: v.id, parts: variantParts(v.id) })}
            >
              <i style={{ background: v.chips[0] }} />
              {v.name}
              {config.colorway === v.id && <Check size={13} />}
            </button>
          ))}
        </div>
      </Field>
      <Field label="选择部件" hint="点选鞋身或下方部位，单独调整它的颜色和材质。">
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
            label={partLabels[selected] + '颜色'}
            color={config.parts[selected].color}
            change={(color) => modify(selected, { color })}
          />
          <Options
            label={partLabels[selected] + '材质 · 效果模拟'}
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
        label="鞋带样式"
        items={['flat', 'rope', 'contrast'] as const}
        value={config.laceType}
        select={(laceType) => update({ laceType })}
      />
      <ColorField
        label="鞋带颜色"
        color={config.parts.laces.color}
        change={(color) =>
          update({ parts: { ...config.parts, laces: { ...config.parts.laces, color } } })
        }
      />
      <Options
        label="鞋舌内侧 · 概念签名字样"
        items={['none', 'script-a', 'script-b'] as const}
        names={{ none: 'NO SCRIPT' }}
        value={config.tongueScript}
        select={(tongueScript) => {
          update({ tongueScript })
          showTongue()
        }}
      />
      <p className="panel-note">
        Concept signature style · 原创字体效果。外鞋舌展示 idc. × QINWEN 概念排版。
      </p>
      <Options
        label="演示尺码 / EU"
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
      notify('图案已添加，可调整位置和大小。')
    } catch (error) {
      notify(error instanceof Error ? error.message : '图案读取失败。')
    } finally {
      setBusy(false)
    }
  }
  return (
    <>
      <Field label="鞋侧文字">
        <div className="text-input">
          <input
            aria-label="鞋侧文字"
            placeholder="你的文字 / YOUR MARK"
            value={config.sideText}
            onChange={(e) => update({ sideText: cleanSideText(e.target.value) })}
          />
          <small>{Array.from(config.sideText).length}/14</small>
        </div>
      </Field>
      <Options
        label="字体"
        items={['grotesk', 'condensed', 'script'] as const}
        value={config.textFont}
        select={(textFont) => update({ textFont })}
      />
      <ColorField
        label="文字颜色"
        color={config.textColor}
        change={(textColor) => update({ textColor })}
      />
      <Options
        label="原创图案"
        items={['none', 'stripe', 'wave', 'star', 'motion'] as const}
        value={config.graphic}
        select={(graphic) => update({ graphic })}
      />
      {config.graphic !== 'none' && (
        <ColorField
          label="纹样颜色"
          color={config.graphicColor}
          change={(graphicColor) => update({ graphicColor })}
        />
      )}
      <Options
        label="贴花位置"
        items={['outer', 'inner', 'both'] as const}
        value={config.placement}
        select={(placement) => update({ placement })}
      />
      <label className="switch-label">
        <span>
          <b>高级定制</b>
          <small>ADVANCED CUSTOMIZATION</small>
        </span>
        <input
          type="checkbox"
          checked={config.advanced}
          onChange={(e) => update({ advanced: e.target.checked })}
        />
        <i />
      </label>
      {config.advanced && (
        <div className="advanced-panel">
          <p className="panel-note">Premium customization · 增值服务概念，价格待定。</p>
          <Options
            label="加工方式 · 效果模拟"
            items={['print', 'embroidery'] as const}
            value={config.craft}
            select={(craft) => update({ craft })}
          />
          <Field label="本地图案" hint="PNG / JPG / WebP，最多 5 MB。缩小后保存在方案中。">
            <label className="upload-label">
              <ImagePlus size={17} />
              {busy ? '正在处理…' : '上传图案'}
              <input
                type="file"
                aria-label="上传图案"
                accept="image/png,image/jpeg,image/webp"
                onChange={upload}
                disabled={busy}
              />
            </label>
            {config.artwork && (
              <div className="uploaded">
                <img src={config.artwork.dataUrl} alt="本地图案预览" />
                <small>{config.artwork.name}</small>
                <button aria-label="移除图案" onClick={() => update({ artwork: null })}>
                  <Trash2 size={15} />
                </button>
              </div>
            )}
          </Field>
          {config.artwork &&
            (['x', 'y', 'scale'] as const).map((k) => (
              <label className="slider" key={k} htmlFor={'artwork-' + k}>
                {{ x: '水平位置', y: '垂直位置', scale: '图案缩放' }[k]}
                <output htmlFor={'artwork-' + k}>{config.artworkTransform[k].toFixed(2)}</output>
                <input
                  id={'artwork-' + k}
                  aria-label={{ x: '水平位置', y: '垂直位置', scale: '图案缩放' }[k]}
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
    ['基础鞋型', c.silhouette.replace('-', ' ').toUpperCase()],
    ['配色 / 尺码', c.colorway.toUpperCase() + ' / EU ' + c.size],
    ['鞋带', c.laceType.toUpperCase() + ' · ' + c.parts.laces.color],
    ['鞋侧文字', c.sideText || '无'],
    ['图案 / 位置', c.graphic.toUpperCase() + ' / ' + c.placement.toUpperCase()],
    ['舌内字样', c.tongueScript.toUpperCase()],
    ['加工', c.advanced ? '高级 / ' + c.craft.toUpperCase() : '标准 DIY'],
    ['本地图案', c.advanced && c.artwork ? c.artwork.name : '无'],
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
          <summary>查看八个部件的材质与颜色</summary>
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
