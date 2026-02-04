<template>
  <el-dialog
    v-model="dialogVisible"
    title="学生管理"
    width="800px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div class="student-manage-container">
      <!-- 顶部操作栏 -->
      <div class="toolbar">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索学号或姓名"
          clearable
          :prefix-icon="Search"
          style="width: 300px"
        />
        <el-button type="primary" :icon="Plus" @click="handleAdd">
          添加学生
        </el-button>
      </div>

      <!-- 学生列表表格 -->
      <el-table
        :data="filteredStudentList"
        border
        stripe
        style="width: 100%"
        max-height="500px"
        empty-text="暂无学生数据"
      >
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="id" label="学号" width="100" align="center" />
        <el-table-column prop="name" label="姓名" width="120" />
        <el-table-column label="角色" width="100" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.role === 'master'" type="success" size="small">
              师傅
            </el-tag>
            <el-tag v-else-if="row.role === 'apprentice'" type="warning" size="small">
              徒弟
            </el-tag>
            <span v-else class="text-gray-400">-</span>
          </template>
        </el-table-column>
        <el-table-column label="关系" min-width="150">
          <template #default="{ row }">
            <span v-if="row.role === 'master' && row.apprenticeIds?.length">
              徒弟: {{ getApprenticeNames(row.apprenticeIds).join('、') }}
            </span>
            <span v-else-if="row.role === 'apprentice' && row.masterId">
              师傅: {{ getMasterName(row.masterId) }}
            </span>
            <span v-else class="text-gray-400">-</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" align="center" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              link
              :icon="Edit"
              @click="handleEdit(row)"
            >
              编辑
            </el-button>
            <el-button
              type="danger"
              size="small"
              link
              :icon="Delete"
              @click="handleDelete(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 统计信息 -->
      <div class="statistics">
        共 {{ studentList.length }} 名学生
        <span v-if="searchKeyword">，筛选结果 {{ filteredStudentList.length }} 名</span>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCancel">关闭</el-button>
      </div>
    </template>

    <!-- 添加/编辑学生对话框 -->
    <el-dialog
      v-model="editDialogVisible"
      :title="editMode === 'add' ? '添加学生' : '编辑学生'"
      width="450px"
      :close-on-click-modal="false"
      append-to-body
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="80px"
      >
        <el-form-item label="学号" prop="id">
          <el-input-number
            v-model="formData.id"
            :min="1"
            :max="99999"
            :step="1"
            :disabled="editMode === 'edit'"
            controls-position="right"
            style="width: 100%"
            placeholder="请输入学号"
          />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input
            v-model="formData.name"
            placeholder="请输入姓名"
            clearable
            maxlength="20"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-radio-group v-model="formData.role" @change="handleRoleChange">
            <el-radio :label="null">无</el-radio>
            <el-radio label="master">师傅</el-radio>
            <el-radio label="apprentice">徒弟</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item
          v-if="formData.role === 'apprentice'"
          label="选择师傅"
          prop="masterId"
        >
          <el-select
            v-model="formData.masterId"
            placeholder="请选择师傅"
            clearable
            style="width: 100%"
          >
            <el-option
              v-for="student in availableMasters"
              :key="student.id"
              :label="`${student.name}（学号：${student.id}）`"
              :value="student.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          v-if="formData.role === 'master'"
          label="选择徒弟"
          prop="apprenticeIds"
        >
          <el-select
            v-model="formData.apprenticeIds"
            placeholder="请选择徒弟"
            multiple
            clearable
            style="width: 100%"
          >
            <el-option
              v-for="student in availableApprentices"
              :key="student.id"
              :label="`${student.name}（学号：${student.id}）`"
              :value="student.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleConfirmEdit">保存</el-button>
        </div>
      </template>
    </el-dialog>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Search, Plus, Edit, Delete } from "@element-plus/icons-vue";
import type { FormInstance, FormRules } from "element-plus";
import type { Student } from "@/interface";

interface Props {
  modelValue: boolean;
  studentList: Student[];
}

