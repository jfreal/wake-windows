// @test:corrected-gestational-age
import { test, expect } from '@playwright/test';

test.describe('Corrected / gestational-age input [@feature:corrected-gestational-age]', () => {
  test('accepts gestational weeks and warns on out-of-range values', async ({ page }) => {
    await page.goto('/?bd=2026-03-01&s=7-2/2/2/2-7');
    const weeks = page.locator('#weeks');
    await expect(weeks).toBeVisible();
    await weeks.fill('10');
    await expect(page.getByText(/Weeks in womb should typically be between 20 and 44/)).toBeVisible();
    await weeks.fill('40');
    await expect(page.getByText(/Weeks in womb should typically be between 20 and 44/)).toHaveCount(0);
  });

  // A blank or out-of-range field is not a preemie. `'' < 37` is true in JS, so
  // the adjusted-age note has to test the number, not just the comparison —
  // otherwise clearing the field to retype it tells a full-term parent their
  // baby was born early, quoting an adjusted age of 0 mo.
  test('the born-early note tracks a real gestational age, not a blank field', async ({ page }) => {
    await page.goto('/?bd=2026-03-01&s=7-2/2/2/2-7');
    const weeks = page.locator('#weeks');
    await weeks.fill('34');
    await expect(page.getByText(/Born early/)).toBeVisible();

    await weeks.fill('');
    await expect(page.getByText(/Born early/)).toHaveCount(0);

    await weeks.fill('40');
    await expect(page.getByText(/Born early/)).toHaveCount(0);
  });
});
