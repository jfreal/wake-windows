// @doc:static-content-pages @doc:wake-window-schedule-generator
//
// Cluster 1 of docs/research/seo-topic-clusters.md: one indexable page per age
// for `{age} old sleep schedule`. Those queries carry 8k-12k searches a month at
// KD 0-7, and the SERPs for them are won by article pages, not by calculators —
// so each page is real HTML with a sample day already computed, and the planner
// is the call to action rather than the whole page.
//
// The numbers are NOT written by hand. Every sample day is walked through the
// same ScheduleSetting the app uses, and every published range comes out of the
// Tier-1 bracket in SleepRecommendations. agePages.test.ts asserts each sample
// day sits inside its own age bracket, so a page cannot drift into claiming
// something the app would flag as out of range.

import { ScheduleSetting } from '../models/ScheduleSetting'
import { SleepRecommendationRepository } from '../models/SleepRecommendations'
import { formatClock, formatClockRange, formatDuration, roundToStep } from '../models/time'

export const SITE_ORIGIN = 'https://wakewindows.guru'
/** Every cluster-1 page lives under this path, so the SPA keeps `/` to itself. */
export const CLUSTER_BASE = '/sleep-schedule'

/** The Tier-1 recommendation (AAP / Sleep Foundation ranges) — the only source
 * these pages quote numeric ranges from. Tier-2 consultant frameworks stay in
 * the app, where the tier badge travels with them. */
export function generalGuidance() {
    const repo = new SleepRecommendationRepository()
    const source = repo.recommendations.find((r) => r.tier === 1)
    if (!source) throw new Error('agePages: no Tier-1 recommendation found')
    return source
}

/** The bracket covering an age in months, from the Tier-1 source. */
export function bracketForMonths(months: number) {
    const bracket = generalGuidance().currentBracket(months)
    if (!bracket) throw new Error(`agePages: no Tier-1 bracket covers ${months} months`)
    return bracket
}

export interface AgePageDefinition {
    /** URL segment, e.g. '4-month-old' → /sleep-schedule/4-month-old */
    slug: string
    /** Age the page is written for, in months. */
    months: number
    /** The query the page targets, verbatim. */
    keyword: string
    /** Monthly US search volume and difficulty at the time of research
     * (OpenSEO/DataForSEO, 2026-08-21) — kept next to the page so the build
     * order stays arguable later. */
    searchVolume: number
    keywordDifficulty: number
    /** Sample day: morning wake hour (AM), wake windows in hours, bedtime hour (PM). */
    wakeHour: number
    wws: number[]
    bedHour: number
    /** One paragraph under the H1. Written per age; the numbers around it are computed. */
    intro: string
    /** What the parent should expect to change next, in prose. */
    whatChangesNext: string
    faqs: { question: string; answer: string }[]
}

/** The five pages of the first tranche (highest volume at the lowest difficulty).
 * Wake windows are chosen to sit inside the age's Tier-1 bracket — the test
 * enforces it, so edit these only together with a passing test run. */
