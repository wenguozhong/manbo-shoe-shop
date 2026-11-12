import { styleCatalog, styleName, type StyleId } from '../domain/styles'

type Region = readonly [left: number, top: number, width: number, height: number]
const regions: Record<StyleId, { profile: Region; detail: Region }> = {
  'rallyco-classic': { profile: [246, 140, 635, 270], detail: [1180, 285, 304, 111] },
  'rallyco-court': { profile: [246, 425, 635, 270], detail: [1180, 568, 304, 109] },
  'rallyco-retro': { profile: [246, 696, 635, 272], detail: [1180, 728, 304, 106] },
  'topspin-classic': { profile: [149, 127, 594, 269], detail: [398, 231, 318, 96] },
  'topspin-rally': { profile: [149, 404, 594, 269], detail: [398, 514, 318, 89] },
  'topspin-retro': { profile: [149, 679, 594, 269], detail: [398, 786, 318, 91] },
  'volley-courtline': { profile: [259, 138, 526, 251], detail: [1240, 273, 253, 120] },
  'volley-topspin': { profile: [259, 415, 526, 253], detail: [1240, 555, 253, 109] },
  'volley-rallyco': { profile: [259, 690, 526, 250], detail: [1240, 836, 253, 114] },
}

export function DesignReference({ id, view }: { id: StyleId; view: 'profile' | 'detail' }) {
  const [left, top, width, height] = regions[id][view]
  return (
    <div className={'reference-window reference-' + view} style={{ aspectRatio: width / height }}>
      <img
        src={'/images/boards/' + styleCatalog[id].family.toLowerCase() + '.jpg'}
        alt={
          styleName(id) +
          (view === 'profile'
            ? ' side view from the original design board'
            : ' outer-panel detail from the original design board')
        }
        style={{
          width: (1536 / width) * 100 + '%',
          height: (1024 / height) * 100 + '%',
          left: (-left / width) * 100 + '%',
          top: (-top / height) * 100 + '%',
        }}
      />
    </div>
  )
}
