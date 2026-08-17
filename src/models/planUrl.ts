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
 * sitter view mode). Blank/undefined values are omitted.
 *
 * @doc:caregiver-handoff-notes — the handoff note (`hn`) and last-nap snapshot
 * (`hns` start, `hne` end) ride here too, so an incoming caregiver's read-only
 * link carries what-just-happened, not only the plan. The snapshot is needed
 * because their device has no log of its own to recompute from. An in-progress
 * nap is encoded as `hns` with no `hne` (still asleep). */
export interface PlanExtras {
    shift?: string | null;
    at?: string | null;
    view?: string | null;
    note?: string | null;
    napStart?: number | null;
    napEnd?: number | null;
    /** Which of the four screens is open. Blank on Today — the default screen
     * carries no param, so a link to Today and a bare link are the same link. */
    tab?: string | null;
    /** The open Learn article, so an article is a thing you can send someone. */
    topic?: string | null;
}

/**
 * Append the shared extras onto a base plan query. Keeps the shift/at/view/
 * handoff assembly in one place so the address-bar writer and the shared links
 * can't drift (e.g. one gaining a param the other forgets).
 */
export function withPlanExtras(baseQuery: string, extras: PlanExtras = {}): string {
    let query = baseQuery;
    if (extras.shift) query += `&shift=${extras.shift}`;
    if (extras.at) query += `&at=${extras.at}`;
    if (extras.view) query += `&view=${extras.view}`;
    if (extras.tab) query += `&tab=${extras.tab}`;
    // Encoded, unlike `tab`: the tab is one of four literals this code owns,
    // but the topic is seeded from the incoming query string, so an `&` in it
    // would split into a second param and change what the link means.
    if (extras.topic) query += `&topic=${encodeURIComponent(extras.topic)}`;
    // @doc:caregiver-handoff-notes — note is free text, so it must be encoded;
    // the timestamps are plain integers. napEnd omitted ⇒ nap still in progress.
    if (extras.note) query += `&hn=${encodeURIComponent(extras.note)}`;
    if (extras.napStart != null) query += `&hns=${extras.napStart}`;
    if (extras.napEnd != null) query += `&hne=${extras.napEnd}`;
    return query;
}

// @doc:caregiver-handoff-notes
/** The decoded handoff payload from a shared link, or null when the link
 * carries no handoff at all (a plain sitter link). `note` is '' when only a nap
 * snapshot rode along; `lastNap` is null when only a note did. A `hns` with no
 * `hne` decodes to an in-progress nap (`end: null`). */
export interface HandoffPayload {
    note: string;
    lastNap: { start: number; end: number | null } | null;
}

/** Parse handoff params off a query (already URL-decoded, e.g. from
 * URLSearchParams). Malformed timestamps degrade gracefully rather than throw:
 * a non-numeric `hns` is treated as no snapshot; a non-numeric `hne` as
 * in-progress. Returns null when neither a note nor a nap is present. */
export function parseHandoff(params: { hn?: string; hns?: string; hne?: string }): HandoffPayload | null {
    const note = typeof params.hn === 'string' ? params.hn : '';
    const start = params.hns != null ? Number(params.hns) : NaN;
    const hasNap = Number.isFinite(start);
    if (!note && !hasNap) return null;
    let end: number | null = null;
    if (hasNap && params.hne != null && params.hne !== '') {
        const parsed = Number(params.hne);
        end = Number.isFinite(parsed) ? parsed : null;
    }
    return {
        note,
        lastNap: hasNap ? { start, end } : null,
    };
}
