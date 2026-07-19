// @test:no-ai-no-data-training
import { test, expect } from '@playwright/test';

test.describe('No-AI / No-Data-Training Stance [@feature:no-ai-no-data-training]', () => {
  test('stance panel states the no-AI promise precisely and cites competitor AI data flows', async ({ page }) => {
    await page.goto('/?bd=2026-03-01&s=7-2/2/2/2-7');
    const summary = page.locator('summary', { hasText: 'No AI — on purpose' });
    await expect(summary).toBeVisible();
    await summary.click(); // open the <details>
    // The exact stance sentence, and the precise (non-overclaiming) scope.
    await expect(page.getByText("We don't use AI. We don't train anything on your data.")).toBeVisible();
    await expect(page.getByText(/no LLM, no chatbot, and no machine-learned model/)).toBeVisible();
    await expect(page.getByText(/That's a feature, not a gap/)).toBeVisible();
    // Competitor citations per the spec links.
    await expect(page.locator('a[href="https://napper.app/privacy/"]')).toBeVisible();
    await expect(page.locator('a[href^="https://huckleberry.zendesk.com/"]')).toBeVisible();
    await expect(page.locator('a[href="https://www.robinbaby.com/"]')).toBeVisible();
  });

  test('"How this was calculated" walks the arithmetic with the plan\'s own numbers', async ({ page }) => {
    await page.goto('/?bd=2026-03-01&s=7-2/2/2/2-7');
    // "How this was calculated" is also quoted inside the stance panel's body
    // copy, so target the disclosure element itself.
    const summary = page.locator('summary', { hasText: 'How this was calculated' });
    await expect(summary).toBeVisible();
    await summary.click(); // open the <details>
    const panel = page.locator('details', { has: page.locator('summary', { hasText: 'How this was calculated' }) });
    // The walk uses the plan's inputs: wake 7 AM, windows 2/2/2/2, bed 7 PM.
    await expect(panel.getByText('Start at your wake time,')).toBeVisible();
    await expect(panel.getByText('2 h / 2 h / 2 h / 2 h')).toBeVisible();
    await expect(panel.getByText(/Your bedtime,/)).toBeVisible();
    // Route-derived values, not just prose: 7 AM wake, 7 PM bed, and the
    // computed chain 24h − 12h night − 8h awake = 4h naps → 1 h 20 min each.
    await expect(panel.getByText('7:00 AM', { exact: true })).toBeVisible();
    await expect(panel.getByText('7:00 PM', { exact: true })).toBeVisible();
    await expect(panel.getByText('12 h', { exact: true })).toBeVisible();
    await expect(panel.getByText('4 h', { exact: true })).toBeVisible();
    await expect(panel.getByText('1 h 20 min', { exact: true })).toBeVisible();
    // The one non-arithmetic ingredient is labeled Tier 2, and determinism is stated.
    await expect(page.getByText('The wake-window lengths are the only judgment call', { exact: false })).toBeVisible();
    await expect(page.getByText('No AI anywhere in this. Same inputs, same plan, every time.')).toBeVisible();
  });

  test('sitter view keeps the plan but drops both G04 surfaces', async ({ page }) => {
    await page.goto('/?bd=2026-03-01&s=7-2/2/2/2-7&view=sitter');
    // The plan itself still renders…
    await expect(page.getByText('Sitter view · read-only')).toBeVisible();
    await expect(page.getByText('Next nap')).toBeVisible();
    // …but neither the stance panel nor the arithmetic walk exists here.
    await expect(page.getByText('No AI — on purpose')).toHaveCount(0);
    await expect(page.getByText('How this was calculated')).toHaveCount(0);
  });
});
