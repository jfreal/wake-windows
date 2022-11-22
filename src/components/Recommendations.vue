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
        <strong>{{ rec.name }}</strong>

        <div v-for="err in rec.validate(sleepSchedule, sleepSchedule?.monthsSinceBirth)">
            {{ err.text }} {{ rec.time }}
        </div>

        <hr class="mt-2" />
    </div>
</template>