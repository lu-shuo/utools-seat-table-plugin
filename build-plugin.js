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
    { src: 'public/学生数据导入模板.xlsx', dest: '学生数据导入模板.xlsx' },
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

  // 4. 复制 preload 目录（包含 node_modules）
  const preloadSrc = path.join(__dirname, 'public/preload')
  const preloadDest = path.join(pluginDir, 'preload')
  fs.cpSync(preloadSrc, preloadDest, { recursive: true })
  console.log('  ✓ public/preload -> preload/ (包含 node_modules)')

  // 验证 node_modules 是否存在
  const nodeModulesPath = path.join(preloadDest, 'node_modules')
  if (!fs.existsSync(nodeModulesPath)) {
    console.warn('  ⚠️  警告: preload/node_modules 不存在，请先在 public/preload 目录下运行 npm install')
  }

  // 清理不必要的文件
  console.log('\n🧹 清理不必要的文件...')
  const unnecessaryExtensions = ['.map', '.gz', '.br', '.md', '.txt']
  const unnecessaryFiles = ['LICENSE', 'CHANGELOG', 'CONTRIBUTING', '.npmignore', '.gitignore']
  let cleanedCount = 0

  function cleanUnnecessaryFiles(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        cleanUnnecessaryFiles(fullPath)
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name)
        const baseName = path.basename(entry.name, ext)

        // 检查扩展名或文件名是否在清理列表中
        if (unnecessaryExtensions.includes(ext) || unnecessaryFiles.includes(baseName) || unnecessaryFiles.includes(entry.name)) {
          fs.unlinkSync(fullPath)
          cleanedCount++
        }
      }
    }
  }

  cleanUnnecessaryFiles(pluginDir)
  console.log(`  ✓ 已清理 ${cleanedCount} 个不必要的文件`)

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
