<script lang="ts">
import { defineComponent } from 'vue'
import { ScheduleSetting } from '../models/ScheduleSetting';
import { SleepRecommendation } from '../models/SleepRecommendations';

export default defineComponent({
    props: {
        sleepSchedule: ScheduleSetting,
        recommendations: Array<SleepRecommendation>
    }
})
</script>

<template>
    <div v-for="rec in this.recommendations" class="my-4">
        {{ rec.name }}

        <div v-for="b in rec.brackets">
            {{ b.months[0] }} to {{ b.months[1] }} Months
            <table class="table-auto w-full">
                <thead>
                    <tr class="text-sm">
                        <th class="w-6"></th>
                        <th class="text-left">Requirement</th>
                        <th class="w-4">Min</th>
                        <th>You</th>
                        <th class="w-4">Max</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>✅</td>
                        <td>Nap Count</td>
                        <td class="w-4">{{ b.naps[0] }}</td>
                        <td>{{ sleepSchedule.naps }}</td>
                        <td class="w-4">{{ b.naps[1] }}</td>
                    </tr>
                    <tr v-if="sleepSchedule.wws.length - 1 < b.naps[0]" class="border-b border-slate-700 ">
                        <td colspan="4">
                            sdf
                        </td>
                    </tr>
                    <tr>
                        <td></td>
                        <td>Day Sleep</td>
                        <td class="w-4">{{ b.daySleep[0] }}</td>
                        <td class="w-4">{{ b.daySleep[1] }}</td>
                    </tr>
                    <tr class="border-b border-slate-700 ">
                        <td colspan="4">
                            sdf
                        </td>
                    </tr>
                    <tr>
                        <td></td>
                        <td>Night Sleep</td>
                        <td class="w-4">{{ b.nightSleep[0] }}</td>
                        <td class="w-4">{{ b.nightSleep[1] }}</td>
                    </tr>
                    <tr class="border-b border-slate-700 ">
                        <td colspan="4">
                            sdf
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div v-for="err in rec.validate(sleepSchedule, sleepSchedule?.monthsSinceBirth)">


            {{ err.text }} {{ rec.time }}
        </div>

        <hr class="mt-2" />
    </div>
</template>