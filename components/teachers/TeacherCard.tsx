import type { TeacherListItem } from "@/types/create-teacher.type"
import { Mail, Pencil, Phone, Trash2 } from "lucide-react"
import { Button } from "../ui/button"
import { Card, CardContent } from "../ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

type TeacherCardProps = {
  teacher: TeacherListItem
  validSpecialtyNames: Set<string>
  openEditSheet: (teacher: TeacherListItem) => void
  onDelete: (teacher: TeacherListItem) => void
}

const TeacherCard = ({ teacher, validSpecialtyNames, openEditSheet, onDelete }: TeacherCardProps) => {
  const initials = (n: string) =>
    n
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)

  return (
    <Card className="rounded-2xl border-border/50 bg-card/50 backdrop-blur-sm transition-all hover:shadow-lg hover:border-primary/20">
      <CardContent className="flex flex-col gap-5 p-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12 border-2 border-primary/20">
            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold text-sm">
              {teacher?.photoUrl && <img src={teacher.photoUrl} className="w-full h-full object-cover" alt="" />}
              {!teacher?.photoUrl && initials(teacher.fullName)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground text-lg truncate">{teacher.fullName}</h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              {teacher.specialty?.trim() && validSpecialtyNames.has(teacher.specialty.trim())
                ? teacher.specialty
                : "—"}
            </p>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-lg transition-all"
              onClick={() => openEditSheet(teacher)}
              aria-label="Redaktə et"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all"
              onClick={() => onDelete(teacher)}
              aria-label="Sil"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-2 text-sm">
          <div className="flex items-center gap-3 text-muted-foreground">
            <Mail className="h-4 w-4 text-primary/60" />
            <span className="truncate text-foreground/80">{teacher.email}</span>
          </div>
          <div className="flex items-center gap-3 text-muted-foreground">
            <Phone className="h-4 w-4 text-primary/60" />
            <span className="text-foreground/80">{teacher?.phone || "Not found"}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default TeacherCard
