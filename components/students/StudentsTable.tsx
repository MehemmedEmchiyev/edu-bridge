"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { MoreHorizontal, Pencil, Receipt, Trash2, UserPlus, Users } from "lucide-react"

export type StudentRow = {
  id: number
  fullName?: string
  name?: string
  email?: string | null
  phone?: string | null
  classes?: {
    classId?: number
    className: string
    monthlyFee?: number
    absentCount?: number
  }[]
}

type Props = {
  students: StudentRow[]
  onEdit: (id: number) => void
  onEnroll: (id: number) => void
  onBilling: (id: number) => void
  onDelete: (id: number) => void
}

export function StudentsTable({ students, onEdit, onEnroll, onBilling, onDelete }: Props) {
  if (students.length === 0) {
    return (
      <Card className="rounded-2xl border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted mb-4">
            <Users className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground">Tələbə tapılmadı</h3>
          <p className="mt-1 text-sm text-muted-foreground max-w-xs">Siyahı boşdur və ya axtarış uyğun gəlmir.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ad</TableHead>
            <TableHead className="hidden sm:table-cell">E-poçt</TableHead>
            <TableHead>Telefon</TableHead>
            <TableHead className="hidden lg:table-cell">Siniflər</TableHead>
            <TableHead className="w-10">
              <span className="sr-only">Əməliyyatlar</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.map((student) => {
            const label = student.fullName || student.name || "—"
            const cls = student.classes ?? []
            return (
              <TableRow key={student.id}>
                <TableCell className="font-medium text-foreground">{label}</TableCell>
                <TableCell className="hidden sm:table-cell text-muted-foreground break-all max-w-[200px]">
                  {student.email?.trim() || "—"}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm break-all max-w-[160px] sm:max-w-none">
                  {student.phone?.trim() || "—"}
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <div className="flex flex-wrap gap-1">
                    {cls.slice(0, 3).map((c, idx) => (
                      <Badge key={`${student.id}-${c.classId ?? idx}-${c.className}`} variant="secondary" className="text-xs font-normal">
                        {c.className}
                      </Badge>
                    ))}
                    {cls.length > 3 && (
                      <Badge variant="outline" className="text-xs font-normal">
                        +{cls.length - 3}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
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
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => onDelete(student.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Kursdan çıxar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
