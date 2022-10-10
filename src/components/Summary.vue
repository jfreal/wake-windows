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
      <select e="time">
        <option value="00:00">12:00</option>
        <option value="00:30">12:30</option>
        <option value="01:00">1:00</option>
        <option value="01:30">1:30</option>
        <option value="02:00">2:00</option>
        <option value="02:30">2:30</option>
        <option value="03:00">3:00</option>
        <option value="03:30">3:30</option>
        <option value="04:00">4:00</option>
        <option value="04:30">4:30</option>
        <option value="05:00">5:00</option>
        <option value="05:30">5:30</option>
        <option value="06:00">6:00</option>
        <option value="06:30">6:30</option>
        <option value="07:00">7:00</option>
        <option value="07:30">7:30</option>
        <option value="08:00">8:00</option>
        <option value="08:30">8:30</option>
        <option value="09:00">9:00</option>
        <option value="09:30">9:30</option>
        <option value="10:00">10:00</option>
        <option value="10:30">10:30</option>
        <option value="11:00">11:00</option>
        <option value="11:30">11:30</option>
      </select>


      DWT
      <input type="number" class="bg-gray-800 text-gray-300 text-sm rounded-lg block p-2.5 " placeholder="7" min="1"
        max="12" step="0.25" required v-model="schedule.dwt">
      WWs

      <input type="text" class="bg-gray-800  w-8 text-gray-300 text-sm rounded-lg  block p-2.5 " placeholder="WW1"
        required>
      <input type="text" class="bg-gray-800  text-gray-300 text-sm rounded-lg block p-2.5 " placeholder="WW2" required>
      <input type="text" class="bg-gray-800  text-gray-300 text-sm rounded-lg block p-2.5 " placeholder="WW3" required>
      <input type="text" class="bg-gray-800  text-gray-300 text-sm rounded-lg block p-2.5 " placeholder="WW4" required>
      Bed
      <input type="number" class="bg-gray-800  text-gray-300 text-sm rounded-lg block p-2.5 " placeholder="7" min="1"
        max="12" required :value="schedule.bed">
      <span class="">Bedtidme</span>

    </div>
    <div class="pr-7">

      <div class="block bg-cyan-800 rounded" :style="{ width: `${(schedule.totalNightSleep / 24) * 100}%`}">
        <span class="float-right p-1">{{schedule.totalNightSleep}}h</span>
        <img src="/src/assets/moon.png" class="h-8 p-1" />
      </div>
      <div class="text-gray-500 text-xs mb-2">Night Sleep</div>


      <div class="block bg-violet-800 rounded" :style="{ width: `${(schedule.totalDaySleep/ 24) * 100}%`}">
        <span class="float-right p-1">{{schedule.totalDaySleep}}h</span>
        <img src="/src/assets/sleeping-baby2.png" class="h-8 p-1" />
      </div>
      <div class="text-gray-500 text-xs mb-2">Naps</div>


      <div class="block bg-teal-800 rounded" :style="{ width: `${(schedule.totalWakeTime / 24) * 100}%`}">
        <span class="float-right p-1">{{schedule.totalWakeTime}}h</span>
        <img src="/src/assets/sun.png" class="h-8 p-1" />
      </div>
      <div class="text-gray-500 text-xs">Wake Time</div>

    </div>
  </div>
</template>