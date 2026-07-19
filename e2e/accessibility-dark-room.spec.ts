// @test:accessibility-dark-room
import { test, expect } from '@playwright/test';

const PLAN = '/?bd=2026-03-01&s=7-2/2/2/2-7';

test.describe('Accessibility & Dark-Room UX [@feature:accessibility-dark-room]', () => {
  test('24h bar has a text alternative and decorative images are hidden', async ({ page }) => {
    await page.goto(PLAN);

    const bar = page.locator('[role="img"]');
    await expect(bar).toHaveAttribute('aria-label', /Day at a glance: \d+ hours awake/);

    // Every alt-less image is explicitly aria-hidden (the logo keeps its alt).
    const leaking = await page
      .locator('img:not([alt]):not([aria-hidden="true"]), img[alt=""]:not([aria-hidden="true"])')
      .count();
    expect(leaking).toBe(0);
  });

  test('all controls are >=44px; keyboard focus shows the visible ring', async ({ page }) => {
    await page.goto(PLAN);

    const boxes = await page
      .locator('button, input, select, summary')
      .evaluateAll((els) =>
        els
          .filter((el) => el.getBoundingClientRect().height > 0)
          .map((el) => ({
            tag: el.tagName,
            label: (el.getAttribute('aria-label') || el.id || el.textContent || '').trim().slice(0, 30),
            height: el.getBoundingClientRect().height,
          })),
      );
    expect(boxes.length).toBeGreaterThan(10);
    for (const b of boxes) expect(b.height, `${b.tag} "${b.label}"`).toBeGreaterThanOrEqual(44);

    // Keyboard-only: Tab reaches the first field and the global ring is applied.
    await page.keyboard.press('Tab');
    const focus = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement;
      const s = getComputedStyle(el);
      return { id: el.id, outlineStyle: s.outlineStyle, outlineWidth: s.outlineWidth };
    });
    expect(focus.id).toBe('bd');
    expect(focus.outlineStyle).toBe('solid');
    expect(focus.outlineWidth).toBe('2px');
  });

  test('prefers-reduced-motion collapses the 24h-bar width transition', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(PLAN);
    const duration = await page
      .locator('[role="img"] > div')
      .first()
      .evaluate((el) => getComputedStyle(el).transitionDuration);
    expect(parseFloat(duration)).toBeLessThanOrEqual(0.01);
  });

  test('tier badges encode by shape + text, not color alone', async ({ page }) => {
    await page.goto(PLAN);
    const tier1 = page.locator('span[title]', { hasText: 'Tier 1 · Evidence-based' }).first();
    await expect(tier1).toContainText('●');
    const tier2 = page.locator('span[title]', { hasText: 'Tier 2 · Practice-based heuristic' }).first();
    await expect(tier2).toContainText('◐');
  });

  test('public accessibility statement documents target, gaps, and contact', async ({ page }) => {
    await page.goto(PLAN);
    const panel = page.locator('details', { hasText: 'WCAG 2.2 AA target' });
    await panel.locator('summary').click();
    await expect(panel.getByText('WCAG 2.2 Level AA')).toBeVisible();
    await expect(panel.getByText('Known gaps')).toBeVisible();
    await expect(panel.locator('a[href^="mailto:"]')).toBeVisible();
  });
});
