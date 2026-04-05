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
  classes?: { className: string }[]
}

type Props = {
  open: boolean
  onOpenChange: (v: boolean) => void
  student: StudentBrief | null
  apiClasses: ClassOption[]
  enrollClassIds: number[]
  setEnrollClassIds: React.Dispatch<React.SetStateAction<number[]>>
  enrollMonthlyFee: string
  setEnrollMonthlyFee: (v: string) => void
  enrollStartMonth: string
  setEnrollStartMonth: (v: string) => void
  onConfirm: () => void
  isSubmitting?: boolean
}

export function StudentEnrollDialog({
  open,
  onOpenChange,
  student,
  apiClasses,
  enrollClassIds,
  setEnrollClassIds,
  enrollMonthlyFee,
  setEnrollMonthlyFee,
  enrollStartMonth,
  setEnrollStartMonth,
  onConfirm,
  isSubmitting = false,
}: Props) {
  const enrolledNames = new Set((student?.classes ?? []).map((c) => c.className))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl">
        <DialogHeader>
          <DialogTitle>Siniflərə qeydiyyat</DialogTitle>
          <DialogDescription>
            {student
              ? `${student.fullName || student.name} üçün əlavə siniflər seçin. Artıq qeydiyyatlı siniflər dəyişmir.`
              : ""}
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-64 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain rounded-lg border border-input [scrollbar-gutter:stable]">
          <div className="flex flex-col gap-2 p-1">
            {apiClasses.map((cls) => {
              const already = enrolledNames.has(cls.name)
              return (
                <label
                  key={cls.id}
                  className="flex items-center gap-3 rounded-lg border border-border p-3 cursor-pointer hover:bg-accent/50 transition-colors"
                >
                  <Checkbox
                    checked={enrollClassIds.includes(cls.id) || already}
                    disabled={already || isSubmitting}
                    onCheckedChange={(checked) => {
                      if (checked) setEnrollClassIds((prev) => [...prev, cls.id])
                      else setEnrollClassIds((prev) => prev.filter((id) => id !== cls.id))
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{cls.name}</p>
                  </div>
                  {already && <Badge variant="secondary" className="text-xs">Qeydiyyatlı</Badge>}
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
          <Button onClick={onConfirm} disabled={enrollClassIds.length === 0 || isSubmitting}>
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Göndərilir...
              </span>
            ) : (
              <>
                {enrollClassIds.length} sinif{enrollClassIds.length !== 1 ? "ə" : ""} qeydiyyat
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
