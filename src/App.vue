<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import SeatTable from './components/SeatTable.vue'

const route = ref('')
const enterAction = ref({})

onMounted(() => {
  // 检查是否在 utools 环境中
  if (window.utools) {
    window.utools.onPluginEnter((action) => {
      route.value = action.code
      enterAction.value = action
    })
    window.utools.onPluginOut((isKill) => {
      route.value = ''
    })
  } else {
    // 普通浏览器环境，默认显示 seatTable 用于调试
    route.value = 'seatTable'
    console.log('Running in browser mode (not utools)')
  }
})
</script>

<template>
  <template v-if="route === 'seatTable'">
    <SeatTable />
  </template>
</template>

<style>
html,
body,
#app {
  margin: 0;
  padding: 0;
  height: 100%;
}
</style>
