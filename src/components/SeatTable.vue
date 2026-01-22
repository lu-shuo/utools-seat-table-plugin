<template>
  <div class="classroom">
    <div class="class-info-wrapper">
      <div class="top-wrapper">
        <div class="app-info">
          <img src="../assets/images/favicon.svg" class="logo" />
          <div class="info-wrapper">
            <div class="app-name">四八班教室座位安排</div>
            <div class="app-desc">班主任：杨玥辰</div>
          </div>
        </div>
        <div class="student-count">
          <img src="../assets/images/total-user.svg" class="count-icon" />
          <div class="count">学生总数: {{ totalStudentCount }}</div>
        </div>
      </div>
    </div>
    <div class="main-wrapper">
      <div class="seat-table-wrapper">
        <div class="title">座位图</div>
        <!-- 讲台 -->
        <div class="platform">讲 台</div>

        <!-- 分组 -->
        <div class="groups">
          <div v-for="gIndex in cols / 2" :key="gIndex" class="group-item">
            {{ `第${numberToChinese(gIndex)}组` }}
          </div>
        </div>

        <!-- 座位网格 -->
        <div class="seat-grid" :style="{ gridTemplateColumns: `repeat(${cols}, 1fr)` }">
          <div
            v-for="(seat, index) in seats"
            :key="index"
            class="seat-cell"
            :class="{ 'no-student': !seat.studentId }"
            @dragover.prevent
            @drop="onDrop($event, index)"
          >
            <div
              v-if="seat.studentId"
              class="student-card draggable-card"
              draggable="true"
              @dragstart="onDragStart($event, index)"
            >
              {{ seat.studentName }}
              <div class="student-id">{{ seat.studentId }}</div>
              <img
                src="../assets/images/delete.svg"
                class="delete-icon"
                @click="handleUnSeat(seat)"
              />
            </div>
            <div v-else class="no-student">
              <img src="../assets/images/no-user.svg" alt="" class="no-student-icon" />
            </div>
          </div>
        </div>
      </div>
      <div class="student-info-wrapper">
        <div class="title">学生列表</div>
        <div class="search-wrapper">
          <el-input
            v-model="searchKey"
            placeholder="请输入学生姓名/学号"
            clearable
            :prefix-icon="Search"
            style="height: 36px"
          ></el-input>
          <!-- <el-button type="primary" @click="handleSearch">搜索</el-button> -->
        </div>
        <div class="seat-status-wrapper">
          <div
            class="status-box seated"
            :class="{ active: activeStudentStatus === 'seated' }"
            @click="activeStudentStatus = 'seated'"
          >
            <div class="label">已就座</div>
            <div class="desc">{{ seatedStudentCount }}人</div>
          </div>
          <div
            class="status-box not-seated"
            :class="{ active: activeStudentStatus === 'unSeated' }"
            @click="activeStudentStatus = 'unSeated'"
          >
            <div class="label">未就座</div>
            <div class="desc">{{ totalStudentCount - seatedStudentCount }}人</div>
          </div>
        </div>
        <div v-show="activeStudentStatus === 'seated'" class="status-list-wrapper">
          <div class="title">已分配座位</div>
          <div class="list-wrapper">
            <div
              v-for="seat in filteredHasStudentSeatList"
              :key="seat.studentId!"
              class="list-item seated"
            >
              <div class="left-wrapper">
                <div class="student-icon">
                  <img src="../assets/images/plain-user.svg" />
                </div>
                <div class="student-info">
                  <div class="name">{{ seat.studentName }}</div>
                  <div class="seat-number">
                    座位号：{{ seat.id }}（第{{ seat.row }}排第{{ seat.col }}个）
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-show="activeStudentStatus === 'unSeated'" class="status-list-wrapper">
          <div class="title">未分配座位</div>
          <div class="list-wrapper">
            <div
              v-for="student in filteredUnSeatedStudentList"
              :key="student.id"
              class="list-item not-seated"
              draggable="true"
              @dragstart="onStudentDragStart($event, student)"
            >
              <div class="left-wrapper">
                <div class="student-icon">
                  <img src="../assets/images/plain-user.svg" />
                </div>
                <div class="student-info">
                  <div class="name">{{ student.name }}</div>
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

// 重置座位
// const resetSeats = () => {
//   initSeats()
// }

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

// 添加搜索处理方法
// const handleSearch = () => {
//   // 搜索逻辑已在computed属性中实现，这里可以留空或者添加其他操作
// }
</script>

