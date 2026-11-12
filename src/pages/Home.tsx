import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { Action, Eyebrow, Gifts, ProductCard, TextLink } from '../ui/Common'
import { articles, hook, productImage, productNotes, variants } from '../data/content'
import type { Colorway } from '../domain/config'

const campaign = [
  {
    image: '/images/hero.webp',
    alt: 'A tennis player swings a racket across a sunlit court',
    lines: ['THE COURT', 'IS ONLY THE', 'BEGINNING.'],
    label: 'COURT CULTURE',
    caption: 'Sport is the start. Style is yours.',
    cta: 'CUSTOMIZE YOUR PAIR',
    url: '/customize',
    position: '76% center',
  },
  {
    image: '/images/detail.webp',
    alt: 'Laces and stitching on a Court 01 low-top',
    lines: ['BUILT TO', 'MOVE. MADE', 'TO BE YOURS.'],
    label: 'DESIGN STUDY',
    caption: 'The Queen’s Craft / IDC Court 01.',
    cta: 'EXPLORE COURT 01',
    url: '/product/court-01',
    position: '65% center',
  },
  {
    image: '/images/journal-style.webp',
    alt: 'Low-top sneakers styled for the street',
    lines: ['YOUR PAIR.', 'YOUR', 'STORY.'],
    label: 'STREET STYLE',
    caption: 'From court energy to everyday culture.',
    cta: 'READ THE STORY',
    url: '/journal/your-pair-your-story',
    position: '70% center',
  },
]
function Hero() {
  const [index, setIndex] = useState(0),
    item = campaign[index]
  return (
    <section className="hero" aria-roledescription="carousel" aria-label="Campaign highlights">
      <img
        className={'hero-photo slide-' + index}
        src={item.image}
        alt={item.alt}
        fetchPriority="high"
        style={{ objectPosition: item.position }}
      />
      <div className="hero-shade" />
      <div className="wrap hero-inner">
        <div className="hero-copy" key={index}>
          <div className="hero-kicker">
            <i />
            {item.label}
            <b>/</b> CONCEPT SERIES
          </div>
          <h1 className="hero-title">
            {item.lines.map((line, i) => (
              <span key={line} className={i === 2 ? 'italic' : ''}>
                {line}
              </span>
            ))}
          </h1>
          <p>{item.caption}</p>
          <div className="hero-actions">
            <Action to={item.url}>{item.cta}</Action>
            <Link className="hero-secondary" to="/collection">
              EXPLORE COLLECTION <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>
        <div className="hero-bottom">
          <div className="edition">
            <span className="index-line" />
            <span>THE QUEEN’S CRAFT</span>
            <b>/</b>
            <span>IDC COURT 01</span>
          </div>
          <div className="slide-controls">
            <span aria-live="polite">
              0{index + 1}
              <small> / 03</small>
            </span>
            <button aria-label="Previous slide" onClick={() => setIndex((index + 2) % 3)}>
              <ChevronLeft size={17} />
            </button>
            <button aria-label="Next slide" onClick={() => setIndex((index + 1) % 3)}>
              <ChevronRight size={17} />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
export function JournalCards() {
  return (
    <div className="journal-grid">
      {articles.map((a) => (
        <Link to={'/journal/' + a.id} key={a.id} className="journal-card">
          <div>
            <img loading="lazy" src={a.image} alt={a.alt} />
          </div>
          <p className="overline">
            {a.category} <span>/ {a.kicker}</span>
          </p>
          <h3>
            {a.title}
            <ArrowUpRight size={23} />
          </h3>
        </Link>
      ))}
    </div>
  )
}
function Teaser() {
  const [color, setColor] = useState<Colorway>('volt')
  return (
    <section className="studio-teaser">
      <div className="wrap teaser-inner">
        <div>
          <Eyebrow>3D SNEAKER STUDIO</Eyebrow>
          <h2 className="display subhead">
            Your style.
            <br />
            <em>Your rules.</em>
          </h2>
          <p className="body-copy">
            Start with a colorway. Choose your materials, add lettering to the side panel and turn the
            shoe to see your design from every angle.
          </p>
          <Action to={'/customize?color=' + color}>ENTER THE DESIGN STUDIO</Action>
        </div>
        <div className="teaser-preview">
          <img loading="lazy" src={productImage(color)} alt={'Court 01 in ' + color.toUpperCase()} />
          <div className="preview-choices" aria-label="Preview a colorway">
            {variants.map((v) => (
              <button key={v.id} aria-pressed={color === v.id} onClick={() => setColor(v.id)}>
                <i style={{ background: v.chips[0] }} />
                {v.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
export default function Home() {
  return (
    <>
      <Hero />
      <section className="wrap signature">
        <div className="section-rail">
          <Eyebrow>SIGNATURE MODEL</Eyebrow>
          <TextLink to="/collection">VIEW COLLECTION</TextLink>
        </div>
        <div className="signature-grid">
          <div className="signature-copy">
            <p className="overline">THE QUEEN’S CRAFT</p>
            <h2 className="display">
              IDC
              <br />
              COURT 01<span className="blue">.</span>
            </h2>
            <p className="body-copy">
              A court-inspired low-top for the street, with details you can change from the laces to the
              sole.
            </p>
            <TextLink to="/product/court-01">VIEW THE PRODUCT</TextLink>
          </div>
          <Link to="/product/court-01?color=volt" className="signature-photo">
            <img
              loading="lazy"
              src={productImage('volt')}
              alt="Three-quarter view of the electric blue IDC COURT 01"
            />
            <span>VOLT / ELECTRIC BLUE</span>
            <ArrowUpRight />
          </Link>
          <Link to="/journal/making-court-01" className="signature-detail">
            <img loading="lazy" src="/images/detail.webp" alt={articles[1].alt} />
            <span>
              CRAFT STUDY <ArrowUpRight size={14} />
            </span>
          </Link>
        </div>
      </section>
      <section className="wrap section">
        <div className="section-rail">
          <Eyebrow>THE COLLECTION</Eyebrow>
          <span className="overline">03 COLORWAYS</span>
        </div>
        <div className="heading-row">
          <h2 className="display subhead">
            Choose your <em>colorway.</em>
          </h2>
          <span className="muted">One silhouette. Three starting points.</span>
        </div>
        <div className="product-grid">
          {variants.map((v) => (
            <ProductCard key={v.id} variant={v} />
          ))}
        </div>
      </section>
      <section className="wrap section note-section">
        <div className="note-intro">
          <Eyebrow>DESIGN LANGUAGE</Eyebrow>
          <h2 className="display">
            Not just a pair.
            <br />
            <em>A personal statement.</em>
          </h2>
        </div>
        <div className="note-list">
          {productNotes.map((n) => (
            <div key={n.label}>
              <span className="overline">{n.label}</span>
              <div>
                <h3>{n.title}</h3>
                <p>{n.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
      <Teaser />
      <Gifts />
      <section className="wrap section">
        <div className="section-rail">
          <Eyebrow>FIELD NOTES</Eyebrow>
          <TextLink to="/journal">ALL STORIES</TextLink>
        </div>
        <h2 className="display subhead journal-title">
          The <em>journal.</em>
        </h2>
        <JournalCards />
      </section>
      <section className="statement">
        <img
          loading="lazy"
          src="/images/journal-court.webp"
          alt="Black-and-white view of a tennis court and net"
        />
        <div className="wrap">
          <p className="overline">A STUDENT CONCEPT / idc.</p>
          <h2 className="display">
            Built for play.
            <br />
            <em>Made to collect.</em>
          </h2>
          <p>{hook}</p>
          <TextLink to="/story">OUR STORY</TextLink>
        </div>
      </section>
    </>
  )
}
export function Collection() {
  const [filter, setFilter] = useState('ALL')
  return (
    <div className="wrap collection-page page-space">
      <Eyebrow>THE COLLECTION</Eyebrow>
      <h1 className="display page-title">
        Every pair starts
        <br />
        <em>somewhere.</em>
      </h1>
      <div className="filter-bar">
        <div aria-label="Filter by color">
          {['ALL', 'LIGHT', 'BLUE', 'DARK'].map((item) => (
            <button key={item} aria-pressed={filter === item} onClick={() => setFilter(item)}>
              {item}
            </button>
          ))}
        </div>
        <span>IDC COURT 01</span>
      </div>
      <div className="product-grid">
        {variants
          .filter((v) => filter === 'ALL' || v.filter === filter)
          .map((v) => (
            <ProductCard key={v.id} variant={v} />
          ))}
      </div>
    </div>
  )
}
export function Journal() {
  return (
    <div className="wrap journal-page page-space">
      <Eyebrow>CULTURE / PROCESS / STYLE</Eyebrow>
      <h1 className="display page-title">
        The <em>journal.</em>
      </h1>
      <JournalCards />
    </div>
  )
}
export function ArticlePage({ id }: { id: string }) {
  const a = articles.find((x) => x.id === id)
  if (!a) return <NotFound />
  const next = articles[(articles.indexOf(a) + 1) % articles.length]
  return (
    <article className="article-page wrap page-space">
      <Link to="/journal" className="text-link">
        <ArrowLeft size={15} /> ALL STORIES
      </Link>
      <div className="article-head">
        <Eyebrow>{a.category} / JOURNAL</Eyebrow>
        <h1 className="display page-title">{a.title}</h1>
        <p>{a.kicker}</p>
      </div>
      <img className="article-hero" src={a.image} alt={a.alt} />
      <div className="article-body">
        {a.paras.map((p) => (
          <p key={p}>{p}</p>
        ))}
        <TextLink to={'/journal/' + next.id}>NEXT / {next.title}</TextLink>
      </div>
    </article>
  )
}
export function NotFound() {
  return (
    <div className="wrap page-space">
      <Eyebrow>404</Eyebrow>
      <h1 className="display page-title">
        Off the <em>court.</em>
      </h1>
      <p>We couldn’t find that page.</p>
      <Action to="/">BACK TO HOME</Action>
    </div>
  )
}
