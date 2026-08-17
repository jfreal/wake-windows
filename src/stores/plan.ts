import { computed, reactive, ref, watch } from 'vue'
import { ScheduleSetting } from '../models/ScheduleSetting'
import { type DstMode, dstModeFromParam, dstModeToParam } from '../models/DstShift'
import {
    applyPlanParams,
    buildPlanQuery,
    hasSiblingParams,
    withPlanExtras,
    type PlanExtras,
} from '../models/planUrl'
import { isAtypicalReason } from '../models/GuidanceMode'
import { tabParam, topicParam } from './tabs'

// @doc:shareable-plan-url @doc:sibling-twins-alignment @doc:read-only-babysitter-mode
// @doc:atypical-day-flag @doc:dst-timezone-shift
//
// The one live plan. Every panel that reads the plan — the 24-hour bar, the nap
// schedule, the calendar export, the handoff recap, the trends age band —
// derives from these objects, so an edit in the inputs column is visible
// everywhere at once.
//
// This exists because each of those panels used to rebuild its own
// ScheduleSetting from window.location at setup time and then never re-read it.
// A parent who moved bedtime and hit "Add to calendar" got the plan as it was
// at page load, silently and with no error. One reactive source, one URL writer.
//
// Module scope on purpose: there is exactly one plan per page, and the panels
// that need it are scattered across the tree (App → Summary → ChildInputs, and
// App → CalendarExport), so prop-drilling or provide/inject would only add
// indirection. Reading location once here is also what keeps a shared link
// authoritative — the query string IS the state.

/** The query string this page was opened with. Read once; the address bar is
 * rewritten from state afterwards, never re-read. */
export const planParams: Record<string, string> = Object.fromEntries(
    new URLSearchParams(window.location.search).entries())

// @doc:read-only-babysitter-mode
/** A shared sitter link renders the plan read-only: no edit controls anywhere,
 * and no URL rewriting (which would strip `view=sitter` from the link). */
export const sitterMode = planParams.view === 'sitter'

// --- the plan --------------------------------------------------------------

export const schedule = reactive(new ScheduleSetting())
applyPlanParams(schedule, planParams.bd, planParams.s)

// @doc:atypical-day-flag — `?at=<reason>` marks today atypical; an unknown
// reason still flags the day, just filed under "other".
if (planParams.at) {
    schedule.atypical = true
    schedule.atypicalReason = isAtypicalReason(planParams.at) ? planParams.at : 'other'
}

// @doc:sibling-twins-alignment — a second child is opt-in and rides the same
// query string as bd2/s2; old single-child links parse unchanged.
export const sibling = ref<ScheduleSetting | null>(null)
if (hasSiblingParams(planParams)) {
    const second = reactive(new ScheduleSetting())
    applyPlanParams(second, planParams.bd2, planParams.s2)
    sibling.value = second
}

/** Seed the new sibling from Baby A — for twins (the primary case) the
 * birthday, gestational age, and schedule start out identical. */
export function addSibling(): void {
    const second = reactive(new ScheduleSetting())
    second.birthdayDate = schedule.birthdayDate
    second.weeks = schedule.weeks
    second.dwt = schedule.dwt
    second.bed = schedule.bed
    second.wws = [...schedule.wws]
    sibling.value = second
}

export function removeSibling(): void {
    sibling.value = null
}

// @doc:dst-timezone-shift — the selected DST preset rides the same query string
// (`shift=spring|fall`), so a shared link shows both caregivers the same steps.
export const shiftMode = ref<DstMode | null>(dstModeFromParam(planParams.shift))

// --- serialization ---------------------------------------------------------

const shiftParam = computed(() => dstModeToParam(shiftMode.value))
const atParam = computed(() => (schedule.atypical ? (schedule.atypicalReason || 'other') : ''))

/** One or both children (bd/s, plus bd2/s2 when a sibling is on the plan). */
export const planQuery = computed(() => buildPlanQuery(schedule, sibling.value))

/** The plan plus its shared extras — exactly what the address bar shows. The
 * open tab rides along so a screen is a place you can link to and come back to;
 * `planLink()` below deliberately does NOT inherit it, because which screen the
 * sender happened to be looking at is not part of what they are sharing. */
export const canonicalQuery = computed(() =>
    withPlanExtras(planQuery.value, {
        shift: shiftParam.value,
        at: atParam.value,
        tab: tabParam.value,
        topic: topicParam.value,
    }))

/**
 * An absolute link to this plan, optionally with extras layered on (sitter
 * view, handoff note, last-nap snapshot). Every shared link is built here so a
 * link can't drift from the address bar — or from another link — by forgetting
 * a param.
 */
export function planLink(extras: PlanExtras = {}): string {
    const query = withPlanExtras(planQuery.value, {
        shift: shiftParam.value,
        at: atParam.value,
        ...extras,
    })
    return `${location.origin}${location.pathname}${query}`
}

// --- address bar -----------------------------------------------------------

// In sitter mode nothing is editable, so skip URL rewriting entirely — it would
// also strip `view=sitter` from the shared link.
if (!sitterMode) {
    // Debounce the writes: a held number-input spinner or fast typing would
    // otherwise fire history.replaceState per tick, and Safari throws after ~100
    // calls / 30s, which would kill URL syncing for the rest of the session.
    //
    // The 250 ms delay also keeps this clear of DeleteData.vue's module-scope
    // read of `#deleted`, which runs synchronously during import.
    let urlWriteTimer: ReturnType<typeof setTimeout> | undefined
    watch(canonicalQuery, (query) => {
        clearTimeout(urlWriteTimer)
        urlWriteTimer = setTimeout(() => {
            history.replaceState(null, '', query)
        }, 250)
    }, { immediate: true })
}