interface Emits {
  (e: "update:modelValue", value: boolean): void;
  (e: "update:studentList", value: Student[]): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const dialogVisible = ref(false);
const searchKeyword = ref("");
const editDialogVisible = ref(false);
const editMode = ref<"add" | "edit">("add");
const formRef = ref<FormInstance>();

// 表单数据
const formData = ref<Student>({
  id: 0,
  name: "",
});

// 当前编辑的学生原始数据（用于编辑模式）
const editingStudent = ref<Student | null>(null);

// 表单验证规则
const rules: FormRules<Student> = {
  id: [
    { required: true, message: "请输入学号", trigger: "blur" },
    {
      validator: (rule, value, callback) => {
        if (!value || value <= 0) {
          callback(new Error("学号必须大于0"));
          return;
        }
        // 检查学号是否重复（添加模式或编辑时学号改变）
        const isDuplicate = props.studentList.some(
          (s) =>
            s.id === value &&
            (editMode.value === "add" || s.id !== editingStudent.value?.id)
        );
        if (isDuplicate) {
          callback(new Error("学号已存在"));
        } else {
          callback();
        }
      },
      trigger: "blur",
    },
  ],
  name: [
    { required: true, message: "请输入姓名", trigger: "blur" },
    { min: 2, max: 20, message: "姓名长度在 2 到 20 个字符", trigger: "blur" },
    {
      pattern: /^[\u4e00-\u9fa5a-zA-Z]+$/,
      message: "姓名只能包含中文和英文",
      trigger: "blur",
    },
  ],
};

// 筛选后的学生列表
const filteredStudentList = computed(() => {
  if (!searchKeyword.value) {
    return props.studentList;
  }
  const keyword = searchKeyword.value.toLowerCase();
  return props.studentList.filter(
    (student) =>
      student.name.toLowerCase().includes(keyword) ||
      student.id.toString().includes(keyword)
  );
});

// 获取师傅姓名
const getMasterName = (masterId: number) => {
  const master = props.studentList.find((s) => s.id === masterId);
  return master ? master.name : "未知";
};

// 获取徒弟姓名列表
const getApprenticeNames = (apprenticeIds: number[]) => {
  return apprenticeIds
    .map((id) => {
      const apprentice = props.studentList.find((s) => s.id === id);
      return apprentice ? apprentice.name : null;
    })
    .filter((name) => name !== null) as string[];
};

// 可选的师傅列表（排除当前学生和已经是徒弟的学生）
const availableMasters = computed(() => {
  return props.studentList.filter(
    (s) => {
      // 排除自己
      if (s.id === formData.value.id) return false;

      // 编辑模式下，如果是当前学生的师傅，必须包含（用于正确回显）
      if (editMode.value === "edit" && s.id === formData.value.masterId) {
        return true;
      }

      // 排除已经是徒弟的学生
      return s.role !== "apprentice";
    }
  );
});

// 可选的徒弟列表（排除当前学生和已经是师傅的学生，以及已有师傅的学生）
const availableApprentices = computed(() => {
  return props.studentList.filter(
    (s) => {
      // 排除自己
      if (s.id === formData.value.id) return false;

      // 编辑模式下，如果是当前学生的徒弟，必须包含（用于正确回显）
      if (editMode.value === "edit" && formData.value.apprenticeIds?.includes(s.id)) {
        return true;
      }

      // 排除已经是师傅的学生和已有师傅的学生
      return s.role !== "master" && !s.masterId;
    }
  );
});

// 角色变化处理
const handleRoleChange = (newRole: "master" | "apprentice" | null) => {
  // 清空相关字段
  if (newRole !== "master") {
    formData.value.apprenticeIds = [];
  }
  if (newRole !== "apprentice") {
    formData.value.masterId = null;
  }
};

// 监听 modelValue 变化
watch(
  () => props.modelValue,
  (val) => {
    dialogVisible.value = val;
    if (val) {
      // 打开对话框时，清空搜索
      searchKeyword.value = "";
    }
  },
  { immediate: true }
);

// 监听 dialogVisible 变化，同步到父组件
watch(dialogVisible, (val) => {
  emit("update:modelValue", val);
});

// 关闭对话框
const handleClose = () => {
  searchKeyword.value = "";
};

// 取消
const handleCancel = () => {
  dialogVisible.value = false;
};

// 添加学生
const handleAdd = () => {
  editMode.value = "add";
  editingStudent.value = null;
  formData.value = {
    id: 0,
    name: "",
    role: null,
    masterId: null,
    apprenticeIds: [],
  };
  editDialogVisible.value = true;
  // 清除验证状态
  formRef.value?.clearValidate();
};

// 编辑学生
const handleEdit = (student: Student) => {
  editMode.value = "edit";
  editingStudent.value = { ...student };
  formData.value = { ...student };
  editDialogVisible.value = true;
  // 清除验证状态
  formRef.value?.clearValidate();
};

// 删除学生
const handleDelete = async (student: Student) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除学生 "${student.name}"（学号：${student.id}）吗？`,
      "删除确认",
      {
        confirmButtonText: "确定删除",
        cancelButtonText: "取消",
        type: "warning",
      }
    );

    let newList = props.studentList.filter((s) => s.id !== student.id);

    // 清理师徒关系
    if (student.role === "master" && student.apprenticeIds?.length) {
      // 如果是师傅，清理徒弟的masterId
      newList = newList.map((s) => {
        if (student.apprenticeIds?.includes(s.id)) {
          return { ...s, masterId: null, role: null };
        }
        return s;
      });
    } else if (student.role === "apprentice" && student.masterId) {
      // 如果是徒弟，清理师傅的apprenticeIds
      newList = newList.map((s) => {
        if (s.id === student.masterId) {
          const newApprenticeIds = (s.apprenticeIds || []).filter(
            (id) => id !== student.id
          );
          return {
            ...s,
            apprenticeIds: newApprenticeIds,
            role: newApprenticeIds.length > 0 ? "master" : null,
          };
        }
        return s;
      });
    }

    emit("update:studentList", newList);
    ElMessage.success("删除成功");
  } catch {
    // 用户取消
  }
};

// 确认添加/编辑
const handleConfirmEdit = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();

    let newList = [...props.studentList];

    if (editMode.value === "add") {
      // 添加学生
      newList.push({ ...formData.value });
    } else {
      // 编辑学生 - 先清理旧关系
      const oldStudent = editingStudent.value;
      if (oldStudent) {
        // 如果旧角色是师傅，清理徒弟的masterId
        if (oldStudent.role === "master" && oldStudent.apprenticeIds?.length) {
          newList = newList.map((s) => {
            if (oldStudent.apprenticeIds?.includes(s.id)) {
              return { ...s, masterId: null, role: null };
            }
            return s;
          });
        }
        // 如果旧角色是徒弟，清理师傅的apprenticeIds
        if (oldStudent.role === "apprentice" && oldStudent.masterId) {
          newList = newList.map((s) => {
            if (s.id === oldStudent.masterId) {
              const newApprenticeIds = (s.apprenticeIds || []).filter(
                (id) => id !== oldStudent.id
              );
              return {
                ...s,
                apprenticeIds: newApprenticeIds,
                role: newApprenticeIds.length > 0 ? "master" : null,
              };
            }
            return s;
          });
        }
      }

      // 更新当前学生
      newList = newList.map((s) =>
        s.id === editingStudent.value?.id ? { ...formData.value } : s
      );
    }

    // 处理新的师徒关系
    if (formData.value.role === "master" && formData.value.apprenticeIds?.length) {
      // 设置为师傅 - 更新徒弟的masterId
      newList = newList.map((s) => {
        if (formData.value.apprenticeIds?.includes(s.id)) {
          return { ...s, role: "apprentice", masterId: formData.value.id };
        }
        return s;
      });
    } else if (formData.value.role === "apprentice" && formData.value.masterId) {
      // 设置为徒弟 - 更新师傅的apprenticeIds
      newList = newList.map((s) => {
        if (s.id === formData.value.masterId) {
          const apprenticeIds = s.apprenticeIds || [];
          if (!apprenticeIds.includes(formData.value.id)) {
            return {
              ...s,
              role: "master",
              apprenticeIds: [...apprenticeIds, formData.value.id],
            };
          }
        }
        return s;
      });
    }

    emit("update:studentList", newList);
    ElMessage.success(editMode.value === "add" ? "添加成功" : "修改成功");
    editDialogVisible.value = false;
  } catch (error) {
    console.log("表单验证失败", error);
  }
};
</script>

<style scoped>
.student-manage-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.statistics {
  padding: 12px 0;
  color: #606266;
  font-size: 14px;
  text-align: right;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
