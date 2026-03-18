import { test, expect } from '../fixtures/landing.fixture'

test.describe('How It Works section', () => {
  test.beforeEach(async ({ landingPage }) => {
    await landingPage.scrollTo('#how-it-works')
  })

  test('section heading is visible', async ({ landingPage }) => {
    const heading = landingPage.howItWorks.locator('h2')
    await expect(heading).toHaveText('How QuickConnect Works')
  })

  test('has 3 step cards with correct titles', async ({ landingPage }) => {
    const titles = landingPage.howItWorks.locator('h3')
    await expect(titles).toHaveCount(3)
    await expect(titles.nth(0)).toHaveText('Upload CSV')
    await expect(titles.nth(1)).toHaveText('Click Start')
    await expect(titles.nth(2)).toHaveText('Watch Results')
  })

  test('each step card has 4 detail items', async ({ landingPage }) => {
    const cards = landingPage.howItWorks.locator('ul')
    await expect(cards).toHaveCount(3)

    for (let i = 0; i < 3; i++) {
      const items = cards.nth(i).locator('li')
      await expect(items).toHaveCount(4)
    }
  })

  test('step numbers are displayed', async ({ landingPage }) => {
    // Each card has a number (1, 2, 3) in the header
    const page = landingPage.page
    const numbers = landingPage.howItWorks.locator('div >> text=/^[123]$/')
    await expect(numbers).toHaveCount(3)
  })
})
