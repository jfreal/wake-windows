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



  <div class="grid grid-cols-[30%_70%] w-full h-64">
    <div>

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

      DWT

      WWs

      <input type="text" class="bg-gray-800  text-gray-300 text-sm rounded-lg block p-2.5 " placeholder="WW1" required>
      <input type="text" class="bg-gray-800  text-gray-300 text-sm rounded-lg block p-2.5 " placeholder="WW2" required>
      <input type="text" class="bg-gray-800  text-gray-300 text-sm rounded-lg block p-2.5 " placeholder="WW3" required>
      <input type="text" class="bg-gray-800  text-gray-300 text-sm rounded-lg block p-2.5 " placeholder="WW4" required>
      Bed

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
    <div class="pr-7">

      <div class="block bg-cyan-700 rounded" :style="{ width: `${(schedule.totalNightSleep / 24) * 100}%`}">
        <span class="float-right p-1">{{schedule.totalNightSleep}}h</span>
        <img src="/src/assets/moon.png" class="h-8 p-1" />
      </div>
      <div class="text-gray-400 text-xs mb-2 uppercase">Night Sleep</div>


      <div class="block bg-violet-700 rounded" :style="{ width: `${(schedule.totalDaySleep/ 24) * 100}%`}">
        <span class="float-right p-1">{{schedule.totalDaySleep}}h</span>
        <img src="/src/assets/sleeping-baby2.png" class="h-8 p-1" />
      </div>
      <div class="text-gray-400 text-xs mb-2 uppercase">Naps</div>


      <div class="block bg-teal-700 rounded" :style="{ width: `${(schedule.totalWakeTime / 24) * 100}%`}">
        <span class="float-right p-1">{{schedule.totalWakeTime}}h</span>
        <img src="/src/assets/sun.png" class="h-8 p-1" />
      </div>
      <div class="text-gray-400 text-xs uppercase">Wake Time</div>

    </div>
  </div>
</template>