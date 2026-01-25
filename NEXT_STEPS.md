# 🚀 下一步操作指南

## 立即可以做的事情

### 1️⃣ 在 uTools 中测试插件（推荐首先做）

```bash
# 确保开发服务器正在运行
npm run dev
```

然后：
1. 打开 uTools（`Alt + Space`）
2. 进入设置 → 插件应用 → 开发者工具
3. 点击「添加」，选择项目根目录
4. 在 uTools 中输入：`排座位`
5. 测试所有功能：
   - ✅ 拖拽调整座位
   - ✅ 从学生列表拖拽到座位
   - ✅ 删除座位上的学生
   - ✅ 重置座位
   - ✅ 全屏排位
   - ✅ 搜索学生

### 2️⃣ 打包插件进行测试

```bash
# 构建插件包
npm run build:plugin
```

然后：
1. 在 uTools 开发者工具中点击「添加」
2. 选择 `plugin/` 目录
3. 测试生产版本的插件

### 3️⃣ 制作 .upx 安装包

**Windows:**
```bash
# 进入 plugin 目录
cd plugin

# 压缩为 zip（使用 7-Zip 或 WinRAR）
# 右键 → 添加到压缩文件 → 选择 zip 格式

# 重命名为 .upx
ren plugin.zip utools-seat-table.upx
```

**命令行方式:**
```bash
# 使用 PowerShell
Compress-Archive -Path plugin\* -DestinationPath utools-seat-table.zip
Rename-Item utools-seat-table.zip utools-seat-table.upx
```

然后双击 `.upx` 文件即可安装到 uTools！

## 📝 功能增强建议

### 简单功能（1-2小时）

#### 1. 添加座位导出功能
```javascript
// 在 SeatTable.vue 中添加
const exportToImage = () => {
  // 使用 html2canvas 导出座位表为图片
}

const exportToText = () => {
  // 导出为文本格式
  const text = seats.value
    .filter(s => s.studentId)
    .map(s => `${s.studentName} - 第${s.row}排第${s.col}个`)
    .join('\n')

  window.services.writeTextFile(text)
}
```

#### 2. 添加键盘快捷键
```javascript
// 在 SeatTable.vue 中添加
onMounted(() => {
  window.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'r') {
      e.preventDefault()
      resetSeats()
    }
    if (e.key === 'F11') {
      e.preventDefault()
      toggleFullscreen()
    }
  })
})
```

#### 3. 添加座位统计信息
```vue
<div class="stats">
  <div>总座位数: {{ totalSeats }}</div>
  <div>已就座: {{ seatedStudentCount }}</div>
  <div>空座位: {{ totalSeats - seatedStudentCount }}</div>
  <div>就座率: {{ (seatedStudentCount / totalSeats * 100).toFixed(1) }}%</div>
</div>
```

### 中等功能（3-5小时）

#### 1. 支持自定义行列数
```vue
<template>
  <div class="settings">
    <el-input-number v-model="rows" :min="3" :max="10" />
    <el-input-number v-model="cols" :min="4" :max="12" />
    <el-button @click="applyLayout">应用布局</el-button>
  </div>
</template>
```

#### 2. 添加座位历史记录
```javascript
const history = ref([])
const currentIndex = ref(-1)

const saveHistory = () => {
  history.value = history.value.slice(0, currentIndex.value + 1)
  history.value.push(JSON.parse(JSON.stringify(seats.value)))
  currentIndex.value++
}

const undo = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--
    seats.value = JSON.parse(JSON.stringify(history.value[currentIndex.value]))
  }
}

const redo = () => {
  if (currentIndex.value < history.value.length - 1) {
    currentIndex.value++
    seats.value = JSON.parse(JSON.stringify(history.value[currentIndex.value]))
  }
}
```

#### 3. 添加随机排座功能
```javascript
const randomAssign = () => {
  // 获取所有空座位
  const emptySeats = seats.value.filter(s => !s.studentId)

  // 获取未就座学生
  const unassigned = unSeatedStudentList.value

  // 随机分配
  const shuffled = [...unassigned].sort(() => Math.random() - 0.5)

  shuffled.forEach((student, index) => {
    if (emptySeats[index]) {
      emptySeats[index].studentId = student.id
      emptySeats[index].studentName = student.name
    }
  })
}
```

### 高级功能（1-2天）

#### 1. 多班级管理
```javascript
// 添加班级管理
const classes = ref([
  { id: 1, name: '四八班', seats: [] },
  { id: 2, name: '四九班', seats: [] }
])

const currentClass = ref(1)

// 切换班级
const switchClass = (classId) => {
  // 保存当前班级数据
  saveClassData(currentClass.value)

  // 加载新班级数据
  loadClassData(classId)
  currentClass.value = classId
}
```

