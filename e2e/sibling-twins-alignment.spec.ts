// @test:sibling-twins-alignment
import { test, expect } from '@playwright/test';

test.describe('Sibling / Twins Schedule Alignment [@feature:sibling-twins-alignment]', () => {
  test('adds a twin, shows the stacked view with shared quiet blocks, and persists both in the URL', async ({ page }) => {
    await page.goto('/?bd=2026-03-01&s=7-2/2/2/2-7');
    await expect(page.getByText('Shared quiet block')).toHaveCount(0);

    await page.getByRole('button', { name: '+ Add sibling / twin' }).click();

    // Twin is seeded identical to Baby A, so every nap is a shared quiet block.
    await expect(page.getByText('Shared quiet block')).toBeVisible();
    await expect(page.getByText('Quiet block 1')).toBeVisible();
    await expect.poll(() => decodeURIComponent(page.url())).toContain('bd2=2026-03-01');
    await expect.poll(() => decodeURIComponent(page.url())).toContain('s2=7-2/2/2/2-7');
  });

  test('loads a two-child link with asymmetric schedules and reports no overlap honestly', async ({ page }) => {
    // Baby A: 4 short naps; Baby B: 2 long naps that only ever touch A's naps.
    await page.goto('/?bd=2026-03-01&s=7-2/2/2/2/2-7&bd2=2025-06-01&s2=7-3/3/3-7');
    await expect(page.getByText('Shared quiet block')).toBeVisible();
    await expect(page.getByText('No overlapping nap window on these schedules.')).toBeVisible();

    await page.getByRole('button', { name: 'Remove', exact: true }).click();
    await expect(page.getByText('Shared quiet block')).toHaveCount(0);
    await expect.poll(() => decodeURIComponent(page.url())).not.toContain('bd2');
  });

  test('old single-child links keep working with no sibling UI', async ({ page }) => {
    await page.goto('/?bd=2026-03-01&s=7-2/2/2/2-7');
    await expect(page.getByRole('button', { name: '+ Add sibling / twin' })).toBeVisible();
    await expect(page.locator('#b-bd')).toHaveCount(0);
    await expect.poll(() => decodeURIComponent(page.url())).toContain('s=7-2/2/2/2-7');
  });
});
