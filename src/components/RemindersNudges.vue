<script setup lang="ts">
// @doc:reminders-nudges
// F01 Reminders & Pre-Nap Nudges: one calm, opt-in "wind-down soon" heads-up a
// configurable lead time (default 30 min) before the END of the current
// wake-window range. Off by default, per-device (no account). Copy always frames
// the window as a RANGE ("next nap window: 9:40–10:10"), never a single deadline
// and never "you missed it"; one accent, no red.
//
// Delivery is Web Notifications scheduled from the service worker (a backgrounded
// tab throttles setTimeout), with a graceful in-page countdown fallback whenever
// notifications are denied or unsupported — which includes iOS Safari unless the
// site is installed to the Home Screen (iOS 16.4+), stated honestly below. All
// the schedulable logic (lead offset, quiet-hours, daily-cap) lives in the pure
// ../models/reminders module; this component stays thin.
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { schedule } from '../stores/plan'
import { effectiveGuidanceMode, windowSlopMinutes } from '../models/GuidanceMode'
import { formatClock, formatClockRange, formatDuration } from '../models/time'
import { storageKey, loadJSON, saveJSON } from '../models/storage'
import {
  type ReminderPrefs,
  type LeadMinutes,
  DEFAULT_REMINDER_PREFS,
  LEAD_MINUTE_OPTIONS,
  normalizePrefs,
  normalizeLeadMinutes,
  normalizeFires,
  nudgeTimeMs,
  msUntilNudge,
  decideNudge,
  dailyCapReached,
  isWithinQuietHours,
  pruneFiresToToday,
} from '../models/reminders'

const NUDGE_TAG = 'ww-prenap-nudge'
const PREFS_KEY = storageKey('reminderPrefs')
const FIRES_KEY = storageKey('reminderFires')

// The shared reactive plan (src/stores/plan.ts), so the nudge tracks exactly the
// schedule on screen. This used to rebuild a private ScheduleSetting from the
// URL at setup and never re-read it — meaning a parent who lengthened a wake
// window got nudged at the OLD time, which for a notification is worse than a
// stale readout: it interrupts them at a moment the plan no longer says.
const slop = computed(() =>
  windowSlopMinutes(effectiveGuidanceMode(schedule.monthsSinceBirth, schedule.atypical)))

// --- persisted, per-device prefs (off by default) ---
const stored = normalizePrefs(loadJSON<ReminderPrefs>(PREFS_KEY, DEFAULT_REMINDER_PREFS))
const enabled = ref(stored.enabled)
const leadMinutes = ref<LeadMinutes>(stored.leadMinutes)
watch([enabled, leadMinutes], ([e, lead]) => {
  saveJSON(PREFS_KEY, { enabled: e, leadMinutes: lead } satisfies ReminderPrefs)
})

// Past fire timestamps, re-validated (a corrupt/legacy blob can't be trusted to
// be an array — storage.ts leaves shape-checking to the caller) then pruned to
// today so the daily cap self-resets at midnight.
const firedAtMs = ref<number[]>(pruneFiresToToday(normalizeFires(loadJSON<unknown>(FIRES_KEY, [])), Date.now()))

// --- environment / capability detection ---
const notificationsSupported = typeof window !== 'undefined' && 'Notification' in window
const swSupported = typeof navigator !== 'undefined' && 'serviceWorker' in navigator
// Notification Triggers (TimestampTrigger) is what lets the SW fire while the tab
// is closed. Absent on most browsers today and all of iOS Safari.
const triggersSupported = notificationsSupported && swSupported && 'TimestampTrigger' in window
const permission = ref<NotificationPermission>(notificationsSupported ? Notification.permission : 'denied')

const ua = typeof navigator !== 'undefined' ? navigator.userAgent : ''
const isIOS = /iPad|iPhone|iPod/.test(ua) || (/Macintosh/.test(ua) && typeof navigator !== 'undefined' && (navigator as unknown as { maxTouchPoints?: number }).maxTouchPoints! > 1)
const isStandalone = typeof window !== 'undefined' &&
  (window.matchMedia?.('(display-mode: standalone)').matches ||
    (navigator as unknown as { standalone?: boolean }).standalone === true)
// iOS only allows web push for a Home-Screen-installed PWA — be honest about it.
const iosNeedsInstall = isIOS && !isStandalone

// --- live clock, ticked once a second only while enabled, purely to drive the
// on-screen countdown and the foreground fire check. The NOTIFICATION itself is
// scheduled in the SW, never on this timer. ---
const now = ref(Date.now())
let tick: ReturnType<typeof setInterval> | undefined
function startTick() {
  if (tick) return
  tick = setInterval(() => { now.value = Date.now() }, 1000)
}
function stopTick() {
  if (tick) { clearInterval(tick); tick = undefined }
}
onMounted(() => { if (enabled.value) startTick() })
onBeforeUnmount(stopTick)
watch(enabled, (e) => { e ? startTick() : stopTick() })

