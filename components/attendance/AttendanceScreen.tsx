"use client"

import { useEffect, useMemo, useState } from "react"
import service, { ClassAttendanceRow, AttendanceStatus, ClassAttendanceApiResponse } from "@/lib/api"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

type SimpleClass = { id: number; name: string; number?: string | null }

const statusToSymbol: Record<AttendanceStatus, { label: string; className: string }> = {
  present: { label: "+", className: "text-emerald-600" },
  absent: { label: "−", className: "text-rose-600" },
  late: { label: "g", className: "text-amber-600" },
  excused: { label: "ø", className: "text-sky-600" },
  unknown: { label: "", className: "text-muted-foreground" },
}

function toYyyyMmDd(iso: string) {
  return iso.slice(0, 10)
}

function getMonthDays(yyyyMm: string) {
  const [y, m] = yyyyMm.split("-").map((v) => parseInt(v, 10))
  const daysInMonth = new Date(y, m, 0).getDate()
  const list: string[] = []
  for (let d = 1; d <= daysInMonth; d++) {
    const ds = String(d).padStart(2, "0")
    list.push(`${yyyyMm}-${ds}`)
  }
  return list
}

export function AttendanceScreen() {
  const [classes, setClasses] = useState<SimpleClass[] | null>(null)
  const [selectedClassId, setSelectedClassId] = useState<string>("")
  const [month, setMonth] = useState<string>(() => {
    const now = new Date()
    const mm = String(now.getMonth() + 1).padStart(2, "0")
    return `${now.getFullYear()}-${mm}`
  })
  const [loading, setLoading] = useState(false)
  const [rows, setRows] = useState<ClassAttendanceRow[] | null>(null)

  const [days, setDays] = useState<string[]>([])
  const [sessionIdsByDate, setSessionIdsByDate] = useState<Record<string, number[]>>({})

  useEffect(() => {
    const loadClasses = async () => {
      try {
        const res = await service.getClasses()
        const list = (res?.data ?? []) as any[]
        setClasses(list.map((c) => ({ id: c.id, name: c.name, number: c.number ?? null })))
        if ((res?.data?.length ?? 0) > 0) {
          setSelectedClassId(String(res.data[0].id))
        }
      } catch {
        setClasses([])
      }
    }
    loadClasses()
  }, [])

  const loadAttendance = async () => {
    if (!selectedClassId) return
    setLoading(true)
    try {
      const res = await service.getClassAttendance({ classId: selectedClassId, month })
      const data = (res?.data ?? {}) as ClassAttendanceApiResponse

      // Month days for full grid
      const mdays = getMonthDays(month)
      setDays(mdays)

      // Build sessionId list by date (YYYY-MM-DD => number[])
      const sessions = (data.sessions ?? []).map((s) => ({ id: s.id, date: toYyyyMmDd(s.starts_at) }))
      const mapByDate: Record<string, number[]> = {}
      for (const s of sessions) {
        if (!mapByDate[s.date]) mapByDate[s.date] = []
        mapByDate[s.date].push(s.id)
      }
      setSessionIdsByDate(mapByDate)

      // Map records to per-student status map (sessionId -> status)
      const byStudent = new Map<number, { fullName: string; statusBySessionId: Map<number, AttendanceStatus> }>()
      for (const rec of data.records ?? []) {
        const m = new Map<number, AttendanceStatus>()
        for (const st of rec.statuses ?? []) m.set(st.sessionId, st.status)
        byStudent.set(rec.student.id, { fullName: rec.student.fullName, statusBySessionId: m })
      }

      // Prefer students list to include those with no records at all; then compute cells for EVERY day
      const students = (data.students ?? []).map((s) => ({ id: s.id, fullName: s.fullName }))
      const rows: ClassAttendanceRow[] = students.map((s) => {
        const info = byStudent.get(s.id)
        const cells = mdays.map((d) => {
          const sessionIds = mapByDate[d] ?? []
          if (sessionIds.length === 0) {
            return { date: d, status: "unknown" as AttendanceStatus }
          }
          // Aggregate statuses for all sessions in the day; priority: absent > present > late > excused > unknown
          const dayStatuses = sessionIds.map((sid) => info?.statusBySessionId.get(sid) ?? ("unknown" as AttendanceStatus))
          const pick = (order: AttendanceStatus[]) => order.find((st) => dayStatuses.includes(st))
          const chosen =
            pick(["absent", "present", "late", "excused", "unknown"]) ?? ("unknown" as AttendanceStatus)
          return { date: d, status: chosen }
        })
        return { studentId: s.id, fullName: s.fullName, cells }
      })

      setRows(rows)
    } catch (e) {
      setRows([])
      toast.error("Davranış cədvəli yüklənmədi")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadAttendance()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClassId, month])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="min-w-[220px]">
          <label className="block text-xs text-muted-foreground mb-1">Sinif</label>
          <Select value={selectedClassId} onValueChange={setSelectedClassId} disabled={!classes}>
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Sinif seçin" />
            </SelectTrigger>
            <SelectContent>
              {(classes ?? []).map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>
                  {c.name}
                  {c.number ? ` — ${c.number}` : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="block text-xs text-muted-foreground mb-1">Ay</label>
          <input
            className="h-10 rounded-md border bg-background px-3 text-sm"
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          />
        </div>
      </div>

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6">
              <Skeleton className="h-6 w-48 mb-4" />
              <Skeleton className="h-[280px] w-full" />
            </div>
          ) : (rows?.length ?? 0) === 0 ? (
            <div className="p-8 text-sm text-muted-foreground">Məlumat yoxdur</div>
          ) : (
            <div className="w-full overflow-auto">
              <table className="min-w-[900px] w-full border-collapse">
                <thead className="sticky top-0 bg-card z-10">
                  <tr>
                    <th className="text-left text-xs font-medium text-muted-foreground border-b px-3 py-2 sticky left-0 bg-card">
                      Tələbə
                    </th>
                    {days.map((d) => {
                      const day = d.split("-")[2]
                      return (
                        <th key={d} className="text-center text-xs font-medium text-muted-foreground border-b px-2 py-2">
                          {day}
                        </th>
                      )
                    })}
                  </tr>
                </thead>
                <tbody>
                  {(rows ?? []).map((r) => (
                    <tr key={r.studentId} className="odd:bg-accent/20">
                      <td className="whitespace-nowrap text-sm font-medium border-b px-3 py-2 sticky left-0 bg-background">
                        {r.fullName}
                      </td>
                      {days.map((d) => {
                        const cell = r.cells?.find((c) => c.date === d) ?? { status: "unknown" as AttendanceStatus }
                        const sym = statusToSymbol[cell.status]
                        return (
                          <td key={`${r.studentId}-${d}`} className={cn("text-center border-b px-2 py-1 text-sm", sym.className)}>
                            {sym.label}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default AttendanceScreen

