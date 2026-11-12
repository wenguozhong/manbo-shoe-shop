import { expect, test, type Page } from '@playwright/test'
import { readFile } from 'node:fs/promises'
import { changed, config, frame, markImage, noOverflow, noteErrors, ready, shot, shots } from './helpers'
import path from 'node:path'
import { families, styleIds, styleCatalog, styleName } from '../../src/domain/styles'

const button = (page: Page, name: string) => page.getByRole('button', { name, exact: true })
async function jsonFile(page: Page) {
  const wait = page.waitForEvent('download')
  await button(page, 'Export JSON').click()
  const dl = await wait
  expect(dl.suggestedFilename()).toMatch(/\.json$/)
  return readFile((await dl.path())!, 'utf8')
}

test('real 3D customization, files, snapshots, gallery and bag editing', async ({ page }) => {
  const errors = noteErrors(page)
  await page.goto('/customize?color=origin')
  await ready(page)
  await noOverflow(page)
  await shot(page, 'studio-desktop')
  await shot(page, 'rallyco-classic')
  let before = await frame(page)
  await button(page, 'BOLD LOW').click()
  await changed(page, before)
  before = await frame(page)
  await button(page, 'Topspin').click()
  await button(page, 'Topspin Rally').click()
  await changed(page, before)
  await shot(page, 'topspin-rally')
  await page.getByRole('textbox', { name: 'Upper color HEX' }).fill('#214CD4')
  // Pick a saturated blue surface directly in WebGL. First clear the part on the backdrop.
  const canvas = page.locator('.viewer canvas')
  await canvas.click({ position: { x: 14, y: 65 } })
  await expect(page.locator('.part-grid [aria-pressed=true]')).toHaveCount(0)
  const pos = await canvas.evaluate((el) => {
    const src = el as HTMLCanvasElement,
      c = document.createElement('canvas'),
      w = 160,
      h = 110
    c.width = w
    c.height = h
    const ctx = c.getContext('2d')!
    ctx.drawImage(src, 0, 0, w, h)
    const pixels = ctx.getImageData(0, 0, w, h).data
    let score = 0,
      best = -1
    for (let i = 0; i < pixels.length; i += 4) {
      const s = pixels[i + 2] - Math.max(pixels[i], pixels[i + 1])
      if (s > score) {
        best = i / 4
        score = s
      }
    }
    if (score < 20) throw Error('No visibly blue shoe pixels')
    return {
      x: (((best % w) + 0.5) * src.clientWidth) / w,
      y: ((Math.floor(best / w) + 0.5) * src.clientHeight) / h,
    }
  })
  await canvas.click({ position: pos })
  await expect(page.locator('.part-grid [aria-pressed=true]')).toHaveCount(1)
  await button(page, 'Toe').click()
  const beforeParts = (await config(page)).parts
  before = await frame(page)
  await page.getByRole('textbox', { name: 'Toe color HEX' }).fill('#DF3D32')
  await changed(page, before)
  await button(page, 'Synthetic').click()
  const edited = (await config(page)).parts
  expect(edited.toe).toEqual({ color: '#DF3D32', material: 'synthetic' })
  expect(edited.upper).toEqual(beforeParts.upper)
  for (const part of ['Upper', 'Heel', 'Tongue', 'Laces', 'Midsole', 'Outsole', 'Side panel']) {
    await button(page, part).click()
    await expect(page.getByRole('textbox', { name: part + ' color HEX' })).toBeVisible()
  }
  for (const v of ['TOP', 'HEEL', 'SOLE', 'Reset view']) {
    before = await frame(page)
    await button(page, v).click()
    await changed(page, before)
  }
  await button(page, 'Next / DETAILS').click()
  before = await frame(page)
  await button(page, 'CONTRAST').click()
  await changed(page, before)
  await button(page, 'Lace color Black').click()
  await button(page, 'SCRIPT B').click()
  await button(page, '41').click()
  await button(page, 'Next / PERSONALIZE').click()
  await page.getByRole('textbox', { name: 'Side lettering' }).fill('<0123456789ABCDEFGHI>')
  expect(Array.from((await config(page)).sideText)).toHaveLength(14)
  before = await frame(page)
  await page.getByRole('textbox', { name: 'Side lettering' }).fill('MANBO')
  await changed(page, before)
  await button(page, 'CONDENSED').click()
  await button(page, 'Lettering color Black').click()
  before = await frame(page)
  await button(page, 'WAVE').click()
  await changed(page, before)
  before = await frame(page)
  await button(page, 'STAR').click()
  await changed(page, before)
  await button(page, 'BOTH').click()
  await page.getByRole('checkbox', { name: /Advanced customization/ }).check()
  before = await frame(page)
  await button(page, 'EMBROIDERY').click()
  await changed(page, before)
  const upload = page.getByLabel('Upload artwork', { exact: true })
  await upload.setInputFiles({ name: 'invalid.txt', mimeType: 'text/plain', buffer: Buffer.from('foo') })
  await expect(page.locator('.toast')).toContainText('Choose a PNG')
  await upload.setInputFiles({
    name: 'big.png',
    mimeType: 'image/png',
    buffer: Buffer.alloc(5 * 1024 * 1024 + 1),
  })
  await expect(page.locator('.toast')).toContainText('exceeds the 5 MB limit')
  await upload.setInputFiles({ name: 'mark.png', mimeType: 'image/png', buffer: await markImage(page) })
  await expect(page.locator('.uploaded')).toContainText('mark.png')
  before = await frame(page)
  await page.getByRole('slider', { name: /Horizontal position/ }).focus()
  await page.keyboard.press('End')
  await changed(page, before)
  await button(page, 'Remove artwork').click()
  await expect(page.locator('.uploaded')).toHaveCount(0)
  await upload.setInputFiles({ name: 'mark.png', mimeType: 'image/png', buffer: await markImage(page) })
  await expect(page.locator('.uploaded')).toContainText('mark.png')
  // Wheel and drag use the same public controls as the visitor.
  await canvas.hover()
  before = await frame(page)
  await page.mouse.wheel(0, -170)
  await changed(page, before)
  await canvas.screenshot({ path: path.join(shots, 'side-lettering-detail.png') })
  await button(page, 'Next / REVIEW').click()
  await expect(page.locator('.config-table').first()).toContainText('MANBO')
  const text = await jsonFile(page),
    exported = JSON.parse(text)
  expect(exported.parts.toe.color).toBe('#DF3D32')
  expect(exported.artwork.dataUrl).toMatch(/^data:image\/png/)
  const pending = page.waitForEvent('download')
  await button(page, 'Export PNG').click()
  const png = await pending
  const bytes = await readFile((await png.path())!)
  expect(bytes.subarray(1, 4).toString()).toBe('PNG')
  const diverse = await page.evaluate(
    async (src) => {
      const i = new Image()
      i.src = src
      await i.decode()
      const c = document.createElement('canvas')
      c.width = 60
      c.height = 40
      const ctx = c.getContext('2d')!
      ctx.drawImage(i, 0, 0, 60, 40)
      return new Set(new Uint32Array(ctx.getImageData(0, 0, 60, 40).data.buffer)).size
    },
    'data:image/png;base64,' + bytes.toString('base64'),
  )
  expect(diverse).toBeGreaterThan(50)
  await button(page, 'Save design').click()
  await expect(page.locator('.toast')).toContainText('My Designs')
  await button(page, 'Reset').click()
  await button(page, 'Reset design').click()
  expect((await config(page)).sideText).toBe('')
  const input = page.getByLabel('Import design file')
  await input.setInputFiles({
    name: 'bad.json',
    mimeType: 'application/json',
    buffer: Buffer.from('{"model":"invalid"}'),
  })
  await expect(page.locator('.toast')).toContainText('Incompatible design file')
  expect((await config(page)).colorway).toBe('rallyco-classic')
  await input.setInputFiles({
    name: 'large.json',
    mimeType: 'application/json',
    buffer: Buffer.alloc(1024 * 1024 + 1),
  })
  await expect(page.locator('.toast')).toContainText('exceeds the 1 MB limit')
  await input.setInputFiles({
    name: 'restore.json',
    mimeType: 'application/json',
    buffer: Buffer.from(text),
  })
  await expect(page.locator('.config-table').first()).toContainText('MANBO')
  const restored = await config(page)
  expect({ ...restored, updatedAt: exported.updatedAt }).toEqual(exported)
  await button(page, 'Add to demo bag').click()
  await page.getByRole('link', { name: 'View bag' }).click()
  await page.reload()
  await expect(page.locator('.bag-item')).toHaveCount(1)
  await expect(page.locator('.bag-details')).toContainText('MANBO')
  await button(page, 'Increase quantity').click()
  await expect(page.locator('.quantity span')).toHaveText('2')
  await page.getByRole('link', { name: 'Edit design' }).click()
  await ready(page)
  await page
    .getByRole('navigation', { name: 'Design steps' })
    .getByRole('button', { name: /PERSONALIZE/ })
    .click()
  await page.getByRole('textbox', { name: 'Side lettering' }).fill('EDITED')
  await button(page, 'Next / REVIEW').click()
  await button(page, 'Update design in bag').click()
  await page.getByRole('link', { name: 'View bag' }).click()
  await expect(page.locator('.bag-item')).toHaveCount(1)
  await expect(page.locator('.bag-item h2')).toHaveText('EDITED')
  await expect(page.locator('.quantity span')).toHaveText('2')
  await button(page, 'Decrease quantity').click()
  await button(page, 'Remove item').click()
  await expect(page.locator('.empty-bag')).toBeVisible()
  await button(page, 'My Designs').click()
  await page.locator('.saved-name').click()
  await ready(page)
  expect((await config(page)).sideText).toBe('MANBO')
  await button(page, 'My Designs').click()
  await button(page, 'Delete saved design').click()
  await expect(page.locator('.dialog-empty')).toBeVisible()
  expect(errors).toEqual([])
})

test('renders every board edition and restores the selected style', async ({ page }) => {
  await page.goto('/customize?color=rallyco-classic')
  await ready(page)
  const rendered = new Set<string>()
  for (const family of families) {
    await page
      .getByRole('group', { name: 'Series', exact: true })
      .getByRole('button', { name: family, exact: true })
      .click()
    for (const id of styleIds.filter((key) => styleCatalog[key].family === family)) {
      const edition = button(page, styleName(id))
      await edition.click()
      await expect(edition).toHaveAttribute('aria-pressed', 'true')
      await expect(page.locator('.stage-top')).toContainText(styleName(id))
      await expect.poll(() => config(page).then((c) => c.colorway)).toBe(id)
      await expect.poll(async () => !rendered.has(await frame(page))).toBe(true)
      rendered.add(await frame(page))
    }
  }
  expect(rendered.size).toBe(9)
  await page.reload()
  await ready(page)
  await expect(button(page, 'Volley Rallyco')).toHaveAttribute('aria-pressed', 'true')
})
