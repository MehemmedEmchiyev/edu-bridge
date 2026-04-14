"use client"

import { useEffect, useMemo, useState } from "react"
import service, { ClassAttendanceRow, AttendanceStatus, ClassAttendanceApiResponse } from "@/lib/api"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { az } from "date-fns/locale"
import { CalendarDays, CheckCircle2, Clock3, UserRoundX, Users } from "lucide-react"

type SimpleClass = { id: number; name: string; number?: string | null }

const statusToSymbol: Record<AttendanceStatus, { label: string; className: string; labelLong: string }> = {
  present: { label: "+", className: "text-emerald-600", labelLong: "İştirak" },
  absent: { label: "−", className: "text-rose-600", labelLong: "Qayıb" },
  late: { label: "g", className: "text-amber-600", labelLong: "Gecikmə" },
  excused: { label: "ø", className: "text-sky-600", labelLong: "Üzrlü" },
  unknown: { label: "—", className: "text-muted-foreground", labelLong: "Dərs yox / qeyd yoxdur" },
}

const statusBadgeClass: Record<AttendanceStatus, string> = {
  present: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
  absent: "bg-rose-500/10 text-rose-700 border-rose-500/20",
  late: "bg-amber-500/10 text-amber-700 border-amber-500/20",
  excused: "bg-sky-500/10 text-sky-700 border-sky-500/20",
  unknown: "bg-muted text-muted-foreground border-border",
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
  const selectedDayStats = useMemo(() => {
    const stats: Record<AttendanceStatus, number> = {
      present: 0,
      absent: 0,
      late: 0,
      excused: 0,
      unknown: 0,
    }
    for (const row of selectedDayRows) {
      stats[row.status] += 1
    }
    return stats
  }, [selectedDayRows])

  const overallStats = useMemo(() => {
    const totalStudents = rows?.length ?? 0
    const daysWithSession = days.filter((d) => (sessionIdsByDate[d]?.length ?? 0) > 0).length
    const avgAttendancePercent =
      totalStudents === 0 || daysWithSession === 0
        ? 0
        : Math.round(
            (rows!.reduce((acc, r) => {
              const positive = r.cells.filter(
                (c) =>
                  (sessionIdsByDate[c.date]?.length ?? 0) > 0 &&
                  (c.status === "present" || c.status === "late" || c.status === "excused"),
              ).length
              return acc + positive / daysWithSession
            }, 0) /
              totalStudents) *
              100,
          )
    return { totalStudents, daysWithSession, avgAttendancePercent }
  }, [rows, days, sessionIdsByDate])

  const monthlyMatrixRows = useMemo(() => {
    return (rows ?? []).map((row) => {
      const markByDate = new Map(
        row.cells.map((c) => [c.date, c.status === "present" ? "+" : "-"]),
      )
      const marks = days.map((day) => markByDate.get(day) ?? "-")
      return {
        studentId: row.studentId,
        fullName: row.fullName,
        marks,
      }
    })
  }, [rows, days])

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="rounded-2xl border-border/60">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Tələbə sayı</p>
              <p className="text-2xl font-semibold">{overallStats.totalStudents}</p>
            </div>
            <Users className="h-5 w-5 text-primary" />
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-border/60">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Dərs günləri</p>
              <p className="text-2xl font-semibold">{overallStats.daysWithSession}</p>
            </div>
            <CalendarDays className="h-5 w-5 text-primary" />
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-border/60">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Orta iştirak</p>
              <p className="text-2xl font-semibold">%{overallStats.avgAttendancePercent}</p>
            </div>
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-border/60">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Seçilmiş gün</p>
              <p className="text-sm font-medium">
                {selectedDate ? format(selectedDate, "d MMM yyyy", { locale: az }) : "—"}
              </p>
            </div>
            <Clock3 className="h-5 w-5 text-amber-600" />
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-end gap-4 flex-wrap">
        <div className="min-w-[260px]">
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
        <div className="grid gap-6 xl:grid-cols-[420px_1fr] items-start">
          <Card className="overflow-hidden w-full rounded-2xl border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-primary" />
                Ay təqvimi
              </CardTitle>
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

          <Card className="min-w-0 rounded-2xl border-border/60">
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
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 mb-4">
                <div className="rounded-xl border p-3 bg-emerald-500/5">
                  <p className="text-xs text-muted-foreground">İştirak</p>
                  <p className="text-lg font-semibold text-emerald-700">{selectedDayStats.present}</p>
                </div>
                <div className="rounded-xl border p-3 bg-amber-500/5">
                  <p className="text-xs text-muted-foreground">Gecikmə</p>
                  <p className="text-lg font-semibold text-amber-700">{selectedDayStats.late}</p>
                </div>
                <div className="rounded-xl border p-3 bg-rose-500/5">
                  <p className="text-xs text-muted-foreground">Qayıb</p>
                  <p className="text-lg font-semibold text-rose-700">{selectedDayStats.absent}</p>
                </div>
                <div className="rounded-xl border p-3 bg-sky-500/5">
                  <p className="text-xs text-muted-foreground">Üzrlü</p>
                  <p className="text-lg font-semibold text-sky-700">{selectedDayStats.excused}</p>
                </div>
              </div>

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
                            <td className="px-3 py-2 border-b text-center">
                              <Badge
                                variant="outline"
                                className={cn("text-xs", statusBadgeClass[r.status])}
                              >
                                {sym.labelLong}
                              </Badge>
                            </td>
                            <td className={cn("px-3 py-2 border-b hidden sm:table-cell text-muted-foreground", sym.className)}>
                              <span className="inline-flex items-center gap-1.5">
                                {r.status === "absent" ? <UserRoundX className="h-3.5 w-3.5" /> : null}
                                {sym.label}
                              </span>
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

      {(rows?.length ?? 0) > 0 ? (
        <Card className="rounded-2xl border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Ümumi baxış cədvəli</CardTitle>
            <CardDescription>
              Sinifdəki bütün tələbələr və ayın bütün günləri üzrə davamiyyət (`+` gəlib, `-` gəlməyib).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl border overflow-hidden">
              <div className="max-h-[520px] overflow-auto">
                <table className="w-full text-sm border-collapse">
                  <thead className="sticky top-0 bg-muted/80 backdrop-blur-sm z-[1]">
                    <tr>
                      <th className="text-left font-medium px-3 py-2 border-b sticky left-0 bg-muted/95 min-w-[220px]">
                        Tələbə
                      </th>
                      {days.map((day) => (
                        <th key={day} className="text-center font-medium px-2 py-2 border-b min-w-10">
                          {day.slice(-2)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {monthlyMatrixRows.map((r) => (
                      <tr key={r.studentId} className="odd:bg-accent/25">
                        <td className="px-3 py-2 border-b font-medium sticky left-0 bg-background min-w-[220px]">
                          {r.fullName}
                        </td>
                        {r.marks.map((mark, idx) => (
                          <td
                            key={`${r.studentId}-${days[idx]}`}
                            className={cn(
                              "px-2 py-2 border-b text-center font-semibold",
                              mark === "+" ? "text-emerald-700" : "text-rose-700",
                            )}
                          >
                            {mark}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="mt-3 text-xs text-muted-foreground flex items-center gap-4">
              <span className="inline-flex items-center gap-1">
                <span className="text-emerald-700 font-semibold">+</span> Gəlib
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="text-rose-700 font-semibold">-</span> Gəlməyib
              </span>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}

export default AttendanceScreen
