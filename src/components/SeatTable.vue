<template>
  <div
    class="h-full flex flex-col items-center gap-6 p-6 box-border overflow-hidden"
    style="
      background: #eff6ff;
      background: -webkit-linear-gradient(135deg, #eff6ff, #e0e7ff);
      background: -moz-linear-gradient(135deg, #eff6ff, #e0e7ff);
      background: linear-gradient(135deg, #eff6ff, #e0e7ff);
    "
    v-loading="snapshotLoading"
    element-loading-background="transparent"
    element-loading-text="快照生成中..."
  >
    <div
      ref="classInfoEl"
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
              ref="classNameRef"
              class="text-[#312c85] text-2xl leading-9 flex items-center classroom-name"
            >
              <span v-if="classInfo.className">{{ classInfo.className }}</span>
              <span v-else class="text-gray-400">请设置班级信息</span>
              <el-icon
                :size="20"
                class="ml-0.5 edit-icon cursor-pointer"
                @click="showEditClassDialog"
              >
                <Edit />
              </el-icon>
            </div>
            <div class="text-[#4a5565] text-base leading-6">
              班主任：{{ classInfo.teacherName || "未设置" }}
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
          <el-button
            ref="snapshotBtnRef"
            type="success"
            :icon="Camera"
            @click="handleSaveSnapshot"
            :loading="snapshotLoading"
          >
            保存快照
          </el-button>
          <el-button
            ref="randomBtnRef"
            type="warning"
            class="ml-0"
            @click="handleRandomAssignSeats"
          >
            随机排位
          </el-button>
          <el-button
            ref="resetBtnRef"
            type="primary"
            class="ml-0"
            @click="resetSeats"
          >
            重置座位
          </el-button>
        </div>
      </div>
      <div
        ref="layoutConfigRef"
        class="flex items-center gap-6 w-full bg-[#F9FAFB] rounded-[10px] h-16.5 px-4"
      >
        <div class="text-[#364153] text-base leading-6">座位布局：</div>
        <div class="flex items-center">
          <div class="text-[#364153] text-base leading-6">行数：</div>
          <el-input-number
            :model-value="rows"
            @update:model-value="handleRowsChange"
            :min="1"
            :max="20"
            :step="1"
            size="small"
          ></el-input-number>
        </div>
        <div class="flex items-center">
          <div class="text-[#364153] text-base leading-6">列数：</div>
          <el-input-number
            :model-value="cols"
            @update:model-value="handleColsChange"
            :min="1"
            :max="20"
            :step="1"
            size="small"
          ></el-input-number>
        </div>
        <div class="flex items-center">
          <div class="text-[#6A7282] text-base leading-6">总座位：</div>
          <div class="text-[#6A7282] text-base leading-6">{{ totalSeats }}</div>
        </div>
        <div class="flex items-center">
          <div class="text-[#6A7282] text-base leading-6">是否分组：</div>
          <el-switch
            v-model="enableGroup"
            @change="handleGroupEnableChange"
            :disabled="cols < 2"
          ></el-switch>
        </div>
        <div class="flex items-center" v-show="enableGroup && cols >= 2">
          <div class="text-[#6A7282] text-base leading-6">分组数：</div>
          <el-input-number
            v-model="groupCount"
            :min="2"
            :max="cols"
            :step="1"
            size="small"
            @change="handleGroupCountChange"
          ></el-input-number>
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
        ref="seatTableEl"
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
        <div
          v-if="enableGroup"
          class="grid w-full gap-5 mb-6"
          :style="{ gridTemplateColumns: `repeat(${cols}, 1fr)` }"
        >
          <div
            v-for="(group, gIndex) in groupColumnSpans"
            :key="gIndex"
            class="group-item text-center py-3 border-none rounded-xl text-white font-semibold shadow-[0_4px_10px_rgba(108,92,231,0.2)]"
            :style="{ gridColumn: `span ${group.span}` }"
          >
            {{ `第${numberToChinese(gIndex + 1)}组` }}
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
              <!-- 师徒图标 -->
              <el-popover
                v-if="getStudentRole(seat.studentId)"
                placement="top"
                :width="200"
                trigger="hover"
              >
                <template #reference>
                  <div
                    class="absolute left-2 bottom-2 w-7 h-7 rounded-full flex items-center justify-center text-white text-sm cursor-help"
                    :style="{
                      background:
                        getStudentRole(seat.studentId) === 'master'
                          ? 'linear-gradient(135deg, #fbbf24, #f97316)'
                          : 'linear-gradient(135deg, #60a5fa, #6366f1)',
                    }"
                  >
                    {{
                      getStudentRole(seat.studentId) === "master" ? "师" : "徒"
                    }}
                  </div>
                </template>
                <div class="text-sm">
                  <div class="font-semibold mb-2">
                    {{
                      getStudentRole(seat.studentId) === "master"
                        ? "👨‍🏫 师傅"
                        : "🎓 徒弟"
                    }}
                  </div>
                  <div v-if="getStudentRole(seat.studentId) === 'master'">
                    <div class="text-gray-600 mb-1">徒弟：</div>
                    <div class="text-gray-800">
                      {{
                        getStudentApprentices(seat.studentId).join("、") ||
                        "暂无"
                      }}
                    </div>
                  </div>
                  <div v-else>
                    <div class="text-gray-600 mb-1">师傅：</div>
                    <div class="text-gray-800">
                      {{ getStudentMaster(seat.studentId) || "暂无" }}
                    </div>
                  </div>
                </div>
              </el-popover>
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

        <!-- 提示 -->
        <div
          class="flex items-center gap-6 w-full p-4 bg-[#EFF6FF] rounded-[10px] h-16.5 px-4 border-[#BEDBFF] border mt-6 text-[#1C398E] text-[14px] leading-5"
        >
          💡 提示: 拖拽右侧学生列表中的卡片到空座位，或点击顶部"随机排位"按钮
        </div>
      </div>
      <div
        class="w-[410px] p-6 flex-shrink-0 box-border flex flex-col items-start rounded-[10px] bg-white shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-4px_rgba(0,0,0,0.1)] overflow-hidden"
      >
        <div
          class="flex-shrink-0 flex items-center justify-between self-stretch text-[#101828] text-base leading-6 mb-4"
        >
          <span>学生列表</span>
          <div class="flex items-center">
            <el-button
              type="success"
              text
              :icon="Edit"
              @click="showStudentManageDialog"
            >
              管理学生
            </el-button>
            <el-button
              ref="importBtnRef"
              type="primary"
              text
              :icon="Upload"
              @click="handleImportExcel"
            >
              从Excel导入
            </el-button>
          </div>
        </div>

        <!-- 空状态提示 -->
        <div
          v-if="totalStudentCount === 0"
          class="flex-1 flex flex-col items-center justify-center w-full"
        >
          <img
            src="../assets/images/no-user.svg"
            alt=""
            class="object-contain w-16 h-16 mb-4 opacity-50"
          />
          <div class="text-[#9ca3af] text-base mb-2">暂无学生数据</div>
          <el-button type="primary" size="small" @click="handleImportExcel">
            导入Excel学生名单
          </el-button>
        </div>

        <template v-else>
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
                <div class="flex items-center gap-2 flex-1">
                  <div
                    class="flex w-8 h-8 rounded-full justify-center items-center flex-shrink-0 bg-[#00c950]"
                  >
                    <img
                      src="../assets/images/plain-user.svg"
                      class="flex-shrink-0 object-contain w-4 h-4"
                    />
                  </div>
                  <div class="flex-1">
                    <div
                      class="text-[#101828] text-base leading-6 mb-[2px] flex items-center gap-2"
                    >
                      {{ seat.studentName }}（学号：{{ seat.studentId }}）
                      <!-- 师徒图标 -->
                      <el-popover
                        v-if="getStudentRole(seat.studentId)"
                        placement="top"
                        :width="180"
                        trigger="hover"
                      >
                        <template #reference>
                          <span
                            class="inline-flex items-center justify-center w-5 h-5 rounded-full text-white text-xs cursor-help"
                            :style="{
                              background:
                                getStudentRole(seat.studentId) === 'master'
                                  ? 'linear-gradient(135deg, #fbbf24, #f97316)'
                                  : 'linear-gradient(135deg, #60a5fa, #6366f1)',
                            }"
                          >
                            {{
                              getStudentRole(seat.studentId) === "master"
                                ? "师"
                                : "徒"
                            }}
                          </span>
                        </template>
                        <div class="text-sm">
                          <div class="font-semibold mb-2">
                            {{
                              getStudentRole(seat.studentId) === "master"
                                ? "👨‍🏫 师傅"
                                : "🎓 徒弟"
                            }}
                          </div>
                          <div
                            v-if="getStudentRole(seat.studentId) === 'master'"
                          >
                            <div class="text-gray-600 mb-1">徒弟：</div>
                            <div class="text-gray-800">
                              {{
                                getStudentApprentices(seat.studentId).join(
                                  "、",
                                ) || "暂无"
                              }}
                            </div>
                          </div>
                          <div v-else>
                            <div class="text-gray-600 mb-1">师傅：</div>
                            <div class="text-gray-800">
                              {{ getStudentMaster(seat.studentId) || "暂无" }}
                            </div>
                          </div>
                        </div>
                      </el-popover>
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
                <div class="flex items-center gap-2 flex-1">
                  <div
                    class="flex w-8 h-8 rounded-full justify-center items-center flex-shrink-0 bg-[#f54900]"
                  >
                    <img
                      src="../assets/images/plain-user.svg"
                      class="flex-shrink-0 object-contain w-4 h-4"
                    />
                  </div>
                  <div class="flex-1">
                    <div
                      class="text-[#101828] text-base leading-6 flex items-center gap-2"
                    >
                      {{ student.name }}（学号：{{ student.id }}）
                      <!-- 师徒图标 -->
                      <el-popover
                        v-if="student.role"
                        placement="top"
                        :width="180"
                        trigger="hover"
                      >
                        <template #reference>
                          <span
                            class="inline-flex items-center justify-center w-5 h-5 rounded-full text-white text-xs cursor-help"
                            :style="{
                              background:
                                student.role === 'master'
                                  ? 'linear-gradient(135deg, #fbbf24, #f97316)'
                                  : 'linear-gradient(135deg, #60a5fa, #6366f1)',
                            }"
                          >
                            {{ student.role === "master" ? "师" : "徒" }}
                          </span>
                        </template>
                        <div class="text-sm">
                          <div class="font-semibold mb-2">
                            {{
                              student.role === "master" ? "👨‍🏫 师傅" : "🎓 徒弟"
                            }}
                          </div>
                          <div v-if="student.role === 'master'">
                            <div class="text-gray-600 mb-1">徒弟：</div>
                            <div class="text-gray-800">
                              {{
                                getStudentApprentices(student.id).join("、") ||
                                "暂无"
                              }}
                            </div>
                          </div>
                          <div v-else>
                            <div class="text-gray-600 mb-1">师傅：</div>
                            <div class="text-gray-800">
                              {{ getStudentMaster(student.id) || "暂无" }}
                            </div>
                          </div>
                        </div>
                      </el-popover>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- 编辑班级信息对话框 -->
    <EditClassDialog
      v-model="editClassDialogVisible"
      :class-info="classInfo"
      @confirm="handleSaveClassInfo"
    />

    <!-- 学生管理对话框 -->
    <StudentManageDialog
      v-model="studentManageDialogVisible"
      :student-list="studentList"
      @update:student-list="handleStudentListUpdate"
    />

    <!-- 漫游式引导 -->
    <el-tour v-model="tourOpen" :mask="{ color: 'rgba(0, 0, 0, 0.5)' }">
      <el-tour-step
        :target="classNameRef"
        title="设置班级信息"
        description="点击这里可以编辑班级名称和班主任姓名，方便管理和识别。"
      />
      <el-tour-step
        :target="importBtnRef?.$el || importBtnRef"
        title="导入学生数据"
        description="点击这里可以从Excel导入学生名单。首次使用可以下载模板，填写学号和姓名后导入。"
      />
      <el-tour-step
        :target="layoutConfigRef"
        title="自定义座位布局"
        description="在这里可以自定义行数、列数，开启分组功能。修改行列数时会清空现有座位安排。"
      />
      <el-tour-step
        :target="randomBtnRef?.$el || randomBtnRef"
        title="随机排位"
        description="点击这里可以一键随机分配所有未就座的学生到空座位上，快速完成排座。"
      />
      <el-tour-step
        :target="seatTableEl"
        title="座位表区域"
        description="这里是座位表展示区域。你可以拖拽学生到座位上，也可以拖拽座位上的学生进行位置交换。"
      />
      <el-tour-step
        :target="snapshotBtnRef?.$el || snapshotBtnRef"
        title="保存快照"
        description="点击这里可以将座位表保存为图片，方便分享给家长或打印使用。"
      />
      <el-tour-step
        :target="resetBtnRef?.$el || resetBtnRef"
        title="重置座位"
        description="点击这里可以清空所有座位安排，重新开始排座。"
      />
    </el-tour>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch, useTemplateRef, onMounted, toRaw } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { numberToChinese } from "@/utils";
