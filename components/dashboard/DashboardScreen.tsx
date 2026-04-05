"use client"

import { useDashboardData } from "@/hooks/useDashboardData"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton"
import {
  ArrowRight,
  Banknote,
  BookOpen,
  CalendarDays,
  GraduationCap,
  LayoutDashboard,
  Loader2,
  Receipt,
  RefreshCw,
  TrendingUp,
  UserCheck,
  Users,
  Wallet,
} from "lucide-react"
import Link from "next/link"
import type { ComponentType } from "react"
import { cn } from "@/lib/utils"

function formatAzn(n: number) {
  return `${n.toLocaleString("az-AZ", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₼`
}

function monthLabel(monthKey: string) {
  const [y, m] = monthKey.split("-").map(Number)
  if (!y || !m) return monthKey
  try {
    return new Intl.DateTimeFormat("az-AZ", { month: "long", year: "numeric" }).format(new Date(y, m - 1, 1))
  } catch {
    return monthKey
  }
}

export function DashboardScreen() {
  const {
    monthKey,
    setMonthKey,
    loading,
    refreshing,
    teachersCount,
    classesCount,
    totalClassStudents,
    studentsCount,
    snapshot,
    reload,
  } = useDashboardData()

  if (loading) {
    return <DashboardSkeleton />
  }

  const { month, outstandingStudents, allTimeOutstanding, allTimeOverdueAmount, overdueInvoiceCount, totalEnrollments } =
    snapshot

  return (
    <div className="flex flex-col gap-8 min-w-0 max-w-full overflow-x-hidden">
      <div className="relative rounded-3xl bg-gradient-to-r from-primary/12 via-primary/5 to-transparent border border-primary/20 p-6 sm:p-8 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10 pointer-events-none" />
        <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-primary mb-1">
              <span className="text-sm font-semibold uppercase tracking-wide opacity-90">Statistika</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground text-balance">
              İdarəetmə paneli
            </h1>
            <p className="mt-2 text-base text-muted-foreground max-w-2xl">
              Kurs üzrə ümumi göstəricilər, cari ay üzrə faktura və ödəniş vəziyyəti, qalıq borcu olan tələbələr.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            className="shrink-0 gap-2 border-primary/25 bg-card/80 hover:bg-accent/50"
            onClick={() => void reload()}
            disabled={refreshing}
          >
            {refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Yenilə
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3">
        <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground shrink-0">
          <span className="flex items-center gap-2 text-muted-foreground font-normal">
            <CalendarDays className="h-4 w-4" />
            Hesabat ayı
          </span>
          <input
            type="month"
            value={monthKey}
            onChange={(e) => setMonthKey(e.target.value)}
            className={cn(
              "h-10 rounded-lg border border-border bg-card px-3 text-sm shadow-sm",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            )}
          />
        </label>
        <p className="text-sm text-muted-foreground sm:ml-auto sm:pt-6">
          Seçilmiş ay: <span className="font-medium text-foreground">{monthLabel(monthKey)}</span>
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Wallet}
          label="Cari ay — gözlənilən"
          value={formatAzn(month.expectedTotal)}
          sub="Ləğv edilməyən fakturalar"
          accent="from-emerald-500/15 to-emerald-500/5"
          iconClass="text-emerald-600 dark:text-emerald-400"
        />
        <StatCard
          icon={Banknote}
          label="Cari ay — alınmış"
          value={formatAzn(month.collectedTotal)}
          sub={`${month.paidCount} faktura ödənilib`}
          accent="from-sky-500/15 to-sky-500/5"
          iconClass="text-sky-600 dark:text-sky-400"
        />
        <StatCard
          icon={Receipt}
          label="Cari ay — qalıq"
          value={formatAzn(month.remainingTotal)}
          sub={`${month.unpaidCount} ödənilməmiş faktura`}
          accent="from-amber-500/15 to-amber-500/5"
          iconClass="text-amber-600 dark:text-amber-400"
        />
        <StatCard
          icon={TrendingUp}
          label="Toplama faizi"
          value={`${month.collectionRatePercent.toLocaleString("az-AZ")} %`}
          sub={month.expectedTotal > 0 ? "Gözlənilənə nisbətən" : "Bu ay üçün faktura yoxdur"}
          accent="from-violet-500/15 to-violet-500/5"
          iconClass="text-violet-600 dark:text-violet-400"
        />
      </div>

      <Card className="rounded-2xl border-border/60 bg-card/40 backdrop-blur-sm overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Ödəniş irəliləyişi (cari ay)</CardTitle>
          <CardDescription>
            Gözlənilən məbləğə nisbətən nə qədərinin ödənildiyini göstərir.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Progress value={Math.min(100, month.collectionRatePercent)} className="h-3" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0 ₼</span>
            <span className="font-medium text-foreground">{formatAzn(month.expectedTotal)} gözlənilən</span>
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-lg font-semibold text-foreground mb-3">Ümumi göstəricilər</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MiniStat
            icon={UserCheck}
            label="Müəllimlər"
            value={String(teachersCount)}
            hint="Aktiv siyahı"
          />
          <MiniStat icon={Users} label="Tələbələr" value={String(studentsCount)} hint="Qeydiyyatda" />
          <MiniStat icon={BookOpen} label="Siniflər" value={String(classesCount)} hint="Ümumi sinif" />
          <MiniStat
            icon={GraduationCap}
            label="Sinif qeydiyyatları"
            value={String(totalEnrollments)}
            hint="Tələbə–sinif əlaqəsi"
          />
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Siniflərdəki şagird sayı (cəmi):{" "}
          <span className="font-medium text-foreground">{totalClassStudents}</span>         
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-2xl border-border/60">
          <CardHeader>
            <CardTitle className="text-base">Bütün dövr — borc vəziyyəti</CardTitle>
            <CardDescription>Ödənilməmiş və gecikmiş fakturalar (bütün aylar).</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between gap-4 rounded-xl border border-border/50 bg-muted/30 px-4 py-3">
              <span className="text-sm text-muted-foreground">Ümumi qalıq (ödənilməmiş)</span>
              <span className="text-lg font-semibold tabular-nums">{formatAzn(allTimeOutstanding)}</span>
            </div>
            <div className="flex items-center justify-between gap-4 rounded-xl border border-border/50 bg-muted/30 px-4 py-3">
              <span className="text-sm text-muted-foreground">Gecikmiş məbləğ</span>
              <span className="text-lg font-semibold tabular-nums text-destructive">{formatAzn(allTimeOverdueAmount)}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Gecikmiş faktura sayı: <span className="font-medium text-foreground">{overdueInvoiceCount}</span>
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/60">
          <CardHeader>
            <CardTitle className="text-base">Qeydiyyat sıxlığı</CardTitle>
            <CardDescription>Ortalama tələbə başına sinif sayı.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl border border-dashed border-primary/25 bg-primary/5 px-4 py-6 text-center">
              <p className="text-3xl font-bold text-primary tabular-nums">
                {studentsCount > 0 ? (totalEnrollments / studentsCount).toLocaleString("az-AZ", { maximumFractionDigits: 1 }) : "—"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">sinif / tələbə (orta)</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl border-border/60 overflow-hidden">
        <CardHeader>
          <CardTitle className="text-base">Cari ay — qalıq borcu olan tələbələr</CardTitle>
          <CardDescription>
            Seçilmiş ay üçün ödənilməmiş və ya gecikmiş fakturası olanlar. Faktura səhifəsinə keçid üçün sətri seçin.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0 sm:px-6 pb-6">
          {outstandingStudents.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-muted-foreground border-t border-border/50">
              Bu ay üçün qalıq borc yoxdur və ya hələ faktura yaradılmayıb.
            </div>
          ) : (
            <div className="rounded-xl border border-border/50 overflow-x-auto mx-4 sm:mx-0">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Tələbə</TableHead>
                    <TableHead className="text-right">Qalıq</TableHead>
                    <TableHead className="text-right hidden sm:table-cell">Faktura sayı</TableHead>
                    <TableHead className="w-[100px] text-right">
                      <span className="sr-only">Keçid</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {outstandingStudents.map((row) => (
                    <TableRow key={row.studentId}>
                      <TableCell className="font-medium">{row.studentName}</TableCell>
                      <TableCell className="text-right tabular-nums text-amber-700 dark:text-amber-400 font-semibold">
                        {formatAzn(row.remainingAmount)}
                      </TableCell>
                      <TableCell className="text-right hidden sm:table-cell">
                        <Badge variant="secondary" className="font-normal">
                          {row.unpaidInvoices}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="gap-1" asChild>
                          <Link href={`/billing?studentId=${row.studentId}`}>
                            Faktura
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function StatCard(props: {
  icon: ComponentType<{ className?: string }>
  label: string
  value: string
  sub: string
  accent: string
  iconClass: string
}) {
  const Icon = props.icon
  return (
    <Card
      className={cn(
        "rounded-2xl border-border/50 bg-gradient-to-br shadow-sm overflow-hidden",
        props.accent,
      )}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-medium text-muted-foreground">{props.label}</p>
            <p className="mt-2 text-xl sm:text-2xl font-bold tracking-tight text-foreground tabular-nums break-all">
              {props.value}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{props.sub}</p>
          </div>
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-background/80 border border-border/40 shadow-inner">
            <Icon className={cn("h-5 w-5", props.iconClass)} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function MiniStat(props: {
  icon: ComponentType<{ className?: string }>
  label: string
  value: string
  hint: string
}) {
  const Icon = props.icon
  return (
    <Card className="rounded-2xl border-border/60 bg-card/60">
      <CardContent className="p-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">{props.label}</p>
          <p className="text-xl font-bold tabular-nums">{props.value}</p>
          <p className="text-[11px] text-muted-foreground truncate">{props.hint}</p>
        </div>
      </CardContent>
    </Card>
  )
}
