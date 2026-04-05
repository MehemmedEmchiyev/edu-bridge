"use client"

import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import service, { type CourseSpecialization } from "@/lib/api"
import type { TeacherListItem, UpdateTeacherPayload } from "@/types/create-teacher.type"
import { zodResolver } from "@hookform/resolvers/zod"
import { LoaderCircle, Plus, Save } from "lucide-react"
import Link from "next/link"
import { useEffect, useMemo, useRef, useState, type MutableRefObject } from "react"
import { useForm } from "react-hook-form"
import PhoneInput from "react-phone-number-input"
import "react-phone-number-input/style.css"
import { z } from "zod"
import { Button } from "../ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form"
import { Skeleton } from "../ui/skeleton"
import { toast } from "sonner"

function buildTeacherFormSchema(isEditRef: MutableRefObject<boolean>) {
  return z
    .object({
      photoUrl: z.string().optional(),
      email: z.string().email("Doğru e-poçt adresi daxil edin"),
      fullName: z.string().min(3, "Ən az 3 simvol olmalıdır"),
      phone: z.string().min(1, "Nömrə daxil edin"),
      specialty: z.string().min(1, "İxtisas daxil edin"),
      password: z.string().optional(),
      status: z.enum(["ACTIVE", "INACTIVE"]),
    })
    .superRefine((data, ctx) => {
      const isEdit = isEditRef.current
      if (!isEdit) {
        if (!data.password || data.password.length < 8) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Ən az 8 simvol olmalıdır", path: ["password"] })
        }
      } else if (data.password && data.password.length > 0 && data.password.length < 8) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Ən az 8 simvol olmalıdır", path: ["password"] })
      }
    })
}

type TeacherFormValues = z.infer<ReturnType<typeof buildTeacherFormSchema>>

const emptyDefaults: TeacherFormValues = {
  photoUrl: "",
  email: "",
  fullName: "",
  phone: "",
  password: "",
  specialty: "",
  status: "ACTIVE",
}

type AddTeacherProps = {
  sheetOpen: boolean
  setSheetOpen: (open: boolean) => void
  editingTeacher: TeacherListItem | null
  flag: boolean
  setFlag: (v: boolean | ((prev: boolean) => boolean)) => void
}