import type { Seat, Student } from "@/interface";
import { Search, Upload, Edit, Camera } from "@element-plus/icons-vue";
import { useFullscreen } from "@vueuse/core";
import EditClassDialog from "./EditClassDialog.vue";
import StudentManageDialog from "./StudentManageDialog.vue";
import { dbGet, dbPut, DB_KEYS } from "@/utils/db";
import { needsMigration, migrateFromLocalStorage } from "@/utils/migrate";
import * as htmlToImage from "html-to-image";

// 班级信息
interface ClassInfo {
  className: string;
  teacherName: string;
}

const classInfo = ref<ClassInfo>({
  className: "",
  teacherName: "",
});

const activeStudentStatus = ref<"seated" | "unSeated">("seated");
const searchKey = ref("");

// 初始化班级信息
const initClassInfo = () => {
  const savedClassInfo = dbGet<ClassInfo>(DB_KEYS.CLASS_INFO);
  if (savedClassInfo) {
    classInfo.value = savedClassInfo;
  }
};

// 漫游式引导相关
const tourOpen = ref(false);
const classNameRef = useTemplateRef("classNameRef");
const importBtnRef = useTemplateRef("importBtnRef");
const layoutConfigRef = useTemplateRef("layoutConfigRef");
const randomBtnRef = useTemplateRef("randomBtnRef");
const snapshotBtnRef = useTemplateRef("snapshotBtnRef");
const resetBtnRef = useTemplateRef("resetBtnRef");

