import { test, expect } from '../fixtures/landing.fixture'

test.describe('FAQ accordion', () => {
  test.beforeEach(async ({ landingPage }) => {
    await landingPage.scrollTo('.faq-list')
  })

  test('all items start closed', async ({ landingPage }) => {
    const items = landingPage.page.locator('.faq-item')
    const count = await items.count()
    expect(count).toBe(6)

    for (let i = 0; i < count; i++) {
      await expect(items.nth(i)).not.toHaveClass(/open/)
      await expect(landingPage.faqBtn(i)).toHaveAttribute('aria-expanded', 'false')
    }
  })

  test('clicking a question opens it', async ({ landingPage }) => {
    await landingPage.click(landingPage.faqBtn(0))

    await expect(landingPage.faqItem(0)).toHaveClass(/open/)
    await expect(landingPage.faqBtn(0)).toHaveAttribute('aria-expanded', 'true')

    // Answer should be visible
    const answer = landingPage.faqItem(0).locator('.faq-answer p')
    await expect(answer).toContainText('qualified lead')
  })

  test('clicking the same question closes it', async ({ landingPage }) => {
    await landingPage.click(landingPage.faqBtn(0))
    await expect(landingPage.faqItem(0)).toHaveClass(/open/)

    await landingPage.click(landingPage.faqBtn(0))
    await expect(landingPage.faqItem(0)).not.toHaveClass(/open/)
    await expect(landingPage.faqBtn(0)).toHaveAttribute('aria-expanded', 'false')
  })

  test('only one item open at a time', async ({ landingPage }) => {
    // Open item 0
    await landingPage.click(landingPage.faqBtn(0))
    await expect(landingPage.faqItem(0)).toHaveClass(/open/)

    // Open item 2 — item 0 should close
    await landingPage.click(landingPage.faqBtn(2))
    await expect(landingPage.faqItem(2)).toHaveClass(/open/)
    await expect(landingPage.faqItem(0)).not.toHaveClass(/open/)
  })

  test('FAQ questions have correct text', async ({ landingPage }) => {
    const questions = [
      'What counts as a qualified lead?',
      'How long until I see results?',
      'Do I need to commit to a long-term contract?',
      'How is this different from hiring a sales team?',
      'What tools do you integrate with?',
      'Can I see a demo before signing up?',
    ]

    for (let i = 0; i < questions.length; i++) {
      await expect(landingPage.faqBtn(i)).toContainText(questions[i])
    }
  })

  test('keyboard activation with Enter', async ({ landingPage }) => {
    // Simulate keyboard Enter on the FAQ button
    await landingPage.faqBtn(0).evaluate((el) => {
      el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
      ;(el as HTMLElement).click()
    })
    await expect(landingPage.faqItem(0)).toHaveClass(/open/)
  })
})
