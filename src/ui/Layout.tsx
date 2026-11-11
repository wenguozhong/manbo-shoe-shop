import { useState, useEffect, useRef } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Search, Bookmark, ShoppingBag, Menu, X, ArrowRight, ArrowUpRight, Trash2 } from 'lucide-react'
import { Brand, Dialog, IconBtn, Toast } from './Common'
import { articles, notice, productImage, slogan, variants } from '../data/content'
import { useShop } from '../domain/store'

const nav = [
  ['/collection', 'Collection'],
  ['/customize', 'Customize'],
  ['/story', 'The story'],
  ['/journal', 'Journal'],
]
type Overlay = 'search' | 'saved' | 'menu' | 'faq' | null
function Finder({ close }: { close: () => void }) {
  const [q, setQ] = useState('')
  const options = [
    ...variants.map((x) => ({
      title: 'COURT 01 / ' + x.name,
      desc: x.tone + ' ' + x.title,
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
          aria-label="搜索鞋款或文章"
          placeholder="搜索配色、鞋款或文章"
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
        {!matches.length && <p>没有匹配项，试试 VOLT 或「场」。</p>}
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
          <p>你保存的设计会出现在这里。</p>
          <Link to="/customize" className="text-link" onClick={close}>
            进入工作室 <ArrowRight size={16} />
          </Link>
        </div>
      )}
      {designs.map((d) => (
        <div className="saved-row" key={d.id}>
          <img src={d.preview || productImage(d.config.colorway)} alt="鞋款预览" />
          <button
            className="saved-name"
            onClick={() => {
              close()
              navigate('/customize?design=' + d.id)
            }}
          >
            <b>{d.config.sideText || 'COURT 01'}</b>
            <small>
              {d.config.colorway.toUpperCase()} / EU {d.config.size}
            </small>
            <span>载入方案 ↗</span>
          </button>
          <IconBtn label="删除保存的方案" onClick={() => del(d.id)}>
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
              />
              <IconBtn label="演示订阅" type="submit">
                <ArrowRight />
              </IconBtn>
            </form>
            <small role="status">{sent ? '订阅演示已完成 · ' : ''}Demo only, no email sent.</small>
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
    const title =
      path === '/'
        ? 'The Queen’s Craft'
        : path.startsWith('/product')
          ? 'IDC COURT 01'
          : path === '/customize'
            ? 'Sneaker Studio'
            : path.split('/').filter(Boolean).at(-1)?.replaceAll('-', ' ')
    document.title = 'idc. — ' + title
  }, [location])
  const close = () => setOverlay(null)
  return (
    <>
      <a className="skip-link" href="#main">
        跳到正文
      </a>
      <header className="site-header">
        <div className="header-inner">
          <Link className="brand-link" to="/" aria-label="idc. 首页">
            <Brand />
          </Link>
          <nav className="desktop-nav" aria-label="主导航">
            {nav.map(([url, t]) => (
              <NavLink key={url} to={url}>
                {t}
              </NavLink>
            ))}
          </nav>
          <div className="nav-tools">
            <IconBtn label="搜索 Search" onClick={() => setOverlay('search')}>
              <Search />
            </IconBtn>
            <IconBtn label="我的方案 My Designs" onClick={() => setOverlay('saved')}>
              <Bookmark />
            </IconBtn>
            <Link to="/bag" aria-label={'购物袋 Bag (' + bagCount + ')'} className="bag-link">
              <ShoppingBag size={19} />
              <span>{bagCount}</span>
            </Link>
            <button
              className="menu-toggle icon-btn"
              aria-label="打开菜单 Menu"
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
              <h3>怎样保存作品？</h3>
              <p>
                在工作室点击保存方案。下次用同一浏览器打开右上角的书签，即可载入。跨设备可以导出并导入
                JSON。
              </p>
              <h3>能下单购买吗？</h3>
              <p>这是学生商赛概念展示。购物袋用于收集和比较作品，所有编辑保存在本机。</p>
              <button className="action" onClick={close}>
                知道了 <X size={15} />
              </button>
            </div>
          )}
        </Dialog>
      )}
      <Toast />
    </>
  )
}