// --- the next upcoming wake-window range (its END is what we nudge before) ---
const nowMinutes = computed(() => {
  const d = new Date(now.value)
  return d.getHours() * 60 + d.getMinutes()
})
const nextWindow = computed(() => schedule.nextNapWindowAt(slop.value, nowMinutes.value))
const hasPlan = computed(() => schedule.napTimes.length > 0)

function msAtLocalMinutes(baseMs: number, minutes: number): number {
  // Build from local wall-clock parts (the Date constructor normalizes minutes
  // into the hour and resolves the correct DST offset for the resulting local
  // time) rather than adding ms to midnight, which would drift by an hour across
  // a DST transition.
  const d = new Date(baseMs)
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, minutes, 0, 0).getTime()
}
// Absolute end of the current wake-window range = the nap window's latest edge,
// recomputed from the live plan each tick (never a frozen timestamp), so a
// TZ/DST change moves it correctly.
const windowEndMs = computed(() =>
  nextWindow.value ? msAtLocalMinutes(now.value, nextWindow.value.latest) : null)

const rangeLabel = computed(() =>
  nextWindow.value ? formatClockRange(nextWindow.value.earliest, nextWindow.value.latest) : '')
const nudgeAtMs = computed(() =>
  windowEndMs.value !== null ? nudgeTimeMs(windowEndMs.value, leadMinutes.value) : null)
const nudgeAtLabel = computed(() => {
  if (nudgeAtMs.value === null) return ''
  const d = new Date(nudgeAtMs.value)
  return formatClock(d.getHours() * 60 + d.getMinutes())
})

const decision = computed(() =>
  windowEndMs.value === null
    ? null
    : decideNudge({
        nowMs: now.value,
        windowEndMs: windowEndMs.value,
        leadMinutes: leadMinutes.value,
        firedAtMs: firedAtMs.value,
      }))

const countdownMs = computed(() =>
  windowEndMs.value === null ? null : msUntilNudge(now.value, windowEndMs.value, leadMinutes.value))
const countdownLabel = computed(() => {
  if (countdownMs.value === null || countdownMs.value <= 0) return ''
  // Reuse the shared duration formatter ("1 h 20 min" / "45 min").
  return formatDuration(Math.ceil(countdownMs.value / 60_000))
})

// True when notifications can actually be delivered in the background (SW +
// triggers + granted). Otherwise we lean on the in-page countdown fallback.
const canPush = computed(() => enabled.value && triggersSupported && permission.value === 'granted')
const capReachedToday = computed(() => dailyCapReached(firedAtMs.value, now.value))

// --- service-worker scheduling (background delivery) ---
function postToSW(message: Record<string, unknown>) {
  if (!swSupported) return
  navigator.serviceWorker.ready.then((reg) => reg.active?.postMessage(message)).catch(() => {})
}
function scheduleViaSW() {
  if (!canPush.value || nudgeAtMs.value === null || windowEndMs.value === null) return
  // Respect quiet-hours + daily-cap by construction on the push path too.
  if (nudgeAtMs.value <= now.value) return
  if (isWithinQuietHours(nudgeAtMs.value)) return
  if (capReachedToday.value) return
  postToSW({
    type: 'SCHEDULE_NUDGE',
    at: nudgeAtMs.value,
    title: 'Wind-down soon',
    body: `Next nap window: ${rangeLabel.value}. A calm time to start settling.`,
    tag: NUDGE_TAG,
  })
  // A background nudge fires even with the tab closed, so recordFire only runs in
  // the foreground would never count it — record it here, at arm time. This
  // makes the daily cap hold by construction (capReachedToday now blocks arming a
  // second window today) and, since a pending TimestampTrigger can't be recalled
  // once armed, keeps us from ever stacking triggers for the same day.
  recordFire(nudgeAtMs.value)
}
function cancelViaSW() {
  postToSW({ type: 'CANCEL_NUDGE', tag: NUDGE_TAG })
}

// Re-schedule whenever the plan window, lead time, or delivery capability change.
watch(
  [canPush, () => windowEndMs.value, leadMinutes, () => nudgeAtMs.value],
  () => { canPush.value ? scheduleViaSW() : cancelViaSW() },
  { immediate: true },
)

async function requestPermission() {
  if (!notificationsSupported) return
  try {
    permission.value = await Notification.requestPermission()
  } catch {
    /* some browsers reject the promise form — leave permission as-is */
  }
}

function recordFire(atMs: number) {
  firedAtMs.value = pruneFiresToToday([...firedAtMs.value, atMs], atMs)
  saveJSON(FIRES_KEY, firedAtMs.value)
}

// Foreground fire: while the tab is open and the nudge comes due, surface the
// in-page banner and (if allowed) a notification, then record it so the daily
// cap holds. This is the fallback path for browsers without background triggers.
const showFired = ref(false)
watch(
  () => decision.value?.fire === true,
  (isDue) => {
    if (!isDue || !enabled.value || capReachedToday.value) return
    // immediate:true so a nudge already due when the tab opens (mid-window) still
    // fires — a plain (non-immediate) watch only reacts to a false→true edge and
    // would silently drop it, leaving the user with no nudge and an empty countdown.
    showFired.value = true
    if (permission.value === 'granted' && notificationsSupported && !triggersSupported) {
      try {
        new Notification('Wind-down soon', {
          body: `Next nap window: ${rangeLabel.value}. A calm time to start settling.`,
          tag: NUDGE_TAG,
        })
      } catch {
        /* Notification constructor unavailable in some SW-only contexts */
      }
    }
    recordFire(now.value)
  },
  { immediate: true },
)

