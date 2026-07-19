// @doc:calendar-export
// Pure, client-side ICS (RFC 5545) generation for the current plan. No server,
// no account: buildIcs() turns today's nap windows + bedtime into a
// standards-compliant VCALENDAR string that Google, Apple, and Outlook all
// import. The component (CalendarExport.vue) only wraps the string in a Blob
// download; all the calendar logic lives here so it can be unit-tested in
// isolation over plain numbers.
//
// Design notes tied to the F06 spec:
// - One VEVENT per nap window plus bedtime; SUMMARY carries the guidance RANGE
//   ("Nap window 9:40–10:10 AM"), never a single to-the-minute target, and the
//   DESCRIPTION says these are Tier-3 guidance ranges, not fixed appointments —
//   so the export can't read as a rigid schedule.
// - Times are written against a named IANA time zone (DTSTART;TZID=…), so
//   travel or a DST change never shifts an event off its intended wall-clock.
// - UIDs are deterministic from the calendar date + slot (nap-1, bedtime, …),
//   independent of the times, so re-exporting after an edit UPDATES the existing
//   event rather than piling up duplicates.

import { formatClockRange } from './time';

/** A guidance window, both ends in minutes from midnight (local wall-clock). */
export interface IcsWindow {
    earliest: number;
    latest: number;
}

/** Everything buildIcs needs, expressed as primitives so it stays pure. */
export interface IcsPlan {
    /** Calendar date the plan is for (local wall-clock date). */
    date: { year: number; month: number; day: number };
    /** IANA time-zone name, e.g. "America/Chicago". */
    timeZone: string;
    /** Nap start windows, in plan order. */
    napWindows: IcsWindow[];
    /** Bedtime window. */
    bedtimeWindow: IcsWindow;
}

const PRODID = '-//Wake Windows//Calendar Export//EN';
const UID_DOMAIN = 'wakewindows.app';
const GUIDANCE_NOTE =
    'Tier-3 guidance range, not a fixed appointment. Anywhere in the window is fine — settle when you see sleepy cues, even if the clock disagrees.';

function two(n: number): string {
    return String(n).padStart(2, '0');
}

/** Basic date form YYYYMMDD for a calendar date. */
function icsDate(d: IcsPlan['date']): string {
    return `${d.year}${two(d.month)}${two(d.day)}`;
}

/** A local (floating-relative-to-TZID) date-time YYYYMMDDTHHMMSS for a minute
 * offset from the plan date's midnight. Handles the rare roll past midnight. */
function icsLocal(d: IcsPlan['date'], minutes: number): string {
    const total = Math.round(minutes);
    const dayOffset = Math.floor(total / 1440);
    const mins = ((total % 1440) + 1440) % 1440;
    // Date is used only for calendar arithmetic on the passed-in date (never
    // Date.now), so buildIcs stays deterministic for the same plan.
    const base = new Date(d.year, d.month - 1, d.day + dayOffset);
    const hh = Math.floor(mins / 60);
    const mm = mins % 60;
    return `${base.getFullYear()}${two(base.getMonth() + 1)}${two(base.getDate())}T${two(hh)}${two(mm)}00`;
}

/** Escape a TEXT value per RFC 5545 §3.3.11 (backslash, semicolon, comma, newline). */
function escapeText(s: string): string {
    return s
        .replace(/\\/g, '\\\\')
        .replace(/;/g, '\\;')
        .replace(/,/g, '\\,')
        .replace(/\r?\n/g, '\\n');
}

/** Fold a content line to <=75 octets per RFC 5545 §3.1, measuring UTF-8 bytes
 * and breaking on character boundaries. Continuation lines start with a space. */
function fold(line: string): string {
    const enc = new TextEncoder();
    if (enc.encode(line).length <= 75) return line;
    const parts: string[] = [];
    let cur = '';
    let curLen = 0;
    let max = 75; // first line: 75 octets; continuations reserve one for the leading space
    for (const ch of line) {
        const clen = enc.encode(ch).length;
        if (curLen + clen > max) {
            parts.push(cur);
            cur = ch;
            curLen = clen;
            max = 74;
        } else {
            cur += ch;
            curLen += clen;
        }
    }
    parts.push(cur);
    return parts.join('\r\n ');
}

/** Build a standards-compliant VCALENDAR string for the plan. Deterministic for
 * a given plan (stable UIDs + DTSTAMP), so re-export updates instead of dupes. */
export function buildIcs(plan: IcsPlan): string {
    const dateStr = icsDate(plan.date);
    const dtstamp = `${dateStr}T000000Z`;
    const tz = plan.timeZone;

    const events = plan.napWindows.map((window, i) => ({
        slot: `nap-${i + 1}`,
        window,
        summary: `Nap window ${formatClockRange(window.earliest, window.latest)}`,
    }));
    events.push({
        slot: 'bedtime',
        window: plan.bedtimeWindow,
        summary: `Bedtime ${formatClockRange(plan.bedtimeWindow.earliest, plan.bedtimeWindow.latest)}`,
    });

    const lines: string[] = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        `PRODID:${PRODID}`,
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
    ];

    for (const ev of events) {
        const start = ev.window.earliest;
        // Guard against a zero-length event if a caller passes a collapsed window.
        const end = ev.window.latest > start ? ev.window.latest : start + 30;
        lines.push(
            'BEGIN:VEVENT',
            `UID:${ev.slot}-${dateStr}@${UID_DOMAIN}`,
            `DTSTAMP:${dtstamp}`,
            `DTSTART;TZID=${tz}:${icsLocal(plan.date, start)}`,
            `DTEND;TZID=${tz}:${icsLocal(plan.date, end)}`,
            `SUMMARY:${escapeText(ev.summary)}`,
            `DESCRIPTION:${escapeText(GUIDANCE_NOTE)}`,
            'TRANSP:TRANSPARENT',
            'END:VEVENT',
        );
    }

    lines.push('END:VCALENDAR');
    return lines.map(fold).join('\r\n') + '\r\n';
}
