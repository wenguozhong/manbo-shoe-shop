import { useEffect, useRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ArrowUpRight, X } from 'lucide-react'
import { useShop } from '../domain/store'
import { giftNames, productImage, variants } from '../data/content'

export function Brand({ light = false }: { light?: boolean }) {
  return (
    <img
      className="brand"
      src={'/graphics/wordmark-' + (light ? 'white' : 'black') + '.svg'}
      alt="idc."
      width="81"
      height="39"
    />
  )
}
export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <div className="eyebrow">
      <i />
      {children}
    </div>
  )
}
export function Action({
  to,
  children,
  secondary = false,
  light = false,
}: {
  to: string
  children: ReactNode
  secondary?: boolean
  light?: boolean
}) {
  return (
    <Link
      className={'action ' + (secondary ? 'action-outline ' : '') + (light ? 'on-dark' : '')}
      to={to}
    >
      {children}
      <ArrowRight size={17} />
    </Link>
  )
}
export function TextLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link className="text-link" to={to}>
      {children}
      <ArrowUpRight size={15} />
    </Link>
  )
}
export function IconBtn({
  label,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button type="button" className="icon-btn" aria-label={label} title={label} {...props}>
      {children}
    </button>
  )
}
export function Dialog({
  title,
  onClose,
  children,
}: {
  title: string
  onClose: () => void
  children: ReactNode
}) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const dialog = ref.current
    dialog?.showModal()
    const old = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      dialog?.close()
      document.body.style.overflow = old
    }
  }, [])
  return (
    <dialog
      ref={ref}
      className="dialog"
      aria-labelledby="dialog-title"
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          const r = e.currentTarget.getBoundingClientRect()
          if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom)
            onClose()
        }
      }}
    >
      <div className="dialog-head">
        <h2 id="dialog-title">{title}</h2>
        <IconBtn label="关闭 Close" onClick={onClose}>
          <X />
        </IconBtn>
      </div>
      {children}
    </dialog>
  )
}
export function Toast() {
  const toast = useShop((s) => s.toast)
  useEffect(() => {
    if (!toast) return
    const id = setTimeout(() => useShop.setState({ toast: null }), 4200)
    return () => clearTimeout(id)
  }, [toast])
  return (
    <div role="status" aria-live="polite" className={'toast ' + (toast ? 'visible' : '')}>
      {toast?.text}
    </div>
  )
}
export function ProductCard({ variant: v }: { variant: (typeof variants)[number] }) {
  return (
    <article className="product-card">
      <Link
        className="card-photo"
        to={'/product/court-01?color=' + v.id}
        aria-label={'查看 COURT 01 ' + v.name}
      >
        <img loading="lazy" src={productImage(v.id)} alt={'IDC COURT 01 · ' + v.title} />
        <span className="card-arrow">
          <ArrowUpRight size={18} />
        </span>
      </Link>
      <div className="card-meta">
        <span>IDC COURT 01</span>
        <span className="chips" aria-label={v.title}>
          {v.chips.map((c) => (
            <i key={c} style={{ background: c }} />
          ))}
        </span>
      </div>
      <Link to={'/product/court-01?color=' + v.id}>
        <h3>{v.name}</h3>
      </Link>
      <p>
        {v.tone} <span>／ {v.title}</span>
      </p>
      <TextLink to={'/customize?color=' + v.id}>CUSTOMIZE</TextLink>
    </article>
  )
}
export function Gifts() {
  return (
    <section className="gift-section">
      <div className="wrap gift-layout">
        <div>
          <Eyebrow>IN THE BOX</Eyebrow>
          <h2 className="display subhead">
            The little things
            <br />
            <em>matter.</em>
          </h2>
          <p className="body-copy">
            每份概念鞋盒附一枚随机鞋带挂件和一张概念印签香卡。五款常规设计，两款隐藏轮廓。
          </p>
          <small>概念赠品设计，以最终合作方案为准。</small>
        </div>
        <div className="gift-tray">
          {giftNames.map((name, i) => (
            <figure key={name}>
              <img loading="lazy" src={'/graphics/charm-' + i + '.svg'} width="80" height="80" alt="" />
              <figcaption>{name}</figcaption>
            </figure>
          ))}
          <figure className="scent-card">
            <div>
              idc.
              <small>
                SCENT
                <br />
                EDITION
              </small>
            </div>
            <figcaption>香卡 / SCENT CARD</figcaption>
          </figure>
        </div>
      </div>
    </section>
  )
}
