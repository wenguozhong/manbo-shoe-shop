import { BufferGeometry, CatmullRomCurve3, Vector3 } from 'three'
import type { PartId, ShoeConfig } from '../domain/config'
import type { StyleId } from '../domain/styles'
import { LENGTH, ShoeLast, lerp, longitudinal, type Side } from './last'
import { MeshBuilder, type Surface } from './mesh'

export type Finish =
  | 'surface'
  | 'edge'
  | 'seam'
  | 'thread'
  | 'lining'
  | 'fabric'
  | 'metal'
  | 'hole'
  | 'rubber'
  | 'groove'
  | 'tread'
  | 'contrast'
  | 'referenceMark'
  | 'outerMark'
  | 'innerMark'
  | 'heelMark'
  | 'soleMark'
  | 'insoleMark'
  | 'tongueTag'
  | 'scriptTag'
  | 'midsoleStamp'

export interface ShoePiece {
  part: PartId
  finish: Finish
  geometry: BufferGeometry
}

class Assembly {
  private builders = new Map<string, { part: PartId; finish: Finish; mesh: MeshBuilder }>()

  mesh(part: PartId, finish: Finish) {
    const key = part + '/' + finish
    let entry = this.builders.get(key)
    if (!entry) {
      entry = { part, finish, mesh: new MeshBuilder() }
      this.builders.set(key, entry)
    }
    return entry.mesh
  }

  pieces(): ShoePiece[] {
    return [...this.builders.values()].map(({ part, finish, mesh }) => ({
      part,
      finish,
      geometry: mesh.finish(),
    }))
  }
}

const sides: readonly Side[] = [1, -1]
const ease = (u: number) => 0.5 - 0.5 * Math.cos(Math.PI * u)

function edgeStitch(
  a: Assembly,
  part: PartId,
  surface: Surface,
  edges: ('top' | 'bottom' | 'left' | 'right')[],
) {
  const seam = a.mesh(part, 'seam'),
    thread = a.mesh(part, 'thread')
  for (const edge of edges) {
    const along = (pad: number) => (t: number) => {
      const coordinate = lerp(0.009, 0.991, t)
      if (edge === 'top') return surface(coordinate, 1 - pad)
      if (edge === 'bottom') return surface(coordinate, pad)
      if (edge === 'left') return surface(pad, coordinate)
      return surface(1 - pad, coordinate)
    }
    seam.tube(along(0.002), 50, 0.0035, 0.0035, 5)
    thread.stitches(along(0.045))
  }
}

