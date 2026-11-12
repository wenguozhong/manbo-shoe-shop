import { useEffect, useLayoutEffect, useMemo } from 'react'
import { useThree } from '@react-three/fiber'
import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from 'three'
import type { PartId, ShoeConfig } from '../domain/config'

type UpperMaterial = ShoeConfig['parts'][PartId]['material']
type Grain = UpperMaterial | 'rubber' | 'lace'
type CanvasContext = CanvasRenderingContext2D

export const surfaceResponse: Record<
  UpperMaterial,
  { roughness: number; metalness: number; bumpScale: number }
> = {
  matte: { roughness: 0.91, metalness: 0, bumpScale: 0.009 },
  leather: { roughness: 0.49, metalness: 0.015, bumpScale: 0.0052 },
  suede: { roughness: 0.98, metalness: 0, bumpScale: 0.0105 },
  synthetic: { roughness: 0.28, metalness: 0.055, bumpScale: 0.0034 },
}

function canvasMap(width: number, height: number) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  texture.anisotropy = 4
  return texture
}

function context(texture: CanvasTexture) {
  const ctx = (texture.image as HTMLCanvasElement).getContext('2d')
  if (!ctx) throw new Error('Unable to create the shoe texture.')
  return ctx
}

function grainTexture(kind: Grain) {
  const size = 128,
    texture = canvasMap(size, size),
    ctx = context(texture)
  const pixels = ctx.createImageData(size, size)
  let seed = 9877431
  const random = () => {
    seed = (Math.imul(1664525, seed) + 1013904223) | 0
    return (seed >>> 0) / 4294967296
  }
  const noise = Float32Array.from({ length: size * size }, random)
  const cellNoise = (x: number, y: number) => noise[(y & 127) * size + (x & 127)]
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const fiber = cellNoise(x, y) - 0.5
      const weaveX = Math.sin((x * Math.PI) / 3.2),
        weaveY = Math.sin((y * Math.PI) / 3.2)
      let value = 128
      switch (kind) {
        case 'matte':
          value += 42 * ((Math.floor(x / 4) + Math.floor(y / 4)) % 2 ? weaveX : weaveY) + 30 * fiber
          break
        case 'leather': {
          const grain =
            cellNoise(x, y) + cellNoise(x + 1, y) + cellNoise(x, y + 1) + cellNoise(x - 1, y - 1) - 2
          value += grain * 43 + 17 * Math.sin(((x + 2 * Math.cos((y * Math.PI) / 16)) * Math.PI) / 4)
          break
        }
        case 'suede':
          value += 116 * fiber + 28 * (cellNoise(x + 1, y + 1) - 0.5)
          break
        case 'synthetic':
          value += (x % 16 < 2 || y % 16 < 2 ? -35 : 7) + 20 * fiber
          break
        case 'rubber':
          value += 62 * fiber + 10 * Math.sin((x * Math.PI) / 4)
          break
        case 'lace':
          value +=
            49 * Math.sin(((x + y) * Math.PI) / 4) * Math.sin(((x - y) * Math.PI) / 8) + 30 * fiber
          break
      }
      const i = (y * size + x) * 4
      pixels.data[i] = pixels.data[i + 1] = pixels.data[i + 2] = value
      pixels.data[i + 3] = 255
    }
  }
  ctx.putImageData(pixels, 0, 0)
  texture.colorSpace = ''
  texture.wrapS = texture.wrapT = RepeatWrapping
  texture.repeat.set(kind === 'lace' ? 8 : 9, kind === 'lace' ? 2 : 4)
  texture.needsUpdate = true
  return texture
}

export function useGrains() {
  const maps = useMemo(
    () => ({
      matte: grainTexture('matte'),
      leather: grainTexture('leather'),
      suede: grainTexture('suede'),
      synthetic: grainTexture('synthetic'),
      rubber: grainTexture('rubber'),
      lace: grainTexture('lace'),
    }),
    [],
  )
  useEffect(() => () => Object.values(maps).forEach((map) => map.dispose()), [maps])
  return maps
}

function printCentered(ctx: CanvasContext, text: string, font: string, y: number, width?: number) {
  ctx.font = font
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, ctx.canvas.width / 2, y, width)
}

