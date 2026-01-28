const fs = require('node:fs')
const path = require('node:path')
const XLSX = require('xlsx')

// 通过 window 对象向渲染进程注入 nodejs 能力
window.services = {
  // 读文件
  readFile (file) {
    return fs.readFileSync(file, { encoding: 'utf-8' })
  },
  // 文本写入到下载目录
  writeTextFile (text) {
    const filePath = path.join(window.utools.getPath('downloads'), Date.now().toString() + '.txt')
    fs.writeFileSync(filePath, text, { encoding: 'utf-8' })
    return filePath
  },
  // 图片写入到下载目录
  writeImageFile (base64Url) {
    const matchs = /^data:image\/([a-z]{1,20});base64,/i.exec(base64Url)
    if (!matchs) return
    const filePath = path.join(window.utools.getPath('downloads'), Date.now().toString() + '.' + matchs[1])
    fs.writeFileSync(filePath, base64Url.substring(matchs[0].length), { encoding: 'base64' })
    return filePath
  },
  // 图片写入到下载目录（支持自定义文件名）
  writeImageFileWithName (base64Url, fileName) {
    const matchs = /^data:image\/([a-z]{1,20});base64,/i.exec(base64Url)
    if (!matchs) return
    // 确保文件名安全（移除非法字符）
    const safeName = fileName.replace(/[<>:"/\\|?*]/g, '_')
    const filePath = path.join(window.utools.getPath('downloads'), safeName)
    fs.writeFileSync(filePath, base64Url.substring(matchs[0].length), { encoding: 'base64' })
    return filePath
  },
  // 读取 Excel 文件并解析学生数据
  readExcelFile (filePath) {
    try {
      const workbook = XLSX.readFile(filePath)
      const firstSheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[firstSheetName]

      // 转换为二维数组（包含标题行）
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })

      // 解析学生数据
      const students = []
      for (let i = 0; i < jsonData.length; i++) {
        const row = jsonData[i]
        if (!row || row.length < 2) continue

        const id = row[0]
        const name = row[1]

        // 跳过空行和标题行
        if (!id || !name) continue
        if (typeof id === 'string' && (id.includes('学号') || id.includes('编号') || id.includes('ID'))) continue

        students.push({
          id: typeof id === 'number' ? id : parseInt(id) || (i + 1),
          name: String(name).trim()
        })
      }

      return {
        success: true,
        students: students,
        count: students.length
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }
}