function makeSole(a: Assembly, last: ShoeLast) {
  const sole = a.mesh('outsole', 'rubber')
  const mid = a.mesh('midsole', 'surface')
  const edgeHeight = last.family === 'volley' ? 0.073 : 0.054

  function loft(target: MeshBuilder, levels: [number, number][], followCup: boolean) {
    for (let i = 1; i < levels.length; i++) {
      const [h0, r0] = levels[i - 1],
        [h1, r1] = levels[i]
      target.grid(100, 1, (u, v) => {
        const x = -LENGTH * Math.cos(u * Math.PI * 2)
        const extra = followCup ? last.topOfSole(x) - last.rocker(x) - last.thickness : 0
        const level = lerp(h0, h1, v)
        const h = level + extra * Math.max(0, (level - edgeHeight) / (last.thickness - edgeHeight))
        return last.soleEdge(u, h, lerp(r0, r1, v))
      })
    }
  }
  loft(
    sole,
    [
      [0.011, 0.978],
      [0.018, 0.992],
      [edgeHeight - 0.018, 1.001],
      [edgeHeight - 0.005, 1.002],
      [edgeHeight, 0.999],
    ],
    false,
  )
  loft(
    mid,
    [
      [edgeHeight, 0.999],
      [edgeHeight + 0.017, 1.004],
      [0.115, 1.008],
      [last.thickness - 0.066, 1.001],
    ],
    true,
  )
  // Mold the foxing lip and its colored retro pinstripe into adjoining bands of rubber.
  const pinstripe = last.style === 'rallyco-retro' ? a.mesh('accent', 'rubber') : mid
  loft(pinstripe, [[last.thickness - 0.066, 1.001], [last.thickness - 0.053, 1.001]], true)
  loft(mid, [
    [last.thickness - 0.053, 1.001],
    [last.thickness - 0.046, 0.998],
    [last.thickness - 0.036, 1.003],
    [last.thickness - 0.021, 1.001],
    [last.thickness - 0.006, 0.981],
    [last.thickness, 0.96],
  ], true)

  function capPoint(u: number, v: number, bottom: boolean) {
    const x = longitudinal(u),
      w = 2 * v - 1
    const side: Side = w < 0 ? -1 : 1
    const scale = bottom ? 0.979 : 0.961
    return new Vector3(
      x * scale,
      bottom ? last.rocker(x) + 0.012 : last.topOfSole(x) - 0.001,
      last.center(x) + scale * w * last.width(x, side),
    )
  }
  sole.grid(60, 8, (u, v) => capPoint(u, v, true))
  mid.grid(60, 8, (u, v) => capPoint(u, v, false), true)

  a.mesh('midsole', 'midsoleStamp').grid(18, 3, (u, v) => {
    const x = lerp(-1.25, -0.47, u),
      fraction = Math.acos(-x / LENGTH) / (Math.PI * 2)
    return last.soleEdge(fraction, lerp(0.105, last.thickness - 0.08, v), 1.01)
  })

  const tread = a.mesh('outsole', 'tread')
  // Herringbone is modeled relief; the empty center under the arch carries the mark.
  for (let row = -15; row <= 15; row++) {
    const x0 = row * 0.105
    for (const side of sides) {
      const pivot = Math.abs(x0 - 0.99) < 0.30
      const start = x0 > -0.97 && x0 < 0.29 ? 0.65 : pivot ? 0.47 : 0.065
      const spans =
        start > 0.5
          ? [[start, 0.87]]
          : [
              [start, 0.43],
              [0.49, 0.87],
            ]
      for (const [low, high] of spans) {
        const treadPoint = (u: number, v: number) => {
          const w = lerp(low, high, v)
          const shift = (row < -9 ? 1 : -1) * 0.093 * w + 0.019 * Math.sin(Math.PI * w)
          const x = x0 + shift + u * 0.05
          return new Vector3(x, last.rocker(x) + 0.001, last.center(x) + side * w * last.width(x, side))
        }
        tread.grid(2, 5, treadPoint, side < 0)
        for (const uEdge of [0, 1]) {
          tread.grid(
            5,
            1,
            (v, h) => {
              const point = treadPoint(uEdge, v)
              point.y += 0.013 * h
              return point
            },
            (side === 1) === (uEdge === 1),
          )
        }
      }
    }
  }
  const pivotCenter = new Vector3(0.99, last.rocker(0.99) + 0.001, last.center(0.99))
  const down = new Vector3(0, -1, 0)
  tread.disc(pivotCenter, down, 0.208, 54)
  tread.ring(pivotCenter, down, 0.233, 0.009, 54)
  // Two molded arcs give the forefoot pivot the seam pattern of a tennis ball.
  for (const side of sides) {
    a.mesh('outsole', 'groove').tube((t) => {
      const x = lerp(-0.13, 0.13, t)
      return pivotCenter.clone().add(new Vector3(x, -0.003, side * (0.143 - 0.083 * Math.sin(Math.PI * t))))
    }, 32, 0.008, 0.0045, 7)
  }
  a.mesh('outsole', 'soleMark').grid(22, 5, (u, v) => {
    const x = lerp(-0.9, 0.3, u)
    return new Vector3(x, last.rocker(x) + 0.009, lerp(-0.223, 0.223, v) + last.center(x))
  })
}

type Edge = 'top' | 'bottom' | 'left' | 'right'
type Leather = (u: number, v: number, depth: number) => Vector3

