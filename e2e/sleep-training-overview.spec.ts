// @test:sleep-training-overview
import { test, expect } from '@playwright/test';

// Feature: Sleep-Training Methods Overview (Neutral) (Guidance & Credibility).
// Opens the collapsible overview and asserts the neutral method menu, the Tier-1
// efficacy/safety evidence with citations, and the prominent under-4-month
// readiness caveat.
test.describe('Sleep-Training Methods Overview (Neutral) [@feature:sleep-training-overview]', () => {
  test('renders the neutral method menu, tier-1 evidence, and the readiness caveat', async ({ page }) => {
    await page.goto('/?bd=2026-03-01&s=7-2/2/2/2-7');

    const panel = page.getByText('Sleep-training methods', { exact: false }).first();
    await expect(panel).toBeVisible();
    await panel.click();

    // All six methods are named, plainly and without ranking.
    await expect(page.getByText(/Unmodified extinction/)).toBeVisible();
    await expect(page.getByText(/Graduated extinction/)).toBeVisible();
    await expect(page.getByText(/Bedtime fading/)).toBeVisible();
    await expect(page.getByText(/Scheduled awakenings/)).toBeVisible();
    await expect(page.getByText(/Chair method/)).toBeVisible();
    await expect(page.getByText(/Parent education/)).toBeVisible();

    // Efficacy + long-term-safety claims carry a Tier-1 badge...
    await expect(page.getByText(/Do they work\? — the efficacy evidence/)).toBeVisible();
    await expect(page.getByText(/Is it safe long-term\?/)).toBeVisible();
    await expect(page.getByText(/Tier 1 · Evidence-based/).first()).toBeVisible();

    // ...and a resolvable citation link (the AASM review).
    const citation = page.getByRole('link', { name: /American Academy of Sleep Medicine/ }).first();
    await expect(citation).toBeVisible();
    await expect(citation).toHaveAttribute('href', /pubmed\.ncbi\.nlm\.nih\.gov/);

    // The cortisol myth is corrected in context, without dismissing the concern.
    await expect(page.getByText(/cortisol harms your baby/)).toBeVisible();

    // The under-4-month readiness caveat is present and prominent.
    await expect(page.getByText(/not appropriate under about 4 months/)).toBeVisible();
    await expect(page.getByText(/no wrong one here/)).toBeVisible();
  });
});