export const AGE_PAGES: AgePageDefinition[] = [
    {
        slug: '3-month-old',
        months: 3,
        keyword: '3 month old sleep schedule',
        searchVolume: 9900,
        keywordDifficulty: 5,
        wakeHour: 7,
        wws: [1.5, 1.5, 1.5, 1.75, 1.75],
        bedHour: 7,
        intro:
            'At three months a baby is still mostly cue-led. The circadian clock — the internal '
            + 'day/night rhythm — is only starting to mature, so a schedule at this age is a shape '
            + 'to aim at, not a timetable to enforce. Most three-month-olds still take four naps, '
            + 'and the last one is often a short bridge nap that only exists to get everyone to bedtime.',
        whatChangesNext:
            'Between three and five months the wake windows stretch and the fourth nap starts to '
            + 'fall apart. Expect the day to reorganise itself around three naps rather than four.',
        faqs: [
            {
                question: 'How many naps should a 3 month old take?',
                answer:
                    'Usually four, sometimes five. The Tier-1 range for this age is 3–5 naps a day. '
                    + 'The last nap is often short and late; it is doing its job if it gets you to bedtime '
                    + 'without an overtired baby.',
            },
            {
                question: 'What are wake windows at 3 months?',
                answer:
                    'Roughly 75–150 minutes, starting shorter in the morning and lengthening through the day. '
                    + '"Wake window" is a practice-based heuristic, not a term from the sleep-medicine '
                    + 'literature — treat it as a starting estimate and let sleepy cues override it.',
            },
            {
                question: 'Should I wake a 3 month old from a nap?',
                answer:
                    'Capping a very long nap can protect the following night, but at three months the total '
                    + 'matters more than the distribution. If naps are long and nights are fine, leave it alone.',
            },
        ],
    },
    {
        slug: '4-month-old',
        months: 4,
        keyword: '4 month old sleep schedule',
        searchVolume: 12100,
        keywordDifficulty: 7,
        wakeHour: 7,
        wws: [1.5, 1.75, 1.75, 2, 2],
        bedHour: 7.5,
        intro:
            'Four months is when sleep changes shape. Sleep cycles mature into adult-like stages, so a '
            + 'baby who used to sleep through a transition now surfaces at the end of every cycle. This '
            + 'is what gets called the four-month sleep regression, and it is a permanent developmental '
            + 'change rather than a phase that reverses. The day usually still holds four naps, with the '
            + 'last one short.',
        whatChangesNext:
            'Over the next month the fourth nap drops and the wake windows lengthen toward two hours. '
            + 'If naps suddenly shorten to 30–45 minutes, the schedule is usually not the cause — the '
            + 'sleep-cycle change is.',
        faqs: [
            {
                question: 'How much sleep does a 4 month old need?',
                answer:
                    'The Tier-1 range is 3.5–5 hours of daytime sleep and 10–12 hours at night, so roughly '
                    + '13.5–17 hours in 24. Individual babies sit anywhere in that band; a baby at the low end '
                    + 'who wakes happy is not short on sleep.',
            },
            {
                question: 'Is the 4 month sleep regression about the schedule?',
                answer:
                    'Mostly not. The regression is a change in how sleep cycles are structured. A schedule '
                    + 'that is close to the age ranges will not prevent it, though an overtired day makes it '
                    + 'harder. Check the wake windows first, then stop adjusting.',
            },
            {
                question: 'What wake windows suit a 4 month old?',
                answer:
                    'About 90 minutes to 2 hours, shortest first thing in the morning and longest before '
                    + 'bedtime. The Tier-1 bracket for 3–5 months is 75–150 minutes.',
            },
        ],
    },
    {
        slug: '5-month-old',
        months: 5,
        keyword: '5 month old sleep schedule',
        searchVolume: 9900,
        keywordDifficulty: 0,
        wakeHour: 7,
        wws: [2, 2, 2.25, 2.25],
        bedHour: 7,
        intro:
            'Five months is usually a three-nap day. Wake windows are comfortably over two hours, naps '
            + 'consolidate into longer blocks, and the day starts to look predictable enough that a clock '
            + 'schedule is genuinely useful rather than aspirational.',
        whatChangesNext:
            'Somewhere between five and eight months the third nap goes. The signal is the third nap '
            + 'refusing to happen or pushing bedtime late, not a date on the calendar.',
        faqs: [
            {
                question: 'How many naps at 5 months?',
                answer:
                    'Three is typical, four if the naps are short. The Tier-1 range for 3–5 months is 3–5 naps.',
            },
            {
                question: 'Why are my 5 month old’s naps only 30 minutes?',
                answer:
                    'A 30–45 minute nap is one sleep cycle. It is extremely common at this age and usually '
                    + 'resolves as sleep pressure and the circadian rhythm mature. Short naps mean you need more '
                    + 'of them; shorten the following wake window rather than pushing through.',
            },
            {
                question: 'When should a 5 month old go to bed?',
                answer:
                    'Bedtime is set by the last wake window, not by the clock. Take the end of the last nap, '
                    + 'add the age-appropriate window, and that is bedtime — which is why it moves on a bad nap day.',
            },
        ],
    },
    {
        slug: '6-month-old',
        months: 6,
        keyword: '6 month old sleep schedule',
        searchVolume: 12100,
        keywordDifficulty: 0,
        wakeHour: 7,
        wws: [2, 2.25, 2.25, 2.25],
        bedHour: 7,
        intro:
            'Six months is the first age where a named schedule starts to fit. Wake windows are over two '
            + 'hours, the circadian clock is largely mature, and most babies are on three naps and moving '
            + 'toward two. It is also the age where the gap between a well-rested baby and an overtired one '
            + 'becomes obvious in the evening.',
        whatChangesNext:
            'The third nap drops between roughly six and eight months, which turns the day into the classic '
            + 'two-nap shape. Expect a few messy weeks where three naps is too many and two is not quite enough.',
        faqs: [
            {
                question: 'How many naps should a 6 month old take?',
                answer:
                    'Two or three. The Tier-1 range for 6–8 months is 2–3 naps with 2.5–3.5 hours of daytime '
                    + 'sleep in total.',
            },
            {
                question: 'What is the 2-3-4 schedule?',
                answer:
                    'A two-nap day with a 2-hour wake window before the first nap, 3 hours before the second, '
                    + 'and 4 hours before bed. It is a practice-based convention rather than a validated rule, and '
                    + 'it over-promises sleep for babies with lower sleep needs. It typically fits from about six months.',
            },
            {
                question: 'How much night sleep at 6 months?',
                answer:
                    '10–12 hours, usually still with one or more wakings. Night waking at six months is normal '
                    + 'and not by itself a sign the schedule is wrong.',
            },
        ],
    },
    {
        slug: '7-month-old',
        months: 7,
        keyword: '7 month old sleep schedule',
        searchVolume: 8100,
        keywordDifficulty: 0,
        wakeHour: 7,
        wws: [2.5, 3, 3],
        bedHour: 7,
        intro:
            'Seven months is usually the two-nap day, and the wake windows are long enough that the third '
            + 'nap no longer fits without pushing bedtime late. Naps get longer as they get fewer: two solid '
            + 'blocks rather than three short ones.',
        whatChangesNext:
            'Two naps generally hold until somewhere between 13 and 18 months. The next real change is the '
            + '2-to-1 transition, not another drop in the next few months.',
        faqs: [
            {
                question: 'Should a 7 month old be on two naps?',
                answer:
                    'Most are. The Tier-1 range for 6–8 months allows 2–3 naps, so a third short nap is still '
                    + 'within normal — especially if the first two are short.',
            },
            {
                question: 'What are 7 month old wake windows?',
                answer:
                    'Roughly 2.5–3.5 hours, with the longest window before bedtime. The Tier-1 bracket for '
                    + '6–8 months is 120–180 minutes.',
            },
            {
                question: 'Why does my 7 month old wake at 5am?',
                answer:
                    'Early waking at this age is usually too much daytime sleep, too little daytime sleep, or '
                    + 'a bedtime that lands outside the last wake window. Change one variable at a time and give '
                    + 'it several days before judging it.',
            },
        ],
    },
]

