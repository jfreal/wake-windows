// @doc:sleep-nap-logging @doc:trends-daily-totals
// How fast the shared display clock has to run.
//
// Pure so the policy can be proven in a unit test rather than eyeballed in a
// browser — the failure mode it exists to prevent (a 1-second interval running
// forever, on a phone, whether or not anything is being timed) is invisible on
// a desktop and expensive on the device this app is actually used on.

/** Tick every second while a timer is running: the elapsed readout advances. */
export const RUNNING_TICK_MS = 1000;

/**
 * Tick once a minute when nothing is running. Not zero: "Today" totals are
 * bucketed by local midnight, so a page left open overnight still has to roll
 * over to the new day on its own.
 */
export const IDLE_TICK_MS = 60 * 1000;

/** Don't tick at all while the page is hidden. */
export const STOPPED = 0;

/**
 * The interval the shared clock should be running at, in ms, or STOPPED (0).
 *
 * @param visible  document.visibilityState === 'visible'
 * @param running  how many sleep timers are currently running
 */
export function tickRateFor(visible: boolean, running: number): number {
    if (!visible) return STOPPED;
    return running > 0 ? RUNNING_TICK_MS : IDLE_TICK_MS;
}
