import { test, expect } from '../fixtures/landing.fixture'
import AxeBuilder from '@axe-core/playwright'

test.describe('Accessibility', () => {
  test('no critical or serious axe violations', async ({ landingPage }) => {
    const results = await new AxeBuilder({ page: landingPage.page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze()

    const serious = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    )
    if (serious.length > 0) {
      const summary = serious.map(
        (v) => `[${v.impact}] ${v.id}: ${v.description} (${v.nodes.length} nodes)`
      )
      expect(serious, `Accessibility violations:\n${summary.join('\n')}`).toEqual([])
    }
  })

  test('all sections have aria-labelledby or aria-label', async ({ landingPage }) => {
    const { page } = landingPage
    const sections = page.locator('main section')
    const count = await sections.count()

    for (let i = 0; i < count; i++) {
      const section = sections.nth(i)
      const labelledBy = await section.getAttribute('aria-labelledby')
      const label = await section.getAttribute('aria-label')
      expect(
        labelledBy || label,
        `Section ${i} missing aria-labelledby or aria-label`
      ).toBeTruthy()
    }
  })

  test('header has role="banner"', async ({ landingPage }) => {
    await expect(landingPage.header).toHaveAttribute('role', 'banner')
  })

  test('footer has role="contentinfo"', async ({ landingPage }) => {
    await expect(landingPage.footer).toHaveAttribute('role', 'contentinfo')
  })

  test('FAQ buttons have aria-expanded', async ({ landingPage }) => {
    await landingPage.scrollTo('#faq')
    const buttons = landingPage.page.locator('.faq-question')
    const count = await buttons.count()

    for (let i = 0; i < count; i++) {
      await expect(buttons.nth(i)).toHaveAttribute('aria-expanded', 'false')
    }

    // Open first, verify toggle
    await buttons.first().click()
    await expect(buttons.first()).toHaveAttribute('aria-expanded', 'true')
  })

  test('HowItWorks has proper tab roles', async ({ landingPage }) => {
    await landingPage.scrollTo('#how-it-works')
    const { page } = landingPage

    await expect(page.locator('[role="tablist"]')).toHaveCount(1)
    await expect(page.locator('[role="tab"]')).toHaveCount(4)
    await expect(page.locator('[role="tabpanel"]')).toHaveCount(1)

    // First tab is selected
    await expect(page.locator('[role="tab"]').first()).toHaveAttribute('aria-selected', 'true')
  })

  test('features and stats use role="list" with role="listitem"', async ({ landingPage }) => {
    const { page } = landingPage

    // Features
    const featuresGrid = page.locator('.features-grid[role="list"]')
    await expect(featuresGrid).toHaveCount(1)
    await expect(featuresGrid.locator('[role="listitem"]')).toHaveCount(6)

    // Stats
    const statsGrid = page.locator('.stats-grid[role="list"]')
    await expect(statsGrid).toHaveCount(1)
    await expect(statsGrid.locator('[role="listitem"]')).toHaveCount(4)
  })

  test('skip-to-main link is first focusable element', async ({ landingPage }) => {
    const { page } = landingPage
    await page.keyboard.press('Tab')
    const focused = page.locator(':focus')
    await expect(focused).toHaveClass(/skip-to-main/)
  })
})
