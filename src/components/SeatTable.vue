<template>
  <div class="h-full bg-gradient-to-br from-[#eff6ff] to-[#e0e7ff] flex flex-col items-center gap-6 p-6 box-border overflow-hidden">
    <div class="flex-shrink-0 p-6 flex flex-col items-start gap-6 self-stretch rounded-[10px] bg-white shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-4px_rgba(0,0,0,0.1)]">
      <div class="w-full flex items-center justify-between">
        <div class="flex items-center gap-3">
          <img src="../assets/images/favicon.svg" class="w-14 h-14 object-contain" />
          <div class="flex flex-col">
            <div class="text-[#312c85] text-2xl leading-9">四八班教室座位安排</div>
            <div class="text-[#4a5565] text-base leading-6">班主任：杨玥辰</div>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <img src="../assets/images/total-user.svg" class="w-5 h-5 object-contain" />
          <div class="text-[#364153] text-base leading-6">学生总数: {{ totalStudentCount }}</div>
        </div>
      </div>
    </div>
    <div class="flex-1 overflow-hidden w-full flex gap-6">
      <div class="flex-1 p-6 box-border flex flex-col items-start rounded-[10px] bg-white shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-4px_rgba(0,0,0,0.1)]">
        <div class="flex items-center self-stretch text-[#101828] text-base leading-6 mb-4">座位图</div>

        <!-- 讲台 -->
        <div class="mb-5 flex py-[11px] pb-[13px] justify-center items-center self-stretch rounded-[10px] bg-gradient-to-r from-[#00c950] to-[#00bc7d] text-white text-center text-base leading-6">
          讲 台
        </div>

        <!-- 分组 -->
        <div class="w-full grid grid-cols-4 gap-5 mb-6">
          <div
            v-for="gIndex in cols / 2"
            :key="gIndex"
            class="text-center py-3 border-none rounded-xl bg-gradient-to-br from-[#a29bfe] to-[#6c5ce7] text-white font-semibold shadow-[0_4px_10px_rgba(108,92,231,0.2)] transition-all duration-300 ease-[ease] hover:-translate-y-[3px] hover:shadow-[0_6px_15px_rgba(108,92,231,0.3)]"
          >
            {{ `第${numberToChinese(gIndex)}组` }}
          </div>
        </div>

        <!-- 座位网格 -->
        <div class="w-full grid gap-5" :style="{ gridTemplateColumns: `repeat(${cols}, 1fr)` }">
          <div
            v-for="(seat, index) in seats"
            :key="index"
            class="w-full h-[120px] rounded-[10px] border-2 flex items-center justify-center relative transition-all duration-300 ease-[ease]"
            :class="[
              seat.studentId
                ? 'border-[#a3b3ff] bg-gradient-to-br from-[#eef2ff] to-[#faf5ff]'
                : 'border-dashed border-[#d1d5dc] bg-[#f9fafb]',
              'hover:border-solid hover:scale-[1.03]'
            ]"
            @dragover.prevent
            @drop="onDrop($event, index)"
          >
            <div
              v-if="seat.studentId"
              class="w-full h-full flex flex-col items-center justify-center text-[#101828] text-xl leading-5 cursor-move relative group"
              draggable="true"
              @dragstart="onDragStart($event, index)"
            >
              {{ seat.studentName }}
              <div class="absolute left-2 top-2 w-8 h-8 rounded-full bg-[#e5e7eb] flex items-center justify-center text-[#4a5565] text-base leading-4">
                {{ seat.studentId }}
              </div>
              <img
                src="../assets/images/delete.svg"
                class="hidden group-hover:block absolute right-2 top-2 w-8 h-8 object-contain cursor-pointer"
                @click="handleUnSeat(seat)"
              />
            </div>
            <div v-else class="w-full h-full flex flex-col items-center justify-center">
              <img src="../assets/images/no-user.svg" alt="" class="w-8 h-8 object-contain" />
            </div>
          </div>
        </div>
      </div>
      <div class="w-[410px] p-6 flex-shrink-0 box-border flex flex-col items-start rounded-[10px] bg-white shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-4px_rgba(0,0,0,0.1)] overflow-hidden">
        <div class="flex-shrink-0 flex items-center self-stretch text-[#101828] text-base leading-6 mb-4">学生列表</div>

        <div class="w-full flex items-center gap-2 mb-6">
          <el-input
            v-model="searchKey"
            placeholder="请输入学生姓名/学号"
            clearable
            :prefix-icon="Search"
            style="height: 36px"
          ></el-input>
        </div>

        <div class="flex-shrink-0 w-full flex items-center gap-3 mb-6">
          <div
            class="flex-1 h-[74px] p-3 box-border cursor-pointer rounded-[10px] border bg-[#f0fdf4] transition-all"
            :class="activeStudentStatus === 'seated' ? 'border-[#00a63e]' : 'border-[#b9f8cf]'"
            @click="activeStudentStatus = 'seated'"
          >
            <div class="text-[#0d542b] text-base leading-6 mb-1">已就座</div>
            <div class="text-[#00a63e] text-base leading-6">{{ seatedStudentCount }}人</div>
          </div>
          <div
            class="flex-1 h-[74px] p-3 box-border cursor-pointer rounded-[10px] border bg-[#fff7ed] transition-all"
            :class="activeStudentStatus === 'unSeated' ? 'border-[#f54900]' : 'border-[#ffd6a7]'"
            @click="activeStudentStatus = 'unSeated'"
          >
            <div class="text-[#7e2a0c] text-base leading-6 mb-1">未就座</div>
            <div class="text-[#f54900] text-base leading-6">{{ totalStudentCount - seatedStudentCount }}人</div>
          </div>
        </div>

        <div v-show="activeStudentStatus === 'seated'" class="w-full flex-1 flex flex-col overflow-hidden">
          <div class="flex-shrink-0 text-[#364153] text-base leading-6 mb-3">已分配座位</div>
          <div class="w-full flex-1 overflow-y-auto flex flex-col gap-2">
            <div
              v-for="seat in filteredHasStudentSeatList"
              :key="seat.studentId!"
              class="w-full p-3 box-border flex rounded-[10px] border border-[#b9f8cf] bg-[#f0fdf4]"
            >
              <div class="flex items-center gap-2">
                <div class="flex w-8 h-8 rounded-full justify-center items-center flex-shrink-0 bg-[#00c950]">
                  <img src="../assets/images/plain-user.svg" class="w-4 h-4 flex-shrink-0 object-contain" />
                </div>
                <div>
                  <div class="text-[#101828] text-base leading-6 mb-[2px]">{{ seat.studentName }}</div>
                  <div class="text-[#4a5565] text-xs leading-4">
                    座位号：{{ seat.id }}（第{{ seat.row }}排第{{ seat.col }}个）
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-show="activeStudentStatus === 'unSeated'" class="w-full flex-1 flex flex-col overflow-hidden">
          <div class="flex-shrink-0 text-[#364153] text-base leading-6 mb-3">未分配座位</div>
          <div class="w-full flex-1 overflow-y-auto flex flex-col gap-2">
            <div
              v-for="student in filteredUnSeatedStudentList"
              :key="student.id"
              class="w-full p-3 box-border flex rounded-[10px] border border-[#ffd6a7] bg-[#fff7ed] cursor-move"
              draggable="true"
              @dragstart="onStudentDragStart($event, student)"
            >
              <div class="flex items-center gap-2">
                <div class="flex w-8 h-8 rounded-full justify-center items-center flex-shrink-0 bg-[#f54900]">
                  <img src="../assets/images/plain-user.svg" class="w-4 h-4 flex-shrink-0 object-contain" />
                </div>
                <div>
                  <div class="text-[#101828] text-base leading-6">{{ student.name }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue'
import { numberToChinese } from '@/utils'
import { INITIAL_SEATS } from '@/config'
import type { Seat } from '@/interface'
import { STUDENT_LIST } from '@/config'
import { Search } from '@element-plus/icons-vue'

// 行列配置
const rows = ref(6)
const cols = ref(8)

// 座位数据
const seats = ref<Seat[]>([])
const totalStudentCount = computed(() => STUDENT_LIST.length)
const seatedStudentCount = computed(() => {
  return seats.value.filter((seat) => seat.studentId).length
})
const hasStudentSeatList = computed(() => {
  return seats.value.filter((seat) => seat.studentId)
})
const unSeatedStudentList = computed(() => {
  return STUDENT_LIST.filter(
    (student) => !seats.value.some((seat) => seat.studentId === student.id),
  )
})

const handleUnSeat = (seat: Seat) => {
  const targetSeat = seats.value.find((s) => s.id === seat.id)
  if (targetSeat) {
    targetSeat.studentId = null
    targetSeat.studentName = null
  }
}

// 添加保存到localStorage的函数
const saveSeatsToLocalStorage = () => {
  localStorage.setItem('seatData', JSON.stringify(seats.value))
}

const clearLocalStorage = () => {
  localStorage.setItem('seatData', JSON.stringify(seats.value))
}

// 根据行列数计算总座位数
const totalSeats = computed(() => rows.value * cols.value)

// 初始化座位数据
const initSeats = () => {
  // 尝试从localStorage加载数据
  const savedSeats = localStorage.getItem('seatData')
  if (savedSeats) {
    try {
      seats.value = JSON.parse(savedSeats)
      return
    } catch (e) {
      console.error('Failed to parse saved seat data', e)
    }
  }

  // 如果没有保存的数据，则按原有逻辑初始化
  seats.value = Array(totalSeats.value)
    .fill(null)
    .map((_, index) => {
      const row = Math.floor(index / cols.value) + 1
      const col = (index % cols.value) + 1

      const target = INITIAL_SEATS.find((seat) => seat.id === index + 1)
      return {
        id: index + 1,
        studentId: target ? target.studentId : null,
        studentName: target ? target.studentName : null,
        row: target ? target.row : row,
        col: target ? target.col : col,
      }
    })
}

// 监听座位数据变化并保存到localStorage
watch(
  seats,
  () => {
    saveSeatsToLocalStorage()
  },
  { deep: true },
)

// 监听行列变化，重新初始化座位
watch([rows, cols], () => {
  clearLocalStorage()
  initSeats()
})

// 初始化座位
initSeats()

// 拖拽开始事件
const onDragStart = (event: DragEvent, index: number) => {
  if (event.dataTransfer) {
    event.dataTransfer.setData('application/seat-index', index.toString())
    event.dataTransfer.effectAllowed = 'move'
  }
}

// 新增：处理从未分配学生列表拖拽学生
const onStudentDragStart = (event: DragEvent, student: (typeof STUDENT_LIST)[0]) => {
  if (event.dataTransfer) {
    event.dataTransfer.setData('application/student-data', JSON.stringify(student))
    event.dataTransfer.effectAllowed = 'move'
  }
}

// 拖拽放置事件
const onDrop = (event: DragEvent, targetIndex: number) => {
  event.preventDefault()

  if (event.dataTransfer) {
    const seatIndexData = event.dataTransfer.getData('application/seat-index')
    const studentData = event.dataTransfer.getData('application/student-data')

    if (seatIndexData) {
      // 原有的座位间交换逻辑
      const sourceIndex = parseInt(seatIndexData)
      if (!seats.value[sourceIndex] || !seats.value[targetIndex]) return

      // 交换两个位置的名字
      const sourceStudentId = seats.value[sourceIndex].studentId
      const sourceStudentName = seats.value[sourceIndex].studentName
      const targetStudentId = seats.value[targetIndex].studentId
      const targetStudentName = seats.value[targetIndex].studentName

      seats.value[sourceIndex].studentId = targetStudentId
      seats.value[sourceIndex].studentName = targetStudentName
      seats.value[targetIndex].studentId = sourceStudentId
      seats.value[targetIndex].studentName = sourceStudentName
    } else if (studentData) {
      if (!seats.value[targetIndex]) return
      // 从未分配学生列表拖拽过来的
      try {
        const student = JSON.parse(studentData)
        // 检查目标座位是否为空
        if (!seats.value[targetIndex].studentId) {
          // 将学生分配到该座位
          seats.value[targetIndex].studentId = student.id
          seats.value[targetIndex].studentName = student.name
        }
      } catch (e) {
        console.error('Failed to parse student data', e)
      }
    }
    // 数据变化会自动触发watch保存到localStorage
  }
}

// # 学生信息面板
const activeStudentStatus = ref<'seated' | 'unSeated'>('seated')
const searchKey = ref('')

// 添加搜索相关计算属性
const filteredHasStudentSeatList = computed(() => {
  if (!searchKey.value) {
    return hasStudentSeatList.value
  }

  const keyword = searchKey.value.toLowerCase()
  return hasStudentSeatList.value.filter(
    (seat) =>
      (seat.studentName && seat.studentName.toLowerCase().includes(keyword)) ||
      (seat.studentId && seat.studentId.toString().includes(keyword)),
  )
})

const filteredUnSeatedStudentList = computed(() => {
  if (!searchKey.value) {
    return unSeatedStudentList.value
  }

  const keyword = searchKey.value.toLowerCase()
  return unSeatedStudentList.value.filter(
    (student) =>
      (student.name && student.name.toLowerCase().includes(keyword)) ||
      (student.id && student.id.toString().includes(keyword)),
  )
})
</script>
