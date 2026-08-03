import { reactive, ref, watch } from 'vue'
import {
    type SleepEntry,
    loadLog,
    saveLog,
    runningCount,
} from '../models/sleepLog'
import { tickRateFor } from '../models/tickRate'

// @doc:sleep-nap-logging @doc:trends-daily-totals
//
// The one live sleep log, plus the one clock that drives every ticking readout.
//
// Both panels that read the log (the log itself and the "Today" totals +
// sparkline above it) used to own a private 1-second setInterval, and the
// trends one re-parsed the whole log out of localStorage on every tick just to
// notice edits made in the panel below it. That is a synchronous JSON.parse
// plus a full recompute, once a second, forever — on a phone, at 3am, whether
// or not anything was actually timing. Sharing the array makes the re-read
// unnecessary and lets one adaptive ticker serve everyone.
//
// Cadence: 1s while a timer is actually running (the elapsed readout has to
// advance), 60s while idle (nothing is counting, but "Today" still has to roll
// over at local midnight), and stopped entirely while the page is hidden, with
// an immediate catch-up tick when it comes back.

/** The log. Mutate this array directly; persistence is automatic. */
export const entries = reactive<SleepEntry[]>(loadLog())

/** Shared display clock. Timestamps are the source of truth — this only exists
 * so derived readouts (elapsed, "so far", today's totals) re-render. */
export const now = ref(Date.now())

let ticker: ReturnType<typeof setInterval> | undefined
let tickerRate = 0

function tick(): void {
    now.value = Date.now()
}

/** Start, stop, or re-rate the shared ticker to match what is on screen.
 * The rate policy itself is a pure function in models/tickRate.ts, unit-tested. */
function syncTicker(): void {
    const visible = typeof document === 'undefined' || document.visibilityState === 'visible'
    const wanted = tickRateFor(visible, runningCount(entries))
    if (wanted === tickerRate) return
    if (ticker !== undefined) clearInterval(ticker)
    ticker = undefined
    tickerRate = wanted
    if (wanted === 0) return
    // Catch up immediately: while hidden (or while idling at 60s) the clock has
    // drifted, and the readout must be right the moment it is looked at.
    tick()
    ticker = setInterval(tick, wanted)
}

if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', () => {
        syncTicker()
        if (document.visibilityState === 'visible') tick()
    })
}

// --- persistence -----------------------------------------------------------

// Debounced: editing a datetime-local field or holding a spinner would
// otherwise fire a full JSON.stringify + synchronous localStorage write per
// keystroke.
const SAVE_DEBOUNCE_MS = 250
let saveTimer: ReturnType<typeof setTimeout> | undefined
let persisting = true

function flushSave(): void {
    clearTimeout(saveTimer)
    saveTimer = undefined
    if (!persisting) return
    saveLog(entries as SleepEntry[])
}

watch(entries, () => {
    // A start/stop changes how fast the clock needs to run.
    syncTicker()
    if (!persisting) return
    clearTimeout(saveTimer)
    saveTimer = setTimeout(flushSave, SAVE_DEBOUNCE_MS)
}, { deep: true })

// Backgrounding a phone browser is the likeliest moment for the tab to be
// discarded, so bank any pending write there rather than trusting `unload`.
if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') flushSave()
    })
}

// @doc:ephemerality-data-deletion
/**
 * Stop persisting, permanently, and drop any pending write.
 *
 * "Delete all my data" clears localStorage and reloads. Without this, a save
 * debounced a moment earlier — or the flush-on-hidden that a reload can
 * trigger — would write the log straight back out after the clear and
 * resurrect exactly the data we just promised was gone.
 */
export function stopPersisting(): void {
    persisting = false
    clearTimeout(saveTimer)
    saveTimer = undefined
}

syncTicker()