export interface SampleDayRow {
    label: string
    time: string
    detail?: string
}

export interface AgePageModel extends AgePageDefinition {
    title: string
    heading: string
    description: string
    path: string
    url: string
    /** The day, as the app's generator computes it. */
    rows: SampleDayRow[]
    napCount: number
    napLength: string
    totalNapHours: number
    totalNightHours: number
    totalSleepHours: number
    /** Tier-1 published ranges for this age. */
    wakeWindowRange: [number, number]
    napRange: [number, number]
    daySleepRange: [number, number]
    nightSleepRange: [number, number]
    /** Deep link that opens the planner with this exact day loaded. */
    plannerHref: string
    /** Neighbouring ages, for the age±1 internal links. */
    previous?: { slug: string; label: string }
    next?: { slug: string; label: string }
}

/** Build the schedule for one page through the app's own generator, so a page
 * can never show a day the app would not produce. */
export function scheduleFor(page: AgePageDefinition): ScheduleSetting {
    const schedule = new ScheduleSetting()
    schedule.dwt = page.wakeHour
    schedule.bed = page.bedHour
    schedule.wws = [...page.wws]
    return schedule
}

function ageLabel(months: number): string {
    return `${months} month old`
}

/** Round hours for display without implying more precision than the model has. */
function roundHours(hours: number): number {
    return Math.round(hours * 100) / 100
}

