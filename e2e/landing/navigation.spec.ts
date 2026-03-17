import { test, expect } from '../fixtures/landing.fixture'

test.describe('Navigation & links', () => {
  test('header logo links to homepage', async ({ landingPage }) => {
    const logo = landingPage.header.locator('.header-logo')
    await expect(logo).toHaveAttribute('href', '/')
  })

  test('header nav links have correct anchors', async ({ landingPage }) => {
    const links = landingPage.header.locator('.header-links a')
    await expect(links).toHaveCount(4)
    await expect(links.nth(0)).toHaveAttribute('href', '#features')
    await expect(links.nth(1)).toHaveAttribute('href', '#how-it-works')
    await expect(links.nth(2)).toHaveAttribute('href', '#pricing')
    await expect(links.nth(3)).toHaveAttribute('href', '#faq')
  })

  test('Sign In links to /signin', async ({ landingPage }) => {
    const signIn = landingPage.header.locator('.header-actions a:has-text("Sign In")')
    await expect(signIn).toHaveAttribute('href', '/signin')
  })

  test('Get Started Free links to /signup', async ({ landingPage }) => {
    const getStarted = landingPage.header.locator('.header-actions a:has-text("Get Started Free")')
    await expect(getStarted).toHaveAttribute('href', '/signup')
  })

  test('hero Start Free Trial links to /signup', async ({ landingPage }) => {
    const cta = landingPage.hero.locator('a:has-text("Start Free Trial")')
    await expect(cta).toHaveAttribute('href', '/signup')
  })

  test('hero See How It Works links to #features', async ({ landingPage }) => {
    const link = landingPage.hero.locator('a:has-text("See How It Works")')
    await expect(link).toHaveAttribute('href', '#features')
  })

  test('clicking anchor link scrolls to section', async ({ landingPage }) => {
    const { page } = landingPage
    await landingPage.click(page.locator('.header-links a[href="#features"]').first())
    await page.waitForTimeout(600)
    await expect(page.locator('#features')).toBeInViewport()
  })

  test('pricing CTA links to /signup', async ({ landingPage }) => {
    await landingPage.scrollTo('#pricing')
    const cta = landingPage.pricing.locator('.pricing-cta')
    await expect(cta).toHaveAttribute('href', '/signup')
  })

  test('CTA section button links to /signup', async ({ landingPage }) => {
    await landingPage.scrollTo('#cta')
    const cta = landingPage.cta.locator('a:has-text("Start Free Trial")')
    await expect(cta).toHaveAttribute('href', '/signup')
  })

  test('footer logo links to homepage', async ({ landingPage }) => {
    await landingPage.scrollTo('footer')
    const logo = landingPage.footer.locator('.footer-logo')
    await expect(logo).toHaveAttribute('href', '/')
  })

  test('skip-to-main link exists with correct href', async ({ landingPage }) => {
    const { page } = landingPage
    const skipLink = page.locator('.skip-to-main')
    await expect(skipLink).toHaveAttribute('href', '#main-content')
    await expect(skipLink).toBeAttached()
  })
})
