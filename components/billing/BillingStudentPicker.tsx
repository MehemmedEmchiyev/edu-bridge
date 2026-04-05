"use client"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ChevronsUpDown, Check } from "lucide-react"
import { cn } from "@/lib/utils"

type StudentOpt = { id: number; fullName?: string; name?: string }

type Props = {
  students: StudentOpt[]
  selectedStudentId: string
  onStudentId: (id: string) => void
  comboOpen: boolean
  onComboOpen: (v: boolean) => void
  classOptions: { id: number; name: string }[]
  selectedClassId: string
  onClassId: (id: string) => void
  loading?: boolean
}

export function BillingStudentPicker({
  students,
  selectedStudentId,
  onStudentId,
  comboOpen,
  onComboOpen,
  classOptions,
  selectedClassId,
  onClassId,
  loading = false,
}: Props) {
  const selected = students.find((s) => String(s.id) === selectedStudentId)
  const label = selected ? selected.fullName || selected.name || "" : ""

  return (
    <div className="flex flex-col sm:flex-row gap-4 max-w-2xl">
      <div className="flex flex-col gap-2 flex-1">
        <Label>Tələbə</Label>
        <Popover open={comboOpen} onOpenChange={onComboOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" role="combobox" className="justify-between font-normal" disabled={loading}>
              {selectedStudentId ? label : "Tələbə seçin..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-0">
            <Command>
              <CommandInput placeholder="Axtar..." />
              <CommandList>
                <CommandEmpty>Tələbə tapılmadı.</CommandEmpty>
                <CommandGroup>
                  {students.map((s) => {
                    const id = String(s.id)
                    const name = s.fullName || s.name || id
                    return (
                      <CommandItem
                        key={id}
                        value={name}
                        onSelect={() => {
                          onStudentId(id)
                          onComboOpen(false)
                        }}
                      >
                        <Check className={cn("mr-2 h-4 w-4", selectedStudentId === id ? "opacity-100" : "opacity-0")} />
                        {name}
                      </CommandItem>
                    )
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
      {selectedStudentId ? (
        <div className="flex flex-col gap-2 flex-1">
          <Label>Faktura üçün sinif</Label>
          {classOptions.length > 0 ? (
            <Select value={selectedClassId} onValueChange={onClassId} disabled={loading}>
              <SelectTrigger>
                <SelectValue placeholder="Sinif seçin" />
              </SelectTrigger>
              <SelectContent>
                {classOptions.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <p className="text-sm text-muted-foreground rounded-md border border-dashed border-border bg-muted/30 px-3 py-2.5">
              Bu tələbənin heç bir sinifə qeydiyyatı yoxdur.
            </p>
          )}
        </div>
      ) : null}
    </div>
  )
}
