import { useEffect, useLayoutEffect, useMemo } from 'react'
import { useThree } from '@react-three/fiber'
import { CanvasTexture, Color, SRGBColorSpace } from 'three'
import type { ShoeConfig } from '../domain/config'
import { styleCatalog, type StyleId } from '../domain/styles'

type Pen = CanvasRenderingContext2D

const paper = '#faf3e4'
const keyline = '#272e2c'

function line(ctx: Pen, path: string, color: string, width: number) {
  ctx.strokeStyle = color
  ctx.lineWidth = width
  ctx.stroke(new Path2D(path))
}

function shape(ctx: Pen, path: string, fill: string, outline?: string, weight = 2.2) {
  const drawing = new Path2D(path)
  ctx.fillStyle = fill
  ctx.fill(drawing)
  if (outline) {
    ctx.lineWidth = weight
    ctx.strokeStyle = outline
    ctx.stroke(drawing)
  }
}

function dot(ctx: Pen, x: number, y: number, radius: number, ink: string) {
  ctx.fillStyle = ink
  ctx.beginPath()
  ctx.arc(x, y, radius, 0, Math.PI * 2)
  ctx.fill()
}

function inkAgainstLeather(accent: string, upper: string) {
  const luminance = (c: Color) => c.r * 0.2126 + c.g * 0.7152 + c.b * 0.0722
  const dye = new Color(accent)
  const foreground = luminance(dye)
  const leather = luminance(new Color(upper))
  const contrast = (Math.max(foreground, leather) + 0.05) / (Math.min(foreground, leather) + 0.05)
  if (contrast >= 3) return accent
  const darken = leather >= 0.18
  const target = darken ? (leather + 0.05) / 3 - 0.05 : (leather + 0.05) * 3 - 0.05
  const end = new Color(darken ? '#15221e' : paper)
  const mix = Math.min(1, Math.abs((target - foreground) / (luminance(end) - foreground)))
  return '#' + dye.lerp(end, mix).getHexString()
}

function ball(ctx: Pen, x: number, y: number, r: number, felt: string, rim = keyline) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(-0.22)
  ctx.scale(r / 24, r / 24)
  dot(ctx, 0, 0, 24, felt)
  ctx.save()
  ctx.clip()
  const seams = 'M-20 -23 C-5 -17 -4 4 -17 19 M20 23 C5 15 7 -3 18 -18'
  line(ctx, seams, rim, 2.7)
  line(ctx, seams, '#fff7cf', 1.05)
  ctx.restore()
  ctx.beginPath()
  ctx.arc(0, 0, 23.6, 0, Math.PI * 2)
  ctx.strokeStyle = rim
  ctx.lineWidth = 2
  ctx.stroke()
  ctx.restore()
}

// Local origin is at the grip. The clipped strings keep even the smallest frames open.
function racket(ctx: Pen, x: number, y: number, angle: number, scale: number, ink: string) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(angle)
  ctx.scale(scale, scale)
  const head = new Path2D()
  head.ellipse(0, -43, 11, 16, 0, 0, Math.PI * 2)
  ctx.save()
  ctx.clip(head)
  const strings = new Path2D()
  for (let i = -12; i <= 12; i += 4) {
    strings.moveTo(i, -60)
    strings.lineTo(i, -25)
  }
  for (let i = -58; i <= -27; i += 4) {
    strings.moveTo(-12, i)
    strings.lineTo(12, i)
  }
  ctx.lineWidth = 1
  ctx.strokeStyle = ink
  ctx.stroke(strings)
  ctx.restore()
  line(ctx, 'M-6 -29 L0 -19 L6 -29 M0 -19 V-2', ink, 2.3)
  line(ctx, 'M0 -13 V0', ink, 4.5)
  ctx.lineWidth = 2.8
  ctx.strokeStyle = ink
  ctx.stroke(head)
  ctx.restore()
}

function crest(ctx: Pen, x: number, y: number, scale: number, ink: string) {
  ctx.save()
  ctx.translate(x, y)
  ctx.scale(scale, scale)
  racket(ctx, -12, 29, 0.64, 1.12, ink)
  racket(ctx, 12, 29, -0.64, 1.12, ink)
  for (const side of [-1, 1]) {
    ctx.save()
    ctx.scale(side, 1)
    line(ctx, 'M5 43 C49 34 66 -8 45 -42', ink, 2.25)
    // Opposing laurel leaves turn along the stem; the tips are smaller than the base leaves.
    const leaves = [
      [20, 37, 0.99],
      [34, 29, 0.78],
      [45, 17, 0.54],
      [51, 4, 0.24],
      [53, -10, -0.04],
      [51, -22, -0.29],
      [46, -34, -0.54],
    ]
    for (const [px, py, bearing] of leaves) {
      for (const lean of [-0.75, 0.72]) {
        ctx.save()
        ctx.translate(px, py)
        ctx.rotate(bearing + lean)
        const size = py < -15 ? 0.84 : 1
        ctx.scale(size, size)
        shape(ctx, 'M0 0 C-4 -5 -4 -11 0 -16 C4 -11 4 -5 0 0Z', ink)
        ctx.restore()
      }
    }
    ctx.restore()
  }
  ctx.restore()
}

