import { describe, expect, it } from 'vitest'
import { buildLacing, buildShoe } from '../../src/three/shoeGeometry'
import { partIds } from '../../src/domain/config'

describe('procedural asset', () => {
  it('has all pickable parts, inner/outer artwork surfaces, stamps and tread', () => {
    const pieces = [...buildShoe('classic-low'), ...buildLacing('classic-low', 'flat')]
    try {
      expect(new Set(pieces.map((p) => p.part))).toEqual(new Set(partIds))
      for (const required of [
        'tread',
        'referenceMark',
        'outerMark',
        'innerMark',
        'soleMark',
        'heelMark',
        'insoleMark',
        'tongueTag',
        'scriptTag',
      ]) {
        const p = pieces.find((s) => s.finish === required)
        expect(p?.geometry.getAttribute('position').count).toBeGreaterThan(3)
        expect(p?.geometry.getAttribute('uv').count).toBe(p?.geometry.getAttribute('position').count)
      }
    } finally {
      pieces.forEach((p) => p.geometry.dispose())
    }
  })
  it('changes physical midsole and forefoot dimensions for BOLD LOW', () => {
    const getSize = (s: 'classic-low' | 'bold-low') => {
      const pieces = buildShoe(s)
      try {
        const geom = pieces.find((p) => p.part === 'midsole' && p.finish === 'surface')!.geometry
        geom.computeBoundingBox()
        const box = geom.boundingBox!
        return { width: box.max.z - box.min.z, height: box.max.y - box.min.y }
      } finally {
        pieces.forEach((p) => p.geometry.dispose())
      }
    }
    const classic = getSize('classic-low'),
      bold = getSize('bold-low')
    expect(bold.width).toBeGreaterThan(classic.width)
    expect(bold.height).toBeGreaterThan(classic.height)
  })
})
