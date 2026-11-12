export const families = ['Rallyco', 'Topspin', 'Volley'] as const
export const styleIds = [
  'rallyco-classic',
  'rallyco-court',
  'rallyco-retro',
  'topspin-classic',
  'topspin-rally',
  'topspin-retro',
  'volley-courtline',
  'volley-topspin',
  'volley-rallyco',
] as const

export type StyleId = (typeof styleIds)[number]
export type Family = (typeof families)[number]

interface CourtStyle {
  family: Family
  name: string
  tone: string
  description: string
  // Upper, toe, heel, tongue, laces, midsole, outsole and side trim, in partIds order.
  colors: readonly [string, string, string, string, string, string, string, string]
}

export const styleCatalog: Record<StyleId, CourtStyle> = {
  'rallyco-classic': {
    family: 'Rallyco',
    name: 'Classic',
    tone: 'Ivory / Forest',
    description:
      'Forest-green leather wraps the toe, eyestay and heel of an ivory low-top. A little tennis mascot sits beside the Rallyco script on the outer quarter.',
    colors: ['#F2EBDF', '#344B3C', '#334A3B', '#EBE5D7', '#F7F0E4', '#E2D4BE', '#BCAF95', '#395341'],
  },
  'rallyco-court': {
    family: 'Rallyco',
    name: 'Court',
    tone: 'Chalk / Slate',
    description:
      'Twin slate-blue bands cross the chalk upper. At the heel, a yellow ball rests against the lines of a miniature court net.',
    colors: ['#F0E9E0', '#D6CABB', '#455C72', '#E9E5DC', '#F7F2EA', '#E6DED1', '#C6BCAF', '#687F96'],
  },
  'rallyco-retro': {
    family: 'Rallyco',
    name: 'Retro',
    tone: 'Cream / Oxblood',
    description:
      'An oxblood collar and a sweeping side stripe frame cream leather. Crossed rackets in a laurel wreath recall the crest of a tennis club.',
    colors: ['#F0E8DB', '#D7CABC', '#663D40', '#EAE3D8', '#F8F1E4', '#E5D9C6', '#AD9C84', '#744145'],
  },
  'topspin-classic': {
    family: 'Topspin',
    name: 'Classic',
    tone: 'Porcelain / Pine',
    description:
      'A thin green arc follows a ball in flight across porcelain leather. A racket-carrying mascot finishes the panel just ahead of the pine heel tab.',
    colors: ['#F1EDE3', '#E6E0D6', '#405A4B', '#F2EEE5', '#FAF6EC', '#E4DBCD', '#91A390', '#4D6958'],
  },
  'topspin-rally': {
    family: 'Topspin',
    name: 'Rally',
    tone: 'Ivory / Storm blue',
    description:
      'Storm-blue suede wraps the toe and heel. A curved net and an oversized yellow ball fill the lower quarter above a slim blue outsole.',
    colors: ['#F1EAE1', '#637993', '#455A75', '#EEE9E1', '#F8F3E9', '#E8DFD0', '#50647C', '#506B88'],
  },
  'topspin-retro': {
    family: 'Topspin',
    name: 'Retro',
    tone: 'Oat / Espresso',
    description:
      'Oat suede and cream leather meet two espresso stripes. A small racket crest at the heel and a dark sole edge give the shoe its club colors.',
    colors: ['#EEE5D7', '#CBB69E', '#71534B', '#E9DDCE', '#F6EDDF', '#E4D7C4', '#574640', '#785347'],
  },
  'volley-courtline': {
    family: 'Volley',
    name: 'Courtline',
    tone: 'White / Navy',
    description:
      'Fine navy court lines cross a white leather upper. A capped player and a tennis ball sit near the heel, above a navy herringbone outsole.',
    colors: ['#F2EFE9', '#E8E3DC', '#52657C', '#F0ECE7', '#FBF7F1', '#E9E4DB', '#3E5066', '#455A75'],
  },
  'volley-topspin': {
    family: 'Volley',
    name: 'Topspin',
    tone: 'Cream / Sage',
    description:
      'A bright tennis ball leads two curving flight lines. Sage trims the toe, collar and outsole beneath the Volley wordmark.',
    colors: ['#F1EDE5', '#829579', '#798D72', '#EEEAE1', '#F8F5EB', '#E8E2D6', '#61765C', '#657C5E'],
  },
  'volley-rallyco': {
    family: 'Volley',
    name: 'Rallyco',
    tone: 'Shell / Dusty rose',
    description:
      'Dusty-rose stripes and a matching heel tab frame shell-white leather. A racket-carrying player brings the rally to the side of the shoe.',
    colors: ['#F2E9E3', '#D4A8A8', '#C19195', '#F1E5E0', '#FAF2EB', '#EAE0D6', '#AF8184', '#B77F83'],
  },
}

export const defaultStyle: StyleId = 'rallyco-classic'
export const featuredStyles: readonly StyleId[] = ['rallyco-classic', 'topspin-rally', 'volley-rallyco']

export function styleName(id: StyleId) {
  const style = styleCatalog[id]
  return style.family + ' ' + style.name
}

const previousIds = {
  origin: 'rallyco-classic',
  volt: 'topspin-rally',
  shadow: 'volley-courtline',
} as const

export function readStyle(value: unknown): StyleId | undefined {
  if (typeof value !== 'string') return undefined
  if (Object.hasOwn(previousIds, value)) return previousIds[value as keyof typeof previousIds]
  return styleIds.find((id) => id === value)
}
