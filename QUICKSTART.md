# 快速开始指南

## 🎯 5 分钟上手 uTools 插件开发

### 第一步：安装 uTools

1. 访问 [uTools 官网](https://u.tools/) 下载并安装
2. 启动 uTools（默认快捷键：`Alt + Space`）

### 第二步：启用开发者模式

1. 打开 uTools 设置（点击右上角齿轮图标）
2. 进入「插件应用」标签
3. 点击右上角「开发者」按钮
4. 选择「开发者工具」

### 第三步：启动开发服务器

```bash
# 安装依赖（首次运行）
npm install

# 启动开发服务器
npm run dev
```

服务器会在 http://localhost:5173 启动

### 第四步：在 uTools 中加载插件

1. 在 uTools 开发者工具中点击「添加」按钮
2. 选择项目根目录：`d:\utoolsApp\utools-seat-table-plugin`
3. 插件会自动加载

### 第五步：测试插件

1. 打开 uTools（`Alt + Space`）
2. 输入触发词：`排座位`、`学生排座`、`座位表` 或 `班级座位`
3. 插件界面会显示

## 🎨 开发流程

### 修改代码

编辑 `src/` 目录下的文件，保存后会自动热重载。

### 调试

在插件界面按 `F12` 打开开发者工具，查看日志和调试。

### 修改配置

如果修改了 `public/plugin.json`，需要在 uTools 开发者工具中点击「重新加载」。

## 📦 构建和发布

### 构建插件包

```bash
npm run build:plugin
```

这会在 `plugin/` 目录生成可安装的插件包。

### 测试插件包

1. 在 uTools 开发者工具中点击「添加」
2. 选择 `plugin/` 目录
3. 测试所有功能

### 打包为 .upx 文件

1. 将 `plugin/` 目录压缩为 zip 文件
2. 将文件扩展名改为 `.upx`
3. 双击 .upx 文件即可安装

## 🐛 常见问题

### Q: 插件没有显示？
A:
- 检查开发服务器是否正常运行（http://localhost:5173）
- 在 uTools 开发者工具中点击「重新加载」
- 查看控制台是否有错误信息

### Q: 修改代码后没有更新？
A:
- 确保开发服务器正在运行
- 刷新插件界面（`Ctrl + R`）
- 如果修改了 plugin.json，需要重新加载插件

### Q: 无法访问文件系统？
A:
- 确保在 `public/preload/services.js` 中定义了相关方法
- 通过 `window.services` 调用，不要直接使用 Node.js API

### Q: Tailwind 样式不生效？
A:
- 确保 `src/styles/tailwind.css` 中有 `@import "tailwindcss";`
- 确保 `postcss.config.js` 配置正确
- 重启开发服务器

## 📚 下一步

- 阅读 [DEVELOPMENT.md](./DEVELOPMENT.md) 了解详细开发指南
- 查看 [CLAUDE.md](./CLAUDE.md) 了解项目架构
- 访问 [uTools 官方文档](https://www.u-tools.cn/docs/) 学习更多 API

## 🎉 开始开发

现在你可以开始开发你的 uTools 插件了！

主要文件：
- `src/components/SeatTable.vue` - 座位表组件
- `src/App.vue` - 根组件
- `public/plugin.json` - 插件配置
- `public/preload/services.js` - Node.js 能力注入

祝你开发愉快！🚀
