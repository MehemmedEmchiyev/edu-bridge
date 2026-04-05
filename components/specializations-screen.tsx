"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import service, { type CourseSpecialization } from "@/lib/api"
import { Loader2, Pencil, Plus, Tags, Trash2 } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"

export function SpecializationsScreen() {
  const [rows, setRows] = useState<CourseSpecialization[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<CourseSpecialization | null>(null)
  const [name, setName] = useState("")
  const [saving, setSaving] = useState(false)
  const [toDelete, setToDelete] = useState<CourseSpecialization | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await service.getSpecializations()
      setRows((res.data as CourseSpecialization[]) ?? [])
    } catch {
      setRows([])
      toast.error("İxtisaslar yüklənmədi")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const openCreate = () => {
    setEditing(null)
    setName("")
    setDialogOpen(true)
  }

  const openEdit = (r: CourseSpecialization) => {
    setEditing(r)
    setName(r.name)
    setDialogOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) {
      toast.error("Ad daxil edin")
      return
    }
    setSaving(true)
    try {
      if (editing) {
        await service.updateSpecialization(editing.id, { name: trimmed })
        toast.success("İxtisas yeniləndi")
      } else {
        await service.createSpecialization({ name: trimmed })
        toast.success("İxtisas əlavə olundu")
      }
      setDialogOpen(false)
      await load()
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string | string[] } } }).response?.data?.message
          : undefined
      const text = Array.isArray(msg) ? msg.join(", ") : msg || "Əməliyyat alınmadı"
      toast.error(text)
    } finally {
      setSaving(false)
    }
  }

  const confirmDelete = async () => {
    if (!toDelete) return
    setDeleteLoading(true)
    try {
      await service.deleteSpecialization(toDelete.id)
      toast.success("İxtisas silindi")
      setToDelete(null)
      await load()
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string | string[] } } }).response?.data?.message
          : undefined
      const text = Array.isArray(msg) ? msg.join(", ") : msg || "Silinmə alınmadı"
      toast.error(text)
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-8 min-w-0">
      <div className="relative rounded-3xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 p-8 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">İxtisaslar</h1>
            </div>
            <p className="mt-2 text-sm text-muted-foreground max-w-xl">
              Öz kursunuz üçün müəllim ixtisaslarını (sahələri) idarə edin. Müəllim əlavə edərkən bu siyahıdan seçim
              göstərilir.
            </p>
          </div>
          <Button onClick={openCreate} className="gap-2 h-11 shrink-0">
            <Plus className="h-4 w-4" />
            İxtisas əlavə edin
          </Button>
        </div>
      </div>

      <Card className="rounded-2xl border overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-20 text-muted-foreground gap-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              Yüklənir...
            </div>
          ) : rows.length === 0 ? (
            <div className="py-16 text-center px-4">
              <p className="text-muted-foreground">Hələ ixtisas yoxdur — əlavə edin və ya müəllim formunda siyahı boş ola bilər.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ad</TableHead>
                    <TableHead className="w-[120px] text-right">Əməliyyatlar</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium text-foreground">{r.name}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(r)}>
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Redaktə</span>
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => setToDelete(r)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Sil</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <form onSubmit={handleSave}>
            <DialogHeader>
              <DialogTitle>{editing ? "İxtisası redaktə edin" : "Yeni ixtisas"}</DialogTitle>
              <DialogDescription>
                Müəllimlər formunda göstəriləcək ad (məs. Riyaziyyat, İngilis dili).
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Label htmlFor="spec-name">Ad</Label>
              <Input
                id="spec-name"
                className="mt-1.5"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Məs. Riyaziyyat"
                disabled={saving}
                autoFocus
              />
            </div>
            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>
                Ləğv et
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : editing ? "Yadda saxla" : "Əlavə et"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={toDelete != null} onOpenChange={(open) => !open && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>İxtisası silmək?</AlertDialogTitle>
            <AlertDialogDescription>
              «{toDelete?.name}» silinəcək. Müəllimlərdə əvvəl seçilmiş ixtisas mətni profildə qala bilər; yeni seçimlər üçün
              siyahını yeniləyin.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteLoading}>Ləğv et</AlertDialogCancel>
            <Button variant="destructive" disabled={deleteLoading} onClick={() => void confirmDelete()}>
              {deleteLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sil"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