function toggle(on: boolean) {
  enabled.value = on
  if (on) {
    if (notificationsSupported && permission.value === 'default') requestPermission()
  } else {
    showFired.value = false
    cancelViaSW()
  }
}
</script>

<template>
  <!-- @doc:reminders-nudges -->
  <section class="rounded border border-slate-800 p-3" aria-labelledby="reminders-heading">
    <h2 id="reminders-heading" class="text-slate-400 text-sm uppercase font-normal">Pre-nap reminder</h2>
    <p class="text-muted text-xs mt-1 mb-3">
      One quiet heads-up before the wake window closes — nothing else. Off unless you turn it on, only on this
      device, and capped at one a day. No spam, no guilt.
    </p>

    <button type="button" :aria-pressed="enabled"
      class="w-full min-h-11 rounded text-sm p-2.5 text-left border transition-colors"
      :class="enabled
        ? 'bg-sky-400/10 border-sky-400/50 text-sky-200'
        : 'bg-slate-800 border-transparent hover:bg-slate-700 text-slate-300'"
      @click="toggle(!enabled)">
      {{ enabled ? '✓ Nudging me before the next nap window' : 'Nudge me before the next nap window' }}
    </button>

    <div v-if="enabled" class="mt-3 space-y-3">
      <!-- lead-time control -->
      <div class="flex items-center gap-2 text-sm text-slate-300">
        <label for="reminder-lead">Remind me</label>
        <select id="reminder-lead" class="bg-slate-800 border border-slate-700 rounded p-2.5 min-h-11 text-slate-100"
          :value="leadMinutes"
          @change="leadMinutes = normalizeLeadMinutes(Number(($event.target as HTMLSelectElement).value))">
          <option v-for="opt in LEAD_MINUTE_OPTIONS" :key="opt" :value="opt">{{ opt }} min</option>
        </select>
        <span>before the window ends</span>
      </div>

      <template v-if="hasPlan && nextWindow">
        <!-- range-based copy — never a single deadline -->
        <p class="text-sm text-sky-300" data-testid="nudge-range">
          Next nap window: <strong class="tabular-nums">{{ rangeLabel }}</strong>
        </p>

        <!-- fired banner (foreground fallback path) -->
        <p v-if="showFired" role="status" data-testid="nudge-fired"
          class="text-sm text-sky-200 bg-sky-500/10 border border-sky-500/30 rounded p-2">
          Time to start winding down — next nap window {{ rangeLabel }}. Anywhere in the window counts.
        </p>

        <!-- delivery status: background push vs. in-page countdown fallback -->
        <template v-else>
          <p v-if="canPush" class="text-sm text-slate-300" data-testid="nudge-push">
            We’ll nudge you at <span class="tabular-nums text-sky-300">{{ nudgeAtLabel }}</span>
            <span v-if="countdownLabel"> — in about {{ countdownLabel }}</span>. Works even with this tab closed.
          </p>
          <p v-else-if="countdownLabel" class="text-sm text-slate-300" data-testid="nudge-countdown">
            Wind-down nudge in <span class="tabular-nums text-sky-300">{{ countdownLabel }}</span>
            <span class="text-muted"> — while this tab stays open</span>.
          </p>
          <p v-else-if="capReachedToday" class="text-sm text-muted" data-testid="nudge-capped">
            That’s today’s one nudge. Reminders pick back up tomorrow.
          </p>
        </template>

        <!-- permission prompt when notifications are supported but not yet granted -->
        <div v-if="notificationsSupported && permission === 'default' && !iosNeedsInstall">
          <button type="button"
            class="btn btn-primary"
            @click="requestPermission">Allow notifications</button>
          <p class="text-muted text-xs mt-1">
            Optional — without it, the reminder shows as an on-page countdown while this tab is open.
          </p>
        </div>

        <!-- honest fallback notices -->
        <p v-if="iosNeedsInstall" class="text-sm text-muted" data-testid="nudge-ios-note">
          On iPhone/iPad, background reminders need the app added to your Home Screen (Share → “Add to Home
          Screen”, iOS 16.4+). Until then, the on-page countdown above keeps working.
        </p>
        <p v-else-if="!notificationsSupported || !triggersSupported" class="text-muted text-xs"
          data-testid="nudge-unsupported">
          Your browser can’t fire reminders in the background, so this one runs as an on-page countdown while the
          tab is open.
        </p>
        <p v-else-if="permission === 'denied'" class="text-muted text-xs">
          Notifications are blocked, so the reminder runs as the on-page countdown above.
        </p>
      </template>

      <p v-else class="text-sm text-muted" data-testid="nudge-noplan">
        No more nap windows today — reminders pick back up with tomorrow’s plan.
      </p>
    </div>
  </section>
</template>
