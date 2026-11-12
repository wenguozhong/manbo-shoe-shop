import { styleCatalog, styleIds, styleName, type StyleId } from '../domain/styles'

export const series = 'THE QUEEN’S CRAFT'
export const slogan =
  'Sport is the start. Style is yours. No permission needed — just be unapologetically yourself.'
export const hook = 'Meet the Queen’s craft — built for play, made to collect.'
export const notice =
  'Student business competition concept. The proposed collaboration with Zheng Qinwen has no official endorsement. The shoes are for display only.'
export const variants = styleIds.map((id) => {
  const { family, tone, description, colors } = styleCatalog[id]
  return { id, family, name: styleName(id), tone, description, chips: [colors[7], colors[0], colors[6]] }
})
export const productImage = (id: StyleId) => '/images/court-01-' + id + '.webp'
export const articles = [
  {
    id: 'beyond-the-lines',
    category: 'CULTURE',
    title: 'Beyond the lines.',
    kicker: 'Reading the court',
    image: '/images/journal-court.webp',
    alt: 'A tennis net and painted lines crossing the court',
    paras: [
      'There are two ways to read a court line. During a match, it tells you whether the ball landed in or out. After everyone leaves, that same white stripe runs across the concrete and seems to meet the curb, the crosswalk and the steps at the corner. That second reading gave us the starting point for Court 01.',
      'We wanted the movement of a match to show up in everyday clothes. The curve on the outer panel follows the arc of a racket after contact. The layers along the sole echo the court lines that slip underfoot. You see the two shapes work together when the wearer takes a step.',
      'In our student concept, the court is where the design begins. Where the shoes go next is up to the person wearing them.',
    ],
  },
  {
    id: 'making-court-01',
    category: 'PROCESS',
    title: 'The making of Court 01.',
    kicker: 'From outline to stitch',
    image: productImage('rallyco-classic'),
    alt: 'The Rallyco Classic low-top with forest-green trim and a tennis mascot',
    paras: [
      'Our first sketch was a side view. One continuous line joined the toe, tongue and heel. A flatter line underneath closed the sole. The space between them set the height over the instep and the amount of room we could leave for artwork on the side.',
      'In the 3D studio, we divided the shoe into eight parts you can edit separately. Give the toe a suede finish and the light softens across it. Change the midsole color and the same low profile can look heavier, even though its shape stays the same.',
      'Lettering came last. We reduced the artwork, stepped half a pace back and checked whether the marks still read clearly. That was how we chose which details to keep.',
    ],
  },
  {
    id: 'your-pair-your-story',
    category: 'STYLE',
    title: 'Your pair, your story.',
    kicker: 'Leaving your mark',
    image: '/images/journal-style.webp',
    alt: 'Low-top sneakers worn with jeans on a city street',
    paras: [
      'Pick a jacket you wear often and find its quietest color. Try that shade on the laces, then set the midsole close to the lightness of your trouser cuffs. Those two choices give a new pair of shoes a place among the things you already wear.',
      'The lettering can be small. A place name, a few numbers or initials only your friends recognize can hold a whole design together. Move the words from the outside of the shoe to the inside and see how a public statement becomes a private mark.',
      'Save both versions and put their previews side by side. Sometimes the pair you keep is the one where you changed just a single detail.',
    ],
  },
]
export type Article = (typeof articles)[number]
export const giftNames = ['RALLY', 'MOTION', 'CROWN', 'SPARK', 'STAR', 'HIDDEN 01', 'HIDDEN 02']
export const productNotes = [
  {
    label: 'IDENTITY',
    title: 'Make the side panel yours.',
    body: 'Keep the factory wordmark or add your own lettering beside the tennis artwork. Place your mark on the inside, outside or both.',
  },
  {
    label: 'CRAFT',
    title: 'See how each finish catches the light.',
    body: 'Leather, fabric, suede and synthetic finishes each reflect light differently. Advanced customization lets you compare a flat print with the texture of embroidery.',
  },
  {
    label: 'DETAILS',
    title: 'Turn the shoe over.',
    body: 'The proposed collaboration mark appears on the tongue and outsole. Look for the idc. wordmark on the heel and insole, and choose lettering for the inside of the tongue.',
  },
]
