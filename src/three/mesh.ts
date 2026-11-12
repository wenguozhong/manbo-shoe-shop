import { BufferGeometry, Float32BufferAttribute, Vector3 } from 'three'

export type Surface = (u: number, v: number) => Vector3
type Path = (progress: number) => Vector3
type Radius = number | ((progress: number) => number)

/** Append many small pieces of one material to a single draw call. */
export class MeshBuilder {
  private positions: number[] = []
  private uvs: number[] = []
  private indices: number[] = []

  grid(columns: number, rows: number, at: Surface, reverse = false, mirrorU = false) {
    const first = this.positions.length / 3
    const stride = columns + 1
    for (let row = 0; row <= rows; row++) {
      const v = row / rows
      for (let column = 0; column <= columns; column++) {
        const u = column / columns
        const point = at(u, v)
        this.positions.push(point.x, point.y, point.z)
        this.uvs.push(mirrorU ? 1 - u : u, v)
        if (row === rows || column === columns) continue
        const a = first + row * stride + column
        const b = a + 1
        const c = a + stride
        const d = c + 1
        if (reverse) this.indices.push(a, c, b, b, c, d)
        else this.indices.push(a, b, c, b, d, c)
      }
    }
  }

  tube(path: Path, segments: number, radius: Radius, thickness: Radius = radius, sides = 7) {
    const samples = Array.from({ length: segments + 1 }, (_, i) => path(i / segments))
    const frames = samples.map((point, i) => {
      const direction = samples[Math.min(i + 1, segments)]
        .clone()
        .sub(samples[Math.max(i - 1, 0)])
        .normalize()
      const reference = Math.abs(direction.y) > 0.94 ? new Vector3(0, 0, 1) : new Vector3(0, 1, 0)
      const cross = direction.clone().cross(reference).normalize()
      const up = cross.clone().cross(direction).normalize()
      return { point, cross, up }
    })
    this.grid(segments, sides, (t, v) => {
      const { point, cross, up } = frames[Math.round(t * segments)]
      const angle = v * Math.PI * 2
      const width = typeof radius === 'number' ? radius : radius(t)
      const depth = typeof thickness === 'number' ? thickness : thickness(t)
      return point
        .clone()
        .addScaledVector(cross, width * Math.cos(angle))
        .addScaledVector(up, depth * Math.sin(angle))
    })
  }

  stitches(path: Path, pitch = 0.051, radius = 0.004) {
    const samples = Array.from({ length: 97 }, (_, i) => path(i / 96))
    const lengths = [0]
    for (let i = 1; i < samples.length; i++) {
      lengths.push(lengths[i - 1] + samples[i].distanceTo(samples[i - 1]))
    }
    const length = lengths[96]
    const count = Math.floor(length / pitch)
    if (count < 1) return
    let index = 1
    const getPoint = (distance: number) => {
      while (index < 96 && lengths[index] < distance) index++
      const fraction =
        (distance - lengths[index - 1]) / Math.max(1e-8, lengths[index] - lengths[index - 1])
      return samples[index - 1].clone().lerp(samples[index], fraction)
    }
    for (let i = 0; i < count; i++) {
      const start = getPoint(((i + 0.1) * length) / count)
      const end = getPoint(((i + 0.81) * length) / count)
      this.tube((t) => start.clone().lerp(end, t), 1, radius, radius, 5)
    }
  }

  disc(center: Vector3, normal: Vector3, radius: number, segments = 12) {
    const [a, b] = planeAxes(normal)
    this.grid(
      segments,
      1,
      (u, v) => {
        const angle = u * Math.PI * 2
        return center
          .clone()
          .addScaledVector(a, Math.cos(angle) * radius * v)
          .addScaledVector(b, Math.sin(angle) * radius * v)
      },
      true,
    )
  }

  ring(center: Vector3, normal: Vector3, radius: number, gauge: number, segments = 18) {
    const [a, b] = planeAxes(normal)
    this.grid(segments, 7, (u, v) => {
      const angle = 2 * Math.PI * u
      const section = 2 * Math.PI * v
      const radial = radius + gauge * Math.cos(section)
      return center
        .clone()
        .addScaledVector(a, radial * Math.cos(angle))
        .addScaledVector(b, radial * Math.sin(angle))
        .addScaledVector(normal, gauge * Math.sin(section))
    })
  }

  finish() {
    const geometry = new BufferGeometry()
    geometry.setAttribute('position', new Float32BufferAttribute(this.positions, 3))
    geometry.setAttribute('uv', new Float32BufferAttribute(this.uvs, 2))
    geometry.setIndex(this.indices)
    geometry.computeVertexNormals()
    geometry.computeBoundingSphere()
    return geometry
  }
}

function planeAxes(normal: Vector3) {
  const axis = Math.abs(normal.x) < 0.86 ? new Vector3(1, 0, 0) : new Vector3(0, 0, 1)
  axis.addScaledVector(normal, -axis.dot(normal)).normalize()
  return [axis, normal.clone().cross(axis).normalize()]
}
