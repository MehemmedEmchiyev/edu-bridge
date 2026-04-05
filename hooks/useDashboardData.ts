"use client"

import service from "@/lib/api"
import { normalizeInvoiceFromApi, type UiInvoice } from "@/lib/invoice-normalize"
import { buildDashboardSnapshot, formatMonthKey, type DashboardSnapshot } from "@/lib/dashboard-stats"
import { useCallback, useEffect, useMemo, useState } from "react"

type StudentLite = { id: number; fullName?: string; name?: string; classes?: { classId?: number }[] }

export function useDashboardData() {
  const [monthKey, setMonthKey] = useState(() => formatMonthKey(new Date()))
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [teachersCount, setTeachersCount] = useState(0)
  const [classesCount, setClassesCount] = useState(0)
  const [totalClassStudents, setTotalClassStudents] = useState(0)
  const [students, setStudents] = useState<StudentLite[]>([])
  const [allInvoices, setAllInvoices] = useState<UiInvoice[]>([])

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)
    try {
      const [tRes, sRes, cRes] = await Promise.all([
        service.getTeachers(),
        service.getStudents(),
        service.getClasses(),
      ])
      const teacherRows = (tRes.data ?? []) as unknown[]
      const studentRows = (sRes.data ?? []) as StudentLite[]
      const classRows = (cRes.data ?? []) as { studentCount?: number }[]

      setTeachersCount(teacherRows.length)
      setClassesCount(classRows.length)
      setTotalClassStudents(classRows.reduce((a, c) => a + (typeof c.studentCount === "number" ? c.studentCount : 0), 0))
      setStudents(studentRows)

      const invoiceBatches = await Promise.all(
        studentRows.map(async (s) => {
          try {
            const res = await service.getStudentInvoices(s.id)
            const raw = (res.data || []) as Record<string, unknown>[]
            return raw.map((r) => normalizeInvoiceFromApi(r))
          } catch {
            return [] as UiInvoice[]
          }
        }),
      )
      setAllInvoices(invoiceBatches.flat())
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    void load(false)
  }, [load])

  const snapshot: DashboardSnapshot = useMemo(
    () => buildDashboardSnapshot(allInvoices, students, monthKey),
    [allInvoices, students, monthKey],
  )

  return {
    monthKey,
    setMonthKey,
    loading,
    refreshing,
    teachersCount,
    classesCount,
    totalClassStudents,
    studentsCount: students.length,
    snapshot,
    reload: () => void load(true),
  }
}
