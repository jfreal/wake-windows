<script lang="ts">
import { defineComponent } from 'vue'
import { ScheduleSetting } from '../models/ScheduleSetting';
import { SleepRecommendation } from '../models/SleepRecommendations';

export default defineComponent({
    props: {
        sleepSchedule: ScheduleSetting,
        recommendations: Array<SleepRecommendation>
    },
    data() {
        return {

        }
    }
})
</script>

<template>
    d
    <div v-for="rec in this.recommendations">
        rec
        <div v-for="err in rec.validate(this.sleepSchedule)">
            err
        </div>

    </div>



</template>