// 检查是否需要显示引导
const checkAndShowTour = () => {
  const tourCompleted = dbGet<boolean>(DB_KEYS.TOUR_COMPLETED);
  if (!tourCompleted) {
    // 延迟显示，确保 DOM 已渲染
    setTimeout(() => {
      tourOpen.value = true;
    }, 500);
  }
};

// 监听引导关闭，保存完成状态
watch(tourOpen, (newVal) => {
  if (!newVal) {
    // 引导关闭时，标记为已完成
    dbPut(DB_KEYS.TOUR_COMPLETED, true);
  }
});

// 首次使用引导（保留原有逻辑，但不再自动触发）
const showFirstTimeGuide = () => {
  setTimeout(() => {
    ElMessageBox.confirm(
      "欢迎使用学生排座助手！请先设置班级信息和导入学生名单。",
      "欢迎",
      {
        confirmButtonText: "设置班级信息",
        cancelButtonText: "稍后设置",
        type: "info",
      },
    )
      .then(() => {
        showEditClassDialog();
      })
      .catch(() => {
        // 用户选择稍后设置
      });
  }, 500);
};

// 保存班级信息到 utools.db
const saveClassInfo = () => {
  dbPut(DB_KEYS.CLASS_INFO, toRaw(classInfo.value));
};

