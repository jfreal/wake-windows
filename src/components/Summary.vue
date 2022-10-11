<script lang="ts">
import { defineComponent } from 'vue'
import { Schedule } from '../models/Schedule'


export default defineComponent({
  data() {
    return {
      count: 1,
      schedule: new Schedule()
    }
  }
})


// defineProps<{ msg: string }>()

// const count = ref(0)
// let schedule = new Schedule();



</script>

<template>



  <div class="grid grid-cols-[30%_70%] w-full h-64 mt-20">

    <div>
      <img class="h-20" src="/src/assets/logo.png">

      <span class="text-gray-400 text-sm">WAKE TIME</span>
      <select class="bg-gray-800 text-gray-300 text-sm rounded-lg block h-8 p-1" v-model="schedule.dwt" dir="rtl">
        <option value="">12:00</option>
        <option value=".5">12:30</option>
        <option value="1">1:00</option>
        <option value="1.5">1:30</option>
        <option value="2">2:00</option>
        <option value="2.5">2:30</option>
        <option value="3">3:00</option>
        <option value="3.5">3:30</option>
        <option value="4">4:00</option>
        <option value="4.5">4:30</option>
        <option value="5">5:00</option>
        <option value="5.5">5:30</option>
        <option value="6">6:00</option>
        <option value="6.5">6:30</option>
        <option value="7">7:00</option>
        <option value="7.5">7:30</option>
        <option value="8">8:00</option>
        <option value="8.5">8:30</option>
        <option value="9">9:00</option>
        <option value="9.5">9:30</option>
        <option value="10">10:00</option>
        <option value="10.5">10:30</option>
        <option value="11">11:00</option>
        <option value="11.5">11:30</option>
      </select>


      <span class="text-gray-400 text-sm">WAKE WINDOWS</span>
      <div v-for="(find, index) in schedule.wws">
        <input type="number" class="bg-gray-800  text-gray-300 text-sm rounded-lg block p-2.5 " placeholder="WW1"
          v-model="schedule.wws[index]" min="0" step="0.25" />
      </div>

      <span class="text-gray-400 text-sm">BEDTIME</span>

      <select class="bg-gray-800 text-gray-300 text-sm rounded-lg block p-2.5" v-model="schedule.bed" dir="rtl">
        <option value="">12:00</option>
        <option value=".5">12:30</option>
        <option value="1">1:00</option>
        <option value="1.5">1:30</option>
        <option value="2">2:00</option>
        <option value="2.5">2:30</option>
        <option value="3">3:00</option>
        <option value="3.5">3:30</option>
        <option value="4">4:00</option>
        <option value="4.5">4:30</option>
        <option value="5">5:00</option>
        <option value="5.5">5:30</option>
        <option value="6">6:00</option>
        <option value="6.5">6:30</option>
        <option value="7">7:00</option>
        <option value="7.5">7:30</option>
        <option value="8">8:00</option>
        <option value="8.5">8:30</option>
        <option value="9">9:00</option>
        <option value="9.5">9:30</option>
        <option value="10">10:00</option>
        <option value="10.5">10:30</option>
        <option value="11">11:00</option>
        <option value="11.5">11:30</option>
      </select>

    </div>


    <div>

      <div class="text-xl"><strong>{{schedule.dwt}}</strong>-<span v-for="(find, index) in schedule.wws"
          class="text-gray-600">
          <span v-if="find" class="text-gray-200">{{find}}</span><span
            v-if="index != schedule.wws.length-1">/</span></span>-<strong>{{schedule.bed}}</strong>
      </div>

      <div class="block mt-4 h-12">

        <div class="bg-orange-500 rounded-l-lg float-left" :style="{ width: `${(schedule.totalWakeTime / 24) * 100}%`}">
          <img src="/src/assets/sun.png" class="h-8 w-8 m-1 float-left" />
          <span class="float-right  text-xl m-2">
            {{schedule.totalWakeTime}}h</span>
        </div>

        <div class="bg-cyan-500 float-left" :style="{ width: `${(schedule.totalNightSleep / 24) * 100}%`}">
          <img src="/src/assets/moon.png" class="h-8 w-8 m-1 float-left" />
          <span class="float-right  text-xl m-2">
            {{schedule.totalNightSleep}}h</span>
        </div>

        <div class="bg-violet-500 rounded-r-lg float-left" :style="{ width: `${(schedule.totalNap/ 24) * 100}%`}">
          <img src="/src/assets/sleeping-baby2.png" class="h-8 w-8 m-1 float-left" />
          <span class="float-right text-xl m-2">
            {{schedule.totalNap}}h</span>
        </div>
      </div>

      <div class="text-xl mt-4">

        Total Sleep: {{schedule.totalSleep}}h <br />
        Total Wake: {{schedule.totalWakeTime}}h
      </div>

    </div>
  </div>
</template>