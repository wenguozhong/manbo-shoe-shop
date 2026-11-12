import { Action, Eyebrow, Gifts } from '../ui/Common'
import { hook, notice, slogan } from '../data/content'

export function Story() {
  return (
    <>
      <section className="wrap page-space story-top">
        <Eyebrow>THE STORY / idc.</Eyebrow>
        <h1 className="display page-title">
          Sport is the start.
          <br />
          <em>Style is yours.</em>
        </h1>
        <p className="story-intro">
          Court 01 takes the energy of the tennis court into everyday streetwear, starting with a low-top
          you can make your own.
        </p>
        <img
          className="article-hero"
          src="/images/hero.webp"
          alt="A tennis player following through on a shot"
        />
      </section>
      <div className="wrap story-detail">
        <Eyebrow>THE QUEEN’S CRAFT</Eyebrow>
        <div>
          <h2>{hook}</h2>
          <p>
            We created idc. for a high school business competition. Our audience is people aged 16–35 who
            love sport and streetwear. Three questions shaped our first shoe.
          </p>
          <h3>What stays with you after you leave the court?</h3>
          <p>
            Choosing a direction, finding a rhythm, starting again. Those choices carry over into how we
            dress. At idc., the wearer takes part in the design by choosing the colors and details that
            feel right to them.
          </p>
          <h3>Why a low-top sneaker?</h3>
          <p>
            A flat side panel leaves room for a line of text, and a low collar works with everyday
            clothes. We built the shoe from a profile sketch, then made the tongue, laces and sole into
            parts you can edit individually.
          </p>
          <h3>Why propose a collaboration with Zheng Qinwen?</h3>
          <p>
            We chose Zheng Qinwen as a proposed collaborator because her drive to keep improving on the
            tennis court inspired the project. Our student team designed the concept wordmark, tongue
            lettering, collectible charms and colorways for this proposal.
          </p>
          <blockquote>{slogan}</blockquote>
          <Action to="/customize">DESIGN YOUR PAIR</Action>
        </div>
      </div>
      <Gifts />
    </>
  )
}
export function Notice() {
  return (
    <section className="wrap page-space legal">
      <Eyebrow>CONCEPT NOTICE</Eyebrow>
      <h1 className="display page-title">
        About this <em>concept.</em>
      </h1>
      <h2>Brand and collaboration</h2>
      <p>
        {notice} Court 01, its three colorways, the charms and the scent card are original concept
        designs. The athlete scenes use original concept imagery. The script options on the tongue are
        lettering designed for this project.
      </p>
      <h2>Your designs and data</h2>
      <p>
        The studio processes designs and uploaded artwork in your browser. Saved designs, thumbnails and
        your demo bag use local storage. Clearing this site’s data removes them. Export a JSON file to
        back up an editable design, or download a PNG of the preview.
      </p>
      <h2>The demo bag</h2>
      <p>
        Sizes are for trying out a design. Pricing, stock and production specifications have yet to be
        set. You can design a pair and add it to your demo bag without placing an order.
      </p>
      <h2 id="contact">Contact and use</h2>
      <p>
        We made this project for a student business competition. For questions about using the artwork or
        discussing a collaboration, please contact the team presenting the project.
      </p>
    </section>
  )
}
