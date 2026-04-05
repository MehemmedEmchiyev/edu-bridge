"use client"

import { Skeleton } from "@/components/ui/skeleton"

export function BillingPickerSkeleton() {
  return (
    <div className="flex flex-col sm:flex-row gap-4 max-w-2xl">
      <div className="flex flex-col gap-2 flex-1">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-10 w-full rounded-md" />
      </div>
      <div className="flex flex-col gap-2 flex-1">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-10 w-full rounded-md" />
      </div>
    </div>
  )
}
