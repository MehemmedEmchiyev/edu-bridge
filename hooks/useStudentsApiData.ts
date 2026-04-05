"use client"

import { useState, useEffect, useCallback } from "react"
import service from "@/lib/api"
import type { StudentRow } from "@/components/students/StudentsTable"

export function useStudentsApiData() {
  const [students, setStudents] = useState<StudentRow[]>([])
  const [apiClasses, setApiClasses] = useState<{ id: number; name: string }[]>([])
  const [initialLoading, setInitialLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchStudents = useCallback(async () => {
    setRefreshing(true)
    try {
      const res = await service.getStudents()
      setStudents(res.data ?? [])
    } finally {
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setInitialLoading(true)
      try {
        const [stRes, clRes] = await Promise.all([service.getStudents(), service.getClasses()])
        if (cancelled) return
        setStudents(stRes.data ?? [])
        const rows = clRes.data as { id: number; name: string }[] | undefined
        setApiClasses(rows ?? [])
      } catch {
        if (!cancelled) {
          setStudents([])
          setApiClasses([])
        }
      } finally {
        if (!cancelled) setInitialLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return { students, apiClasses, fetchStudents, initialLoading, refreshing }
}
