<template>
  <div
    class="h-full flex flex-col items-center gap-6 p-6 box-border overflow-hidden"
    style="
      background: #eff6ff;
      background: -webkit-linear-gradient(135deg, #eff6ff, #e0e7ff);
      background: -moz-linear-gradient(135deg, #eff6ff, #e0e7ff);
      background: linear-gradient(135deg, #eff6ff, #e0e7ff);
    "
  >
    <div
      class="flex-shrink-0 p-6 flex flex-col items-start gap-6 self-stretch rounded-[10px] bg-white shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-4px_rgba(0,0,0,0.1)]"
    >
      <div class="flex items-center justify-between w-full">
        <div class="flex items-center gap-3">
          <img
            src="../assets/images/favicon.svg"
            class="object-contain w-14 h-14"
          />
          <div class="flex flex-col">
            <div
              class="text-[#312c85] text-2xl leading-9 flex items-center classroom-name"
            >
              {{ classInfo.className }}
              <el-icon
                :size="20"
                class="ml-0.5 edit-icon cursor-pointer"
                @click="showEditClassDialog"
              >
                <Edit />
              </el-icon>
            </div>
            <div class="text-[#4a5565] text-base leading-6">
              班主任：{{ classInfo.teacherName }}
            </div>
          </div>
        </div>
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-2">
            <img
              src="../assets/images/total-user.svg"
              class="object-contain w-5 h-5"
            />
            <div class="text-[#364153] text-base leading-6">
              学生总数: {{ totalStudentCount }}
            </div>
          </div>
          <el-button type="primary" @click="resetSeats">重置座位</el-button>
        </div>
      </div>
    </div>
    <div
      class="flex-1 overflow-hidden w-full flex gap-6"
      style="
        background: #eff6ff;
        background: -webkit-linear-gradient(135deg, #eff6ff, #e0e7ff);
        background: -moz-linear-gradient(135deg, #eff6ff, #e0e7ff);
        background: linear-gradient(135deg, #eff6ff, #e0e7ff);
      "
      ref="mainWrapperEl"
    >
      <div
        class="flex-1 overflow-y-auto p-6 box-border flex flex-col items-start rounded-[10px] bg-white shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-4px_rgba(0,0,0,0.1)]"
      >
        <div
          class="flex items-center justify-between self-stretch text-[#101828] text-base leading-6 mb-4"
        >
          座位图
          <el-button link type="primary" @click="toggleFullscreen">{{
            isFullscreen ? "退出全屏" : "全屏排位"
          }}</el-button>
        </div>

        <!-- 讲台 -->
        <div
          class="mb-5 flex py-[11px] pb-[13px] justify-center items-center self-stretch rounded-[10px] text-white text-center text-base leading-6"
          style="
            background: #00c950;
            background: -webkit-linear-gradient(left, #00c950, #00bc7d);
            background: -moz-linear-gradient(left, #00c950, #00bc7d);
            background: linear-gradient(to right, #00c950, #00bc7d);
          "
        >
          讲 台
        </div>

        <!-- 分组 -->
        <div class="grid w-full grid-cols-4 gap-5 mb-6">
          <div
            v-for="gIndex in cols / 2"
            :key="gIndex"
            class="group-item text-center py-3 border-none rounded-xl text-white font-semibold shadow-[0_4px_10px_rgba(108,92,231,0.2)]"
          >
            {{ `第${numberToChinese(gIndex)}组` }}
          </div>
        </div>

        <!-- 座位网格 -->
        <div
          class="grid w-full gap-5"
          :style="{ gridTemplateColumns: `repeat(${cols}, 1fr)` }"
        >
          <div
            v-for="(seat, index) in seats"
            :key="index"
            class="seat-item w-full h-[120px] rounded-[10px] border-2 flex items-center justify-center relative"
            :class="[
              seat.studentId
                ? 'border-[#a3b3ff]'
                : 'border-dashed border-[#d1d5dc] bg-[#f9fafb]',
            ]"
            :style="
              seat.studentId
                ? 'background: #eef2ff; background: -webkit-linear-gradient(135deg, #eef2ff, #faf5ff); background: -moz-linear-gradient(135deg, #eef2ff, #faf5ff); background: linear-gradient(135deg, #eef2ff, #faf5ff);'
                : ''
            "
            @dragover.prevent
            @drop="onDrop($event, index)"
          >
            <div
              v-if="seat.studentId"
              class="seat-content w-full h-full flex flex-col items-center justify-center text-[#101828] text-xl leading-5 cursor-move relative"
              draggable="true"
              @dragstart="onDragStart($event, index)"
            >
              {{ seat.studentName }}
              <div
                class="absolute left-2 top-2 w-8 h-8 rounded-full bg-[#e5e7eb] flex items-center justify-center text-[#4a5565] text-base leading-4"
              >
                {{ seat.studentId }}
              </div>
              <img
                src="../assets/images/delete.svg"
                class="delete-icon absolute object-contain w-8 h-8 cursor-pointer right-2 top-2"
                @click="handleUnSeat(seat)"
              />
            </div>
            <div
              v-else
              class="flex flex-col items-center justify-center w-full h-full"
            >
              <img
                src="../assets/images/no-user.svg"
                alt=""
                class="object-contain w-8 h-8"
              />
            </div>
          </div>
        </div>
      </div>
      <div
        class="w-[410px] p-6 flex-shrink-0 box-border flex flex-col items-start rounded-[10px] bg-white shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-4px_rgba(0,0,0,0.1)] overflow-hidden"
      >
        <div
          class="flex-shrink-0 flex items-center justify-between self-stretch text-[#101828] text-base leading-6 mb-4"
        >
          <span>学生列表</span>
          <el-button
            type="primary"
            size="small"
            :icon="Upload"
            @click="handleImportExcel"
          >
            导入Excel
          </el-button>
        </div>

        <div class="flex items-center w-full gap-2 mb-6">
          <el-input
            v-model="searchKey"
            placeholder="请输入学生姓名/学号"
            clearable
            :prefix-icon="Search"
            style="height: 36px"
          ></el-input>
        </div>

        <div class="flex items-center flex-shrink-0 w-full gap-3 mb-6">
          <div
            class="flex-1 h-[74px] p-3 box-border cursor-pointer rounded-[10px] border bg-[#f0fdf4]"
            :class="
              activeStudentStatus === 'seated'
                ? 'border-[#00a63e]'
                : 'border-[#b9f8cf]'
            "
            @click="activeStudentStatus = 'seated'"
          >
            <div class="text-[#0d542b] text-base leading-6 mb-1">已就座</div>
            <div class="text-[#00a63e] text-base leading-6">
              {{ seatedStudentCount }}人
            </div>
          </div>
          <div
            class="flex-1 h-[74px] p-3 box-border cursor-pointer rounded-[10px] border bg-[#fff7ed]"
            :class="
              activeStudentStatus === 'unSeated'
                ? 'border-[#f54900]'
                : 'border-[#ffd6a7]'
            "
            @click="activeStudentStatus = 'unSeated'"
          >
            <div class="text-[#7e2a0c] text-base leading-6 mb-1">未就座</div>
            <div class="text-[#f54900] text-base leading-6">
              {{ totalStudentCount - seatedStudentCount }}人
            </div>
          </div>
        </div>

        <div
          v-show="activeStudentStatus === 'seated'"
          class="flex flex-col flex-1 w-full overflow-hidden"
        >
          <div class="flex-shrink-0 text-[#364153] text-base leading-6 mb-3">
            已分配座位
          </div>
          <div class="flex flex-col flex-1 w-full gap-2 overflow-y-auto">
            <div
              v-for="seat in filteredHasStudentSeatList"
              :key="seat.studentId!"
              class="w-full p-3 box-border flex rounded-[10px] border border-[#b9f8cf] bg-[#f0fdf4]"
            >
              <div class="flex items-center gap-2">
                <div
                  class="flex w-8 h-8 rounded-full justify-center items-center flex-shrink-0 bg-[#00c950]"
                >
                  <img
                    src="../assets/images/plain-user.svg"
                    class="flex-shrink-0 object-contain w-4 h-4"
                  />
                </div>
                <div>
                  <div class="text-[#101828] text-base leading-6 mb-[2px]">
                    {{ seat.studentName }}（学号：{{ seat.studentId }}）
                  </div>
                  <div class="text-[#4a5565] text-xs leading-4">
                    座位号：{{ seat.id }}（第{{ seat.row }}排第{{
                      seat.col
                    }}个）
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          v-show="activeStudentStatus === 'unSeated'"
          class="flex flex-col flex-1 w-full overflow-hidden"
        >
          <div class="flex-shrink-0 text-[#364153] text-base leading-6 mb-3">
            未分配座位
          </div>
          <div class="flex flex-col flex-1 w-full gap-2 overflow-y-auto">
            <div
              v-for="student in filteredUnSeatedStudentList"
              :key="student.id"
              class="w-full p-3 box-border flex rounded-[10px] border border-[#ffd6a7] bg-[#fff7ed] cursor-move"
              draggable="true"
              @dragstart="onStudentDragStart($event, student)"
            >
              <div class="flex items-center gap-2">
                <div
                  class="flex w-8 h-8 rounded-full justify-center items-center flex-shrink-0 bg-[#f54900]"
                >
                  <img
                    src="../assets/images/plain-user.svg"
                    class="flex-shrink-0 object-contain w-4 h-4"
                  />
                </div>
                <div>
                  <div class="text-[#101828] text-base leading-6">
                    {{ student.name }}（学号：{{ student.id }}）
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 编辑班级信息对话框 -->
    <EditClassDialog
      v-model="editClassDialogVisible"
      :class-info="classInfo"
      @confirm="handleSaveClassInfo"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch, useTemplateRef } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { numberToChinese } from "@/utils";
import { INITIAL_SEATS } from "@/config";
import type { Seat, Student } from "@/interface";
import { STUDENT_LIST } from "@/config";
import { Search, Upload, Edit } from "@element-plus/icons-vue";
import { useFullscreen } from "@vueuse/core";
import EditClassDialog from "./EditClassDialog.vue";

// 班级信息
interface ClassInfo {
  className: string;
  teacherName: string;
}

const classInfo = ref<ClassInfo>({
  className: "四八班教室座位安排",
  teacherName: "杨玥辰",
});

// 初始化班级信息
const initClassInfo = () => {
  const savedClassInfo = localStorage.getItem("classInfo");
  if (savedClassInfo) {
    try {
      classInfo.value = JSON.parse(savedClassInfo);
    } catch (e) {
      console.error("Failed to parse saved class info", e);
    }
  }
};

// 保存班级信息到localStorage
const saveClassInfo = () => {
  localStorage.setItem("classInfo", JSON.stringify(classInfo.value));
};

// 初始化班级信息
initClassInfo();

// 编辑班级信息对话框
const editClassDialogVisible = ref(false);

// 显示编辑对话框
const showEditClassDialog = () => {
  editClassDialogVisible.value = true;
};

// 保存班级信息（从子组件接收已验证的数据）
const handleSaveClassInfo = (data: ClassInfo) => {
  classInfo.value = { ...data };
  saveClassInfo();
  ElMessage.success("班级信息已更新");
};

// 行列配置
const rows = ref(6);
const cols = ref(8);

// 动态学生列表（支持从Excel导入）
const studentList = ref<Student[]>([]);

// 初始化学生列表
const initStudentList = () => {
  const savedStudents = localStorage.getItem("studentList");
  if (savedStudents) {
    try {
      studentList.value = JSON.parse(savedStudents);
      return;
    } catch (e) {
      console.error("Failed to parse saved student list", e);
    }
  }
  // 使用默认学生列表
  studentList.value = [...STUDENT_LIST];
};

// 保存学生列表到localStorage
const saveStudentList = () => {
  localStorage.setItem("studentList", JSON.stringify(studentList.value));
};

// 初始化学生列表
initStudentList();

// 座位数据
const seats = ref<Seat[]>([]);
const totalStudentCount = computed(() => studentList.value.length);
const seatedStudentCount = computed(() => {
  return seats.value.filter((seat) => seat.studentId).length;
});
const hasStudentSeatList = computed(() => {
  return seats.value.filter((seat) => seat.studentId);
});
const unSeatedStudentList = computed(() => {
  return studentList.value.filter(
    (student) => !seats.value.some((seat) => seat.studentId === student.id),
  );
});

const handleUnSeat = (seat: Seat) => {
  const targetSeat = seats.value.find((s) => s.id === seat.id);
  if (targetSeat) {
    targetSeat.studentId = null;
    targetSeat.studentName = null;
  }
};

// 添加保存到localStorage的函数
const saveSeatsToLocalStorage = () => {
  localStorage.setItem("seatData", JSON.stringify(seats.value));
};

const clearLocalStorage = () => {
  localStorage.setItem("seatData", JSON.stringify(seats.value));
};

// 根据行列数计算总座位数
const totalSeats = computed(() => rows.value * cols.value);

// 初始化座位数据
const initSeats = () => {
  // 尝试从localStorage加载数据
  const savedSeats = localStorage.getItem("seatData");
  if (savedSeats) {
    try {
      seats.value = JSON.parse(savedSeats);
      return;
    } catch (e) {
      console.error("Failed to parse saved seat data", e);
    }
  }

  // 如果没有保存的数据，则按原有逻辑初始化
  seats.value = Array(totalSeats.value)
    .fill(null)
    .map((_, index) => {
      const row = Math.floor(index / cols.value) + 1;
      const col = (index % cols.value) + 1;

      const target = INITIAL_SEATS.find((seat) => seat.id === index + 1);
      return {
        id: index + 1,
        studentId: target ? target.studentId : null,
        studentName: target ? target.studentName : null,
        row: target ? target.row : row,
        col: target ? target.col : col,
      };
    });
};

// 监听座位数据变化并保存到localStorage
watch(
  seats,
  () => {
    saveSeatsToLocalStorage();
  },
  { deep: true },
);

// 监听行列变化，重新初始化座位
watch([rows, cols], () => {
  clearLocalStorage();
  initSeats();
});

// 初始化座位
initSeats();

// 重置座位
const resetSeats = () => {
  seats.value = Array(totalSeats.value)
    .fill(null)
    .map((_, index) => {
      const row = Math.floor(index / cols.value) + 1;
      const col = (index % cols.value) + 1;

      const target = INITIAL_SEATS.find((seat) => seat.id === index + 1);
      return {
        id: index + 1,
        studentId: target ? target.studentId : null,
        studentName: target ? target.studentName : null,
        row: target ? target.row : row,
        col: target ? target.col : col,
      };
    });
};

const mainWrapperEl = useTemplateRef("mainWrapperEl");
const { isFullscreen, toggle: toggleFullscreen } = useFullscreen(mainWrapperEl);

// 拖拽开始事件
const onDragStart = (event: DragEvent, index: number) => {
  if (event.dataTransfer) {
    event.dataTransfer.setData("application/seat-index", index.toString());
    event.dataTransfer.effectAllowed = "move";
  }
};

// 新增：处理从未分配学生列表拖拽学生
const onStudentDragStart = (event: DragEvent, student: Student) => {
  if (event.dataTransfer) {
    event.dataTransfer.setData(
      "application/student-data",
      JSON.stringify(student),
    );
    event.dataTransfer.effectAllowed = "move";
  }
};

// 拖拽放置事件
const onDrop = (event: DragEvent, targetIndex: number) => {
  event.preventDefault();

  if (event.dataTransfer) {
    const seatIndexData = event.dataTransfer.getData("application/seat-index");
    const studentData = event.dataTransfer.getData("application/student-data");

    if (seatIndexData) {
      // 原有的座位间交换逻辑
      const sourceIndex = parseInt(seatIndexData);
      if (!seats.value[sourceIndex] || !seats.value[targetIndex]) return;

      // 交换两个位置的名字
      const sourceStudentId = seats.value[sourceIndex].studentId;
      const sourceStudentName = seats.value[sourceIndex].studentName;
      const targetStudentId = seats.value[targetIndex].studentId;
      const targetStudentName = seats.value[targetIndex].studentName;

      seats.value[sourceIndex].studentId = targetStudentId;
      seats.value[sourceIndex].studentName = targetStudentName;
      seats.value[targetIndex].studentId = sourceStudentId;
      seats.value[targetIndex].studentName = sourceStudentName;
    } else if (studentData) {
      if (!seats.value[targetIndex]) return;
      // 从未分配学生列表拖拽过来的
      try {
        const student = JSON.parse(studentData);
        // 检查目标座位是否为空
        if (!seats.value[targetIndex].studentId) {
          // 将学生分配到该座位
          seats.value[targetIndex].studentId = student.id;
          seats.value[targetIndex].studentName = student.name;
        }
      } catch (e) {
        console.error("Failed to parse student data", e);
      }
    }
    // 数据变化会自动触发watch保存到localStorage
  }
};

// # 学生信息面板
const activeStudentStatus = ref<"seated" | "unSeated">("seated");
const searchKey = ref("");

// 添加搜索相关计算属性
const filteredHasStudentSeatList = computed(() => {
  if (!searchKey.value) {
    return hasStudentSeatList.value;
  }

  const keyword = searchKey.value.toLowerCase();
  return hasStudentSeatList.value.filter(
    (seat) =>
      (seat.studentName && seat.studentName.toLowerCase().includes(keyword)) ||
      (seat.studentId && seat.studentId.toString().includes(keyword)),
  );
});

const filteredUnSeatedStudentList = computed(() => {
  if (!searchKey.value) {
    return unSeatedStudentList.value;
  }

  const keyword = searchKey.value.toLowerCase();
  return unSeatedStudentList.value.filter(
    (student) =>
      (student.name && student.name.toLowerCase().includes(keyword)) ||
      (student.id && student.id.toString().includes(keyword)),
  );
});

// Excel 导入处理
const handleImportExcel = async () => {
  if (!window.utools) {
    ElMessage.error("此功能仅在 uTools 环境中可用");
    return;
  }

  // 检查是否已有座位安排
  const hasSeatedStudents = seats.value.some((seat) => seat.studentId);

  if (hasSeatedStudents) {
    try {
      await ElMessageBox.confirm(
        "导入新学生名单将清空现有座位安排，是否继续？",
        "提示",
        {
          confirmButtonText: "继续导入",
          cancelButtonText: "取消",
          type: "warning",
        },
      );
    } catch {
      return; // 用户取消
    }
  }

  // 打开文件选择对话框
  const filePath = window.utools.showOpenDialog({
    title: "选择Excel文件",
    filters: [{ name: "Excel文件", extensions: ["xlsx", "xls", "csv"] }],
    properties: ["openFile"],
  });

  if (!filePath || filePath.length === 0) {
    return;
  }

  try {
    // 调用preload脚本读取Excel
    const result = window.services.readExcelFile(filePath[0]);

    if (!result.success) {
      ElMessage.error(`读取Excel失败: ${result.error}`);
      return;
    }

    if (!result.students || result.students.length === 0) {
      ElMessage.error("Excel文件中没有找到有效的学生数据");
      return;
    }

    // 更新学生列表
    studentList.value = result.students;
    saveStudentList();

    // 清空所有座位
    seats.value.forEach((seat) => {
      seat.studentId = null;
      seat.studentName = null;
    });

    ElMessage.success(`成功导入 ${result.count} 名学生`);

    // 询问是否随机排座
    try {
      await ElMessageBox.confirm(
        `已导入 ${result.count} 名学生，是否立即随机排座？`,
        "提示",
        {
          confirmButtonText: "随机排座",
          cancelButtonText: "稍后手动安排",
          type: "info",
        },
      );
      // 执行随机排座
      randomAssignSeats();
    } catch {
      // 用户选择稍后手动安排
      activeStudentStatus.value = "unSeated";
    }
  } catch (error) {
    console.error("Import error:", error);
    ElMessage.error("导入失败，请检查文件格式");
  }
};

// 随机排座算法
const randomAssignSeats = () => {
  // 获取所有空座位
  const emptySeats = seats.value.filter((seat) => !seat.studentId);

  // 获取未就座学生
  const unSeatedStudents = [...unSeatedStudentList.value];

  if (unSeatedStudents.length === 0) {
    ElMessage.info("所有学生已就座");
    return;
  }

  if (unSeatedStudents.length > emptySeats.length) {
    ElMessage.warning(
      `学生数量(${unSeatedStudents.length})超过座位数量(${emptySeats.length})，部分学生将无法分配座位`,
    );
  }

  // Fisher-Yates 洗牌算法
  const shuffleArray = <T,>(array: T[]): T[] => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  // 随机打乱学生顺序
  const shuffledStudents = shuffleArray(unSeatedStudents);

  // 随机打乱座位顺序
  const shuffledSeats = shuffleArray(emptySeats);

  // 分配座位
  const assignCount = Math.min(shuffledStudents.length, shuffledSeats.length);
  for (let i = 0; i < assignCount; i++) {
    const student = shuffledStudents[i];
    const seat = shuffledSeats[i];

    // 找到原始座位对象并更新
    const targetSeat = seats.value.find((s) => s.id === seat.id);
    if (targetSeat) {
      targetSeat.studentId = student.id;
      targetSeat.studentName = student.name;
    }
  }

  ElMessage.success(`已为 ${assignCount} 名学生随机分配座位`);
};
</script>

<style scoped>
/* 分组标签 hover 效果 */
.group-item {
  background: #a29bfe;
  background: -webkit-linear-gradient(135deg, #a29bfe, #6c5ce7);
  background: -moz-linear-gradient(135deg, #a29bfe, #6c5ce7);
  background: linear-gradient(135deg, #a29bfe, #6c5ce7);
  -webkit-transition: all 0.3s ease;
  -moz-transition: all 0.3s ease;
  -o-transition: all 0.3s ease;
  transition: all 0.3s ease;
}

.group-item:hover {
  -webkit-transform: translateY(-3px);
  -moz-transform: translateY(-3px);
  -ms-transform: translateY(-3px);
  -o-transform: translateY(-3px);
  transform: translateY(-3px);
  -webkit-box-shadow: 0 6px 15px rgba(108, 92, 231, 0.3);
  -moz-box-shadow: 0 6px 15px rgba(108, 92, 231, 0.3);
  box-shadow: 0 6px 15px rgba(108, 92, 231, 0.3);
}

/* 座位格子 hover 效果 */
.seat-item {
  -webkit-transition: all 0.3s ease;
  -moz-transition: all 0.3s ease;
  -o-transition: all 0.3s ease;
  transition: all 0.3s ease;
}

.seat-item:hover {
  border-style: solid !important;
  -webkit-transform: scale(1.03);
  -moz-transform: scale(1.03);
  -ms-transform: scale(1.03);
  -o-transform: scale(1.03);
  transform: scale(1.03);
}

/* 删除图标默认隐藏 */
.delete-icon {
  display: none;
  opacity: 0;
  -webkit-transition: opacity 0.2s ease;
  -moz-transition: opacity 0.2s ease;
  -o-transition: opacity 0.2s ease;
  transition: opacity 0.2s ease;
}

/* 座位内容 hover 时显示删除图标 */
.seat-content:hover .delete-icon {
  display: block;
  opacity: 1;
}

.classroom-name {
  .edit-icon:hover {
    color: var(--el-color-primary);
  }
}
</style>
