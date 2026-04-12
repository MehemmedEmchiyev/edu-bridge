"use client"

import { useEffect, useMemo, useState } from "react"
import service, { ClassAttendanceRow, AttendanceStatus, ClassAttendanceApiResponse } from "@/lib/api"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Calendar } from "@/components/ui/calendar"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { az } from "date-fns/locale"

type SimpleClass = { id: number; name: string; number?: string | null }

const statusToSymbol: Record<AttendanceStatus, { label: string; className: string; labelLong: string }> = {
  present: { label: "+", className: "text-emerald-600", labelLong: "İştirak" },
  absent: { label: "−", className: "text-rose-600", labelLong: "Qayıb" },
  late: { label: "g", className: "text-amber-600", labelLong: "Gecikmə" },
  excused: { label: "ø", className: "text-sky-600", labelLong: "Üzrlü" },
  unknown: { label: "—", className: "text-muted-foreground", labelLong: "Dərs yox / qeyd yoxdur" },
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

function monthStrToDate(yyyyMm: string): Date {
  const [y, mo] = yyyyMm.split("-").map((v) => parseInt(v, 10))
  return new Date(y, mo - 1, 1)
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
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)

  useEffect(() => {
    const loadClasses = async () => {
      try {
        const res = await service.getClasses()
        const list = (res?.data ?? []) as { id: number; name: string; number?: string | null }[]
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

      const mdays = getMonthDays(month)
      setDays(mdays)

      const sessions = (data.sessions ?? []).map((s) => ({ id: s.id, date: toYyyyMmDd(s.starts_at) }))
      const mapByDate: Record<string, number[]> = {}
      for (const s of sessions) {
        if (!mapByDate[s.date]) mapByDate[s.date] = []
        mapByDate[s.date].push(s.id)
      }
      setSessionIdsByDate(mapByDate)

      const byStudent = new Map<number, { fullName: string; statusBySessionId: Map<number, AttendanceStatus> }>()
      for (const rec of data.records ?? []) {
        const m = new Map<number, AttendanceStatus>()
        for (const st of rec.statuses ?? []) m.set(st.sessionId, st.status)
        byStudent.set(rec.student.id, { fullName: rec.student.fullName, statusBySessionId: m })
      }

      const students = (data.students ?? []).map((s) => ({ id: s.id, fullName: s.fullName }))
      const nextRows: ClassAttendanceRow[] = students.map((s) => {
        const info = byStudent.get(s.id)
        const cells = mdays.map((d) => {
          const sessionIds = mapByDate[d] ?? []
          if (sessionIds.length === 0) {
            return { date: d, status: "unknown" as AttendanceStatus }
          }
          const dayStatuses = sessionIds.map((sid) => info?.statusBySessionId.get(sid) ?? ("unknown" as AttendanceStatus))
          const pick = (order: AttendanceStatus[]) => order.find((st) => dayStatuses.includes(st))
          const chosen =
            pick(["absent", "present", "late", "excused", "unknown"]) ?? ("unknown" as AttendanceStatus)
          return { date: d, status: chosen }
        })
        return { studentId: s.id, fullName: s.fullName, cells }
      })

      setRows(nextRows)

      const today = format(new Date(), "yyyy-MM-dd")
      const firstWithSession = mdays.find((d) => (mapByDate[d]?.length ?? 0) > 0)
      const pick = mdays.includes(today) ? today : firstWithSession ?? mdays[0]
      if (pick) {
        const [yy, mm, dd] = pick.split("-").map((x) => parseInt(x, 10))
        setSelectedDate(new Date(yy, mm - 1, dd))
      }
    } catch {
      setRows([])
      toast.error("Davamiyyət yüklənmədi")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadAttendance()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClassId, month])

  const selectedDayKey = selectedDate ? format(selectedDate, "yyyy-MM-dd") : ""

  const selectedDayRows = useMemo(() => {
    if (!selectedDayKey || !rows?.length) return []
    return rows.map((r) => {
      const cell = r.cells?.find((c) => c.date === selectedDayKey) ?? { status: "unknown" as AttendanceStatus }
      return { studentId: r.studentId, fullName: r.fullName, status: cell.status }
    })
  }, [rows, selectedDayKey])

  /** Təqvim üçün: dərsi olan günlər və iştirak faizi (rəng üçün) */
  const { hasSessionDates, goodDates, weakDates } = useMemo(() => {
    const hasSession: Date[] = []
    const good: Date[] = []
    const weak: Date[] = []
    const studentCount = rows?.length ?? 0

    for (const d of days) {
      if ((sessionIdsByDate[d]?.length ?? 0) === 0) continue
      const [yy, mm, dd] = d.split("-").map((x) => parseInt(x, 10))
      const dt = new Date(yy, mm - 1, dd)
      hasSession.push(dt)

      if (studentCount === 0) continue
      let positive = 0
      for (const r of rows ?? []) {
        const cell = r.cells?.find((c) => c.date === d)
        const st = cell?.status ?? "unknown"
        if (st === "present" || st === "late" || st === "excused") positive++
      }
      const pct = (positive / studentCount) * 100
      if (pct >= 75) good.push(dt)
      else if (pct < 50) weak.push(dt)
    }

    return { hasSessionDates: hasSession, goodDates: good, weakDates: weak }
  }, [days, sessionIdsByDate, rows])

  const sessionOnSelected = selectedDayKey ? (sessionIdsByDate[selectedDayKey]?.length ?? 0) > 0 : false

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-end gap-4 flex-wrap">
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
        <p className="text-xs text-muted-foreground pb-2 max-w-md">
          Ayı təqvimdə dəyişin; gün seçəndə həmin günün davamiyyəti aşağıda göstərilir.
        </p>
      </div>

      {loading ? (
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-6 w-48 mb-4" />
            <Skeleton className="h-[320px] w-full max-w-md" />
          </CardContent>
        </Card>
      ) : (rows?.length ?? 0) === 0 ? (
        <Card>
          <CardContent className="p-8 text-sm text-muted-foreground">Məlumat yoxdur</CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,420px)_1fr] items-start">
          <Card className="overflow-hidden w-full max-w-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Ay təqvimi</CardTitle>
              <CardDescription>
                Dərs olan günlər işarəlidir; yaşıl — yüksək iştirak, narıncı — aşağı.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center pb-4 pt-0">
              <Calendar
                mode="single"
                locale={az}
                selected={selectedDate}
                onSelect={(d) => setSelectedDate(d ?? undefined)}
                month={monthStrToDate(month)}
                onMonthChange={(d) => setMonth(format(d, "yyyy-MM"))}
                modifiers={{
                  hasSession: hasSessionDates,
                  goodAttendance: goodDates,
                  weakAttendance: weakDates,
                }}
                modifiersClassNames={{
                  hasSession:
                    "relative font-medium after:absolute after:bottom-0.5 after:left-1/2 after:-translate-x-1/2 after:size-1 after:rounded-full after:bg-primary/80",
                  goodAttendance: "bg-emerald-500/15 dark:bg-emerald-500/20",
                  weakAttendance: "bg-amber-500/15 dark:bg-amber-500/20",
                }}
                className="rounded-xl border bg-card p-2"
              />
            </CardContent>
          </Card>

          <Card className="min-w-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">
                {selectedDate
                  ? format(selectedDate, "d MMMM yyyy", { locale: az })
                  : "Gün seçin"}
              </CardTitle>
              <CardDescription>
                {sessionOnSelected
                  ? "Seçilmiş gün üçün tələbələr."
                  : "Bu tarixdə bu sinif üzrə dərs sessiyası yoxdur."}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="rounded-xl border overflow-hidden">
                <div className="max-h-[min(60vh,520px)] overflow-y-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead className="sticky top-0 bg-muted/80 backdrop-blur-sm z-[1]">
                      <tr>
                        <th className="text-left font-medium px-3 py-2 border-b">Tələbə</th>
                        <th className="text-center font-medium px-3 py-2 border-b w-24">Status</th>
                        <th className="text-left font-medium px-3 py-2 border-b hidden sm:table-cell">
                          Açıqlama
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedDayRows.map((r) => {
                        const sym = statusToSymbol[r.status]
                        return (
                          <tr key={r.studentId} className="odd:bg-accent/25">
                            <td className="px-3 py-2 border-b font-medium">{r.fullName}</td>
                            <td
                              className={cn(
                                "px-3 py-2 border-b text-center text-base font-semibold",
                                sym.className,
                              )}
                            >
                              {sym.label}
                            </td>
                            <td className={cn("px-3 py-2 border-b hidden sm:table-cell text-muted-foreground", sym.className)}>
                              {sym.labelLong}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted-foreground">
                <span>
                  <span className="text-emerald-600 font-semibold">+</span> İştirak
                </span>
                <span>
                  <span className="text-rose-600 font-semibold">−</span> Qayıb
                </span>
                <span>
                  <span className="text-amber-600 font-semibold">g</span> Gecikmə
                </span>
                <span>
                  <span className="text-sky-600 font-semibold">ø</span> Üzrlü
                </span>
                <span>— Dərs yox / qeyd yoxdur</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

export default AttendanceScreen
