import { test, expect } from '../fixtures/landing.fixture'

test.describe('Scroll reveal animations', () => {
  test('features section header gets visible on scroll', async ({ landingPage }) => {
    await landingPage.waitForReveal('#features .section-header.reveal')
    const header = landingPage.page.locator('#features .section-header.reveal')
    await expect(header).toHaveClass(/visible/)
  })

  test('feature cards get visible with stagger', async ({ landingPage }) => {
    const { page } = landingPage

    // Scroll features into view
    await page.locator('#features').scrollIntoViewIfNeeded()
    await page.waitForTimeout(1000) // give IO + stagger time

    const cards = page.locator('.feature-card.reveal')
    const count = await cards.count()
    expect(count).toBe(6)

    // At least the first few cards should be visible
    await expect(cards.first()).toHaveClass(/visible/)
  })

  test('testimonial card (reveal-scale) gets visible', async ({ landingPage }) => {
    await landingPage.waitForReveal('.testimonial-card.reveal-scale')
    const card = landingPage.page.locator('.testimonial-card.reveal-scale')
    await expect(card).toHaveClass(/visible/)
  })

  test('CTA card (reveal-scale) gets visible', async ({ landingPage }) => {
    await landingPage.waitForReveal('.cta-card.reveal-scale')
    const card = landingPage.page.locator('.cta-card.reveal-scale')
    await expect(card).toHaveClass(/visible/)
  })

  test('visible class persists after scrolling away', async ({ landingPage }) => {
    const { page } = landingPage

    // Scroll to features to trigger reveal
    await landingPage.waitForReveal('#features .section-header.reveal')

    // Scroll back to top
    await page.evaluate(() => window.scrollTo(0, 0))
    await page.waitForTimeout(500)

    // Element should still have visible
    const header = page.locator('#features .section-header.reveal')
    await expect(header).toHaveClass(/visible/)
  })
})
