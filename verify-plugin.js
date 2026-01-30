import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// 插件验证脚本
async function verifyPlugin() {
  console.log('🔍 开始验证插件构建...\n')

  const pluginDir = path.join(__dirname, 'plugin')
  const errors = []
  const warnings = []

  // 1. 检查插件目录是否存在
  if (!fs.existsSync(pluginDir)) {
    errors.push('plugin 目录不存在，请先运行 npm run build:plugin')
    console.error('❌ plugin 目录不存在')
    process.exit(1)
  }

  // 2. 检查必需文件
  const requiredFiles = [
    'plugin.json',
    'index.html',
    'logo.png',
    'preload/services.js',
    'preload/package.json',
    'preload/node_modules',
    'assets',
  ]

  console.log('📋 检查必需文件...')
  for (const file of requiredFiles) {
    const filePath = path.join(pluginDir, file)
    if (!fs.existsSync(filePath)) {
      errors.push(`缺少必需文件: ${file}`)
      console.error(`  ❌ ${file}`)
    } else {
      console.log(`  ✓ ${file}`)
    }
  }

  // 3. 检查 preload 依赖
  console.log('\n📦 检查 preload 依赖...')
  const preloadPackageJson = path.join(pluginDir, 'preload/package.json')
  if (fs.existsSync(preloadPackageJson)) {
    const pkg = JSON.parse(fs.readFileSync(preloadPackageJson, 'utf-8'))
    if (pkg.dependencies && pkg.dependencies.xlsx) {
      console.log('  ✓ xlsx 依赖已声明')

      // 检查 xlsx 是否已安装
      const xlsxPath = path.join(pluginDir, 'preload/node_modules/xlsx')
      if (fs.existsSync(xlsxPath)) {
        console.log('  ✓ xlsx 模块已安装')
      } else {
        errors.push('xlsx 模块未安装')
        console.error('  ❌ xlsx 模块未安装')
      }
    } else {
      warnings.push('preload/package.json 中未声明 xlsx 依赖')
      console.warn('  ⚠️  未声明 xlsx 依赖')
    }
  }

  // 4. 检查不应存在的文件
  console.log('\n🧹 检查不应存在的文件...')
  const unnecessaryPatterns = ['.map', '.gz', '.br', '.md', 'LICENSE', 'CHANGELOG']
  let foundUnnecessary = false

  function checkUnnecessaryFiles(dir, relativePath = '') {
    const entries = fs.readdirSync(dir, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)
      const relPath = path.join(relativePath, entry.name)

      if (entry.isDirectory()) {
        checkUnnecessaryFiles(fullPath, relPath)
      } else if (entry.isFile()) {
        for (const pattern of unnecessaryPatterns) {
          if (entry.name.endsWith(pattern) || entry.name === pattern) {
            warnings.push(`发现不必要的文件: ${relPath}`)
            console.warn(`  ⚠️  ${relPath}`)
            foundUnnecessary = true
          }
        }
      }
    }
  }

  checkUnnecessaryFiles(pluginDir)
  if (!foundUnnecessary) {
    console.log('  ✓ 未发现不必要的文件')
  }

  // 5. 检查插件配置
  console.log('\n⚙️  检查插件配置...')
  const pluginJsonPath = path.join(pluginDir, 'plugin.json')
  if (fs.existsSync(pluginJsonPath)) {
    const pluginJson = JSON.parse(fs.readFileSync(pluginJsonPath, 'utf-8'))

    if (pluginJson.main) {
      console.log(`  ✓ main: ${pluginJson.main}`)
    } else {
      errors.push('plugin.json 缺少 main 字段')
      console.error('  ❌ 缺少 main 字段')
    }

    if (pluginJson.preload) {
      console.log(`  ✓ preload: ${pluginJson.preload}`)
    } else {
      errors.push('plugin.json 缺少 preload 字段')
      console.error('  ❌ 缺少 preload 字段')
    }

    if (pluginJson.features && pluginJson.features.length > 0) {
      console.log(`  ✓ features: ${pluginJson.features.length} 个功能`)
    } else {
      warnings.push('plugin.json 未定义任何功能')
      console.warn('  ⚠️  未定义任何功能')
    }
  }

  // 6. 统计文件和大小
  console.log('\n📊 统计信息...')

  function getDirectorySize(dir) {
    let size = 0
    const entries = fs.readdirSync(dir, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        size += getDirectorySize(fullPath)
      } else if (entry.isFile()) {
        size += fs.statSync(fullPath).size
      }
    }
    return size
  }

  function countFiles(dir) {
    let count = 0
    const entries = fs.readdirSync(dir, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        count += countFiles(fullPath)
      } else if (entry.isFile()) {
        count++
      }
    }
    return count
  }

  const totalSize = getDirectorySize(pluginDir)
  const totalFiles = countFiles(pluginDir)
  const preloadSize = getDirectorySize(path.join(pluginDir, 'preload'))
  const assetsSize = fs.existsSync(path.join(pluginDir, 'assets'))
    ? getDirectorySize(path.join(pluginDir, 'assets'))
    : 0

  console.log(`  总大小: ${(totalSize / 1024 / 1024).toFixed(2)} MB`)
  console.log(`  总文件数: ${totalFiles}`)
  console.log(`  preload 大小: ${(preloadSize / 1024 / 1024).toFixed(2)} MB`)
  console.log(`  assets 大小: ${(assetsSize / 1024).toFixed(2)} KB`)

  // 7. 输出结果
  console.log('\n' + '='.repeat(50))
  if (errors.length === 0 && warnings.length === 0) {
    console.log('✅ 验证通过！插件构建正确。')
  } else {
    if (errors.length > 0) {
      console.log(`\n❌ 发现 ${errors.length} 个错误：`)
      errors.forEach((err, i) => console.log(`  ${i + 1}. ${err}`))
    }
    if (warnings.length > 0) {
      console.log(`\n⚠️  发现 ${warnings.length} 个警告：`)
      warnings.forEach((warn, i) => console.log(`  ${i + 1}. ${warn}`))
    }
  }

  console.log('\n📝 下一步：')
  if (errors.length === 0) {
    console.log('  1. 在 uTools 中打开开发者工具')
    console.log('  2. 点击「添加」按钮')
    console.log(`  3. 选择目录: ${pluginDir}`)
    console.log('  4. 在 Console 中输入 window.services 验证注入是否成功')
  } else {
    console.log('  1. 修复上述错误')
    console.log('  2. 重新运行 npm run build:plugin')
    console.log('  3. 再次运行验证脚本')
  }

  process.exit(errors.length > 0 ? 1 : 0)
}

verifyPlugin().catch(console.error)
