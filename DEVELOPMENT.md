# uTools 插件开发指南

## 开发环境设置

### 1. 安装 uTools
- 下载并安装 uTools: https://u.tools/
- 启动 uTools（默认快捷键：Alt + Space）

### 2. 启用开发者模式
1. 打开 uTools 设置
2. 进入「插件应用」
3. 点击右上角「开发者」按钮
4. 选择「开发者工具」

### 3. 安装插件到 uTools
1. 在开发者工具中点击「添加」
2. 选择项目根目录（包含 plugin.json 的目录）
3. 插件会自动加载

## 开发流程

### 启动开发服务器

```bash
npm run dev
```

服务器会在 http://localhost:5173 启动

### 在 uTools 中测试

1. 打开 uTools（Alt + Space）
2. 输入触发关键词：`排座位`、`学生排座`、`座位表` 或 `班级座位`
3. 插件会加载并显示界面

### 热重载

- 修改 `src/` 下的文件会自动热重载
- 修改 `public/plugin.json` 需要在 uTools 开发者工具中点击「重新加载」
- 修改 `public/preload/services.js` 需要重新加载插件

## 调试技巧

### 1. 打开开发者工具

在插件界面中按 `F12` 或右键选择「检查元素」

### 2. 查看日志

```javascript
console.log('调试信息')
```

### 3. 调试 Preload 脚本

在 `public/preload/services.js` 中：

```javascript
console.log('Preload script loaded')
```

日志会显示在 uTools 的开发者工具控制台中

## 构建和打包

### 1. 构建生产版本

```bash
npm run build
```

构建产物会输出到 `dist/` 目录

### 2. 准备发布

确保以下文件在项目根目录：
- `plugin.json` - 插件配置
- `logo.png` - 插件图标
- `preload/` - Preload 脚本目录
- `index.html` - 入口文件（构建后）
- 其他资源文件

### 3. 打包插件

1. 将以下文件/目录复制到一个新文件夹：
   ```
   plugin.json
   logo.png
   preload/
   dist/index.html
   dist/assets/
   ```

2. 将文件夹压缩为 `.upx` 文件（实际上是 zip 格式）

3. 在 uTools 开发者工具中测试 .upx 文件

### 4. 发布到 uTools 插件中心

1. 访问 https://u.tools/developer
2. 注册开发者账号
3. 上传 .upx 文件
4. 填写插件信息
5. 提交审核

## 常见问题

### Q: 修改代码后插件没有更新？
A:
- 检查开发服务器是否正常运行
- 在 uTools 开发者工具中点击「重新加载」
- 如果修改了 plugin.json，必须重新加载

### Q: 无法访问文件系统？
A:
- 确保在 `public/preload/services.js` 中定义了相关方法
- 通过 `window.services` 调用，不要直接使用 Node.js API

### Q: 插件图标不显示？
A:
- 确保 `logo.png` 在 `public/` 目录下
- 图标建议尺寸：256x256 或 512x512

### Q: 如何调试 Preload 脚本？
A:
- 在 uTools 主界面按 `Ctrl + Shift + I` 打开主进程开发者工具
- Preload 脚本的日志会显示在这里

## 项目结构

```
utools-seat-table-plugin/
├── public/
│   ├── logo.png              # 插件图标
│   ├── plugin.json           # 插件配置
│   └── preload/
│       ├── package.json      # 标记为 CommonJS
│       └── services.js       # Node.js 能力注入
├── src/
│   ├── assets/               # 静态资源
│   ├── components/           # Vue 组件
│   ├── config/               # 配置文件
│   ├── styles/               # 样式文件
│   ├── utils/                # 工具函数
│   ├── App.vue               # 根组件
│   └── main.js               # 入口文件
├── index.html                # HTML 模板
├── vite.config.js            # Vite 配置
├── package.json              # 项目配置
└── CLAUDE.md                 # 项目文档

构建后：
├── dist/
│   ├── index.html            # 入口文件
│   └── assets/               # 打包后的资源
```

## 最佳实践

### 1. 性能优化
- 使用懒加载减少初始加载时间
- 避免在 Preload 脚本中执行耗时操作
- 合理使用 localStorage 缓存数据

### 2. 用户体验
- 提供清晰的错误提示
- 添加加载状态指示
- 支持键盘快捷键操作

### 3. 安全性
- 不要在 Preload 脚本中暴露敏感 API
- 验证用户输入
- 谨慎处理文件系统操作

### 4. 兼容性
- 测试不同操作系统（Windows、macOS、Linux）
- 确保在不同 uTools 版本中正常运行
- 处理边界情况和异常

## 参考资源

- uTools 官方文档: https://www.u-tools.cn/docs/
- uTools 开发者社区: https://yuanliao.info/
- 示例插件: https://github.com/uTools-Labs
