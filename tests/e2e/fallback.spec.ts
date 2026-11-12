import { test, expect } from '@playwright/test'
import { partIds } from '../../src/domain/config'
import { frame, ready } from './helpers'

test('replaces a broken GLB with a functional procedural shoe', async ({ page }) => {
  await page.route('**/court-model.json', (r) =>
    r.fulfill({ json: { id: 'court-01', source: 'glb', url: '/models/broken.glb', partMap: {} } }),
  )
  await page.route('**/models/broken.glb', (r) =>
    r.fulfill({ contentType: 'application/octet-stream', body: 'damaged' }),
  )
  await page.goto('/customize?color=volt')
  await ready(page)
  await expect(
    page.getByText(
      'The external model could not load. You can continue with the original Court 01 low-top.',
    ),
  ).toBeVisible()
  const before = await frame(page)
  await page.getByRole('button', { name: 'Volley', exact: true }).click()
  await expect.poll(async () => (await frame(page)) !== before).toBe(true)
})
test('loads an external GLB mesh by name, retains mapped editing and disables missing parts', async ({
  page,
}) => {
  // A self-contained glTF 2.0 binary with one triangle for the adapter contract.
  const vertices = Buffer.from(new Float32Array([-1, 0, 0, 1, 0, 0, 0, 1, 0]).buffer)
  const doc = {
    asset: { version: '2.0' },
    buffers: [{ byteLength: vertices.length }],
    bufferViews: [{ buffer: 0, byteLength: vertices.length }],
    accessors: [
      { bufferView: 0, componentType: 5126, count: 3, type: 'VEC3', min: [-1, 0, 0], max: [1, 1, 0] },
    ],
    meshes: [{ name: 'test_upper', primitives: [{ attributes: { POSITION: 0 }, material: 0 }] }],
    materials: [{ doubleSided: true }],
    nodes: [{ mesh: 0, name: 'upper_main' }],
    scenes: [{ nodes: [0] }],
    scene: 0,
  }
  const raw = Buffer.from(JSON.stringify(doc)),
    json = Buffer.alloc((raw.length + 3) & ~3, 32)
  raw.copy(json)
  const length = 28 + json.length + vertices.length,
    bin = Buffer.alloc(length)
  bin.write('glTF')
  bin.writeUInt32LE(2, 4)
  bin.writeUInt32LE(length, 8)
  bin.writeUInt32LE(json.length, 12)
  bin.write('JSON', 16)
  json.copy(bin, 20)
  bin.writeUInt32LE(vertices.length, 20 + json.length)
  bin.writeUInt32LE(0x004e4942, 24 + json.length)
  vertices.copy(bin, 28 + json.length)
  const partMap = Object.fromEntries(partIds.map((p) => [p, [p + '_main']]))
  await page.route('**/court-model.json', (r) =>
    r.fulfill({ json: { id: 'court-01', source: 'glb', url: '/fixture.glb', partMap } }),
  )
  await page.route('**/fixture.glb', (r) => r.fulfill({ body: bin, contentType: 'model/gltf-binary' }))
  await page.goto('/customize')
  await ready(page)
  await expect(page.getByText('Some parts of this model are unavailable for editing.')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Toe', exact: true })).toBeDisabled()
  await expect(page.getByRole('button', { name: 'Upper', exact: true })).toBeEnabled()
  const before = await frame(page)
  await page.getByRole('textbox', { name: 'Upper color HEX' }).fill('#FF6600')
  await expect.poll(async () => (await frame(page)) !== before).toBe(true)
})
test('keeps editing and file export available on a device without WebGL', async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      id: string,
      ...args: unknown[]
    ) {
      if (id.includes('webgl')) return null
      return Reflect.apply(original, this, [id, ...args])
    } as typeof original
  })
  await page.goto('/customize')
  await expect(page.getByText('2D colorway preview')).toBeVisible()
  await page.getByRole('button', { name: 'Topspin', exact: true }).click()
  await page
    .getByRole('navigation', { name: 'Design steps' })
    .getByRole('button', { name: /REVIEW/ })
    .click()
  const wait = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Export JSON' }).click()
  expect((await wait).suggestedFilename()).toMatch(/\.json$/)
  await page.getByRole('button', { name: 'Export PNG' }).click()
  await expect(page.locator('.toast')).toContainText('The 3D preview is unavailable')
})
