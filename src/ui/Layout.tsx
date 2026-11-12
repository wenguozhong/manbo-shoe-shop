import { useState, useEffect, useRef } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Search, Bookmark, ShoppingBag, Menu, X, ArrowRight, ArrowUpRight, Trash2 } from 'lucide-react'
import { Brand, Dialog, IconBtn, Toast } from './Common'
import { articles, notice, productImage, slogan, variants } from '../data/content'
import { defaultStyle, readStyle, styleName } from '../domain/styles'
import { useShop } from '../domain/store'

const nav = [
  ['/collection', 'Collection'],
  ['/customize', 'Customize'],
  ['/story', 'The story'],
  ['/journal', 'Journal'],
]
const pageTitles: Record<string, string> = {
  '/': 'The Queen’s Craft',
  '/collection': 'Collection',
  '/customize': 'Sneaker Studio',
  '/bag': 'My Bag',
  '/story': 'The Story',
  '/journal': 'Journal',
  '/concept-notice': 'Concept Notice',
}
type Overlay = 'search' | 'saved' | 'menu' | 'faq' | null
function Finder({ close }: { close: () => void }) {
  const [q, setQ] = useState('')
  const options = [
    ...variants.map((x) => ({
      title: 'COURT 01 / ' + x.name,
      desc: x.tone,
      url: '/product/court-01?color=' + x.id,
    })),
    ...articles.map((x) => ({
      title: x.title,
      desc: x.category + ' ' + x.kicker,
      url: '/journal/' + x.id,
    })),
  ]
  const matches = options.filter((x) =>
    (x.title + ' ' + x.desc).toLowerCase().includes(q.trim().toLowerCase()),
  )
  return (
    <>
      <label className="searchbox">
        <Search size={18} />
        <input
          autoFocus
          aria-label="Search sneakers and stories"
          placeholder="Search editions, sneakers or stories"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </label>
      <div className="result-list">
        {matches.map((item) => (
          <Link to={item.url} onClick={close} key={item.url}>
            <span>
              <b>{item.title}</b>
              <small>{item.desc}</small>
            </span>
            <ArrowUpRight size={18} />
          </Link>
        ))}
        {!matches.length && <p>No matches. Try “Rallyco” or “sage”.</p>}
      </div>
    </>
  )
}
function Saved({ close }: { close: () => void }) {
  const designs = useShop((s) => s.designs),
    del = useShop((s) => s.deleteDesign),
    navigate = useNavigate()
  return (
    <div className="saved-list">
      {!designs.length && (
        <div className="dialog-empty">
          <Bookmark />
          <p>Your saved designs will appear here.</p>
          <Link to="/customize" className="text-link" onClick={close}>
            Open the studio <ArrowRight size={16} />
          </Link>
        </div>
      )}
      {designs.map((d) => (
        <div className="saved-row" key={d.id}>
          <img src={d.preview || productImage(d.config.colorway)} alt="Saved sneaker design" />
          <button
            className="saved-name"
            onClick={() => {
              close()
              navigate('/customize?design=' + d.id)
            }}
          >
            <b>{d.config.sideText || 'COURT 01'}</b>
            <small>
              {styleName(d.config.colorway)} / EU {d.config.size}
            </small>
            <span>Load design ↗</span>
          </button>
          <IconBtn label="Delete saved design" onClick={() => del(d.id)}>
            <Trash2 size={17} />
          </IconBtn>
        </div>
      ))}
    </div>
  )
}
function Footer({ faq }: { faq: () => void }) {
  const [sent, setSent] = useState(false)
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer-grid">
          <div className="footer-brand">
            <Brand light />
            <p>{slogan}</p>
          </div>
          <div>
            <h3>EXPLORE</h3>
            {nav.map(([url, t]) => (
              <Link key={url} to={url}>
                {t}
              </Link>
            ))}
          </div>
          <div>
            <h3>SUPPORT</h3>
            <button onClick={faq}>Studio FAQ</button>
            <Link to="/concept-notice">Concept notice</Link>
            <Link to="/concept-notice#contact">Contact</Link>
          </div>
          <div className="newsletter">
            <h3>NEWSLETTER</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                setSent(true)
                e.currentTarget.reset()
              }}
            >
              <input
                type="email"
                required
                placeholder="Your email address"
                aria-label="Newsletter email"
                onInvalid={(e) => {
                  const email = e.currentTarget
                  email.setCustomValidity(
                    email.validity.valueMissing
                      ? 'Enter your email address.'
                      : 'Enter a valid email address.',
                  )
                }}
                onInput={(e) => {
                  e.currentTarget.setCustomValidity('')
                  setSent(false)
                }}
              />
              <IconBtn label="Try the demo signup" type="submit">
                <ArrowRight />
              </IconBtn>
            </form>
            <small role="status">
              {sent ? 'Demo signup complete. No email was sent.' : 'Demo only. No email will be sent.'}
            </small>
          </div>
        </div>
        <div className="footer-end">
          <span>© 2026 idc. Student concept project.</span>
          <span>{notice}</span>
        </div>
      </div>
    </footer>
  )
}
export function Layout() {
  const [overlay, setOverlay] = useState<Overlay>(null),
    location = useLocation()
  const bagCount = useShop((s) => s.bag.reduce((acc, i) => acc + i.qty, 0))
  const prevPath = useRef('')
  useEffect(() => {
    const path = location.pathname
    if (prevPath.current !== path) {
      if (location.hash)
        requestAnimationFrame(() => document.getElementById(location.hash.slice(1))?.scrollIntoView())
      else window.scrollTo({ top: 0, behavior: 'instant' })
      prevPath.current = path
    }
    const route = path.replace(/\/+$/, '') || '/'
    const title = route.toLowerCase() === '/product/court-01'
      ? styleName(readStyle(new URLSearchParams(location.search).get('color')) ?? defaultStyle)
      : pageTitles[route.toLowerCase()] ??
        articles.find((article) => route === '/journal/' + article.id)?.title ??
        'Page Not Found'
    document.title = 'idc. — ' + title
  }, [location])
  const close = () => setOverlay(null)
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="site-header">
        <div className="header-inner">
          <Link className="brand-link" to="/" aria-label="idc. home">
            <Brand />
          </Link>
          <nav className="desktop-nav" aria-label="Main navigation">
            {nav.map(([url, t]) => (
              <NavLink key={url} to={url}>
                {t}
              </NavLink>
            ))}
          </nav>
          <div className="nav-tools">
            <IconBtn label="Search" onClick={() => setOverlay('search')}>
              <Search />
            </IconBtn>
            <IconBtn label="My Designs" onClick={() => setOverlay('saved')}>
              <Bookmark />
            </IconBtn>
            <Link to="/bag" aria-label={'Bag (' + bagCount + ')'} className="bag-link">
              <ShoppingBag size={19} />
              <span>{bagCount}</span>
            </Link>
            <button
              className="menu-toggle icon-btn"
              aria-label="Open menu"
              onClick={() => setOverlay('menu')}
            >
              <Menu />
            </button>
          </div>
        </div>
      </header>
      <main id="main">
        <Outlet />
      </main>
      {location.pathname !== '/customize' && <Footer faq={() => setOverlay('faq')} />}
      {overlay && (
        <Dialog
          title={{ menu: 'Menu', search: 'Search', saved: 'My designs', faq: 'Studio FAQ' }[overlay]}
          onClose={close}
        >
          {overlay === 'search' && <Finder close={close} />}
          {overlay === 'saved' && <Saved close={close} />}
          {overlay === 'menu' && (
            <nav className="mobile-links">
              {nav.concat([['/bag', 'My bag']]).map(([url, t]) => (
                <Link to={url} key={url} onClick={close}>
                  {t}
                  <ArrowUpRight />
                </Link>
              ))}
              <button onClick={() => setOverlay('search')}>
                Search <Search />
              </button>
              <button onClick={() => setOverlay('saved')}>
                My designs <Bookmark />
              </button>
            </nav>
          )}
          {overlay === 'faq' && (
            <div className="faq">
              <h3>How do I save my design?</h3>
              <p>
                Choose Save design in the studio. Open My Designs in the same browser to load it again.
                To move a design to another device, export its JSON file and import it there.
              </p>
              <h3>Can I buy a pair?</h3>
              <p>
                The sneakers are part of a student concept project and are not for sale. Use the demo bag
                to collect and compare designs. Your work stays in this browser.
              </p>
              <button className="action" onClick={close}>
                Got it <X size={15} />
              </button>
            </div>
          )}
        </Dialog>
      )}
      <Toast />
    </>
  )
}
