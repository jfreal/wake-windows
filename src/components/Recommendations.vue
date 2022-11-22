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
    <div v-for="rec in this.recommendations">
        <strong>{{ rec.name }}</strong>
        {{ sleepSchedule?.monthsSinceBirth }}
        <div v-for="err in rec.validate(sleepSchedule, sleepSchedule.monthsSinceBirth)">
            {{ err.text }} {{ rec.time }}
        </div>
        <hr />
    </div>
</template>