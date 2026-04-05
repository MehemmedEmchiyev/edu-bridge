"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { StudentRow } from "@/components/students/StudentsTable"
import { Mail, MoreHorizontal, Pencil, Phone, Receipt, Trash2, UserPlus } from "lucide-react"

type Props = {
  student: StudentRow
  onEdit: (id: number) => void
  onEnroll: (id: number) => void
  onBilling: (id: number) => void
  onDelete: (id: number) => void
}

export function StudentCard({ student, onEdit, onEnroll, onBilling, onDelete }: Props) {
  const label = student.fullName || student.name || "—"
  const cls = student.classes ?? []

  return (
    <Card className="rounded-2xl border-border/50 bg-card/50 backdrop-blur-sm transition-all hover:shadow-lg hover:border-primary/20 min-w-0 overflow-hidden">
      <CardContent className="flex flex-col gap-4 p-5 sm:p-6">
        <div className="flex items-start justify-between gap-2 min-w-0">
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-lg text-foreground break-words line-clamp-2">{label}</h3>
            <div className="mt-2 flex flex-col gap-1.5 text-sm text-muted-foreground">
              <span className="flex items-start gap-2 min-w-0">
                <Mail className="h-4 w-4 shrink-0 mt-0.5 text-primary/60" />
                <span className="break-all min-w-0">{student.email?.trim() || "—"}</span>
              </span>
              <span className="flex items-start gap-2 min-w-0">
                <Phone className="h-4 w-4 shrink-0 mt-0.5 text-primary/60" />
                <span className="break-all min-w-0">{student.phone?.trim() || "—"}</span>
              </span>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Əməliyyatlar</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(student.id)}>
                <Pencil className="mr-2 h-4 w-4" />
                Redaktə et
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEnroll(student.id)}>
                <UserPlus className="mr-2 h-4 w-4" />
                Siniflərə qeydiyyat
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onBilling(student.id)}>
                <Receipt className="mr-2 h-4 w-4" />
                Fakturaya bax
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => onDelete(student.id)}>
                <Trash2 className="mr-2 h-4 w-4" />
                Kursdan çıxar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {cls.length > 0 && (
          <div className="flex flex-wrap gap-1.5 min-w-0">
            {cls.slice(0, 4).map((c, idx) => (
              <Badge key={`${student.id}-${c.classId ?? idx}-${c.className}`} variant="secondary" className="text-xs font-normal max-w-full truncate">
                {c.className}
              </Badge>
            ))}
            {cls.length > 4 && (
              <Badge variant="outline" className="text-xs font-normal">
                +{cls.length - 4}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