function clubCat(ctx: Pen, x: number, y: number, scale: number, band: string | null) {
  ctx.save()
  ctx.translate(x, y)
  ctx.scale(scale, scale)
  // Separate ear, tail and paw silhouettes remain legible when the shoe is seen in profile.
  shape(ctx, 'M14 18 C26 23 30 16 32 10 C34 7 37 9 37 13 C37 26 25 32 13 29Z', paper, keyline)
  shape(
    ctx,
    'M-15 3 C-22 8 -26 19 -22 24 Q-26 33 -21 34 Q-16 36 -12 29 Q-1 32 11 29 Q15 36 19 31 L20 26 Q28 17 19 6Z',
    paper,
    keyline,
  )
  shape(
    ctx,
    'M-23 -13 Q-24 -21 -18 -25 Q-18 -35 -15 -37 Q-11 -36 -6 -28 Q4 -31 12 -27 Q19 -35 22 -32 L23 -22 C36 -10 29 4 24 8 C16 15 -6 16 -19 8 Q-29 2 -23 -13Z',
    paper,
    keyline,
  )
  if (band) {
    shape(ctx, 'M-23 -21 C-10 -27 11 -28 26 -20 L29 -13 C12 -21 -9 -20 -24 -15Z', band, keyline, 1.5)
  }
  dot(ctx, -9.3, -6.4, 2.45, keyline)
  dot(ctx, 10.8, -7.8, 2.45, keyline)
  shape(ctx, 'M-1 -4 Q1 -5 3 -4 Q3 -1 1 0 Q-1 -1 -1 -4Z', keyline)
  line(ctx, 'M1 -1 Q0 4 -3 2 M1 -1 Q3 3 6 0', keyline, 1.4)
  racket(ctx, -23, 19, -0.63, 0.74, keyline)
  shape(ctx, 'M-13 11 Q-20 13 -24 10 Q-28 9 -28 13 Q-26 18 -17 18', paper, keyline)
  ctx.restore()
}

function player(ctx: Pen, x: number, y: number, scale: number, trim: string, ponytail: boolean) {
  ctx.save()
  ctx.translate(x, y)
  ctx.scale(scale, scale)
  if (ponytail) {
    shape(ctx, 'M17 -12 C27 -18 38 -12 35 -3 Q47 5 38 12 Q30 18 21 8 L16 0Z', trim, keyline)
    racket(ctx, -21, 26, -0.78, 0.62, keyline)
  }
  shape(ctx, 'M-8 4 C-20 8 -25 18 -27 31 Q-10 36 16 31 Q19 15 8 6Z', paper, keyline)
  shape(ctx, 'M-4 7 Q1 14 5 11 L12 7 L16 14 L8 20 L-2 14Z', trim, keyline, 1.4)
  shape(
    ctx,
    'M-22 -14 Q-25 -3 -20 6 Q-12 18 2 16 Q11 16 16 8 Q23 10 24 4 Q25 0 21 -1 Q23 -14 15 -19Z',
    paper,
    keyline,
  )
  shape(
    ctx,
    'M-24 -16 Q-24 -30 -9 -35 Q8 -41 20 -28 Q24 -22 23 -14 L17 -9 Q1 -13 -13 -10Z',
    paper,
    keyline,
  )
  line(ctx, 'M-5 -36 Q4 -33 11 -22', trim, 1.7)
  shape(
    ctx,
    'M-42 -18 Q-27 -26 -7 -22 Q5 -21 18 -12 Q7 -12 -4 -13 Q-20 -12 -33 -13 Q-40 -14 -42 -18Z',
    trim,
    keyline,
  )
  dot(ctx, -13, -1.8, 2.05, keyline)
  dot(ctx, 1, -3, 2.05, keyline)
  line(ctx, 'M-9 6 Q-6 9 -3 5', keyline, 1.5)
  if (ponytail) shape(ctx, 'M-16 20 Q-20 20 -24 16 Q-28 16 -27 21 Q-24 26 -15 27', paper, keyline, 1.8)
  ctx.restore()
}

// The Rallyco net is stretched between posts. The Topspin mesh follows the curved ball path.
function net(ctx: Pen, ink: string, swept: boolean) {
  const count = swept ? 12 : 15
  function point(t: number, h: number) {
    const x = swept ? 348 + t * 530 : 526 + t * 358
    const top = swept ? 230 - 143 * (2 * t - t * t) : 165 - 92 * t + 6 * Math.sin(Math.PI * t)
    const floor = swept ? 231 - 27 * t : 225 - 32 * t
    return [x + (swept ? 15 * h * t : 0), floor + (top - floor) * h] as const
  }
  ctx.strokeStyle = ink
  for (let i = 0; i <= count; i++) {
    const u = i / count
    ctx.beginPath()
    ctx.moveTo(...point(u, 0))
    ctx.lineTo(...point(u, 1))
    ctx.lineWidth = i === 0 || i === count ? 4.8 : 2.9
    ctx.stroke()
  }
  for (let row = 0; row <= 4; row++) {
    ctx.beginPath()
    ctx.moveTo(...point(0, row / 4))
    for (let n = 1; n <= 30; n++) ctx.lineTo(...point(n / 30, row / 4))
    ctx.lineWidth = row === 4 ? 6 : 3
    ctx.stroke()
  }
}

