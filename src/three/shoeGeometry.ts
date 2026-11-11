import { BufferGeometry, CatmullRomCurve3, Vector3 } from 'three'
import type { PartId, ShoeConfig } from '../domain/config'
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
const endOfQuarter = (t: number) => 0.75 + 0.243 * t + 0.036 * Math.sin(t * Math.PI)

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

  function loft(target: MeshBuilder, levels: [number, number][], followCup: boolean) {
    for (let i = 1; i < levels.length; i++) {
      const [h0, r0] = levels[i - 1],
        [h1, r1] = levels[i]
      target.grid(100, 1, (u, v) => {
        const x = -LENGTH * Math.cos(u * Math.PI * 2)
        const extra = followCup ? last.topOfSole(x) - last.rocker(x) - last.thickness : 0
        const h = lerp(h0 + (extra * h0) / last.thickness, h1 + (extra * h1) / last.thickness, v)
        return last.soleEdge(u, h, lerp(r0, r1, v))
      })
    }
  }
  loft(
    sole,
    [
      [0.011, 0.978],
      [0.018, 0.992],
      [0.034, 1.001],
      [0.067, 1.003],
      [0.079, 0.997],
    ],
    false,
  )
  loft(
    mid,
    [
      [0.072, 0.995],
      [0.082, 1.004],
      [0.101, 1.008],
      [last.thickness - 0.055, 1.001],
      [last.thickness - 0.022, 0.991],
      [last.thickness - 0.004, 0.978],
      [last.thickness, 0.96],
    ],
    true,
  )

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

  // The cupsole stitch follows the sidewall just below the rolled lip.
  const welt = (t: number, drop: number, r: number) => {
    const x = -LENGTH * Math.cos(t * 2 * Math.PI)
    return last.soleEdge(t, last.topOfSole(x) - last.rocker(x) - drop, r)
  }
  a.mesh('midsole', 'groove').tube((t) => welt(t, 0.049, 1.0015), 144, 0.008, 0.005, 6)
  a.mesh('midsole', 'thread').stitches((t) => welt(t, 0.046, 1.004), 0.068, 0.0041)
  a.mesh('midsole', 'groove').tube((t) => last.soleEdge(t, 0.097, 1.008), 144, 0.003, 0.003, 5)
  // Short fine mold ribs only on the front bumper leave the quarter clean.
  const emboss = a.mesh('midsole', 'edge')
  for (let i = -38; i <= 38; i++) {
    const at = 0.5 + i * 0.00235
    emboss.tube(
      (t) => last.soleEdge(at + 0.00065 * t, lerp(0.112, last.thickness - 0.067, t), 1.0055),
      2,
      0.0025,
      0.0025,
      4,
    )
  }
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
      const start = x0 > -0.97 && x0 < 0.29 ? 0.65 : 0.075
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
  a.mesh('outsole', 'soleMark').grid(22, 5, (u, v) => {
    const x = lerp(-0.9, 0.3, u)
    return new Vector3(x, last.rocker(x) + 0.009, lerp(-0.223, 0.223, v) + last.center(x))
  })
}

