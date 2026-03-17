import { test as base, type Page } from '@playwright/test'

export class LandingPage {
  constructor(public page: Page) {}

  async goto() {
    await this.page.goto('/')
    await this.page.waitForSelector('.landing-page')
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

  // Scroll helper
  async scrollTo(selector: string) {
    await this.page.locator(selector).scrollIntoViewIfNeeded()
    await this.page.waitForTimeout(400)
  }

  // Wait for a reveal element to become visible
  async waitForReveal(selector: string) {
    const el = this.page.locator(selector)
    await el.scrollIntoViewIfNeeded()
    await this.page.waitForFunction(
      (sel) => document.querySelector(sel)?.classList.contains('visible'),
      selector,
      { timeout: 5000 }
    )
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
