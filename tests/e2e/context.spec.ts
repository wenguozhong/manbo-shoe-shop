import { expect, test } from '@playwright/test'
import { config, ready } from './helpers'

test('recovers a lost WebGL context with the design intact', async ({ page }) => {
  await page.goto('/customize?color=shadow')
  await ready(page)
  await page.locator('.viewer canvas').evaluate(node => {
    const gl = (node as HTMLCanvasElement).getContext('webgl2')
    const extension = gl?.getExtension('WEBGL_lose_context')
    if (!extension) throw new Error('This browser does not expose context-loss simulation')
    extension.loseContext()
  })
  await expect(page.getByText('2D 配色参考')).toBeVisible()
  await page.getByRole('button', { name: '重试 3D' }).click()
  await ready(page)
  expect((await config(page)).colorway).toBe('shadow')
})