function makeUpper(a: Assembly, last: ShoeLast) {
  for (const side of sides) {
    const reverse = side < 0
    const front = (u: number, t: number) => last.surface(lerp(endOfQuarter(t), LENGTH, ease(u)), t, side)
    const body = (u: number, t: number) => last.surface(lerp(-LENGTH, endOfQuarter(t), ease(u)), t, side)
    a.mesh('upper', 'surface').grid(64, 23, body, reverse)
    a.mesh('toe', 'surface').grid(40, 23, front, reverse)
    a.mesh('toe', 'thread').stitches((t) => last.panel(endOfQuarter(t) + 0.018, t, side, 0.005), 0.045)

    // The U-shaped toe guard follows the perimeter, with two rows of topstitch.
    const mudguard = (u: number, v: number) => {
      const x = lerp(0.67 + 0.25 * v, LENGTH, ease(u))
      const t = lerp(0.018, 0.24 + 0.545 * u + 0.045 * Math.sin(u * Math.PI), v)
      return last.panel(x, t, side, 0.013)
    }
    a.mesh('toe', 'edge').grid(40, 10, mudguard, reverse)
    edgeStitch(a, 'toe', mudguard, ['top', 'left'])
    a.mesh('toe', 'thread').stitches((u) => mudguard(u, 0.87), 0.045, 0.0034)

    // Punched vents are tangent to the vamp. The small lip catches the key light.
    const vents = a.mesh('toe', 'hole'),
      rims = a.mesh('toe', 'seam')
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < (row === 3 ? 2 : 3); col++) {
        const t = 0.738 + 0.1 * col + 0.018 * (row % 2)
        const x = 1.02 + 0.137 * row - 0.045 * (1 - t) * 3
        const center = last.panel(x, t, side, 0.0045),
          normal = last.normal(x, t, side)
        vents.disc(center, normal, 0.015)
        rims.ring(center, normal, 0.017, 0.0027, 12)
      }
    }

    const heel = (u: number, v: number) => {
      const frontEdge = -0.689 - 0.402 * v + 0.089 * Math.sin(Math.PI * v)
      const x = lerp(-LENGTH, frontEdge, ease(u))
      const t = lerp(0.01, 0.834 - 0.188 * u + 0.032 * Math.sin(Math.PI * u), v)
      return last.panel(x, t, side, 0.018)
    }
    a.mesh('heel', 'surface').grid(42, 14, heel, reverse)
    edgeStitch(a, 'heel', heel, ['top', 'right'])
    a.mesh('heel', 'thread').stitches((v) => heel(0.963, v), 0.047, 0.0033)

    // Long inset saddle with a curved shoulder and a clipped leading edge.
    const saddle = (u: number, v: number, offset = 0.022) => {
      const tail = -1.14 + 0.1 * v - 0.088 * Math.sin(v * Math.PI)
      const nose = 0.389 + 0.326 * v - 0.059 * Math.sin(2 * Math.PI * v)
      const x = lerp(tail, nose, u)
      const low = 0.103 + 0.09 * Math.sin(Math.PI * u) + 0.03 * u
      const high = 0.544 + 0.098 * Math.sin(Math.PI * u) - 0.061 * u
      return last.panel(x, lerp(low, high, v), side, offset)
    }
    a.mesh('accent', 'surface').grid(42, 12, saddle, reverse)
    edgeStitch(a, 'accent', saddle, ['top', 'bottom', 'left', 'right'])
    const personalization = (u: number, v: number) =>
      saddle(lerp(0.045, 0.953, u), lerp(0.105, 0.897, v), 0.029)
    a.mesh('accent', side === 1 ? 'outerMark' : 'innerMark').grid(
      40,
      10,
      personalization,
      reverse,
      reverse,
    )

    // Raised eye stay: ends curve away from the throat to meet the quarter.
    const facing = (u: number, v: number) => {
      const x = lerp(-0.522 + 0.108 * (1 - v), 0.786 - 0.086 * (1 - v), u)
      const t = lerp(0.578 + 0.035 * Math.sin(Math.PI * u), 0.985, v)
      return last.panel(x, t, side, 0.014)
    }
    a.mesh('upper', 'edge').grid(40, 9, facing, reverse)
    edgeStitch(a, 'upper', facing, ['bottom', 'left', 'right'])
    a.mesh('upper', 'thread').stitches((u) => facing(u, 0.911), 0.045, 0.0033)

    // Dark inner lining slopes towards the footbed, preserving the actual aperture.
    a.mesh('upper', 'lining').grid(
      54,
      9,
      (u, v) => {
        const x = lerp(-LENGTH, 0.3, ease(u))
        const rim = last.surface(x, 1, side)
        const floor = last.insole(x, side)
        return floor.lerp(rim, v)
      },
      !reverse,
    )
  }
  const collar = (u: number) => {
    const side: Side = u < 0.5 ? -1 : 1
    const x = -LENGTH + (LENGTH - 0.39) * (1 - Math.cos((Math.abs(2 * u - 1) * Math.PI) / 2))
    return last.surface(x, 1, side)
  }
  a.mesh('upper', 'fabric').tube(collar, 100, 0.047, 0.037, 10)
  a.mesh('upper', 'seam').tube(
    (u) => {
      const p = collar(u)
      p.y -= 0.028
      return p
    },
    100,
    0.018,
    0.01,
    7,
  )

  a.mesh('heel', 'heelMark').grid(36, 8, (u, v) => {
    const w = 2 * u - 1,
      side: Side = w >= 0 ? 1 : -1
    return last.panel(-LENGTH + 0.139 * w * w, lerp(0.44, 0.799, v), side, 0.028)
  })
  a.mesh('upper', 'lining').grid(
    45,
    12,
    (u, v) => last.insole(lerp(-LENGTH, 0.83, ease(u)), 2 * v - 1),
    true,
  )
  a.mesh('upper', 'insoleMark').grid(16, 5, (u, v) => {
    const point = last.insole(lerp(-1.432, -0.786, u), lerp(0.495, -0.495, v))
    point.y += 0.005
    return point
  })
}

