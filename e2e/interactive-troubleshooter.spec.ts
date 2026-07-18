// @test:interactive-troubleshooter
import { test, expect } from '@playwright/test';

test.describe('Interactive Sleep Troubleshooter (Decision Tree) [@feature:interactive-troubleshooter]', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/?bd=2026-03-01&s=7-2/2/2/2-7');
  });

  test('offers the three problem trees', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Sleep Troubleshooter' })).toBeVisible();
    await expect(page.getByRole('button', { name: /Waking too early/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /Short naps/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /False start or split night/ })).toBeVisible();
  });

  test('walks early rising to a cited Tier 3 answer with a patience note', async ({ page }) => {
    await page.getByRole('button', { name: /Waking too early/ }).click();
    await page.getByRole('button', { name: 'No — baby is well' }).click();
    await page.getByRole('button', { name: 'Before about 6:00 AM' }).click();
    await page.getByRole('button', { name: /Bedtime runs late/ }).click();

    await expect(page.getByText('Likely overtired — try an earlier bedtime')).toBeVisible();
    await expect(page.getByText('Try this')).toBeVisible();
    await expect(page.getByText(/Give any change at least 1–2 weeks/)).toBeVisible();
    await expect(page.getByText(/Tier 3/).filter({ visible: true }).last()).toBeVisible();
    await expect(page.getByRole('link', { name: /Taking Cara Babies/ })).toBeVisible();
  });

  test('routes medical red flags to the pediatrician without a diagnosis', async ({ page }) => {
    await page.getByRole('button', { name: /Short naps/ }).click();
    await page.getByRole('button', { name: 'Yes — something may be off medically' }).click();

    await expect(page.getByText('Check in with your pediatrician first')).toBeVisible();
  });

  test('back returns to the previous question', async ({ page }) => {
    await page.getByRole('button', { name: /False start or split night/ }).click();
    await page.getByRole('button', { name: 'No — baby is well' }).click();
    await expect(page.getByText('When is the waking happening?')).toBeVisible();

    await page.getByRole('button', { name: '← Back' }).click();
    await expect(page.getByRole('button', { name: 'No — baby is well' })).toBeVisible();
  });
});
