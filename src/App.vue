<script lang="ts" setup>
import { ref } from 'vue';
import { Loading } from '@element-plus/icons-vue'
import SeatTable from './components/SeatTable.vue'
import zhCn from 'element-plus/es/locale/lang/zh-cn'

const route = ref('')
const enterAction = ref({})

// 调试信息（用于模板显示）
const hasUtools = ref(!!window.utools)
const hasUtoolsDb = ref(!!window.utools?.db)

// 调试信息
console.log('[App] 组件初始化开始')
console.log('[App] window.utools 存在:', hasUtools.value)
console.log('[App] window.utools.db 存在:', hasUtoolsDb.value)

// 立即注册 utools 事件监听器（不要等到 onMounted）
if (window.utools) {
  console.log('[App] 注册 utools 事件监听器')

  window.utools.onPluginEnter((action) => {
    console.log('[App] onPluginEnter 触发:', action)
    route.value = action.code
    enterAction.value = action
    console.log('[App] route 设置为:', route.value)
  })

  window.utools.onPluginOut((isKill) => {
    console.log('[App] onPluginOut 触发')
    route.value = ''
  })
} else {
  // 普通浏览器环境，默认显示 seatTable 用于调试
  console.log('[App] 浏览器模式，设置默认路由')
  route.value = 'seatTable'
  console.log('Running in browser mode (not utools)')
}

console.log('[App] 初始 route 值:', route.value)
</script>

<template>
  <el-config-provider :locale="zhCn">
    <!-- 加载中 -->
    <div v-if="!route" style="display: flex; justify-content: center; align-items: center; height: 100vh;">
      <div style="text-align: center;">
        <el-icon :size="40" style="animation: rotate 1s linear infinite;">
          <Loading />
        </el-icon>
        <div style="margin-top: 16px; color: #909399; font-size: 14px;">加载中...</div>
      </div>
    </div>

    <template v-if="route === 'seatTable'">
      <SeatTable />
    </template>
  </el-config-provider>
</template>

<style>
html,
body,
#app {
  margin: 0;
  padding: 0;
  height: 100%;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
