<template>
  <el-dialog
    v-model="dialogVisible"
    title="编辑班级信息"
    width="500px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="100px"
    >
      <el-form-item label="班级名称" prop="className">
        <el-input
          v-model="formData.className"
          placeholder="请输入班级名称"
          clearable
          maxlength="50"
          show-word-limit
        />
      </el-form-item>
      <el-form-item label="班主任姓名" prop="teacherName">
        <el-input
          v-model="formData.teacherName"
          placeholder="请输入班主任姓名"
          clearable
          maxlength="20"
          show-word-limit
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleConfirm">保存</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref, watch } from "vue";
import type { FormInstance, FormRules } from "element-plus";

interface ClassInfo {
  className: string;
  teacherName: string;
}

interface Props {
  modelValue: boolean;
  classInfo: ClassInfo;
}

interface Emits {
  (e: "update:modelValue", value: boolean): void;
  (e: "confirm", data: ClassInfo): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const dialogVisible = ref(false);
const formRef = ref<FormInstance>();
const formData = ref<ClassInfo>({
  className: "",
  teacherName: "",
});

// 表单验证规则
const rules: FormRules<ClassInfo> = {
  className: [
    { required: true, message: "请输入班级名称", trigger: "blur" },
    { min: 2, max: 50, message: "班级名称长度在 2 到 50 个字符", trigger: "blur" },
    {
      pattern: /^[\u4e00-\u9fa5a-zA-Z0-9]+$/,
      message: "班级名称只能包含中文、英文和数字",
      trigger: "blur",
    },
  ],
  teacherName: [
    { required: true, message: "请输入班主任姓名", trigger: "blur" },
    { min: 2, max: 20, message: "姓名长度在 2 到 20 个字符", trigger: "blur" },
    {
      pattern: /^[\u4e00-\u9fa5a-zA-Z]+$/,
      message: "姓名只能包含中文和英文",
      trigger: "blur",
    },
  ],
};

// 监听 modelValue 变化
watch(
  () => props.modelValue,
  (val) => {
    dialogVisible.value = val;
    if (val) {
      // 打开对话框时，复制当前班级信息
      formData.value = { ...props.classInfo };
      // 清除验证状态
      formRef.value?.clearValidate();
    }
  },
  { immediate: true }
);

// 监听 dialogVisible 变化，同步到父组件
watch(dialogVisible, (val) => {
  emit("update:modelValue", val);
});

// 取消
const handleCancel = () => {
  dialogVisible.value = false;
};

// 关闭对话框
const handleClose = () => {
  formRef.value?.resetFields();
};

// 确认保存
const handleConfirm = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
    emit("confirm", { ...formData.value });
    dialogVisible.value = false;
  } catch (error) {
    console.log("表单验证失败", error);
  }
};
</script>

<style scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
