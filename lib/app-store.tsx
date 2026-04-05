"use client"

import React, { createContext, useContext, useState, useCallback } from "react"
import {
  type Course, type Teacher, type Class, type Student, type Invoice,
  initialCourses, initialTeachers, initialClasses, initialStudents, initialInvoices,
} from "@/lib/genereal-types"

interface AppState {
  courses: Course[]
  teachers: Teacher[]
  classes: Class[]
  students: Student[]
  invoices: Invoice[]
  activeCourseId: string
  activeScreen: string
  isLoggedIn: boolean
}

interface AppContextType extends AppState {
  setActiveCourseId: (id: string) => void
  setActiveScreen: (screen: string) => void
  login: () => void
  logout: () => void
  addTeacher: (t: Omit<Teacher, "id">) => void
  updateTeacher: (id: string, updates: Partial<Teacher>) => void
  addClass: (c: Omit<Class, "id">) => void
  updateClass: (id: string, updates: Partial<Class>) => void
  addStudent: (s: Omit<Student, "id">) => void
  updateStudent: (id: string, updates: Partial<Student>) => void
  enrollStudent: (studentId: string, classIds: string[]) => void
  updateInvoiceStatus: (id: string, status: Invoice["status"]) => void
  generateInvoices: (studentId: string, months: number[], amount: number) => void
  processFullPayment: (studentId: string, startDate: string, endDate: string) => void
  resetData: () => void
}

const AppContext = createContext<AppContextType | null>(null)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>({
    courses: initialCourses,
    teachers: initialTeachers,
    classes: initialClasses,
    students: initialStudents,
    invoices: initialInvoices,
    activeCourseId: "c1",
    activeScreen: "teachers",
    isLoggedIn: false,
  })

  const setActiveCourseId = useCallback((id: string) => {
    setState((s) => ({ ...s, activeCourseId: id }))
  }, [])

  const setActiveScreen = useCallback((screen: string) => {
    setState((s) => ({ ...s, activeScreen: screen }))
  }, [])

  const login = useCallback(() => {
    setState((s) => ({ ...s, isLoggedIn: true }))
  }, [])

  const logout = useCallback(() => {
    setState((s) => ({ ...s, isLoggedIn: false, activeScreen: "teachers" }))
  }, [])

  const addTeacher = useCallback((t: Omit<Teacher, "id">) => {
    setState((s) => ({
      ...s,
      teachers: [...s.teachers, { ...t, id: `t${Date.now()}` }],
    }))
  }, [])

  const updateTeacher = useCallback((id: string, updates: Partial<Teacher>) => {
    setState((s) => ({
      ...s,
      teachers: s.teachers.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    }))
  }, [])

  const updateClass = useCallback((id: string, updates: Partial<Class>) => {
    setState((s) => ({
      ...s,
      classes: s.classes.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    }))
  }, [])

  const addClass = useCallback((c: Omit<Class, "id">) => {
    setState((s) => ({
      ...s,
      classes: [...s.classes, { ...c, id: `cl${Date.now()}` }],
    }))
  }, [])

  const addStudent = useCallback((st: Omit<Student, "id">) => {
    setState((s) => ({
      ...s,
      students: [...s.students, { ...st, id: `s${Date.now()}` }],
    }))
  }, [])

  const updateStudent = useCallback((id: string, updates: Partial<Student>) => {
    setState((s) => ({
      ...s,
      students: s.students.map((st) => (st.id === id ? { ...st, ...updates } : st)),
    }))
  }, [])

  const enrollStudent = useCallback((studentId: string, classIds: string[]) => {
    setState((s) => {
      const courseIds = classIds.map(
        (cid) => s.classes.find((cl) => cl.id === cid)?.courseId || ""
      )
      return {
        ...s,
        students: s.students.map((st) =>
          st.id === studentId
            ? {
              ...st,
              classIds: [...new Set([...st.classIds, ...classIds])],
              courseIds: [...new Set([...st.courseIds, ...courseIds])],
            }
            : st
        ),
        classes: s.classes.map((cl) =>
          classIds.includes(cl.id) ? { ...cl, enrolled: cl.enrolled + 1 } : cl
        ),
      }
    })
  }, [])

  const updateInvoiceStatus = useCallback((id: string, status: Invoice["status"]) => {
    setState((s) => ({
      ...s,
      invoices: s.invoices.map((inv) => (inv.id === id ? { ...inv, status } : inv)),
    }))
  }, [])

  const generateInvoices = useCallback((studentId: string, months: number[], amount: number) => {
    setState((s) => {
      const newInvoices: Invoice[] = months.map((month) => ({
        id: `inv-${studentId}-gen-${month}-${Date.now()}`,
        studentId,
        amount,
        status: "unpaid" as const,
        dueDate: `2026-${String(month).padStart(2, "0")}-15`,
        createdAt: new Date().toISOString().split("T")[0],
        description: `Tuition - ${new Date(2026, month - 1).toLocaleString("en", { month: "long" })} 2026`,
      }))
      return { ...s, invoices: [...s.invoices, ...newInvoices] }
    })
  }, [])

  const processFullPayment = useCallback((studentId: string, startDate: string, endDate: string) => {
    setState((s) => ({
      ...s,
      invoices: s.invoices.map((inv) => {
        if (inv.studentId !== studentId) return inv
        if (inv.status === "cancelled") return inv
        if (inv.dueDate >= startDate && inv.dueDate <= endDate) {
          return { ...inv, status: "paid" as const }
        }
        return inv
      }),
    }))
  }, [])

  const resetData = useCallback(() => {
    setState({
      courses: initialCourses,
      teachers: initialTeachers,
      classes: initialClasses,
      students: initialStudents,
      invoices: initialInvoices,
      activeCourseId: "c1",
      activeScreen: "teachers",
      isLoggedIn: true,
    })
  }, [])

  return (
    <AppContext.Provider
      value={{
        ...state,
        setActiveCourseId,
        setActiveScreen,
        login,
        logout,
        addTeacher,
        updateTeacher,
        addClass,
        updateClass,
        addStudent,
        updateStudent,
        enrollStudent,
        updateInvoiceStatus,
        generateInvoices,
        processFullPayment,
        resetData,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error("useApp must be used within AppProvider")
  return ctx
}
