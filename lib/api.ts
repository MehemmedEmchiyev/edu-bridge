import { CreateTeacher, UpdateTeacherPayload } from "@/types/create-teacher.type"
import { uiInvoiceStatusToApi } from "@/lib/invoice-normalize"
import axios from "axios"

export const apiBaseUrl =
  typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL
    : "http://localhost:3000"

axios.interceptors.request.use((config) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") || "" : ""
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export type CreateClassPayload = {
  name: string
  number?: string
  specialization?: string
  teacherUserIds: number[]
  schedule: { dayOfWeek: number; startTime: string; endTime: string }[]
}

/** PATCH /admin/classes/:id — bütün sahələr opsional; göndərilənlər yenilənir */
export type UpdateClassPayload = {
  name?: string
  number?: string
  specialization?: string
  teacherUserIds?: number[]
  schedule?: { dayOfWeek: number; startTime: string; endTime: string }[]
}

const upload = async (data: FormData) => {
  const res = await axios.post(`${apiBaseUrl}/upload`, data)
  return res
}
const login = async (params: { emailOrPhone: string; password: string }) => {
  const res = await axios.post(`${apiBaseUrl}/admin/login`, params)
  return res
}
const getTeachers = async () => {
  const res = await axios.get(`${apiBaseUrl}/admin/teachers`)
  return res
}
const getTeacherProfile = async (id: number | string) => {
  const res = await axios.get(`${apiBaseUrl}/admin/teachers/${id}`)
  return res
}
const createTeacher = async (params: CreateTeacher) => {
  const res = await axios.post(`${apiBaseUrl}/admin/teachers`, params)
  return res
}
const updateTeacher = async (id: number | string, params: UpdateTeacherPayload) => {
  const res = await axios.patch(`${apiBaseUrl}/admin/teachers/${id}`, params)
  return res
}
const deleteTeacher = async (id: number | string) => {
  const res = await axios.delete(`${apiBaseUrl}/admin/teachers/${id}`)
  return res
}
const createClass = async (params: CreateClassPayload) => {
  const res = await axios.post(`${apiBaseUrl}/admin/classes`, params)
  return res
}
const updateClass = async (id: number | string, params: UpdateClassPayload) => {
  const res = await axios.patch(`${apiBaseUrl}/admin/classes/${id}`, params)
  return res
}
const deleteClass = async (id: number | string) => {
  const res = await axios.delete(`${apiBaseUrl}/admin/classes/${id}`)
  return res
}
const getClasses = async () => {
  const res = await axios.get(`${apiBaseUrl}/admin/classes`)
  return res
}
const getClassDetails = async (classId: number | string) => {
  const res = await axios.get(`${apiBaseUrl}/admin/classes/details`, { params: { classId } })
  return res
}
const searchClasses = async (name: string) => {
  const res = await axios.get(`${apiBaseUrl}/admin/classes/search`, { params: { name } })
  return res
}
const getClassStudents = async (id: number | string) => {
  const res = await axios.get(`${apiBaseUrl}/admin/classes/${id}/students`)
  return res
}
const getStudents = async () => {
  const res = await axios.get(`${apiBaseUrl}/admin/students`)
  return res
}
export type UpsertStudentPayload = {
  studentId?: number
  classIds: number[]
  firstName: string
  lastName: string
  email?: string
  phone?: string
  password?: string
  monthlyFee: number
  startMonth: string
}

const upsertStudent = async (params: UpsertStudentPayload) => {
  const res = await axios.post(`${apiBaseUrl}/admin/students`, params)
  return res
}

const deleteStudent = async (id: number | string) => {
  const res = await axios.delete(`${apiBaseUrl}/admin/students/${id}`)
  return res
}
const enrollStudentToClasses = async (params: {
  studentUserId: number
  classes: { classId: number; monthlyFee: number; startMonth: string }[]
}) => {
  const res = await axios.post(`${apiBaseUrl}/admin/students/enroll`, params)
  return res
}
const getStudentInvoices = async (studentId: number | string) => {
  const res = await axios.get(`${apiBaseUrl}/admin/students/${studentId}/invoices`)
  return res
}

/** Gələcək: statistika paneli üçün ay üzrə bütün fakturalar bir cavabda (dashboard N+1 sorğunu əvəz edir). */
const getDashboardSummary = async (month?: string) => {
  const res = await axios.get(`${apiBaseUrl}/admin/dashboard/summary`, {
    params: month ? { month } : {},
  })
  return res
}
const generateStudentInvoices = async (
  studentId: number | string,
  body: { classId: number | string; startMonth: string; monthsCount?: number },
) => {
  const res = await axios.post(`${apiBaseUrl}/admin/students/${studentId}/invoices/generate`, body)
  return res
}
const updateInvoiceStatus = async (invoiceId: number | string, body: { status: string; method?: string }) => {
  const res = await axios.patch(`${apiBaseUrl}/admin/invoices/${invoiceId}`, {
    status: uiInvoiceStatusToApi(body.status),
    method: body.method,
  })
  return res
}
const processFullPayment = async (
  studentId: number | string,
  body: { classId: number | string; method: string },
) => {
  const res = await axios.post(`${apiBaseUrl}/admin/students/${studentId}/full-payment`, body)
  return res
}
const upsertSession = async (body: Record<string, unknown>) => {
  const res = await axios.post(`${apiBaseUrl}/admin/sessions`, body)
  return res
}

export type CourseSpecialization = {
  id: number
  courseId: number
  name: string
  sortOrder: number
  createdAt: string
  updatedAt: string
}

const getSpecializations = async () => {
  const res = await axios.get<CourseSpecialization[]>(`${apiBaseUrl}/admin/specializations`)
  return res
}
const createSpecialization = async (body: { name: string }) => {
  const res = await axios.post(`${apiBaseUrl}/admin/specializations`, body)
  return res
}
const updateSpecialization = async (id: number | string, body: { name: string }) => {
  const res = await axios.patch(`${apiBaseUrl}/admin/specializations/${id}`, body)
  return res
}
const deleteSpecialization = async (id: number | string) => {
  const res = await axios.delete(`${apiBaseUrl}/admin/specializations/${id}`)
  return res
}

const service = {
  upload,
  login,
  getTeachers,
  getTeacherProfile,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  createClass,
  updateClass,
  deleteClass,
  getStudents,
  upsertStudent,
  deleteStudent,
  enrollStudentToClasses,
  getStudentInvoices,
  getDashboardSummary,
  generateStudentInvoices,
  updateInvoiceStatus,
  processFullPayment,
  getClasses,
  getClassDetails,
  searchClasses,
  getClassStudents,
  upsertSession,
  getSpecializations,
  createSpecialization,
  updateSpecialization,
  deleteSpecialization,
}

export default service
