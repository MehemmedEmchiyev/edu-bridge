"use client"

import { Card, CardContent } from "@/components/ui/card"
import { DollarSign, Check, CreditCard, AlertCircle } from "lucide-react"
import type { UiInvoice } from "@/lib/invoice-normalize"

type Props = {
  invoices: UiInvoice[]
}

export function BillingStatsCards({ invoices }: Props) {
  const paid = invoices.filter((i) => i.status === "paid")
  const unpaid = invoices.filter((i) => i.status === "unpaid")
  const overdue = invoices.filter((i) => i.status === "overdue")
  const total = invoices.reduce((a, b) => a + b.amount, 0)
  const paidSum = paid.reduce((a, b) => a + b.amount, 0)
  const unpaidSum = unpaid.reduce((a, b) => a + b.amount, 0)
  const overdueSum = overdue.reduce((a, b) => a + b.amount, 0)

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      <Card className="rounded-2xl">
        <CardContent className="p-4 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
            <DollarSign className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Cəmi</p>
            <p className="text-lg font-semibold text-foreground">{total.toFixed(2)}</p>
          </div>
        </CardContent>
      </Card>
      <Card className="rounded-2xl">
        <CardContent className="p-4 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-success/10">
            <Check className="h-4 w-4 text-success" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Ödənilmiş</p>
            <p className="text-lg font-semibold text-foreground">{paidSum.toFixed(2)}</p>
          </div>
        </CardContent>
      </Card>
      <Card className="rounded-2xl">
        <CardContent className="p-4 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-warning/10">
            <CreditCard className="h-4 w-4 text-warning" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Ödənilməmiş</p>
            <p className="text-lg font-semibold text-foreground">{unpaidSum.toFixed(2)}</p>
          </div>
        </CardContent>
      </Card>
      <Card className="rounded-2xl">
        <CardContent className="p-4 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-destructive/10">
            <AlertCircle className="h-4 w-4 text-destructive" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Gecikmiş (UI)</p>
            <p className="text-lg font-semibold text-foreground">{overdueSum.toFixed(2)}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