// 初始化班级信息
initClassInfo();

// 组件挂载时检查数据迁移
onMounted(() => {
  if (needsMigration()) {
    ElMessageBox.confirm(
      "检测到旧版本数据，是否迁移到新版本？迁移后数据将更加安全可靠。",
      "数据迁移",
      {
        confirmButtonText: "立即迁移",
        cancelButtonText: "跳过",
        type: "info",
      },
    )
      .then(() => {
        const result = migrateFromLocalStorage();
        if (result.success) {
          ElMessage.success(
            `数据迁移成功！已迁移：${result.migratedKeys.join("、")}`,
          );
          // 重新加载数据
          initClassInfo();
          initStudentList();
          initSeats();
        } else {
          ElMessage.error(`数据迁移失败：${result.errors.join("；")}`);
        }
      })
      .catch(() => {
        // 用户选择跳过
      });
  }
});

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

// 学生管理对话框
const studentManageDialogVisible = ref(false);

// 显示学生管理对话框
const showStudentManageDialog = () => {
  studentManageDialogVisible.value = true;
};

// 处理学生列表更新（从学生管理对话框）
const handleStudentListUpdate = (newList: Student[]) => {
  // 找出被删除的学生ID
  const oldIds = new Set(studentList.value.map((s) => s.id));
  const newIds = new Set(newList.map((s) => s.id));
  const deletedIds = [...oldIds].filter((id) => !newIds.has(id));

  // 更新学生列表
  studentList.value = newList;
  saveStudentList();

  // 清理座位表中已删除学生的座位
  if (deletedIds.length > 0) {
    seats.value.forEach((seat) => {
      if (seat.studentId && deletedIds.includes(seat.studentId)) {
        seat.studentId = null;
        seat.studentName = null;
      }
    });
  }

  // 更新已就座学生的姓名（如果姓名被修改）
  seats.value.forEach((seat) => {
    if (seat.studentId) {
      const student = newList.find((s) => s.id === seat.studentId);
      if (student && student.name !== seat.studentName) {
        seat.studentName = student.name;
      }
    }
  });
};

