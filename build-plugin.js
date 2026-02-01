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

  console.log('✓ Vite 已自动复制 public 目录到 dist\n')

  // 2. 验证 node_modules 是否存在
  const nodeModulesPath = path.join(distDir, 'preload/node_modules')
  if (!fs.existsSync(nodeModulesPath)) {
    console.warn('⚠️  警告: dist/preload/node_modules 不存在')
    console.warn('   请先在 public/preload 目录下运行 npm install\n')
    process.exit(1)
  }

  // 3. 清理 dist/preload/node_modules 下的不必要文件
  console.log('🧹 清理 node_modules 中的不必要文件...')
  const unnecessaryExtensions = ['.map', '.gz', '.br', '.md', '.txt']
  let cleanedCount = 0

  function cleanNodeModules(dir) {
    if (!fs.existsSync(dir)) {
      return
    }

    const entries = fs.readdirSync(dir, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        cleanNodeModules(fullPath)
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name)
        if (unnecessaryExtensions.includes(ext)) {
          fs.unlinkSync(fullPath)
          cleanedCount++
        }
      }
    }
  }

  cleanNodeModules(nodeModulesPath)
  console.log(`✓ 已清理 ${cleanedCount} 个不必要的文件\n`)

  console.log('✅ 插件构建完成！')
  console.log(`\n📁 插件目录: ${distDir}`)
  console.log('\n📝 下一步操作：')
  console.log('  1. 在 uTools 中打开开发者工具')
  console.log('  2. 点击「添加」按钮')
  console.log(`  3. 选择目录: ${distDir}`)
  console.log('  4. 测试插件功能')
  console.log('\n💡 提示：')
  console.log('  - 如需打包为 .upx 文件，将 dist 目录压缩为 zip 并改名为 .upx')
  console.log('  - 发布前请仔细测试所有功能')
}

buildPlugin().catch(console.error)
