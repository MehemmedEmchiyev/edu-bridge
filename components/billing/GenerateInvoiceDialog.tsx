"use client"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const MONTHS = [
  { value: 1, label: "Yanvar", short: "Yan" },
  { value: 2, label: "Fevral", short: "Fev" },
  { value: 3, label: "Mart", short: "Mar" },
  { value: 4, label: "Aprel", short: "Apr" },
  { value: 5, label: "May", short: "May" },
  { value: 6, label: "İyun", short: "İyun" },
  { value: 7, label: "İyul", short: "İyul" },
  { value: 8, label: "Avqust", short: "Avq" },
  { value: 9, label: "Sentyabr", short: "Sen" },
  { value: 10, label: "Oktyabr", short: "Okt" },
  { value: 11, label: "Noyabr", short: "Noy" },
  { value: 12, label: "Dekabr", short: "Dek" },
]

const ALL_MONTH_VALUES = MONTHS.map((m) => m.value)

type Props = {
  open: boolean
  onOpenChange: (v: boolean) => void
  studentName?: string
  genMonths: number[]
  setGenMonths: React.Dispatch<React.SetStateAction<number[]>>
  genAmount: string
  setGenAmount: (v: string) => void
  onSubmit: () => void
  isSubmitting?: boolean
}

export function GenerateInvoiceDialog({
  open,
  onOpenChange,
  studentName,
  genMonths,
  setGenMonths,
  genAmount,
  setGenAmount,
  onSubmit,
  isSubmitting = false,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl">
        <DialogHeader>
          <DialogTitle>Faktura yaradın</DialogTitle>
          <DialogDescription>
            {studentName
              ? `${studentName} üçün ödəniş aylarını seçin. Mövcud qaydalara uyğun fakturalar yaradılacaq.`
              : "Ayları seçin."}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Label className="m-0">Ayları seçin (say)</Label>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="h-8"
                  disabled={isSubmitting}
                  onClick={() => setGenMonths(ALL_MONTH_VALUES)}
                >
                  Bütün ayları seç
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8"
                  disabled={isSubmitting}
                  onClick={() => setGenMonths([])}
                >
                  Təmizlə
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {MONTHS.map((m) => (
                <label key={m.value} className="flex items-center gap-2 cursor-pointer text-sm">
                  <Checkbox
                    disabled={isSubmitting}
                    checked={genMonths.includes(m.value)}
                    onCheckedChange={(checked) => {
                      if (checked) setGenMonths((prev) => [...prev, m.value])
                      else setGenMonths((prev) => prev.filter((v) => v !== m.value))
                    }}
                  />
                  {m.short}
                </label>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="gen-amount">Məbləğ (istinad)</Label>
            <Input
              id="gen-amount"
              type="number"
              min="0"
              step="0.01"
              value={genAmount}
              onChange={(e) => setGenAmount(e.target.value)}
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground">
              Göstərilir: seçilmiş tələbə və sinif üçün qeydiyyatdakı aylıq ödəniş (istinad məbləği).
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Ləğv et
          </Button>
          <Button onClick={onSubmit} disabled={genMonths.length === 0 || isSubmitting}>
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Yaradılır...
              </span>
            ) : genMonths.length === 0 ? (
              "Ay seçin"
            ) : (
              `${genMonths.length} ay üçün faktura yaradın`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