// 获取学生角色
const getStudentRole = (studentId: number | null) => {
  if (!studentId) return null;
  const student = studentList.value.find((s) => s.id === studentId);
  return student?.role || null;
};

// 获取学生的师傅姓名
const getStudentMaster = (studentId: number | null) => {
  if (!studentId) return null;
  const student = studentList.value.find((s) => s.id === studentId);
  if (!student?.masterId) return null;
  const master = studentList.value.find((s) => s.id === student.masterId);
  return master?.name || null;
};

// 获取学生的徒弟姓名列表
const getStudentApprentices = (studentId: number | null) => {
  if (!studentId) return [];
  const student = studentList.value.find((s) => s.id === studentId);
  if (!student?.apprenticeIds?.length) return [];
  return student.apprenticeIds
    .map((id) => {
      const apprentice = studentList.value.find((s) => s.id === id);
      return apprentice?.name || null;
    })
    .filter((name) => name !== null) as string[];
};

// 行列配置
const rows = ref(6);
const cols = ref(8);

// 分组配置
const enableGroup = ref(false);
const groupCount = ref(4);

// 座位布局配置
interface SeatLayoutConfig {
  rows: number;
  cols: number;
  enableGroup: boolean;
  groupCount: number;
}

// 初始化座位布局配置
const initSeatLayoutConfig = () => {
  const savedConfig = dbGet<SeatLayoutConfig>(DB_KEYS.SEAT_LAYOUT_CONFIG);
  if (savedConfig) {
    rows.value = savedConfig.rows;
    cols.value = savedConfig.cols;
    enableGroup.value = savedConfig.enableGroup;
    groupCount.value = savedConfig.groupCount;
  }
};

// 保存座位布局配置
const saveSeatLayoutConfig = () => {
  const config: SeatLayoutConfig = {
    rows: rows.value,
    cols: cols.value,
    enableGroup: enableGroup.value,
    groupCount: groupCount.value,
  };
  dbPut(DB_KEYS.SEAT_LAYOUT_CONFIG, config);
};

// 初始化座位布局配置
initSeatLayoutConfig();

// 处理行数变化
const handleRowsChange = async (newValue: number) => {
  // 检查是否有已就座的学生
  const hasSeatedStudents = seats.value.some((seat) => seat.studentId);

  if (hasSeatedStudents) {
    try {
      await ElMessageBox.confirm(
        "修改行列数将清空现有座位安排，是否继续？",
        "提示",
        {
          confirmButtonText: "确认修改",
          cancelButtonText: "取消",
          type: "warning",
        },
      );
    } catch {
      // 用户取消，不更新值
      return;
    }
  }

  // 更新行数
  rows.value = newValue;
  saveSeatLayoutConfig();
  initSeats(true); // 强制重置座位
  saveSeatsToDb();
};

// 处理列数变化
const handleColsChange = async (newValue: number) => {
  // 检查是否有已就座的学生
  const hasSeatedStudents = seats.value.some((seat) => seat.studentId);

  if (hasSeatedStudents) {
    try {
      await ElMessageBox.confirm(
        "修改行列数将清空现有座位安排，是否继续？",
        "提示",
        {
          confirmButtonText: "确认修改",
          cancelButtonText: "取消",
          type: "warning",
        },
      );
    } catch {
      // 用户取消，不更新值
      return;
    }
  }

  // 更新列数
  cols.value = newValue;

  // 如果列数小于2，自动关闭分组
  if (newValue < 2 && enableGroup.value) {
    enableGroup.value = false;
  }

  // 如果开启了分组，确保分组数不超过新的列数
  if (enableGroup.value && groupCount.value > newValue) {
    groupCount.value = Math.max(2, newValue);
  }

  saveSeatLayoutConfig();
  initSeats(true); // 强制重置座位
  saveSeatsToDb();
};

// 处理分组开关变化
const handleGroupEnableChange = () => {
  // 如果列数小于2，不允许开启分组
  if (enableGroup.value && cols.value < 2) {
    enableGroup.value = false;
    ElMessage.warning("列数至少为2才能开启分组");
    return;
  }

  // 如果开启分组，确保分组数不超过列数
  if (enableGroup.value && groupCount.value > cols.value) {
    groupCount.value = cols.value;
  }
  saveSeatLayoutConfig();
};

