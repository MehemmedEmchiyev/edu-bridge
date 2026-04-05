"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import service, { type UpsertStudentPayload } from "@/lib/api"
import { filterAndSortStudents } from "@/lib/filter-students"
import { useStudentsApiData } from "@/hooks/useStudentsApiData"
import { StudentsHero } from "@/components/students/StudentsHero"
import { StudentsPageSkeleton } from "@/components/students/StudentsPageSkeleton"
import { StudentsTable } from "@/components/students/StudentsTable"
import { StudentCard } from "@/components/students/StudentCard"
import { StudentFormDialog } from "@/components/students/StudentFormDialog"
import { StudentEnrollDialog } from "@/components/students/StudentEnrollDialog"
import { StudentsFiltersBar } from "@/components/students/StudentsFiltersBar"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { LayoutGrid, List, Loader2, Users } from "lucide-react"

const defaultStartMonth = () => new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10)

export function StudentsScreen() {
  const router = useRouter()
  const { students, apiClasses, fetchStudents, initialLoading, refreshing } = useStudentsApiData()

  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [savingStudent, setSavingStudent] = useState(false)
  const [enrollOpen, setEnrollOpen] = useState(false)
  const [enrollStudentId, setEnrollStudentId] = useState<number | null>(null)
  const [enrollClassIds, setEnrollClassIds] = useState<number[]>([])
  const [enrollMonthlyFee, setEnrollMonthlyFee] = useState("150")
  const [enrollStartMonth, setEnrollStartMonth] = useState(() => defaultStartMonth())
  const [enrollSubmitting, setEnrollSubmitting] = useState(false)
  const [search, setSearch] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [password, setPassword] = useState("")
  const [selectedClassIds, setSelectedClassIds] = useState<number[]>([])
  const [monthlyFee, setMonthlyFee] = useState("150")
  const [startMonth, setStartMonth] = useState(() => defaultStartMonth())
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [sortBy, setSortBy] = useState<"name" | "classes">("name")
  const [classFilter, setClassFilter] = useState("all")
  const [view, setView] = useState<"grid" | "list">("grid")

  const [studentToRemove, setStudentToRemove] = useState<number | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const openCreate = () => {
    setEditingId(null)
    setFirstName("")
    setLastName("")
    setPassword("")
    setEmail("")
    setPhone("")
    setSelectedClassIds([])
    setMonthlyFee("150")
    setStartMonth(defaultStartMonth())
    setSheetOpen(true)
  }

  const openEdit = (id: number) => {
    const s = students.find((st) => st.id === id)
    if (!s) return
    setEditingId(id)
    const raw = (s.fullName || s.name || "").trim()
    const parts = raw.split(/\s+/)
    setFirstName(parts[0] ?? "")
    setLastName(parts.slice(1).join(" ") || parts[0] || "")
    setPassword("")
    setEmail(s.email?.trim() ?? "")
    setPhone(s.phone?.trim() ?? "")
    const ids = (s.classes ?? []).map((c) => c.classId).filter((x): x is number => typeof x === "number" && x > 0)
    setSelectedClassIds(ids)
    const firstFee = s.classes?.find((c) => c.monthlyFee != null)?.monthlyFee
    setMonthlyFee(firstFee != null ? String(firstFee) : "150")
    setStartMonth(defaultStartMonth())
    setSheetOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (selectedClassIds.length === 0) {
        toast.error("Sinif seçilməyib", { description: "Ən azı bir sinif seçin." })
        return
      }
      const fn = firstName.trim()
      const ln = lastName.trim()
      if (!fn || !ln) {
        toast.error("Ad və soyad tələb olunur")
        return
      }
      const emailTrim = email.trim()
      const phoneTrim = phone.trim()

      if (editingId == null && !emailTrim && !phoneTrim) {
        toast.error("E-poçt və ya telefon tələb olunur", {
          description: "Yeni tələbə üçün ən azı birini daxil edin.",
        })
        return
      }

      if (editingId == null && !password.trim()) {
        toast.error("Parol tələb olunur", { description: "Yeni tələbə üçün giriş parolunu daxil edin." })
        return
      }

      const feeNum = Number.parseFloat(monthlyFee)
      if (Number.isNaN(feeNum) || feeNum < 0) {
        toast.error("Aylıq ödəniş düzgün deyil")
        return
      }
      const body: UpsertStudentPayload = {
        classIds: selectedClassIds,
        firstName: fn,
        lastName: ln,
        monthlyFee: feeNum,
        startMonth,
      }
      if (emailTrim) body.email = emailTrim
      if (phoneTrim) body.phone = phoneTrim

      if (editingId != null) {
        body.studentId = editingId
        const pw = password.trim()
        if (pw) body.password = pw
      } else {
        body.password = password.trim()
      }

      setSavingStudent(true)
      await service.upsertStudent(body)
      await fetchStudents()
      const displayName = `${fn} ${ln}`
      toast.success(editingId != null ? "Tələbə yeniləndi" : "Tələbə yaradıldı", {
        description: `${displayName} ${editingId != null ? "yeniləndi" : "əlavə edildi"}.`,
      })
      setSheetOpen(false)
    } catch (e: unknown) {
      const msg =
        e && typeof e === "object" && "response" in e
          ? (e as { response?: { data?: { message?: string | string[] } } }).response?.data?.message
          : undefined
      const text = Array.isArray(msg) ? msg.join(", ") : msg
      toast.error("Xəta baş verdi", { description: text || "Tələbə əməliyyatı alınmadı" })
    } finally {
      setSavingStudent(false)
    }
  }

  const openEnroll = (studentId: number) => {
    setEnrollStudentId(studentId)
    setEnrollClassIds([])
    setEnrollOpen(true)
  }

  const requestRemoveStudent = (studentId: number) => {
    setStudentToRemove(studentId)
  }

  const confirmRemoveStudent = async () => {
    if (studentToRemove == null) return
    setDeleteLoading(true)
    try {
      await service.deleteStudent(studentToRemove)
      toast.success("Tələbə kursdan çıxarıldı")
      setStudentToRemove(null)
      await fetchStudents()
    } catch (e: unknown) {
      const msg =
        e && typeof e === "object" && "response" in e
          ? (e as { response?: { data?: { message?: string | string[] } } }).response?.data?.message
          : undefined
      const text = Array.isArray(msg) ? msg.join(", ") : msg
      toast.error(text || "Əməliyyat alınmadı")
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleEnroll = async () => {
    if (enrollStudentId == null || enrollClassIds.length === 0) return
    setEnrollSubmitting(true)
    try {
      await service.enrollStudentToClasses({
        studentUserId: enrollStudentId,
        classes: enrollClassIds.map((id) => ({
          classId: id,
          monthlyFee: parseFloat(enrollMonthlyFee),
          startMonth: enrollStartMonth,
        })),
      })
      await fetchStudents()
      const st = students.find((s) => s.id === enrollStudentId)
      toast.success("Tələbə qeydiyyata alındı", {
        description: `${st?.fullName ?? st?.name ?? ""} ${enrollClassIds.length} sinif${enrollClassIds.length > 1 ? "ə" : ""} qeydiyyata alındı.`,
      })
      setEnrollOpen(false)
    } catch (e: unknown) {
      const msg =
        e && typeof e === "object" && "response" in e
          ? (e as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined
      toast.error("Qeydiyyat alınmadı", { description: msg || "Xahiş edirik yenidən cəhd edin." })
    } finally {
      setEnrollSubmitting(false)
    }
  }

  const filteredStudents = useMemo(
    () => filterAndSortStudents(students, search, sortBy, classFilter),
    [students, search, sortBy, classFilter],
  )
  const enrollStudent = enrollStudentId != null ? students.find((s) => s.id === enrollStudentId) ?? null : null

  if (initialLoading) {
    return <StudentsPageSkeleton />
  }

  return (
    <div className="flex flex-col gap-8 min-w-0 max-w-full overflow-x-hidden">
      <StudentsHero onAdd={openCreate} totalCount={students.length} refreshing={refreshing} />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between lg:gap-4 min-w-0">
        <Tabs value={view} onValueChange={(v) => setView(v as "grid" | "list")} className="w-full lg:w-auto shrink-0">
          <TabsList>
            <TabsTrigger value="grid" className="gap-2">
              <LayoutGrid className="h-4 w-4" />
              Kartlar
            </TabsTrigger>
            <TabsTrigger value="list" className="gap-2">
              <List className="h-4 w-4" />
              Siyahı
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <StudentsFiltersBar
          search={search}
          onSearch={setSearch}
          sortBy={sortBy}
          onSortBy={setSortBy}
          classFilter={classFilter}
          onClassFilter={setClassFilter}
          classOptions={apiClasses}
          disabled={refreshing}
        />
      </div>

      <div className={cn("transition-opacity duration-200", refreshing && "opacity-60")}>
        {view === "list" ? (
          <StudentsTable
            students={filteredStudents}
            onEdit={openEdit}
            onEnroll={openEnroll}
            onBilling={(id) => router.push(`/billing?studentId=${id}`)}
            onDelete={requestRemoveStudent}
          />
        ) : filteredStudents.length === 0 ? (
          <Card className="rounded-2xl border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center px-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted mb-4">
                <Users className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground">Tələbə tapılmadı</h3>
              <p className="mt-1 text-sm text-muted-foreground max-w-xs">
                {students.length === 0 ? "Siyahı boşdur." : "Axtarış uyğun gəlmir — fərqli söz sınayın."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 min-w-0">
            {filteredStudents.map((s) => (
              <StudentCard
                key={s.id}
                student={s}
                onEdit={openEdit}
                onEnroll={openEnroll}
                onBilling={(id) => router.push(`/billing?studentId=${id}`)}
                onDelete={requestRemoveStudent}
              />
            ))}
          </div>
        )}
      </div>

      <StudentFormDialog
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        editingId={editingId}
        firstName={firstName}
        setFirstName={setFirstName}
        lastName={lastName}
        setLastName={setLastName}
        password={password}
        setPassword={setPassword}
        email={email}
        setEmail={setEmail}
        phone={phone}
        setPhone={setPhone}
        selectedClassIds={selectedClassIds}
        setSelectedClassIds={setSelectedClassIds}
        monthlyFee={monthlyFee}
        setMonthlyFee={setMonthlyFee}
        startMonth={startMonth}
        setStartMonth={setStartMonth}
        apiClasses={apiClasses}
        onSubmit={handleSave}
        isSaving={savingStudent}
      />
      <StudentEnrollDialog
        open={enrollOpen}
        onOpenChange={setEnrollOpen}
        student={enrollStudent}
        apiClasses={apiClasses}
        enrollClassIds={enrollClassIds}
        setEnrollClassIds={setEnrollClassIds}
        enrollMonthlyFee={enrollMonthlyFee}
        setEnrollMonthlyFee={setEnrollMonthlyFee}
        enrollStartMonth={enrollStartMonth}
        setEnrollStartMonth={setEnrollStartMonth}
        onConfirm={handleEnroll}
        isSubmitting={enrollSubmitting}
      />
      <AlertDialog open={studentToRemove != null} onOpenChange={(open) => !open && setStudentToRemove(null)}>
        <AlertDialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>Tələbəni kursdan çıxarmaq?</AlertDialogTitle>
            <AlertDialogDescription>
              Bu tələbə idarə etdiyiniz kursdan çıxarılacaq; qeydiyyat və həmin kursa aid faktura qeydləri təmizlənir. Profil
              saxlanıla bilər.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col-reverse sm:flex-row gap-2">
            <AlertDialogCancel disabled={deleteLoading}>Ləğv et</AlertDialogCancel>
            <Button type="button" variant="destructive" disabled={deleteLoading} onClick={() => void confirmRemoveStudent()}>
              {deleteLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Bəli, çıxar"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
