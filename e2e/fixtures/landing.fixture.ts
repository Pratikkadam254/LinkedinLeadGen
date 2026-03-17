import { test as base, type Page, type Locator } from '@playwright/test'

export class LandingPage {
  constructor(public page: Page) {}

  // Use evaluate-based click for compatibility with sandboxed Chromium builds
  async click(locator: Locator) {
    await locator.evaluate((el) => (el as HTMLElement).click())
  }

  async goto() {
    // Block external requests that may hang due to DNS in CI/sandboxed environments
    await this.page.route('**/*.googleapis.com/**', (route) => route.abort())
    await this.page.route('**/*.gstatic.com/**', (route) => route.abort())
    await this.page.goto('/', { waitUntil: 'domcontentloaded' })
    await this.page.waitForSelector('.landing-page', { timeout: 15000 })
  }

  // Section locators
  get header() { return this.page.getByRole('banner') }
  get hero() { return this.page.locator('[aria-labelledby="hero-heading"]') }
  get stats() { return this.page.locator('#stats') }
  get features() { return this.page.locator('#features') }
  get howItWorks() { return this.page.locator('#how-it-works') }
  get testimonial() { return this.page.locator('[aria-label="Customer testimonial"]') }
  get pricing() { return this.page.locator('#pricing') }
  get faq() { return this.page.locator('#faq') }
  get cta() { return this.page.locator('#cta') }
  get footer() { return this.page.getByRole('contentinfo') }

  // Interactive elements
  get mobileMenuBtn() { return this.page.locator('.mobile-menu-btn') }
  get mobileDrawer() { return this.page.locator('.mobile-drawer') }
  faqItem(i: number) { return this.page.locator('.faq-item').nth(i) }
  faqBtn(i: number) { return this.page.locator('.faq-question').nth(i) }
  tab(i: number) { return this.page.locator('[role="tab"]').nth(i) }
  get tabPanel() { return this.page.locator('[role="tabpanel"]') }

  // Scroll helper — centers element in viewport to clear the sticky header
  async scrollTo(selector: string) {
    await this.page.locator(selector).evaluate((el) =>
      el.scrollIntoView({ block: 'center', behavior: 'instant' })
    )
    await this.page.waitForTimeout(400)
  }

}

export const test = base.extend<{ landingPage: LandingPage }>({
  landingPage: async ({ page }, use) => {
    const lp = new LandingPage(page)
    await lp.goto()
    await use(lp)
  },
})

export { expect } from '@playwright/test'