// 处理分组数变化
const handleGroupCountChange = () => {
  saveSeatLayoutConfig();
};

// 计算每组的列数分配
const groupColumnSpans = computed(() => {
  if (!enableGroup.value) return [];

  const colsPerGroup = Math.floor(cols.value / groupCount.value);
  const remainder = cols.value % groupCount.value;

  const spans = [];
  let currentCol = 1;

  for (let i = 0; i < groupCount.value; i++) {
    // 前 remainder 组多分配一列
    const span = colsPerGroup + (i < remainder ? 1 : 0);
    spans.push({
      start: currentCol,
      end: currentCol + span,
      span: span,
    });
    currentCol += span;
  }

  return spans;
});

// 动态学生列表（支持从Excel导入）
const studentList = ref<Student[]>([]);

// 初始化学生列表
const initStudentList = () => {
  const savedStudents = dbGet<Student[]>(DB_KEYS.STUDENT_LIST);
  if (savedStudents) {
    studentList.value = savedStudents;
  }
};

// 保存学生列表到 utools.db
const saveStudentList = () => {
  // 深度克隆，去除所有层级的响应式代理（包括嵌套的 apprenticeIds 数组）
  const plainData = JSON.parse(JSON.stringify(studentList.value));
  dbPut(DB_KEYS.STUDENT_LIST, plainData);
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

// 保存座位数据到 utools.db
const saveSeatsToDb = () => {
  dbPut(DB_KEYS.SEAT_DATA, toRaw(seats.value));
};

// 根据行列数计算总座位数
const totalSeats = computed(() => rows.value * cols.value);

// 初始化座位数据
const initSeats = (forceReset = false) => {
  // 如果强制重置，直接初始化空座位
  if (!forceReset) {
    // 尝试从 utools.db 加载数据
    const savedSeats = dbGet<Seat[]>(DB_KEYS.SEAT_DATA);
    if (savedSeats && savedSeats.length > 0) {
      seats.value = savedSeats;
      return;
    }
  }

  // 初始化空座位
  seats.value = Array(totalSeats.value)
    .fill(null)
    .map((_, index) => {
      const row = Math.floor(index / cols.value) + 1;
      const col = (index % cols.value) + 1;

      return {
        id: index + 1,
        studentId: null,
        studentName: null,
        row: row,
        col: col,
      };
    });

  activeStudentStatus.value = "unSeated";
};

// 监听座位数据变化并保存到 utools.db
watch(
  seats,
  () => {
    saveSeatsToDb();
  },
  { deep: true },
);

// 初始化座位
initSeats();

// 重置座位
const resetSeats = async () => {
  try {
    await ElMessageBox.confirm(
      "重置座位将清空所有座位安排，是否继续？",
      "提示",
      {
        confirmButtonText: "确认重置",
        cancelButtonText: "取消",
        type: "warning",
      },
    );

    // 清空所有座位
    seats.value.forEach((seat) => {
      seat.studentId = null;
      seat.studentName = null;
    });

    activeStudentStatus.value = "unSeated";
    ElMessage.success("座位已重置");
  } catch {
    // 用户取消
  }
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
    // 数据变化会自动触发watch保存到 utools.db
  }
};

