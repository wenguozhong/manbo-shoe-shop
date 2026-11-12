import { test, expect } from '@playwright/test'
import {
  changed,
  completeImages,
  config,
  expectEnglishPage,
  frame,
  noOverflow,
  noteErrors,
  ready,
  shot,
} from './helpers'

test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 })
test('mobile navigation, real touch orbit and pinch, full four-step design and saved bag', async ({
  page,
  context,
}) => {
  const errors = noteErrors(page)
  await page.goto('/')
  await completeImages(page)
  await noOverflow(page)
  await shot(page, 'home-mobile')
  await page.getByRole('button', { name: 'Open menu' }).tap()
  await expect(page.getByRole('dialog')).toBeVisible()
  await expectEnglishPage(page)
  await page.getByRole('link', { name: 'Customize', exact: true }).last().tap()
  await ready(page)
  await noOverflow(page)
  await shot(page, 'studio-mobile')
  await expectEnglishPage(page)
  const canvas = page.locator('.viewer canvas'),
    box = (await canvas.boundingBox())!
  const x = Math.round(box.x + box.width * 0.49),
    y = Math.round(box.y + box.height * 0.46)
  const cdp = await context.newCDPSession(page)
  async function touch(
    type: 'touchStart' | 'touchMove' | 'touchEnd',
    points: { x: number; y: number; id: number }[],
  ) {
    await cdp.send('Input.dispatchTouchEvent', { type, touchPoints: points })
  }
  const first = await frame(page),
    scroll = await page.evaluate(() => scrollY)
  await touch('touchStart', [{ x, y, id: 1 }])
  for (let i = 1; i <= 4; i++) await touch('touchMove', [{ x: x + i * 10, y: y + i * 3, id: 1 }])
  await touch('touchEnd', [])
  await changed(page, first)
  expect(await page.evaluate(() => scrollY)).toBe(scroll)
  const second = await frame(page)
  await touch('touchStart', [
    { x: x - 20, y, id: 1 },
    { x: x + 20, y, id: 2 },
  ])
  await touch('touchMove', [
    { x: x - 44, y, id: 1 },
    { x: x + 44, y, id: 2 },
  ])
  await touch('touchEnd', [])
  await changed(page, second)
  await page.getByRole('button', { name: 'Volley', exact: true }).tap()
  await page.getByRole('button', { name: 'Next / DETAILS' }).tap()
  await expectEnglishPage(page)
  await page.getByRole('button', { name: 'ROPE', exact: true }).tap()
  await page.getByRole('button', { name: 'Next / PERSONALIZE' }).tap()
  await expectEnglishPage(page)
  await page.getByRole('textbox', { name: 'Side lettering' }).fill('球场')
  await page.getByRole('button', { name: 'Next / REVIEW' }).tap()
  await expect(page.locator('.config-table').first()).toContainText('球场')
  await page.getByRole('button', { name: 'Add to demo bag' }).tap()
  await page.getByRole('link', { name: 'View bag' }).tap()
  await noOverflow(page)
  await expect(page.locator('.bag-details')).toContainText('球场')
  await page.goto('/customize?color=unknown')
  await ready(page)
  expect((await config(page)).colorway).toBe('rallyco-classic')
  for (const width of [360, 768, 1024]) {
    await page.setViewportSize({ width, height: 844 })
    await noOverflow(page)
  }
  expect(errors).toEqual([])
})
