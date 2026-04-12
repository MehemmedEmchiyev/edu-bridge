"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { toast } from "sonner"
import service from "@/lib/api"
import { normalizeInvoiceFromApi, type UiInvoice } from "@/lib/invoice-normalize"
import { BillingHero } from "@/components/billing/BillingHero"
import { BillingStudentPicker } from "@/components/billing/BillingStudentPicker"
import { BillingMainSection } from "@/components/billing/BillingMainSection"
import { BillingPickerSkeleton } from "@/components/billing/BillingPickerSkeleton"
import { GenerateInvoiceDialog } from "@/components/billing/GenerateInvoiceDialog"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

export function BillingScreen() {
  const searchParams = useSearchParams()
  const [students, setStudents] = useState<
    {
      id: number
      fullName?: string
      name?: string
      classes?: { classId?: number; className?: string; monthlyFee?: number }[]
    }[]
  >([])
  const [classOptions, setClassOptions] = useState<{ id: number; name: string }[]>([])
  const [invoices, setInvoices] = useState<UiInvoice[]>([])
  const [pageLoading, setPageLoading] = useState(true)
  const [invoicesLoading, setInvoicesLoading] = useState(false)

  const [selectedStudentId, setSelectedStudentId] = useState("")
  const [selectedClassId, setSelectedClassId] = useState("")
  const [comboOpen, setComboOpen] = useState(false)
  const [generateOpen, setGenerateOpen] = useState(false)
  const [fullPayConfirmOpen, setFullPayConfirmOpen] = useState(false)

  const [genMonths, setGenMonths] = useState<number[]>([])
  const [genAmount, setGenAmount] = useState("150")
  const [sortInvoices, setSortInvoices] = useState<"date" | "amount" | "status">("date")
  const [genPending, setGenPending] = useState(false)
  const [fullPayPending, setFullPayPending] = useState(false)
  /** Faktura statusu PATCH gedənə qədər həmin sətirdə Skeleton */
  const [statusUpdatingInvoiceId, setStatusUpdatingInvoiceId] = useState<string | null>(null)

  const loadPage = useCallback(async () => {
    setPageLoading(true)
    try {
      const [st, cl] = await Promise.all([service.getStudents(), service.getClasses()])
      setStudents(st.data || [])
      const rows = cl.data as { id: number; name: string }[] | undefined
      setClassOptions(rows ?? [])
    } catch {
      setStudents([])
      setClassOptions([])
    } finally {
      setPageLoading(false)
    }
  }, [])

  useEffect(() => {
    loadPage()
  }, [loadPage])

  useEffect(() => {
    const sid = searchParams.get("studentId")
    const cid = searchParams.get("classId")
    if (sid) setSelectedStudentId(sid)
    if (cid) setSelectedClassId(cid)
  }, [searchParams])

  const classNameById = useMemo(() => {
    const m = new Map<number, string>()
    for (const c of classOptions) m.set(c.id, c.name)
    return m
  }, [classOptions])

  /** Yalnız seçilmiş tələbənin qeydiyyatda olduğu siniflər */
  const enrolledClassOptions = useMemo(() => {
    if (!selectedStudentId) return [] as { id: number; name: string }[]
    const st = students.find((s) => String(s.id) === selectedStudentId)
    if (!st?.classes?.length) return []
    const seen = new Set<number>()
    const out: { id: number; name: string }[] = []
    for (const en of st.classes) {
      const cid = en.classId
      if (cid == null || seen.has(cid)) continue
      seen.add(cid)
      const name = classNameById.get(cid) ?? (en.className?.trim() || `Sinif #${cid}`)
      out.push({ id: cid, name })
    }
    return out
  }, [selectedStudentId, students, classNameById])

  /** Seçilmiş sinif həmişə tələbənin qeydiyyat siyahısında olsun (URL ilkin təyin ayrı effektdə) */
  useEffect(() => {
    if (pageLoading) return
    if (!selectedStudentId) {
      setSelectedClassId("")
      return
    }
    if (enrolledClassOptions.length === 0) {
      setSelectedClassId("")
      return
    }
    const valid = new Set(enrolledClassOptions.map((c) => String(c.id)))
    if (selectedClassId && valid.has(selectedClassId)) return
    setSelectedClassId(String(enrolledClassOptions[0].id))
  }, [pageLoading, selectedStudentId, enrolledClassOptions, selectedClassId])

  useEffect(() => {
    if (!selectedStudentId || !selectedClassId) return
    const st = students.find((s) => String(s.id) === selectedStudentId)
    if (!st) return
    const cls = st.classes?.find((c) => String(c.classId) === selectedClassId)
    const fee = cls?.monthlyFee
    if (fee != null && !Number.isNaN(Number(fee))) {
      setGenAmount(String(fee))
    }
  }, [selectedStudentId, selectedClassId, students])

  useEffect(() => {
    if (!selectedStudentId) {
      setInvoices([])
      setInvoicesLoading(false)
      return
    }
    let cancelled = false
      ; (async () => {
        setInvoicesLoading(true)
        try {
          const res = await service.getStudentInvoices(selectedStudentId)
          const raw = (res.data || []) as Record<string, unknown>[]
          if (!cancelled) setInvoices(raw.map((r) => normalizeInvoiceFromApi(r)))
        } catch (e: unknown) {
          if (!cancelled) {
            setInvoices([])
            const msg =
              e && typeof e === "object" && "response" in e
                ? (e as { response?: { data?: { message?: string } } }).response?.data?.message
                : undefined
            toast.error("Fakturalar yüklənmədi", {
              description: typeof msg === "string" ? msg : "Giriş və ya tələbə qeydiyyatını yoxlayın.",
            })
          }
        } finally {
          if (!cancelled) setInvoicesLoading(false)
        }
      })()
    return () => {
      cancelled = true
    }
  }, [selectedStudentId])

  const studentInvoices = useMemo(() => {
    let list = [...invoices]
    if (selectedClassId) {
      list = list.filter((inv) => String(inv.classId ?? "") === selectedClassId)
    }
    return list.sort((a, b) => {
      switch (sortInvoices) {
        case "amount":
          return b.amount - a.amount
        case "status": {
          const order: Record<string, number> = { overdue: 0, unpaid: 1, paid: 2, cancelled: 3 }
          return (order[a.status] ?? 9) - (order[b.status] ?? 9)
        }
        case "date":
        default:
          return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()
      }
    })
  }, [invoices, selectedClassId, sortInvoices])

  const invoiceEmptyHint =
    invoices.length > 0 && studentInvoices.length === 0 && selectedClassId
      ? "Bu sinif üçün faktura yoxdur — başqa sinif seçin və ya «Faktura yaradın» ilə əlavə ay əlavə edin."
      : "Yeni tələbə və ya sinifə qeydiyyatda kursun başlama/bitmə tarixinə qədər fakturalar avtomatik yaradılır. Əlavə aylar lazımdırsa «Faktura yaradın» istifadə edin."

  /** Tam ödəniş yalnız seçilmiş sinifdə ödənilməmiş/gecikmiş faktura olduqda */
  const canFullPay = useMemo(() => {
    if (!selectedClassId) return false
    return invoices.some(
      (inv) =>
        String(inv.classId ?? "") === selectedClassId &&
        (inv.status === "unpaid" || inv.status === "overdue"),
    )
  }, [invoices, selectedClassId])

  const selectedStudent = students.find((s) => String(s.id) === selectedStudentId)
  const studentDisplayName = selectedStudent?.fullName || selectedStudent?.name

  const handleGenerate = async () => {
    if (genMonths.length === 0 || !selectedStudentId || !selectedClassId) return
    setGenPending(true)
    try {
      const y = new Date().getFullYear()
      const startMonth = `${y}-01`
      await service.generateStudentInvoices(selectedStudentId, {
        classId: selectedClassId,
        startMonth,
        monthsCount: genMonths.length,
      })
      const res = await service.getStudentInvoices(selectedStudentId)
      const raw = (res.data || []) as Record<string, unknown>[]
      setInvoices(raw.map((r) => normalizeInvoiceFromApi(r)))
      toast.success("Fakturalar yaradıldı", {
        description: `${studentDisplayName ?? "Tələbə"} üçün seçilmiş aylar üzrə fakturalar əlavə olundu.`,
      })
      setGenerateOpen(false)
      setGenMonths([])
    } catch (e: unknown) {
      const msg =
        e && typeof e === "object" && "response" in e
          ? (e as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined
      toast.error("Əməliyyat alınmadı", { description: msg || "Fakturalar yaradıla bilmədi." })
    } finally {
      setGenPending(false)
    }
  }

  const handleFullPayment = async () => {
    if (!selectedStudentId || !selectedClassId) return
    if (!canFullPay) {
      toast.error("Tam ödəniş mümkün deyil", {
        description: "Seçilmiş sinif üçün ödənilməmiş faktura yoxdur.",
      })
      return
    }
    setFullPayPending(true)
    try {
      await service.processFullPayment(selectedStudentId, {
        classId: selectedClassId,
        method: "cash",
      })
      const res = await service.getStudentInvoices(selectedStudentId)
      const raw = (res.data || []) as Record<string, unknown>[]
      setInvoices(raw.map((r) => normalizeInvoiceFromApi(r)))
      toast.success("Ödəniş qeydə alındı", { description: "Bu sinif üzrə bütün ödənilməmiş fakturalar ödənilmiş kimi qeyd olundu." })
      setFullPayConfirmOpen(false)
    } catch (e: unknown) {
      const msg =
        e && typeof e === "object" && "response" in e
          ? (e as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined
      toast.error("Əməliyyat alınmadı", { description: msg || "Tam ödəniş qeydə alınmadı." })
    } finally {
      setFullPayPending(false)
    }
  }

  const onStatusChange = async (invoiceId: string, status: string) => {
    if (!selectedStudentId) return
    setStatusUpdatingInvoiceId(invoiceId)
    try {
      await service.updateInvoiceStatus(invoiceId, { status })
      const res = await service.getStudentInvoices(selectedStudentId)
      const raw = (res.data || []) as Record<string, unknown>[]
      setInvoices(raw.map((r) => normalizeInvoiceFromApi(r)))
      toast.success("Status yeniləndi", { description: "Faktura uğurla yeniləndi." })
    } catch (e: unknown) {
      const msg =
        e && typeof e === "object" && "response" in e
          ? (e as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined
      toast.error("Yeniləmə alınmadı", { description: msg })
    } finally {
      setStatusUpdatingInvoiceId(null)
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <BillingHero />

      {pageLoading ? (
        <BillingPickerSkeleton />
      ) : (
        <BillingStudentPicker
          students={students}
          selectedStudentId={selectedStudentId}
          onStudentId={setSelectedStudentId}
          comboOpen={comboOpen}
          onComboOpen={setComboOpen}
          classOptions={enrolledClassOptions}
          selectedClassId={selectedClassId}
          onClassId={setSelectedClassId}
          loading={false}
        />
      )}

      <BillingMainSection
        selectedStudentId={selectedStudentId}
        invoicesLoading={invoicesLoading}
        studentInvoices={studentInvoices}
        totalInvoiceCount={invoices.length}
        invoiceEmptyHint={invoiceEmptyHint}
        canFullPay={canFullPay}
        sortInvoices={sortInvoices}
        onSortChange={setSortInvoices}
        onGenerateClick={() => setGenerateOpen(true)}
        onFullPayClick={() => setFullPayConfirmOpen(true)}
        onStatusChange={onStatusChange}
        statusUpdatingInvoiceId={statusUpdatingInvoiceId}
        bulkInvoiceStatusPending={fullPayPending}
      />

      <GenerateInvoiceDialog
        open={generateOpen}
        onOpenChange={setGenerateOpen}
        studentName={studentDisplayName}
        genMonths={genMonths}
        setGenMonths={setGenMonths}
        genAmount={genAmount}
        setGenAmount={setGenAmount}
        onSubmit={handleGenerate}
        isSubmitting={genPending}
      />

      <AlertDialog open={fullPayConfirmOpen} onOpenChange={setFullPayConfirmOpen}>
        <AlertDialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Tam ödənişi təsdiq edin</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>
                  {studentDisplayName ? (
                    <>
                      <span className="font-medium text-foreground">{studentDisplayName}</span> üçün{" "}
                    </>
                  ) : null}
                  bu sinif üzrə bütün ödənilməmiş fakturalar ödənilmiş  kimi qeyd olunacaq.
                </p>
                {!canFullPay && (
                  <p className="text-destructive">Bu sinif üçün ödənilməmiş faktura yoxdur — əməliyyat tətbiq olunmayacaq.</p>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col-reverse sm:flex-row gap-2">
            <AlertDialogCancel disabled={fullPayPending}>Ləğv et</AlertDialogCancel>
            <Button
              type="button"
              disabled={fullPayPending || !canFullPay}
              onClick={() => void handleFullPayment()}
            >
              {fullPayPending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Emal edilir...
                </span>
              ) : (
                "Təsdiq et"
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
