# uTools 插件构建指南

## 问题诊断与解决

### 问题：打包后 window.services 为 undefined

**原因分析：**
1. preload 脚本依赖了 `xlsx` 模块，但打包后的插件目录中缺少 `node_modules`
2. 当 uTools 加载 preload 脚本时，`require('xlsx')` 失败导致整个脚本执行失败
3. `window.services` 对象未能成功注入到渲染进程

**解决方案：**
1. 在 `public/preload/` 目录下独立管理依赖（添加 package.json）
2. 在 preload 目录下安装依赖：`npm install`
3. 构建脚本自动复制 preload 的 node_modules 到插件目录
4. 自动清理不必要的调试文件（.map, .gz, .md, LICENSE 等）

## 构建流程

### 开发模式
```bash
npm run dev
```
- 启动 Vite 开发服务器（http://localhost:5173）
- 在 uTools 中使用开发模式（plugin.json 中的 development.main）
- 支持热更新

### 生产构建
```bash
npm run build:plugin
```

这个命令会自动执行：
1. `npm run build` - 使用 Vite 构建前端资源
2. `node build-plugin.js` - 打包插件目录

### 构建产物

生成的 `plugin/` 目录结构：
```
plugin/
├── assets/              # 前端资源（JS、CSS）
├── preload/             # Node.js 环境脚本
│   ├── node_modules/    # preload 依赖（包含 xlsx）
│   ├── package.json
│   └── services.js      # 注入 window.services 的脚本
├── index.html           # 主页面
├── logo.png             # 插件图标
├── plugin.json          # 插件配置
└── 学生数据导入模板.xlsx # 模板文件
```

### 文件清理

构建脚本会自动清理以下不必要的文件：
- `.map` - Source map 文件
- `.gz` / `.br` - 压缩文件
- `.md` - Markdown 文档
- `.txt` - 文本文档
- `LICENSE` / `CHANGELOG` / `CONTRIBUTING` - 许可和文档文件
- `.npmignore` / `.gitignore` - 版本控制文件

## 安装测试

### 方式一：开发者模式安装
1. 打开 uTools
2. 输入「插件应用」或按快捷键打开插件管理
3. 点击「开发者」→「添加」
4. 选择 `plugin/` 目录
5. 测试插件功能

### 方式二：打包为 .upx 文件
1. 将 `plugin/` 目录压缩为 zip 文件
2. 将 `.zip` 扩展名改为 `.upx`
3. 在 uTools 中安装 .upx 文件

## 依赖管理

### 项目根目录依赖（package.json）
用于前端开发（Vue、Element Plus、Vite 等）

### preload 目录依赖（public/preload/package.json）
用于 Node.js 环境（xlsx 等）

**重要：** 如果在 preload 脚本中添加新的 Node.js 依赖：
1. 在 `public/preload/package.json` 中添加依赖
2. 在 `public/preload/` 目录下运行 `npm install`
3. 重新构建插件

## 打包体积优化

当前打包体积：约 13MB
- preload/node_modules: 12MB（主要是 xlsx 库）
- assets: 384KB（前端资源）
- 其他文件: 约 20KB

### 进一步优化建议

如果需要减小体积，可以考虑：
1. 使用更轻量的 Excel 解析库（如 exceljs）
2. 只打包 xlsx 的核心功能（xlsx.core.min.js）
3. 使用 webpack 或 rollup 打包 preload 脚本

## 常见问题

### Q: 开发模式正常，打包后不工作？
A: 确保在 `public/preload/` 目录下运行了 `npm install`

### Q: 如何验证 preload 脚本是否正常加载？
A: 在 uTools 中打开开发者工具（F12），在 Console 中输入 `window.services` 查看是否有值

### Q: 如何调试 preload 脚本？
A: 在 preload 脚本中使用 `console.log()`，日志会输出到 uTools 的开发者工具 Console

### Q: 打包后文件过大怎么办？
A: 检查 node_modules 中是否有不必要的依赖，考虑使用更轻量的替代库

## 发布前检查清单

- [ ] 在开发模式下测试所有功能
- [ ] 运行 `npm run build:plugin` 构建插件
- [ ] 在 uTools 中安装 plugin 目录测试
- [ ] 验证所有 Node.js 功能正常（文件读写、Excel 解析等）
- [ ] 检查插件体积是否合理
- [ ] 测试在不同操作系统上的兼容性
- [ ] 更新 plugin.json 中的版本号和描述
- [ ] 准备插件截图和说明文档
