import { test, expect } from '../fixtures/landing.fixture'

// These tests only run in the mobile-chrome project
test.describe('Mobile menu', () => {
  test.beforeEach(async ({}, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile-chrome', 'Mobile-only tests')
  })

  test('desktop nav links are hidden', async ({ landingPage }) => {
    const navLinks = landingPage.page.locator('.header-links')
    await expect(navLinks).toBeHidden()
  })

  test('hamburger button is visible', async ({ landingPage }) => {
    await expect(landingPage.mobileMenuBtn).toBeVisible()
  })

  test('clicking hamburger opens drawer', async ({ landingPage }) => {
    await landingPage.click(landingPage.mobileMenuBtn)
    await expect(landingPage.mobileDrawer).toHaveClass(/open/)
    await expect(landingPage.mobileMenuBtn).toHaveAttribute('aria-expanded', 'true')
  })

  test('drawer contains all nav links and CTAs', async ({ landingPage }) => {
    await landingPage.click(landingPage.mobileMenuBtn)

    const drawer = landingPage.mobileDrawer
    await expect(drawer.locator('a[href="#features"]')).toBeVisible()
    await expect(drawer.locator('a[href="#how-it-works"]')).toBeVisible()
    await expect(drawer.locator('a[href="#pricing"]')).toBeVisible()
    await expect(drawer.locator('a[href="#faq"]')).toBeVisible()

    await expect(drawer.locator('a[href="/signin"]')).toBeVisible()
    await expect(drawer.locator('a[href="/signup"]')).toBeVisible()
  })

  test('clicking overlay closes drawer', async ({ landingPage }) => {
    const { page } = landingPage
    await landingPage.click(landingPage.mobileMenuBtn)
    await expect(landingPage.mobileDrawer).toHaveClass(/open/)

    // Click the overlay
    const overlay = page.locator('.mobile-overlay')
    await landingPage.click(overlay)
    await expect(landingPage.mobileDrawer).not.toHaveClass(/open/)
  })

  test('clicking nav link closes drawer', async ({ landingPage }) => {
    await landingPage.click(landingPage.mobileMenuBtn)
    await expect(landingPage.mobileDrawer).toHaveClass(/open/)

    await landingPage.click(landingPage.mobileDrawer.locator('a[href="#features"]'))
    await expect(landingPage.mobileDrawer).not.toHaveClass(/open/)
  })
})