#### 2. 座位规则引擎
```javascript
// 添加座位分配规则
const rules = ref({
  separateGender: true,      // 男女分开
  heightOrder: true,          // 按身高排序
  visionPriority: true,       // 视力不好的坐前排
  avoidConflicts: true        // 避免冲突学生相邻
})

const smartAssign = () => {
  // 根据规则智能分配座位
}
```

#### 3. 数据导入导出
```javascript
// 导入学生名单（Excel/CSV）
const importStudents = async (file) => {
  const data = await window.services.readFile(file)
  // 解析并导入
}

// 导出座位表（Excel/PDF）
const exportSeatTable = (format) => {
  // 生成并导出
}
```

## 🎨 UI/UX 改进建议

### 1. 添加加载动画
```vue
<template>
  <div v-if="loading" class="loading">
    <el-icon class="is-loading"><Loading /></el-icon>
    <span>加载中...</span>
  </div>
</template>
```

### 2. 添加操作提示
```javascript
import { ElMessage } from 'element-plus'

const handleSuccess = (message) => {
  ElMessage.success(message)
}

const handleError = (message) => {
  ElMessage.error(message)
}
```

### 3. 添加确认对话框
```javascript
import { ElMessageBox } from 'element-plus'

const confirmReset = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要重置所有座位吗？此操作不可撤销。',
      '确认重置',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    resetSeats()
  } catch {
    // 用户取消
  }
}
```

### 4. 添加主题切换
```javascript
const theme = ref('light')

const toggleTheme = () => {
  theme.value = theme.value === 'light' ? 'dark' : 'light'
  document.documentElement.setAttribute('data-theme', theme.value)
}
```

## 🐛 代码质量改进

### 1. 添加 ESLint
```bash
npm install -D eslint eslint-plugin-vue @vue/eslint-config-typescript

# 创建 .eslintrc.js
```

### 2. 添加 Prettier
```bash
npm install -D prettier eslint-config-prettier eslint-plugin-prettier

# 创建 .prettierrc
```

### 3. 添加 Git Hooks
```bash
npm install -D husky lint-staged

# 配置 pre-commit hook
```

### 4. 添加单元测试
```bash
npm install -D vitest @vue/test-utils

# 创建测试文件
```

## 📦 发布准备

### 1. 完善 plugin.json
```json
{
  "logo": "logo.png",
  "main": "index.html",
  "version": "1.0.0",
  "author": "你的名字",
  "homepage": "https://github.com/your-username/utools-seat-table",
  "description": "学生排座位助手 - 快速生成和管理班级座位表",
  "features": [
    {
      "code": "seatTable",
      "cmds": ["排座位", "学生排座", "座位表", "班级座位"],
      "explain": "学生排座位助手 - 快速生成和管理班级座位表"
    }
  ],
  "development": {
    "main": "http://localhost:5173/index.html"
  }
}
```

### 2. 准备宣传材料
- 📸 截图（至少3张）
- 🎥 演示视频（可选）
- 📝 详细说明文档
- 🎨 精美的图标

### 3. 提交到 uTools 插件中心
1. 访问 https://u.tools/developer
2. 注册开发者账号
3. 上传 .upx 文件
4. 填写插件信息
5. 提交审核

## 🎓 学习资源

### 推荐阅读
- [ ] [Vue 3 最佳实践](https://cn.vuejs.org/guide/best-practices/)
- [ ] [Tailwind CSS 实用技巧](https://tailwindcss.com/docs/utility-first)
- [ ] [uTools 插件开发进阶](https://www.u-tools.cn/docs/developer/)

### 推荐工具
- [ ] Vue DevTools - Vue 调试工具
- [ ] Tailwind CSS IntelliSense - VSCode 扩展
- [ ] uTools 开发者工具 - 插件调试

## 📞 获取帮助

如果遇到问题：
1. 查看项目文档（README.md, DEVELOPMENT.md）
2. 检查 uTools 开发者工具的控制台
3. 访问 uTools 开发者社区
4. 查看 GitHub Issues

## 🎉 恭喜！

你的 uTools 插件项目已经完全配置好了！现在可以：

✅ 在 uTools 中测试插件
✅ 继续开发新功能
✅ 打包发布到插件中心

**立即开始：**
```bash
npm run dev
```

然后在 uTools 中输入 `排座位` 测试你的插件！

祝你开发愉快！🚀
