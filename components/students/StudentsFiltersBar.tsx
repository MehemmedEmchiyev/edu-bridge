"use client"

import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

type Props = {
  search: string
  onSearch: (v: string) => void
  sortBy: "name" | "classes"
  onSortBy: (v: "name" | "classes") => void
  classFilter: string
  onClassFilter: (v: string) => void
  classOptions: { id: number; name: string }[]
  disabled?: boolean
}

const triggerClass =
  "h-10 min-w-[160px] max-w-[220px] border-border bg-card shadow-sm rounded-lg text-sm"

export function StudentsFiltersBar({
  search,
  onSearch,
  sortBy,
  onSortBy,
  classFilter,
  onClassFilter,
  classOptions,
  disabled,
}: Props) {
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:flex-wrap xl:flex-nowrap items-stretch sm:items-center gap-2 min-w-0 w-full sm:w-auto sm:justify-end xl:overflow-x-auto xl:pb-0.5",
        disabled && "pointer-events-none opacity-60",
      )}
    >
      <Input
        placeholder="Tələbə axtar..."
        className="h-10 w-full sm:w-64 sm:min-w-[200px] text-sm bg-accent/40 border-accent/50 rounded-lg shrink-0"
        value={search}
        onChange={(e) => onSearch(e.target.value)}
        disabled={disabled}
      />
      <Select value={classFilter} onValueChange={onClassFilter} disabled={disabled}>
        <SelectTrigger className={cn(triggerClass, "shrink-0")}>
          <SelectValue placeholder="Sinif üzrə" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Bütün siniflər</SelectItem>
          {classOptions.map((c) => (
            <SelectItem key={c.id} value={String(c.id)}>
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={sortBy} onValueChange={(v) => onSortBy(v as "name" | "classes")} disabled={disabled}>
        <SelectTrigger className={cn(triggerClass, "shrink-0")}>
          <SelectValue placeholder="Sırala" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="name">Ad (A–Z)</SelectItem>
          <SelectItem value="classes">Sinif sayı (Ən çoxu ilk)</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
