import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { createConfig } from '../../src/domain/config'
const data = new Map<string, string>()
beforeEach(() => {
  data.clear()
  vi.resetModules()
  vi.stubGlobal('localStorage', {
    getItem: (k: string) => data.get(k) || null,
    setItem: (k: string, v: string) => data.set(k, v),
  })
})
afterEach(() => vi.unstubAllGlobals())
it('recovers from old, corrupt or incomplete records without breaking the editor', async () => {
  data.set('idc:config:v1', '{')
  data.set('idc:bag:v1', '[{"schemaVersion":0}]')
  data.set('idc:designs:v1', '{}')
  const { useShop } = await import('../../src/domain/store')
  expect(useShop.getState().config.model).toBe('court-01')
  expect(useShop.getState().bag).toEqual([])
  expect(useShop.getState().designs).toEqual([])
})
it('snapshots bags and saved work independently, updates in place and respects boundaries', async () => {
  const { useShop } = await import('../../src/domain/store'),
    store = useShop.getState(),
    c = createConfig('volt')
  store.putBag(c, null)
  store.saveDesign(c, null)
  const id = useShop.getState().bag[0].id
  c.parts.upper.color = '#000000'
  c.sideText = 'MODIFIED'
  expect(useShop.getState().bag[0].config.sideText).toBe('')
  store.quantity(id, -1)
  expect(useShop.getState().bag[0].qty).toBe(1)
  store.quantity(id, 1)
  store.putBag(c, null, id)
  expect(useShop.getState().bag).toHaveLength(1)
  expect(useShop.getState().bag[0].qty).toBe(2)
  expect(useShop.getState().designs[0].config.parts.upper.color).not.toBe(c.parts.upper.color)
  store.removeBag(id)
  expect(store.putBag(c, null, id)).toBe(false)
  expect(JSON.parse(data.get('idc:bag:v1')!)).toEqual([])
})
it('reports storage failure and preserves the in-memory design', async () => {
  const { useShop } = await import('../../src/domain/store'),
    c = createConfig('shadow')
  vi.stubGlobal('localStorage', {
    getItem: () => null,
    setItem: () => {
      throw new Error('quota')
    },
  })
  useShop.getState().configure(c)
  expect(useShop.getState().config.colorway).toBe('shadow')
  expect(useShop.getState().putBag(c, null)).toBe(false)
  expect(useShop.getState().toast?.text).toContain('storage')
})
