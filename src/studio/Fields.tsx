import { useEffect, useState, type ReactNode } from 'react'
import { Check } from 'lucide-react'
import { hex } from '../domain/config'

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
const commonColors = [
  ['#F8F8F6', '白'],
  ['#151515', '黑'],
  ['#1533E8', '电蓝'],
  ['#93979D', '银灰'],
  ['#D9CEB8', '沙色'],
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
            <i style={{ background: v, color: n === '黑' || n === '电蓝' ? 'white' : '#222' }}>
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
            aria-label={label + ' 拾色器'}
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
      {error && <p role="status">请输入六位十六进制色码，例如 #1533E8。</p>}
    </Field>
  )
}
