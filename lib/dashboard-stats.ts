import type { UiInvoice } from "@/lib/invoice-normalize"

export type MonthFinancials = {
  monthKey: string
  /** Ləğv edilməyən fakturaların cəmi */
  expectedTotal: number
  /** Ödənilmiş fakturaların cəmi */
  collectedTotal: number
  /** Ödənilməmiş + gecikmiş (cari ay üzrə) */
  remainingTotal: number
  invoiceCount: number
  paidCount: number
  unpaidCount: number
  /** expectedTotal > 0 olduqda 0–100 */
  collectionRatePercent: number
}

export type StudentOutstandingRow = {
  studentId: number
  studentName: string
  remainingAmount: number
  unpaidInvoices: number
}

export type DashboardSnapshot = {
  month: MonthFinancials
  outstandingStudents: StudentOutstandingRow[]
  /** Bütün dövr: ödənilməmiş+gecikmiş cəm */
  allTimeOutstanding: number
  allTimeOverdueAmount: number
  overdueInvoiceCount: number
  totalEnrollments: number
}

export function formatMonthKey(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  return `${y}-${m}`
}

export function studentDisplayName(s: { fullName?: string; name?: string }): string {
  const t = (s.fullName || s.name || "").trim()
  return t || "Adsız"
}

export function buildDashboardSnapshot(
  invoices: UiInvoice[],
  students: { id: number; fullName?: string; name?: string }[],
  monthKey: string,
): DashboardSnapshot {
  const nameById = new Map<number, string>()
  for (const s of students) {
    nameById.set(s.id, studentDisplayName(s))
  }

  const inMonth = invoices.filter((inv) => inv.dueDate.slice(0, 7) === monthKey)
  let expectedTotal = 0
  let collectedTotal = 0
  let remainingTotal = 0
  let paidCount = 0
  let unpaidCount = 0

  const remainingByStudent = new Map<number, number>()
  const unpaidCountByStudent = new Map<number, number>()

  for (const inv of inMonth) {
    if (inv.status === "cancelled") continue
    expectedTotal += inv.amount
    if (inv.status === "paid") {
      collectedTotal += inv.amount
      paidCount += 1
    } else {
      remainingTotal += inv.amount
      unpaidCount += 1
      const sid = parseInt(inv.studentId, 10)
      if (Number.isFinite(sid)) {
        remainingByStudent.set(sid, (remainingByStudent.get(sid) ?? 0) + inv.amount)
        unpaidCountByStudent.set(sid, (unpaidCountByStudent.get(sid) ?? 0) + 1)
      }
    }
  }

  const collectionRatePercent =
    expectedTotal > 0 ? Math.min(100, Math.round((collectedTotal / expectedTotal) * 1000) / 10) : 0

  const outstandingStudents: StudentOutstandingRow[] = [...remainingByStudent.entries()]
    .map(([studentId, remainingAmount]) => ({
      studentId,
      studentName: nameById.get(studentId) ?? `ID ${studentId}`,
      remainingAmount,
      unpaidInvoices: unpaidCountByStudent.get(studentId) ?? 0,
    }))
    .filter((r) => r.remainingAmount > 0)
    .sort((a, b) => b.remainingAmount - a.remainingAmount)

  let allTimeOutstanding = 0
  let allTimeOverdueAmount = 0
  let overdueInvoiceCount = 0
  for (const inv of invoices) {
    if (inv.status === "cancelled" || inv.status === "paid") continue
    allTimeOutstanding += inv.amount
    if (inv.status === "overdue") {
      allTimeOverdueAmount += inv.amount
      overdueInvoiceCount += 1
    }
  }

  let totalEnrollments = 0
  for (const s of students) {
    const cls = (s as { classes?: unknown[] }).classes
    totalEnrollments += Array.isArray(cls) ? cls.length : 0
  }

  return {
    month: {
      monthKey,
      expectedTotal,
      collectedTotal,
      remainingTotal,
      invoiceCount: inMonth.filter((i) => i.status !== "cancelled").length,
      paidCount,
      unpaidCount,
      collectionRatePercent,
    },
    outstandingStudents,
    allTimeOutstanding,
    allTimeOverdueAmount,
    overdueInvoiceCount,
    totalEnrollments,
  }
}
