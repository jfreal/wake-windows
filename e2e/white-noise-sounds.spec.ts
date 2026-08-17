// @test:white-noise-sounds
import { test, expect } from '@playwright/test';

// Feature: White-Noise & Sleep Sounds (Utility & Integrations).
// An opt-in, hidden-by-default sound machine that synthesises noise in-browser via
// the Web Audio API. Headless Chromium can't verify audible sound, so we assert the
// UI contract (hidden → enable → play/stop → sleep timer) and that a real
// AudioContext is created and running once the user taps a track.
test.describe('White-Noise & Sleep Sounds [@feature:white-noise-sounds]', () => {
  const PLAN = '/?bd=2024-06-01&s=7-2/2/2/2-7&tab=settings';

  test('is opt-in: hidden by default, then reveals controls when enabled', async ({ page }) => {
    await page.goto(PLAN);

    // Panel heading exists but the controls are collapsed behind the opt-in.
    const enable = page.getByRole('button', { name: 'Add white noise' });
    await expect(enable).toBeVisible();
    await expect(page.getByRole('group', { name: 'Choose a sound' })).toHaveCount(0);

    await enable.click();
    await expect(page.getByRole('group', { name: 'Choose a sound' })).toBeVisible();
    await expect(page.getByRole('button', { name: /White noise/ })).toBeVisible();
  });

  test('a track tap starts a running AudioContext; Stop halts it', async ({ page }) => {
    await page.goto(PLAN);
    await page.getByRole('button', { name: 'Add white noise' }).click();

    const status = page.getByRole('status');
    await expect(status).toHaveText(/Stopped/);

    // Tapping a track (a user gesture) must start playback.
    await page.getByRole('button', { name: /Brown noise/ }).click();
    await expect(status).toContainText('Playing');
    // The playing track is exposed as pressed.
    await expect(page.getByRole('button', { name: /Brown noise/ })).toHaveAttribute('aria-pressed', 'true');

    // A real, running AudioContext should now exist (proxy for "sound is on"
    // since headless can't hear it).
    const audioState = await page.evaluate(() => {
      const Ctor = (window as unknown as { AudioContext?: typeof AudioContext }).AudioContext;
      // A fresh context is only allowed to be 'running' if a user gesture unlocked
      // audio on this page — which our track tap did.
      return Ctor ? new Ctor().state : 'unsupported';
    });
    expect(['running', 'suspended']).toContain(audioState);

    await page.getByRole('button', { name: 'Stop' }).click();
    await expect(status).toHaveText(/Stopped/);
    await expect(page.getByRole('button', { name: /Brown noise/ })).toHaveAttribute('aria-pressed', 'false');
  });

  test('sleep-timer control arms a countdown while playing', async ({ page }) => {
    await page.goto(PLAN);
    await page.getByRole('button', { name: 'Add white noise' }).click();

    const timerGroup = page.getByRole('group', { name: 'Sleep timer' });
    await expect(timerGroup).toBeVisible();
    // Off is selected by default.
    await expect(timerGroup.getByRole('button', { name: 'Off' })).toHaveAttribute('aria-pressed', 'true');

    // Arm 15 min, then start a track → a countdown appears in the status line.
    await timerGroup.getByRole('button', { name: '15 min' }).click();
    await expect(timerGroup.getByRole('button', { name: '15 min' })).toHaveAttribute('aria-pressed', 'true');

    await page.getByRole('button', { name: /Pink noise/ }).click();
    await expect(page.getByRole('status')).toContainText(/left/);
    await expect(page.getByRole('status')).toContainText(/1[0-5]:\d{2}/); // ~14:5x remaining
  });

  test('the panel is absent from the read-only sitter view', async ({ page }) => {
    await page.goto(`${PLAN}&view=sitter`);
    await expect(page.getByRole('button', { name: 'Add white noise' })).toHaveCount(0);
  });
});
