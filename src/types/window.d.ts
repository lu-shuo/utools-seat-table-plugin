interface ExcelImportResult {
  success: boolean
  students?: Array<{ id: number; name: string }>
  count?: number
  error?: string
}

interface WindowServices {
  readFile(file: string): string
  writeTextFile(text: string): string
  writeImageFile(base64Url: string): string | undefined
  writeImageFileWithName(base64Url: string, fileName: string): string | undefined
  readExcelFile(filePath: string): ExcelImportResult
}

declare global {
  interface Window {
    services: WindowServices
    utools: any
  }
}

export {}
