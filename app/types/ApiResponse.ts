export type ApiResponse<T> = {
  success: boolean
  errorCode: string | number | null
  data: T
  message: string
}