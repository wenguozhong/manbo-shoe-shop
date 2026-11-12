import { Vector3 } from 'three'
import type { StyleId } from '../domain/styles'

export const LENGTH = 1.8
export type Side = 1 | -1
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const clamp = (n: number, low = 0, high = 1) => Math.min(high, Math.max(low, n))
const smooth = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a))
  return t * t * (3 - 2 * t)
}
type Stations = readonly (readonly [number, number])[]

// Measurements run from the heel seat to the toe spring of the court last.
const widths: Stations = [
  [-1.8, 0.424],
  [-1.44, 0.461],
  [-1.12, 0.475],
  [-0.7, 0.458],
  [-0.36, 0.459],
  [-0.05, 0.492],
  [0.4, 0.561],
  [0.78, 0.599],
  [1.07, 0.602],
  [1.42, 0.56],
  [1.8, 0.47],
]
const heights: Stations = [
  [-1.8, 0.717],
  [-1.62, 0.856],
  [-1.47, 0.87],
  [-1.27, 0.72],
  [-1.02, 0.612],
  [-0.82, 0.573],
  [-0.65, 0.608],
  [-0.53, 0.736],
  [-0.41, 0.853],
  [-0.23, 0.856],
  [0.0, 0.775],
  [0.32, 0.613],
  [0.66, 0.428],
  [0.88, 0.337],
  [1.13, 0.254],
  [1.43, 0.194],
  [1.65, 0.124],
  [1.8, 0.078],
]
const throat: Stations = [
  [-1.8, 0.82],
  [-1.58, 0.8],
  [-1.28, 0.78],
  [-0.9, 0.76],
  [-0.58, 0.72],
  [-0.34, 0.64],
  [-0.1, 0.53],
  [0.25, 0.45],
  [0.62, 0.39],
  [0.81, 0.27],
  [1.01, 0],
  [1.8, 0],
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
  readonly style: StyleId
  readonly family: 'rallyco' | 'topspin' | 'volley'
  readonly thickness: number
  readonly lift: number
  constructor(bold: boolean, style: StyleId = 'rallyco-classic') {
    this.bold = bold
    this.style = style
    this.family = style.startsWith('volley') ? 'volley' : style.startsWith('topspin') ? 'topspin' : 'rallyco'
    this.lift = bold ? 0.068 : 0
    this.thickness = (this.family === 'rallyco' ? 0.33 : this.family === 'topspin' ? 0.306 : 0.298) + this.lift
  }

  center(x: number) {
    return -0.012 * Math.sin(2.15 * x) + 0.067 * smooth(0.55, LENGTH, x)
  }

  width(x: number, side: Side) {
    const heel = Math.max(0, (-1.29 - x) / 0.51)
    const toe = Math.max(0, (x - 1.07) / 0.73)
    const cap = Math.sqrt(Math.max(0, 1 - Math.max(heel, toe) ** 2))
    const medialShape = side === 1 ? 1 - 0.108 * waist(x) : 1
    const ballWidth = smooth(-0.2, 1.12, x)
    const wide = this.bold ? 1.014 + 0.083 * ballWidth : 1
    const familyWidth = this.family === 'topspin' ? 0.973 : this.family === 'volley' ? 1 + 0.028 * ballWidth : 1
    return cap * measure(x, widths) * medialShape * wide * familyWidth
  }

  rocker(x: number) {
    return 0.083 * smooth(0.91, LENGTH, x) ** 1.8 + 0.025 * (1 - smooth(-LENGTH, -1.23, x))
  }

  topOfSole(x: number) {
    return this.rocker(x) + this.thickness + 0.044 * (1 - smooth(-1.64, 0.95, x))
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
    const start = this.topOfSole(x) - 0.032
    const height = this.upperHeight(x)
    const ratio = clamp(measure(x, throat))
    const z = this.width(x, side) * 0.96 * (ratio + (1 - ratio) * Math.cos(theta))
    const tuck = 0.116 * (1 - smooth(-1.8, -1.12, x)) - 0.195 * smooth(0.96, 1.8, x)
    return new Vector3(
      x * 0.977 + tuck * sweep ** 1.22,
      start + (height + 0.032) * sweep,
      this.center(x) + side * z,
    )
  }

  upperHeight(x: number) {
    const familyHeight = this.family === 'volley' ? 0.965 : this.family === 'topspin' ? 1.018 : 1
    return measure(x, heights) * familyHeight * (this.bold ? 1 + 0.064 * smooth(0, 1.18, x) : 1)
  }

  /** Convert height above the welt to a surface parameter, for level quarter graphics. */
  atHeight(x: number, height: number) {
    return (2 / Math.PI) * Math.asin(clamp((height + 0.032) / (this.upperHeight(x) + 0.032)))
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
      (0.345 - 0.044 * smooth(-0.18, 0.76, x) - 0.028 * (1 - smooth(-0.68, -0.43, x))) *
      (this.bold ? 1.035 : 1)
    )
  }

  tongue(x: number, w: number, offset = 0) {
    const familyDrop = this.family === 'volley' ? 0.05 : this.family === 'topspin' ? 0.016 : 0
    const tip = 1.336 + this.lift - familyDrop - 0.172 * Math.max(0, x + 0.69)
    const instep = this.topOfSole(x) + this.upperHeight(x) + 0.041 - 0.054 * smooth(0.64, 1.01, x)
    const crown = lerp(tip, instep, smooth(-0.43, -0.18, x))
    return new Vector3(x, crown - 0.064 * w ** 2 + offset, this.center(x) + this.tongueWidth(x) * w)
  }

  eye(x: number, side: Side) {
    return this.panel(x, 0.806, side, 0.031)
  }

  /** Height of the leather touching the underside of a lace at this point across the throat. */
  laceBed(x: number, z: number) {
    const axis = this.center(x)
    const side: Side = z < axis ? -1 : 1
    const ratio = measure(x, throat)
    const radius = Math.abs(z - axis) / (0.96 * this.width(x, side))
    const section = 2 / Math.PI * Math.acos(clamp((radius - ratio) / (1 - ratio)))
    const facing = this.surface(x, section, side).y + 0.027
    const w = (z - axis) / this.tongueWidth(x)
    return Math.abs(w) > 1 ? facing : Math.max(facing, this.tongue(x, w).y)
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