<style lang="scss" scoped>
.classroom {
  height: 100%;
  background: linear-gradient(135deg, #eff6ff 0%, #e0e7ff 100%), #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  padding: 24px;
  box-sizing: border-box;
  overflow: hidden;
  > .class-info-wrapper {
    flex-shrink: 0;
    padding: 24px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 24px;
    flex-shrink: 0;
    align-self: stretch;
    border-radius: 10px;
    background: #fff;
    box-shadow:
      0 10px 15px -3px rgba(0, 0, 0, 0.1),
      0 4px 6px -4px rgba(0, 0, 0, 0.1);
    .top-wrapper {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      > .app-info {
        display: flex;
        align-items: center;
        gap: 12px;
        > .logo {
          width: 56px;
          height: 56px;
          object-fit: contain;
        }
        > .info-wrapper {
          display: flex;
          flex-direction: column;
          > .app-name {
            color: #312c85;
            font-family: Arimo;
            font-size: 24px;
            font-style: normal;
            font-weight: 400;
            line-height: 36px; /* 150% */
          }
          > .app-desc {
            color: #4a5565;
            font-family: Arimo;
            font-size: 16px;
            font-style: normal;
            font-weight: 400;
            line-height: 24px; /* 150% */
          }
        }
      }
      > .student-count {
        display: flex;
        align-items: center;
        gap: 8px;
        > .count-icon {
          width: 20px;
          height: 20px;
          object-fit: contain;
        }
        > .count {
          color: #364153;
          font-family: Arimo;
          font-size: 16px;
          font-style: normal;
          font-weight: 400;
          line-height: 24px; /* 150% */
        }
      }
    }
  }
  > .main-wrapper {
    flex: 1;
    overflow: hidden;
    width: 100%;
    display: flex;
    gap: 24px;
    > .seat-table-wrapper {
      flex: 1;
      padding: 24px;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      border-radius: 10px;
      background: #fff;
      box-shadow:
        0 10px 15px -3px rgba(0, 0, 0, 0.1),
        0 4px 6px -4px rgba(0, 0, 0, 0.1);
      > .title {
        display: flex;
        align-items: center;
        align-self: stretch;
        color: #101828;
        font-family: Arimo;
        font-size: 16px;
        font-style: normal;
        font-weight: 400;
        line-height: 24px; /* 150% */
        margin-bottom: 16px;
      }

      /* 讲台 */
      > .platform {
        margin-bottom: 20px;
        display: flex;
        padding: 11px 0 13px 0;
        justify-content: center;
        align-items: center;
        align-self: stretch;
        border-radius: 10px;
        background: linear-gradient(90deg, #00c950 0%, #00bc7d 100%);
        color: #fff;
        text-align: center;
        font-family: Arimo;
        font-size: 16px;
        font-style: normal;
        font-weight: 400;
        line-height: 24px; /* 150% */
      }

      /* 分组 */
      > .groups {
        width: 100%;
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 20px;
        margin-bottom: 24px;

        > .group-item {
          text-align: center;
          padding: 12px 0;
          border: none;
          border-radius: 12px;
          background: linear-gradient(135deg, #a29bfe 0%, #6c5ce7 100%);
          color: #fff;
          font-weight: 600;
          box-shadow: 0 4px 10px rgba(108, 92, 231, 0.2);
          transition: all 0.3s ease;

          &:hover {
            transform: translateY(-3px);
            box-shadow: 0 6px 15px rgba(108, 92, 231, 0.3);
          }
        }
      }

      /* 座位网格 */
      .seat-grid {
        width: 100%;
        display: grid;
        gap: 20px;
        /* 座位框 */
        .seat-cell {
          width: 100%;
          height: 120px;
          border-radius: 10px;
          border: 2px solid #a3b3ff;
          background: linear-gradient(135deg, #eef2ff 0%, #faf5ff 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          transition: all 0.3s ease;

          &.no-student {
            border: 2px dashed #d1d5dc;
            background: #f9fafb;
          }

          &:hover {
            border-style: solid;
            transform: scale(1.03);
          }

          > .student-card {
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: #101828;
            font-family: Arimo;
            font-size: 20px;
            font-style: normal;
            font-weight: 400;
            line-height: 20px;
            cursor: move;
            position: relative;
            &:hover {
              > .delete-icon {
                display: block;
              }
            }
            > .student-id {
              position: absolute;
              left: 8px;
              top: 8px;
              width: 32px;
              height: 32px;
              border-radius: 50%;
              background: #e5e7eb;
              display: flex;
              align-items: center;
              justify-content: center;
              color: #4a5565;
              font-family: Arimo;
              font-size: 16px;
              font-style: normal;
              font-weight: 400;
              line-height: 16px; /* 133.333% */
            }
            > .delete-icon {
              display: none;
              position: absolute;
              right: 8px;
              top: 8px;
              width: 32px;
              height: 32px;
              object-fit: contain;
              cursor: pointer;
            }
          }

          > .no-student {
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;

            > .no-student-icon {
              width: 32px;
              height: 32px;
              // background-image: url('../assets/images/no-user.svg');
              // background-size: 100% 100%;
              // background-repeat: no-repeat;
              object-fit: contain;
            }
          }
        }
      }
    }
    > .student-info-wrapper {
      width: 410px;
      padding: 24px;
      flex-shrink: 0;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      border-radius: 10px;
      background: #fff;
      box-shadow:
        0 10px 15px -3px rgba(0, 0, 0, 0.1),
        0 4px 6px -4px rgba(0, 0, 0, 0.1);
      overflow: hidden;

      > .title {
        flex-shrink: 0;
        display: flex;
        align-items: center;
        align-self: stretch;
        color: #101828;
        font-family: Arimo;
        font-size: 16px;
        font-style: normal;
        font-weight: 400;
        line-height: 24px;
        margin-bottom: 16px;
      }

      > .search-wrapper {
        width: 100%;
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 24px;
      }

      > .seat-status-wrapper {
        flex-shrink: 0;
        width: 100%;
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 24px;
        > .status-box {
          flex: 1;
          height: 74px;
          padding: 12px;
          box-sizing: border-box;
          cursor: pointer;
          &.seated {
            border-radius: 10px;
            border: 1px solid #b9f8cf;
            background: #f0fdf4;
            &.active {
              border-color: #00a63e !important;
              border-width: 1px !important;
            }
            > .label {
              color: #0d542b;
              font-family: Arimo;
              font-size: 16px;
              font-style: normal;
              font-weight: 400;
              line-height: 24px; /* 150% */
              margin-bottom: 4px;
            }

            > .desc {
              color: #00a63e;
              font-family: Arimo;
              font-size: 16px;
              font-style: normal;
              font-weight: 400;
              line-height: 24px; /* 150% */
            }
          }
          &.not-seated {
            border-radius: 10px;
            border: 1px solid #ffd6a7;
            background: #fff7ed;
            &.active {
              border-color: #f54900 !important;
              border-width: 1px !important;
            }
            > .label {
              color: #7e2a0c;
              font-family: Arimo;
              font-size: 16px;
              font-style: normal;
              font-weight: 400;
              line-height: 24px; /* 150% */
              margin-bottom: 4px;
            }

            > .desc {
              color: #f54900;
              font-family: Arimo;
              font-size: 16px;
              font-style: normal;
              font-weight: 400;
              line-height: 24px; /* 150% */
            }
          }
        }
      }

      > .status-list-wrapper {
        width: 100%;
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        > .title {
          flex-shrink: 0;
          color: #364153;
          font-family: Arimo;
          font-size: 16px;
          font-style: normal;
          font-weight: 400;
          line-height: 24px; /* 150% */
          margin-bottom: 12px;
        }
        > .list-wrapper {
          width: 100%;
          flex: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 8px;
          > .list-item {
            width: 100%;
            padding: 12px;
            box-sizing: border-box;
            display: flex;
            &.seated {
              border-radius: 10px;
              border: 1px solid #b9f8cf;
              background: #f0fdf4;
              > .left-wrapper {
                .student-icon {
                  background: #00c950;
                }
              }
            }
            &.not-seated {
              border-radius: 10px;
              border: 1px solid #ffd6a7;
              background: #fff7ed;
              > .left-wrapper {
                .student-icon {
                  background: #f54900;
                }
              }
              cursor: move;
            }
            > .left-wrapper {
              display: flex;
              align-items: center;
              gap: 8px;
              > .student-icon {
                display: flex;
                width: 32px;
                height: 32px;
                border-radius: 50%;
                justify-content: center;
                align-items: center;
                flex-shrink: 0;
                img {
                  width: 16px;
                  height: 16px;
                  flex-shrink: 0;
                  object-fit: contain;
                }
              }
              > .student-info {
                > .name {
                  color: #101828;
                  font-family: Arimo;
                  font-size: 16px;
                  font-style: normal;
                  font-weight: 400;
                  line-height: 24px; /* 150% */
                  margin-bottom: 2px;
                }
                > .seat-number {
                  color: #4a5565;
                  font-family: Arimo;
                  font-size: 12px;
                  font-style: normal;
                  font-weight: 400;
                  line-height: 16px; /* 133.333% */
                }
              }
            }
          }
        }
      }
    }
  }
}
</style>
