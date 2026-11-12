import { describe, expect, it } from 'vitest'
import {
  cleanSideText,
  configSchema,
  createConfig,
  parseConfig,
  partIds,
  readColor,
  variantParts,
} from '../../src/domain/config'

import { styleIds } from '../../src/domain/styles'

describe('design format and input constraints', () => {
  it.each(styleIds)('round trips %s with eight independent parts', (variant) => {
    const config = createConfig(variant)
    expect(parseConfig(JSON.stringify(config))).toEqual(config)
    expect(Object.keys(config.parts).sort()).toEqual([...partIds].sort())
    const another = variantParts(variant)
    config.parts.toe.color = '#123456'
    expect(another.toe.color).not.toBe(config.parts.toe.color)
  })
  it('opens earlier links and designs without changing their custom parts or lettering', () => {
    const design = createConfig('topspin-rally')
    design.parts.toe.color = '#123456'
    design.sideText = 'MY PAIR'
    for (const [oldId, id] of [
      ['origin', 'rallyco-classic'],
      ['volt', 'topspin-rally'],
      ['shadow', 'volley-courtline'],
    ]) {
      expect(readColor(oldId)).toBe(id)
      expect(parseConfig(JSON.stringify({ ...design, colorway: oldId }))).toEqual({
        ...design,
        colorway: id,
      })
    }
  })
  it.each([
    { colorway: 'unknown-edition' },
    { schemaVersion: 2 },
    { model: 'another' },
    { sideText: '<svg/onload=x>' },
    { sideText: '123456789012345' },
    { parts: {} },
    { textColor: '#fff' },
    { graphic: 'unlisted' },
    { artworkTransform: { x: 2, y: 0, scale: 1 } },
    { size: '10' },
    { artwork: { name: 'a', dataUrl: 'blob:gone' } },
    { updatedAt: 'yesterday' },
  ])('rejects an incompatible field set %j', (patch) =>
    expect(() => parseConfig(JSON.stringify({ ...createConfig(), ...patch }))).toThrow(),
  )
  it('rejects malformed and oversized JSON before applying it', () => {
    expect(() => parseConfig('{')).toThrow('JSON')
    expect(() => parseConfig(' '.repeat(1024 * 1024 + 1))).toThrow('1 MB')
  })
  it('preserves CJK and counts Unicode code points', () => {
    expect(cleanSideText('网球 <01>★')).toBe('网球 01')
    const text = cleanSideText('𠮷'.repeat(20))
    expect(Array.from(text)).toHaveLength(14)
    expect(configSchema.safeParse({ ...createConfig(), sideText: text }).success).toBe(true)
    expect(readColor('not-a-preset')).toBeUndefined()
  })
})
