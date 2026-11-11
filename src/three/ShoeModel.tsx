import { useEffect, useMemo, useState } from 'react'
import type { ThreeEvent } from '@react-three/fiber'
import { Color, DoubleSide, type CanvasTexture } from 'three'
import type { PartId, ShoeConfig } from '../domain/config'
import { buildLacing, buildShoe, type ShoePiece } from './shoeGeometry'
import { surfaceResponse, useGrains, useLabels, useSideArtwork } from './appearance'

type Props = {
  config: ShoeConfig
  selected: PartId | null
  onSelect?: (part: PartId) => void
}

const tint = (value: string, pigment: string, amount: number) =>
  new Color(value).lerp(new Color(pigment), amount)

function ink(value: string) {
  const c = new Color(value)
  const brightness = 0.213 * c.r + 0.715 * c.g + 0.072 * c.b
  return brightness > 0.27 ? '#252831' : '#edece4'
}

type SurfaceProps = {
  piece: ShoePiece
  config: ShoeConfig
  state: 'selected' | 'hovered' | ''
  grains: ReturnType<typeof useGrains>
  labels: ReturnType<typeof useLabels>
  sideArtwork: CanvasTexture
}

function PieceMaterial({ piece, config, state, grains, labels, sideArtwork }: SurfaceProps) {
  const { part, finish } = piece
  const { color, material } = config.parts[part]
  const response = surfaceResponse[material]
  let pigment: string | Color = color
  let { roughness, metalness, bumpScale } = response
  let grain: CanvasTexture | null = grains[material]
  let map: CanvasTexture | null = null
  switch (finish) {
    case 'surface':
      if (part === 'laces' && material === 'matte') grain = grains.lace
      break
    case 'rubber':
      grain = material === 'matte' || material === 'synthetic' ? grains.rubber : grains[material]
      break
    case 'edge':
      pigment = tint(color, '#111515', 0.065)
      roughness = Math.min(1, roughness + 0.04)
      break
    case 'seam':
      pigment = tint(color, '#171919', 0.36)
      grain = null
      roughness = 0.88
      metalness = 0
      break
    case 'thread': {
      const lightBase = ink(color) === '#252831'
      pigment = tint(color, lightBase ? '#55554c' : '#d3d2c4', lightBase ? 0.2 : 0.14)
      grain = null
      roughness = 0.82
      metalness = 0
      break
    }
    case 'lining':
      pigment = tint('#27292c', color, 0.095)
      grain = grains.matte
      bumpScale = 0.008
      roughness = 0.95
      metalness = 0
      break
    case 'fabric':
      pigment = tint(color, '#5e6060', 0.28)
      grain = grains.matte
      bumpScale = 0.011
      roughness = 0.89
      metalness = 0
      break
    case 'metal':
      pigment = '#9b9b97'
      grain = null
      roughness = 0.34
      metalness = 0.58
      break
    case 'hole':
      pigment = tint('#202223', color, 0.065)
      grain = null
      roughness = 1
      metalness = 0
      break
    case 'groove':
      pigment = tint(color, '#444641', 0.24)
      grain = null
      roughness = 0.9
      metalness = 0
      break
    case 'tread':
      pigment = tint(color, '#0d1111', 0.13)
      grain = grains.rubber
      bumpScale = 0.007
      break
    case 'contrast':
      pigment = ink(color)
      grain = grains.lace
      roughness = 0.77
      metalness = 0
      break
    case 'outerMark':
    case 'innerMark': {
      const embroidery = config.advanced && config.craft === 'embroidery'
      map = sideArtwork
      pigment = '#ffffff'
      metalness = 0
      roughness = embroidery ? 0.94 : 0.55
      grain = embroidery ? sideArtwork : null
      bumpScale = embroidery ? 0.012 : 0
      break
    }
    case 'heelMark':
      map = labels.heel
      pigment = ink(color)
      break
    case 'soleMark':
      map = labels.sole
      pigment = ink(color)
      break
    case 'insoleMark':
      map = labels.insole
      pigment = '#deded3'
      break
    case 'tongueTag':
      map = labels.tongue
      pigment = '#ffffff'
      break
    case 'scriptTag':
      map = labels.script
      pigment = '#ffffff'
      break
    case 'midsoleStamp':
      map = labels.midsole
      pigment = tint(color, ink(color), 0.42)
      break
  }
  if (map && map !== sideArtwork) {
    grain = null
    metalness = 0
    roughness = 0.79
  }
  const highlight = state === 'selected' ? 0.105 : state === 'hovered' ? 0.043 : 0
  return (
    <meshStandardMaterial
      color={pigment}
      map={map}
      bumpMap={grain}
      bumpScale={bumpScale}
      roughness={roughness}
      metalness={metalness}
      side={DoubleSide}
      emissive="#3859fc"
      emissiveIntensity={highlight}
      transparent={map !== null}
      alphaTest={map ? 0.06 : 0}
      depthWrite={!map}
      polygonOffset={map !== null}
      polygonOffsetFactor={-1}
      polygonOffsetUnits={-1}
    />
  )
}

export default function ShoeModel({ config, selected, onSelect }: Props) {
  const body = useMemo(() => buildShoe(config.silhouette), [config.silhouette])
  const laces = useMemo(
    () => buildLacing(config.silhouette, config.laceType),
    [config.silhouette, config.laceType],
  )
  useEffect(() => () => body.forEach((p) => p.geometry.dispose()), [body])
  useEffect(() => () => laces.forEach((p) => p.geometry.dispose()), [laces])
  const grains = useGrains()
  const labels = useLabels(config.tongueScript)
  const sideArtwork = useSideArtwork(config)
  const [hovered, setHovered] = useState<PartId | null>(null)

  function pointer(event: ThreeEvent<PointerEvent>) {
    if (!onSelect) return
    event.stopPropagation()
    setHovered(event.object.userData.part as PartId)
  }
  function pick(event: ThreeEvent<MouseEvent>) {
    if (!onSelect) return
    event.stopPropagation()
    if (event.delta <= 4) onSelect(event.object.userData.part as PartId)
  }
  const hasMark = Boolean(
    config.sideText || config.graphic !== 'none' || (config.advanced && config.artwork),
  )

  return (
    <group
      name="IDC Court 01"
      onClick={pick}
      onPointerOver={pointer}
      onPointerMove={pointer}
      onPointerOut={() => setHovered(null)}
    >
      {[...body, ...laces].map((piece) => {
        const { part, finish } = piece
        if (finish === 'outerMark' && (!hasMark || config.placement === 'inner')) return null
        if (finish === 'innerMark' && (!hasMark || config.placement === 'outer')) return null
        if (finish === 'scriptTag' && config.tongueScript === 'none') return null
        return (
          <mesh
            key={part + ':' + finish}
            name={part + '_' + finish}
            geometry={piece.geometry}
            castShadow
            receiveShadow
            userData={{ part }}
          >
            <PieceMaterial
              piece={piece}
              config={config}
              grains={grains}
              labels={labels}
              sideArtwork={sideArtwork}
              state={selected === part ? 'selected' : hovered === part ? 'hovered' : ''}
            />
          </mesh>
        )
      })}
    </group>
  )
}
