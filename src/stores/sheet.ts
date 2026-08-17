import { ref } from 'vue'

// @doc:evidence-tier-badges-citations @doc:no-ai-no-data-training
//
// The evidence sheet — one panel, opened from anywhere.
//
// Every number on the Today screen is now tappable and answers the same three
// questions: how strong is the evidence behind it, what does it actually mean in
// plain language, and what arithmetic on YOUR numbers produced the figure on
// screen. Previously each of those lived in its own always-open panel, which is
// how a home screen ends up 25 panels long. Collapsing them into one sheet is
// what lets the schedule be the only thing on the first screen.
//
// A single open sheet at a time, by construction: this is one ref, not a stack.

export interface SheetMathRow {
    label: string
    value: string
}

export interface SheetContent {
    /** Evidence tier of the claim being explained (1, 2 or 3). */
    tier: number
    title: string
    /** Plain-language paragraphs. Written for someone reading at 3am. */
    body: string[]
    /** The arithmetic, on the parent's own numbers. Omitted when there is none. */
    math?: SheetMathRow[]
    /** Citation ids from data/citations.json, rendered with working links. */
    sourceIds?: string[]
    /** A prose provenance line for claims with no single citable source. */
    sourceNote?: string
}

export const sheet = ref<SheetContent | null>(null)

export function openSheet(content: SheetContent): void {
    sheet.value = content
}

export function closeSheet(): void {
    sheet.value = null
}
