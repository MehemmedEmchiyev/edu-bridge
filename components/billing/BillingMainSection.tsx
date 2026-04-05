"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Receipt } from "lucide-react"
import type { UiInvoice } from "@/lib/invoice-normalize"
import { BillingStatsCards } from "@/components/billing/BillingStatsCards"
import { BillingInvoiceTable } from "@/components/billing/BillingInvoiceTable"
import { BillingInvoicesSkeleton } from "@/components/billing/BillingInvoicesSkeleton"

type Props = {
  selectedStudentId: string
  invoicesLoading: boolean
  studentInvoices: UiInvoice[]
  /** Filtrdən əvvəl ümumi say (boş mesaj üçün) */
  totalInvoiceCount: number
  invoiceEmptyHint: string
  /** Seçilmiş sinifdə ödənilməmiş faktura varmı (tam ödəniş) */
  canFullPay: boolean
  sortInvoices: "date" | "amount" | "status"
  onSortChange: (v: "date" | "amount" | "status") => void
  onGenerateClick: () => void
  onFullPayClick: () => void
  onStatusChange: (invoiceId: string, status: string) => void
  /** Tək faktura statusu yenilənərkən həmin sətir üçün Skeleton */
  statusUpdatingInvoiceId: string | null
  /** Tam ödəniş emalı — bütün sətirlərdə status sütununda Skeleton */
  bulkInvoiceStatusPending: boolean
}

export function BillingMainSection({
  selectedStudentId,
  invoicesLoading,
  studentInvoices,
  totalInvoiceCount,
  invoiceEmptyHint,
  canFullPay,
  sortInvoices,
  onSortChange,
  onGenerateClick,
  onFullPayClick,
  onStatusChange,
  statusUpdatingInvoiceId,
  bulkInvoiceStatusPending,
}: Props) {
  if (!selectedStudentId) {
    return (
      <Card className="rounded-2xl border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted mb-4">
            <Receipt className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground">Tələbə seçin</h3>
          <p className="mt-1 text-sm text-muted-foreground max-w-xs">
            Fakturaları görmək üçün yuxarıdan tələbə seçin. İstəsəniz tələbələr səhifəsindən birbaşa da keçə bilərsiniz.
          </p>
        </CardContent>
      </Card>
    )
  }

  if (invoicesLoading) {
    return <BillingInvoicesSkeleton />
  }

  return (
    <>
      <BillingStatsCards invoices={studentInvoices} />
      <BillingInvoiceTable
        invoices={studentInvoices}
        totalInvoiceCount={totalInvoiceCount}
        emptyHint={invoiceEmptyHint}
        canFullPay={canFullPay}
        sortInvoices={sortInvoices}
        onSortChange={onSortChange}
        onGenerateClick={onGenerateClick}
        onFullPayClick={onFullPayClick}
        onStatusChange={onStatusChange}
        statusUpdatingInvoiceId={statusUpdatingInvoiceId}
        bulkInvoiceStatusPending={bulkInvoiceStatusPending}
      />
    </>
  )
}