function stitchedOverlay(
  a: Assembly,
  part: PartId,
  surface: Leather,
  reverse: boolean,
  edges: Edge[],
  top = 0.019,
) {
  const face: Surface = (u, v) => surface(u, v, top)
  a.mesh(part, 'surface').grid(44, 9, face, reverse)
  const edge = a.mesh(part, 'edge')
  // The leather edge has a real cut face visible in the three-quarter and heel views.
  for (const which of edges) {
    edge.grid(40, 1, (u, v) => {
      const depth = lerp(top - 0.013, top, v)
      if (which === 'top' || which === 'bottom') return surface(u, which === 'top' ? 1 : 0, depth)
      return surface(which === 'right' ? 1 : 0, u, depth)
    }, reverse !== (which === 'top' || which === 'left'))
  }
  edgeStitch(a, part, face, edges)
  return face
}

function quarterTrims(a: Assembly, last: ShoeLast, side: Side) {
  const { style } = last
  // The curved strips travel from forefoot to heel. The diagonals grow from the welt towards the instep.
  function sweep(front: number, rear: number, low: (u: number) => number, width: (u: number) => number) {
    const band: Leather = (u, v, depth) => last.panel(lerp(front, rear, u), low(u) + v * width(u), side, depth)
    stitchedOverlay(a, 'accent', band, side > 0, ['top', 'bottom'], 0.019)
  }
  function slash(foot: number, shoulder: number, width: number, height: number) {
    const band: Leather = (u, v, depth) => {
      const center = lerp(foot, shoulder, v) + 0.025 * Math.sin(Math.PI * v)
      return last.panel(center + (u - 0.5) * width, lerp(0.014, height, v), side, depth)
    }
    stitchedOverlay(a, 'accent', band, side < 0, ['left', 'right', 'top'], 0.02)
  }
  function piping(track: (u: number) => [number, number], radius = 0.012) {
    a.mesh('accent', 'surface').tube((u) => {
      const [x, t] = track(u)
      return last.panel(x, t, side, 0.015)
    }, 64, radius, radius, 7)
  }

  switch (style) {
    case 'rallyco-classic':
      sweep(-1.15, -1.71, (u) => 0.014 + 0.55 * u ** 1.16, (u) => 0.058 + 0.035 * u)
      break
    case 'rallyco-court':
      slash(0.19, 0.63, 0.14, 0.69)
      slash(-0.068, 0.383, 0.14, 0.65)
      break
    case 'rallyco-retro':
      sweep(0.09, -1.71, (u) => 0.005 + 0.42 * u ** 1.32, (u) => 0.068 + 0.032 * Math.sin(Math.PI * u))
      break
    case 'topspin-classic':
      sweep(1.26, 0.64, (u) => 0.004 + 0.19 * u, (u) => 0.08 + 0.02 * Math.sin(Math.PI * u))
      sweep(-1.51, -1.765, (u) => 0.012 + 0.04 * u, (u) => 0.023 + 0.48 * u)
      break
    case 'topspin-rally':
      sweep(-1.06, -1.765, () => 0.018, (u) => 0.025 + 0.48 * u ** 1.7)
      break
    case 'topspin-retro':
      slash(-0.04, -0.52, 0.146, 0.43)
      slash(-0.33, -0.8, 0.158, 0.46)
      break
    case 'volley-courtline':
      piping((u) => [lerp(0.77, -1.32, u), 0.027 + 0.36 * u], 0.013)
      piping((u) => [lerp(0.78, 0.025, u), 0.81 * (1 - u) + 0.01], 0.0125)
      piping((u) => [lerp(-1.2, -1.73, u), 0.37 * (1 - u ** 1.8) + 0.012], 0.013)
      break
    case 'volley-topspin':
      sweep(-0.91, -1.77, () => 0.018, (u) => 0.025 + 0.21 * u)
      break
    case 'volley-rallyco':
      slash(0.045, -0.37, 0.128, 0.48)
      slash(-0.175, -0.59, 0.095, 0.45)
      break
  }
}

