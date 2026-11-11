import { expect, type Page } from '@playwright/test'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import type { ShoeConfig } from '../../src/domain/config'

export const shots = path.resolve('artifacts/screenshots')
export async function shot(page: Page, name: string, fullPage = false) {
  await mkdir(shots, { recursive: true })
  await page.screenshot({ path: path.join(shots, name + '.png'), fullPage, animations: 'disabled' })
}
export async function ready(page: Page) {
  await expect(page.locator('.viewer[data-ready=true] canvas')).toBeVisible({ timeout: 40000 })
}
export async function config(page: Page) {
  return page.evaluate(() => JSON.parse(localStorage.getItem('idc:config:v1')!) as ShoeConfig)
}
export async function noOverflow(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true)
}
export async function frame(page: Page) {
  return page.locator('.viewer canvas').evaluate((el) => {
    const canvas = document.createElement('canvas')
    canvas.width = 160
    canvas.height = 110
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(el as HTMLCanvasElement, 0, 0, 160, 110)
    return canvas.toDataURL()
  })
}
export async function changed(page: Page, before: string) {
  await expect
    .poll(async () => (await frame(page)) !== before, { message: 'WebGL pixels change with this edit' })
    .toBe(true)
}
export async function completeImages(page: Page) {
  await page.evaluate(async () => {
    await document.fonts.ready
    await Promise.all(
      Array.from(document.images).map((img) => {
        img.loading = 'eager'
        return img.decode()
      }),
    )
  })
}
export async function markImage(page: Page) {
  return Buffer.from(
    await page.evaluate(() => {
      const c = document.createElement('canvas')
      c.width = c.height = 96
      const ctx = c.getContext('2d')!
      ctx.fillStyle = '#ee3b32'
      ctx.fillRect(0, 24, 96, 48)
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(16, 32, 58, 9)
      return c.toDataURL().split(',')[1]
    }),
    'base64',
  )
}
export function noteErrors(page: Page) {
  const errors: string[] = []
  page.on('pageerror', (err) => errors.push(err.message))
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text())
  })
  return errors
}