const AddTeacher = ({ sheetOpen, setSheetOpen, editingTeacher, flag, setFlag }: AddTeacherProps) => {
  const isEditRef = useRef(false)
  isEditRef.current = !!editingTeacher
  const teacherFormSchema = useMemo(() => buildTeacherFormSchema(isEditRef), [])

  const form = useForm<TeacherFormValues>({
    resolver: zodResolver(teacherFormSchema),
    defaultValues: emptyDefaults,
  })

  const [loader, setLoader] = useState(false)
  const [specOptions, setSpecOptions] = useState<CourseSpecialization[]>([])
  const [specsLoading, setSpecsLoading] = useState(false)

  useEffect(() => {
    if (!sheetOpen) return
    let cancelled = false
    setSpecsLoading(true)
    void service
      .getSpecializations()
      .then((res) => {
        if (!cancelled) setSpecOptions((res.data as CourseSpecialization[]) ?? [])
      })
      .catch(() => {
        if (!cancelled) setSpecOptions([])
      })
      .finally(() => {
        if (!cancelled) setSpecsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [sheetOpen])

  useEffect(() => {
    if (!sheetOpen) return
    if (editingTeacher) {
      form.reset({
        photoUrl: editingTeacher.photoUrl ?? "",
        email: editingTeacher.email ?? "",
        fullName: editingTeacher.fullName ?? "",
        phone: editingTeacher.phone ?? "",
        password: "",
        specialty: editingTeacher.specialty ?? "",
        status: editingTeacher.status === "INACTIVE" ? "INACTIVE" : "ACTIVE",
      })
    } else {
      form.reset(emptyDefaults)
    }
  }, [sheetOpen, editingTeacher, form])

  const handleSubmit = async (values: TeacherFormValues) => {
    setLoader(true)
    try {
      if (editingTeacher) {
        const payload: UpdateTeacherPayload = {
          fullName: values.fullName,
          email: values.email,
          phone: values.phone,
          specialty: values.specialty,
          status: values.status,
        }
        if (values.photoUrl) payload.photoUrl = values.photoUrl
        if (values.password && values.password.length >= 8) payload.password = values.password
        await service.updateTeacher(editingTeacher.id, payload)
        toast.success("Müəllim yeniləndi")
      } else {
        await service.createTeacher({
          ...values,
          photoUrl: values.photoUrl ?? "",
          password: values.password ?? "",
          status: values.status,
        })
        toast.success("Müəllim uğurla yaradıldı")
      }
      setSheetOpen(false)
      setFlag(!flag)
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string | string[] } } }
      const msg = err.response?.data?.message
      const text = Array.isArray(msg) ? msg.join(", ") : msg || "Xəta baş verdi"
      toast.error(text)
    } finally {
      setLoader(false)
    }
  }

  return (
    <Dialog open={sheetOpen} onOpenChange={setSheetOpen}>
      <DialogContent className="overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{editingTeacher ? "Müəllimi redaktə edin" : "Müəllim əlavə edin"}</DialogTitle>
          <DialogDescription>
            {editingTeacher
              ? "Bu müəllim üçün məlumatları yeniləyin. Şifrəni dəyişmək istəməsəniz, boş buraxın."
              : "Kurs komandanıza yeni müəllim əlavə edin."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col gap-4 px-4">
            <FormField
              control={form.control}
              name="photoUrl"
              render={({ field: { onChange, ref } }) => (
                <FormItem>
                  <FormLabel>Şəkil</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/*"
                      ref={ref}
                      onChange={async (e) => {
                        const file = e.target.files?.[0]
                        if (!file) return
                        setLoader(true)
                        try {
                          const formData = new FormData()
                          formData.append("file", file)
                          formData.append("folder", "teachers")
                          const res = await service.upload(formData)
                          const url = res?.data?.url as string | undefined
                          if (url) onChange(url)
                        } catch {
                          toast.error("Şəkil yüklənmədi")
                        } finally {
                          setLoader(false)
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tam ad</FormLabel>
                  <FormControl>
                    <Input placeholder="Jane Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-poçt</FormLabel>
                  <FormControl>
                    <Input placeholder="admin@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{editingTeacher ? "Yeni şifrə (istəyə bağlı)" : "Şifrə"}</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder={editingTeacher ? "Dəyişmək üçün daxil edin" : "Müəllim üçün şifrə"} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nömrə</FormLabel>
                  <FormControl>
                    <PhoneInput
                      className="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"
                      {...field}
                      placeholder="Nömrə"
                      defaultCountry="AZ"
                      international
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="specialty"
              render={({ field }) => {
                const hasList = specOptions.length > 0
                const valueInList = specOptions.some((s) => s.name === field.value)
                return (
                  <FormItem>
                    <FormLabel>İxtisas</FormLabel>
                    {specsLoading ? (
                      <Skeleton className="h-9 w-full rounded-md" />
                    ) : hasList ? (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value ? field.value : undefined}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="İxtisas seçin" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {!valueInList && field.value ? (
                            <SelectItem value={field.value}>{field.value} (cari)</SelectItem>
                          ) : null}
                          {specOptions.map((s) => (
                            <SelectItem key={s.id} value={s.name}>
                              {s.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <FormControl>
                        <Input placeholder="Riyaziyyat" {...field} />
                      </FormControl>
                    )}
                    {!hasList && !specsLoading ? (
                      <p className="text-xs text-muted-foreground">
                        <Link href="/specializations" className="text-primary underline-offset-4 hover:underline">
                          İxtisaslar
                        </Link>{" "}
                        səhifəsindən siyahı yaradın — sonra burada seçim əlçatan olacaq.
                      </p>
                    ) : null}
                    <FormMessage />
                  </FormItem>
                )
              }}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Aktiv</SelectItem>
                      <SelectItem value="INACTIVE">Qeyri-aktiv</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={loader} className="mt-2 gap-2">
              {loader ? (
                <LoaderCircle className="animate-spin h-4 w-4" />
              ) : editingTeacher ? (
                <>
                  <Save className="h-4 w-4" /> Dəyişiklikləri yadda saxla
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" /> Müəllim əlavə edin
                </>
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default AddTeacher