function makeUpper(a: Assembly, last: ShoeLast) {
  for (const side of sides) {
    const reverse = side < 0
    a.mesh('upper', 'surface').grid(88, 25, (u, t) => last.surface(longitudinal(u), t, side), reverse)
    const quarterSkin: Leather = (u, v, depth) => {
      const rearEdge = -1.58 + 0.10 * v
      const toeEdge = 0.43 + 0.46 * v + 0.043 * Math.sin(Math.PI * v)
      const x = lerp(rearEdge, toeEdge, u)
      const shoulder = 0.605 + 0.24 * Math.sin(Math.PI * u) + 0.077 * u
      return last.panel(x, lerp(0.018, shoulder, v), side, depth)
    }
    const leather = stitchedOverlay(a, 'upper', quarterSkin, reverse, ['top', 'right'], 0.01)
    a.mesh('upper', 'thread').stitches((v) => leather(0.988, v), 0.047, 0.0031)

    // A U-shaped rand sits around an uninterrupted, perforated leather vamp.
    const longCap = last.style === 'rallyco-classic' || last.style === 'volley-topspin'
    const blockedToe = last.style === 'topspin-rally' || last.style === 'volley-rallyco'
    const mudguard: Leather = (u, v, depth) => {
      const toeJoint = (longCap ? 0.37 : 0.56) + v * (blockedToe ? 0.105 : 0.32)
      const x = lerp(toeJoint, LENGTH, ease(u))
      const notch = blockedToe ? 0.39 * (1 - u) ** 4 : 0
      const top = 0.26 + 0.565 * u + notch + 0.043 * Math.sin(1.5 * Math.PI * u)
      return last.panel(x, lerp(0.012, top, v), side, depth)
    }
    const cap = stitchedOverlay(a, 'toe', mudguard, reverse, ['top', 'left'], 0.018)
    a.mesh('toe', 'thread').stitches((u) => cap(u, 0.88), 0.05, 0.0031)
    const vents = a.mesh('upper', 'hole')
    const ventLips = a.mesh('upper', 'seam')
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < (row === 3 ? 2 : 3); col++) {
        const t = 0.71 + 0.107 * col + 0.017 * (row % 2)
        const x = 0.985 + 0.139 * row + 0.07 * (t - 0.7)
        const point = last.panel(x, t, side, 0.004)
        const normal = last.normal(x, t, side)
        vents.disc(point, normal, 0.0108)
        ventLips.ring(point, normal, 0.0124, 0.0019, 12)
      }
    }
    if (last.style === 'rallyco-classic' || last.style === 'rallyco-retro') {
      for (let dot = 0; dot < 5; dot++) {
        const x = 0.30 - dot * 0.092
        const t = last.atHeight(x, 0.103 + 0.017 * (dot % 2))
        vents.disc(last.panel(x, t, side, 0.014), last.normal(x, t, side), 0.0084)
      }
    }

    // Folded heel tab wraps across the back and narrows to a point at the collar dip.
    const heelTab: Leather = (u, v, depth) => {
      const front = -1.095 + 0.14 * v
      const x = lerp(-LENGTH, front, ease(u))
      const bottom = 0.35 + 0.485 * u ** 1.55
      return last.panel(x, lerp(bottom, 0.991, v), side, depth)
    }
    stitchedOverlay(a, 'heel', heelTab, reverse, ['bottom', 'right'], 0.023)
    const counterSeam = (v: number) => last.panel(-1.48 + v * 0.16, lerp(0.013, 0.55, v), side, 0.0035)
    a.mesh('upper', 'thread').stitches(counterSeam, 0.044, 0.0033)
    quarterTrims(a, last, side)

    const facingPart = last.style === 'rallyco-classic' || last.style === 'rallyco-court' ? 'accent' : 'upper'
    const facing: Leather = (u, v, depth) => {
      const x = lerp(-0.594 + 0.091 * (1 - v), 0.92 - 0.144 * (1 - v) ** 2, u)
      const low = 0.585 + 0.1 * Math.sin(Math.PI * u) - 0.053 * Math.sin(2 * Math.PI * u)
      return last.panel(x, lerp(low, 0.997, v), side, depth)
    }
    stitchedOverlay(a, facingPart, facing, reverse, ['bottom', 'left', 'right'], 0.026)

    // u runs toe to heel, with independent physical height so the type does not ripple over the instep.
    const quarter = (u: number, v: number, depth: number) => {
      const x = lerp(0.775, -1.56, u)
      const ceiling = Math.min(0.601, last.upperHeight(x) * 0.865)
      return last.panel(x, last.atHeight(x, lerp(0.022, ceiling, v)), side, depth)
    }
    if (side === -1) {
      a.mesh('accent', 'referenceMark').grid(55, 14, (u, v) => quarter(u, v, 0.015))
    }
    a.mesh('accent', side === -1 ? 'outerMark' : 'innerMark').grid(42, 11,
      (u, v) => quarter(lerp(0.07, 0.66, u), lerp(0.2, 0.95, v), 0.031),
      side === 1, side === 1)

    a.mesh('upper', 'lining').grid(58, 12, (u, v) => {
      const x = lerp(-LENGTH, 0.31, ease(u))
      return last.insole(x, side).lerp(last.surface(x, 1, side), v)
    }, !reverse)
  }
  // Padded binding follows the actual opening and sits inboard of the folded upper edge.
  const collar = (u: number) => {
    const side: Side = u < 0.5 ? -1 : 1
    const x = -LENGTH + (LENGTH - 0.456) * (1 - Math.cos((Math.abs(2 * u - 1) * Math.PI) / 2))
    const p = last.surface(x, 1, side)
    p.z -= side * Math.min(0.017, last.width(x, side) * 0.1)
    p.y += 0.002
    return p
  }
  a.mesh('upper', 'fabric').tube(collar, 112, 0.045, 0.032, 10)
  a.mesh('upper', 'thread').stitches((u) => {
    const p = collar(u)
    p.z += (u < 0.5 ? -1 : 1) * 0.031
    p.y -= 0.023
    return p
  }, 0.049, 0.0033)
  a.mesh('heel', 'heelMark').grid(34, 8, (u, v) => {
    const w = 2 * u - 1
    return last.panel(-LENGTH + 0.108 * w * w, lerp(0.50, 0.84, v), w >= 0 ? 1 : -1, 0.028)
  })
  a.mesh('upper', 'lining').grid(45, 12, (u, v) => last.insole(lerp(-LENGTH, 0.83, ease(u)), 2 * v - 1), true)
  a.mesh('upper', 'insoleMark').grid(16, 5, (u, v) => {
    const p = last.insole(lerp(-1.432, -0.786, u), lerp(0.495, -0.495, v))
    p.y += 0.005
    return p
  })
}

