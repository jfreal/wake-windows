import data from '../data/citations.json'

// Typed access layer over citations.json (the .research source library, copied
// into the app). Tier 1 = evidence-based; Tier 2 = practice-based heuristic.

export interface CitationTier {
     id: number
     label: string
     shortLabel: string
     color: string
     description: string
     appliesTo: string
}

export interface CitationSource {
     id: string
     tier: number
     type: string
     org: string
     authors: string
     leadAuthor: string
     credentials: string
     year: number
     title: string
     venue: string
     url: string
     altUrl?: string
     summary: string
}

export interface RecommendationItem {
     metric: string
     value: string
     tier: number
     sourceIds: string[]
     note?: string
}

export interface AgeBandRecommendation {
     ageBand: string
     ageLabel: string
     items: RecommendationItem[]
}

export interface CitationMeta {
     title: string
     description: string
     compiled: string
     disclaimer: string
     lastVerified: string
}

interface CitationData {
     meta: CitationMeta
     tiers: Record<string, CitationTier>
     sources: CitationSource[]
     recommendations: AgeBandRecommendation[]
}

const citations = data as unknown as CitationData

export const meta: CitationMeta = citations.meta
export const tiers: Record<string, CitationTier> = citations.tiers
export const sources: CitationSource[] = citations.sources
export const ageBandRecommendations: AgeBandRecommendation[] = citations.recommendations

const sourceById = new Map(sources.map((s) => [s.id, s]))

export function getSource(id: string): CitationSource | undefined {
     return sourceById.get(id)
}

export function getSources(ids: string[]): CitationSource[] {
     return ids.map(getSource).filter((s): s is CitationSource => Boolean(s))
}

export function getTier(id: number): CitationTier {
     return tiers[String(id)]
}

// Half-open month ranges [min, max); the final band is inclusive at the top.
// At a shared boundary (e.g. 3 mo) the more advanced band wins, matching the
// DevelopmentBracket convention in SleepRecommendations.ts.
const BANDS: { band: string; min: number; max: number }[] = [
     { band: '0-3mo', min: 0, max: 3 },
     { band: '3-4mo', min: 3, max: 4 },
     { band: '4-6mo', min: 4, max: 6 },
     { band: '6-9mo', min: 6, max: 9 },
     { band: '9-12mo', min: 9, max: 12 },
     { band: '12-18mo', min: 12, max: 18 },
     { band: '18-24mo', min: 18, max: 24 },
]

export function ageBandForMonths(months: number): string {
     if (months >= 24) return '18-24mo'
     if (months < 0) return '0-3mo'
     const hit = BANDS.find((b) => months >= b.min && months < b.max)
     return hit ? hit.band : '0-3mo'
}

export function recommendationForMonths(months: number): AgeBandRecommendation | undefined {
     const band = ageBandForMonths(months)
     return ageBandRecommendations.find((r) => r.ageBand === band)
}
