"use client"

import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"
import service, { type StudentCourseRemovalRow } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Loader2, RotateCcw, UserMinus } from "lucide-react"

function formatRemovalDate(iso: string | undefined) {
  if (!iso?.trim()) return "—"
  try {
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return "—"
    return d.toLocaleString("az-AZ", {
      dateStyle: "medium",
      timeStyle: "short",
    })
  } catch {
    return "—"
  }
}

export function RemovedStudentsScreen() {
  const [rows, setRows] = useState<StudentCourseRemovalRow[]>([])
  const [loading, setLoading] = useState(true)
  const [restoringId, setRestoringId] = useState<number | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [removalsRes, studentsRes] = await Promise.all([
        service.getStudentCourseRemovals(),
        service.getStudents(),
      ])
      const activeStudentIds = new Set<number>(
        (Array.isArray(studentsRes.data) ? studentsRes.data : [])
          .map((s: unknown) =>
            s && typeof s === "object" && "id" in s ? Number((s as { id?: unknown }).id) : NaN,
          )
          .filter((id) => Number.isFinite(id)),
      )

      const filtered = (removalsRes.data ?? []).filter(
        (r) => !(r.studentUserId != null && activeStudentIds.has(r.studentUserId)),
      )
      setRows(filtered)
    } catch (e: unknown) {
      const msg =
        e && typeof e === "object" && "response" in e
          ? (e as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined
      toast.error("Siyahı yüklənmədi", { description: typeof msg === "string" ? msg : "Yenidən cəhd edin." })
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const handleRestore = useCallback(async (row: StudentCourseRemovalRow) => {
    if (restoringId !== null) return
    if (row.studentUserId == null) {
      toast.error("Tələbə ID tapılmadı")
      return
    }

    setRestoringId(row.id)
    try {
      await service.restoreStudentToCourse({ studentUserId: row.studentUserId })
      toast.success("Tələbə kursa geri qaytarıldı")
      await load()
    } catch (e: unknown) {
      const msg =
        e && typeof e === "object" && "response" in e
          ? (e as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined
      toast.error("Geri qaytarmaq mümkün olmadı", {
        description: typeof msg === "string" ? msg : "Yenidən cəhd edin.",
      })
    } finally {
      setRestoringId(null)
    }
  }, [load, restoringId])

  return (
    <div className="flex flex-col gap-6 min-w-0">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Kursdan çıxan tələbələr</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Kursdan çıxarılan tələbələrin siyahısı və admin qeydi.
        </p>
      </div>

      <Card className="rounded-2xl border-border/60">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <UserMinus className="h-5 w-5 text-muted-foreground" />
            Çıxarma tarixçəsi
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Yüklənir...
            </div>
          ) : rows.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">Hələ qeyd yoxdur.</p>
          ) : (
            <div className="rounded-xl border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Çıxma tarixi</TableHead>
                    <TableHead>Tələbə</TableHead>
                    <TableHead className="min-w-[200px]">Qeyd (səbəb)</TableHead>
                    <TableHead className="hidden lg:table-cell">Çıxaran</TableHead>
                      <TableHead className="text-right">Əməliyyat</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="text-muted-foreground whitespace-nowrap text-sm">
                        {formatRemovalDate(r.removedAt || r.createdAt)}
                      </TableCell>
                      <TableCell className="font-medium">
                        {r.studentFullNameSnapshot?.trim() || "—"}
                        
                      </TableCell>
                      <TableCell className="text-sm align-top max-w-md whitespace-pre-wrap">{r.note}</TableCell>
                      <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                        {r.removedByAdminName?.trim() || "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => void handleRestore(r)}
                          disabled={restoringId !== null || r.studentUserId == null}
                        >
                          {restoringId === r.id ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                              Qaytarılır...
                            </>
                          ) : (
                            <>
                              <RotateCcw className="h-4 w-4 mr-1.5" />
                              Kursa qaytar
                            </>
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