function makeTongue(a: Assembly, last: ShoeLast) {
  const surface = (u: number, v: number, offset: number) => {
    const w = 2 * v - 1
    const x = lerp(-0.646 + 0.073 * Math.abs(w) ** 3, 1.015 - 0.045 * w ** 2, u)
    return last.tongue(x, w, offset)
  }
  a.mesh('tongue', 'surface').grid(46, 15, (u, v) => surface(u, v, 0), true)
  a.mesh('tongue', 'fabric').grid(46, 15, (u, v) => surface(u, v, -0.044))
  const edges = a.mesh('tongue', 'edge')
  for (const v of [0, 1]) {
    edges.grid(40, 2, (u, t) => surface(u, v, -0.044 * t), v === 1)
    a.mesh('tongue', 'thread').stitches((u) => surface(u, v === 1 ? 0.97 : 0.03, 0.003), 0.046, 0.0034)
  }
  edges.grid(24, 3, (v, t) => surface(0, v, -0.044 * t))
  edges.tube((v) => surface(0, v, -0.018), 24, 0.019, 0.02, 9)
  a.mesh('tongue', 'tongueTag').grid(16, 16, (u, v) =>
    last.tongue(lerp(-0.308, -0.585, v), lerp(0.703, -0.703, u), 0.005),
  )
  a.mesh('tongue', 'scriptTag').grid(16, 16, (u, v) =>
    last.tongue(lerp(-0.342, -0.594, v), lerp(-0.716, 0.716, u), -0.05),
  )
}