function makeTongue(a: Assembly, last: ShoeLast) {
  const surface = (u: number, v: number, offset: number) => {
    const w = 2 * v - 1
    const x = lerp(-0.682 + 0.077 * Math.abs(w) ** 3, 1.015 - 0.045 * w ** 2, u)
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
    last.tongue(lerp(-0.294, -0.606, v), lerp(0.703, -0.703, u), 0.005),
  )
  a.mesh('tongue', 'scriptTag').grid(16, 16, (u, v) =>
    last.tongue(lerp(-0.328, -0.618, v), lerp(-0.716, 0.716, u), -0.05),
  )
}

export function buildShoe(silhouette: ShoeConfig['silhouette']) {
  const last = new ShoeLast(silhouette === 'bold-low')
  const assembly = new Assembly()
  makeSole(assembly, last)
  makeUpper(assembly, last)
  makeTongue(assembly, last)
  return assembly.pieces()
}

export function buildLacing(silhouette: ShoeConfig['silhouette'], type: ShoeConfig['laceType']) {
  const last = new ShoeLast(silhouette === 'bold-low')
  const a = new Assembly()
  const rows = [-0.318, -0.132, 0.053, 0.236, 0.416, 0.597]
  for (const x of rows) {
    for (const side of sides) {
      const eye = last.eye(x, side),
        n = last.normal(x, 0.783, side)
      a.mesh('laces', 'hole').disc(eye, n, 0.04)
      a.mesh('laces', 'metal').ring(eye, n, 0.042, 0.008, 20)
    }
  }
  function bridge(xa: number, xb: number, side: Side, height: number) {
    const start = last.eye(xa, side),
      end = last.eye(xb, side === 1 ? -1 : 1)
    const controls = Array.from({ length: 11 }, (_, i) => {
      const t = i / 10,
        crown = Math.sin(t * Math.PI)
      const p = start.clone().lerp(end, t)
      p.x += 0.012 * crown
      const w = (p.z - last.center(p.x)) / last.tongueWidth(p.x)
      const overTongue = last.tongue(p.x, w).y + height
      p.y = lerp(p.y, Math.max(p.y, overTongue), Math.min(1, 4.4 * crown)) + 0.005
      return p
    })
    const spline = new CatmullRomCurve3(controls)
    const rope = type === 'rope'
    a.mesh('laces', 'surface').tube(
      (t) => spline.getPoint(t),
      24,
      rope ? 0.027 : 0.036,
      rope ? 0.027 : 0.0125,
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
            return p.addScaledVector(cross, direction * 0.023).addScaledVector(up, 0.0109)
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
    bridge(rows[i], rows[i + 1], 1, 0.037)
    bridge(rows[i], rows[i + 1], -1, type === 'rope' ? 0.091 : 0.074)
  }
  bridge(rows[5], rows[5], 1, 0.039)
  return a.pieces()
}
