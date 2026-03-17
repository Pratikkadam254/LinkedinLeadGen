import { test, expect } from '../fixtures/landing.fixture'

test.describe('Landing page structure & content', () => {
  test('page loads successfully', async ({ landingPage }) => {
    await expect(landingPage.page).toHaveTitle(/LeadFlow/)
  })

  test('all sections render in correct order', async ({ landingPage }) => {
    const { page } = landingPage
    await expect(landingPage.header).toBeVisible()
    await expect(landingPage.hero).toBeVisible()
    await expect(landingPage.stats).toBeAttached()
    await expect(landingPage.features).toBeAttached()
    await expect(landingPage.howItWorks).toBeAttached()
    await expect(landingPage.testimonial).toBeAttached()
    await expect(landingPage.pricing).toBeAttached()
    await expect(landingPage.faq).toBeAttached()
    await expect(landingPage.cta).toBeAttached()
    await expect(landingPage.footer).toBeAttached()

    // Verify order by comparing top offsets
    const sections = ['#stats', '#features', '#how-it-works', '#pricing', '#faq', '#cta']
    const offsets = await Promise.all(
      sections.map((sel) =>
        page.locator(sel).evaluate((el) => el.getBoundingClientRect().top)
      )
    )
    for (let i = 1; i < offsets.length; i++) {
      expect(offsets[i]).toBeGreaterThan(offsets[i - 1])
    }
  })

  test('hero heading text', async ({ landingPage }) => {
    const h1 = landingPage.hero.locator('h1')
    await expect(h1).toContainText('Turn LinkedIn Into Your')
    await expect(h1).toContainText('Top Revenue Channel')
  })

  test('hero has 3 trust badges', async ({ landingPage }) => {
    const badges = landingPage.hero.locator('.trust-badges span')
    await expect(badges).toHaveCount(3)
    await expect(badges.nth(0)).toContainText('7-day free trial')
    await expect(badges.nth(1)).toContainText('No credit card required')
    await expect(badges.nth(2)).toContainText('Setup in 5 minutes')
  })

  test('stats section shows 4 stats', async ({ landingPage }) => {
    await landingPage.scrollTo('#stats')
    const items = landingPage.stats.locator('[role="listitem"]')
    await expect(items).toHaveCount(4)

    const values = landingPage.stats.locator('.stat-value')
    await expect(values.nth(0)).toHaveText('40×')
    await expect(values.nth(1)).toHaveText('52%')
    await expect(values.nth(2)).toHaveText('10K+')
    await expect(values.nth(3)).toHaveText('95%')
  })

  test('features section has badge and 6 cards', async ({ landingPage }) => {
    await landingPage.scrollTo('#features')
    const badge = landingPage.features.locator('.section-badge')
    await expect(badge).toHaveText('Features')

    const cards = landingPage.features.locator('[role="listitem"]')
    await expect(cards).toHaveCount(6)

    const titles = ['Easy Import', 'Smart Scoring', 'Personalized Messages', 'Post Scraping', 'Safe Automation', 'Real-Time Dashboard']
    for (let i = 0; i < titles.length; i++) {
      await expect(cards.nth(i).locator('h3')).toHaveText(titles[i])
    }
  })

  test('how it works has badge and 4 tabs', async ({ landingPage }) => {
    await landingPage.scrollTo('#how-it-works')
    const badge = landingPage.howItWorks.locator('.section-badge')
    await expect(badge).toHaveText('Process')

    const tabs = landingPage.howItWorks.locator('[role="tab"]')
    await expect(tabs).toHaveCount(4)
  })

  test('testimonial shows author info', async ({ landingPage }) => {
    await landingPage.scrollTo('[aria-label="Customer testimonial"]')
    const card = landingPage.testimonial
    await expect(card.locator('blockquote')).toContainText('$78k in added revenue')
    await expect(card.locator('.testimonial-name')).toHaveText('James Rodriguez')
    await expect(card.locator('.testimonial-role')).toHaveText('Founder, Represent Agency')
  })

  test('pricing card with plan and features', async ({ landingPage }) => {
    await landingPage.scrollTo('#pricing')
    await expect(landingPage.pricing.locator('.pricing-badge')).toHaveText('Popular')
    await expect(landingPage.pricing.locator('.pricing-plan')).toHaveText('Growth')
    await expect(landingPage.pricing.locator('.pricing-features li')).toHaveCount(10)
  })

  test('FAQ has 6 items', async ({ landingPage }) => {
    await landingPage.scrollTo('#faq')
    await expect(landingPage.faq.locator('.faq-item')).toHaveCount(6)
  })

  test('CTA section heading', async ({ landingPage }) => {
    await landingPage.scrollTo('#cta')
    await expect(landingPage.cta.locator('h2')).toContainText('Ready to Fill Your Calendar')
  })

  test('footer has 3 columns and legal links', async ({ landingPage }) => {
    await landingPage.scrollTo('footer')
    await expect(landingPage.footer.locator('.footer-column')).toHaveCount(3)
    await expect(landingPage.footer.locator('.footer-copyright')).toContainText('2026')
    await expect(landingPage.footer.locator('.footer-legal a')).toHaveCount(2)
  })
})
