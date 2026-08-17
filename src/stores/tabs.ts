import { computed, ref } from 'vue'

// @doc:accessibility-dark-room
//
// Which of the four screens is showing.
//
// The app used to be one ~25-panel scroll: the schedule, the log, every guidance
// panel and every policy stance at the same level, so "when is the next nap"
// arrived at the same volume as "what the evidence tiers mean". It is now four
// tabs — Today / Log / Learn / Settings — and this is the one place that knows
// which is open.
//
// Deep-linkable on purpose (`?tab=learn`): a tab is a place, so it needs an
// address. `plan.ts` folds this into the canonical query it writes to the
// address bar, which is why the dependency runs plan → tabs and not the other
// way. That is also why the initial read below re-parses `location` rather than
// importing `planParams`: importing it would close the loop into a cycle, and
// this read is one line.

export const TABS = ['today', 'log', 'learn', 'settings'] as const
export type TabKey = (typeof TABS)[number]

export const TAB_LABELS: Record<TabKey, string> = {
    today: 'Today',
    log: 'Log',
    learn: 'Learn',
    settings: 'Settings',
}

function initialTab(): TabKey {
    // @doc:ephemerality-data-deletion — "Delete all my data" wipes the query
    // string and reloads, so the tab param it was invoked from is gone by
    // design. Land back on Settings anyway: the `#deleted` hash is the one-shot
    // "it worked" signal, and the confirmation it triggers lives on the screen
    // the button is on. Without this the user presses delete and is silently
    // dropped on Today with no acknowledgement that anything happened.
    if (window.location.hash === '#deleted') return 'settings'
    const requested = new URLSearchParams(window.location.search).get('tab')
    return TABS.includes(requested as TabKey) ? (requested as TabKey) : 'today'
}

export const activeTab = ref<TabKey>(initialTab())

/** Which Learn article is open, or null for the topic list. Lives here rather
 * than inside the Learn screen so switching tabs away and back returns to the
 * list — a half-read article is not a place you want to be dropped into when you
 * tap "Learn" looking for something else.
 *
 * Also addressable (`?tab=learn&topic=safe-sleep`), because these are articles:
 * "read this bit about safe sleep" is a thing one parent sends another, and a
 * link that lands on a menu is a link that lost the point. Validated against the
 * real topic list by LearnView, which simply finds nothing and shows the list. */
export const openTopic = ref<string | null>(
    new URLSearchParams(window.location.search).get('topic') || null)

/** The tab as a URL param — blank on Today, which is the default and needs no
 * param. A link with `?tab=today` in it and one without must be the same link. */
export const tabParam = computed(() => (activeTab.value === 'today' ? '' : activeTab.value))

/** The open article as a URL param; blank unless Learn is actually showing one. */
export const topicParam = computed(() =>
    activeTab.value === 'learn' && openTopic.value ? openTopic.value : '')

export function goTab(tab: TabKey): void {
    activeTab.value = tab
    openTopic.value = null
    // A tab switch is a page change; land at the top of the new screen rather
    // than wherever the last one was scrolled to.
    window.scrollTo({ top: 0, behavior: 'auto' })
}