// The crossed leather bands leave a different free area on each of these quarters.
const bandedWordmarks: Partial<Record<StyleId, readonly [number, number, number]>> = {
  'rallyco-court': [535, 96, 0.86],
  'topspin-retro': [287, 91, 0.86],
  'volley-rallyco': [278, 92, 0.86],
}

function wordmark(ctx: Pen, style: StyleId, ink: string) {
  const family = styleCatalog[style].family
  const [x, y, scale] = bandedWordmarks[style] ?? [355, 118, 1]
  ctx.save()
  ctx.translate(x, y)
  ctx.scale(scale, scale)
  ctx.rotate(-0.085)
  ctx.fillStyle = ink
  ctx.font =
    style === 'rallyco-court' ? 'italic bold 94px Georgia, serif' : 'italic 800 88px Arial, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  const half = Math.min(285, ctx.measureText(family).width) / 2
  ctx.fillText(family, 0, 0, half * 2)
  if (style === 'rallyco-classic' || family === 'Volley') {
    const tip = half * 0.69
    line(ctx, 'M' + (-half + 2) + ' -18 Q-49 -62 ' + tip + ' -44', ink, 3)
    ball(ctx, tip + 3, -44, 6.5, style === 'rallyco-classic' ? '#ddd0a7' : '#cbd49b', ink)
    line(ctx, 'M' + -half * 0.59 + ' 31 Q3 50 ' + half * 0.72 + ' 25', ink, 3.7)
  } else if (family === 'Topspin') {
    line(ctx, 'M-53 33 Q-7 28 30 30 M38 -36 Q72 -42 104 -39', ink, 3.5)
  }
  ctx.restore()
}

function paintQuarter(ctx: Pen, style: StyleId, ink: string, accent: string, personalized: boolean) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  switch (style) {
    case 'rallyco-classic':
      clubCat(ctx, 737, 142, 1.88, accent)
      ball(ctx, 572, 184, 15, '#dce16c')
      break
    case 'rallyco-court':
      net(ctx, ink, false)
      ball(ctx, 790, 155, 30, '#d9d962')
      break
    case 'rallyco-retro':
      if (personalized) crest(ctx, 733, 94, 1.35, ink)
      else crest(ctx, 431, 117, 1.65, ink)
      break
    case 'topspin-classic':
      line(ctx, 'M240 246 Q438 177 654 141 M305 246 Q484 173 671 153', ink, 4.3)
      ball(ctx, 646, 134, 17, '#ddc569', ink)
      clubCat(ctx, 815, 149, 1.73, null)
      break
    case 'topspin-rally':
      net(ctx, ink, true)
      ball(ctx, 806, 137, 56, '#e7cf88', ink)
      break
    case 'topspin-retro':
      crest(ctx, 803, 142, 1.5, ink)
      break
    case 'volley-courtline':
      player(ctx, 805, 188, 1.53, accent, false)
      ball(ctx, 645, 191, 17, '#dce17a')
      break
    case 'volley-topspin':
      line(ctx, 'M286 245 Q520 125 790 141', ink, 6)
      ctx.setLineDash([21, 12])
      line(ctx, 'M392 243 Q593 147 784 150', ink, 4)
      ctx.setLineDash([])
      ball(ctx, 814, 141, 46, '#dfe577', keyline)
      break
    case 'volley-rallyco':
      player(ctx, 804, 143, 2, accent, true)
      ball(ctx, 618, 158, 17, '#ead888')
      break
  }
  if (!personalized && style !== 'rallyco-retro') wordmark(ctx, style, ink)
}

/** Transparent decoration for the toe-left, 4:1 quarter panel on the outside of the shoe. */
export function useReferencePrint(config: ShoeConfig): CanvasTexture {
  const invalidate = useThree((state) => state.invalidate)
  const map = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 1024
    canvas.height = 256
    const texture = new CanvasTexture(canvas)
    texture.colorSpace = SRGBColorSpace
    texture.anisotropy = 8
    return texture
  }, [])
  const { colorway, parts, placement, sideText, graphic, advanced, artwork } = config
  const accent = parts.accent.color
  const upper = parts.upper.color
  const personalized =
    placement !== 'inner' && Boolean(sideText.trim() || graphic !== 'none' || (advanced && artwork))
  useLayoutEffect(() => {
    const ctx = (map.image as HTMLCanvasElement).getContext('2d')
    if (!ctx) throw new Error('Unable to create the tennis print.')
    paintQuarter(ctx, colorway, inkAgainstLeather(accent, upper), accent, personalized)
    map.needsUpdate = true
    invalidate()
  }, [map, colorway, accent, upper, personalized, invalidate])
  useEffect(() => () => map.dispose(), [map])
  return map
}
