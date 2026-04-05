"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import service, { type CourseSpecialization } from "@/lib/api"
import type { TeacherListItem } from "@/types/create-teacher.type"
import { LayoutGrid, List, Loader2, Pencil, Plus, Sparkles, Trash2 } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import AddTeacher from "./teachers/AddTeacher"
import TeacherCard from "./teachers/TeacherCard"
import { TeachersGridSkeleton } from "./teachers/TeachersGridSkeleton"
import { TeachersTableSkeleton } from "./teachers/TeachersTableSkeleton"
import { Skeleton } from "./ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Input } from "./ui/input"
import { toast } from "sonner"

function specialtyCellText(teacher: TeacherListItem, validNames: Set<string>) {
  const s = teacher.specialty?.trim()
  if (!s) return "—"
  return validNames.has(s) ? s : "—"
}

export function TeachersScreen() {
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingTeacher, setEditingTeacher] = useState<TeacherListItem | null>(null)
  const [teacherToDelete, setTeacherToDelete] = useState<TeacherListItem | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [allTeachers, setAllTeachers] = useState<TeacherListItem[] | undefined>(undefined)
  const [specOptions, setSpecOptions] = useState<CourseSpecialization[]>([])
  const [flag, setFlag] = useState<boolean>(false)
  const [loader, setLoader] = useState<boolean>(false)
  const [view, setView] = useState<"grid" | "list">("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [specialtyFilter, setSpecialtyFilter] = useState<string>("all")
  const [nameSort, setNameSort] = useState<"none" | "asc" | "desc">("none")

  const specNameSet = useMemo(() => new Set(specOptions.map((s) => s.name)), [specOptions])

  useEffect(() => {
    getTeachers()
  }, [flag])

  useEffect(() => {
    let cancelled = false
    void service
      .getSpecializations()
      .then((res) => {
        if (!cancelled) setSpecOptions((res.data as CourseSpecialization[]) ?? [])
      })
      .catch(() => {
        if (!cancelled) setSpecOptions([])
      })
    return () => {
      cancelled = true
    }
  }, [flag])

  const getTeachers = async () => {
    setLoader(true)
    try {
      const res = await service.getTeachers()
      setAllTeachers((res?.data as TeacherListItem[]) ?? [])
    } catch {
      setAllTeachers([])
    } finally {
      setLoader(false)
    }
  }

  const filteredTeachers = useMemo((): TeacherListItem[] => {
    let rows = [...(allTeachers ?? [])]
    const q = searchQuery.trim().toLowerCase()
    if (q) {
      rows = rows.filter((t) => (t.fullName ?? "").toLowerCase().includes(q))
    }
    if (specialtyFilter !== "all") {
      rows = rows.filter((t) => (t.specialty?.trim() ?? "") === specialtyFilter)
    }
    if (nameSort === "asc") {
      rows.sort((a, b) => (a.fullName ?? "").localeCompare(b.fullName ?? "", "az"))
    } else if (nameSort === "desc") {
      rows.sort((a, b) => (b.fullName ?? "").localeCompare(a.fullName ?? "", "az"))
    }
    return rows
  }, [allTeachers, searchQuery, specialtyFilter, nameSort])

  const openAddSheet = () => {
    setEditingTeacher(null)
    setSheetOpen(true)
  }

  const openEditSheet = (teacher: TeacherListItem) => {
    setEditingTeacher(teacher)
    setSheetOpen(true)
  }

  const confirmDeleteTeacher = async () => {
    if (!teacherToDelete) return
    setDeleteLoading(true)
    try {
      await service.deleteTeacher(teacherToDelete.id)
      toast.success("Müəllim kursdan çıxarıldı")
      setTeacherToDelete(null)
      setFlag(!flag)
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string | string[] } } }
      const msg = err.response?.data?.message
      const text = Array.isArray(msg) ? msg.join(", ") : msg || "Silinmə alınmadı"
      toast.error(text)
    } finally {
      setDeleteLoading(false)
    }
  }

  const count = allTeachers?.length ?? 0
  const list = filteredTeachers

  return (
    <div className="flex flex-col gap-8">
      <div className="relative rounded-3xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 p-8 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10" />
        <div className="flex flex-col md:flex-row gap-3 md:items-center justify-between relative z-10">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground text-balance">Müəllimlər</h1>
            <div className="mt-2 text-base text-muted-foreground">
              {loader ? <Skeleton className="h-5 w-[180px] inline-block" /> : `${count} müəllim siyahıda`}
            </div>
          </div>
          <Button
            onClick={openAddSheet}
            className="gap-2 h-11 px-6 bg-gradient-to-r from-primary to-primary/90 shadow-lg hover:shadow-xl transition-all"
          >
            <Plus className="h-5 w-5" />
            Müəllim əlavə edin
          </Button>
        </div>
      </div>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between lg:gap-4 min-w-0">
        <Tabs onValueChange={(value: string) => setView(value as "grid" | "list")} defaultValue="grid" className="shrink-0">
          <TabsList>
            <TabsTrigger value="grid">
              <LayoutGrid />
              Kartlar
            </TabsTrigger>
            <TabsTrigger value="list">
              <List />
              Siyahı
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex flex-row flex-wrap xl:flex-nowrap items-center gap-2 min-w-0 flex-1 lg:justify-end xl:overflow-x-auto xl:pb-0.5">
          <Input
            type="search"
            className="h-10 w-full min-w-[160px] sm:max-w-xs xl:w-56 shrink-0 border-border bg-card shadow-sm rounded-lg"
            placeholder="Müəllim axtar"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={loader}
          />
          <Select value={specialtyFilter} onValueChange={setSpecialtyFilter} disabled={loader}>
            <SelectTrigger className="h-10 w-full min-w-[200px] max-w-[260px] xl:w-[240px] shrink-0 border-border bg-card shadow-sm rounded-lg">
              <SelectValue placeholder="Sahə üzrə" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">Bütün sahələr</SelectItem>
                {specOptions.map((s) => (
                  <SelectItem key={s.id} value={s.name}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Select
            value={nameSort}
            onValueChange={(v) => setNameSort(v as "none" | "asc" | "desc")}
            disabled={loader}
          >
            <SelectTrigger className="h-10 w-full min-w-[160px] max-w-[200px] xl:w-[180px] shrink-0 border-border bg-card shadow-sm rounded-lg">
              <SelectValue placeholder="Sırala" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="none">Defolt sıra</SelectItem>
                <SelectItem value="asc">A-dan Z-yə</SelectItem>
                <SelectItem value="desc">Z-dən A-ya</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>
      {loader ? (
        view === "grid" ? (
          <TeachersGridSkeleton />
        ) : (
          <TeachersTableSkeleton />
        )
      ) : (allTeachers?.length ?? 0) === 0 ? (
        <Card className="rounded-2xl border-2 border-dashed border-border/50 bg-card/30">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-6">
              <Sparkles className="h-8 w-8 text-primary/50" />
            </div>
            <h3 className="text-xl font-semibold text-foreground">Hələ müəllim yoxdur</h3>
            <p className="mt-2 text-base text-muted-foreground max-w-sm">
              Komandanızı qurmağa başlamaq üçün ilk müəllimi əlavə edin.
            </p>
            <Button onClick={openAddSheet} className="mt-6 gap-2 bg-gradient-to-r from-primary to-primary/90">
              <Plus className="h-4 w-4" />
              Müəllim əlavə edin
            </Button>
          </CardContent>
        </Card>
      ) : list.length === 0 ? (
        <Card className="rounded-2xl border border-dashed border-border/60 bg-muted/20">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center px-4">
            <h3 className="text-lg font-medium text-foreground">Nəticə yoxdur</h3>
            <p className="mt-2 text-sm text-muted-foreground max-w-md">
              Axtarış və ya sahə filtri üzrə uyğun müəllim yoxdur — filtrləri dəyişin və ya axtarışı təmizləyin.
            </p>
          </CardContent>
        </Card>
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((teacher, index) => (
            <TeacherCard
              key={teacher?.id ?? index}
              teacher={teacher}
              validSpecialtyNames={specNameSet}
              openEditSheet={openEditSheet}
              onDelete={setTeacherToDelete}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Şəkil</TableHead>
                <TableHead>Müəllimin adı</TableHead>
                <TableHead>E-poçt</TableHead>
                <TableHead>Nömrə</TableHead>
                <TableHead>İxtisas</TableHead>
                <TableHead className="w-[120px] text-right">Əməliyyatlar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.map((teacher) => (
                <TableRow key={teacher?.id}>
                  <TableCell className="font-medium">
                    {teacher?.photoUrl && (
                      <img className="w-10 h-10 rounded-full object-cover" src={teacher?.photoUrl} alt={teacher?.fullName} />
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{teacher?.fullName}</TableCell>
                  <TableCell>{teacher?.email}</TableCell>
                  <TableCell>{teacher?.phone || "—"}</TableCell>
                  <TableCell>{specialtyCellText(teacher, specNameSet)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openEditSheet(teacher)}
                        aria-label="Redaktə"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => setTeacherToDelete(teacher)}
                        aria-label="Sil"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      <AddTeacher sheetOpen={sheetOpen} setSheetOpen={setSheetOpen} editingTeacher={editingTeacher} flag={flag} setFlag={setFlag} />
      <AlertDialog open={!!teacherToDelete} onOpenChange={(open) => !open && setTeacherToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Müəllimi sil</AlertDialogTitle>
            <AlertDialogDescription>
              {teacherToDelete
                ? `“${teacherToDelete.fullName}” kursunuzdan çıxarılacaq. Davam edilsin?`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteLoading}>Ləğv et</AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              disabled={deleteLoading}
              onClick={() => void confirmDeleteTeacher()}
            >
              {deleteLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sil"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
