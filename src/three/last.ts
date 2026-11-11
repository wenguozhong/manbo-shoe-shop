import { Vector3 } from 'three'

export const LENGTH = 1.8
export type Side = 1 | -1
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const clamp = (n: number, low = 0, high = 1) => Math.min(high, Math.max(low, n))
const smooth = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a))
  return t * t * (3 - 2 * t)
}
type Stations = readonly (readonly [number, number])[]

// Smooth section measurements taken along the original last, from heel to toe.
const widths: Stations = [
  [-1.8, 0.475],
  [-1.44, 0.494],
  [-1.12, 0.519],
  [-0.7, 0.496],
  [-0.36, 0.503],
  [-0.05, 0.541],
  [0.4, 0.606],
  [0.78, 0.641],
  [1.07, 0.638],
  [1.42, 0.613],
  [1.8, 0.536],
]
const heights: Stations = [
  [-1.8, 0.695],
  [-1.59, 0.705],
  [-1.32, 0.65],
  [-1.02, 0.543],
  [-0.78, 0.514],
  [-0.58, 0.541],
  [-0.38, 0.696],
  [-0.21, 0.735],
  [0.0, 0.698],
  [0.34, 0.566],
  [0.66, 0.435],
  [0.88, 0.35],
  [1.15, 0.286],
  [1.42, 0.206],
  [1.65, 0.146],
  [1.8, 0.1],
]
const throat: Stations = [
  [-1.8, 0.8],
  [-1.58, 0.77],
  [-1.28, 0.73],
  [-0.9, 0.75],
  [-0.58, 0.73],
  [-0.34, 0.64],
  [-0.1, 0.53],
  [0.25, 0.45],
  [0.62, 0.39],
  [0.81, 0.27],
  [1.01, 0],
  [1.8, 0],
]
const tongueHeight: Stations = [
  [-0.69, 1.285],
  [-0.54, 1.237],
  [-0.39, 1.119],
  [-0.2, 1.096],
  [0.04, 1.028],
  [0.32, 0.923],
  [0.6, 0.782],
  [0.82, 0.659],
  [1.02, 0.594],
]

function measure(x: number, stations: Stations) {
  if (x <= stations[0][0]) return stations[0][1]
  const last = stations.length - 1
  for (let i = 1; i <= last; i++) {
    const a = stations[i - 1],
      b = stations[i]
    if (x > b[0]) continue
    const left = stations[Math.max(0, i - 2)],
      right = stations[Math.min(last, i + 1)]
    const span = b[0] - a[0]
    const t = (x - a[0]) / span
    const m0 = (span * (b[1] - left[1])) / (b[0] - left[0])
    const m1 = (span * (right[1] - a[1])) / (right[0] - a[0])
    return (
      (2 * t * t * t - 3 * t * t + 1) * a[1] +
      (t * t * t - 2 * t * t + t) * m0 +
      (-2 * t * t * t + 3 * t * t) * b[1] +
      (t * t * t - t * t) * m1
    )
  }
  return stations[last][1]
}

export const longitudinal = (u: number) => -LENGTH * Math.cos(u * Math.PI)
const waist = (x: number) => Math.exp(-(((x + 0.4) / 0.65) ** 2))

/** The sole, panels, eyelets, and underfoot printing share these coordinates. */
export class ShoeLast {
  readonly bold: boolean
  readonly thickness: number
  readonly lift: number
  constructor(bold: boolean) {
    this.bold = bold
    this.thickness = bold ? 0.342 : 0.259
    this.lift = bold ? 0.083 : 0
  }

  center(x: number) {
    return 0.014 * Math.sin(2.3 * x) - 0.081 * smooth(0.65, LENGTH, x)
  }

  width(x: number, side: Side) {
    const heel = Math.max(0, (-1.32 - x) / 0.48)
    const toe = Math.max(0, (x - 1.13) / 0.67)
    const cap = Math.sqrt(Math.max(0, 1 - Math.max(heel, toe) ** 2))
    const medialShape = side === -1 ? 1 - 0.115 * waist(x) : 1
    const wide = this.bold ? 1.012 + 0.092 * smooth(-0.2, 1.12, x) : 1
    return cap * measure(x, widths) * medialShape * wide
  }

  rocker(x: number) {
    return 0.12 * smooth(0.71, LENGTH, x) ** 1.8 + 0.028 * (1 - smooth(-LENGTH, -1.13, x))
  }

  topOfSole(x: number) {
    return this.rocker(x) + this.thickness + 0.024 * (1 - smooth(-1.65, 0.91, x))
  }

  /** Edge of a rubber band. u is angular so curvature is retained around both caps. */
  soleEdge(u: number, height: number, scale = 1) {
    const angle = u * Math.PI * 2
    const x = -LENGTH * Math.cos(angle)
    const side: Side = u <= 0.5 ? 1 : -1
    return new Vector3(
      x * scale,
      this.rocker(x) + height,
      this.center(x) + side * this.width(x, side) * scale,
    )
  }

  surface(x: number, t: number, side: Side) {
    const theta = (t * Math.PI) / 2
    const sweep = Math.sin(theta)
    const start = this.topOfSole(x) - 0.045
    const height = measure(x, heights) * (this.bold && x > 0 ? 1 + 0.072 * smooth(0, 1.18, x) : 1)
    const ratio = clamp(measure(x, throat))
    const z = this.width(x, side) * 0.95 * (ratio + (1 - ratio) * Math.cos(theta))
    // A tucked heel and receding crown give the toe a proper curved front wall.
    const tuck = 0.129 * (1 - smooth(-1.8, -1.18, x)) - 0.214 * smooth(0.93, 1.8, x)
    return new Vector3(
      x * 0.977 + tuck * sweep ** 1.22,
      start + (height + 0.045) * sweep,
      this.center(x) + side * z,
    )
  }

  normal(x: number, t: number, side: Side) {
    const dx = this.surface(clamp(x + 0.001, -LENGTH, LENGTH), t, side).sub(
      this.surface(clamp(x - 0.001, -LENGTH, LENGTH), t, side),
    )
    const dv = this.surface(x, clamp(t + 0.001), side).sub(this.surface(x, clamp(t - 0.001), side))
    const normal = dx.cross(dv).multiplyScalar(side)
    // At a closed tip the two halves meet; take the limiting end normal.
    if (normal.lengthSq() < 1e-14) return new Vector3(Math.sign(x), 0.09, 0).normalize()
    return normal.normalize()
  }

  panel(x: number, t: number, side: Side, offset: number) {
    return this.surface(x, t, side).addScaledVector(this.normal(x, t, side), offset)
  }

  tongueWidth(x: number) {
    return (
      (0.361 - 0.052 * smooth(-0.18, 0.76, x) - 0.042 * (1 - smooth(-0.68, -0.43, x))) *
      (this.bold ? 1.035 : 1)
    )
  }

  tongue(x: number, w: number, offset = 0) {
    const y = measure(x, tongueHeight) + this.lift - 0.08 * w ** 2
    return new Vector3(x, y + offset, this.center(x) + this.tongueWidth(x) * w)
  }

  eye(x: number, side: Side) {
    return this.panel(x, 0.783, side, 0.026)
  }

  insole(x: number, w: number) {
    const side: Side = w < 0 ? -1 : 1
    return new Vector3(
      x * 0.945,
      this.topOfSole(x) + 0.101 + 0.043 * w ** 2,
      this.center(x) + w * this.width(x, side) * 0.725,
    )
  }
}
