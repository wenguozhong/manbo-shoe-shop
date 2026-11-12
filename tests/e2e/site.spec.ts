import { expect, test } from '@playwright/test'
import {
  completeImages,
  expectEnglishPage,
  noOverflow,
  noteErrors,
  ready,
  shot,
  config,
} from './helpers'

test('brand campaign, all sections, search, route navigation, product, stories and demo subscription', async ({
  page,
}) => {
  const errors = noteErrors(page)
  await page.goto('/')
  await completeImages(page)
  await expect(page.getByRole('heading', { level: 1 })).toContainText('BEGINNING.')
  await expectEnglishPage(page)
  await shot(page, 'home-desktop')
  await shot(page, 'home-desktop-full', true)
  for (const width of [360, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    await noOverflow(page)
  }
  await page.getByRole('button', { name: 'Next slide' }).click()
  await expect(page.locator('.hero-title')).toContainText('MOVE.')
  await page.getByRole('button', { name: 'Previous slide' }).click()
  await page.getByRole('button', { name: 'Search' }).click()
  const search = page.getByRole('textbox', { name: 'Search sneakers and stories' })
  await search.fill('no-matching-colorway')
  await expect(page.locator('.result-list')).toContainText('No matches.')
  await expectEnglishPage(page)
  await search.fill('Cobalt')
  await expect(page.locator('.result-list a')).toHaveCount(1)
  await page.locator('.result-list a').click()
  await ready(page)
  await expect(page.locator('.product-info-line')).toContainText('VOLT')
  await expectEnglishPage(page)
  for (const v of ['OUTER', 'INNER', 'SOLE', 'TONGUE'])
    await page.getByRole('button', { name: v, exact: true }).click()
  await page.getByRole('button', { name: '42', exact: true }).click()
  await page.getByRole('button', { name: 'ADD TO DEMO BAG' }).click()
  await expect(page.getByRole('link', { name: 'Bag (1)' })).toBeVisible()
  await page.getByRole('link', { name: 'CUSTOMIZE YOUR PAIR' }).click()
  await expect(page.getByRole('navigation', { name: 'Design steps' })).toBeVisible()
  await ready(page)
  expect((await config(page)).size).toBe('42')
  expect((await config(page)).colorway).toBe('volt')
  await page
    .getByRole('navigation', { name: 'Main navigation' })
    .getByRole('link', { name: 'Collection' })
    .click()
  await page.getByRole('button', { name: 'DARK', exact: true }).click()
  await expect(page.locator('.product-card')).toHaveCount(1)
  await expect(page.locator('.product-card h3')).toHaveText('SHADOW')
  await page.getByRole('button', { name: 'ALL', exact: true }).click()
  await expect(page.locator('.product-card')).toHaveCount(3)
  await expectEnglishPage(page)
  await page
    .getByRole('navigation', { name: 'Main navigation' })
    .getByRole('link', { name: 'The story' })
    .click()
  await expect(
    page.getByRole('heading', { name: 'Why propose a collaboration with Zheng Qinwen?' }),
  ).toBeVisible()
  await expectEnglishPage(page)
  await page
    .getByRole('navigation', { name: 'Main navigation' })
    .getByRole('link', { name: 'Journal' })
    .click()
  await expectEnglishPage(page)
  for (let i = 0; i < 3; i++) {
    await page.locator('.journal-card').nth(i).click()
    await expect(page.locator('.article-body p')).toHaveCount(3)
    await expectEnglishPage(page)
    await page.getByRole('link', { name: 'ALL STORIES' }).click()
  }
  await page.getByRole('button', { name: 'Studio FAQ' }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await expectEnglishPage(page)
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toHaveCount(0)
  const email = page.getByRole('textbox', { name: 'Newsletter email' })
  const signup = page.getByRole('button', { name: 'Try the demo signup' })
  await signup.click()
  await expect(email).toHaveJSProperty('validationMessage', 'Enter your email address.')
  await email.fill('invalid')
  await signup.click()
  await expect(email).toHaveJSProperty('validationMessage', 'Enter a valid email address.')
  await email.fill('demo@example.invalid')
  await signup.click()
  await expect(page.locator('.newsletter small')).toContainText('Demo signup complete')
  await page.getByRole('link', { name: 'Concept notice' }).click()
  await expect(page.locator('.legal')).toContainText('Student business competition concept')
  await expectEnglishPage(page)
  await page.goto('/not-a-route')
  await expect(page.locator('h1')).toContainText('Off the')
  await expect(page).toHaveTitle('idc. — Page Not Found')
  await expectEnglishPage(page)
  expect(errors).toEqual([])
})
