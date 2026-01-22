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
}