function label(kind: 'heel' | 'insole' | 'sole' | 'tongue' | 'midsole') {
  const texture = canvasMap(512, kind === 'tongue' ? 282 : 190)
  const ctx = context(texture)
  ctx.fillStyle = '#ffffff'
  if (kind === 'tongue') {
    ctx.fillStyle = '#e9e8de'
    ctx.fillRect(0, 0, 512, 282)
    ctx.lineWidth = 3
    ctx.strokeStyle = '#827f77'
    ctx.setLineDash([8, 7])
    ctx.strokeRect(8, 9, 496, 264)
    ctx.setLineDash([])
    ctx.fillStyle = '#131623'
    printCentered(ctx, 'idc. × QINWEN', 'italic 800 55px Arial, sans-serif', 112, 450)
    ctx.fillRect(100, 163, 312, 3)
    printCentered(ctx, 'COLLABORATION CONCEPT', '600 20px Arial, sans-serif', 194)
    ctx.fillStyle = '#1835d8'
    ctx.fillRect(229, 230, 54, 6)
  } else if (kind === 'heel' || kind === 'insole') {
    printCentered(ctx, 'idc.', 'italic 900 125px Arial, sans-serif', 79)
    printCentered(
      ctx,
      kind === 'heel' ? 'C O U R T   0 1' : 'D E S I G N   S T U D I O',
      '700 17px Arial, sans-serif',
      155,
    )
  } else if (kind === 'sole') {
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 3
    ctx.strokeRect(9, 12, 494, 166)
    printCentered(ctx, 'idc. × QINWEN', 'italic 800 46px Arial, sans-serif', 72, 458)
    printCentered(ctx, 'COURT 01   /   COLLABORATION CONCEPT', '600 15px Arial, sans-serif', 127)
  } else {
    printCentered(ctx, 'C O U R T     0 1', 'bold 57px Arial, sans-serif', 102)
  }
  texture.needsUpdate = true
  return texture
}

export function useLabels(style: ShoeConfig['tongueScript']) {
  const labels = useMemo(
    () => ({
      heel: label('heel'),
      insole: label('insole'),
      sole: label('sole'),
      tongue: label('tongue'),
      midsole: label('midsole'),
    }),
    [],
  )
  const script = useMemo(() => {
    const texture = canvasMap(512, 256),
      ctx = context(texture)
    if (style !== 'none') {
      ctx.fillStyle = '#eeeadf'
      ctx.fillRect(0, 0, 512, 256)
      ctx.fillStyle = '#172033'
      const scriptA = style === 'script-a'
      printCentered(
        ctx,
        scriptA ? 'Rally' : 'Court 01',
        scriptA ? 'italic bold 101px Georgia, serif' : 'italic 700 82px cursive',
        96,
      )
      ctx.lineWidth = 3
      ctx.strokeStyle = '#243ccc'
      ctx.beginPath()
      if (scriptA) {
        ctx.moveTo(103, 149)
        ctx.bezierCurveTo(213, 115, 304, 191, 413, 127)
      } else {
        ctx.moveTo(112, 147)
        ctx.lineTo(299, 137)
        ctx.lineTo(270, 163)
        ctx.lineTo(409, 132)
      }
      ctx.stroke()
      printCentered(
        ctx,
        scriptA ? 'CONCEPT SCRIPT  /  A' : 'CONCEPT SCRIPT  /  B',
        '600 20px Arial, sans-serif',
        200,
      )
    }
    return texture
  }, [style])
  useEffect(() => () => Object.values(labels).forEach((map) => map.dispose()), [labels])
  useEffect(() => () => script.dispose(), [script])
  return { ...labels, script }
}

type ArtworkFields = Pick<
  ShoeConfig,
  | 'sideText'
  | 'textFont'
  | 'textColor'
  | 'graphic'
  | 'graphicColor'
  | 'craft'
  | 'advanced'
  | 'artworkTransform'
>

function motif(ctx: CanvasContext, type: ShoeConfig['graphic'], x: number, y: number, size: number) {
  if (type === 'none') return
  ctx.save()
  ctx.translate(x, y)
  ctx.scale(size / 100, size / 100)
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  if (type === 'stripe') {
    for (let i = 0; i < 3; i++) {
      const dx = -53 + i * 30
      ctx.beginPath()
      ctx.moveTo(dx, 33)
      ctx.lineTo(dx + 21, 33)
      ctx.lineTo(dx + 53, -33)
      ctx.lineTo(dx + 32, -33)
      ctx.closePath()
      ctx.fill()
    }
  } else if (type === 'star') {
    ctx.beginPath()
    for (let i = 0; i < 10; i++) {
      const r = i % 2 ? 21 : 47,
        angle = (i * Math.PI) / 5 - Math.PI / 2
      const px = r * Math.cos(angle),
        py = r * Math.sin(angle)
      if (i === 0) ctx.moveTo(px, py)
      else ctx.lineTo(px, py)
    }
    ctx.closePath()
    ctx.fill()
  } else if (type === 'wave') {
    ctx.lineWidth = 7
    for (const offset of [-12, 12]) {
      ctx.beginPath()
      ctx.moveTo(-62, offset + 8)
      ctx.bezierCurveTo(-38, offset - 30, -11, offset - 31, 7, offset - 2)
      ctx.bezierCurveTo(24, offset + 24, 41, offset + 25, 61, offset - 12)
      ctx.stroke()
    }
  } else {
    ctx.lineWidth = 8
    for (let i = 0; i < 3; i++) {
      ctx.beginPath()
      ctx.moveTo(-63 + 15 * i, -22 + 21 * i)
      ctx.bezierCurveTo(-19, -20 + 20 * i, 21 + 10 * i, -29 + 16 * i, 60 - 11 * i, -43 + 12 * i)
      ctx.stroke()
    }
  }
  ctx.restore()
}

