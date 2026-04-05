"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export function TeachersTableSkeleton() {
  return (
    <div className="rounded-xl border bg-card overflow-hidden animate-in fade-in duration-300">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Şəkil</TableHead>
            <TableHead>Ad</TableHead>
            <TableHead>E-poçt</TableHead>
            <TableHead>Telefon</TableHead>
            <TableHead>İxtisas</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 8 }).map((_, i) => (
            <TableRow key={i}>
              <TableCell>
                <Skeleton className="h-10 w-10 rounded-full" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-[140px]" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-[180px]" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-[120px]" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-[100px]" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
