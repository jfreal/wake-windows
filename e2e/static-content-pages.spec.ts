// @test:static-content-pages
import { test, expect } from '@playwright/test';

// Feature: Static content pages (H01). The /sleep-schedule pages are emitted by
// the build, not routed by the SPA, so the things worth testing end-to-end are
// the seams: that they are served as real documents, that the deep link into
// the planner actually loads the day the page prints, and that the service
// worker's SPA navigation fallback does not swallow them once it is installed.
test.describe('Static content pages [@feature:static-content-pages]', () => {
  test('hub is a real document that links every age page', async ({ page }) => {
    await page.goto('/sleep-schedule/');

    await expect(page.getByRole('heading', { level: 1, name: 'Baby sleep schedules by age' })).toBeVisible();
    for (const months of [3, 4, 5, 6, 7]) {
      await expect(page.getByRole('link', { name: `${months} month old sleep schedule` })).toBeVisible();
    }
  });

  test('age page prints a schedule and points at itself as canonical', async ({ page }) => {
    await page.goto('/sleep-schedule/4-month-old/');

    await expect(page.getByRole('heading', { level: 1, name: '4 month old sleep schedule' })).toBeVisible();
    await expect(page.getByRole('rowheader', { name: 'Nap 1' })).toBeVisible();

    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
    expect(canonical).toBe('https://wakewindows.guru/sleep-schedule/4-month-old/');
  });

  // The whole cluster exists to be read without JavaScript — an article that
  // needs the bundle to render is invisible to the crawlers it is written for.
  test('renders with JavaScript disabled', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto('/sleep-schedule/6-month-old/');

    await expect(page.getByRole('heading', { level: 1, name: '6 month old sleep schedule' })).toBeVisible();
    // The published range for 6-8 months, straight from the Tier-1 bracket.
    await expect(page.getByText('120–180 min')).toBeVisible();
    await context.close();
  });

  test('call to action opens the planner on the day the page printed', async ({ page }) => {
    await page.goto('/sleep-schedule/7-month-old/');

    const bedtime = await page.getByRole('row', { name: /Bedtime/ }).innerText();
    await page.getByRole('link', { name: 'Open this day in the planner' }).click();

    await expect(page).toHaveURL(/\/\?s=7-2\.5\/3\/3-7$/);
    // 7 months is a two-nap day in the page's sample; the planner should agree.
    await expect(page.getByText(/Naps \(2\)/)).toBeVisible();
    expect(bedtime).toContain('7:00 PM');
  });

  test('survives the service worker\'s SPA navigation fallback', async ({ page }) => {
    // Install the worker from the app, then navigate to a content page: without
    // the denylist in src/sw.ts the fallback answers with the app shell.
    await page.goto('/');
    await page.waitForFunction(async () => {
      const reg = await navigator.serviceWorker?.ready;
      return !!reg?.active;
    });

    await page.goto('/sleep-schedule/5-month-old/');
    await expect(page.getByRole('heading', { level: 1, name: '5 month old sleep schedule' })).toBeVisible();
  });
});
