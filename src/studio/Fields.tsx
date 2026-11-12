import { useEffect, useState, type ReactNode } from 'react'
import { Check } from 'lucide-react'
import { hex } from '../domain/config'
import { families, styleCatalog, styleIds, styleName, type StyleId } from '../domain/styles'

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <fieldset className="field">
      <legend>{label}</legend>
      {children}
      {hint && <p className="field-hint">{hint}</p>}
    </fieldset>
  )
}
export function Options<T extends string>({
  label,
  items,
  value,
  select,
  names,
}: {
  label: string
  items: readonly T[]
  value: T
  select: (v: T) => void
  names?: Partial<Record<T, string>>
}) {
  return (
    <Field label={label}>
      <div className="option-group">
        {items.map((v) => (
          <button type="button" key={v} aria-pressed={value === v} onClick={() => select(v)}>
            {names?.[v] ?? v.replaceAll('-', ' ').toUpperCase()}
          </button>
        ))}
      </div>
    </Field>
  )
}
export function StylePicker({ value, select }: { value: StyleId; select: (id: StyleId) => void }) {
  const family = styleCatalog[value].family
  return (
    <>
      <Field label="Series">
        <div className="option-group">
          {families.map((name) => (
            <button
              type="button"
              key={name}
              aria-pressed={family === name}
              onClick={() => {
                const first = styleIds.find((id) => styleCatalog[id].family === name)
                if (name !== family && first) select(first)
              }}
            >
              {name}
            </button>
          ))}
        </div>
      </Field>
      <Field label="Edition">
        <div className="variant-picks">
          {styleIds
            .filter((id) => styleCatalog[id].family === family)
            .map((id) => (
              <button
                type="button"
                key={id}
                aria-label={styleName(id)}
                aria-pressed={id === value}
                onClick={() => {
                  if (id !== value) select(id)
                }}
              >
                <i style={{ background: styleCatalog[id].colors[7] }} />
                {styleCatalog[id].name}
                {id === value && <Check size={13} />}
              </button>
            ))}
        </div>
      </Field>
    </>
  )
}
const commonColors = [
  ['#F8F8F6', 'White'],
  ['#151515', 'Black'],
  ['#1533E8', 'Electric blue'],
  ['#93979D', 'Silver gray'],
  ['#D9CEB8', 'Sand'],
]
export function ColorField({
  label,
  color,
  change,
}: {
  label: string
  color: string
  change: (v: string) => void
}) {
  const [draft, setDraft] = useState(color),
    [error, setError] = useState(false)
  useEffect(() => {
    setDraft(color)
    setError(false)
  }, [color])
  return (
    <Field label={label}>
      <div className="color-chips">
        {commonColors.map(([v, n]) => (
          <button
            key={v}
            title={n + ' ' + v}
            aria-label={label + ' ' + n}
            aria-pressed={color.toLowerCase() === v.toLowerCase()}
            onClick={() => change(v)}
          >
            <i style={{ background: v, color: v === '#151515' || v === '#1533E8' ? 'white' : '#222' }}>
              {color.toLowerCase() === v.toLowerCase() && <Check size={14} />}
            </i>
            <small>{n}</small>
          </button>
        ))}
      </div>
      <div className="hex-row">
        <label className="color-picker" style={{ background: color }}>
          <input
            type="color"
            aria-label={label + ' picker'}
            value={color}
            onChange={(e) => change(e.target.value.toUpperCase())}
          />
        </label>
        <input
          type="text"
          aria-label={label + ' HEX'}
          value={draft}
          maxLength={7}
          spellCheck={false}
          onChange={(e) => {
            const value = e.target.value.toUpperCase()
            setDraft(value)
            setError(false)
            if (hex.safeParse(value).success) change(value)
          }}
          onBlur={() => {
            if (!hex.safeParse(draft).success) {
              setDraft(color)
              setError(true)
            }
          }}
        />
        <small>HEX</small>
      </div>
      {error && <p role="status">Enter a six-digit hex color, such as #1533E8.</p>}
    </Field>
  )
}
