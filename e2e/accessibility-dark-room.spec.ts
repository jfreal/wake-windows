// @test:accessibility-dark-room
import { test, expect } from '@playwright/test';

const PLAN = '/?bd=2026-03-01&s=7-2/2/2/2-7';

test.describe('Accessibility & Dark-Room UX [@feature:accessibility-dark-room]', () => {
  test('the day strip has a text alternative and decorative images are hidden', async ({ page }) => {
    await page.goto(PLAN);

    const strip = page.locator('[role="img"]');
    await expect(strip).toHaveAttribute('aria-label', /Day at a glance: \d+ hours awake/);

    // Every alt-less image is explicitly aria-hidden (the logo keeps its alt).
    const leaking = await page
      .locator('img:not([alt]):not([aria-hidden="true"]), img[alt=""]:not([aria-hidden="true"])')
      .count();
    expect(leaking).toBe(0);
  });

  // Every screen, not just the first one: the 44px floor lives in .btn/.field, so
  // the way it breaks is a new screen that styles a control by hand.
  for (const [screen, url] of [
    ['Today', PLAN],
    ['Log', `${PLAN}&tab=log`],
    ['Learn', `${PLAN}&tab=learn`],
    ['Settings', `${PLAN}&tab=settings`],
  ] as const) {
    test(`all controls on ${screen} are >=44px`, async ({ page }) => {
      await page.goto(url);

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
      expect(boxes.length).toBeGreaterThan(4);
      for (const b of boxes) expect(b.height, `${b.tag} "${b.label}"`).toBeGreaterThanOrEqual(44);
    });
  }

  test('keyboard focus reaches the skip link first, then shows the visible ring', async ({ page }) => {
    await page.goto(`${PLAN}&tab=settings`);

    // The skip link is deliberately the first stop: on desktop the nav rail sits
    // before the screen in the DOM, so without it a keyboard user tabs through
    // four nav items to reach the content on every single screen.
    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();

    // The global ring is applied to real controls, not just to links.
    await page.locator('#bd').focus();
    const focus = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement;
      const s = getComputedStyle(el);
      return { id: el.id, outlineStyle: s.outlineStyle, outlineWidth: s.outlineWidth };
    });
    expect(focus.id).toBe('bd');
    expect(focus.outlineStyle).toBe('solid');
    expect(focus.outlineWidth).toBe('2px');
  });

  test('prefers-reduced-motion collapses state transitions', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(PLAN);
    const duration = await page
      .getByRole('button', { name: 'Where this time comes from' })
      .evaluate((el) => getComputedStyle(el).transitionDuration);
    expect(parseFloat(duration)).toBeLessThanOrEqual(0.01);
  });

  test('tier badges encode by shape + text, not color alone', async ({ page }) => {
    await page.goto(`${PLAN}&tab=learn`);
    const tier1 = page.locator('span[title]', { hasText: 'Tier 1 · Evidence-based' }).first();
    await expect(tier1).toContainText('●');
    const tier2 = page.locator('span[title]', { hasText: 'Tier 2 · Practice-based heuristic' }).first();
    await expect(tier2).toContainText('◐');
  });

  test('public accessibility statement documents target, gaps, and contact', async ({ page }) => {
    await page.goto(`${PLAN}&tab=learn&topic=accessibility`);
    const panel = page.locator('details', { hasText: 'WCAG 2.2 AA target' });
    await panel.locator('summary').click();
    await expect(panel.getByText('WCAG 2.2 Level AA')).toBeVisible();
    await expect(panel.getByText('Known gaps')).toBeVisible();
    await expect(panel.locator('a[href^="mailto:"]')).toBeVisible();
  });
});
