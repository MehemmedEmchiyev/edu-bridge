"use client"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Loader2, Plus } from "lucide-react"

type Props = {
  onAdd: () => void
  /** undefined = yüklənir */
  totalCount?: number
  refreshing?: boolean
}

export function StudentsHero({ onAdd, totalCount, refreshing }: Props) {
  return (
    <div className="relative rounded-3xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 p-8 overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10" />
      <div className="flex items-center justify-between relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-foreground text-balance">Tələbələr</h1>
            {refreshing && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" aria-hidden />}
          </div>
          {totalCount === undefined ? (
            <Skeleton className="mt-2 h-4 w-36" />
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">{totalCount} tələbə siyahıda</p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <Button onClick={onAdd} className="gap-2 h-11 px-6 bg-gradient-to-r from-primary to-primary/90 shadow-lg">
            <Plus className="h-4 w-4" />
            Tələbə əlavə edin
          </Button>
        </div>
      </div>
    </div>
  )
}
