"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function TeachersGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 animate-in fade-in duration-300">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="rounded-2xl border-border/50 overflow-hidden">
          <CardContent className="p-6 flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <Skeleton className="h-14 w-14 rounded-full shrink-0" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-5 w-[200px] max-w-full" />
                <Skeleton className="h-3 w-[120px] max-w-full" />
              </div>
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <div className="flex gap-2 pt-2">
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
