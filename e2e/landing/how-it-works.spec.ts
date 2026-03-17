import { test, expect } from '../fixtures/landing.fixture'

test.describe('How It Works tabs', () => {
  test.beforeEach(async ({ landingPage }) => {
    await landingPage.scrollTo('.step-tabs')
  })

  test('first tab is active by default', async ({ landingPage }) => {
    await expect(landingPage.tab(0)).toHaveAttribute('aria-selected', 'true')
    await expect(landingPage.tab(1)).toHaveAttribute('aria-selected', 'false')
    await expect(landingPage.tab(2)).toHaveAttribute('aria-selected', 'false')
    await expect(landingPage.tab(3)).toHaveAttribute('aria-selected', 'false')
  })

  test('default content shows Step 1 AI Onboarding', async ({ landingPage }) => {
    const panel = landingPage.tabPanel
    await expect(panel.locator('.step-number')).toHaveText('Step 1')
    await expect(panel.locator('h3')).toHaveText('AI Onboarding')
    await expect(panel.locator('.step-details li')).toHaveCount(4)
  })

  test('clicking second tab switches content', async ({ landingPage }) => {
    await landingPage.click(landingPage.tab(1))

    await expect(landingPage.tab(1)).toHaveAttribute('aria-selected', 'true')
    await expect(landingPage.tab(0)).toHaveAttribute('aria-selected', 'false')

    const panel = landingPage.tabPanel
    await expect(panel.locator('.step-number')).toHaveText('Step 2')
    await expect(panel.locator('h3')).toHaveText('Source the right leads')
  })

  test('clicking third tab shows Personalize + Launch', async ({ landingPage }) => {
    await landingPage.click(landingPage.tab(2))

    await expect(landingPage.tab(2)).toHaveAttribute('aria-selected', 'true')
    const panel = landingPage.tabPanel
    await expect(panel.locator('.step-number')).toHaveText('Step 3')
    await expect(panel.locator('h3')).toHaveText('Personalize + Launch')
  })

  test('clicking fourth tab shows Scale what works', async ({ landingPage }) => {
    await landingPage.click(landingPage.tab(3))

    await expect(landingPage.tab(3)).toHaveAttribute('aria-selected', 'true')
    const panel = landingPage.tabPanel
    await expect(panel.locator('.step-number')).toHaveText('Step 4')
    await expect(panel.locator('h3')).toHaveText('Scale what works')
  })

  test('only one tab selected at a time', async ({ landingPage }) => {
    const { page } = landingPage

    for (let i = 0; i < 4; i++) {
      await landingPage.click(landingPage.tab(i))
      const selectedCount = await page.locator('[role="tab"][aria-selected="true"]').count()
      expect(selectedCount).toBe(1)
    }
  })

  test('each tab panel has 4 detail items', async ({ landingPage }) => {
    for (let i = 0; i < 4; i++) {
      await landingPage.click(landingPage.tab(i))
      await expect(landingPage.tabPanel.locator('.step-details li')).toHaveCount(4)
    }
  })
})
