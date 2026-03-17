import { test, expect } from '../fixtures/landing.fixture'

test.describe('Responsive layout — Desktop', () => {
  test.beforeEach(async ({}, testInfo) => {
    test.skip(testInfo.project.name === 'mobile-chrome', 'Desktop-only tests')
  })

  test('features grid has 3 columns', async ({ landingPage }) => {
    await landingPage.scrollTo('#features')
    const grid = landingPage.page.locator('.features-grid')
    const cols = await grid.evaluate((el) =>
      getComputedStyle(el).gridTemplateColumns.split(' ').length
    )
    expect(cols).toBe(3)
  })

  test('stats grid has 4 columns', async ({ landingPage }) => {
    await landingPage.scrollTo('#stats')
    const grid = landingPage.page.locator('.stats-grid')
    const cols = await grid.evaluate((el) =>
      getComputedStyle(el).gridTemplateColumns.split(' ').length
    )
    expect(cols).toBe(4)
  })

  test('header nav links are visible', async ({ landingPage }) => {
    const navLinks = landingPage.page.locator('.header-links')
    await expect(navLinks).toBeVisible()
  })

  test('how it works content is 2-column', async ({ landingPage }) => {
    await landingPage.scrollTo('#how-it-works')
    const content = landingPage.page.locator('.step-content')
    const cols = await content.evaluate((el) =>
      getComputedStyle(el).gridTemplateColumns.split(' ').length
    )
    expect(cols).toBe(2)
  })
})

test.describe('Responsive layout — Mobile', () => {
  test.beforeEach(async ({}, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile-chrome', 'Mobile-only tests')
  })

  test('features grid is single column', async ({ landingPage }) => {
    await landingPage.scrollTo('#features')
    const grid = landingPage.page.locator('.features-grid')
    const cols = await grid.evaluate((el) =>
      getComputedStyle(el).gridTemplateColumns.split(' ').length
    )
    expect(cols).toBe(1)
  })

  test('hero preview is hidden', async ({ landingPage }) => {
    const preview = landingPage.page.locator('.hero-preview')
    // At 393px (Pixel 5), hero preview should be hidden
    await expect(preview).toBeHidden()
  })

  test('header nav links are hidden', async ({ landingPage }) => {
    const navLinks = landingPage.page.locator('.header-links')
    await expect(navLinks).toBeHidden()
  })
})
