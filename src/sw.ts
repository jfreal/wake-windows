// @doc:offline-mode @doc:reminders-nudges
// Custom service worker (vite-plugin-pwa injectManifest strategy).
//
// It preserves F07 exactly: workbox precaches the built app so a plan renders
// and recomputes offline, and — paired with registerType 'prompt' — a new
// deploy waits for the user's Refresh (SKIP_WAITING) instead of silently pinning
// stale logic. NONE of that behavior changed when we moved off generateSW; we
// just needed our own message handler to host the F01 nudge scheduling below.
//
// F01 nudge delivery: the page posts SCHEDULE_NUDGE with an absolute fire time
// and range-based copy. Where the Notification Triggers API (TimestampTrigger)
// exists, the SW arms a notification that the browser fires at that instant even
// if the tab is closed — which is the whole point of scheduling in the SW rather
// than a setTimeout a backgrounded tab would throttle. Where it does not exist
// (most browsers today, all of iOS Safari), the page has already fallen back to
// its in-page countdown, so this is strictly a best-effort enhancement.

import { precacheAndRoute, cleanupOutdatedCaches, createHandlerBoundToURL } from 'workbox-precaching';
import { NavigationRoute, registerRoute } from 'workbox-routing';

// --- minimal SW-scope typings (this file is checked under lib "DOM", not
// "WebWorker", to share the app tsconfig, so we type the globals we touch). ---
interface PrecacheEntry {
    revision: string | null;
    url: string;
}
interface ShowNotificationOptionsWithTrigger extends NotificationOptions {
    showTrigger?: unknown;
}
interface SwRegistration {
    showNotification(title: string, options?: ShowNotificationOptionsWithTrigger): Promise<void>;
    getNotifications(filter?: { tag?: string }): Promise<Notification[]>;
}
// workbox-build's injectManifest scans for the literal `self.__WB_MANIFEST`
// token to splice the precache list in, so we reach it through `self` (augmented
// below) rather than the `sw` alias — the alias would hide the marker.
declare global {
    interface Window {
        __WB_MANIFEST: PrecacheEntry[];
    }
}

interface SwGlobalScope {
    registration: SwRegistration;
    skipWaiting(): Promise<void>;
    clients: {
        matchAll(opts?: { type?: string; includeUncontrolled?: boolean }): Promise<Array<{ url: string; focus(): Promise<unknown> }>>;
        openWindow(url: string): Promise<unknown>;
    };
    addEventListener(type: string, listener: (event: any) => void): void;
}

declare const TimestampTrigger: { new (timestamp: number): unknown } | undefined;

const sw = self as unknown as SwGlobalScope;

// F07: precache the built app + drop superseded caches on activate.
precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

// F07: SPA navigation fallback — any in-app navigation (e.g. /?bd=…&s=…) is
// served the precached index.html, so a shared plan link renders offline. This
// replaces the navigateFallback generateSW gave us for free before injectManifest.
registerRoute(new NavigationRoute(createHandlerBoundToURL('index.html')));

const NUDGE_TAG = 'ww-prenap-nudge';

interface ScheduleNudgeMessage {
    type: 'SCHEDULE_NUDGE';
    at: number; // absolute epoch-ms fire time
    title: string;
    body: string;
    tag?: string;
}
interface CancelNudgeMessage {
    type: 'CANCEL_NUDGE';
    tag?: string;
}
type SwMessage = { type: 'SKIP_WAITING' } | ScheduleNudgeMessage | CancelNudgeMessage;

// Closes any ALREADY-SHOWN notification with this tag. Note the platform limit:
// getNotifications does not return a pending TimestampTrigger that hasn't fired
// yet, so a nudge already armed for a future time cannot be recalled here — the
// Triggers API has no unschedule primitive. The page guards against this by
// arming at most one background nudge per day (it records the fire at arm time,
// so the daily cap blocks a second), which is why we never stack triggers and
// only need to clear a displayed one.
async function cancelScheduled(tag: string): Promise<void> {
    try {
        const existing = await sw.registration.getNotifications({ tag });
        for (const n of existing) n.close();
    } catch {
        /* getNotifications unsupported or scoped out — nothing to cancel */
    }
}

async function scheduleNudge(msg: ScheduleNudgeMessage): Promise<void> {
    const tag = msg.tag || NUDGE_TAG;
    await cancelScheduled(tag);
    // Only arm a triggered notification when the platform supports it; the page
    // owns the in-page fallback otherwise, so we never double-notify.
    if (typeof TimestampTrigger === 'undefined') return;
    try {
        await sw.registration.showNotification(msg.title, {
            body: msg.body,
            tag,
            badge: 'pwa-192x192.png',
            icon: 'pwa-192x192.png',
            requireInteraction: false,
            showTrigger: new TimestampTrigger(msg.at),
        });
    } catch {
        /* trigger rejected (past time, quota) — page countdown still covers it */
    }
}

sw.addEventListener('message', (event: { data?: SwMessage }) => {
    const data = event.data;
    if (!data) return;
    if (data.type === 'SKIP_WAITING') {
        // F07 update-prompt handshake: OfflineIndicator's Refresh posts this.
        sw.skipWaiting();
    } else if (data.type === 'SCHEDULE_NUDGE') {
        scheduleNudge(data);
    } else if (data.type === 'CANCEL_NUDGE') {
        cancelScheduled(data.tag || NUDGE_TAG);
    }
});

// Focus an open tab (or open one) when the nudge is tapped.
sw.addEventListener('notificationclick', (event: { notification: Notification; waitUntil(p: Promise<unknown>): void }) => {
    event.notification.close();
    event.waitUntil(
        (async () => {
            const all = await sw.clients.matchAll({ type: 'window', includeUncontrolled: true });
            if (all.length > 0) return all[0].focus();
            return sw.clients.openWindow('/');
        })(),
    );
});
