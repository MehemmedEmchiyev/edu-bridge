"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
export const WEEKDAY_LABELS = ["B.e", "Ç.a", "Ç", "C.a", "C", "Ş", "B"] as const

type Props = {
  selectedDayIndices: number[]
  onToggleDay: (index: number) => void
  startTime: string
  endTime: string
  onStartTime: (v: string) => void
  onEndTime: (v: string) => void
  disabled?: boolean
}

export function ClassScheduleFields({
  selectedDayIndices,
  onToggleDay,
  startTime,
  endTime,
  onStartTime,
  onEndTime,
  disabled = false,
}: Props) {
  return (
    <>
      <div className="flex flex-col gap-2">
        <Label>Cədvəl günləri</Label>
        <div className="flex flex-wrap gap-2">
          {WEEKDAY_LABELS.map((day, index) => (
            <label key={day} className="flex items-center gap-1.5 cursor-pointer">
              <Checkbox
                disabled={disabled}
                checked={selectedDayIndices.includes(index)}
                onCheckedChange={() => onToggleDay(index)}
              />
              <span className="text-sm">{day}</span>
            </label>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-2">
          <Label>Başlama vaxtı</Label>
          <Input type="time" value={startTime} onChange={(e) => onStartTime(e.target.value)} disabled={disabled} />
        </div>
        <div className="flex flex-col gap-2">
          <Label>Bitmə vaxtı</Label>
          <Input type="time" value={endTime} onChange={(e) => onEndTime(e.target.value)} disabled={disabled} />
        </div>
      </div>
    </>
  )
}
