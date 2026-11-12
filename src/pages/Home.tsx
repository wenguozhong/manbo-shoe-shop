import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { Action, Eyebrow, Gifts, ProductCard, TextLink } from '../ui/Common'
import { articles, hook, productImage, productNotes, variants } from '../data/content'
import type { Colorway } from '../domain/config'
import { families, featuredStyles, styleName, styleCatalog } from '../domain/styles'
import { DesignReference } from '../ui/DesignReference'

const campaign = [
  {
    image: '/images/campaign-queens-design.jpg',
    width: 872,
    height: 1158,
    alt: 'A tennis player follows through across a white court line. Blue lettering reads “Meet the Queen’s Design.”',
    lines: ['THE QUEEN’S', 'CRAFT.'],
    label: 'IDC COURT 01',
    caption: 'Design your own tennis-inspired low-top. Start with a pair from Rallyco, Topspin or Volley.',
    cta: 'CUSTOMIZE YOUR PAIR',
    url: '/customize',
  },
  {
    image: '/images/campaign-brand-board.jpg',
    width: 1642,
    height: 1032,
    alt: 'The idc. brand concept board pairs a blue wordmark with the tennis poster and the line “Play your way.”',
    lines: ['PLAY YOUR', 'WAY.'],
    label: 'IDC BRAND CONCEPT',
    caption: 'Our campaign pairs an electric-blue wordmark with a player caught at full stretch.',
    cta: 'READ THE STORY',
    url: '/story',
  },
]
function Hero() {
  const [index, setIndex] = useState(0)
  const item = campaign[index]
  return (
    <section className="hero" aria-roledescription="carousel" aria-label="Campaign posters">
      <div className="wrap hero-inner">
        <div className="hero-copy">
          <div className="hero-kicker">
            <i />
            {item.label}
          </div>
          <h1 className="hero-title">
            <span>{item.lines[0]} </span>
            <em>{item.lines[1]}</em>
          </h1>
          <p className="hero-caption">{item.caption}</p>
          <div className="hero-actions">
            <Action to={item.url}>{item.cta}</Action>
            <Link className="hero-secondary" to="/collection">
              EXPLORE COLLECTION <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>
        <div className="hero-art">
          <img
            className="hero-photo"
            src={item.image}
            width={item.width}
            height={item.height}
            alt={item.alt}
            fetchPriority={index === 0 ? 'high' : 'auto'}
          />
        </div>
        <div className="hero-bottom">
          <div className="slide-controls">
            <button
              aria-label="Previous slide"
              onClick={() => setIndex((current) => (current + campaign.length - 1) % campaign.length)}
            >
              <ChevronLeft size={17} />
            </button>
            <span aria-live="polite" aria-atomic="true">
              0{index + 1}<small> / 0{campaign.length}</small>
            </span>
            <button
              aria-label="Next slide"
              onClick={() => setIndex((current) => (current + 1) % campaign.length)}
            >
              <ChevronRight size={17} />
            </button>
          </div>
          <a className="hero-full" href={item.image} target="_blank" rel="noreferrer">
            View full poster <ArrowUpRight size={15} />
          </a>
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
  const [color, setColor] = useState<Colorway>('topspin-rally')
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
            Start with a tennis edition. Choose your materials, add lettering to the side panel and turn the
            shoe to see your design from every angle.
          </p>
          <Action to={'/customize?color=' + color}>ENTER THE DESIGN STUDIO</Action>
        </div>
        <div className="teaser-preview">
          <img loading="lazy" src={productImage(color)} alt={styleName(color) + ' three-quarter view'} />
          <div className="preview-choices" aria-label="Preview a series">
            {featuredStyles.map((id) => (
              <button key={id} aria-label={styleName(id)} aria-pressed={color === id} onClick={() => setColor(id)}>
                <i style={{ background: styleCatalog[id].colors[7] }} />
                {styleCatalog[id].family}
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
          <Eyebrow>SIGNATURE EDITION</Eyebrow>
          <TextLink to="/collection">VIEW COLLECTION</TextLink>
        </div>
        <div className="signature-grid">
          <div className="signature-copy">
            <p className="overline">THE QUEEN’S CRAFT</p>
            <h2 className="display">
              Rallyco
              <br />
              Classic<span className="blue">.</span>
            </h2>
            <p className="body-copy">
              Forest-green trim, an ivory leather upper and a tiny racket-carrying mascot. Turn the shoe to see how the drawing wraps around the heel.
            </p>
            <TextLink to="/product/court-01">VIEW THE PRODUCT</TextLink>
          </div>
          <Link to="/product/court-01?color=rallyco-classic" className="signature-photo">
            <img
              loading="lazy"
              src={productImage('rallyco-classic')}
              alt="Three-quarter view of the forest-green and ivory Rallyco Classic"
            />
            <span>RALLYCO CLASSIC / FOREST</span>
            <ArrowUpRight />
          </Link>
          <Link to="/product/court-01?color=rallyco-classic" className="signature-detail">
            <DesignReference id="rallyco-classic" view="detail" />
            <span>
              PANEL DETAIL <ArrowUpRight size={14} />
            </span>
          </Link>
        </div>
      </section>
      <section className="wrap section">
        <div className="section-rail">
          <Eyebrow>THE COLLECTION</Eyebrow>
          <TextLink to="/collection">VIEW ALL NINE EDITIONS</TextLink>
        </div>
        <div className="heading-row">
          <h2 className="display subhead">
            Choose your <em>series.</em>
          </h2>
          <span className="muted">One edition from each of our three tennis series.</span>
        </div>
        <div className="product-grid">
          {variants.filter((v) => featuredStyles.includes(v.id)).map((v) => (
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
        <div aria-label="Filter by series">
          {['ALL', ...families].map((item) => (
            <button key={item} aria-pressed={filter === item} onClick={() => setFilter(item)}>
              {item}
            </button>
          ))}
        </div>
        <span>{filter === 'ALL' ? '9' : '3'} EDITIONS</span>
      </div>
      <div className="product-grid">
        {variants
          .filter((v) => filter === 'ALL' || v.family === filter)
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
