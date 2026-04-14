"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Loader2 } from "lucide-react"

type ClassOption = { id: number; name: string }

type StudentBrief = {
  id: number
  fullName?: string
  name?: string
  classes?: { className: string; classId?: number }[]
}

type Props = {
  open: boolean
  onOpenChange: (v: boolean) => void
  student: StudentBrief | null
  apiClasses: ClassOption[]
  enrollClassIds: number[]
  setEnrollClassIds: React.Dispatch<React.SetStateAction<number[]>>
  enrollRemoveClassIds: number[]
  setEnrollRemoveClassIds: React.Dispatch<React.SetStateAction<number[]>>
  enrollMonthlyFee: string
  setEnrollMonthlyFee: (v: string) => void
  enrollStartMonth: string
  setEnrollStartMonth: (v: string) => void
  onConfirm: () => void
  isSubmitting?: boolean
}

function isEnrolledInClass(student: StudentBrief | null | undefined, cls: ClassOption): boolean {
  const list = student?.classes ?? []
  return list.some(
    (c) =>
      (typeof c.classId === "number" && c.classId > 0 && c.classId === cls.id) ||
      c.className.trim() === cls.name.trim(),
  )
}

export function StudentEnrollDialog({
  open,
  onOpenChange,
  student,
  apiClasses,
  enrollClassIds,
  setEnrollClassIds,
  enrollRemoveClassIds,
  setEnrollRemoveClassIds,
  enrollMonthlyFee,
  setEnrollMonthlyFee,
  enrollStartMonth,
  setEnrollStartMonth,
  onConfirm,
  isSubmitting = false,
}: Props) {
  const hasAdd = enrollClassIds.length > 0
  const hasRemove = enrollRemoveClassIds.length > 0
  const canSubmit = hasAdd || hasRemove

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl">
        <DialogHeader>
          <DialogTitle>Siniflərə qeydiyyat</DialogTitle>
          <DialogDescription>
            {student
              ? `${student.fullName || student.name} üçün sinifləri seçin: yeni siniflərə qeydiyyat və ya mövcud qeydiyyatı götürərək sinifdən çıxın.`
              : ""}
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-64 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain rounded-lg border border-input [scrollbar-gutter:stable]">
          <div className="flex flex-col gap-2 p-1">
            {apiClasses.map((cls) => {
              const already = isEnrolledInClass(student, cls)
              const markedRemove = enrollRemoveClassIds.includes(cls.id)
              const checked = already ? !markedRemove : enrollClassIds.includes(cls.id)
              return (
                <label
                  key={cls.id}
                  className="flex items-center gap-3 rounded-lg border border-border p-3 cursor-pointer hover:bg-accent/50 transition-colors"
                >
                  <Checkbox
                    checked={checked}
                    disabled={isSubmitting}
                    onCheckedChange={(next) => {
                      const on = Boolean(next)
                      if (already) {
                        setEnrollRemoveClassIds((prev) =>
                          on ? prev.filter((id) => id !== cls.id) : [...prev, cls.id],
                        )
                      } else {
                        if (on) setEnrollClassIds((prev) => [...prev, cls.id])
                        else setEnrollClassIds((prev) => prev.filter((id) => id !== cls.id))
                      }
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{cls.name}</p>
                  </div>
                  {already && !markedRemove && (
                    <Badge variant="secondary" className="text-xs">
                      Qeydiyyatlı
                    </Badge>
                  )}
                  {already && markedRemove && (
                    <Badge variant="outline" className="text-xs border-destructive/50 text-destructive">
                      Sinifdən çıxacaq
                    </Badge>
                  )}
                </label>
              )
            })}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-2">
            <Label htmlFor="e-fee">Aylıq ödəniş</Label>
            <Input
              id="e-fee"
              type="number"
              min="0"
              value={enrollMonthlyFee}
              onChange={(e) => setEnrollMonthlyFee(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="e-start">Başlama ayı</Label>
            <Input
              id="e-start"
              type="date"
              value={enrollStartMonth}
              onChange={(e) => setEnrollStartMonth(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Ləğv et
          </Button>
          {canSubmit && <Button onClick={onConfirm} disabled={!canSubmit || isSubmitting}>
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Göndərilir...
              </span>
            ) : (
              <>
                {hasAdd && hasRemove && (
                  <>
                    {enrollClassIds.length} qeydiyyat, {enrollRemoveClassIds.length} çıxış
                  </>
                )}
                {hasAdd && !hasRemove && (
                  <>
                    {enrollClassIds.length} sinif{enrollClassIds.length !== 1 ? "ə" : ""} qeydiyyat
                  </>
                )}
                {!hasAdd && hasRemove && (
                  <>
                    {enrollRemoveClassIds.length} sinifdən çıx
                  </>
                )}
              </>
            )}
          </Button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
