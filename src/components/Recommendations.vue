<script lang="ts">
import { defineComponent } from 'vue'
import { ScheduleSetting } from '../models/ScheduleSetting';
import { SleepRecommendation } from '../models/SleepRecommendations';

export default defineComponent({
    props: {
        sleepSchedule: {
            type: ScheduleSetting,
            required: true
        },
        recommendations: {
            type: Array<SleepRecommendation>,
            required: true

        }
    }
})
</script>

<template>
    <div v-for="rec in recommendations" class="my-4">
        {{ rec.name }}

        <div v-for="b in rec.brackets" class="mt-4">
            <table class="table-auto w-full border-separate">
                <thead>
                    <tr class="text-sm">
                        <th class="w-6"></th>
                        <th class="text-left"> {{ b.months[0] }} to {{ b.months[1] }} Months
                        </th>
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
                            ⚠️ At this age, this schedule recommends a minimum of {{ b.naps[0] }} naps
                        </td>
                    </tr>
                    <tr>
                        <td></td>
                        <td>Day Sleep</td>
                        <td class="w-4">{{ b.daySleep[0] }}</td>
                        <td class="w-4">{{ b.daySleep[1] }}</td>
                    </tr>
                    <tr v-if="sleepSchedule.wws.length === 99" class="border-b border-slate-700 ">
                        <td colspan="4">
                            qwer {{ sleepSchedule.wws.length }}ss
                        </td>
                    </tr>
                    <tr>
                        <td></td>
                        <td>Night Sleep</td>
                        <td class="w-4">{{ b.nightSleep[0] }}</td>
                        <td class="w-4">{{ b.nightSleep[1] }}</td>
                    </tr>
                    <tr v-if="false" class="border-b border-slate-700 ">
                        <td colspan="4">
                            sdf
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div v-for="err in rec.validate(sleepSchedule, sleepSchedule?.monthsSinceBirth)">

            {{ err.text }} {{ rec.brackets }}
        </div>

        <hr class="mt-2" />
    </div>
</template>