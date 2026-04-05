"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

function TableRowSkeleton() {
  return (
    <div className="flex items-center gap-4 border-b border-border/60 py-4 last:border-0">
      <Skeleton className="h-5 flex-1 max-w-[180px]" />
      <Skeleton className="h-5 flex-1 max-w-[140px] hidden sm:block" />
      <Skeleton className="h-5 flex-1 max-w-[120px] hidden md:block" />
      <Skeleton className="h-5 flex-1 max-w-[160px] hidden lg:block" />
      <Skeleton className="h-8 w-8 rounded-md shrink-0" />
    </div>
  )
}

export function StudentsPageSkeleton() {
  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-300">
      <div className="relative rounded-3xl border border-primary/20 p-8 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-9 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-11 w-40" />
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-10 w-40" />
      </div>
      <Card className="rounded-xl border overflow-hidden">
        <CardContent className="p-0 px-6">
          <div className="flex items-center gap-4 border-b py-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-24 hidden sm:block" />
            <Skeleton className="h-4 w-24 hidden md:block" />
            <Skeleton className="h-4 w-24 hidden lg:block" />
            <Skeleton className="h-4 w-8 ml-auto" />
          </div>
          {Array.from({ length: 6 }).map((_, i) => (
            <TableRowSkeleton key={i} />
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
