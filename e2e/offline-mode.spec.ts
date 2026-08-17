// @test:offline-mode
import { test, expect } from '@playwright/test';

// Feature: Offline Mode (F07). The service worker precaches the app shell,
// assets, and bundled citations (citations.json is imported into the JS
// bundle), so a plan renders and recomputes with zero network.
test.describe('Offline Mode [@feature:offline-mode]', () => {
  test('plan renders and recomputes fully offline', async ({ page, context }) => {
    // First visit online: service worker installs and precaches everything.
    // Settings: the wake-time control the recompute-offline step needs lives
    // there, and the offline banner + cached footer render on every screen.
    await page.goto('/?bd=2026-01-15&s=7-2/2.25/2.5-19&tab=settings');
    await page.waitForFunction(async () => {
      const reg = await navigator.serviceWorker?.ready;
      return !!reg?.active;
    });

    // Reload so the page is controlled by the worker, then cut the network.
    await page.reload();
    await context.setOffline(true);
    await page.reload();

    // App shell renders from cache — no error page.
    // The shell renders from cache. Asserted on the page heading, which is
    // present at every width — the brand IMAGE is decorative (the heading text
    // beside it already names the app) and moves between the header and the
    // sidebar depending on viewport.
    await expect(page.getByRole('heading', { level: 1, name: /Wake Windows/ })).toBeAttached();

    // Honest indicator instead of a spinner or error.
    await expect(page.getByText('Offline — your plan still works')).toBeVisible();

    // Bundled citation content survives offline (footer text comes from
    // citations.json meta).
    await expect(page.locator('footer').getByText(/Guidance last reviewed/)).toBeVisible();

    // Recompute offline: change desired wake time; the URL shorthand the
    // schedule watcher writes must reflect the new plan.
    await page.selectOption('#dwt', '6.5');
    await expect(page).toHaveURL(/s=6\.5-2\/2\.25\/2\.5-19/);

    // Back online: the banner goes away.
    await context.setOffline(false);
    await expect(page.getByText('Offline — your plan still works')).toBeHidden();
  });
});
