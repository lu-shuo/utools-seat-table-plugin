export interface Seat {
  id: number
  row: number
  col: number
  studentId: number | null
  studentName: string | null
}

export interface Student {
  id: number
  name: string
  role?: 'master' | 'apprentice' | null  // 角色：师傅、徒弟或无
  masterId?: number | null  // 如果是徒弟，记录师傅的ID
  apprenticeIds?: number[]  // 如果是师傅，记录徒弟的ID列表
}
