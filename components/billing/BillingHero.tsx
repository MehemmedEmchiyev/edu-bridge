"use client"

export function BillingHero() {
  return (
    <div className="relative rounded-3xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 p-8 overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10" />
      <div className="relative z-10">
        <h1 className="text-3xl font-bold tracking-tight text-foreground text-balance">Faktura və ödənişlər</h1>
        <p className="mt-2 text-base text-muted-foreground max-w-xl">
          Tələbə seçin, fakturaları görün, statusu yeniləyin və ya tam ödənişi qeyd edin.
        </p>
      </div>
    </div>
  )
}
