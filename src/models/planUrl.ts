import { ScheduleSetting } from './ScheduleSetting';

// @doc:shareable-plan-url @doc:sibling-twins-alignment
// Serializes plans to/from the URL query string. One child is `?bd=…&s=…`
// (unchanged from the original single-child format, so old links keep working);
// a second child adds `&bd2=…&s2=…`.

/** Schedule shorthand, e.g. "7-2/2/2/2-7" (wake-hour, wake windows, bed-hour). */
export function scheduleShorthand(schedule: ScheduleSetting): string {
    return `${schedule.dwt}-${schedule.wws.join('/')}-${schedule.bed}`;
}

/**
 * Apply one child's URL params onto a schedule. Only applies the shorthand when
 * it is well-formed (dwt-ww/ww/...-bed); a truncated or malformed link falls
 * back to the schedule's defaults instead of crashing.
 */
export function applyPlanParams(schedule: ScheduleSetting, bd?: string, s?: string): void {
    if (bd) {
        schedule.birthdayDate = bd;
    }
    if (s) {
        const [dwt, wwString, bed] = s.split('-');
        if (wwString) {
            // Parse into temporaries and apply atomically: one nonnumeric part
            // rejects the whole shorthand, so a mangled link can't leave the
            // schedule half-updated or corrupted with NaN. An empty dwt/bed is
            // still valid — Number('') is 0, the 12:00 select option.
            const wws = wwString.split('/').map(Number);
            const dwtNum = Number(dwt);
            const bedNum = Number(bed);
            if (Number.isNaN(dwtNum) || Number.isNaN(bedNum) || wws.some(Number.isNaN)) return;
            schedule.wws = wws;
            schedule.dwt = dwtNum;
            schedule.bed = bedNum;
        }
    }
}

/** Query string for the whole plan: one child, or two when a sibling is added. */
export function buildPlanQuery(child: ScheduleSetting, sibling?: ScheduleSetting | null): string {
    let query = `?bd=${child.birthdayDate}&s=${scheduleShorthand(child)}`;
    if (sibling) {
        query += `&bd2=${sibling.birthdayDate}&s2=${scheduleShorthand(sibling)}`;
    }
    return query;
}

/** True when the query names a second child (either sibling param present). */
export function hasSiblingParams(params: { bd2?: string; s2?: string }): boolean {
    return Boolean(params.bd2 || params.s2);
}

/** Extra shared params that ride alongside the plan (DST preset, atypical flag,
 * sitter view mode). Blank/undefined values are omitted. */
export interface PlanExtras {
    shift?: string | null;
    at?: string | null;
    view?: string | null;
}

/**
 * Append the shared extras onto a base plan query. Keeps the shift/at/view
 * assembly in one place so the address-bar writer and the sitter link can't
 * drift (e.g. one gaining a param the other forgets).
 */
export function withPlanExtras(baseQuery: string, extras: PlanExtras = {}): string {
    let query = baseQuery;
    if (extras.shift) query += `&shift=${extras.shift}`;
    if (extras.at) query += `&at=${extras.at}`;
    if (extras.view) query += `&view=${extras.view}`;
    return query;
}
