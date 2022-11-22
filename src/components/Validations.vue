<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { ScheduleSetting } from '../models/ScheduleSetting'

export default defineComponent({
    props: {
        sleepSchedule: ScheduleSetting
    },
    data() {
        return {

        }
    }
})
</script>

<template>

    <div>I'm a validation</div>
    {{ sleepSchedule?.totalNap }}

</template>