/** Maps Eduroom invoice API rows to UI-friendly rows. */
export type UiInvoice = {
  id: string
  studentId: string
  /** Sinif ID — seçilmiş sinifə görə süzgəc üçün */
  classId?: number
  amount: number
  status: "paid" | "unpaid" | "overdue" | "cancelled"
  dueDate: string
  createdAt: string
  description: string
}

function parseAmount(v: unknown): number {
  if (v == null) return 0
  if (typeof v === "number") return Number.isFinite(v) ? v : 0
  const n = parseFloat(String(v))
  return Number.isFinite(n) ? n : 0
}

export function normalizeInvoiceFromApi(inv: Record<string, unknown>): UiInvoice {
  const st = String(inv.status ?? "").toUpperCase()
  const mk = inv.month_key as Date | string | undefined
  const dueRaw =
    mk instanceof Date ? mk.toISOString().slice(0, 10) : String(mk ?? "").slice(0, 10)
  const dueDate = dueRaw.length >= 10 ? dueRaw.slice(0, 10) : new Date().toISOString().slice(0, 10)

  const updated = inv.updated_at as Date | string | undefined
  const createdAt =
    updated instanceof Date
      ? updated.toISOString().slice(0, 10)
      : String(updated ?? dueDate).slice(0, 10)

  let ui: UiInvoice["status"] = "unpaid"
  if (st === "PAID") {
    ui = "paid"
  } else if (st === "WAIVED") {
    ui = "cancelled"
  } else {
    // UNPAID və s. — tarix keçmişdirsə UI-da gecikmiş
    const due = new Date(dueDate + "T12:00:00")
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    due.setHours(0, 0, 0, 0)
    if (due < today) ui = "overdue"
    else ui = "unpaid"
  }

  const classIdRaw = inv.class_id ?? inv.classId
  const classId = typeof classIdRaw === "number" ? classIdRaw : parseInt(String(classIdRaw ?? ""), 10)

  return {
    id: String(inv.id),
    studentId: String(inv.student_user_id ?? inv.studentUserId ?? ""),
    classId: Number.isFinite(classId) ? classId : undefined,
    amount: parseAmount(inv.amount),
    status: ui,
    dueDate,
    createdAt,
    description: `Ödəniş — ${dueDate}`,
  }
}
export function uiInvoiceStatusToApi(status: string): string {
  const map: Record<string, string> = {
    paid: "PAID",
    unpaid: "UNPAID",
    overdue: "UNPAID",
    cancelled: "WAIVED",
  }
  return map[status] ?? status.toUpperCase()
}