// # 学生信息面板
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

  // 首先提示用户可以下载模板
  try {
    await ElMessageBox.confirm(
      '请确保您的Excel文件包含"学号"和"姓名"两列数据。\n\n如果您还没有准备好Excel文件，可以先下载导入模板进行填写。（您的数据将加密保存在本地，不会上传至任何服务器，请放心使用）',
      "导入学生数据",
      {
        confirmButtonText: "下载模板",
        cancelButtonText: "直接导入",
        distinguishCancelAndClose: true,
        type: "info",
      },
    );

    // 用户选择下载模板
    if (!window.services || !window.services.copyTemplateToDownloads) {
      ElMessage.error("模板下载功能不可用");
      return;
    }

    const result = window.services.copyTemplateToDownloads();

    if (!result.success) {
      ElMessage.error(`模板下载失败: ${result.error}`);
      return;
    }

    // 下载成功，询问是否打开文件位置
    try {
      await ElMessageBox.confirm(
        `模板已保存到：\n${result.filePath}\n\n请填写学生数据后，再次点击"从Excel导入"按钮上传。\n\n是否打开文件所在位置？`,
        "模板下载成功",
        {
          confirmButtonText: "打开位置",
          cancelButtonText: "关闭",
          type: "success",
        },
      );

      // 打开文件所在位置
      if (window.utools && window.utools.shellShowItemInFolder) {
        window.utools.shellShowItemInFolder(result.filePath);
      }
    } catch {
      // 用户选择关闭
    }

    return; // 下载模板后结束，等待用户填写后再次导入
  } catch (action) {
    // 用户选择直接导入或关闭对话框
    if (action === "cancel") {
      // 用户选择直接导入，继续执行导入流程
    } else {
      // 用户关闭对话框
      return;
    }
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
      activeStudentStatus.value = "seated";
    } catch {
      // 用户选择稍后手动安排
      activeStudentStatus.value = "unSeated";
    }
  } catch (error) {
    console.error("导入Excel失败:", error);
    ElMessage.error(
      `导入失败: ${error instanceof Error ? error.message : "未知错误"}`,
    );
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

// 处理随机排位按钮点击
const handleRandomAssignSeats = async () => {
  // 检查是否有学生数据
  if (totalStudentCount.value === 0) {
    ElMessage.warning("请先导入学生名单");
    return;
  }

  // 检查是否有未就座的学生
  // if (unSeatedStudentList.value.length === 0) {
  //   ElMessage.info("所有学生已就座");
  //   return;
  // }

  // 检查是否有已就座的学生
  const hasSeatedStudents = seats.value.some((seat) => seat.studentId);

  if (hasSeatedStudents) {
    try {
      await ElMessageBox.confirm(
        "随机排位将重置现有座位安排，是否继续？",
        "提示",
        {
          confirmButtonText: "确认排位",
          cancelButtonText: "取消",
          type: "warning",
        },
      );

      // 清空所有座位
      seats.value.forEach((seat) => {
        seat.studentId = null;
        seat.studentName = null;
      });
    } catch {
      // 用户取消
      return;
    }
  }

  // 执行随机排座
  randomAssignSeats();
  activeStudentStatus.value = "seated";
};

// 快照功能相关
const snapshotLoading = ref(false);
const classInfoEl = useTemplateRef("classInfoEl");
const seatTableEl = useTemplateRef("seatTableEl");

/**
 * 保存座位表快照
 */
const handleSaveSnapshot = async () => {
  // 边界检查：班级信息
  if (!classInfo.value.className) {
    try {
      await ElMessageBox.confirm(
        '班级信息未设置，快照中将显示"未设置班级"。是否继续？',
        "提示",
        {
          confirmButtonText: "继续保存",
          cancelButtonText: "取消",
          type: "warning",
        },
      );
    } catch {
      return; // 用户取消
    }
  }

  // 边界检查：学生数据
  if (totalStudentCount.value === 0) {
    ElMessage.warning("当前没有学生数据，无法生成快照");
    return;
  }

  // 边界检查：座位安排
  if (seatedStudentCount.value === 0) {
    try {
      await ElMessageBox.confirm(
        "当前没有学生就座，快照将显示空座位表。是否继续？",
        "提示",
        {
          confirmButtonText: "继续保存",
          cancelButtonText: "取消",
          type: "warning",
        },
      );
    } catch {
      return; // 用户取消
    }
  }

  // 检查是否存在师徒关系，询问用户是否保留师徒图标
  let shouldRemoveMasterApprenticeIcons = false;
  const hasMasterApprenticeRelation = studentList.value.some(
    (s) => s.role === "master" || s.role === "apprentice",
  );

  if (hasMasterApprenticeRelation) {
    try {
      await ElMessageBox.confirm(
        "检测到存在师徒关系，快照中是否保留师徒图标？",
        "提示",
        {
          confirmButtonText: "保留图标",
          cancelButtonText: "不保留",
          type: "info",
        },
      );
      // 用户选择保留，不移除
      shouldRemoveMasterApprenticeIcons = false;
    } catch {
      // 用户选择不保留，移除
      shouldRemoveMasterApprenticeIcons = true;
    }
  }

  snapshotLoading.value = true;

  try {
    // 检查 DOM 元素是否存在
    if (!classInfoEl.value || !seatTableEl.value) {
      throw new Error("无法获取座位表元素");
    }

    // 临时隐藏操作按钮
    const buttonsContainer = classInfoEl.value.querySelector(
      ".flex.items-center.gap-4",
    ) as HTMLElement;
    const fullscreenBtn = seatTableEl.value.querySelector(
      "button",
    ) as HTMLElement;

    const originalButtonsDisplay = buttonsContainer
      ? buttonsContainer.style.display
      : "";
    const originalFullscreenDisplay = fullscreenBtn
      ? fullscreenBtn.style.display
      : "";

    if (buttonsContainer) buttonsContainer.style.display = "none";
    if (fullscreenBtn) fullscreenBtn.style.display = "none";

    // 等待 DOM 更新
    await new Promise((resolve) => setTimeout(resolve, 100));

    // 创建包装容器
    const wrapper = document.createElement("div");
    wrapper.style.position = "fixed";
    wrapper.style.left = "0";
    wrapper.style.top = "0";
    wrapper.style.zIndex = "-9999";
    wrapper.style.width = "1200px";
    wrapper.style.padding = "24px";
    wrapper.style.background = "linear-gradient(135deg, #eff6ff, #e0e7ff)";
    wrapper.style.boxSizing = "border-box";
    document.body.appendChild(wrapper);

    // 克隆元素到包装容器
    const classInfoClone = classInfoEl.value.cloneNode(true) as HTMLElement;
    classInfoClone.style.marginBottom = "24px";

    // 移除行列数控制栏（第二个子元素）
    const layoutConfigBar = classInfoClone.children[1] as HTMLElement;
    if (layoutConfigBar) {
      layoutConfigBar.remove();
    }

    wrapper.appendChild(classInfoClone);

    const seatTableClone = seatTableEl.value.cloneNode(true) as HTMLElement;
    seatTableClone.style.overflow = "visible";
    seatTableClone.style.maxHeight = "none";

    // 移除底部提示元素（查找包含"提示:"的元素）
    const tipElements = seatTableClone.querySelectorAll(
      ".flex.items-center.gap-6",
    );
    tipElements.forEach((el) => {
      if (el.textContent?.includes("💡 提示:")) {
        el.remove();
      }
    });

    // 根据用户选择决定是否移除师徒图标
    if (shouldRemoveMasterApprenticeIcons) {
      const masterApprenticeIcons =
        seatTableClone.querySelectorAll(".cursor-help");
      masterApprenticeIcons.forEach((icon) => {
        icon.remove();
      });
    }

    wrapper.appendChild(seatTableClone);

    // 等待渲染
    await new Promise((resolve) => setTimeout(resolve, 200));

    // 生成截图
    const dataUrl = await htmlToImage.toPng(wrapper, {
      quality: 1.0,
      pixelRatio: 2,
      cacheBust: true,
      backgroundColor: "#eff6ff",
      style: {
        transform: "scale(1)",
        transformOrigin: "top left",
      },
    });

    // 清理
    document.body.removeChild(wrapper);
    if (buttonsContainer)
      buttonsContainer.style.display = originalButtonsDisplay;
    if (fullscreenBtn) fullscreenBtn.style.display = originalFullscreenDisplay;

    // 保存图片
    if (!window.services || !window.services.writeImageFileWithName) {
      throw new Error("文件保存功能不可用");
    }

    // 生成文件名：{班级名}座位图.png
    const className = classInfo.value.className || "未设置班级";
    const fileName = `${className}座位图.png`;

    const filePath = window.services.writeImageFileWithName(dataUrl, fileName);

    if (!filePath) {
      throw new Error("文件保存失败");
    }

    // 成功提示
    ElMessage.success({
      message: "座位表快照已保存",
      duration: 5000,
      showClose: true,
    });

    // 系统通知
    if (window.utools && window.utools.showNotification) {
      window.utools.showNotification({
        title: "座位表快照已保存",
        body: `文件路径：${filePath}`,
      });
    }

    // 询问是否打开文件位置
    try {
      await ElMessageBox.confirm(
        `快照已保存到：\n${filePath}\n\n是否打开文件所在位置？`,
        "保存成功",
        {
          confirmButtonText: "打开位置",
          cancelButtonText: "关闭",
          type: "success",
        },
      );

      // 打开文件所在位置
      if (window.utools && window.utools.shellShowItemInFolder) {
        window.utools.shellShowItemInFolder(filePath);
      }
    } catch {
      // 用户选择关闭
    }
  } catch (error) {
    console.error("保存快照失败:", error);
    ElMessage.error({
      message: `保存快照失败：${error instanceof Error ? error.message : "未知错误"}`,
      duration: 5000,
      showClose: true,
    });
  } finally {
    snapshotLoading.value = false;
  }
};

// 组件挂载时检查是否需要显示引导
onMounted(() => {
  checkAndShowTour();
});
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

/* 重置按钮的 margin */
.ml-0 {
  margin-left: 0 !important;
}
</style>
