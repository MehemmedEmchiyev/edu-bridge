"use client"

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import service from "@/lib/api"
import { Class, Schedule } from "@/types/class-types.type"
import { BookOpen, Calendar, Clock, Eye, Loader2, Pencil, Plus, Search, Trash2 } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import ClassDetail from "./class/ClassDetail"
import { CreateClassDialog } from "./class/CreateClassDialog"
import ClassSkeleton from "./class/ui/ClassSkeleton"
import { Skeleton } from "./ui/skeleton"
import { cn } from "@/lib/utils"

const DAYS = ["B.e", "Ç.a", "Ç", "C.a", "C", "Ş", "B"]

const filterTriggerClass =
  "h-10 min-w-[140px] max-w-[220px] border-border bg-card shadow-sm rounded-lg text-sm shrink-0"

type ClassSort = "name_asc" | "name_desc" | "students_desc" | "students_asc" | "created_desc"

export function ClassesScreen() {
  const [search, setSearch] = useState("")
  const [dayFilter, setDayFilter] = useState("all")
  const [teacherFilter, setTeacherFilter] = useState("all")
  const [studentFilter, setStudentFilter] = useState("all")
  const [specFilter, setSpecFilter] = useState("all")
  const [sortClasses, setSortClasses] = useState<ClassSort>("name_asc")
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingClass, setEditingClass] = useState<Class | null>(null)

  const [detailClass, setDetailClass] = useState<Class | null>(null)
  const [classes, setClasses] = useState<Class[] | null>()
  const [teachers, setTeachers] = useState<{ id: number; fullName: string }[]>([])
  const [loader, setLoader] = useState<boolean>(false)

  const [classToDelete, setClassToDelete] = useState<Class | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const fetchClasses = async () => {
    setLoader(true)
    try {
      const res = await service.getClasses()
      setClasses(res?.data ?? [])
    } catch {
      setClasses([])
      toast.error("Siniflər yüklənmədi")
    } finally {
      setLoader(false)
    }
  }

  const fetchTeachers = async () => {
    try {
      const res = await service.getTeachers()
      const rows = res?.data as { id: number; fullName: string }[] | undefined
      setTeachers(rows ?? [])
    } catch {
      setTeachers([])
    }
  }

  useEffect(() => {
    fetchClasses()
    fetchTeachers()
  }, [])

  const teacherOptions = useMemo(
    () => teachers.map((t) => ({ id: t.id, fullName: t.fullName })),
    [teachers],
  )

  const studentOptions = useMemo(() => {
    if (!classes?.length) return [] as { id: number; full_name: string }[]
    const map = new Map<number, string>()
    for (const c of classes) {
      for (const s of c.students ?? []) {
        if (!map.has(s.id)) map.set(s.id, s.full_name)
      }
    }
    return [...map.entries()]
      .map(([id, full_name]) => ({ id, full_name }))
      .sort((a, b) => a.full_name.localeCompare(b.full_name, "az"))
  }, [classes])

  const specializationOptions = useMemo(() => {
    if (!classes?.length) return [] as string[]
    const set = new Set<string>()
    for (const c of classes) {
      const sp = (c.specialization ?? "").trim()
      if (sp) set.add(sp)
    }
    return [...set].sort((a, b) => a.localeCompare(b, "az"))
  }, [classes])

  const openCreateSheet = () => {
    setEditingClass(null)
    setSheetOpen(true)
  }

  const openEditSheet = (cls: Class) => {
    setEditingClass(cls)
    setSheetOpen(true)
  }

  const handleSheetOpenChange = (open: boolean) => {
    setSheetOpen(open)
    if (!open) setEditingClass(null)
  }

  const confirmDeleteClass = async () => {
    if (!classToDelete) return
    setDeleteLoading(true)
    try {
      await service.deleteClass(classToDelete.id)
      toast.success("Sinif silindi")
      setClassToDelete(null)
      if (detailClass?.id === classToDelete.id) setDetailClass(null)
      await fetchClasses()
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string | string[] } } }
      const msg = err.response?.data?.message
      const text = Array.isArray(msg) ? msg.join(", ") : msg || "Silinmə alınmadı"
      toast.error(text)
    } finally {
      setDeleteLoading(false)
    }
  }

  const filteredClasses = useMemo(() => {
    if (!classes?.length) return classes ?? []
    let list = [...classes]
    const q = search.trim().toLowerCase()
    if (q) {
      list = list.filter(
        (c) =>
          c.name?.toLowerCase().includes(q) ||
          String(c.number ?? "")
            .toLowerCase()
            .includes(q) ||
          (c.specialization ?? "").toLowerCase().includes(q),
      )
    }
    if (dayFilter !== "all") {
      const d = parseInt(dayFilter, 10)
      if (!Number.isNaN(d)) {
        list = list.filter((c) => c.schedules?.some((s) => s.day_of_week === d))
      }
    }
    if (teacherFilter !== "all") {
      const tid = parseInt(teacherFilter, 10)
      if (!Number.isNaN(tid)) {
        list = list.filter((c) => c.classTeachers?.some((t) => t.id === tid))
      }
    }
    if (studentFilter !== "all") {
      const sid = parseInt(studentFilter, 10)
      if (!Number.isNaN(sid)) {
        list = list.filter((c) => c.students?.some((s) => s.id === sid))
      }
    }
    if (specFilter !== "all") {
      list = list.filter((c) => (c.specialization ?? "").trim() === specFilter)
    }

    list.sort((a, b) => {
      switch (sortClasses) {
        case "name_asc":
          return (a.name || "").localeCompare(b.name || "", "az")
        case "name_desc":
          return (b.name || "").localeCompare(a.name || "", "az")
        case "students_desc":
          return (b.studentCount ?? 0) - (a.studentCount ?? 0)
        case "students_asc":
          return (a.studentCount ?? 0) - (b.studentCount ?? 0)
        case "created_desc": {
          const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0
          const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0
          return tb - ta
        }
        default:
          return 0
      }
    })

    return list
  }, [classes, search, dayFilter, teacherFilter, studentFilter, specFilter, sortClasses])

  const filtersActive =
    dayFilter !== "all" ||
    teacherFilter !== "all" ||
    studentFilter !== "all" ||
    specFilter !== "all" ||
    search.trim() !== ""

  return (
    <div className="flex flex-col gap-8 min-w-0 max-w-full overflow-x-hidden">
      <div className="relative rounded-3xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 p-6 sm:p-8 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10 pointer-events-none" />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between relative z-10 min-w-0">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground text-balance break-words">
              {loader ? <Skeleton className="h-8 w-[220px] max-w-full" /> : `Siniflər`}
            </h1>
            <p className="mt-2 text-base text-muted-foreground">
              {loader ? <Skeleton className="h-4 w-[180px] max-w-full" /> : `${classes?.length ?? 0} sinif`}
            </p>
          </div>
          <Button
            onClick={openCreateSheet}
            className="gap-2 h-11 px-6 bg-gradient-to-r from-primary to-primary/90 shadow-lg hover:shadow-xl transition-all shrink-0 w-full sm:w-auto"
          >
            <Plus className="h-5 w-5 shrink-0" />
            Sinif yaradın
          </Button>
        </div>
      </div>

      <div className="flex flex-row flex-wrap xl:flex-nowrap items-stretch sm:items-center gap-2 min-w-0 xl:overflow-x-auto xl:pb-0.5">
        <div className="relative flex-1 min-w-[min(100%,220px)] sm:min-w-[200px] sm:max-w-md shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Sinif axtar..."
            className="h-10 w-full pl-10 text-sm bg-accent/40 border-accent/50 rounded-lg"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            disabled={loader}
          />
        </div>
        <Select value={dayFilter} onValueChange={setDayFilter} disabled={loader}>
          <SelectTrigger className={cn(filterTriggerClass, "min-w-[160px]")}>
            <SelectValue placeholder="Gün üzrə" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Bütün günlər</SelectItem>
            {DAYS.map((label, i) => (
              <SelectItem key={i + 1} value={String(i + 1)}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={teacherFilter} onValueChange={setTeacherFilter} disabled={loader}>
          <SelectTrigger className={cn(filterTriggerClass, "min-w-[180px] max-w-[240px]")}>
            <SelectValue placeholder="Müəllim üzrə" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Bütün müəllimlər</SelectItem>
            {teacherOptions.map((t) => (
              <SelectItem key={t.id} value={String(t.id)}>
                {t.fullName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={studentFilter} onValueChange={setStudentFilter} disabled={loader}>
          <SelectTrigger className={cn(filterTriggerClass, "min-w-[180px] max-w-[240px]")}>
            <SelectValue placeholder="Şagird üzrə" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Bütün şagirdlər</SelectItem>
            {studentOptions.map((s) => (
              <SelectItem key={s.id} value={String(s.id)}>
                {s.full_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={specFilter} onValueChange={setSpecFilter} disabled={loader}>
          <SelectTrigger className={cn(filterTriggerClass, "min-w-[160px] max-w-[220px]")}>
            <SelectValue placeholder="İstiqamət" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Bütün istiqamətlər</SelectItem>
            {specializationOptions.map((sp) => (
              <SelectItem key={sp} value={sp}>
                {sp}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sortClasses} onValueChange={(v) => setSortClasses(v as ClassSort)} disabled={loader}>
          <SelectTrigger className={cn(filterTriggerClass, "min-w-[200px] max-w-[260px]")}>
            <SelectValue placeholder="Sırala" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name_asc">Ad (A–Z)</SelectItem>
            <SelectItem value="name_desc">Ad (Z–A)</SelectItem>
            <SelectItem value="students_desc">Şagird sayı (Çoxdan aza)</SelectItem>
            <SelectItem value="students_asc">Şagird sayı (Azdan çoxa)</SelectItem>
            <SelectItem value="created_desc">Yaradılma (ən yeni)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loader ? (
        <ClassSkeleton />
      ) : classes?.length === 0 ? (
        <Card className="rounded-2xl border-2 border-dashed border-border/50 bg-card/30">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center px-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-6">
              <BookOpen className="h-8 w-8 text-primary/50" />
            </div>
            <h3 className="text-xl font-semibold text-foreground">Sinif tapılmadı</h3>
            <p className="mt-2 text-base text-muted-foreground max-w-sm">
              Başlamaq üçün ilk sinifinizi yaradın.
            </p>
          </CardContent>
        </Card>
      ) : filteredClasses.length === 0 ? (
        <Card className="rounded-2xl border border-border/50 bg-card/30">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center px-4">
            <Search className="h-10 w-10 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold text-foreground">Uyğun sinif yoxdur</h3>
            <p className="mt-2 text-sm text-muted-foreground max-w-sm">
              {filtersActive ? "Filtr və ya axtarışı dəyişin." : "Axtarışı dəyişin və ya təmizləyin."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 min-w-0">
          {filteredClasses.map((cls: Class) => {
            const created = cls.createdAt ? String(cls.createdAt).split("T")[0] : "—"
            return (
              <Card
                key={cls.id}
                className="rounded-2xl border-border/50 bg-card/50 backdrop-blur-sm transition-all hover:shadow-lg hover:border-primary/20 min-w-0 overflow-hidden"
              >
                <CardContent className="flex flex-col gap-4 px-4 sm:px-6 min-w-0">
                  <div className="flex items-start gap-2 min-w-0">
                    <button
                      type="button"
                      className="text-left min-w-0 flex-1 font-semibold text-lg text-foreground hover:text-primary transition-colors"
                      onClick={() => setDetailClass(cls)}
                    >
                      <span className="break-words line-clamp-2">
                        {cls.name}
                        {cls.number != null && cls.number !== "" && (
                          <span className="text-muted-foreground font-normal"> — {cls.number}</span>
                        )}
                      </span>
                    </button>
                    <div className="flex items-center gap-0.5 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-lg transition-all"
                        onClick={() => setDetailClass(cls)}
                        aria-label="Ətraflı"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-lg transition-all"
                        onClick={() => openEditSheet(cls)}
                        aria-label="Redaktə et"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all"
                        onClick={() => setClassToDelete(cls)}
                        aria-label="Sil"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {cls.specialization ? (
                    <p className="text-xs text-muted-foreground line-clamp-2 break-words">{cls.specialization}</p>
                  ) : null}

                  {cls?.classTeachers?.length > 0 && (
                    <div className="flex flex-wrap gap-2 min-w-0">
                      {cls.classTeachers.map((teacher) => (
                        <Badge
                          key={teacher.id}
                          variant="secondary"
                          className="text-xs font-medium bg-primary/15 text-primary border-primary/20 max-w-full truncate"
                        >
                          {teacher.full_name}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-2 min-w-0">
                    {cls.schedules?.map((item: Schedule, index: number) => (
                      <Badge key={`${item.day_of_week}-${index}`} variant="outline" className="text-xs font-medium bg-accent/40 shrink-0">
                        {DAYS[item.day_of_week - 1] ?? item.day_of_week}
                      </Badge>
                    ))}
                    {cls.schedules?.[0] && (
                      <span className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium min-w-0">
                        <Clock className="h-3.5 w-3.5 text-primary/60 shrink-0" />
                        <span className="truncate">
                          {cls.schedules[0].start_time.slice(0, 5)} – {cls.schedules[0].end_time.slice(0, 5)}
                        </span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-sm pt-1 gap-2 min-w-0">
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium min-w-0 truncate">
                      <Calendar className="h-3.5 w-3.5 text-primary/60 shrink-0" />
                      {created}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <ClassDetail detailClass={detailClass} setDetailClass={setDetailClass} />
      <CreateClassDialog
        open={sheetOpen}
        onOpenChange={handleSheetOpenChange}
        teachers={teacherOptions}
        onSaved={fetchClasses}
        editingClass={editingClass}
      />

      <AlertDialog open={!!classToDelete} onOpenChange={(open) => !open && setClassToDelete(null)}>
        <AlertDialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>Sinifi sil</AlertDialogTitle>
            <AlertDialogDescription>
              {classToDelete ? (
                <>
                  <span className="font-medium text-foreground">“{classToDelete.name}”</span> silinəcək . Bu əməliyyat geri qaytarılmır.
                </>
              ) : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col-reverse sm:flex-row gap-2">
            <AlertDialogCancel disabled={deleteLoading}>Ləğv et</AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              disabled={deleteLoading}
              onClick={() => void confirmDeleteClass()}
            >
              {deleteLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sil"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