export function buildAgePage(page: AgePageDefinition, index: number, pages: AgePageDefinition[]): AgePageModel {
    const schedule = scheduleFor(page)
    const bracket = bracketForMonths(page.months)
    const naps = schedule.napTimes

    // Displayed to 5-minute marks. The generator's even split of total nap time
    // produces ends like 9:23, and a to-the-minute nap end on a page a parent
    // reads at 2am is false precision — the app rounds the same way.
    const napBlocks = naps.map((nap) => ({
        start: roundToStep(nap.start),
        end: roundToStep(nap.end),
    }))

    const rows: SampleDayRow[] = [
        { label: 'Wake', time: formatClock(schedule.wakeMinutes) },
        ...napBlocks.map((nap, i) => ({
            label: `Nap ${i + 1}`,
            time: formatClockRange(nap.start, nap.end),
            detail: `${formatDuration(page.wws[i] * 60)} awake first`,
        })),
        {
            label: 'Bedtime',
            time: formatClock(schedule.bedtimeMinutes),
            detail: `${formatDuration(page.wws[page.wws.length - 1] * 60)} awake first`,
        },
    ]

    const napLengthMinutes = napBlocks.length ? napBlocks[0].end - napBlocks[0].start : 0
    const previous = pages[index - 1]
    const next = pages[index + 1]

    return {
        ...page,
        // Hyphenated in the title tag, spaced in the H1: both spellings are
        // searched, and this way the page carries each once without repeating
        // the phrase twice in the same element.
        title: `${page.months}-month-old sleep schedule: sample day, wake windows & total sleep`,
        heading: `${ageLabel(page.months)} sleep schedule`,
        description:
            `A sample ${ageLabel(page.months)} sleep schedule with clock times, wake windows of `
            + `${bracket.wwTime[0]}–${bracket.wwTime[1]} minutes, and ${bracket.daySleep[0]}–${bracket.daySleep[1]} h `
            + `of daytime sleep — built from cited guidance, then adjustable in the free planner.`,
        path: `${CLUSTER_BASE}/${page.slug}/`,
        url: `${SITE_ORIGIN}${CLUSTER_BASE}/${page.slug}/`,
        rows,
        napCount: schedule.naps,
        napLength: formatDuration(napLengthMinutes),
        totalNapHours: roundHours(schedule.totalNap),
        totalNightHours: roundHours(schedule.totalNightSleep),
        totalSleepHours: roundHours(schedule.totalSleep),
        wakeWindowRange: bracket.wwTime,
        napRange: bracket.naps,
        daySleepRange: bracket.daySleep,
        nightSleepRange: bracket.nightSleep,
        plannerHref: `/?s=${page.wakeHour}-${page.wws.join('/')}-${page.bedHour}`,
        previous: previous ? { slug: previous.slug, label: ageLabel(previous.months) } : undefined,
        next: next ? { slug: next.slug, label: ageLabel(next.months) } : undefined,
    }
}

/** Every cluster-1 page, in build order. */
export function buildAgePages(): AgePageModel[] {
    return AGE_PAGES.map((page, i) => buildAgePage(page, i, AGE_PAGES))
}

export interface HubBracketRow {
    ageLabel: string
    wakeWindows: string
    naps: string
    daySleep: string
    nightSleep: string
    /** The spoke page for this bracket, when one is built. */
    href?: string
}

/** The hub's by-age table: every Tier-1 bracket, whether or not a spoke exists
 * for it yet, so the hub is a complete answer to `baby sleep schedule by age`. */
export function hubBracketRows(pages: AgePageModel[] = buildAgePages()): HubBracketRow[] {
    return generalGuidance()
        .brackets.slice()
        .sort((a, b) => a.months[0] - b.months[0])
        .map((bracket) => {
            const spoke = pages.find(
                (p) => p.months >= bracket.months[0] && p.months <= bracket.months[1],
            )
            return {
                ageLabel: `${bracket.months[0]}–${bracket.months[1]} months`,
                wakeWindows: `${bracket.wwTime[0]}–${bracket.wwTime[1]} min`,
                naps: bracket.naps[0] === bracket.naps[1]
                    ? `${bracket.naps[0]}`
                    : `${bracket.naps[0]}–${bracket.naps[1]}`,
                daySleep: `${bracket.daySleep[0]}–${bracket.daySleep[1]} h`,
                nightSleep: `${bracket.nightSleep[0]}–${bracket.nightSleep[1]} h`,
                href: spoke?.path,
            }
        })
}