function paintArt(texture: CanvasTexture, design: ArtworkFields, image: HTMLImageElement | null) {
  const ctx = context(texture),
    { width, height } = ctx.canvas
  ctx.clearRect(0, 0, width, height)
  ctx.save()
  const stitched = design.advanced && design.craft === 'embroidery'
  if (stitched) {
    ctx.shadowBlur = 4
    ctx.shadowOffsetY = 5
    ctx.shadowColor = 'rgba(22,24,32,.8)'
  }
  if (image) {
    const { x, y, scale } = design.artworkTransform
    const fit = Math.min((width * 0.48) / image.width, (height * 0.75) / image.height) * scale
    const w = image.width * fit,
      h = image.height * fit
    ctx.drawImage(image, width * (0.5 + 0.42 * x) - w / 2, height * (0.5 - 0.37 * y) - h / 2, w, h)
  }
  const hasText = design.sideText.trim().length > 0
  const hasGraphic = design.graphic !== 'none'
  if (hasGraphic) {
    ctx.fillStyle = ctx.strokeStyle = design.graphicColor
    motif(
      ctx,
      design.graphic,
      width * (hasText ? 0.215 : 0.5),
      height * 0.5,
      height * (hasText ? 0.52 : 0.68),
    )
  }
  if (hasText) {
    const fonts = {
      grotesk: 'bold 110px Arial, "Microsoft YaHei", sans-serif',
      condensed: '900 131px Impact, "Arial Narrow", "Microsoft YaHei", sans-serif',
      script: 'italic 700 121px Georgia, "KaiTi", cursive',
    }
    ctx.fillStyle = design.textColor
    ctx.font = fonts[design.textFont]
    ctx.textBaseline = 'middle'
    ctx.textAlign = 'center'
    ctx.translate(width * (hasGraphic ? 0.635 : 0.5), height * 0.51)
    if (design.textFont === 'condensed') ctx.scale(0.76, 1)
    ctx.fillText(design.sideText, 0, 0, width * (hasGraphic ? 0.62 : 0.91))
  }
  ctx.restore()
  if (stitched) {
    // Satin threads are clipped to the actual ink and cast a narrow relief shadow.
    ctx.save()
    ctx.globalCompositeOperation = 'source-atop'
    for (let x = -height; x < width + height; x += 6) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x - height * 0.45, height)
      ctx.strokeStyle = 'rgba(255,255,251,.49)'
      ctx.lineWidth = 1.7
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(x + 2, 0)
      ctx.lineTo(x + 2 - height * 0.45, height)
      ctx.strokeStyle = 'rgba(25,22,30,.43)'
      ctx.lineWidth = 1.65
      ctx.stroke()
    }
    ctx.restore()
  }
  texture.needsUpdate = true
}

/** RGBA art in left-to-right panel UVs. Reusable on a licensed model's side panel UV set. */
export function useSideArtwork(config: ShoeConfig) {
  const invalidate = useThree((state) => state.invalidate)
  const map = useMemo(() => canvasMap(896, 256), [])
  const { sideText, textFont, textColor, graphic, graphicColor, craft, advanced, artworkTransform } =
    config
  const imageUrl = advanced ? config.artwork?.dataUrl : undefined
  const design = useMemo(
    () => ({
      sideText,
      textFont,
      textColor,
      graphic,
      graphicColor,
      craft,
      advanced,
      artworkTransform,
    }),
    [sideText, textFont, textColor, graphic, graphicColor, craft, advanced, artworkTransform],
  )
  // A moving decal reuses the already-decoded image instead of decoding on each slider event.
  const artwork = useMemo(() => {
    if (!imageUrl) return null
    const image = new Image()
    image.src = imageUrl
    return image
  }, [imageUrl])
  useLayoutEffect(() => {
    const paint = () => {
      paintArt(map, design, artwork?.complete && artwork.naturalWidth > 0 ? artwork : null)
      invalidate()
    }
    paint()
    artwork?.addEventListener('load', paint)
    return () => artwork?.removeEventListener('load', paint)
  }, [artwork, design, invalidate, map])
  useEffect(() => () => map.dispose(), [map])
  return map
}
