import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// 构建插件打包脚本
async function buildPlugin() {
  console.log('🚀 开始构建 uTools 插件...\n')

  // 1. 检查 dist 目录是否存在
  const distDir = path.join(__dirname, 'dist')
  if (!fs.existsSync(distDir)) {
    console.error('❌ dist 目录不存在，请先运行 npm run build')
    process.exit(1)
  }

  // 2. 创建插件目录
  const pluginDir = path.join(__dirname, 'plugin')
  if (fs.existsSync(pluginDir)) {
    fs.rmSync(pluginDir, { recursive: true })
  }
  fs.mkdirSync(pluginDir)

  console.log('📦 复制文件到插件目录...')

  // 3. 复制必要文件
  const filesToCopy = [
    { src: 'public/plugin.json', dest: 'plugin.json' },
    { src: 'public/logo.png', dest: 'logo.png' },
    { src: 'dist/index.html', dest: 'index.html' },
  ]

  for (const file of filesToCopy) {
    const srcPath = path.join(__dirname, file.src)
    const destPath = path.join(pluginDir, file.dest)

    if (!fs.existsSync(srcPath)) {
      console.error(`❌ 文件不存在: ${file.src}`)
      process.exit(1)
    }

    fs.copyFileSync(srcPath, destPath)
    console.log(`  ✓ ${file.src} -> ${file.dest}`)
  }

  // 4. 复制 preload 目录
  const preloadSrc = path.join(__dirname, 'public/preload')
  const preloadDest = path.join(pluginDir, 'preload')
  fs.cpSync(preloadSrc, preloadDest, { recursive: true })
  console.log('  ✓ public/preload -> preload/')

  // 5. 复制 assets 目录
  const assetsSrc = path.join(__dirname, 'dist/assets')
  const assetsDest = path.join(pluginDir, 'assets')
  if (fs.existsSync(assetsSrc)) {
    fs.cpSync(assetsSrc, assetsDest, { recursive: true })
    console.log('  ✓ dist/assets -> assets/')
  }

  // 6. 读取 plugin.json 获取插件信息
  const pluginJson = JSON.parse(
    fs.readFileSync(path.join(pluginDir, 'plugin.json'), 'utf-8')
  )

  console.log('\n✅ 插件构建完成！')
  console.log(`\n📁 插件目录: ${pluginDir}`)
  console.log('\n📝 下一步操作：')
  console.log('  1. 在 uTools 中打开开发者工具')
  console.log('  2. 点击「添加」按钮')
  console.log(`  3. 选择目录: ${pluginDir}`)
  console.log('  4. 测试插件功能')
  console.log('\n💡 提示：')
  console.log('  - 如需打包为 .upx 文件，将 plugin 目录压缩为 zip 并改名为 .upx')
  console.log('  - 发布前请仔细测试所有功能')
}

buildPlugin().catch(console.error)
