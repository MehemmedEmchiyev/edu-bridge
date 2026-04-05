"use client"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import service from "@/lib/api"
import { ClassScheduleFields } from "@/components/class/ClassScheduleFields"
import type { Class } from "@/types/class-types.type"
import { LoaderCircle } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"

export type TeacherOption = { id: number; fullName: string }

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  teachers: TeacherOption[]
  onSaved: () => void
  /** Dolu olduqda dialoq redaktə rejimində işləyir */
  editingClass?: Class | null
}

function normalizeTime(t: string) {
  if (!t) return "09:00"
  return t.length >= 5 ? t.slice(0, 5) : t
}

export function CreateClassDialog({ open, onOpenChange, teachers, onSaved, editingClass = null }: Props) {
  const [name, setName] = useState("")
  const [number, setNumber] = useState("")
  const [specialization, setSpecialization] = useState("")
  const [teacherIds, setTeacherIds] = useState<number[]>([])
  const [dayIndices, setDayIndices] = useState<number[]>([])
  const [startTime, setStartTime] = useState("09:00")
  const [endTime, setEndTime] = useState("10:30")
  const [loading, setLoading] = useState(false)

  const isEdit = !!editingClass

  const reset = useCallback(() => {
    setName("")
    setNumber("")
    setSpecialization("")
    setTeacherIds([])
    setDayIndices([])
    setStartTime("09:00")
    setEndTime("10:30")
  }, [])

  useEffect(() => {
    if (!open) return
    if (editingClass) {
      setName(editingClass.name ?? "")
      setNumber(editingClass.number != null ? String(editingClass.number) : "")
      setSpecialization(editingClass.specialization != null ? String(editingClass.specialization) : "")
      setTeacherIds(editingClass.classTeachers?.map((t) => t.id) ?? [])
      const sch = [...(editingClass.schedules ?? [])].sort((a, b) => a.day_of_week - b.day_of_week)
      const uniqueDayIdx = [...new Set(sch.map((s) => s.day_of_week - 1))].sort((a, b) => a - b)
      setDayIndices(uniqueDayIdx)
      if (sch.length > 0) {
        setStartTime(normalizeTime(sch[0].start_time))
        setEndTime(normalizeTime(sch[0].end_time))
      } else {
        setStartTime("09:00")
        setEndTime("10:30")
      }
    } else {
      reset()
    }
  }, [open, editingClass, reset])

  const toggleTeacher = (id: number) => {
    setTeacherIds((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]))
  }

  const toggleDay = (index: number) => {
    setDayIndices((prev) => (prev.includes(index) ? prev.filter((d) => d !== index) : [...prev, index]))
  }

  const buildSchedule = () =>
    [...dayIndices]
      .sort((a, b) => a - b)
      .map((i) => ({
        dayOfWeek: i + 1,
        startTime,
        endTime,
      }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error("Sinif adı tələb olunur")
      return
    }
    if (teacherIds.length === 0) {
      toast.error("Ən azı bir müəllim seçin")
      return
    }
    if (dayIndices.length === 0) {
      toast.error("Ən azı bir gün seçin")
      return
    }
    const schedule = buildSchedule()
    setLoading(true)
    try {
      if (isEdit && editingClass) {
        await service.updateClass(editingClass.id, {
          name: name.trim(),
          number: number.trim() || undefined,
          specialization: specialization.trim() || undefined,
          teacherUserIds: teacherIds,
          schedule,
        })
        toast.success("Sinif yeniləndi")
      } else {
        await service.createClass({
          name: name.trim(),
          number: number.trim() || undefined,
          specialization: specialization.trim() || undefined,
          teacherUserIds: teacherIds,
          schedule,
        })
        toast.success("Sinif yaradıldı")
      }
      onSaved()
      onOpenChange(false)
      reset()
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string | string[] } } }).response?.data?.message
          : undefined
      const text = Array.isArray(msg) ? msg.join(", ") : msg
      toast.error(isEdit ? "Sinif yenilənmədi" : "Sinif yaradılmadı", {
        description: text || "Yenidən cəhd edin",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v)
        if (!v) reset()
      }}
    >
      <DialogContent className=" overflow-y-auto sm:max-w-lg w-[calc(100vw-2rem)] sm:w-full min-w-0">
        <form  onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEdit ? "Sinifi redaktə edin" : "Yeni sinif"}</DialogTitle>
            <DialogDescription>
              {isEdit
                ? "Ad, nömrə, müəllimlər və cədvəli yeniləyin."
                : "Müəllimləri təyin edin və həftəlik dərs günlərini seçin. Sinif yaradıldıqdan sonra siyahıda görünəcək."}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4 min-w-0">
            <div className="flex flex-col gap-2">
              <Label htmlFor="cc-name">Sinif adı *</Label>
              <Input id="cc-name" value={name} onChange={(e) => setName(e.target.value)} required disabled={loading} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 min-w-0">
              <div className="flex flex-col gap-2 min-w-0">
                <Label htmlFor="cc-num">Nömrə</Label>
                <Input id="cc-num" value={number} onChange={(e) => setNumber(e.target.value)} placeholder="001" disabled={loading} />
              </div>
              <div className="flex flex-col gap-2 min-w-0">
                <Label htmlFor="cc-spec">İxtisas</Label>
                <Input
                  id="cc-spec"
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  placeholder="Riyaziyyat"
                  disabled={loading}
                />
              </div>
            </div>
            <div className="flex flex-col gap-2 min-w-0">
              <Label>Müəllimlər *</Label>
              <div
                className="max-h-36 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain rounded-md border border-input bg-background min-w-0 [scrollbar-gutter:stable]"
              >
                <div className="p-3 flex flex-col gap-2">
                  {teachers.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Müəllim siyahısı boşdur.</p>
                  ) : (
                    teachers.map((t) => (
                      <label
                        key={t.id}
                        className="flex items-start gap-3 cursor-pointer min-w-0 py-0.5"
                      >
                        <Checkbox
                          disabled={loading}
                          className="mt-0.5 shrink-0"
                          checked={teacherIds.includes(t.id)}
                          onCheckedChange={() => toggleTeacher(t.id)}
                        />
                        <span className="text-sm break-words min-w-0 flex-1">{t.fullName}</span>
                      </label>
                    ))
                  )}
                </div>
              </div>
            </div>
            <ClassScheduleFields
              selectedDayIndices={dayIndices}
              onToggleDay={toggleDay}
              startTime={startTime}
              endTime={endTime}
              onStartTime={setStartTime}
              onEndTime={setEndTime}
              disabled={loading}
            />
          </div>
          <DialogFooter className="flex-col-reverse sm:flex-row gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Ləğv et
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  Göndərilir...
                </span>
              ) : isEdit ? (
                "Dəyişiklikləri saxla"
              ) : (
                "Sinif yaradın"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
