"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import type { UiInvoice } from "@/lib/invoice-normalize"
import type { Invoice } from "@/lib/genereal-types"

type Props = {
  invoices: UiInvoice[]
  /** Filtr/sinifdən əvvəl ümumi faktura sayı */
  totalInvoiceCount: number
  emptyHint: string
  canFullPay: boolean
  sortInvoices: "date" | "amount" | "status"
  onSortChange: (v: "date" | "amount" | "status") => void
  onGenerateClick: () => void
  onFullPayClick: () => void
  onStatusChange: (invoiceId: string, status: string) => void
  statusUpdatingInvoiceId: string | null
  bulkInvoiceStatusPending: boolean
}

function statusBadge(status: Invoice["status"]) {
  switch (status) {
    case "paid":
      return <Badge className="bg-success/10 text-success border-success/20" variant="outline">Ödənilmiş</Badge>
    case "unpaid":
      return <Badge className="bg-warning/10 text-warning-foreground border-warning/20" variant="outline">Ödənilməmiş</Badge>
    case "overdue":
      return <Badge variant="destructive">Gecikmiş</Badge>
    case "cancelled":
      return <Badge variant="secondary">Ləğv edilmiş</Badge>
  }
}

export function BillingInvoiceTable({
  invoices,
  totalInvoiceCount,
  emptyHint,
  canFullPay,
  sortInvoices,
  onSortChange,
  onGenerateClick,
  onFullPayClick,
  onStatusChange,
  statusUpdatingInvoiceId,
  bulkInvoiceStatusPending,
}: Props) {
  const billingActions = (
    <div className="flex flex-wrap gap-3">
      <Button onClick={onGenerateClick} variant="default" className="gap-2">
        Faktura yaradın
      </Button>
      <Button
        type="button"
        onClick={onFullPayClick}
        variant="outline"
        className="gap-2"
        disabled={!canFullPay}
        title={
          canFullPay
            ? "Bu sinif üçün bütün ödənilməmiş fakturaları ödənilmiş kimi qeyd et"
            : "Əvvəlcə bu sinif üçün ödənilməmiş faktura olmalıdır"
        }
      >
        Tam ödəniş
      </Button>
    </div>
  )

  if (invoices.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        {billingActions}
        <Card className="rounded-2xl border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center px-4">
            <h3 className="text-lg font-medium text-foreground">Faktura siyahısı boşdur</h3>
            <p className="mt-2 text-sm text-muted-foreground max-w-md text-balance">{emptyHint}</p>
            
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={onGenerateClick} variant="outline" className="gap-2">
          Faktura yaradın
        </Button>
        <Button
          type="button"
          onClick={onFullPayClick}
          variant="outline"
          className="gap-2"
          disabled={!canFullPay}
          title={
            canFullPay ? undefined : "Bu sinif üçün ödənilməmiş faktura yoxdur — tam ödəniş mümkün deyil"
          }
        >
          Tam ödəniş
        </Button>
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-sm text-muted-foreground font-medium">Sırala:</span>
          <select
            value={sortInvoices}
            onChange={(e) => onSortChange(e.target.value as "date" | "amount" | "status")}
            className="h-9 px-3 rounded-lg border border-border bg-card text-sm text-foreground cursor-pointer hover:border-primary/50 transition-colors"
          >
            <option value="date">Tarix (Ən yeni)</option>
            <option value="amount">Məbləğ (Yüksəkdən aşağıya)</option>
            <option value="status">Status prioriteti</option>
          </select>
        </div>
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Təsvir</TableHead>
              <TableHead>Məbləğ</TableHead>
              <TableHead className="hidden sm:table-cell">Ay</TableHead>
              <TableHead className="hidden md:table-cell">Yenilənib</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((inv) => (
              <TableRow key={inv.id}>
                <TableCell className="font-medium text-foreground">{inv.description}</TableCell>
                <TableCell className="text-foreground">{Number(inv.amount).toFixed(2)}</TableCell>
                <TableCell className="hidden sm:table-cell text-muted-foreground">{inv.dueDate}</TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground">{inv.createdAt}</TableCell>
                <TableCell>
                  {bulkInvoiceStatusPending || statusUpdatingInvoiceId === inv.id ? (
                    <Skeleton className="h-8 w-36 rounded-md" aria-hidden />
                  ) : (
                    <Select value={inv.status} onValueChange={(val) => onStatusChange(inv.id, val)}>
                      <SelectTrigger className="w-36 h-8 text-xs">
                        <SelectValue>{statusBadge(inv.status)}</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="paid">Ödənilmiş</SelectItem>
                        <SelectItem value="unpaid">Ödənilməmiş</SelectItem>
                        <SelectItem value="overdue">Gecikmiş</SelectItem>
                        <SelectItem value="cancelled">Ləğv</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  )
}