export function buildShoe(silhouette: ShoeConfig['silhouette'], style: StyleId = 'rallyco-classic') {
  const last = new ShoeLast(silhouette === 'bold-low', style)
  const assembly = new Assembly()
  makeSole(assembly, last)
  makeUpper(assembly, last)
  makeTongue(assembly, last)
  return assembly.pieces()
}

export function buildLacing(silhouette: ShoeConfig['silhouette'], type: ShoeConfig['laceType'], style: StyleId = 'rallyco-classic') {
  const last = new ShoeLast(silhouette === 'bold-low', style)
  const a = new Assembly()
  const rows = [-0.424, -0.221, -0.018, 0.183, 0.383, 0.578]
  for (const x of rows) {
    for (const side of sides) {
      const eye = last.eye(x, side),
        n = last.normal(x, 0.806, side)
      a.mesh('laces', 'hole').disc(eye, n, 0.028)
      a.mesh('laces', 'metal').ring(eye, n, 0.029, 0.0035, 20)
    }
  }
  function bridge(xa: number, xb: number, side: Side, over: boolean) {
    const start = last.eye(xa, side),
      other = side === 1 ? -1 : 1,
      end = last.eye(xb, other)
    const startNormal = last.normal(xa, 0.806, side), endNormal = last.normal(xb, 0.806, other)
    const rope = type === 'rope'
    const middle = Array.from({ length: 17 }, (_, i) => {
      const t = lerp(0.06, 0.94, i / 16)
      const p = start.clone().lerp(end, t)
      const station = lerp(xa, xb, t)
      const lift = over ? (rope ? 0.053 : 0.032) * Math.sin(Math.PI * t) ** 5 : 0
      p.y = last.laceBed(station, p.z) + (rope ? 0.023 : 0.014) + lift
      return p
    })
    const spline = new CatmullRomCurve3([
      start.clone().addScaledVector(startNormal, -0.014),
      start.clone().addScaledVector(startNormal, 0.013),
      start.clone().addScaledVector(startNormal, 0.027).lerp(middle[0], 0.25),
      ...middle,
      end.clone().addScaledVector(endNormal, 0.027).lerp(middle[middle.length - 1], 0.25),
      end.clone().addScaledVector(endNormal, 0.013),
      end.clone().addScaledVector(endNormal, -0.014),
    ])
    const taper = (t: number) => Math.min(1, Math.min(t, 1 - t) / 0.105)
    a.mesh('laces', 'surface').tube(
      (t) => spline.getPoint(t),
      30,
      (t) => lerp(0.017, rope ? 0.026 : 0.039, taper(t)),
      (t) => lerp(0.011, rope ? 0.026 : 0.013, taper(t)),
      rope ? 10 : 8,
    )
    if (type === 'contrast') {
      // Two structural tracer yarns remain visible even on a black dyed ground.
      for (const direction of [-1, 1]) {
        a.mesh('laces', 'contrast').tube(
          (t) => {
            const p = spline.getPoint(t),
              tangent = spline.getTangent(t)
            const cross = tangent
              .clone()
              .cross(new Vector3(0, 1, 0))
              .normalize()
            const up = cross.clone().cross(tangent).normalize()
            return p.addScaledVector(cross, direction * 0.022 * taper(t)).addScaledVector(up, 0.011)
          },
          24,
          0.0046,
          0.0038,
          5,
        )
      }
    }
  }
  for (let i = 0; i < rows.length - 1; i++) {
    bridge(rows[i], rows[i + 1], 1, false)
    bridge(rows[i], rows[i + 1], -1, true)
  }
  bridge(rows[5], rows[5], 1, false)
  return a.pieces()
}
