"use client"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Loader2 } from "lucide-react"

type ClassOption = { id: number; name: string }

type Props = {
  open: boolean
  onOpenChange: (v: boolean) => void
  editingId: number | null
  firstName: string
  setFirstName: (v: string) => void
  lastName: string
  setLastName: (v: string) => void
  password: string
  setPassword: (v: string) => void
  email: string
  setEmail: (v: string) => void
  phone: string
  setPhone: (v: string) => void
  selectedClassIds: number[]
  setSelectedClassIds: React.Dispatch<React.SetStateAction<number[]>>
  monthlyFee: string
  setMonthlyFee: (v: string) => void
  startMonth: string
  setStartMonth: (v: string) => void
  apiClasses: ClassOption[]
  onSubmit: (e: React.FormEvent) => void
  isSaving?: boolean
}

export function StudentFormDialog({
  open,
  onOpenChange,
  editingId,
  firstName,
  setFirstName,
  lastName,
  setLastName,
  password,
  setPassword,
  email,
  setEmail,
  phone,
  setPhone,
  selectedClassIds,
  setSelectedClassIds,
  monthlyFee,
  setMonthlyFee,
  startMonth,
  setStartMonth,
  apiClasses,
  onSubmit,
  isSaving = false,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[min(90vh,720px)] overflow-y-auto rounded-2xl sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{editingId != null ? "Tələbəni redaktə et" : "Tələbə əlavə et"}</DialogTitle>
          <DialogDescription>
            {editingId != null
              ? "Dəyişikliklər birbaşa qeydiyyatda saxlanılacaq."
              : "Yeni tələbə üçün məlumatları doldurun və sinifləri seçin."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="s-fname">Ad</Label>
              <Input
                id="s-fname"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="John"
                required
                disabled={isSaving}
                autoComplete="given-name"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="s-lname">Soyad</Label>
              <Input
                id="s-lname"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Doe"
                required
                disabled={isSaving}
                autoComplete="family-name"
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label>Siniflər (ən azı birini seçin)</Label>
            <div className="max-h-40 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain rounded-md border border-input bg-background [scrollbar-gutter:stable]">
              <div className="p-3 flex flex-col gap-2">
                {apiClasses.map((cls) => (
                  <label key={cls.id} className="flex items-start gap-3 cursor-pointer min-w-0">
                    <Checkbox
                      disabled={isSaving}
                      className="mt-0.5 shrink-0"
                      checked={selectedClassIds.includes(cls.id)}
                      onCheckedChange={(checked) => {
                        if (checked) setSelectedClassIds((prev) => [...prev, cls.id])
                        else setSelectedClassIds((prev) => prev.filter((id) => id !== cls.id))
                      }}
                    />
                    <span className="text-sm break-words min-w-0">{cls.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="s-fee">Aylıq ödəniş</Label>
              <Input
                id="s-fee"
                type="number"
                min="0"
                step="0.01"
                value={monthlyFee}
                onChange={(e) => setMonthlyFee(e.target.value)}
                disabled={isSaving}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="s-start">Başlama ayı</Label>
              <Input id="s-start" type="date" value={startMonth} onChange={(e) => setStartMonth(e.target.value)} disabled={isSaving} />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="s-email">E-poçt</Label>
            <Input
              id="s-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@example.com"
              disabled={isSaving}
            />
            <p className="text-xs text-muted-foreground">
              {editingId != null
                ? "Boş buraxsanız, əvvəlki e-poçt saxlanılır."
                : "Yeni tələbə üçün e-poçt və ya telefondan ən azı biri mütləqdir."}
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="s-phone">Telefon</Label>
            <Input
              id="s-phone"
              type="tel"
              autoComplete="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+994501234567"
              disabled={isSaving}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="s-password">{editingId != null ? "Yeni parol (istəyə bağlı)" : "Parol"}</Label>
            <Input
              id="s-password"
              type="password"
              autoComplete={editingId != null ? "new-password" : "new-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={"SecurePassword123!"}
              disabled={isSaving}
              required={editingId == null}
            />
            <p className="text-xs text-muted-foreground">
              {editingId != null ? "Yalnız parolu dəyişmək istəyirsinizsə daxil edin." : "Yeni tələbə üçün giriş parolu."}
            </p>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
              Ləğv et
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saxlanılır...
                </span>
              ) : editingId != null ? (
                "Dəyişiklikləri saxla"
              ) : (
                "Tələbə əlavə et"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
