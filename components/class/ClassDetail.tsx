"use client"

import { useRouter } from "next/navigation"
import { Receipt } from "lucide-react"
import { ClassDetailProps } from "@/types/class-types.type"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"

const DAYS = [
  "Bazar ertəsi",
  "Çərşənbə axşamı",
  "Çərşənbə",
  "Cümə axşamı",
  "Cümə",
  "Şənbə",
  "Bazar",
]

const ClassDetail = ({ detailClass, setDetailClass }: ClassDetailProps) => {
  const router = useRouter()
  const schedules = detailClass
    ? [...(detailClass.schedules ?? [])].sort((a, b) => a.day_of_week - b.day_of_week)
    : []
  const scheduleSummary =
    schedules.length > 0
      ? schedules
          .map((s) => {
            const day = DAYS[s.day_of_week - 1] ?? `Gün ${s.day_of_week}`
            return `${day} ${s.start_time?.slice(0, 5) ?? "?"}–${s.end_time?.slice(0, 5) ?? "?"}`
          })
          .join(" · ")
      : "Cədvəl təyin edilməyib"

  const first = schedules[0]

  return (
    <Dialog open={!!detailClass} onOpenChange={(open) => !open && setDetailClass(null)}>
      <DialogContent className="max-w-2xl rounded-2xl max-h-[85vh] overflow-y-auto w-[calc(100vw-2rem)] sm:w-full min-w-0">
        {detailClass && (
          <>
            <DialogHeader className="min-w-0">
              <DialogTitle className="break-words pr-8">
                {detailClass.name}
                {detailClass.number != null && detailClass.number !== "" && (
                  <span className="text-muted-foreground font-normal"> — {detailClass.number}</span>
                )}
              </DialogTitle>
              <DialogDescription className="text-left text-sm text-muted-foreground break-words">{scheduleSummary}</DialogDescription>
            </DialogHeader>

            {detailClass.specialization ? (
              <p className="text-sm text-muted-foreground -mt-1 break-words">{detailClass.specialization}</p>
            ) : null}

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 my-2 min-w-0">
              <div className="rounded-xl bg-muted/50 p-3 text-center min-w-0">
                <p className="text-2xl font-semibold text-foreground tabular-nums">{detailClass.studentCount ?? 0}</p>
                <p className="text-xs text-muted-foreground">Qeydiyyatlı</p>
              </div>
              <div className="rounded-xl bg-muted/50 p-3 text-center min-w-0">
                <p className="text-2xl font-semibold text-foreground tabular-nums">{detailClass.classTeachers?.length ?? 0}</p>
                <p className="text-xs text-muted-foreground">Müəllim</p>
              </div>
              <div className="rounded-xl bg-muted/50 p-3 text-center min-w-0">
                <p className="text-2xl font-semibold text-foreground tabular-nums">
                  {first ? first.start_time.slice(0, 5) : "—"}
                </p>
                <p className="text-xs text-muted-foreground">Başlama</p>
              </div>
              <div className="rounded-xl bg-muted/50 p-3 text-center min-w-0">
                <p className="text-2xl font-semibold text-foreground tabular-nums">{first ? first.end_time.slice(0, 5) : "—"}</p>
                <p className="text-xs text-muted-foreground">Bitmə</p>
              </div>
            </div>

            <div className="min-w-0">
              <h4 className="text-sm font-medium text-foreground mb-2">Təyin edilmiş müəllimlər</h4>
              {(detailClass.classTeachers?.length ?? 0) === 0 ? (
                <p className="text-sm text-muted-foreground py-2">Müəllim təyin edilməyib.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {detailClass.classTeachers.map((t) => (
                    <div key={t.id} className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 min-w-0 max-w-full">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                        {t.full_name
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground leading-none truncate">{t.full_name}</p>
                        <p className="text-xs text-muted-foreground truncate">{t.specialty ?? "—"}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="min-w-0">
              <h4 className="text-sm font-medium text-foreground mb-2">Bu sinifdəki tələbələr</h4>
              {!detailClass.students?.length ? (
                <p className="text-sm text-muted-foreground py-4 text-center">Hələ tələbə qeydiyyatı yoxdur.</p>
              ) : (
                <div className="rounded-lg border overflow-x-auto max-w-full">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ad</TableHead>
                        <TableHead className="hidden sm:table-cell">E-poçt</TableHead>
                        <TableHead className="hidden sm:table-cell">Telefon</TableHead>
                        <TableHead className="text-right w-[1%] whitespace-nowrap">Faktura</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {detailClass.students.map((s) => (
                        <TableRow key={s.id}>
                          <TableCell className="font-medium max-w-[140px] truncate sm:max-w-none">{s.full_name}</TableCell>
                          <TableCell className="hidden sm:table-cell text-muted-foreground max-w-[200px] truncate">
                            {s.email ?? "—"}
                          </TableCell>
                          <TableCell className="hidden sm:table-cell text-muted-foreground">{s.phone || "Tapılmadı"}</TableCell>
                          <TableCell className="text-right p-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              title="Fakturaya bax"
                              className="gap-1.5 h-8 text-xs shrink-0"
                              onClick={() => {
                                router.push(`/billing?studentId=${s.id}&classId=${detailClass.id}`)
                                setDetailClass(null)
                              }}
                            >
                              <Receipt className="h-3.5 w-3.5 shrink-0" aria-hidden />
                              <span className="hidden sm:inline">Fakturaya bax</span>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default ClassDetail
