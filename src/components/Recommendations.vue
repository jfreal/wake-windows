<script setup lang="ts">
import { computed } from 'vue';
import { ScheduleSetting } from '../models/ScheduleSetting';
import { SleepRecommendation } from '../models/SleepRecommendations';
import TierBadge from './TierBadge.vue';

const props = defineProps<{
    sleepSchedule: ScheduleSetting;
    recommendations: SleepRecommendation[];
}>();

interface Row {
    label: string;
    you: number;
    min: number;
    max: number;
    unit: string;
    tier: number;
}

// For each source, show only the bracket matching the baby's current age, as a
// compact You-vs-range comparison, plus that bracket's warnings (once).
const views = computed(() => {
    const s = props.sleepSchedule;
    const months = s.monthsSinceBirth;
    return props.recommendations.map((rec) => {
        const b = rec.currentBracket(months);
        // Total-sleep and nap-count metrics are Tier 1 (evidence-based) regardless
        // of which source reports them; wake-window timing (Tier 2) is surfaced in
        // EvidenceGuidance, not in this comparison table.
        const rows: Row[] = b
            ? [
                { label: 'Naps', you: s.naps, min: b.naps[0], max: b.naps[1], unit: '', tier: 1 },
                { label: 'Day sleep', you: s.totalNap, min: b.daySleep[0], max: b.daySleep[1], unit: 'h', tier: 1 },
                { label: 'Night sleep', you: s.totalNightSleep, min: b.nightSleep[0], max: b.nightSleep[1], unit: 'h', tier: 1 },
                { label: 'Total sleep', you: s.totalSleep, min: b.minSleep, max: b.maxSleep, unit: 'h', tier: 1 },
            ]
            : [];
        return {
            name: rec.name,
            url: rec.url,
            tier: rec.tier,
            months,
            range: b ? `${b.months[0]}–${b.months[1]} mo` : '',
            rows,
            warnings: b ? rec.validate(s, months).map((e) => e.text) : [],
        };
    });
});

function inRange(row: Row): boolean {
    return row.you >= row.min && row.you <= row.max;
}
</script>

<template>
    <div class="space-y-6">
        <div v-for="view in views" :key="view.name">
            <div class="flex items-baseline justify-between gap-3">
                <h3 class="text-slate-300 text-sm font-semibold flex flex-wrap items-center gap-2">
                    <a v-if="view.url" :href="view.url" target="_blank" rel="noopener noreferrer"
                        class="hover:text-sky-400 underline decoration-slate-500 underline-offset-2">{{ view.name }}
                        <span aria-hidden="true" class="text-muted">↗</span></a>
                    <template v-else>{{ view.name }}</template>
                    <TierBadge :tier="view.tier" />
                </h3>
                <span v-if="view.range" class="text-muted text-xs whitespace-nowrap">
                    {{ view.range }} · age {{ view.months }} mo
                </span>
            </div>

            <table v-if="view.rows.length" class="w-full text-sm mt-1">
                <thead>
                    <tr class="text-muted text-xs">
                        <th class="text-left font-normal"></th>
                        <th class="text-right font-normal w-16">You</th>
                        <th class="text-right font-normal w-24">Range</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="row in view.rows" :key="row.label" class="border-t border-slate-800">
                        <td class="py-1 text-slate-300">
                            <span class="inline-flex items-center gap-2">{{ row.label }}
                                <TierBadge :tier="row.tier" /></span>
                        </td>
                        <td class="py-1 text-right font-medium tabular-nums"
                            :class="inRange(row) ? 'text-emerald-400' : 'text-amber-400'">
                            {{ row.you }}{{ row.unit }}
                        </td>
                        <td class="py-1 text-right text-slate-400 tabular-nums">
                            {{ row.min }}–{{ row.max }}{{ row.unit }}
                        </td>
                    </tr>
                </tbody>
            </table>
            <p v-else class="text-muted text-sm mt-1">
                No guidance for {{ view.months }} months in this source.
            </p>

            <div v-for="w in view.warnings" :key="w"
                class="text-amber-400 text-sm mt-2 px-2 py-1 bg-amber-400/10 rounded">
                {{ w }}
            </div>
        </div>
    </div>
</template>
